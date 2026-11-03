// Image Translation Panel - the "images" tab: translate a PHOTO into a form ✨
// Left = your photo (drop / choose / paste), right = target form + "translate photo" button + result
// This is like a small photo_translator.py page in Python: upload -> call API -> show the new picture

import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';
import Image from 'next/image';
import DropdownSelector from './DropdownSelector';
import { translateImage, APIError, friendlyErrorMessage } from '@/services/api';
import { useCyclingLoadingMessage } from '@/hooks/useCyclingLoadingMessage';
import { LANGUAGE_DISPLAY, IMAGE_UPLOAD } from '@/constants';
import { prepareImageForUpload, validateImageFile, base64ToBlob, slugify, ImagePrepError } from '@/utils/imageResize';
import type { CustomFormState, FormOption, ImageTranslationResponse } from '@/types';

interface ImageTranslationPanelProps {
  isActive: boolean; // is the images tab showing? (we only listen for ctrl/cmd+v then)
  formOptions: Record<string, string>;
  formOptionsWithCategories: FormOption[];
  formGroups: string[];
  isLoadingForms: boolean;
}

// The photo the user picked, already shrunk and ready to upload
interface SelectedPhoto {
  blob: Blob;
  previewUrl: string; // a temporary "blob:" url so we can show it
  width: number;
  height: number;
}

// The picture we got back from the backend
interface PhotoResult {
  data: ImageTranslationResponse;
  url: string; // a temporary "blob:" url for showing + downloading it
}

// Playful messages while we wait (generation takes 10-40 seconds)
const IMAGE_LOADING_MESSAGES = [
  "mixing the paints 🎨",
  "dressing your photo in new ontological clothes 👗",
  "this usually takes 10-40 seconds, hang in there 🥹",
  "squinting at it very philosophically 🧐",
  "dooby kooby dooo mee loo..",
  "almost there (probably) 🌱",
];

// Same panel look as the text translator (Google Translate style)
const panelClassName = "lg:border lg:border-gray-200 lg:rounded-lg bg-white lg:flex lg:flex-col";
const headerClassName = "px-4 py-3 bg-white lg:bg-gray-50 lg:border-b lg:border-gray-100 relative overflow-visible";
const contentClassName = "px-4 py-4 lg:flex-1 lg:flex lg:flex-col";

// Replace the temporary url stored in a ref (and free the old one so we don't leak memory)
// This is like closing an old file handle before opening a new one in Python
function swapObjectUrl(ref: RefObject<string | null>, nextUrl: string | null) {
  if (ref.current) {
    URL.revokeObjectURL(ref.current);
  }
  ref.current = nextUrl;
}

// 75 -> "about 2 minutes"
function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `about ${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.ceil(minutes / 60);
  return `about ${hours} hour${hours === 1 ? '' : 's'}`;
}

// Turn any error into something readable, but keep the real reason in it
function describePhotoError(err: unknown): string {
  if (err instanceof APIError && err.status === 429) {
    // The backend limits how many photos people can make (each one costs money)
    const reason = err.message.trim();
    const wait = err.retryAfterSeconds ? `try again in ${formatWait(err.retryAfterSeconds)}` : 'try again a bit later';
    // The backend message usually already says when to come back - then we don't repeat it
    const saysWhen = /try again|come back|tomorrow|later/i.test(reason);
    const message = !reason
      ? `${wait} 🌱`
      : saysWhen ? reason : `${reason.replace(/[.\s]+$/, '')}. ${wait} 🌱`;
    // "slow down" only fits the per-person limit (it's per hour, so the wait is at most an hour).
    // The site-wide daily limit is not the visitor's fault, so no "slow down" there
    const isPersonalLimit = !err.retryAfterSeconds || err.retryAfterSeconds <= 3600;
    return isPersonalLimit ? `slow down a little 🐢 ${message}` : message;
  }
  return friendlyErrorMessage('photo translation failed', err);
}

export default function ImageTranslationPanel({
  isActive,
  formOptions,
  formOptionsWithCategories,
  formGroups,
  isLoadingForms,
}: ImageTranslationPanelProps) {
  // Photo state
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Target form state ('' = use the first form from the sheet)
  const [targetForm, setTargetForm] = useState('');
  const [targetCustomForm, setTargetCustomForm] = useState<CustomFormState>({ isCustom: false, customText: '' });

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  // Every request gets a number; if a newer photo was picked meanwhile we ignore the old answer
  const requestIdRef = useRef(0);

  const loadingMessage = useCyclingLoadingMessage({
    isActive: isTranslating,
    messages: IMAGE_LOADING_MESSAGES,
    intervalMs: 3500,
  });

  // Default target = first form in the sheet (same as the text translator)
  const selectedTarget = targetForm || formOptionsWithCategories[0]?.key || '';
  const actualTargetForm = selectedTarget === LANGUAGE_DISPLAY.CUSTOM_KEY
    ? targetCustomForm.customText.trim()
    : selectedTarget;

  // Read, check and shrink a photo the user dropped / chose / pasted
  const handleFile = useCallback(async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }

    setPhotoError(null);
    setError(null);
    setIsPreparingPhoto(true);
    try {
      const prepared = await prepareImageForUpload(file);
      const previewUrl = URL.createObjectURL(prepared.blob);
      swapObjectUrl(previewUrlRef, previewUrl);
      setPhoto({ ...prepared, previewUrl });

      // A new photo means the old result (or a request still running) no longer matches
      requestIdRef.current += 1;
      setIsTranslating(false);
      swapObjectUrl(resultUrlRef, null);
      setResult(null);
    } catch (err) {
      console.error('Failed to prepare photo:', err);
      setPhotoError(err instanceof ImagePrepError ? err.message : "i couldn't read that photo 🙈 please try another one");
    } finally {
      setIsPreparingPhoto(false);
    }
  }, []);

  // Paste a photo from the clipboard (ctrl/cmd + v) - only while the images tab is showing
  useEffect(() => {
    if (!isActive) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            handleFile(file);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isActive, handleFile]);

  // Free the temporary urls when this component goes away
  useEffect(() => {
    return () => {
      swapObjectUrl(previewUrlRef, null);
      swapObjectUrl(resultUrlRef, null);
    };
  }, []);

  const openFilePicker = () => {
    if (!isPreparingPhoto) {
      fileInputRef.current?.click();
    }
  };

  const removePhoto = () => {
    requestIdRef.current += 1; // ignore any answer that is still on its way
    setIsTranslating(false);
    swapObjectUrl(previewUrlRef, null);
    swapObjectUrl(resultUrlRef, null);
    setPhoto(null);
    setResult(null);
    setError(null);
    setPhotoError(null);
  };

  // The big button: send the photo to the backend (explicit click, because each photo costs money)
  const handleTranslatePhoto = async () => {
    if (!photo || isTranslating) return;
    if (!actualTargetForm) {
      setError('pick a form first 🌱');
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsTranslating(true);
    setError(null);
    swapObjectUrl(resultUrlRef, null);
    setResult(null);

    try {
      const response = await translateImage({
        image: photo.blob,
        fileName: 'photo.jpg',
        targetForm: actualTargetForm,
      });
      if (requestId !== requestIdRef.current) return; // a newer photo was chosen meanwhile

      if (!response || !response.imageBase64) {
        throw new Error('the server answered without an image');
      }
      const url = URL.createObjectURL(base64ToBlob(response.imageBase64, response.mimeType));
      swapObjectUrl(resultUrlRef, url);
      setResult({ data: response, url });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Photo translation error:', err);
      setError(describePhotoError(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsTranslating(false);
      }
    }
  };

  const canTranslate = !!photo && !!actualTargetForm && !isTranslating && !isPreparingPhoto && !isLoadingForms;
  const resultTargetName = result?.data.targetForm || actualTargetForm;

  // Rough size of the generated picture, so the page doesn't jump while it loads
  const resultWidth = photo && photo.width > photo.height ? 1536 : 1024;
  const resultHeight = photo && photo.height > photo.width ? 1536 : 1024;

  // Shared props for both target selectors (mobile + desktop)
  const selectorProps = {
    value: selectedTarget,
    onChange: setTargetForm,
    options: formOptions,
    optionsWithCategories: formOptionsWithCategories,
    groups: formGroups,
    isLoading: isLoadingForms,
    disabled: isLoadingForms || isTranslating,
    isSourceSelector: false, // no "detect form" here
    customForm: targetCustomForm,
    onCustomFormChange: setTargetCustomForm,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-6 lg:items-stretch">
      {/* ---------- Left: your photo ---------- */}
      <div className={panelClassName}>
        <div className={headerClassName}>
          <span className="inline-block py-2 text-sm font-medium text-blue-600">
            <span className="border-b-2 border-blue-600 pb-1">your photo</span>
          </span>
        </div>

        <div className={contentClassName}>
          {/* Hidden file input - opened by the drop zone / "change photo" */}
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_UPLOAD.ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = ''; // so choosing the same file again still triggers onChange
            }}
          />

          {photo ? (
            <div className="lg:flex-1 flex flex-col">
              <div className="rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                <Image
                  src={photo.previewUrl}
                  alt="your photo"
                  width={photo.width}
                  height={photo.height}
                  unoptimized
                  className="w-full h-auto max-h-[28rem] object-contain"
                />
              </div>
              <div className="flex items-center justify-between pt-3 gap-3">
                <span className="text-xs text-gray-400">
                  {photo.width}×{photo.height}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={isPreparingPhoto}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    change photo
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Drop zone - click, drag & drop, or paste
            <div
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openFilePicker();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`
                lg:flex-1 min-h-[16rem] rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors
                flex flex-col items-center justify-center text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}
              `}
            >
              {isPreparingPhoto ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span>getting your photo ready...</span>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 text-gray-400 mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                  </svg>
                  <p className="text-gray-600">drop a photo here</p>
                  <p className="hidden lg:block text-sm text-gray-400 mt-1">or paste one (ctrl/cmd + v)</p>
                  <span className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-gray-300 rounded-lg bg-white">
                    choose a photo
                  </span>
                  <p className="text-xs text-gray-400 mt-3">jpeg, png or webp · up to 10 MB</p>
                </>
              )}
            </div>
          )}

          {photoError && (
            <p className="text-sm text-red-600 mt-3 break-words">{photoError}</p>
          )}

          <p className="text-xs text-gray-400 mt-3 lowercase">
            photos are sent to openai to be redrawn. they are not saved and don&apos;t appear in the public history.
          </p>
        </div>
      </div>

      {/* ---------- Right: target form + result ---------- */}
      <div className={panelClassName}>
        <div className={headerClassName}>
          {/* Mobile and desktop need different selector styles */}
          <div className="lg:hidden">
            <DropdownSelector {...selectorProps} mobileOnly={true} />
          </div>
          <div className="hidden lg:block">
            <DropdownSelector {...selectorProps} dropdownAlign="right" />
          </div>
        </div>

        <div className={contentClassName}>
          {/* The button - an explicit click, because every photo costs real money */}
          <div className="flex flex-wrap items-center gap-3 pb-4">
            <button
              type="button"
              onClick={handleTranslatePhoto}
              disabled={!canTranslate}
              className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isTranslating ? 'translating...' : result ? 'translate again ✨' : 'translate photo ✨'}
            </button>
            {!photo && !isPreparingPhoto && (
              <span className="text-sm text-gray-400">add a photo first 📷</span>
            )}
            {photo && selectedTarget === LANGUAGE_DISPLAY.CUSTOM_KEY && !actualTargetForm && (
              <span className="text-sm text-gray-400">type your custom form first 🪄</span>
            )}
          </div>

          {/* Result area */}
          <div className="lg:flex-1">
            {isTranslating ? (
              <div className="min-h-[16rem] rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 mt-3">{loadingMessage}</p>
              </div>
            ) : error ? (
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="min-w-0 flex-1">
                  <span className="text-red-600 font-medium">Error:</span>
                  <p className="text-red-600 mt-1 break-words">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Clear error
                  </button>
                </div>
              </div>
            ) : result ? (
              <figure>
                <div className="rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                  <Image
                    src={result.url}
                    alt={`your photo translated into ${resultTargetName}`}
                    width={resultWidth}
                    height={resultHeight}
                    unoptimized
                    className="w-full h-auto max-h-[36rem] object-contain"
                  />
                </div>
                {result.data.caption && (
                  <figcaption className="mt-3 italic text-gray-600 leading-relaxed break-words">
                    {result.data.caption}
                  </figcaption>
                )}
                <div className="flex items-center justify-between pt-3 gap-3">
                  <span className="text-xs text-gray-400 truncate">{resultTargetName}</span>
                  <a
                    href={result.url}
                    download={`form-translator-${slugify(resultTargetName)}.jpg`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    download ↓
                  </a>
                </div>
              </figure>
            ) : (
              <div className="min-h-[16rem] rounded-lg bg-gray-50 flex items-center justify-center text-center p-6">
                <span className="text-gray-400">translated photo</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-3 lowercase">
            takes 10-40 seconds. there&apos;s a small hourly limit, because every photo costs real money 🌱
          </p>
        </div>
      </div>
    </div>
  );
}

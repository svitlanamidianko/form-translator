// Translation Panel Component - Reusable panel for input and output
// This follows the DRY principle - Don't Repeat Yourself

import { useRef, useEffect } from 'react';
import DropdownSelector from './DropdownSelector';
import { useClipboard } from '@/hooks/useClipboard';
import { UI_CONSTANTS } from '@/constants';
import type { CustomFormState, FormOption } from '@/types';

interface TranslationPanelProps {
  type: 'input' | 'output';
  value: string;
  onChange?: (value: string) => void;
  selectedForm: string;
  onFormChange: (form: string) => void;
  formOptions: Record<string, string>;
  formOptionsWithCategories?: FormOption[];
  isLoadingForms: boolean;
  isTranslating?: boolean;
  error?: string | null;
  onClearError?: () => void;
  placeholder?: string;
  maxLength?: number;
  customForm?: CustomFormState;
  onCustomFormChange?: (customForm: CustomFormState) => void;
  detectedForm?: string | null;
  isDetectingForm?: boolean;
  detectionReasoning?: string | null;
}

export default function TranslationPanel({
  type,
  value,
  onChange,
  selectedForm,
  onFormChange,
  formOptions,
  formOptionsWithCategories,
  isLoadingForms,
  isTranslating = false,
  error = null,
  onClearError,
  placeholder = "",
  maxLength = UI_CONSTANTS.MAX_TEXT_LENGTH,
  customForm = { isCustom: false, customText: '' },
  onCustomFormChange,
  detectedForm = null,
  isDetectingForm = false,
  detectionReasoning = null,
}: TranslationPanelProps) {
  const isInput = type === 'input';

  // Use our reusable clipboard hook
  const { copyToClipboard, showCopiedMessage } = useClipboard();
  
  // Ref for textarea auto-resize
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 128)}px`; // min-height equivalent
    }
  };

  // Auto-resize on value change
  useEffect(() => {
    if (isInput) {
      adjustTextareaHeight();
    }
  }, [value, isInput]);

  // Copy functionality using our reusable hook
  const handleCopy = () => {
    if (value && value.trim()) {
      copyToClipboard(value);
    }
  };

  // Google Translate style - no borders on mobile - identical for both panels
  const panelClassName = "lg:border lg:border-gray-200 lg:rounded-lg bg-white lg:flex lg:flex-col";
  const headerClassName = "px-4 py-3 bg-white lg:bg-gray-50 lg:border-b lg:border-gray-100 relative overflow-visible";
  const contentClassName = "px-4 py-0 lg:p-4 lg:flex-1 lg:flex lg:flex-col overflow-hidden";

  const renderContent = () => {
    if (isInput) {
      return (
        <div className="w-full">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange?.(e.target.value);
              setTimeout(adjustTextareaHeight, 0); // Adjust height after state update
            }}
            placeholder={placeholder}
            className="w-full min-h-32 lg:min-h-48 resize-none border-none outline-none leading-relaxed bg-transparent py-4 font-inter text-xl overflow-hidden"
            style={{ color: '#202124' }}
            maxLength={maxLength}
          />
          
        </div>
      );
    }

    // Output content - identical structure to input
    return (
      <div className="w-full min-h-32 lg:min-h-48 resize-none border-none outline-none leading-relaxed bg-transparent py-4 font-inter text-xl" style={{ color: '#202124' }}>
        {isTranslating ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-gray-500">translating...</span>
          </div>
        ) : error ? (
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="text-red-600 font-medium">Error:</span>
              <p className="text-red-600 mt-1">{error}</p>
              {onClearError && (
                <button 
                  onClick={onClearError}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  Clear error
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {value || <span className="text-gray-400">translation</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={panelClassName}>
      {/* Header with language selector */}
      <div className={`${headerClassName} flex items-center space-x-2`}>
        <DropdownSelector
          value={selectedForm}
          onChange={onFormChange}
          options={formOptions}
          optionsWithCategories={formOptionsWithCategories}
          isLoading={isLoadingForms}
          disabled={isLoadingForms}
          isSourceSelector={type === 'input'}
          dropdownAlign={type === 'output' ? 'right' : 'left'}
          customForm={customForm}
          onCustomFormChange={onCustomFormChange}
          isDetectingForm={isDetectingForm}
          detectedForm={detectedForm}
        />
      </div>

      {/* Content area */}
      <div className={contentClassName}>
        <div className="lg:flex-1">
          {renderContent()}
        </div>
        
        {/* Footer - identical positioning for both panels */}
        <div className="flex items-center justify-between pt-3 lg:mt-4 lg:pt-2 lg:mt-auto">
          <div className="flex items-center space-x-3">
            
            {/* Copy button for both input and output */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCopy}
                className="py-2 pr-2 pl-0 rounded-full hover:bg-gray-100 transition-colors"
                disabled={!value || !value.trim()}
                title="Copy to clipboard"
              >
                <svg className={`w-5 h-5 ${!value || !value.trim() ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* Copy feedback message */}
              {showCopiedMessage && (
                <span className="text-sm text-gray-600 font-medium transition-opacity duration-300">
                  copied to clipboard
                </span>
              )}
            </div>
          </div>
          
          <span className="text-sm text-gray-400 lg:text-xs">
            {isInput ? `${value.length} / ${maxLength}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

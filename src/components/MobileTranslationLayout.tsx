// Mobile Translation Layout Component
// Extracted from page.tsx for better separation of concerns

import { useClipboard } from '@/hooks/useClipboard';
import DropdownSelector from './DropdownSelector';
import { UI_CONSTANTS } from '@/constants';
import type { CustomFormState, FormOption } from '@/types';

interface MobileTranslationLayoutProps {
  // Source/Input props
  sourceForm: string;
  setSourceForm: (form: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  
  // Target/Output props
  targetForm: string;
  setTargetForm: (form: string) => void;
  outputText: string;
  
  // Form options
  formOptions: Record<string, string>;
  formOptionsWithCategories?: FormOption[];
  isLoadingForms: boolean;
  
  // Custom form props
  sourceCustomForm: CustomFormState;
  setSourceCustomForm: (customForm: CustomFormState) => void;
  targetCustomForm: CustomFormState;
  setTargetCustomForm: (customForm: CustomFormState) => void;
  
  // Translation state
  isTranslating: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Form detection state
  detectedForm?: string | null;
  isDetectingForm?: boolean;
  detectionReasoning?: string | null;
}

export default function MobileTranslationLayout({
  sourceForm,
  setSourceForm,
  inputText,
  setInputText,
  targetForm,
  setTargetForm,
  outputText,
  formOptions,
  formOptionsWithCategories,
  isLoadingForms,
  sourceCustomForm,
  setSourceCustomForm,
  targetCustomForm,
  setTargetCustomForm,
  isTranslating,
  error,
  setError,
  detectedForm = null,
  isDetectingForm = false,
}: MobileTranslationLayoutProps) {
  // Use our reusable clipboard hooks
  const { copyToClipboard: copyOutput, showCopiedMessage: showOutputCopied } = useClipboard();
  const { copyToClipboard: copyInput, showCopiedMessage: showInputCopied } = useClipboard();

  const handleCopyOutput = () => {
    if (outputText && outputText.trim()) {
      copyOutput(outputText);
    }
  };

  const handleCopyInput = () => {
    if (inputText && inputText.trim()) {
      copyInput(inputText);
    }
  };

  return (
    <div className="lg:hidden bg-white">
      {/* Source Language Selector and Input Section */}
      <div className="px-4 py-4">
        <div className="mb-4">
          <DropdownSelector
            value={sourceForm}
            onChange={setSourceForm}
            options={formOptions}
            optionsWithCategories={formOptionsWithCategories}
            isLoading={isLoadingForms}
            disabled={isLoadingForms}
            mobileOnly={true}
            isSourceSelector={true}
            customForm={sourceCustomForm}
            onCustomFormChange={setSourceCustomForm}
            isDetectingForm={isDetectingForm}
            detectedForm={detectedForm}
          />
        </div>
      
        {/* Input Text Area */}
        <div className="min-h-[120px]">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="enter text to translate..."
            className="w-full min-h-[120px] resize-none border-none outline-none leading-relaxed bg-transparent placeholder-gray-400 font-inter text-lg sm:text-xl"
            style={{ color: '#202124' }}
            maxLength={UI_CONSTANTS.MAX_TEXT_LENGTH}
          />
          
        </div>
        
        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCopyInput}
                className="py-2 pr-2 pl-0 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                disabled={!inputText || !inputText.trim()}
                title="Copy to clipboard"
              >
                <svg className={`w-6 h-6 ${!inputText || !inputText.trim() ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* Copy feedback message for input */}
              {showInputCopied && (
                <span className="text-sm text-gray-600 font-medium transition-opacity duration-300 whitespace-nowrap">
                  copied to clipboard
                </span>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-400 flex-shrink-0 ml-2">{inputText.length} / {UI_CONSTANTS.MAX_TEXT_LENGTH}</span>
        </div>
      </div>

      {/* Target Language Selector and Output Section */}
      <div className="px-4 py-4 bg-white">
        <div className="mb-4">
          <DropdownSelector
            value={targetForm}
            onChange={setTargetForm}
            options={formOptions}
            optionsWithCategories={formOptionsWithCategories}
            isLoading={isLoadingForms}
            disabled={isLoadingForms}
            mobileOnly={true}
            isSourceSelector={false}
            customForm={targetCustomForm}
            onCustomFormChange={setTargetCustomForm}
          />
        </div>
        
        {/* Output Text Area */}
        <div className="min-h-[120px]">
          {isTranslating ? (
            <div className="flex items-center space-x-2 pt-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-gray-500">translating...</span>
            </div>
          ) : error ? (
            <div className="flex items-start space-x-2 pt-4">
              <svg className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="min-w-0 flex-1">
                <span className="text-red-600 font-medium">Error:</span>
                <p className="text-red-600 mt-1 break-words">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  Clear error
                </button>
              </div>
            </div>
          ) : (
            <div className="leading-relaxed min-h-[120px] flex items-start font-inter text-lg sm:text-xl break-words whitespace-pre-wrap" style={{ color: '#202124' }}>
              {outputText || <span className="text-gray-400">translation</span>}
            </div>
          )}
        </div>
        
        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCopyOutput}
                className="py-2 pr-2 pl-0 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                disabled={!outputText || !outputText.trim()}
                title="Copy to clipboard"
              >
                <svg className={`w-6 h-6 ${!outputText || !outputText.trim() ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* Copy feedback message for output */}
              {showOutputCopied && (
                <span className="text-sm text-gray-600 font-medium transition-opacity duration-300 whitespace-nowrap">
                  copied to clipboard
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

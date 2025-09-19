// Translation Panel Component - Reusable panel for input and output
// This follows the DRY principle - Don't Repeat Yourself

import LanguageSelector from './LanguageSelector';
import { UI_CONSTANTS } from '@/constants';

interface TranslationPanelProps {
  type: 'input' | 'output';
  value: string;
  onChange?: (value: string) => void;
  selectedForm: string;
  onFormChange: (form: string) => void;
  formOptions: Record<string, string>;
  isLoadingForms: boolean;
  isTranslating?: boolean;
  error?: string | null;
  onClearError?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export default function TranslationPanel({
  type,
  value,
  onChange,
  selectedForm,
  onFormChange,
  formOptions,
  isLoadingForms,
  isTranslating = false,
  error = null,
  onClearError,
  placeholder = "",
  maxLength = UI_CONSTANTS.MAX_TEXT_LENGTH,
}: TranslationPanelProps) {
  const isInput = type === 'input';
  const isOutput = type === 'output';

  // Google Translate style - no borders on mobile
  const panelClassName = isInput 
    ? "lg:border lg:border-gray-200 lg:rounded-lg overflow-hidden bg-white"
    : "lg:border lg:border-gray-200 lg:rounded-lg overflow-hidden bg-white";
    
  const headerClassName = isInput 
    ? "px-4 py-3 bg-white lg:bg-gray-50 lg:border-b lg:border-gray-100"
    : "px-4 py-3 bg-white lg:bg-gray-50 lg:border-b lg:border-gray-100";
    
  const contentClassName = isInput 
    ? "px-4 py-0 lg:p-4"
    : "px-4 py-0 lg:p-4";

  const renderContent = () => {
    if (isInput) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 lg:h-48 resize-none border-none outline-none text-gray-900 text-lg lg:text-base leading-relaxed bg-transparent py-4"
          maxLength={maxLength}
        />
      );
    }

    // Output content - responsive height for mobile
    return (
      <div className="w-full h-32 lg:h-48 text-gray-900 text-lg lg:text-base leading-relaxed flex flex-col py-4">
        {isTranslating ? (
          <div className="flex items-center space-x-2 pt-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-gray-500">Translating...</span>
          </div>
        ) : error ? (
          <div className="flex items-start space-x-2 pt-4">
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
          <div className="flex-1">
            {value || <span className="text-gray-400">Translation</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={panelClassName}>
      {/* Header with language selector */}
      <div className={`${headerClassName} flex items-center space-x-2`}>
        <LanguageSelector
          value={selectedForm}
          onChange={onFormChange}
          options={formOptions}
          isLoading={isLoadingForms}
          disabled={isLoadingForms}
        />
      </div>

      {/* Content area */}
      <div className={contentClassName}>
        {renderContent()}
        
        {/* Mobile: Minimal footer, Desktop: Full footer */}
        <div className="flex items-center justify-between pt-3 lg:mt-4 lg:pt-2 lg:border-t lg:border-gray-100">
          <div className="flex items-center space-x-3">
            {isInput && (
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            
            {isOutput && (
              <>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {isInput && (
            <span className="text-sm text-gray-400 lg:text-xs">{value.length} / {maxLength}</span>
          )}
        </div>
      </div>
    </div>
  );
}

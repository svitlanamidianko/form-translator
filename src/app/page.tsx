'use client';

import { useState } from 'react';
// Clean, focused imports - only what we need
import { useTranslation } from '@/hooks/useTranslation';
import EnvironmentIndicator from '@/components/EnvironmentIndicator';
import Header from '@/components/Header';
import ContentTabs from '@/components/ContentTabs';
import TranslationPanel from '@/components/TranslationPanel';
import BottomActions from '@/components/BottomActions';
import TranslationHistory from '@/components/TranslationHistory';
import LanguageSelector from '@/components/LanguageSelector';
import { UI_CONSTANTS } from '@/constants';

export default function Home() {
  // Use our custom hook for all translation logic
  // This is like importing a service class in Python
  const {
    formTypes,
    isLoadingForms,
    sourceForm,
    targetForm,
    inputText,
    outputText,
    isTranslating,
    error,
    translationHistory,
    isHistoryOpen,
    isLoadingHistory,
    setSourceForm,
    setTargetForm,
    setInputText,
    setError,
    handleSwapForms,
    toggleHistory,
    refreshHistory,
  } = useTranslation();

  // State for mobile copy feedback - like a boolean flag in Python
  const [showMobileCopiedMessage, setShowMobileCopiedMessage] = useState(false);
  const [showMobileInputCopiedMessage, setShowMobileInputCopiedMessage] = useState(false);

  // Copy functionality for mobile layout - like a utility function in Python
  const handleCopyOutput = async () => {
    if (!outputText || !outputText.trim()) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      // Show success message
      setShowMobileCopiedMessage(true);
      setTimeout(() => setShowMobileCopiedMessage(false), 2000); // Hide after 2 seconds
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = outputText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        // Show success message for fallback too
        setShowMobileCopiedMessage(true);
        setTimeout(() => setShowMobileCopiedMessage(false), 2000);
        console.log('Text copied to clipboard (fallback)');
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
    }
  };

  // Copy functionality for mobile input - like a utility function in Python
  const handleCopyInput = async () => {
    if (!inputText || !inputText.trim()) return;
    
    try {
      await navigator.clipboard.writeText(inputText);
      // Show success message
      setShowMobileInputCopiedMessage(true);
      setTimeout(() => setShowMobileInputCopiedMessage(false), 2000); // Hide after 2 seconds
      console.log('Input text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy input text:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = inputText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        // Show success message for fallback too
        setShowMobileInputCopiedMessage(true);
        setTimeout(() => setShowMobileInputCopiedMessage(false), 2000);
        console.log('Input text copied to clipboard (fallback)');
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Environment Indicator - only shows in development */}
      <EnvironmentIndicator />
      
      {/* Header */}
      <Header />
      
      {/* Content Type Tabs */}
      <ContentTabs />
      
      {/* Main Translation Interface - Google Translate Style */}
      <div className="w-full max-w-full overflow-hidden lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-6">
        
        {/* Mobile Layout - Google Translate Style */}
        <div className="lg:hidden bg-white">
          {/* Language Selectors Row - Same line like Google Translate */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <LanguageSelector
                value={sourceForm}
                onChange={setSourceForm}
                options={formTypes}
                isLoading={isLoadingForms}
                disabled={isLoadingForms}
                mobileOnly={true}
              />
              
              {/* Swap Arrow */}
              <button 
                onClick={handleSwapForms}
                className="p-2 mx-4"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l4-4" />
                </svg>
              </button>
              
              <LanguageSelector
                value={targetForm}
                onChange={setTargetForm}
                options={formTypes}
                isLoading={isLoadingForms}
                disabled={isLoadingForms}
                mobileOnly={true}
              />
            </div>
          
            {/* Input Text Area */}
            <div className="min-h-[120px]">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="enter text to translate..."
                className="w-full min-h-[120px] resize-none border-none outline-none leading-relaxed bg-transparent placeholder-gray-400 font-inter text-xl"
                style={{ color: '#202124' }}
                maxLength={UI_CONSTANTS.MAX_TEXT_LENGTH}
              />
            </div>
            
            {/* Bottom Row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleCopyInput}
                    className="py-2 pr-2 pl-0 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={!inputText || !inputText.trim()}
                    title="Copy to clipboard"
                  >
                    <svg className={`w-6 h-6 ${!inputText || !inputText.trim() ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  {/* Copy feedback message for mobile input */}
                  {showMobileInputCopiedMessage && (
                    <span className="text-sm text-gray-600 font-medium transition-opacity duration-300">
                      copied to clipboard
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-400">{inputText.length} / {UI_CONSTANTS.MAX_TEXT_LENGTH}</span>
            </div>
          </div>


          {/* Output Section */}
          <div className="px-4 py-4 bg-white">
            
            {/* Output Text Area */}
            <div className="min-h-[120px]">
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
                    <button 
                      onClick={() => setError(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      Clear error
                    </button>
                  </div>
                </div>
              ) : (
                <div className="leading-relaxed min-h-[120px] flex items-start font-inter text-xl" style={{ color: '#202124' }}>
                  {outputText || <span className="text-gray-400">translation</span>}
                </div>
              )}
            </div>
            
            {/* Bottom Row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleCopyOutput}
                    className="py-2 pr-2 pl-0 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={!outputText || !outputText.trim()}
                    title="Copy to clipboard"
                  >
                    <svg className={`w-6 h-6 ${!outputText || !outputText.trim() ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  {/* Copy feedback message for mobile */}
                  {showMobileCopiedMessage && (
                    <span className="text-sm text-gray-600 font-medium transition-opacity duration-300">
                      copied to clipboard
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Two Columns */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 relative">
          {/* Input Panel - Desktop */}
          <TranslationPanel
            type="input"
            value={inputText}
            onChange={setInputText}
            selectedForm={sourceForm}
            onFormChange={setSourceForm}
            formOptions={formTypes}
            isLoadingForms={isLoadingForms}
            placeholder="enter text to translate..."
            maxLength={UI_CONSTANTS.MAX_TEXT_LENGTH}
          />


          {/* Output Panel - Desktop */}
          <TranslationPanel
            type="output"
            value={outputText}
            selectedForm={targetForm}
            onFormChange={setTargetForm}
            formOptions={formTypes}
            isLoadingForms={isLoadingForms}
            isTranslating={isTranslating}
            error={error}
            onClearError={() => setError(null)}
          />
        </div>

        {/* Bottom Actions */}
        <BottomActions onHistoryClick={toggleHistory} />
      </div>

      {/* Translation History - appears below main content when opened */}
      <TranslationHistory
        isOpen={isHistoryOpen}
        onToggle={toggleHistory}
        historyItems={translationHistory}
        formOptions={formTypes}
        isLoadingHistory={isLoadingHistory}
        onRefreshHistory={refreshHistory}
      />
      
      {/* Bottom spacing when history is open - ensures scroll space */}
      {isHistoryOpen && <div className="h-20"></div>}
    </div>
  );
}

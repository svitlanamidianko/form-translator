'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import EnvironmentIndicator from '@/components/EnvironmentIndicator';
import Header from '@/components/Header';
import ContentTabs from '@/components/ContentTabs';
import TranslationPanel from '@/components/TranslationPanel';
import MobileTranslationLayout from '@/components/MobileTranslationLayout';
import BottomActions from '@/components/BottomActions';
import TranslationHistory from '@/components/TranslationHistory';
import { UI_CONSTANTS } from '@/constants';

export default function Home() {
  // State for info modal
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  // State for reasoning box visibility
  const [showReasoningBox, setShowReasoningBox] = useState(false);

  // Use our custom hook for all translation logic
  // This is like importing a service class in Python
  const {
    formOptions,
    formOptionsWithCategories,
    isLoadingForms,
    currentLanguage,
    sourceForm,
    targetForm,
    inputText,
    outputText,
    isTranslating,
    error,
    detectedForm,
    isDetectingForm,
    detectionReasoning,
    sourceCustomForm,
    targetCustomForm,
    translationHistory,
    isHistoryOpen,
    isLoadingHistory,
    historySortMode,
    setSourceForm,
    setTargetForm,
    setInputText,
    setError,
    setSourceCustomForm,
    setTargetCustomForm,
    toggleHistory,
    refreshHistory,
    changeHistorySortMode,
    switchLanguage,
  } = useTranslation();

  // Handle reasoning box auto-hide timer
  useEffect(() => {
    if (detectedForm && !isDetectingForm && detectionReasoning) {
      setShowReasoningBox(true);
      
      // Hide the reasoning box after 30 seconds
      const timer = setTimeout(() => {
        setShowReasoningBox(false);
      }, 30000);
      
      return () => clearTimeout(timer);
    } else {
      setShowReasoningBox(false);
    }
  }, [detectedForm, isDetectingForm, detectionReasoning]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Environment Indicator - only shows in development */}
      <EnvironmentIndicator />
      
      {/* Header with InfoModal */}
      <Header 
        onInfoClick={() => setIsInfoModalOpen(!isInfoModalOpen)} 
        onCloseInfoModal={() => setIsInfoModalOpen(false)}
        isInfoModalOpen={isInfoModalOpen}
        onLanguageSwitch={switchLanguage}
        currentLanguage={currentLanguage}
      />
      
      {/* Content Type Tabs */}
      <div className="pt-20">
        <ContentTabs />
      </div>
      
      {/* Main Translation Interface - Google Translate Style */}
      <div className="w-full max-w-full lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-6 relative">
        
        {/* Mobile Layout - Extracted to separate component */}
        <MobileTranslationLayout
          sourceForm={sourceForm}
          setSourceForm={setSourceForm}
          inputText={inputText}
          setInputText={setInputText}
          targetForm={targetForm}
          setTargetForm={setTargetForm}
          outputText={outputText}
          formOptions={formOptions}
          formOptionsWithCategories={formOptionsWithCategories}
          isLoadingForms={isLoadingForms}
          isTranslating={isTranslating}
          error={error}
          setError={setError}
          detectedForm={detectedForm}
          isDetectingForm={isDetectingForm}
          detectionReasoning={detectionReasoning}
          sourceCustomForm={sourceCustomForm}
          setSourceCustomForm={setSourceCustomForm}
          targetCustomForm={targetCustomForm}
          setTargetCustomForm={setTargetCustomForm}
        />

        {/* Desktop Layout - Two Columns with Margin Note */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 relative lg:items-stretch">
          {/* Form Detection Reasoning - Absolute Positioned Margin Note */}
          {showReasoningBox && (
            <div className="absolute -left-80 top-0 w-72 z-10 transition-opacity duration-500 ease-in-out" style={{ left: '-19.5rem' }}>
              <div className="p-4">
                <div className="text-sm mb-2">
                  <span className="font-medium text-gray-600 uppercase">Detected form: {detectedForm}</span>
                </div>
                {detectionReasoning && (
                  <p className="text-xs text-gray-500 lowercase leading-relaxed text-justify">{detectionReasoning}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Translation Panels - Original Layout */}
          {/* Input Panel - Desktop */}
          <TranslationPanel
            type="input"
            value={inputText}
            onChange={setInputText}
            selectedForm={sourceForm}
            onFormChange={setSourceForm}
            formOptions={formOptions}
            formOptionsWithCategories={formOptionsWithCategories}
            isLoadingForms={isLoadingForms}
            placeholder="enter text to translate..."
            maxLength={UI_CONSTANTS.MAX_TEXT_LENGTH}
            customForm={sourceCustomForm}
            onCustomFormChange={setSourceCustomForm}
            detectedForm={detectedForm}
            isDetectingForm={isDetectingForm}
            detectionReasoning={detectionReasoning}
          />


          {/* Output Panel - Desktop */}
          <TranslationPanel
            type="output"
            value={outputText}
            selectedForm={targetForm}
            onFormChange={setTargetForm}
            formOptions={formOptions}
            formOptionsWithCategories={formOptionsWithCategories}
            isLoadingForms={isLoadingForms}
            isTranslating={isTranslating}
            error={error}
            onClearError={() => setError(null)}
            customForm={targetCustomForm}
            onCustomFormChange={setTargetCustomForm}
          />
        </div>

        {/* Bottom Actions */}
        <BottomActions 
          onHistoryClick={toggleHistory} 
          isHistoryOpen={isHistoryOpen}
          historySortMode={historySortMode}
          onSortModeChange={changeHistorySortMode}
        />
      </div>

      {/* Translation History - appears below main content when opened */}
      <TranslationHistory
        isOpen={isHistoryOpen}
        onToggle={toggleHistory}
        historyItems={translationHistory}
        formOptions={formOptions}
        isLoadingHistory={isLoadingHistory}
        onRefreshHistory={refreshHistory}
      />
      
      {/* Bottom spacing when history is open - ensures scroll space */}
      {isHistoryOpen && <div className="h-20"></div>}
    </div>
  );
}

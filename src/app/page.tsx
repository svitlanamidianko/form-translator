'use client';

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
  // Use our custom hook for all translation logic
  // This is like importing a service class in Python
  const {
    formOptions,
    formOptionsWithCategories,
    isLoadingForms,
    sourceForm,
    targetForm,
    inputText,
    outputText,
    isTranslating,
    error,
    sourceCustomForm,
    targetCustomForm,
    translationHistory,
    isHistoryOpen,
    isLoadingHistory,
    setSourceForm,
    setTargetForm,
    setInputText,
    setError,
    setSourceCustomForm,
    setTargetCustomForm,
    toggleHistory,
    refreshHistory,
  } = useTranslation();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Environment Indicator - only shows in development */}
      <EnvironmentIndicator />
      
      {/* Header */}
      <Header />
      
      {/* Content Type Tabs */}
      <div className="pt-20">
        <ContentTabs />
      </div>
      
      {/* Main Translation Interface - Google Translate Style */}
      <div className="w-full max-w-full lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-6">
        
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
          sourceCustomForm={sourceCustomForm}
          setSourceCustomForm={setSourceCustomForm}
          targetCustomForm={targetCustomForm}
          setTargetCustomForm={setTargetCustomForm}
        />

        {/* Desktop Layout - Two Columns with Equal Heights */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 relative lg:items-stretch">
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
        <BottomActions onHistoryClick={toggleHistory} isHistoryOpen={isHistoryOpen} />
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

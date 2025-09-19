// Custom Hook for Translation Logic
// This is like creating a separate translation_service.py in Python
// It separates business logic from UI components

import { useState, useEffect, useRef } from 'react';
import { translateText, APIError, getFormTypes, getTranslationHistory } from '@/services/api';
import type { TranslationRequest, TranslationHistoryItem, APIHistoryItem } from '@/types';
import { isDevelopment } from '@/config/environment';
import { UI_CONSTANTS, ERROR_MESSAGES } from '@/constants';

// Utility function to convert API history items to our internal format
// This is like having a data transformer function in Python
function convertAPIHistoryToInternal(apiItem: APIHistoryItem): TranslationHistoryItem {
  // Parse the date - your API returns "9/23/2025" format
  const parseDate = (dateString: string): Date => {
    try {
      // Handle the MM/DD/YYYY format from your API
      const [month, day, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in JS Date
    } catch (error) {
      console.warn(`Failed to parse date: ${dateString}`, error);
      return new Date(); // Fallback to current date
    }
  };

  return {
    id: apiItem.id || `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sourceText: apiItem.source_text,
    targetText: apiItem.target_text,
    sourceForm: apiItem.source_form,
    targetForm: apiItem.target_form,
    timestamp: parseDate(apiItem.datetime),
  };
}

interface UseTranslationReturn {
  // Form data
  formTypes: Record<string, string>;
  isLoadingForms: boolean;
  
  // Translation state
  sourceForm: string;
  targetForm: string;
  inputText: string;
  outputText: string;
  isTranslating: boolean;
  error: string | null;
  
  // History state
  translationHistory: TranslationHistoryItem[];
  isHistoryOpen: boolean;
  isLoadingHistory: boolean;
  
  // Actions
  setSourceForm: (form: string) => void;
  setTargetForm: (form: string) => void;
  setInputText: (text: string) => void;
  setError: (error: string | null) => void;
  handleSwapForms: () => void;
  handleTranslate: () => Promise<void>;
  toggleHistory: () => void;
  clearHistory: () => void;
  refreshHistory: () => void;
}

export function useTranslation(): UseTranslationReturn {
  // State management - like instance variables in a Python class
  const [formTypes, setFormTypes] = useState<Record<string, string>>({});
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [sourceForm, setSourceForm] = useState('');
  const [targetForm, setTargetForm] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // History state - like maintaining a list of objects in Python
  const [translationHistory, setTranslationHistory] = useState<TranslationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Ref for debouncing - like a class attribute in Python
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load available forms on initialization - like __init__ in Python
  useEffect(() => {
    const fetchForms = async () => {
      try {
        if (isDevelopment()) {
          console.log('🔄 Fetching available forms from API...');
        }
        
        const response = await getFormTypes();
        setFormTypes(response.forms);
        
        // Set default values to first two forms if available
        const formKeys = Object.keys(response.forms);
        if (formKeys.length >= 2) {
          setSourceForm(formKeys[0]);
          setTargetForm(formKeys[1]);
        }
        
        if (isDevelopment()) {
          console.log(`✅ Loaded ${response.count} form types:`, response.forms);
        }
      } catch (err) {
        console.error('Failed to fetch forms:', err);
        setError(ERROR_MESSAGES.FORMS_LOAD_FAILED);
      } finally {
        setIsLoadingForms(false);
      }
    };

    fetchForms();
  }, []);

  // Auto-translate with debouncing - like a watcher in Python
  useEffect(() => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Don't translate if conditions aren't met
    if (!inputText.trim() || isLoadingForms || !sourceForm || !targetForm) {
      setOutputText('');
      return;
    }

    // Debounced translation - wait for user to stop typing
    debounceTimeoutRef.current = setTimeout(() => {
      handleTranslate();
    }, UI_CONSTANTS.DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputText, sourceForm, targetForm, isLoadingForms]);

  // Fetch history from API - like calling an API endpoint in Python
  const fetchTranslationHistory = async () => {
    if (isLoadingHistory) return; // Prevent duplicate requests
    
    setIsLoadingHistory(true);
    try {
      if (isDevelopment()) {
        console.log('🔄 Fetching translation history from API...');
      }
      
      const response = await getTranslationHistory();
      
      // Convert API format to our internal format - like data transformation in Python
      const convertedHistory = response.history.map(convertAPIHistoryToInternal);
      
      setTranslationHistory(convertedHistory);
      
      if (isDevelopment()) {
        console.log(`✅ Loaded ${convertedHistory.length} history items from API`);
      }
    } catch (error) {
      console.error('Failed to fetch translation history:', error);
      // Don't set error state for history - it's not critical for main functionality
      // Just log the error and keep existing history if any
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // History management functions - like methods in a Python class
  const toggleHistory = () => {
    const newIsOpen = !isHistoryOpen;
    setIsHistoryOpen(newIsOpen);
    
    // Fetch history when opening for the first time or when refreshing
    if (newIsOpen && translationHistory.length === 0) {
      fetchTranslationHistory();
    }
  };

  const clearHistory = () => {
    setTranslationHistory([]);
  };

  const refreshHistory = () => {
    fetchTranslationHistory();
  };

  // Note: addToHistory function removed since we now fetch history from API

  // Swap source and target forms - like a method in Python class
  const handleSwapForms = () => {
    const tempForm = sourceForm;
    setSourceForm(targetForm);
    setTargetForm(tempForm);
    
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
  };

  // Handle translation - main business logic function
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    
    try {
      const request: TranslationRequest = {
        sourceText: inputText,
        sourceForm: sourceForm,
        targetForm: targetForm,
      };
      
      if (isDevelopment()) {
        console.log('🚀 Sending translation request:', request);
      }
      
      const response = await translateText(request);
      
      if (isDevelopment()) {
        console.log('✅ Received translation response:', response);
      }
      
      // Clean up the response text (remove extra quotes if present)
      let cleanText = response.translatedText;
      if (typeof cleanText === 'string' && cleanText.startsWith('"') && cleanText.endsWith('"')) {
        cleanText = cleanText.slice(1, -1);
      }
      setOutputText(cleanText);
      
      // Note: We're now fetching history from the API instead of storing locally
      // The backend handles saving translations to the history
      
    } catch (err) {
      console.error('Translation error:', err);
      
      if (err instanceof APIError) {
        setError(`${ERROR_MESSAGES.TRANSLATION_FAILED}: ${err.message}`);
      } else {
        setError(ERROR_MESSAGES.GENERIC_ERROR);
      }
      
      setOutputText('');
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    // Data
    formTypes,
    isLoadingForms,
    sourceForm,
    targetForm,
    inputText,
    outputText,
    isTranslating,
    error,
    
    // History data
    translationHistory,
    isHistoryOpen,
    isLoadingHistory,
    
    // Actions
    setSourceForm,
    setTargetForm,
    setInputText,
    setError,
    handleSwapForms,
    handleTranslate,
    toggleHistory,
    clearHistory,
    refreshHistory,
  };
}

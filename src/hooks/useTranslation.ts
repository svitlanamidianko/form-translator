// Custom Hook for Translation Logic
// This is like creating a separate translation_service.py in Python
// It separates business logic from UI components

import { useState, useEffect, useRef } from 'react';
import { translateText, APIError, getFormTypes, getTranslationHistory, detectForm } from '@/services/api';
import type { TranslationRequest, TranslationHistoryItem, APIHistoryItem, CustomFormState, FormOption, DetectFormResponse } from '@/types';
import { isDevelopment } from '@/config/environment';
import { UI_CONSTANTS, ERROR_MESSAGES, LANGUAGE_DISPLAY } from '@/constants';

// Utility function to convert API history items to our internal format
// This is like having a data transformer function in Python
function convertAPIHistoryToInternal(apiItem: APIHistoryItem): TranslationHistoryItem {

  // Parse the date - robust handling of multiple API date formats
  const parseDate = (dateString: string): Date => {
    if (!dateString) {
      console.warn('Empty date string provided');
      return new Date();
    }


    try {
      // Try to parse as ISO string first (2025-09-15T14:08:10.221051 or 2025-09-15T14:08:10)
      if (dateString.includes('T') || (dateString.includes('-') && dateString.length > 10)) {
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) {
          return isoDate;
        } else {
          if (isDevelopment()) {
            console.warn(`❌ Failed to parse ISO date: ${dateString}`);
          }
        }
      }
      
      // Handle YYYY-MM-DD format (just date)
      if (dateString.includes('-') && dateString.length === 10) {
        const [year, month, day] = dateString.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day, 12, 0, 0); // Set to noon
        console.log(`Parsed YYYY-MM-DD date: ${dateString} -> ${parsedDate}`);
        return parsedDate;
      }
      
      // Handle MM/DD/YYYY format (with or without time)
      if (dateString.includes('/')) {
        // Split by space first to separate date and time
        const [datePart, timePart] = dateString.split(' ');
        const parts = datePart.split('/').map(Number);
        
        if (parts.length === 3) {
          const [month, day, year] = parts;
          // Ensure year is 4 digits
          const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
          
          // Parse time if present
          let hours = 12, minutes = 0, seconds = 0;
          if (timePart) {
            const timeParts = timePart.split(':').map(Number);
            if (timeParts.length >= 2) {
              hours = timeParts[0] || 12;
              minutes = timeParts[1] || 0;
              seconds = timeParts[2] || 0;
            }
          }
          
          const parsedDate = new Date(fullYear, month - 1, day, hours, minutes, seconds);
          return parsedDate;
        }
      }
      
      // Fallback: try direct parsing with Date constructor
      const directParse = new Date(dateString);
      if (!isNaN(directParse.getTime())) {
        console.log(`Direct parsed date: ${dateString} -> ${directParse}`);
        return directParse;
      }
      
      throw new Error(`Unable to parse date format: ${dateString}`);
    } catch (error) {
      console.warn(`Failed to parse date: ${dateString}`, error);
      // Create a realistic fallback date (some time in the past)
      // Use a more reasonable fallback - at least a few days ago to avoid "just now"
      const fallback = new Date();
      const daysAgo = Math.floor(Math.random() * 30) + 7; // 7-37 days ago (minimum 1 week)
      fallback.setDate(fallback.getDate() - daysAgo);
      // Set to a specific time to avoid random time issues
      fallback.setHours(12, 0, 0, 0); // Set to noon
      console.log(`Using fallback date for ${dateString}: ${fallback}`);
      return fallback;
    }
  };

  return {
    id: apiItem.id || `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    inputText: apiItem.source_text,  // Map API's source_text to our inputText field
    targetText: apiItem.target_text,
    sourceForm: apiItem.source_form,
    targetForm: apiItem.target_form,
    timestamp: parseDate(apiItem.datetime),
    starCount: apiItem.stars_count || 0, // Use correct field name from your backend (plural)
  };
}

interface UseTranslationReturn {
  // Form data
  formOptions: Record<string, string>;
  formOptionsWithCategories: FormOption[];
  isLoadingForms: boolean;
  
  // Translation state
  sourceForm: string;
  targetForm: string;
  inputText: string;
  outputText: string;
  isTranslating: boolean;
  error: string | null;
  
  // Form detection state
  detectedForm: string | null;
  isDetectingForm: boolean;
  detectionReasoning: string | null;
  
  // Custom form state
  sourceCustomForm: CustomFormState;
  targetCustomForm: CustomFormState;
  
  // History state
  translationHistory: TranslationHistoryItem[];
  isHistoryOpen: boolean;
  isLoadingHistory: boolean;
  historySortMode: 'most_starred' | 'recent_first';
  
  // Actions
  setSourceForm: (form: string) => void;
  setTargetForm: (form: string) => void;
  setInputText: (text: string) => void;
  setError: (error: string | null) => void;
  setSourceCustomForm: (customForm: CustomFormState) => void;
  setTargetCustomForm: (customForm: CustomFormState) => void;
  handleTranslate: (overrideSourceForm?: string) => Promise<void>;
  toggleHistory: () => void;
  refreshHistory: () => void;
  changeHistorySortMode: (sortMode: 'most_starred' | 'recent_first') => void;
}

export function useTranslation(): UseTranslationReturn {
  // State management - like instance variables in a Python class
  const [formOptions, setFormOptions] = useState<Record<string, string>>({});
  const [formOptionsWithCategories, setFormOptionsWithCategories] = useState<FormOption[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [sourceForm, setSourceForm] = useState('');
  const [targetForm, setTargetForm] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form detection state
  const [detectedForm, setDetectedForm] = useState<string | null>(null);
  const [isDetectingForm, setIsDetectingForm] = useState(false);
  const [detectionReasoning, setDetectionReasoning] = useState<string | null>(null);
  
  // Custom form state - like having custom form objects in Python
  const [sourceCustomForm, setSourceCustomForm] = useState<CustomFormState>({
    isCustom: false,
    customText: ''
  });
  const [targetCustomForm, setTargetCustomForm] = useState<CustomFormState>({
    isCustom: false,
    customText: ''
  });
  
  // History state - like maintaining a list of objects in Python
  const [translationHistory, setTranslationHistory] = useState<TranslationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // History sorting state
  const [historySortMode, setHistorySortMode] = useState<'most_starred' | 'recent_first'>('most_starred');
  
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
        
        // Transform the new API format to the expected format
        // Convert { key: { category, description } } to { key: description }
        const transformedForms: Record<string, string> = {};
        const formsWithCategories: FormOption[] = [];
        
        Object.entries(response.forms).forEach(([key, formData]) => {
          transformedForms[key] = formData.description;
          formsWithCategories.push({
            key,
            label: formData.description,
            category: formData.category
          });
        });
        
        setFormOptions(transformedForms);
        setFormOptionsWithCategories(formsWithCategories);
        
        // Set default values - "detect" for source, first form for target
        const formKeys = Object.keys(response.forms);
        if (formKeys.length >= 1) {
          setSourceForm(LANGUAGE_DISPLAY.DETECT_KEY); // Default to "detect" for source
          setTargetForm(formKeys[0]); // First available form for target
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
    
    // Don't translate if custom form is selected but no custom text is provided
    if (sourceForm === LANGUAGE_DISPLAY.CUSTOM_KEY && !sourceCustomForm.customText.trim()) {
      setOutputText('');
      return;
    }
    
    if (targetForm === LANGUAGE_DISPLAY.CUSTOM_KEY && !targetCustomForm.customText.trim()) {
      setOutputText('');
      return;
    }

    // If "detect" is selected, detect the form first
    if (sourceForm === LANGUAGE_DISPLAY.DETECT_KEY) {
      debounceTimeoutRef.current = setTimeout(() => {
        handleFormDetection();
      }, UI_CONSTANTS.DEBOUNCE_DELAY);
    } else {
      // Regular translation
      debounceTimeoutRef.current = setTimeout(() => {
        handleTranslate();
      }, UI_CONSTANTS.DEBOUNCE_DELAY);
    }

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputText, sourceForm, targetForm, isLoadingForms, sourceCustomForm.customText, targetCustomForm.customText]);

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
      const seenIds = new Set();
      const convertedHistory = response.history.map((apiItem, index) => {
        const converted = convertAPIHistoryToInternal(apiItem);
        // Ensure unique IDs by appending index if needed
        if (seenIds.has(converted.id)) {
          converted.id = `${converted.id}-${index}`;
        }
        seenIds.add(converted.id);
        return converted;
      });
      
      
      // Apply current sorting to the history items
      const sortedHistory = sortHistoryItems(convertedHistory);
      
      // Debug: Check for duplicate IDs
      if (isDevelopment()) {
        const ids = sortedHistory.map(item => item.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.error('🚨 Duplicate IDs found in translationHistory:', ids.filter((id, index) => ids.indexOf(id) !== index));
          console.log('All IDs:', ids);
        }
      }
      
      setTranslationHistory(sortedHistory);
      
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

  const refreshHistory = () => {
    fetchTranslationHistory();
  };

  // Sort history items with a specific sort mode
  const sortHistoryItemsWithMode = (items: TranslationHistoryItem[], sortMode: 'most_starred' | 'recent_first'): TranslationHistoryItem[] => {
    if (sortMode === 'recent_first') {
      // Sort by timestamp (recent first)
      const sorted = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Debug logging to verify sorting
      if (isDevelopment()) {
        console.log('🔄 Sorting by recent first:', {
          firstItem: { id: sorted[0]?.id, timestamp: sorted[0]?.timestamp },
          lastItem: { id: sorted[sorted.length - 1]?.id, timestamp: sorted[sorted.length - 1]?.timestamp },
          totalItems: sorted.length
        });
      }
      
      return sorted;
    } else {
      // Sort by star count (most starred first), then by timestamp as secondary sort
      const sorted = [...items].sort((a, b) => {
        const aStars = a.starCount || 0;
        const bStars = b.starCount || 0;
        
        // Primary sort: by star count (descending)
        if (aStars !== bStars) {
          return bStars - aStars;
        }
        
        // Secondary sort: by timestamp (newest first)
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
      
      // Debug logging to verify sorting
      if (isDevelopment()) {
        console.log('🔄 Sorting by most starred first:', {
          firstItem: { id: sorted[0]?.id, starCount: sorted[0]?.starCount, timestamp: sorted[0]?.timestamp },
          lastItem: { id: sorted[sorted.length - 1]?.id, starCount: sorted[sorted.length - 1]?.starCount, timestamp: sorted[sorted.length - 1]?.timestamp },
          totalItems: sorted.length
        });
      }
      
      return sorted;
    }
  };

  // Sort history items based on current sort mode
  const sortHistoryItems = (items: TranslationHistoryItem[]): TranslationHistoryItem[] => {
    return sortHistoryItemsWithMode(items, historySortMode);
  };

  // Change sort mode and re-sort existing history
  const changeHistorySortMode = (newSortMode: 'most_starred' | 'recent_first') => {
    if (isDevelopment()) {
      console.log(`🔄 Changing sort mode from ${historySortMode} to ${newSortMode}`);
    }
    
    setHistorySortMode(newSortMode);
    
    // Re-sort existing history items with new sort mode
    // We need to sort with the new mode, not the old one
    const sortedHistory = sortHistoryItemsWithMode(translationHistory, newSortMode);
    setTranslationHistory(sortedHistory);
  };

  // Note: addToHistory function removed since we now fetch history from API

  // Handle form detection - new function for detecting forms
  const handleFormDetection = async () => {
    if (!inputText.trim()) return;
    
    setIsDetectingForm(true);
    setError(null);
    // Clear previous detection results immediately when starting new detection
    setDetectedForm(null);
    setDetectionReasoning(null);
    
    try {
      if (isDevelopment()) {
        console.log('🔍 Detecting form for text:', inputText);
      }
      
      const response = await detectForm({ text: inputText });
      
      if (isDevelopment()) {
        console.log('✅ Form detection response:', response);
      }
      
      setDetectedForm(response.detectedForm);
      setDetectionReasoning(response.reasoning);
      
      // Immediately stop detecting spinner as soon as detection completes
      setIsDetectingForm(false);
      
      // Keep the source form as "detect" so the detected form shows in the button
      // Don't change the sourceForm - let the DropdownSelector handle showing the detected form
      
      // Now that we have the detected form, proceed with translation
      if (isDevelopment()) {
        console.log('🔍 Proceeding with translation after form detection');
      }
      
      // Call translate immediately with an explicit override to avoid race conditions
      await handleTranslate(response.detectedForm);
      
    } catch (err) {
      console.error('Form detection error:', err);
      
      if (err instanceof APIError) {
        setError(`Form detection failed: ${err.message}`);
      } else {
        setError('Failed to detect form. Please try again.');
      }
      
      setDetectedForm(null);
      setDetectionReasoning(null);
    } finally {
      // In case an early return path didn't clear it, ensure spinner is off
      setIsDetectingForm(false);
      if (isDevelopment()) {
        console.log('✅ Form detection completed, isDetectingForm set to false');
      }
    }
  };

  // Handle translation - main business logic function
  const handleTranslate = async (overrideSourceForm?: string) => {
    if (!inputText.trim()) return;
    
    if (isDevelopment()) {
      console.log('🚀 Starting translation with:', { sourceForm, targetForm, overrideSourceForm, inputText: inputText.substring(0, 50) + '...' });
    }
    
    setIsTranslating(true);
    setError(null);
    
    try {
      // Resolve the effective source form to avoid ever sending "detect" to backend
      let actualSourceForm: string = sourceForm;
      
      // Highest priority: explicit override from caller
      if (overrideSourceForm && overrideSourceForm.trim()) {
        actualSourceForm = overrideSourceForm.trim();
      } else if (sourceForm === LANGUAGE_DISPLAY.CUSTOM_KEY) {
        // Custom form: use the user's custom text
        actualSourceForm = sourceCustomForm.customText;
      } else if (sourceForm === LANGUAGE_DISPLAY.DETECT_KEY) {
        // Detect mode: prefer already detected form if present
        if (detectedForm && detectedForm.trim()) {
          actualSourceForm = detectedForm.trim();
        } else {
          // Inline detection fallback to avoid race conditions
          try {
            if (isDevelopment()) {
              console.log('🧠 Inline detection fallback triggered before translation');
            }
            const detection = await detectForm({ text: inputText });
            if (detection && detection.detectedForm) {
              actualSourceForm = detection.detectedForm;
              // Update UI state with the inline detection result for consistency
              setDetectedForm(detection.detectedForm);
              setDetectionReasoning(detection.reasoning);
            } else {
              throw new Error('No detected form in detection response');
            }
          } catch (detectErr) {
            console.error('Inline detection failed before translation:', detectErr);
            // Safer to abort than to send "detect" downstream which pollutes history
            setIsTranslating(false);
            setError('Failed to detect form. Please try again.');
            return;
          }
        }
      }
      const actualTargetForm = targetForm === LANGUAGE_DISPLAY.CUSTOM_KEY 
        ? targetCustomForm.customText 
        : targetForm;
        
      if (isDevelopment()) {
        console.log('📝 Translation request:', { actualSourceForm, actualTargetForm });
      }
      
      // Absolute safety: never send "detect" to backend
      if (String(actualSourceForm).trim().toLowerCase() === LANGUAGE_DISPLAY.DETECT_KEY) {
        console.error('Refusing to send "detect" as source form. Aborting translation.');
        setIsTranslating(false);
        setError('Form detection did not resolve. Please try again.');
        return;
      }
        
      const request: TranslationRequest = {
        inputText: inputText,  // Changed from sourceText to match backend expectation
        sourceForm: actualSourceForm,
        targetForm: actualTargetForm,
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
      
      if (isDevelopment()) {
        console.log('✅ Translation completed successfully');
      }
      
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
      if (isDevelopment()) {
        console.log('🏁 Translation process finished, isTranslating set to false');
      }
    }
  };

  return {
    // Data
    formOptions,
    formOptionsWithCategories,
    isLoadingForms,
    sourceForm,
    targetForm,
    inputText,
    outputText,
    isTranslating,
    error,
    
    // Form detection data
    detectedForm,
    isDetectingForm,
    detectionReasoning,
    
    // Custom form data
    sourceCustomForm,
    targetCustomForm,
    
    // History data
    translationHistory,
    isHistoryOpen,
    isLoadingHistory,
    historySortMode,
    
    // Actions
    setSourceForm,
    setTargetForm,
    setInputText,
    setError,
    setSourceCustomForm,
    setTargetCustomForm,
    handleTranslate,
    toggleHistory,
    refreshHistory,
    changeHistorySortMode,
  };
}

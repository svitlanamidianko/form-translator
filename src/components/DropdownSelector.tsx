// Dropdown Selector Component - Google Translate style with multiple visible languages
// This is like creating a reusable widget class in Python that shows multiple options

import { useState, useRef, useEffect } from 'react';
import { LANGUAGE_DISPLAY } from '@/constants';
import type { CustomFormState, FormOption } from '@/types';
import { useCyclingLoadingMessage } from '@/hooks/useCyclingLoadingMessage';

interface DropdownSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  optionsWithCategories?: FormOption[]; // Optional category information
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  mobileOnly?: boolean;
  isSourceSelector?: boolean; // To determine if we should show "Detect" button
  dropdownAlign?: 'left' | 'right'; // Controls dropdown alignment
  customForm?: CustomFormState; // Custom form state
  onCustomFormChange?: (customForm: CustomFormState) => void; // Custom form change handler
  isDetectingForm?: boolean; // Form detection loading state
  detectedForm?: string | null; // Detected form to show as new button
}

export default function DropdownSelector({
  value,
  onChange,
  options,
  optionsWithCategories,
  isLoading = false,
  disabled = false,
  className = "",
  mobileOnly = false,
  isSourceSelector = false,
  dropdownAlign = 'left',
  customForm = { isCustom: false, customText: '' },
  onCustomFormChange,
  isDetectingForm = false,
  detectedForm = null,
}: DropdownSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cycling loading messages for engaging user experience
  const loadingMessages = [
    "loading forms, it's quick 🚀",
    "unless Form Translator is sleepy😴",
    "don't give up 🥹 loading forms should be done in seconds", 
    "dooby kooby dooo mee loo.."
  ];
  
  const currentLoadingMessage = useCyclingLoadingMessage({
    isActive: isLoading,
    messages: loadingMessages,
    intervalMs: 2000 // 2 seconds per message
  });

  // Function to extract just the form name (before the dash)
  const getDisplayLabel = (key: string, label: string) => {
    if (key === LANGUAGE_DISPLAY.DETECT_KEY || key === LANGUAGE_DISPLAY.CUSTOM_KEY) {
      return label;
    }
    return label.split(' - ')[0];
  };

  // Function to check if a form should be grouped
  const isFormGrouped = (key: string): boolean => {
    if (!optionsWithCategories) return false;
    const formOption = optionsWithCategories.find(opt => opt.key === key);
    return formOption?.category !== null && formOption?.category !== undefined;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span>{currentLoadingMessage}</span>
      </div>
    );
  }

  // Get the options array with special options positioned correctly
  const getOptionsArray = () => {
    const optionsArray = Object.entries(options);
    
    if (isSourceSelector) {
      // For input: Detect first, then regular forms (custom will be in dropdown)
      return [
        [LANGUAGE_DISPLAY.DETECT_KEY, LANGUAGE_DISPLAY.DETECT_LABEL],
        ...optionsArray
      ];
    } else {
      // For output: Just regular forms (custom will be in dropdown)
      return optionsArray;
    }
  };

  const allOptions = getOptionsArray();
  
  // Smart visible options logic - ensure selected form from dropdown appears in second position
  const getVisibleOptions = () => {
    // If custom form is selected, show it in the visible area with custom text
    if (value === LANGUAGE_DISPLAY.CUSTOM_KEY) {
      const customDisplayText = customForm.customText || LANGUAGE_DISPLAY.CUSTOM_LABEL;
      const customOption: [string, string] = [LANGUAGE_DISPLAY.CUSTOM_KEY, customDisplayText];
      
      if (isSourceSelector) {
        // For source: [Detect, Custom, ...others]
        return [
          [LANGUAGE_DISPLAY.DETECT_KEY, LANGUAGE_DISPLAY.DETECT_LABEL],
          customOption,
          ...allOptions.slice(1, LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES - 1)
        ];
      } else {
        // For target: [Custom, ...others]
        return [
          customOption,
          ...allOptions.slice(0, LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES - 1)
        ];
      }
    }
    
    // If we have a detected form, always show it prominently after detect button
    // This works whether sourceForm is "detect" or the detected form itself
    if (detectedForm && isSourceSelector) {
      const detectedOption: [string, string] = [detectedForm, detectedForm];
      const defaultVisible = allOptions.slice(0, LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES - 1);
      
      // Insert detected form after detect button: [Detect, DetectedForm, ...others]
      return [
        [LANGUAGE_DISPLAY.DETECT_KEY, LANGUAGE_DISPLAY.DETECT_LABEL],
        detectedOption,
        ...defaultVisible.slice(1)
      ];
    }
    
    const defaultVisible = allOptions.slice(0, LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES);
    
    // If the selected value is in the dropdown options (not in default visible)
    const selectedInDropdown = allOptions.slice(LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES).find(([key]) => key === value);
    
    if (selectedInDropdown && isSourceSelector) {
      // For source selector: [Detect, SelectedForm, ...others]
      const [detectOption, ...restDefault] = defaultVisible;
      return [
        detectOption, // Keep "Detect" first
        selectedInDropdown, // Put selected form second
        ...restDefault.slice(1, LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES - 1) // Fill remaining slots
      ];
    } else if (selectedInDropdown && !isSourceSelector) {
      // For target selector: [SelectedForm, ...others]
      return [
        selectedInDropdown, // Put selected form first
        ...defaultVisible.slice(1, LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES - 1) // Fill remaining slots
      ];
    }
    
    return defaultVisible;
  };
  
  const visibleForms = getVisibleOptions();
  const allDropdownOptions = allOptions.filter(([key]) => 
    !visibleForms.some(([visibleKey]) => visibleKey === key)
  );
  
  // Always add custom form and detect form to dropdown options so they're always available for selection
  const dropdownOptionsWithSpecial = [
    ...allDropdownOptions,
    [LANGUAGE_DISPLAY.CUSTOM_KEY, LANGUAGE_DISPLAY.CUSTOM_LABEL]
  ];
  
  // If detect form is not visible, add it to dropdown options
  if (!visibleForms.some(([key]) => key === LANGUAGE_DISPLAY.DETECT_KEY)) {
    dropdownOptionsWithSpecial.unshift([LANGUAGE_DISPLAY.DETECT_KEY, LANGUAGE_DISPLAY.DETECT_LABEL]);
  }
  
  const filteredOptions = dropdownOptionsWithSpecial.filter(([key, label]) => {
    if (!searchQuery.trim()) return true;
    const displayLabel = getDisplayLabel(key, label);
    return displayLabel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Smart sorting and distribution algorithm
  const dropdownOptions = optionsWithCategories ? 
    (() => {
      // Group forms by category
      const categoryGroups: Record<string, Array<[string, string]>> = {};
      const ungroupedForms: Array<[string, string]> = [];

      // Hard overrides to guarantee grouping for important families
      const religionKeys = new Set([
        'buddhism','hinduism','islam','christian','christianity','judaism','taoism','sikhism'
      ]);
      const ideologyKeys = new Set([
        'capitalism','communism','feudalism','socialism','anarchism','liberalism','conservatism'
      ]);

      // Normalize and canonicalize category labels so minor variations still group together
      const normalizeCategory = (raw?: string | null): string | null => {
        if (!raw) return null;
        let s = String(raw)
          .trim()
          .toLowerCase()
          .replace(/[\-_]+/g, ' ')
          .replace(/\s+/g, ' ');
        // Collapse trivial pluralization (religions -> religion)
        if (s.endsWith('s')) s = s.slice(0, -1);
        // Friendly aliases to help grouping similar domains
        const aliasMap: Record<string, string> = {
          'religion': 'religion',
          'economic system': 'economics',
          'economic': 'economics',
          'economics': 'economics',
          'political economy': 'economics'
        };
        return aliasMap[s] ?? s;
      };

      // Debug: Log all forms and their categories
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Debug: All forms with categories:', optionsWithCategories);
      }
      
      filteredOptions.forEach(([key, label]) => {
        if (key === LANGUAGE_DISPLAY.CUSTOM_KEY) return; // Handle custom separately
        
        const formOption = optionsWithCategories.find(opt => opt.key === key);
        let category = normalizeCategory(formOption?.category ?? null);

        // Key-based overrides come first to guarantee consistent grouping
        const keyLc = String(key).toLowerCase();
        if (religionKeys.has(keyLc)) category = 'religion';
        if (ideologyKeys.has(keyLc)) category = 'ideology';

        // Heuristic fallback: infer category from label when API category is missing
        if (!category) {
          const labelLc = String(label).trim().toLowerCase();
          const isReligion = ['buddhism', 'hinduism', 'islam', 'christian', 'christianity', 'judaism', 'taoism', 'sikhism']
            .some(name => labelLc.includes(name));
          const isEconomics = ['capitalism', 'communism', 'feudalism', 'socialism', 'anarchism']
            .some(name => labelLc.includes(name));
          const isAttunement = ['attunement']
            .some(name => labelLc.includes(name));
          if (isReligion) category = 'religion';
          else if (isEconomics) category = 'ideology';
          else if (isAttunement) category = 'attunement';
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Form: ${key}, Category: ${category}`);
        }
        
        if (category && category !== null && category !== '') {
          if (!categoryGroups[category]) {
            categoryGroups[category] = [];
          }
          categoryGroups[category].push([key, label]);
        } else {
          ungroupedForms.push([key, label]);
        }
      });
      
      // Debug: Log category groups
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Category groups:', categoryGroups);
        console.log('🔓 Ungrouped forms:', ungroupedForms);
      }
      
      // Sort forms within each category alphabetically
      Object.keys(categoryGroups).forEach(category => {
        categoryGroups[category].sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
      });
      
      // Sort categories alphabetically
      const sortedCategories = Object.keys(categoryGroups).sort();
      
      // Build category-contiguous blocks, then split into three columns with block awareness
      const result: Array<[string, string, { category?: string; isFirstInGroup?: boolean; isLastInGroup?: boolean }]> = [];
      const columns: Array<Array<[string, string, { category?: string; isFirstInGroup?: boolean; isLastInGroup?: boolean }]>> = [[], [], []];
      
      // Helper function to find the column with the least items
      const getLeastLoadedColumn = () => {
        let minCount = columns[0].length;
        let minIndex = 0;
        for (let i = 1; i < columns.length; i++) {
          if (columns[i].length < minCount) {
            minCount = columns[i].length;
            minIndex = i;
          }
        }
        return minIndex;
      };
      
      // Prepare blocks: start with ungrouped items as single-item blocks
      const categoryBlocks: Array<Array<[string, string, { category?: string; isFirstInGroup?: boolean; isLastInGroup?: boolean }]>> = [];
      const singleBlocks: Array<Array<[string, string, { category?: string; isFirstInGroup?: boolean; isLastInGroup?: boolean }]>> = [];
      ungroupedForms.forEach(([key, label]) => {
        singleBlocks.push([[key, label, {}]]);
      });
      
      // Append categories as contiguous blocks (for a continuous bracket line)
      sortedCategories.forEach(category => {
        const forms = categoryGroups[category];
        const block: Array<[string, string, { category?: string; isFirstInGroup?: boolean; isLastInGroup?: boolean }]> = [];
        forms.forEach(([key, label], index) => {
          block.push([key, label, {
            category,
            isFirstInGroup: index === 0,
            isLastInGroup: index === forms.length - 1,
          }]);
        });
        categoryBlocks.push(block);
      });
      
      // Phase A: place all category blocks first (top of each column), greedily balancing heights
      const colHeights = [0, 0, 0];
      const getTargetCol = () => {
        let idx = 0;
        for (let i = 1; i < 3; i++) if (colHeights[i] < colHeights[idx]) idx = i;
        return idx;
      };
      categoryBlocks.forEach(block => {
        const idx = getTargetCol();
        columns[idx].push(...block);
        colHeights[idx] += block.length;
      });

      // Phase B: distribute single (uncategorized) items to the bottom, balancing as we go
      singleBlocks.forEach(block => {
        const idx = getTargetCol();
        columns[idx].push(...block);
        colHeights[idx] += block.length;
      });
      
      if (mobileOnly) {
        // One-column order for mobile: categories (contiguous) first, then singles
        categoryBlocks.forEach(block => result.push(...block));
        singleBlocks.forEach(block => result.push(...block));
      } else {
        // Desktop: flatten columns row-wise for the 3-col grid
        const maxLen = Math.max(...columns.map(c => c.length));
        for (let r = 0; r < maxLen; r++) {
          for (let c = 0; c < 3; c++) {
            if (columns[c][r]) result.push(columns[c][r]);
          }
        }
      }
      
      // Add custom form at the end
      const customForm = filteredOptions.find(([key]) => key === LANGUAGE_DISPLAY.CUSTOM_KEY);
      if (customForm) {
        result.push([customForm[0], customForm[1], {}]);
      }
      
      return result;
    })() : 
    filteredOptions.map(([key, label]) => [key, label, {}]);

  // Handle language selection
  const handleLanguageSelect = (languageKey: string) => {
    if (languageKey === LANGUAGE_DISPLAY.CUSTOM_KEY) {
      // Start editing custom form in place, don't close dropdown yet
      setIsEditingCustom(true);
      return;
    }
    
    onChange(languageKey);
    
    if (onCustomFormChange) {
      onCustomFormChange({ isCustom: false, customText: customForm.customText });
    }
    
    setIsDropdownOpen(false);
    setSearchQuery(''); // Reset search when closing
    setIsEditingCustom(false);
  };
  
  // Handle custom form text change
  const handleCustomFormTextChange = (text: string) => {
    if (onCustomFormChange) {
      onCustomFormChange({ isCustom: true, customText: text });
    }
  };
  
  // Handle Enter key press to confirm custom form
  const handleCustomFormSubmit = () => {
    if (customForm.customText.trim()) {
      onChange(LANGUAGE_DISPLAY.CUSTOM_KEY);
      setIsDropdownOpen(false);
      setSearchQuery('');
      setIsEditingCustom(false);
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    const newIsOpen = !isDropdownOpen;
    setIsDropdownOpen(newIsOpen);
    if (!newIsOpen) {
      setSearchQuery(''); // Reset search when closing
    }
  };

  // Mobile version - custom dropdown (single-column panel)
  if (mobileOnly) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={handleDropdownToggle}
          disabled={disabled || isLoading || (value === LANGUAGE_DISPLAY.DETECT_KEY && isDetectingForm)}
          className="py-2 pl-0 pr-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap text-blue-600"
        >
          <span>
            {(() => {
              // Show loading state for detect form
              if (value === LANGUAGE_DISPLAY.DETECT_KEY && isDetectingForm) {
                return (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-blue-600 font-medium">detecting form...</span>
                  </div>
                );
              }
              
              // If we have a detected form, show it (regardless of current sourceForm value)
              if (detectedForm) {
                return detectedForm;
              }
              
              // Prefer visible label; fallback to full options map
              const opt = allOptions.find(([k]) => k === value);
              return opt ? getDisplayLabel(opt[0], opt[1]) : '';
            })()}
          </span>
          <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[70vh] overflow-y-auto w-[92vw]">
            <div className="p-3">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="search forms"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                />
              </div>
              <div className="grid grid-cols-1 gap-1 auto-rows-fr">
                {dropdownOptions.map((option, index) => {
                  const key = option[0];
                  const label = option[1];
                  const metadata = option[2] || {};
                  
                  const { category, isFirstInGroup, isLastInGroup } = metadata as { 
                    category?: string; 
                    isFirstInGroup?: boolean; 
                    isLastInGroup?: boolean; 
                  };
                  const isGrouped = !!category;

                  return (
                    <div key={String(key) || `option-${index}`} className="relative">
                      {/* Continuous visual indicator for grouped items */}
                      {isGrouped && (() => {
                        const gapPx = 4; // Tailwind gap-1 ≈ 4px
                        // Only extend downward to bridge the gap, avoid upward overlap
                        const topOffset = 0;
                        const bottomOffset = isLastInGroup ? 0 : -gapPx;
                        return (
                          <div className="absolute left-0" style={{ width: '2px', top: topOffset, bottom: bottomOffset }}>
                            {/* Vertical line spanning across gaps */}
                            <div className="absolute left-0 w-0.5 bg-gray-300 opacity-50" style={{ width: '2px', top: 0, bottom: 0 }}></div>
                            {/* Top horizontal cap only on first item */}
                            {isFirstInGroup && (
                              <div className="absolute left-0 w-2 h-0.5 bg-gray-300 opacity-50" style={{ width: '8px', height: '2px', top: 0 }}></div>
                            )}
                            {/* Bottom horizontal cap only on last item */}
                            {isLastInGroup && (
                              <div className="absolute left-0 w-2 h-0.5 bg-gray-300 opacity-50" style={{ width: '8px', height: '2px', bottom: 0 }}></div>
                            )}
                          </div>
                        );
                      })()}
                      <button
                        onClick={() => handleLanguageSelect(String(key))}
                        className={`
                          text-left py-2 text-sm rounded-md hover:bg-gray-50 transition-colors
                          h-10 w-full overflow-hidden whitespace-nowrap text-ellipsis
                          ${(() => {
                            const isDetectForm = key === LANGUAGE_DISPLAY.DETECT_KEY;
                            const isDetectedForm = detectedForm && key === detectedForm;
                            const isSelected = isDetectedForm || (value === key && !(isDetectForm && detectedForm));
                            return isSelected ? 'text-blue-600 bg-blue-50' : 'text-gray-700';
                          })()}
                          ${isGrouped ? 'px-2 pl-4' : 'px-3'}
                        `}
                      >
                        {getDisplayLabel(String(key), String(label))}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version - Google Translate style
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-1">
        {/* Visible language buttons */}
        {visibleForms.map(([key, label], index) => {
          // Smart selection logic: if we have a detected form and this is the detect button, don't highlight it
          // Instead, highlight the detected form button
          const isDetectForm = key === LANGUAGE_DISPLAY.DETECT_KEY;
          // Only highlight the detected form when the user selected "detect"
          const isDetectedForm = detectedForm && key === detectedForm && value === LANGUAGE_DISPLAY.DETECT_KEY;
          const isSelected = isDetectedForm || (value === key && !(isDetectForm && detectedForm));
          const displayLabel = getDisplayLabel(key, label);
          const isFirst = index === 0;
          
          return (
            <button
              key={String(key)}
              onClick={() => handleLanguageSelect(String(key))}
              disabled={disabled || (isDetectForm && isDetectingForm)}
              className={`
                ${isFirst ? 'pl-0 pr-4' : 'px-4'} py-2 text-sm font-medium transition-colors whitespace-nowrap
                ${isSelected 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${isDetectForm && isDetectingForm ? 'cursor-not-allowed' : ''}
              `}
            >
              <span className={isSelected ? 'border-b-2 border-blue-600 pb-1' : ''}>
                {isDetectForm && isDetectingForm ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-blue-600 font-medium">detecting form</span>
                  </div>
                ) : (
                  displayLabel
                )}
              </span>
            </button>
          );
        })}

        {/* Dropdown button for remaining languages */}
        {dropdownOptionsWithSpecial.length > 0 && (
          <div className="relative">
            <button
              onClick={handleDropdownToggle}
              disabled={disabled}
              className={`
                ${dropdownAlign === 'right' ? 'px-2 pr-1' : 'px-4'} py-2 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap
                ${dropdownOptionsWithSpecial.some(([key]) => key === value) && value !== LANGUAGE_DISPLAY.CUSTOM_KEY
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {value !== LANGUAGE_DISPLAY.CUSTOM_KEY && dropdownOptionsWithSpecial.find(([key]) => key === value)?.[1] ? (
                <span className={dropdownOptionsWithSpecial.some(([key]) => key === value) ? 'border-b-2 border-blue-600 pb-1' : ''}>
                  {(() => {
                    const found = dropdownOptionsWithSpecial.find(([key]) => key === value);
                    return found ? getDisplayLabel(found[0], found[1]) : '';
                  })()}
                </span>
              ) : null}
              <svg 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

          </div>
        )}
      </div>
      
      {/* Dropdown menu - positioned relative to entire DropdownSelector */}
      {isDropdownOpen && dropdownOptionsWithSpecial.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[80vh] overflow-y-auto w-[600px] max-w-[95vw]">
                <div className="p-4">
                  {/* Search box */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="search forms"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                  </div>
                  
                  {/* Languages grid - three columns with block-aware splitting */}
                  <div className="grid grid-cols-3 gap-1 auto-rows-fr">
                    {dropdownOptions.map((option, index) => {
                      // Handle new option structure with grouping metadata
                      const key = option[0];
                      const label = option[1];
                      const metadata = option[2] || {};
                      
                      const { category, isFirstInGroup, isLastInGroup } = metadata as { 
                        category?: string; 
                        isFirstInGroup?: boolean; 
                        isLastInGroup?: boolean; 
                      };
                      const isGrouped = !!category;
                      // If this is custom form and we're editing it, show input instead of button
                      if (key === LANGUAGE_DISPLAY.CUSTOM_KEY && isEditingCustom) {
                        return (
                          <div
                            key={String(key)}
                            className="px-3 py-2 text-sm rounded-md hover:bg-gray-50 h-10 w-full flex items-center"
                          >
                            <input
                              type="text"
                              value={customForm.customText}
                              onChange={(e) => handleCustomFormTextChange(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCustomFormSubmit();
                                } else if (e.key === 'Escape') {
                                  setIsEditingCustom(false);
                                }
                              }}
                              placeholder="type your own form"
                              className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                              disabled={disabled}
                              autoFocus
                            />
                          </div>
                        );
                      }
                      
                      // Regular button for all other forms (including unselected custom form)
                      
                      return (
                        <div key={String(key) || `option-${index}`} className="relative">
                          {/* Continuous visual indicator for grouped items */}
                          {isGrouped && (() => {
                            const gapPx = 4; // Tailwind gap-1 ≈ 4px
                            // Only extend downward to bridge the gap, avoid upward overlap
                            const topOffset = 0;
                            const bottomOffset = isLastInGroup ? 0 : -gapPx;
                            return (
                              <div className="absolute left-0" style={{ width: '2px', top: topOffset, bottom: bottomOffset }}>
                                {/* Vertical line spanning across gaps */}
                                <div className="absolute left-0 w-0.5 bg-gray-300 opacity-50" style={{ width: '2px', top: 0, bottom: 0 }}></div>
                                {/* Top horizontal cap only on first item */}
                                {isFirstInGroup && (
                                  <div className="absolute left-0 w-2 h-0.5 bg-gray-300 opacity-50" style={{ width: '8px', height: '2px', top: 0 }}></div>
                                )}
                                {/* Bottom horizontal cap only on last item */}
                                {isLastInGroup && (
                                  <div className="absolute left-0 w-2 h-0.5 bg-gray-300 opacity-50" style={{ width: '8px', height: '2px', bottom: 0 }}></div>
                                )}
                              </div>
                            );
                          })()}
                          <button
                            onClick={() => handleLanguageSelect(String(key))}
                            className={`
                              text-left py-2 text-sm rounded-md hover:bg-gray-50 transition-colors
                              h-10 w-full overflow-hidden whitespace-nowrap text-ellipsis
                              ${(() => {
                                const isDetectForm = key === LANGUAGE_DISPLAY.DETECT_KEY;
                                const isDetectedForm = detectedForm && key === detectedForm;
                                const isSelected = isDetectedForm || (value === key && !(isDetectForm && detectedForm));
                                return isSelected && key !== LANGUAGE_DISPLAY.CUSTOM_KEY ? 'text-blue-600 bg-blue-50' : 'text-gray-700';
                              })()}
                              ${isGrouped ? 'px-2 pl-4' : 'px-3'}
                            `}
                          >
                            {getDisplayLabel(String(key), String(label))}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
        </div>
      )}
    </div>
  );
}

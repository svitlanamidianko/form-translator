// Dropdown Selector Component - Google Translate style with multiple visible languages
// This is like creating a reusable widget class in Python that shows multiple options

import { useState, useRef, useEffect } from 'react';
import { LANGUAGE_DISPLAY } from '@/constants';
import type { CustomFormState } from '@/types';

interface DropdownSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  mobileOnly?: boolean;
  isSourceSelector?: boolean; // To determine if we should show "Detect" button
  dropdownAlign?: 'left' | 'right'; // Controls dropdown alignment
  customForm?: CustomFormState; // Custom form state
  onCustomFormChange?: (customForm: CustomFormState) => void; // Custom form change handler
}

export default function DropdownSelector({
  value,
  onChange,
  options,
  isLoading = false,
  disabled = false,
  className = "",
  mobileOnly = false,
  isSourceSelector = false,
  dropdownAlign = 'left',
  customForm = { isCustom: false, customText: '' },
  onCustomFormChange,
}: DropdownSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to extract just the form name (before the dash)
  const getDisplayLabel = (key: string, label: string) => {
    if (key === LANGUAGE_DISPLAY.DETECT_KEY || key === LANGUAGE_DISPLAY.CUSTOM_KEY) {
      return label;
    }
    return label.split(' - ')[0];
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
        <span>loading forms...</span>
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
  
  // Add custom form to dropdown options only if it's not currently selected
  const dropdownOptionsWithCustom = [
    ...allDropdownOptions,
    ...(value !== LANGUAGE_DISPLAY.CUSTOM_KEY ? [[LANGUAGE_DISPLAY.CUSTOM_KEY, LANGUAGE_DISPLAY.CUSTOM_LABEL]] : [])
  ];
  
  const dropdownOptions = dropdownOptionsWithCustom.filter(([key, label]) => {
    if (!searchQuery.trim()) return true;
    const displayLabel = getDisplayLabel(key, label);
    return displayLabel.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

  // Mobile version - simple dropdown
  if (mobileOnly) {
    return (
      <div className={`relative ${className}`}>
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="appearance-none bg-transparent border-0 text-sm font-medium text-blue-600 hover:text-blue-800 pr-6 cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allOptions.map(([key, label]) => (
            <option key={key} value={key}>
              {getDisplayLabel(key, label)}
            </option>
          ))}
        </select>
        <svg 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  }

  // Desktop version - Google Translate style
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-1">
        {/* Visible language buttons */}
        {visibleForms.map(([key, label], index) => {
          const isSelected = value === key;
          const displayLabel = getDisplayLabel(key, label);
          const isFirst = index === 0;
          
          return (
            <button
              key={key}
              onClick={() => handleLanguageSelect(key)}
              disabled={disabled}
              className={`
                ${isFirst ? 'pl-0 pr-4' : 'px-4'} py-2 text-sm font-medium transition-colors whitespace-nowrap
                ${isSelected 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <span className={isSelected ? 'border-b-2 border-blue-600 pb-1' : ''}>
                {displayLabel}
              </span>
            </button>
          );
        })}

        {/* Dropdown button for remaining languages */}
        {allDropdownOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={handleDropdownToggle}
              disabled={disabled}
              className={`
                ${dropdownAlign === 'right' ? 'px-2 pr-1' : 'px-4'} py-2 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap
                ${allDropdownOptions.some(([key]) => key === value)
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {allDropdownOptions.find(([key]) => key === value)?.[1] ? (
                <span className={allDropdownOptions.some(([key]) => key === value) ? 'border-b-2 border-blue-600 pb-1' : ''}>
                  {(() => {
                    const found = allDropdownOptions.find(([key]) => key === value);
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
      {isDropdownOpen && allDropdownOptions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[80vh] overflow-y-auto w-[600px] max-w-[95vw]">
                <div className="p-4">
                  {/* Search box */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="search forms"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Languages grid */}
                  <div className="grid grid-cols-3 gap-1 auto-rows-fr">
                    {dropdownOptions.map(([key, label]) => {
                      // If this is custom form and we're editing it, show input instead of button
                      if (key === LANGUAGE_DISPLAY.CUSTOM_KEY && isEditingCustom) {
                        return (
                          <div
                            key={key}
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
                        <button
                          key={key}
                          onClick={() => handleLanguageSelect(key)}
                          className={`
                            text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors
                            h-10 w-full overflow-hidden whitespace-nowrap text-ellipsis
                            ${value === key && key !== LANGUAGE_DISPLAY.CUSTOM_KEY ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}
                          `}
                        >
                          {getDisplayLabel(key, label)}
                        </button>
                      );
                    })}
                  </div>
                </div>
        </div>
      )}
    </div>
  );
}

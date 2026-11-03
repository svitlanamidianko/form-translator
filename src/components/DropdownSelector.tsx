// Dropdown Selector Component - Google Translate style with multiple visible languages
// This is like creating a reusable widget class in Python that shows multiple options

import { useState, useRef, useEffect } from 'react';
import { LANGUAGE_DISPLAY, FORM_SECTIONS } from '@/constants';
import type { CustomFormState, FormOption, FormSection } from '@/types';
import { useCyclingLoadingMessage } from '@/hooks/useCyclingLoadingMessage';
import { buildFormSections, normalizeFormName } from '@/utils/formSections';

interface DropdownSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  optionsWithCategories?: FormOption[]; // Forms with group + order info (preferred)
  groups?: string[]; // Semantic group names in sheet order (from GET /forms)
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  mobileOnly?: boolean;
  isSourceSelector?: boolean; // Only the source (input) selector gets the "detect form" option
  dropdownAlign?: 'left' | 'right'; // Controls dropdown alignment
  customForm?: CustomFormState; // Custom form state
  onCustomFormChange?: (customForm: CustomFormState) => void; // Custom form change handler
  isDetectingForm?: boolean; // Form detection loading state
  detectedForm?: string | null; // Detected form to show as new button
  suggestedForms?: string[]; // Target side: forms that pair well with the text (from /detect-form)
}

// A visible quick-pick button: the key we select + the text we show
// This is like a tiny namedtuple QuickPick(key, label) in Python
interface QuickPick {
  key: string;
  label: string;
}

// Cycling loading messages for engaging user experience
// (defined outside the component so the list isn't re-created on every render)
const LOADING_MESSAGES = [
  "loading forms, it's quick 🚀",
  "unless Form Translator is sleepy😴",
  "don't give up 🥹 loading forms should be done in seconds",
  "dooby kooby dooo mee loo.."
];

export default function DropdownSelector({
  value,
  onChange,
  options,
  optionsWithCategories,
  groups = [],
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
  suggestedForms = [],
}: DropdownSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLoadingMessage = useCyclingLoadingMessage({
    isActive: isLoading,
    messages: LOADING_MESSAGES,
    intervalMs: 2000 // 2 seconds per message
  });

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

  // All real forms, sorted by their position in the sheet.
  // "detect" and "custom" are special buttons, so they never appear as normal forms.
  // (If we only got the plain {key: label} map, we keep its order.)
  const specialKeys = new Set<string>([LANGUAGE_DISPLAY.DETECT_KEY, LANGUAGE_DISPLAY.CUSTOM_KEY]);
  const orderedForms: FormOption[] = (
    optionsWithCategories && optionsWithCategories.length > 0
      ? [...optionsWithCategories].sort((a, b) => a.order - b.order)
      : Object.entries(options).map(([key, label], index) => ({
          key,
          label,
          category: null,
          userSubmitted: false,
          order: index,
        }))
  ).filter((form) => !specialKeys.has(normalizeFormName(form.key)));

  // Find a form by key (exact first, then ignoring case/extra spaces)
  const findForm = (key: string): FormOption | undefined =>
    orderedForms.find((form) => form.key === key) ??
    orderedForms.find((form) => normalizeFormName(form.key) === normalizeFormName(key));

  // Is this key the one that should look "selected"?
  const isKeySelected = (key: string): boolean => {
    if (key === LANGUAGE_DISPLAY.CUSTOM_KEY) return value === LANGUAGE_DISPLAY.CUSTOM_KEY;
    if (isSourceSelector && value === LANGUAGE_DISPLAY.DETECT_KEY && detectedForm) {
      // After detection we highlight the detected form instead of the "detect" button
      return normalizeFormName(key) === normalizeFormName(detectedForm);
    }
    return key === value;
  };

  // Suggested forms that really are in the list (sheet spelling), only on the target side
  const suggestedOptions: FormOption[] = isSourceSelector
    ? []
    : suggestedForms
        .map((name) => findForm(name))
        .filter((form): form is FormOption => !!form)
        .filter((form, index, list) => list.indexOf(form) === index);

  // Visible quick-pick buttons (desktop): the suggested forms for this text, or else the first
  // forms from the sheet, plus the currently selected one if it isn't among them (it goes first).
  // The source side always starts with "detect form ✨". "detect" never appears on the target side.
  const getQuickPicks = (): QuickPick[] => {
    const quickPickCount = LANGUAGE_DISPLAY.MAX_VISIBLE_LANGUAGES - 1; // 3 forms
    let picks: QuickPick[] = (suggestedOptions.length > 0 ? suggestedOptions : orderedForms)
      .slice(0, quickPickCount)
      .map((form) => ({ key: form.key, label: form.key }));

    // Work out what is selected right now
    let selected: QuickPick | null = null;
    if (value === LANGUAGE_DISPLAY.CUSTOM_KEY) {
      selected = { key: LANGUAGE_DISPLAY.CUSTOM_KEY, label: customForm.customText || LANGUAGE_DISPLAY.CUSTOM_LABEL };
    } else if (value === LANGUAGE_DISPLAY.DETECT_KEY) {
      if (isSourceSelector && detectedForm) {
        selected = { key: detectedForm, label: detectedForm };
      }
    } else if (value) {
      const form = findForm(value);
      selected = { key: value, label: form ? form.key : value };
    }

    // Only add it if it's not already visible (no duplicates!)
    if (selected) {
      const selectedName = normalizeFormName(selected.key);
      if (!picks.some((pick) => normalizeFormName(pick.key) === selectedName)) {
        picks = [selected, ...picks].slice(0, quickPickCount);
      }
    }

    if (isSourceSelector) {
      return [{ key: LANGUAGE_DISPLAY.DETECT_KEY, label: LANGUAGE_DISPLAY.DETECT_LABEL }, ...picks];
    }
    return picks;
  };

  const quickPicks = getQuickPicks();

  // Sections for the dropdown: suggestions for this text first (not while searching),
  // then one per group, then "more forms", then "added by visitors"
  const sections: FormSection[] = [
    ...(suggestedOptions.length > 0 && !searchQuery.trim()
      ? [{ id: 'suggested', title: FORM_SECTIONS.SUGGESTED_TITLE, forms: suggestedOptions }]
      : []),
    ...buildFormSections(orderedForms, groups, searchQuery),
  ];

  // Mobile has no quick-pick buttons, so "detect" lives at the top of the mobile list (only once)
  const showDetectInList =
    mobileOnly &&
    isSourceSelector &&
    (!searchQuery.trim() || LANGUAGE_DISPLAY.DETECT_LABEL.includes(searchQuery.trim().toLowerCase()));

  // Close the dropdown and reset its little states
  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setSearchQuery(''); // Reset search when closing
    setIsEditingCustom(false);
  };

  // Handle language selection
  const handleLanguageSelect = (languageKey: string) => {
    if (languageKey === LANGUAGE_DISPLAY.CUSTOM_KEY) {
      // If the user searched for something we don't have, start the custom form with that text
      if (!customForm.customText.trim() && searchQuery.trim() && onCustomFormChange) {
        onCustomFormChange({ isCustom: true, customText: searchQuery.trim() });
      }
      // Start editing custom form in place, don't close dropdown yet
      setIsEditingCustom(true);
      setIsDropdownOpen(true);
      return;
    }

    onChange(languageKey);

    if (onCustomFormChange) {
      onCustomFormChange({ isCustom: false, customText: customForm.customText });
    }

    closeDropdown();
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
      closeDropdown();
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      setIsDropdownOpen(true);
    }
  };

  // ---------- small render helpers (shared by mobile + desktop) ----------

  // One form button inside the dropdown
  const renderFormButton = (form: FormOption, wrapText: boolean) => {
    const isSelected = isKeySelected(form.key);
    return (
      <button
        key={form.key}
        type="button"
        onClick={() => handleLanguageSelect(form.key)}
        title={form.label}
        className={`
          text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors w-full
          ${wrapText ? 'min-h-10 leading-snug break-words' : 'h-10 overflow-hidden whitespace-nowrap text-ellipsis'}
          ${isSelected ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}
        `}
      >
        {form.key}
      </button>
    );
  };

  const renderSearchBox = () => (
    <div className="mb-3">
      <input
        type="text"
        placeholder="search forms"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeDropdown();
        }}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
      />
    </div>
  );

  // All sections with a small muted heading each, forms in a responsive grid
  const renderSections = (gridClassName: string, wrapText: boolean) => (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id}>
          <div className="px-3 pb-1 text-xs font-medium text-gray-400 lowercase tracking-wide break-words">
            {section.title}
          </div>
          <div className={`grid gap-1 ${gridClassName}`}>
            {section.forms.map((form) => renderFormButton(form, wrapText))}
          </div>
        </div>
      ))}
      {sections.length === 0 && searchQuery.trim() && (
        <p className="px-3 py-2 text-sm text-gray-400">
          no forms match &quot;{searchQuery.trim()}&quot; - make it a custom form below 🪄
        </p>
      )}
    </div>
  );

  // "custom form 🪄" - always last. Clicking it turns it into a little text input.
  const renderCustomEntry = () => (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {isEditingCustom ? (
        <div className="px-3 h-10 w-full flex items-center gap-2 rounded-md bg-gray-50">
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
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            disabled={disabled}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCustomFormSubmit}
            disabled={disabled || !customForm.customText.trim()}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
          >
            use ↵
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleLanguageSelect(LANGUAGE_DISPLAY.CUSTOM_KEY)}
          className="text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors h-10 w-full text-gray-700"
        >
          {LANGUAGE_DISPLAY.CUSTOM_LABEL}
        </button>
      )}
    </div>
  );

  // What the mobile button shows as the current choice
  const getMobileButtonLabel = (): string => {
    if (value === LANGUAGE_DISPLAY.CUSTOM_KEY) return customForm.customText || LANGUAGE_DISPLAY.CUSTOM_LABEL;
    if (value === LANGUAGE_DISPLAY.DETECT_KEY) return detectedForm || LANGUAGE_DISPLAY.DETECT_LABEL;
    const form = findForm(value);
    return form ? form.key : value;
  };

  // Mobile version - custom dropdown (one panel with all sections)
  if (mobileOnly) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={handleDropdownToggle}
          disabled={disabled || isLoading || (value === LANGUAGE_DISPLAY.DETECT_KEY && isDetectingForm)}
          className="py-2 pl-0 pr-3 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap text-blue-600 max-w-full"
        >
          {value === LANGUAGE_DISPLAY.DETECT_KEY && isDetectingForm ? (
            // Show loading state for detect form
            <span className="flex items-center space-x-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
              <span className="text-blue-600 font-medium">detecting form...</span>
            </span>
          ) : (
            <span className="truncate">{getMobileButtonLabel()}</span>
          )}
          <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          // Width = screen width minus the 1rem page padding on each side, so it never sticks out
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[70vh] overflow-y-auto w-[calc(100vw-2rem)]">
            <div className="p-3">
              {renderSearchBox()}

              {showDetectInList && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => handleLanguageSelect(LANGUAGE_DISPLAY.DETECT_KEY)}
                    className={`
                      text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors min-h-10 w-full
                      ${value === LANGUAGE_DISPLAY.DETECT_KEY ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}
                    `}
                  >
                    {LANGUAGE_DISPLAY.DETECT_LABEL}
                  </button>
                </div>
              )}

              {renderSections('grid-cols-2 sm:grid-cols-3', true)}
              {renderCustomEntry()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version - Google Translate style
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-1 min-w-0">
        {/* Visible language buttons */}
        {quickPicks.map((pick, index) => {
          const isDetectButton = pick.key === LANGUAGE_DISPLAY.DETECT_KEY;
          const isSelected = isKeySelected(pick.key);
          const isFirst = index === 0;
          const form = findForm(pick.key);

          return (
            <button
              key={pick.key}
              type="button"
              onClick={() => handleLanguageSelect(pick.key)}
              disabled={disabled || (isDetectButton && isDetectingForm)}
              title={form ? form.label : pick.label}
              className={`
                ${isFirst ? 'pl-0 pr-4' : 'px-4'} py-2 text-sm font-medium transition-colors whitespace-nowrap min-w-0
                ${isSelected
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${isDetectButton && isDetectingForm ? 'cursor-not-allowed' : ''}
              `}
            >
              {/* max width + "..." so very long form names can't push the panel wider */}
              <span className={`block max-w-[11rem] truncate border-b-2 pb-1 ${isSelected ? 'border-blue-600' : 'border-transparent'}`}>
                {isDetectButton && isDetectingForm ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
                    <span className="text-blue-600 font-medium">detecting form</span>
                  </span>
                ) : (
                  pick.label
                )}
              </span>
            </button>
          );
        })}

        {/* Dropdown button for all forms (grouped) + custom form */}
        <button
          type="button"
          onClick={handleDropdownToggle}
          disabled={disabled}
          aria-label="all forms"
          aria-expanded={isDropdownOpen}
          className={`
            ${dropdownAlign === 'right' ? 'px-2 pr-1' : 'px-4'} py-2 text-sm font-medium transition-colors flex flex-shrink-0 items-center whitespace-nowrap rounded
            ${isDropdownOpen ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
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

      {/* Dropdown menu - positioned relative to entire DropdownSelector.
          Output side ('right') anchors to the right edge so it never runs off the screen,
          and the width is capped to the screen width. */}
      {isDropdownOpen && (
        <div
          className={`
            absolute top-full ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} mt-1
            bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[70vh] overflow-y-auto
            w-[640px] max-w-[calc(100vw-2rem)]
          `}
        >
          <div className="p-4">
            {renderSearchBox()}
            {renderSections('grid-cols-3', false)}
            {renderCustomEntry()}
          </div>
        </div>
      )}
    </div>
  );
}

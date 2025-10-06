// Application Constants
// This is like having a constants.py file in Python

export const UI_CONSTANTS = {
  MAX_TEXT_LENGTH: 5000,
  DEBOUNCE_DELAY: 1500, // milliseconds
  ANIMATION_DURATION: 200, // milliseconds
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'network error occurred. please check your connection. unknown error. if it bugs you too much, please msg me (svitlanaing@gmail.com) (or submit in upper right menu:)',
  TRANSLATION_FAILED: 'translation failed. please try again.unknown error. if it bugs you too much, please msg me (svitlanaing@gmail.com) (or submit in upper right menu:)',
  FORMS_LOAD_FAILED: 'failed to load available forms. please refresh the page. unknown error. if it bugs you too much, please msg me (svitlanaing@gmail.com) (or submit in upper right menu:)',
  GENERIC_ERROR: 'unexpected error occurred. please try again.unknown error. if it bugs you too much, please msg me (svitlanaing@gmail.com) (or submit in upper right menu:)',
} as const;

// Language display constants for Google Translate-style selector
export const LANGUAGE_DISPLAY = {
  DETECT_KEY: 'detect',
  DETECT_LABEL: 'detect form ✨',
  CUSTOM_KEY: 'custom',
  CUSTOM_LABEL: 'custom form 🪄',
  MAX_VISIBLE_LANGUAGES: 4, // Show detect form + 3 forms to prevent overflow with long names
} as const;
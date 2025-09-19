// Application Constants
// This is like having a constants.py file in Python

export const UI_CONSTANTS = {
  MAX_TEXT_LENGTH: 5000,
  DEBOUNCE_DELAY: 1500, // milliseconds
  ANIMATION_DURATION: 200, // milliseconds
} as const;

export const API_ENDPOINTS = {
  TRANSLATE: '/translate',
  FORMS: '/forms',
  HEALTH: '/health',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TRANSLATION_FAILED: 'Translation failed. Please try again.',
  FORMS_LOAD_FAILED: 'Failed to load available forms. Please refresh the page.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  TRANSLATION_COMPLETE: 'Translation completed successfully',
  FORMS_LOADED: 'Forms loaded successfully',
} as const;

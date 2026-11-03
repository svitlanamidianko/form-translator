// Application Constants
// This is like having a constants.py file in Python

export const UI_CONSTANTS = {
  MAX_TEXT_LENGTH: 5000,
  DEBOUNCE_DELAY: 1500, // milliseconds
  ANIMATION_DURATION: 200, // milliseconds
} as const;

// The friendly "write me" line we add to the end of error messages
export const CONTACT_NOTE = 'if it bugs you too much, please msg me (svitlanaing@gmail.com) (or submit in upper right menu:)';

export const ERROR_MESSAGES = {
  NETWORK_ERROR: `network error occurred. please check your connection. unknown error. ${CONTACT_NOTE}`,
  TRANSLATION_FAILED: `translation failed. please try again. unknown error. ${CONTACT_NOTE}`,
  FORMS_LOAD_FAILED: `failed to load available forms. please refresh the page. unknown error. ${CONTACT_NOTE}`,
  GENERIC_ERROR: `unexpected error occurred. please try again. unknown error. ${CONTACT_NOTE}`,
} as const;

// Language display constants for Google Translate-style selector
export const LANGUAGE_DISPLAY = {
  DETECT_KEY: 'detect',
  DETECT_LABEL: 'detect form ✨',
  CUSTOM_KEY: 'custom',
  CUSTOM_LABEL: 'custom form 🪄',
  MAX_VISIBLE_LANGUAGES: 4, // Show detect form + 3 forms to prevent overflow with long names
} as const;

// Section titles inside the forms dropdown (lowercase, like the rest of the site)
export const FORM_SECTIONS = {
  UNGROUPED_TITLE: 'more forms', // curated forms that don't have a group yet
  ALL_FORMS_TITLE: 'all forms', // used instead of "more forms" when there are no groups at all
  VISITOR_TITLE: 'added by visitors', // forms visitors created via "custom form" (without a group)
} as const;

// Photo translation (images tab) settings
export const IMAGE_UPLOAD = {
  MAX_ORIGINAL_BYTES: 10 * 1024 * 1024, // 10 MB - same limit as the backend
  MAX_SIDE_PX: 1536, // we shrink photos so the longest side is at most this many pixels
  JPEG_QUALITY: 0.9, // 0..1, quality used when re-encoding to jpeg
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

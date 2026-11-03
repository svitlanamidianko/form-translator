// Centralized Type Definitions
// This is like having a types.py file in Python with all your data models

export interface TranslationRequest {
  inputText: string;  // Changed from sourceText to match backend expectation
  sourceForm: string;
  targetForm: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceForm: string;
  targetForm: string;
  confidence?: number;
}

// New form structure from your updated API
// (named FormData like before, but note: it is NOT the browser's built-in FormData class)
export interface FormData {
  category: string | null; // semantic group from column E of the sheet (e.g. "religion"), or null
  description: string; // "<form name> - <ukrainian name>"
  userSubmitted?: boolean; // true when a visitor added this form (custom form)
  order?: number; // 0-based position of the row in the sheet - this is the order we show forms in
}

export interface FormsResponse {
  count: number;
  forms: Record<string, FormData>;
  groups?: string[]; // group names in the order they first appear in the sheet
  timestamp: string;
  note?: string;
  source?: string;
}

export interface APIError {
  message: string;
  status?: number;
  response?: unknown;
}

// UI Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SelectOption {
  key: string;
  label: string;
  value: string;
}

// Enhanced form option with category information
export interface FormOption {
  key: string;
  label: string;
  category: string | null; // semantic group (null = no group)
  userSubmitted: boolean; // added by a visitor
  order: number; // position in the sheet (lower = shown first)
}

// One titled block of forms inside the dropdown (e.g. "religion" with its forms)
// This is like a small dataclass FormSection(id, title, forms) in Python
export interface FormSection {
  id: string;
  title: string;
  forms: FormOption[];
}

// Custom form types for user-defined forms
export interface CustomFormState {
  isCustom: boolean;
  customText: string;
}

// Translation History Types
export interface TranslationHistoryItem {
  id: string;
  inputText: string;  // Changed from sourceText for consistency
  targetText: string;
  sourceForm: string;
  targetForm: string;
  timestamp: Date;
  starCount?: number; // Optional star count from API
}

export interface HistoryComponentProps {
  isOpen: boolean;
  onToggle: () => void;
  historyItems: TranslationHistoryItem[];
}

// API History Response Types - matching your backend structure
export interface APIHistoryItem {
  datetime: string;
  id: string;
  is_starred?: string;
  source_form: string;
  source_form_id: string;
  source_text: string;
  target_form: string;
  target_form_id: string;
  target_text: string;
  stars_count?: number; // Match your backend's field name (plural)
}

export interface HistoryAPIResponse {
  count: number;
  history: APIHistoryItem[];
  sorted_by: string;
  source: string;
  timestamp: string;
}

// Star API Types - for server communication
export interface StarRequest {
  translationId: string;
  action: 'star' | 'unstar'; // Tell server to add or remove a star
}

export interface StarResponse {
  translationId: string;
  totalStars: number; // Global count from all users
  success?: boolean; // Optional - assume success if not false
  message?: string;
}

// Response type for GET /star/{id} endpoint
export interface StarCountResponse {
  translationId: string;
  totalStars: number;
  timestamp: string; // Your backend includes timestamp
}

// Interest Tracking Types - for tracking user interest in future features
export interface InterestTrackingRequest {
  what: 'images' | 'websites';
  timestamp: string;
}

export interface InterestTrackingResponse {
  success: boolean;
  message?: string;
  recordId?: string; // The unique ID of the interest record
  what?: string; // The content type that was tracked
  timestamp?: string; // When the interest was recorded
}

// Form Detection API Types
export interface DetectFormRequest {
  text: string;
}

export interface AlternativeForm {
  form: string;
  confidence: number;
}

export interface DetectFormResponse {
  detectedForm: string;
  reasoning: string;
  isCustomForm: boolean;
  confidence?: number;
  alternativeForms: AlternativeForm[];
  suggestedForms?: string[]; // forms from the sheet that pair well as targets (never the detected one)
}

// Photo translation API Types - POST /translate-image (multipart/form-data)
export interface ImageTranslationRequest {
  image: Blob; // the (already downscaled) jpeg we upload
  fileName?: string;
  targetForm: string;
  sourceForm?: string; // optional, just informational for the backend
}

export interface ImageTranslationResponse {
  imageBase64: string; // the generated picture as base64 (no "data:" prefix)
  mimeType: string; // e.g. "image/jpeg"
  targetForm: string;
  timestamp: string;
}

// Centralized Type Definitions
// This is like having a types.py file in Python with all your data models

export interface TranslationRequest {
  sourceText: string;
  sourceForm: string;
  targetForm: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceForm: string;
  targetForm: string;
  confidence?: number;
}

export interface FormsResponse {
  count: number;
  forms: Record<string, string>;
  timestamp: string;
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

// Translation History Types
export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
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
  contentType: 'images' | 'websites';
  timestamp: string;
}

export interface InterestTrackingResponse {
  success: boolean;
  message?: string;
  totalInterest?: number; // Optional: total count of interest for this content type
}

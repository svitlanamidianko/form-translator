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
  response?: any;
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
  is_starred: string;
  source_form: string;
  source_form_id: string;
  source_text: string;
  target_form: string;
  target_form_id: string;
  target_text: string;
}

export interface HistoryAPIResponse {
  count: number;
  history: APIHistoryItem[];
  sorted_by: string;
  source: string;
  timestamp: string;
}

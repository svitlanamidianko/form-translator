// API Service Layer
// This is like having a separate api.py file in Python to handle all HTTP requests

import { API_URL, isDevelopment } from '@/config/environment';
import { LANGUAGE_DISPLAY, CONTACT_NOTE } from '@/constants';

// Import types from centralized location
import type { TranslationRequest, TranslationResponse, FormsResponse, HistoryAPIResponse, StarRequest, StarResponse, StarCountResponse, InterestTrackingResponse, DetectFormRequest, DetectFormResponse, ImageTranslationRequest, ImageTranslationResponse } from '@/types';

// API Error class - similar to creating custom exceptions in Python
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
    public retryAfterSeconds?: number // only set for 429 "slow down" errors
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Pull the human readable reason out of an error body like {"error": "..."}
// This is like body.get("error") or body.get("message") in Python
function getBackendErrorMessage(body: unknown): string | null {
  if (body && typeof body === 'object') {
    const { error, message } = body as { error?: unknown; message?: unknown };
    if (typeof error === 'string' && error.trim()) return error.trim();
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return null;
}

// How many seconds the backend wants us to wait (from the JSON body or the Retry-After header)
function getRetryAfterSeconds(body: unknown, response: Response): number | undefined {
  const fromBody = body && typeof body === 'object'
    ? Number((body as { retryAfterSeconds?: unknown }).retryAfterSeconds)
    : NaN;
  if (Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody);

  const fromHeader = Number(response.headers.get('Retry-After'));
  if (Number.isFinite(fromHeader) && fromHeader > 0) return Math.ceil(fromHeader);

  return undefined;
}

// Get the real reason out of any error (APIError, normal Error, or something weird)
export function getErrorReason(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  if (typeof err === 'string') return err.trim();
  return '';
}

// Build a friendly error text that still shows the REAL reason
// This is like f"{what}: {reason}. {hint} {CONTACT_NOTE}" in Python
export function friendlyErrorMessage(what: string, err: unknown, hint = 'please try again.'): string {
  const reason = getErrorReason(err).replace(/[.\s]+$/, ''); // drop a trailing "." so we don't get ".."
  if (!reason) return `${what}. unknown error. ${hint} ${CONTACT_NOTE}`;

  // The backend often already says what failed ("Translation failed: ...") - then we don't say it twice
  const alreadySaysWhat = /^[^:]*\bfail[^:]*:/i.test(reason);
  // ...and sometimes it already says "Please try again" too
  const alreadyHasHint = reason.toLowerCase().includes(hint.replace(/[.\s]+$/, '').toLowerCase());

  const message = alreadySaysWhat ? `${reason}.` : `${what}: ${reason}.`;
  return alreadyHasHint ? `${message} ${CONTACT_NOTE}` : `${message} ${hint} ${CONTACT_NOTE}`;
}

// Simplified API client - focused on what we actually need
// This is like having a focused api_client.py in Python
class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Generic request method - simplified and focused
  // data can be a normal object (sent as JSON) or a FormData (sent as multipart/form-data, for files)
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    // FormData = file upload. This is like requests.post(url, files=...) instead of json=... in Python
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    if (isDevelopment()) {
      console.log(`🌐 API Request: ${method} ${url}`);
      if (data) console.log('📤 Request data:', isFormData ? '(multipart form data)' : data);
    }

    try {
      const response = await fetch(url, {
        method,
        // For FormData we must NOT set Content-Type ourselves -
        // the browser adds "multipart/form-data; boundary=..." automatically
        headers: isFormData ? undefined : {
          'Content-Type': 'application/json',
        },
        body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        // Read the body as text first, then try to parse it as JSON
        // (some errors, like a proxy timeout page, are not JSON at all)
        const rawBody = await response.text().catch(() => '');
        let body: unknown = null;
        try {
          body = rawBody ? JSON.parse(rawBody) : null;
        } catch {
          body = null;
        }

        // Prefer the backend's {"error": "..."} message - it has the real reason.
        // Otherwise fall back to "HTTP 500 Internal Server Error" (statusText is often empty on HTTP/2)
        const backendMessage = getBackendErrorMessage(body);
        const fallbackMessage = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;

        throw new APIError(
          backendMessage || fallbackMessage,
          response.status,
          body ?? rawBody,
          getRetryAfterSeconds(body, response)
        );
      }

      const result = await response.json();
      
      if (isDevelopment()) {
        console.log(`✅ API Response:`, result);
      }

      return result;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        `network error: ${error instanceof Error ? error.message : `unknown error. ${CONTACT_NOTE}`}`
      );
    }
  }

  // Only the methods we actually use
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

  // data: a plain object (sent as JSON) or a FormData (sent as a file upload)
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, 'POST', data);
  }
}

// Create our API client instance
const apiClient = new APIClient(API_URL);

// API service functions - these are like your individual API endpoint functions in Python

/**
 * Translate text from one form to another
 * This will call your backend's translation endpoint
 */
export async function translateText(
  request: TranslationRequest
): Promise<TranslationResponse> {
  try {
    // Absolute safety: never allow "detect" to be sent to backend
    if (String(request.sourceForm).trim().toLowerCase() === LANGUAGE_DISPLAY.DETECT_KEY) {
      throw new APIError('invalid source form: detect');
    }
    // This will call POST /translate on your backend
    const response = await apiClient.post<TranslationResponse>('/translate', request);
    return response;
  } catch (error) {
    console.error('Translation failed:', error);
    throw error;
  }
}

/**
 * Get available form types from the backend
 * This fetches the dynamic list of available forms from your API
 */
export async function getFormTypes(): Promise<FormsResponse> {
  try {
    // This will call GET /forms on your backend
    const response = await apiClient.get<FormsResponse>('/forms');
    return response;
  } catch (error) {
    console.error('Failed to fetch form types:', error);
    throw error;
  }
}


/**
 * Get translation history from the backend
 * This fetches the complete history from your API
 */
export async function getTranslationHistory(): Promise<HistoryAPIResponse> {
  try {
    // Use the same API client to ensure consistent environment handling
    const response = await apiClient.get<HistoryAPIResponse>('/history');

    return response;
  } catch (error) {
    console.error('Failed to fetch translation history:', error);
    throw error;
  }
}

/**
 * Star or unstar a translation (updates global counter on server)
 * This is like having a toggle_star(translation_id, action) function in Python
 */
export async function updateTranslationStar(request: StarRequest): Promise<StarResponse> {
  try {
    // This will call POST /star on your backend
    const response = await apiClient.post<StarResponse>('/star', request);
    return response;
  } catch (error) {
    console.error('Failed to update star:', error);
    throw error;
  }
}

/**
 * Submit user feedback
 * This will call POST /feedback on your backend
 */
export async function submitFeedback(text: string): Promise<{ success: boolean; message: string; feedback: { text: string; timestamp: string } }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string; feedback: { text: string; timestamp: string } }>('/feedback', { text });
    return response;
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    throw error;
  }
}

/**
 * Get star count for a specific translation
 * This fetches the global star count from server
 */
export async function getTranslationStarCount(translationId: string): Promise<StarCountResponse> {
  try {
    // This will call GET /star/{translationId} on your backend
    const response = await apiClient.get<StarCountResponse>(`/star/${translationId}`);
    return response;
  } catch (error) {
    console.error('Failed to get star count:', error);
    throw error;
  }
}

/**
 * Track user interest in content types (images, websites)
 * This helps you understand what features users want most
 */
export async function trackContentTypeInterest(contentType: 'images' | 'websites'): Promise<InterestTrackingResponse> {
  try {
    // This will call POST /interest on your backend
    const response = await apiClient.post<InterestTrackingResponse>('/interest', {
      what: contentType,
      timestamp: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error(`Failed to track interest in ${contentType}:`, error);
    throw error;
  }
}

/**
 * Detect the form of input text
 * This will call POST /detect-form on your backend
 */
export async function detectForm(request: DetectFormRequest): Promise<DetectFormResponse> {
  try {
    // This will call POST /detect-form on your backend
    const response = await apiClient.post<DetectFormResponse>('/detect-form', request);
    return response;
  } catch (error) {
    console.error('Form detection failed:', error);
    throw error;
  }
}

/**
 * Translate a photo into a target form (the "images" tab)
 * This will call POST /translate-image on your backend with multipart/form-data
 * This is like requests.post(url, files={"image": ...}, data={"targetForm": ...}) in Python
 */
export async function translateImage(request: ImageTranslationRequest): Promise<ImageTranslationResponse> {
  try {
    const formData = new FormData();
    formData.append('image', request.image, request.fileName || 'photo.jpg');
    formData.append('targetForm', request.targetForm);
    if (request.sourceForm) {
      formData.append('sourceForm', request.sourceForm);
    }

    const response = await apiClient.post<ImageTranslationResponse>('/translate-image', formData);
    return response;
  } catch (error) {
    console.error('Photo translation failed:', error);
    throw error;
  }
}


// Export the API client for advanced usage
export { apiClient };

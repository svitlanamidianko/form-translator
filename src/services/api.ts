// API Service Layer
// This is like having a separate api.py file in Python to handle all HTTP requests

import { API_URL, isDevelopment } from '@/config/environment';

// Import types from centralized location
import type { TranslationRequest, TranslationResponse, FormsResponse, HistoryAPIResponse, StarRequest, StarResponse, StarCountResponse, InterestTrackingResponse } from '@/types';

// API Error class - similar to creating custom exceptions in Python
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Simplified API client - focused on what we actually need
// This is like having a focused api_client.py in Python
class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Generic request method - simplified and focused
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (isDevelopment()) {
      console.log(`🌐 API Request: ${method} ${url}`);
      if (data) console.log('📤 Request data:', data);
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new APIError(
          `API request failed: ${response.statusText}`,
          response.status,
          await response.json().catch(() => null)
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
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Only the methods we actually use
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

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
      contentType,
      timestamp: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error(`Failed to track interest in ${contentType}:`, error);
    throw error;
  }
}


// Export the API client for advanced usage
export { apiClient };

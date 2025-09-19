// API Service Layer
// This is like having a separate api.py file in Python to handle all HTTP requests

import { API_URL, isDevelopment } from '@/config/environment';

// Import types from centralized location
import type { TranslationRequest, TranslationResponse, FormsResponse, HistoryAPIResponse } from '@/types';

// API Error class - similar to creating custom exceptions in Python
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
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
    data?: any
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

  async post<T>(endpoint: string, data: any): Promise<T> {
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
    // Your history endpoint is on port 7777, so we'll use the full URL
    const historyUrl = 'http://localhost:7777/history';
    
    if (isDevelopment()) {
      console.log(`🌐 Fetching history from: ${historyUrl}`);
    }

    const response = await fetch(historyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new APIError(
        `History API request failed: ${response.statusText}`,
        response.status,
        await response.json().catch(() => null)
      );
    }

    const result = await response.json();
    
    if (isDevelopment()) {
      console.log(`✅ History Response (${result.count} items):`, result);
    }

    return result;
  } catch (error) {
    console.error('Failed to fetch translation history:', error);
    throw error;
  }
}

/**
 * Health check endpoint to verify backend connectivity
 * Like having a ping endpoint in your Python API
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  try {
    const response = await apiClient.get<{ status: string; message: string }>('/health');
    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

// Export the API client for advanced usage
export { apiClient };

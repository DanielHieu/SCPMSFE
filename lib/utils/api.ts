// Configuration for API requests
export const API_CONFIG = {
  DISABLE_ALL_REQUESTS: false, // Set to true to disable all API requests
  API_URL: process.env.API_URL,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

/**
 * Wrapper for fetch that can be globally disabled
 * @returns Mock response when disabled, actual fetch response when enabled
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Check if all requests should be disabled
  if (API_CONFIG.DISABLE_ALL_REQUESTS) {
    console.log('[API DISABLED] Request to:', url, 'Options:', options);
    
    // Return a mock response
    return new Response(JSON.stringify({ 
      success: true,
      message: 'API requests are currently disabled',
      mockData: true
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  }

  // If not disabled, actually perform the fetch request
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.API_URL}${url}`;
  
  // Merge default headers with provided headers
  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...options.headers
  };
  
  return fetch(fullUrl, {
    ...options,
    headers
  });
} 
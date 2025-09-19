import { FestFormData, ApiResponse } from '../types';

// API base URL - this would be configurable in a real application
const API_BASE_URL = (globalThis as any)?.process?.env?.REACT_APP_API_URL || 'http://localhost:3001/api';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'An error occurred',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// Create a new fest
export async function createFest(festData: FestFormData): Promise<ApiResponse<FestFormData>> {
  const formData = new FormData();
  
  // Append all form fields
  Object.entries(festData).forEach(([key, value]) => {
    if (key === 'departments' || key === 'eventHeads') {
      formData.append(key, JSON.stringify(value));
    } else if (key === 'image' && value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/fests`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to create fest',
      };
    }

    return {
      success: true,
      data,
      message: 'Fest created successfully!',
    };
  } catch (error) {
    console.error('Create fest failed:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// Update an existing fest
export async function updateFest(festId: string, festData: FestFormData): Promise<ApiResponse<FestFormData>> {
  const formData = new FormData();
  
  // Append all form fields
  Object.entries(festData).forEach(([key, value]) => {
    if (key === 'departments' || key === 'eventHeads') {
      formData.append(key, JSON.stringify(value));
    } else if (key === 'image' && value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/fests/${festId}`, {
      method: 'PUT',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to update fest',
      };
    }

    return {
      success: true,
      data,
      message: 'Fest updated successfully!',
    };
  } catch (error) {
    console.error('Update fest failed:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// Get fest by ID
export async function getFest(festId: string): Promise<ApiResponse<FestFormData>> {
  return apiCall<FestFormData>(`/fests/${festId}`);
}

// Delete a fest
export async function deleteFest(festId: string): Promise<ApiResponse<null>> {
  return apiCall<null>(`/fests/${festId}`, {
    method: 'DELETE',
  });
}

// Upload file (separate endpoint for file uploads)
export async function uploadFile(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to upload file',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('File upload failed:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// Get all fests (for listing)
export async function getAllFests(): Promise<ApiResponse<FestFormData[]>> {
  return apiCall<FestFormData[]>('/fests');
}
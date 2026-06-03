const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL not set, using default:', API_BASE_URL);
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required. Please log in to use this feature.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const api = {
  baseURL: API_BASE_URL,

  async get(endpoint: string) {
    try {
      console.log('API GET:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        console.error('API GET Error:', error);
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('API GET Failed:', error.message);
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    try {
      console.log('API POST:', `${API_BASE_URL}${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        console.error('API POST Error:', error);
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('API POST Failed:', error.message);
      throw error;
    }
  },

  async put(endpoint: string, data: any) {
    try {
      console.log('API PUT:', `${API_BASE_URL}${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        console.error('API PUT Error:', error);
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('API PUT Failed:', error.message);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      console.log('API DELETE:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        console.error('API DELETE Error:', error);
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('API DELETE Failed:', error.message);
      throw error;
    }
  },
};

export default api;

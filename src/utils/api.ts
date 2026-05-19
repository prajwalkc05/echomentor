const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const api = {
  baseURL: API_BASE_URL,

  async get(endpoint: string) {
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
  },

  async post(endpoint: string, data: any) {
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
  },

  async put(endpoint: string, data: any) {
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
  },

  async delete(endpoint: string) {
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
  },
};

export default api;

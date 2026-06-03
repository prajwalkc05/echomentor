const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';

const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('No admin token found. Please login.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const adminApi = {
  baseURL: API_BASE_URL,

  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAdminHeaders(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Admin API GET Error:', error.message);
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Admin API POST Error:', error.message);
      throw error;
    }
  },

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Admin API PUT Error:', error.message);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Admin API DELETE Error:', error.message);
      throw error;
    }
  },
};

export default adminApi;

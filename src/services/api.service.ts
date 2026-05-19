import api from '../utils/api';

// Auth Service - No token required
export const authService = {
  async signup(name: string, email: string, password: string) {
    return api.post('/api/auth/signup', { name, email, password });
  },

  async googleLogin(email: string, name?: string) {
    return api.post('/api/auth/google', { email, name });
  },

  async login(email: string, password: string) {
    return api.post('/api/auth/login', { email, password });
  },
};

// AI Chat Service - Token required
export const aiChatService = {
  async sendMessage(message: string) {
    return api.post('/api/ai/chat', { message });
  },

  async getHistory() {
    return api.get('/api/ai/history');
  },

  async deleteChat(chatId: string) {
    return api.delete(`/api/ai/chat/${chatId}`);
  },

  async clearAllChats() {
    return api.delete('/api/ai/history/clear');
  },
};

// Code Assistant Service - Token required
export const codeAssistService = {
  async assist(action: 'generate' | 'explain' | 'debug' | 'review', input: string, language: string) {
    return api.post('/api/code/assist', { action, input, language });
  },

  async getHistory() {
    return api.get('/api/code/history');
  },
};

// Resume Service - Token required
export const resumeService = {
  async generateAI(data: any) {
    return api.post('/api/resume/ai', data);
  },

  async saveManual(data: any) {
    return api.post('/api/resume/manual', data);
  },

  async getAll() {
    return api.get('/api/resume/');
  },
};

// Study Planner Service - Token required
export const studyPlannerService = {
  async create(data: any) {
    return api.post('/api/study-planner/create', data);
  },

  async getAll() {
    return api.get('/api/study-planner/');
  },
};

// Mood Tracker Service - Token required
export const moodService = {
  async track(mood: string, note?: string) {
    return api.post('/api/mood/track', { message: mood, note });
  },

  async getHistory() {
    return api.get('/api/mood/history');
  },
};

// PPT Generator Service - Token required
export const pptService = {
  async generate(data: any) {
    try {
      console.log('🎨 PPT Service: Sending request to backend:', data);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com'}/api/ppt/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('📡 PPT Service: Response status:', response.status);
      console.log('📡 PPT Service: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      // Check if response is a file (PPT) or JSON
      const contentType = response.headers.get('content-type');
      console.log('📄 PPT Service: Content type:', contentType);

      if (contentType && (contentType.includes('application/vnd.openxmlformats') || contentType.includes('application/octet-stream'))) {
        // Handle file download
        console.log('📥 PPT Service: Handling file download...');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.topic || 'presentation'}.pptx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ PPT Service: File downloaded successfully');
        return { success: true, message: 'PPT downloaded successfully', filename: `${data.topic || 'presentation'}.pptx` };
      } else {
        // Handle JSON response
        console.log('📋 PPT Service: Handling JSON response...');
        const jsonData = await response.json();
        console.log('✅ PPT Service: JSON response:', jsonData);
        return jsonData;
      }
    } catch (error: any) {
      console.error('❌ PPT Service: Error:', error);
      throw error;
    }
  },

  async getHistory() {
    return api.get('/api/ppt/history');
  },

  async deleteOne(id: string) {
    return api.delete(`/api/ppt/history/${id}`);
  },

  async clearHistory() {
    return api.delete('/api/ppt/history/clear');
  },
};

// Opportunities Service - Token required
export const opportunitiesService = {
  async getAll() {
    return api.get('/api/opportunities/');
  },

  async getMatched() {
    return api.get('/api/opportunities/matched');
  },

  async bookmark(opportunityId: string) {
    return api.post('/api/opportunities/bookmark', { opportunityId });
  },

  async getBookmarks() {
    return api.get('/api/opportunities/bookmarks');
  },

  async removeBookmark(id: string) {
    return api.delete(`/api/opportunities/bookmark/${id}`);
  },
};

// Notifications Service - Token required
export const notificationsService = {
  async getAll() {
    return api.get('/api/notifications/');
  },

  async getUnreadCount() {
    return api.get('/api/notifications/unread');
  },

  async markAllRead() {
    return api.put('/api/notifications/read-all', {});
  },

  async markOneRead(id: string) {
    return api.put(`/api/notifications/read/${id}`, {});
  },
};

// User Service - Token required
export const userService = {
  async getProfile() {
    return api.get('/api/user/profile');
  },

  async updateProfile(data: any) {
    return api.put('/api/user/profile', data);
  },

  async saveOnboarding(data: { interests: string[]; goals: string[]; education: string; skills: string[]; learningStyle: string }) {
    return api.post('/api/user/onboarding', data);
  },
};

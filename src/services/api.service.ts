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
const SYSTEM_PROMPT = `You are EchoMentor AI, a professional conversational AI assistant for students.

CRITICAL RULES:
1. Always read the FULL conversation history before responding.
2. If the user says "only code", "just code", "code only", "short answer", "brief", or "just the answer" — follow that instruction STRICTLY. No explanations unless asked.
3. NEVER ignore previous context. If the user already specified a topic, language, or format — remember it.
4. For code requests: return clean code blocks using markdown fences with the language specified (e.g. \`\`\`python).
5. NEVER return raw JSON objects or unformatted data.
6. Be conversational and context-aware like ChatGPT.
7. Keep responses concise unless the user asks for detail.
8. Use markdown formatting: headers, bullet points, bold, code blocks where appropriate.
9. Prioritize the LATEST user instruction above all else.`;

export const aiChatService = {
  async extractFiles(files: File[]) {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    const res = await fetch(`${baseUrl}/api/ai/extract`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<{ success: boolean; extractedText: string; fileNames: string[] }>;
  },

  async sendMessage(
    message: string,
    conversationHistory?: Array<{role: string; content: string}>,
    fileContext?: string,
    sessionId?: string,
    sessionTitle?: string
  ) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory ?? [{ role: 'user', content: message }]),
    ];
    return api.post('/api/ai/chat', { message, messages, fileContext: fileContext || undefined, sessionId, sessionTitle });
  },

  async getHistory() {
    return api.get('/api/ai/history');
  },

  async getSessionMessages(sessionId: string) {
    return api.get(`/api/ai/history?sessionId=${sessionId}`);
  },

  async deleteSession(sessionId: string) {
    return api.delete(`/api/ai/session/${sessionId}`);
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
  // Legacy endpoint
  async create(data: any) {
    return api.post('/api/study-planner/create', data);
  },

  // New endpoints
  async generate(data: {
    subject: string;
    topics: string[];
    examDate: string;
    dailyHours: number;
    difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  }) {
    return api.post('/api/study-planner/generate', data);
  },

  async explainTopic(topic: string, style: 'simple' | 'detailed' = 'simple') {
    return api.post('/api/study-planner/explain', { topic, style });
  },

  async generateQuestions(topic: string, count: number = 5, difficulty: string = 'Medium') {
    return api.post('/api/study-planner/questions', { topic, count, difficulty });
  },

  async submitQuiz(planId: string, topic: string, questions: any[], answers: Record<string, string>) {
    return api.post('/api/study-planner/quiz-submit', { planId, topic, questions, answers });
  },

  async getVideoRecommendations(topic: string) {
    return api.post('/api/study-planner/videos', { topic });
  },

  async updateProgress(planId: string, taskId: string, completed: boolean, performance?: number) {
    return api.put(`/api/study-planner/${planId}/progress`, { taskId, completed, performance });
  },

  async getAdaptiveUpdates(planId: string) {
    return api.get(`/api/study-planner/${planId}/adaptive`);
  },

  async generateNotes(topic: string, examMode: boolean = false) {
    return api.post('/api/study-planner/notes', { topic, examMode });
  },

  async getPlanDetails(planId: string) {
    return api.get(`/api/study-planner/${planId}`);
  },

  async getAnalytics(planId: string) {
    return api.get(`/api/study-planner/${planId}/analytics`);
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

  async saveCourseOnboarding(data: { careerGoal: string; interests: string[]; learningStyle: string; skillLevel: string; mainGoal: string }) {
    return api.post('/api/user/course-onboarding', data);
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return api.put('/api/user/change-password', { currentPassword, newPassword });
  },

  async toggleTwoFactor() {
    return api.put('/api/user/two-factor', {});
  },

  async getSessions() {
    return api.get('/api/user/sessions');
  },

  async getPrivacy() {
    return api.get('/api/user/privacy');
  },

  async updatePrivacy(data: any) {
    return api.put('/api/user/privacy', data);
  },

  async updateCookies(data: any) {
    return api.put('/api/user/cookies', data);
  },

  async deleteAccount(password: string) {
    return api.post('/api/user/account/delete', { password });
  },

  async updateNotificationPreferences(data: { email?: boolean; push?: boolean; reminders?: boolean }) {
    return api.put('/api/user/notifications', data);
  },
};

// Startup Guide Service - Token required
export const startupGuideService = {
  async generateIdeas(problem: string, domain?: string) {
    return api.post('/api/startup/ideas', { problem, domain });
  },

  async validateIdea(ideaId: string, ideaData: any) {
    return api.post('/api/startup/validate', { ideaId, ideaData });
  },

  async generateMVP(ideaData: any) {
    return api.post('/api/startup/mvp', ideaData);
  },

  async generateRoadmap(ideaData: any) {
    return api.post('/api/startup/roadmap', ideaData);
  },

  async analyzeFunding(ideaData: any) {
    return api.post('/api/startup/funding', ideaData);
  },

  async chatWithCofounder(message: string, context?: any) {
    return api.post('/api/startup/cofounder', { message, context });
  },

  async saveIdea(ideaData: any) {
    return api.post('/api/startup/save', ideaData);
  },

  async getSavedIdeas() {
    return api.get('/api/startup/saved');
  },

  async getProgress() {
    return api.get('/api/startup/progress');
  },
};

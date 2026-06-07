import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  resumeService, 
  studyPlannerService, 
  moodService, 
  pptService, 
  opportunitiesService,
  aiChatService,
  codeAssistService 
} from '../services/api.service';

export interface Resume {
  _id: string;
  title: string;
  content: any;
  data?: any;
  resume?: any;
  resumeData?: any;
  result?: any;
  type: 'ai' | 'manual';
  template?: number;
  createdAt: string;
}

export interface StudyPlan {
  _id: string;
  title: string;
  subjects: string[];
  schedule: any;
  createdAt: string;
}

export interface MoodEntry {
  _id: string;
  mood: string;
  note?: string;
  date: string;
}

export interface Opportunity {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  type: string;
  isBookmarked?: boolean;
  url?: string;
  applyUrl?: string;
  apply_url?: string;
  link?: string;
  deadline?: string;
  salary?: string;
}

export interface ChatMessage {
  _id: string;
  message: string;
  response: string;
  timestamp: string;
}

interface AppDataContextType {
  // Resume Management
  resumes: Resume[];
  fetchResumes: () => Promise<void>;
  createAIResume: (data: any) => Promise<Resume>;
  createManualResume: (data: any) => Promise<Resume>;
  
  // Study Planner
  studyPlans: StudyPlan[];
  createStudyPlan: (data: any) => Promise<StudyPlan>;
  fetchStudyPlans: () => Promise<void>;
  
  // Mood Tracking
  moodHistory: MoodEntry[];
  trackMood: (mood: string, note?: string) => Promise<any>;
  fetchMoodHistory: () => Promise<void>;
  
  // Opportunities
  opportunities: Opportunity[];
  matchedOpportunities: Opportunity[];
  bookmarkedOpportunities: Opportunity[];
  fetchOpportunities: () => Promise<void>;
  fetchMatchedOpportunities: () => Promise<void>;
  fetchBookmarkedOpportunities: () => Promise<void>;
  bookmarkOpportunity: (id: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  
  // AI Chat
  chatHistory: ChatMessage[];
  sendChatMessage: (message: string, conversationHistory?: Array<{role: string; content: string}>, fileContext?: string, sessionId?: string, sessionTitle?: string) => Promise<string>;
  extractFiles: (files: File[]) => Promise<{ extractedText: string; fileNames: string[] }>;
  fetchChatHistory: () => Promise<{ id: string; title: string; lastMessage: string }[]>;
  fetchSessionMessages: (sessionId: string) => Promise<{ message: string; reply: string; createdAt: string }[]>;
  deleteChatSession: (sessionId: string) => Promise<void>;
  deleteChatMessage: (chatId: string) => Promise<void>;
  clearAllChatHistory: () => Promise<void>;
  
  // Code Assistant
  codeHistory: any[];
  getCodeAssistance: (action: 'generate' | 'explain' | 'debug' | 'review', input: string, language: string) => Promise<any>;
  fetchCodeHistory: () => Promise<void>;
  
  // PPT Generation
  pptHistory: any[];
  generatePPT: (data: any) => Promise<any>;
  fetchPPTHistory: () => Promise<void>;
  
  // State Management
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [matchedOpportunities, setMatchedOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<Opportunity[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [codeHistory, setCodeHistory] = useState<any[]>([]);
  const [pptHistory, setPptHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Resume Management
  const fetchResumes = async () => {
    setLoading(true);
    try {
      const data = await resumeService.getAll();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray(data.resumes)) list = data.resumes;
      else if (data && Array.isArray(data.data)) list = data.data;
      setResumes(list.map((r: any) => ({ ...r, content: r.content || {} })));
    } catch (error: any) {
      setError(error.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const createAIResume = async (data: any) => {
    setLoading(true);
    try {
      const res = await resumeService.generateAI(data);
      const resume = res?.resume || res;
      setResumes(prev => [resume, ...prev]);
      return resume;
    } catch (error: any) {
      setError(error.message || 'Failed to create AI resume');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createManualResume = async (data: any) => {
    setLoading(true);
    try {
      const res = await resumeService.saveManual(data);
      const resume = res?.resume || res;
      setResumes(prev => [resume, ...prev]);
      return resume;
    } catch (error: any) {
      setError(error.message || 'Failed to create manual resume');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Study Planner
  const createStudyPlan = async (data: any) => {
    setLoading(true);
    try {
      const res = await studyPlannerService.create(data);
      const plan = res?.plan || res?.studyPlan || res;
      setStudyPlans(prev => [plan, ...prev]);
      return plan;
    } catch (error: any) {
      setError(error.message || 'Failed to create study plan');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyPlans = async () => {
    // No GET endpoint for study plans in backend, skip silently
  };

  // Mood Tracking
  const trackMood = async (mood: string, note?: string) => {
    setLoading(true);
    try {
      // Use the mood as the message (now it's descriptive)
      const response = await moodService.track(mood, note);
      // Backend returns: {success: true, mood: "happy", suggestion: "...", alert: null}
      // Create a mood entry from the response
      const entry = {
        _id: Date.now().toString(),
        mood: mood.split(' ')[0] || mood, // Extract first word for display
        note: note || '',
        date: new Date().toISOString()
      };
      setMoodHistory(prev => [entry, ...prev]);
      return response; // Return full response including suggestion
    } catch (error: any) {
      console.error('Mood tracking error:', error);
      setError(error.message || 'Failed to track mood');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodHistory = async () => {
    setLoading(true);
    try {
      const data = await moodService.getHistory();
      // Backend returns: {success: true, history: [...], moodCount: {...}}
      let historyArray = [];
      if (data && Array.isArray(data.history)) {
        historyArray = data.history.map((item: any) => ({
          _id: item._id,
          mood: item.message || item.mood, // Use message field as mood
          note: item.note || '',
          date: item.createdAt
        }));
      }
      setMoodHistory(historyArray);
    } catch (error: any) {
      console.error('Failed to fetch mood history:', error);
      // Don't set error for history fetch failures, just log them
      setMoodHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Opportunities
  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await opportunitiesService.getAll();
      // Handle different response shapes
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray(data.opportunities)) list = data.opportunities;
      else if (data && Array.isArray(data.data)) list = data.data;
      else if (data && Array.isArray(data.results)) list = data.results;
      setOpportunities(list);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedOpportunities = async () => {
    try {
      const data = await opportunitiesService.getMatched();
      setMatchedOpportunities(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch matched opportunities');
    }
  };

  const fetchBookmarkedOpportunities = async () => {
    try {
      const data = await opportunitiesService.getBookmarks();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray(data.bookmarks)) list = data.bookmarks;
      else if (data && Array.isArray(data.opportunities)) list = data.opportunities;
      else if (data && Array.isArray(data.data)) list = data.data;
      setBookmarkedOpportunities(list);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch bookmarked opportunities');
    }
  };

  const bookmarkOpportunity = async (id: string) => {
    try {
      await opportunitiesService.bookmark(id);
      await fetchBookmarkedOpportunities();
    } catch (error: any) {
      setError(error.message || 'Failed to bookmark opportunity');
    }
  };

  const removeBookmark = async (id: string) => {
    try {
      await opportunitiesService.removeBookmark(id);
      setBookmarkedOpportunities(prev => prev.filter(opp => opp._id !== id));
    } catch (error: any) {
      setError(error.message || 'Failed to remove bookmark');
    }
  };

  // AI Chat
  const sendChatMessage = async (message: string, conversationHistory?: Array<{role: string; content: string}>, fileContext?: string, sessionId?: string, sessionTitle?: string): Promise<string> => {
    try {
      console.log('📤 Sending chat message:', { message, hasHistory: !!conversationHistory, hasFileContext: !!fileContext });
      
      const response = await aiChatService.sendMessage(message, conversationHistory, fileContext, sessionId, sessionTitle);
      
      console.log('📥 Received response:', response);
      console.log('📥 Response type:', typeof response);

      let finalResponse = 'No response received';

      if (typeof response === 'string' && response.trim()) {
        finalResponse = response.trim();
        console.log('✅ Using string response:', finalResponse.substring(0, 100));
      } else if (response && typeof response === 'object') {
        finalResponse = response.reply ||
                      response.message ||
                      response.response ||
                      response.text ||
                      response.answer ||
                      'No response received';
        console.log('✅ Extracted from object:', { 
          hasReply: !!response.reply, 
          hasMessage: !!response.message,
          hasResponse: !!response.response,
          finalResponse: finalResponse.substring(0, 100)
        });
        if (typeof finalResponse === 'object') {
          finalResponse = JSON.stringify(finalResponse);
        }
      }

      console.log('✅ Final response:', finalResponse.substring(0, 100));
      return finalResponse;
    } catch (error: any) {
      console.error('❌ Chat error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  };

  const extractFiles = async (files: File[]): Promise<{ extractedText: string; fileNames: string[] }> => {
    const result = await aiChatService.extractFiles(files);
    return { extractedText: result.extractedText, fileNames: result.fileNames };
  };

  const fetchChatHistory = async (): Promise<{ id: string; title: string; lastMessage: string }[]> => {
    try {
      const data = await aiChatService.getHistory();
      const sessions = data?.sessions ?? [];
      setChatHistory(sessions);
      return sessions.map((s: any) => ({ id: s._id, title: s.sessionTitle || 'Chat', lastMessage: s.lastMessage || '' }));
    } catch {
      setChatHistory([]);
      return [];
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const data = await aiChatService.getSessionMessages(sessionId);
      return data?.chats ?? [];
    } catch {
      return [];
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    try {
      await aiChatService.deleteSession(sessionId);
    } catch (error: any) {
      console.error('Failed to delete session:', error);
    }
  };

  const deleteChatMessage = async (chatId: string) => {
    try {
      await aiChatService.deleteChat(chatId);
      // Remove from local state
      setChatHistory(prev => prev.filter(chat => (chat as any)._id !== chatId));
    } catch (error: any) {
      console.error('Failed to delete chat:', error);
      // Don't throw error, just log it
    }
  };

  const clearAllChatHistory = async () => {
    try {
      console.log('🌐 Attempting to clear all chats from backend...');
      
      // Try the DELETE endpoint first
      try {
        await aiChatService.clearAllChats();
        console.log('✅ Backend clear successful via DELETE endpoint');
      } catch (deleteError: any) {
        console.warn('⚠️ DELETE endpoint not available, using fallback method');
        
        // Fallback: Clear local state only (backend endpoint doesn't exist yet)
        // TODO: Backend team needs to implement DELETE /api/ai/history endpoint
        console.log('🔄 Using client-side clear as fallback');
      }
      
      // Clear local state regardless of backend success/failure
      console.log('🗑️ Clearing local chat history state...');
      setChatHistory([]);
      console.log('✅ Local state cleared');
      
    } catch (error: any) {
      console.error('❌ Clear operation failed:', error);
      // Still clear local state for better UX
      setChatHistory([]);
      throw error;
    }
  };

  const getCodeAssistance = async (action: 'generate' | 'explain' | 'debug' | 'review', input: string, language: string) => {
    setLoading(true);
    try {
      const response = await codeAssistService.assist(action, input, language);
      // Normalize response
      let result = '';
      if (typeof response === 'string') {
        result = response;
      } else if (response && typeof response === 'object') {
        result = response.result || response.output || response.message || response.response || response.text || JSON.stringify(response);
      }
      fetchCodeHistory().catch(() => {});
      return { result };
    } catch (error: any) {
      setError(error.message || 'Failed to get code assistance');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchCodeHistory = async () => {
    try {
      const data = await codeAssistService.getHistory();
      let historyArray = [];
      if (Array.isArray(data)) historyArray = data;
      else if (data && Array.isArray(data.history)) historyArray = data.history;
      setCodeHistory(historyArray);
    } catch (error: any) {
      setCodeHistory([]);
    }
  };

  // PPT Generation
  const generatePPT = async (data: any) => {
    setLoading(true);
    try {
      const response = await pptService.generate(data);
      await fetchPPTHistory();
      return response;
    } catch (error: any) {
      setError(error.message || 'Failed to generate PPT');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPPTHistory = async () => {
    try {
      const data = await pptService.getHistory();
      setPptHistory(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch PPT history');
    }
  };

  return (
    <AppDataContext.Provider value={{
      resumes,
      fetchResumes,
      createAIResume,
      createManualResume,
      studyPlans,
      createStudyPlan,
      fetchStudyPlans,
      moodHistory,
      trackMood,
      fetchMoodHistory,
      opportunities,
      matchedOpportunities,
      bookmarkedOpportunities,
      fetchOpportunities,
      fetchMatchedOpportunities,
      fetchBookmarkedOpportunities,
      bookmarkOpportunity,
      removeBookmark,
      chatHistory,
      sendChatMessage,
      extractFiles,
      fetchChatHistory,
      fetchSessionMessages,
      deleteChatSession,
      deleteChatMessage,
      clearAllChatHistory,
      codeHistory,
      getCodeAssistance,
      fetchCodeHistory,
      pptHistory,
      generatePPT,
      fetchPPTHistory,
      loading,
      error,
      clearError
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
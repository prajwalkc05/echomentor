import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '../../utils/storage';

export interface StudySession {
  id: string;
  topic: string;
  type: 'learn' | 'quiz' | 'video' | 'notes' | 'practice';
  duration: number;
  startTime: string;
  endTime: string;
  completed: boolean;
}

export interface QuizAttemptRecord {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timestamp: string;
  answers: Record<string, string>;
}

export interface StudyPlanRecord {
  id: string;
  subject: string;
  topics: string[];
  examDate: string;
  dailyHours: number;
  createdAt: string;
  completedTopics: string[];
  totalProgress: number;
}

export interface StudyStoreState {
  // Active Plan
  activePlan: StudyPlanRecord | null;
  setActivePlan: (plan: StudyPlanRecord | null) => void;

  // Topics & Progress
  topicsCompleted: Set<string>;
  totalTopics: number;
  topicScores: Record<string, number>;
  markTopicComplete: (topic: string, score?: number) => void;
  setTopicScore: (topic: string, score: number) => void;

  // Study Time
  studyHours: number;
  addStudyTime: (hours: number) => void;
  resetStudyTime: () => void;

  // Streak
  streak: number;
  lastStudyDate: string | null;
  updateStreak: () => void;
  resetStreak: () => void;

  // Quiz Data
  quizAttempts: QuizAttemptRecord[];
  addQuizAttempt: (attempt: QuizAttemptRecord) => void;
  getQuizAttemptsByTopic: (topic: string) => QuizAttemptRecord[];

  // Study Sessions
  sessions: StudySession[];
  addSession: (session: StudySession) => void;
  getTotalSessionTime: () => number;

  // Learning Progress
  videoProgress: Record<string, number>; // topic -> percentage watched
  notesProgress: Record<string, boolean>; // topic -> completed
  setVideoProgress: (topic: string, progress: number) => void;
  setNotesProgress: (topic: string, completed: boolean) => void;

  // History
  studyHistory: StudyPlanRecord[];
  addToHistory: (plan: StudyPlanRecord) => void;

  // Analytics
  getAnalytics: () => {
    totalStudyTime: number;
    averageScore: number;
    completionRate: number;
    topicsCompleted: number;
    totalTopics: number;
    streak: number;
    weakTopics: string[];
    strongTopics: string[];
  };

  // Utilities
  clearAllData: () => void;
  exportData: () => string;
  importData: (data: string) => void;
}

export const useStudyStore = create<StudyStoreState>()(
  persist(
    (set, get) => ({
      // Active Plan
      activePlan: null,
      setActivePlan: (plan) => set({ activePlan: plan }),

      // Topics & Progress
      topicsCompleted: new Set(),
      totalTopics: 0,
      topicScores: {},
      markTopicComplete: (topic, score) => {
        const { topicsCompleted, topicScores } = get();
        const newCompleted = new Set(topicsCompleted);
        newCompleted.add(topic);
        const validScore = Math.min(100, Math.max(0, score || 0));
        
        set({
          topicsCompleted: newCompleted,
          topicScores: {
            ...topicScores,
            [topic]: validScore,
          },
        });
      },
      setTopicScore: (topic, score) => {
        set((state) => ({
          topicScores: {
            ...state.topicScores,
            [topic]: score,
          },
        }));
      },

      // Study Time
      studyHours: 0,
      addStudyTime: (hours) => {
        set((state) => ({
          studyHours: state.studyHours + hours,
        }));
      },
      resetStudyTime: () => set({ studyHours: 0 }),

      // Streak
      streak: 0,
      lastStudyDate: null,
      updateStreak: () => {
        const { lastStudyDate, streak } = get();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (lastStudyDate === today) {
          return;
        }

        if (lastStudyDate === yesterday) {
          set({ streak: streak + 1, lastStudyDate: today });
        } else {
          set({ streak: 1, lastStudyDate: today });
        }
      },
      resetStreak: () => set({ streak: 0, lastStudyDate: null }),

      // Quiz Data
      quizAttempts: [],
      addQuizAttempt: (attempt) => {
        set((state) => ({
          quizAttempts: [...state.quizAttempts, attempt],
        }));
        get().updateStreak();
      },
      getQuizAttemptsByTopic: (topic) => {
        return get().quizAttempts.filter((attempt) => attempt.topic === topic);
      },

      // Study Sessions
      sessions: [],
      addSession: (session) => {
        set((state) => ({
          sessions: [...state.sessions, session],
        }));
        get().updateStreak();
      },
      getTotalSessionTime: () => {
        return get().sessions.reduce((total, session) => total + session.duration, 0);
      },

      // Learning Progress
      videoProgress: {},
      notesProgress: {},
      setVideoProgress: (topic, progress) => {
        set((state) => ({
          videoProgress: {
            ...state.videoProgress,
            [topic]: progress,
          },
        }));
      },
      setNotesProgress: (topic, completed) => {
        set((state) => ({
          notesProgress: {
            ...state.notesProgress,
            [topic]: completed,
          },
        }));
      },

      // History
      studyHistory: [],
      addToHistory: (plan) => {
        set((state) => ({
          studyHistory: [plan, ...state.studyHistory],
        }));
      },

      // Analytics
      getAnalytics: () => {
        const state = get();
        const topicScores = Object.values(state.topicScores || {});
        const averageScore = topicScores.length > 0
          ? Math.round(topicScores.reduce((a, b) => a + b, 0) / topicScores.length)
          : 0;

        const completionRate = state.totalTopics > 0
          ? Math.round((Array.from(state.topicsCompleted || []).length / state.totalTopics) * 100)
          : 0;

        const weakTopics = Object.entries(state.topicScores || {})
          .filter(([, score]) => score < 60)
          .map(([topic]) => topic);

        const strongTopics = Object.entries(state.topicScores || {})
          .filter(([, score]) => score >= 80)
          .map(([topic]) => topic);

        return {
          totalStudyTime: state.studyHours,
          averageScore,
          completionRate,
          topicsCompleted: state.topicsCompleted?.size || 0,
          totalTopics: state.totalTopics,
          streak: state.streak,
          weakTopics,
          strongTopics,
        };
      },

      // Utilities
      clearAllData: () => {
        set({
          activePlan: null,
          topicsCompleted: new Set(),
          totalTopics: 0,
          topicScores: {},
          studyHours: 0,
          streak: 0,
          lastStudyDate: null,
          quizAttempts: [],
          sessions: [],
          videoProgress: {},
          notesProgress: {},
          studyHistory: [],
        });
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          activePlan: state.activePlan,
          topicsCompleted: Array.from(state.topicsCompleted || []),
          totalTopics: state.totalTopics,
          topicScores: state.topicScores,
          studyHours: state.studyHours,
          streak: state.streak,
          lastStudyDate: state.lastStudyDate,
          quizAttempts: state.quizAttempts,
          sessions: state.sessions,
          videoProgress: state.videoProgress,
          notesProgress: state.notesProgress,
          studyHistory: state.studyHistory,
        });
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            activePlan: parsed.activePlan || null,
            topicsCompleted: new Set(parsed.topicsCompleted || []),
            totalTopics: parsed.totalTopics || 0,
            topicScores: parsed.topicScores || {},
            studyHours: parsed.studyHours || 0,
            streak: parsed.streak || 0,
            lastStudyDate: parsed.lastStudyDate || null,
            quizAttempts: parsed.quizAttempts || [],
            sessions: parsed.sessions || [],
            videoProgress: parsed.videoProgress || {},
            notesProgress: parsed.notesProgress || {},
            studyHistory: parsed.studyHistory || [],
          });
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      },
    }),
    {
      name: 'echomentor-study-store',
      storage: {
        getItem: (name) => {
          const item = storage.get(name);
          if (!item) return null;
          try {
            const parsed = JSON.parse(item);
            return {
              state: {
                ...parsed.state,
                topicsCompleted: new Set(parsed.state.topicsCompleted || []),
              },
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const toStore = {
            state: {
              ...value.state,
              topicsCompleted: Array.from(value.state.topicsCompleted || []),
            },
          };
          storage.set(name, JSON.stringify(toStore));
        },
        removeItem: (name) => storage.remove(name),
      },
    }
  )
);

import api from '../../utils/api';
import { StudyPlan, TopicExplanation, Question, QuizAttempt, AdaptiveUpdate } from '../types';

export const studyPlannerService = {
  async generatePlan(data: {
    subject: string;
    topics: string[];
    examDate: string;
    dailyHours: number;
    difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  }): Promise<{ success: boolean; plan: any; planId: string }> {
    return api.post('/api/study-planner/generate', data);
  },

  async getTopicExplanation(topic: string, style?: 'simple' | 'detailed'): Promise<TopicExplanation> {
    return api.post('/api/study-planner/explain', { topic, style });
  },

  async generateQuestions(topic: string, count: number = 5, difficulty?: string): Promise<Question[]> {
    return api.post('/api/study-planner/questions', { topic, count, difficulty });
  },

  async submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'timestamp'>): Promise<{ score: number; feedback: string; adaptiveUpdates: AdaptiveUpdate[] }> {
    return api.post('/api/study-planner/quiz-submit', attempt);
  },

  async getRecommendedVideos(topic: string): Promise<Array<{ title: string; url: string; duration: number; relevance: number }>> {
    return api.post('/api/study-planner/videos', { topic });
  },

  async getPlan(planId: string): Promise<{ success: boolean; plan: StudyPlan }> {
    return api.get(`/api/study-planner/${planId}`);
  },

  async updatePlanProgress(planId: string, taskId: string, completed: boolean, performance?: number): Promise<StudyPlan> {
    return api.put(`/api/study-planner/${planId}/progress`, { taskId, completed, performance });
  },

  async getAdaptiveUpdates(planId: string): Promise<AdaptiveUpdate[]> {
    return api.get(`/api/study-planner/${planId}/adaptive`);
  },

  async generateNotes(topic: string, examMode?: boolean): Promise<string> {
    return api.post('/api/study-planner/notes', { topic, examMode });
  },

  async getPerformanceAnalytics(planId: string): Promise<any> {
    return api.get(`/api/study-planner/${planId}/analytics`);
  },

  // New enhanced endpoints
  async markTaskCompleted(planId: string, taskId: string, completed: boolean = true, timeSpent?: number): Promise<{ success: boolean; message: string; plan: StudyPlan }> {
    return api.put(`/api/study-planner/${planId}/tasks/${taskId}/complete`, { completed, timeSpent });
  },

  async getStudyHistory(page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    history: {
      plans: StudyPlan[];
      recentQuizzes: QuizAttempt[];
      stats: {
        totalPlans: number;
        totalQuizzes: number;
        avgScore: number;
        totalHoursStudied: number;
        currentStreak: number;
      };
      pagination: {
        currentPage: number;
        totalPages: number;
        hasMore: boolean;
      };
    };
  }> {
    return api.get(`/api/study-planner/history?page=${page}&limit=${limit}`);
  },

  async generateBulkTopics(subject: string, level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate', count: number = 10): Promise<{
    success: boolean;
    subject: string;
    level: string;
    topics: string[];
    count: number;
    message: string;
  }> {
    return api.post('/api/study-planner/bulk-topics', { subject, level, count });
  },

  async getDetailedAnalytics(planId: string, timeframe: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<{
    success: boolean;
    analytics: {
      overview: {
        totalTasks: number;
        completedTasks: number;
        progressPercentage: number;
        totalQuizzes: number;
        averageScore: number;
        studyStreak: number;
        totalHoursSpent: number;
      };
      topicPerformance: Record<string, {
        averageScore: number;
        quizzesTaken: number;
        lastAttempt: string | null;
        trend: 'improving' | 'declining' | 'stable';
      }>;
      studyConsistency: {
        daysStudied: number;
        totalDays: number;
        consistencyRate: number;
      };
      recentActivity: Array<{
        topic: string;
        score: number;
        date: string;
        weakAreas: string[];
      }>;
      weakAreas: string[];
      strongAreas: string[];
      recommendations: Array<{
        type: string;
        topic?: string;
        topics?: string[];
        message: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
  }> {
    return api.get(`/api/study-planner/${planId}/detailed-analytics?timeframe=${timeframe}`);
  },
};

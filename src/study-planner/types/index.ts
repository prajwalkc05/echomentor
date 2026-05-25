export interface StudyPlanRequest {
  subject: string;
  topics: string[];
  examDate: string;
  dailyHours: number;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface StudyPlanResponse {
  success: boolean;
  plan: StudyPlan;
}

export interface StudyPlan {
  id: string;
  subject: string;
  topics: string[];
  examDate: string;
  dailyHours: number;
  schedule: ScheduleDay[];
  topicExplanations: Record<string, TopicExplanation>;
  videoRecommendations: Record<string, VideoRecommendation[]>;
  performance: Performance;
}

export interface ScheduleDay {
  day: number;
  date: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  topic: string;
  type: 'learn' | 'practice' | 'quiz' | 'review';
  duration: number;
  description: string;
  completed: boolean;
  performance?: number;
}

export interface TopicExplanation {
  topic: string;
  simpleExplanation: string;
  detailedExplanation: string;
  keyPoints: string[];
  examples: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface QuizData {
  topic: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface VideoRecommendation {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
  description?: string;
}

export interface Performance {
  overallScore: number;
  completedTopics: number;
  weakTopics: string[];
  strongTopics: string[];
  studyStreak: number;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  timestamp: Date;
}

export interface AdaptiveUpdate {
  type: 'reschedule' | 'add_practice' | 'review_topic';
  topic: string;
  reason: string;
  action: string;
}
export interface StudyPlan {
  id: string;
  subject: string;
  topics: string[];
  examDate: string;
  dailyHours: number;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  schedule: DaySchedule[];
  performance: PerformanceMetrics;
}

export interface DaySchedule {
  day: string;
  date: string;
  tasks: StudyTask[];
  completed: boolean;
}

export interface StudyTask {
  id: string;
  topic: string;
  type: 'Learn' | 'Practice' | 'Review' | 'Quiz';
  duration: number;
  resources: Resource[];
  completed: boolean;
  performance?: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Video' | 'Article' | 'Question' | 'Note';
  url?: string;
  duration?: number;
  relevance: number;
}

export interface TopicExplanation {
  topic: string;
  simple: string;
  detailed: string;
  keyPoints: string[];
  examples: string[];
  realWorldApplications: string[];
  youtubeLinks?: Array<{ title: string; url: string }>;
}

export interface Question {
  id: string;
  topic: string;
  type: 'MCQ' | 'ShortAnswer' | 'LongAnswer' | 'Coding' | 'Scenario';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizAttempt {
  id: string;
  topic: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  timestamp: string;
  weakAreas: string[];
}

export interface PerformanceMetrics {
  overallScore: number;
  topicScores: Record<string, number>;
  weakTopics: string[];
  strongTopics: string[];
  studyStreak: number;
  totalHoursSpent: number;
  lastUpdated: string;
}

export interface AdaptiveUpdate {
  action: 'reschedule' | 'addPractice' | 'recommendVideo' | 'increaseRevision';
  topic: string;
  reason: string;
  changes: Partial<StudyPlan>;
}

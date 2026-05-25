import { aiService } from '../services/aiService';
import { youtubeService } from '../services/youtubeService';
import { StudyPlanRequest, StudyPlanResponse, TopicExplanation, QuizData } from '../types/index';

export class StudyPlannerEngine {
  /**
   * Main entry point - generates complete study plan
   */
  static async generateStudyPlan(request: StudyPlanRequest): Promise<StudyPlanResponse> {
    try {
      // Generate AI study plan using OpenRouter
      const planData = await aiService.generatePlan(request);
      
      // Generate initial topic explanations
      const topicExplanations = await Promise.all(
        request.topics.map(topic => 
          aiService.getTopicExplanation(topic, 'simple')
        )
      );

      // Get video recommendations
      const videoRecommendations = await Promise.all(
        request.topics.map(topic => 
          youtubeService.getRecommendedVideos(topic)
        )
      );

      return {
        success: true,
        plan: {
          id: planData.id,
          subject: request.subject,
          topics: request.topics,
          examDate: request.examDate,
          dailyHours: request.dailyHours,
          schedule: planData.schedule,
          topicExplanations: topicExplanations.reduce((acc, exp, idx) => {
            acc[request.topics[idx]] = exp;
            return acc;
          }, {} as Record<string, TopicExplanation>),
          videoRecommendations: videoRecommendations.reduce((acc, videos, idx) => {
            acc[request.topics[idx]] = videos;
            return acc;
          }, {} as Record<string, any[]>),
          performance: {
            overallScore: 0,
            completedTopics: 0,
            weakTopics: [],
            strongTopics: [],
            studyStreak: 0
          }
        }
      };
    } catch (error) {
      console.error('StudyPlannerEngine error:', error);
      throw new Error('Failed to generate study plan. AI services may be busy.');
    }
  }

  /**
   * Get detailed topic explanation with examples
   */
  static async explainTopic(topic: string, style: 'simple' | 'detailed' = 'detailed'): Promise<TopicExplanation> {
    return aiService.getTopicExplanation(topic, style);
  }

  /**
   * Generate quiz questions using Groq for speed
   */
  static async generateQuiz(topic: string, count: number = 5): Promise<QuizData> {
    return aiService.generateQuiz(topic, count);
  }

  /**
   * Get video recommendations for topic
   */
  static async getVideoRecommendations(topic: string): Promise<any[]> {
    return youtubeService.getRecommendedVideos(topic);
  }

  /**
   * Generate revision notes
   */
  static async generateNotes(topic: string, examMode: boolean = false): Promise<string> {
    return aiService.generateNotes(topic, examMode);
  }

  /**
   * Analyze quiz performance and provide adaptive updates
   */
  static async analyzePerformance(quizResults: any[], currentPlan: any): Promise<any> {
    return aiService.analyzePerformance(quizResults, currentPlan);
  }
}
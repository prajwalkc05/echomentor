// Course Aggregation Service
// Fetches courses from multiple platforms and aggregates them

export interface AggregatedCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  platform: 'youtube' | 'khan-academy' | 'freecodecamp' | 'coursera' | 'udemy';
  platformIcon: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  students: number;
  skills: string[];
  tags: string[];
  url: string;
  isFree: boolean;
  certificateAvailable: boolean;
}

export interface CourseAggregationService {
  searchCourses(query: string, filters?: CourseFilters): Promise<AggregatedCourse[]>;
  getRecommendedCourses(userProfile: UserProfile): Promise<AggregatedCourse[]>;
  getCoursesBySkill(skill: string): Promise<AggregatedCourse[]>;
  getCoursesByCareer(career: string): Promise<AggregatedCourse[]>;
}

export interface CourseFilters {
  difficulty?: string;
  platform?: string;
  isFree?: boolean;
  certificateAvailable?: boolean;
  minRating?: number;
  maxDuration?: string;
}

export interface UserProfile {
  careerGoal: string;
  interests: string[];
  learningStyle: string;
  skillLevel: string;
  mainGoal: string;
}

// Mock implementation - Replace with actual API calls
export const courseAggregationService = {
  async searchCourses(query: string, filters?: CourseFilters): Promise<AggregatedCourse[]> {
    try {
      const response = await fetch('/api/courses/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query, filters })
      });
      
      if (!response.ok) throw new Error('Failed to search courses');
      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Course search error:', error);
      return [];
    }
  },

  async getRecommendedCourses(userProfile: UserProfile): Promise<AggregatedCourse[]> {
    try {
      const response = await fetch('/api/courses/recommended', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userProfile)
      });
      
      if (!response.ok) throw new Error('Failed to get recommendations');
      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Recommendation error:', error);
      return [];
    }
  },

  async getCoursesBySkill(skill: string): Promise<AggregatedCourse[]> {
    try {
      const response = await fetch(`/api/courses/skill/${encodeURIComponent(skill)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to get courses by skill');
      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Skill courses error:', error);
      return [];
    }
  },

  async getCoursesByCareer(career: string): Promise<AggregatedCourse[]> {
    try {
      const response = await fetch(`/api/courses/career/${encodeURIComponent(career)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to get courses by career');
      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Career courses error:', error);
      return [];
    }
  }
};

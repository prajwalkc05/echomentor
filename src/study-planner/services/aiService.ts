import { StudyPlanRequest, TopicExplanation, QuizData } from '../types/index';

class AIService {
  private openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  private groqKey = import.meta.env.VITE_GROQ_API_KEY;

  /**
   * Generate study plan using OpenRouter (DeepSeek)
   */
  async generatePlan(request: StudyPlanRequest): Promise<any> {
    try {
      const prompt = `Create a structured study plan for:
Subject: ${request.subject}
Topics: ${request.topics.join(', ')}
Exam Date: ${request.examDate}
Daily Hours: ${request.dailyHours}
Difficulty: ${request.difficultyLevel}

Return ONLY valid JSON with this structure:
{
  "id": "unique_id",
  "schedule": [
    {
      "day": 1,
      "date": "2024-01-15",
      "tasks": [
        {
          "id": "task_1",
          "topic": "Arrays",
          "type": "learn",
          "duration": 60,
          "description": "Introduction to Arrays",
          "completed": false
        }
      ]
    }
  ]
}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a study planner AI. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
      }

      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (error) {
        console.warn('Failed to parse AI response, using fallback');
        return this.generateFallbackPlan(request);
      }
    } catch (error) {
      console.warn('AI service unavailable, using fallback plan');
      return this.generateFallbackPlan(request);
    }
  }

  /**
   * Generate fallback study plan when AI is unavailable
   */
  private generateFallbackPlan(request: StudyPlanRequest): any {
    const examDate = new Date(request.examDate);
    const today = new Date();
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalTopics = request.topics.length;
    const daysPerTopic = Math.max(1, Math.floor(daysUntilExam / totalTopics));

    const schedule = [];
    let currentDay = 1;
    
    for (let i = 0; i < totalTopics; i++) {
      const topic = request.topics[i];
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + (currentDay - 1));
      
      // Learn phase
      schedule.push({
        day: currentDay,
        date: startDate.toISOString().split('T')[0],
        tasks: [
          {
            id: `task_${currentDay}_1`,
            topic: topic,
            type: 'learn',
            duration: Math.floor(request.dailyHours * 60 * 0.6),
            description: `Introduction to ${topic}`,
            completed: false
          },
          {
            id: `task_${currentDay}_2`,
            topic: topic,
            type: 'practice',
            duration: Math.floor(request.dailyHours * 60 * 0.4),
            description: `Practice problems for ${topic}`,
            completed: false
          }
        ]
      });
      
      currentDay++;
      
      // Review phase if we have extra days
      if (daysPerTopic > 1) {
        const reviewDate = new Date(startDate);
        reviewDate.setDate(startDate.getDate() + 1);
        
        schedule.push({
          day: currentDay,
          date: reviewDate.toISOString().split('T')[0],
          tasks: [
            {
              id: `task_${currentDay}_1`,
              topic: topic,
              type: 'review',
              duration: request.dailyHours * 60,
              description: `Review and reinforce ${topic}`,
              completed: false
            }
          ]
        });
        
        currentDay++;
      }
    }

    return {
      id: `plan_${Date.now()}`,
      schedule
    };
  }

  /**
   * Get topic explanation using OpenRouter
   */
  async getTopicExplanation(topic: string, style: 'simple' | 'detailed'): Promise<TopicExplanation> {
    try {
      const prompt = `Explain "${topic}" in ${style} terms.

Return ONLY valid JSON:
{
  "topic": "${topic}",
  "simpleExplanation": "Brief explanation...",
  "detailedExplanation": "Detailed explanation...",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "examples": ["Example 1", "Example 2"],
  "difficulty": "Beginner|Intermediate|Advanced"
}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: 'You are an educational AI. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
      }

      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (error) {
        return this.generateFallbackExplanation(topic);
      }
    } catch (error) {
      return this.generateFallbackExplanation(topic);
    }
  }

  /**
   * Generate fallback explanation when AI is unavailable
   */
  private generateFallbackExplanation(topic: string): TopicExplanation {
    return {
      topic,
      simpleExplanation: `${topic} is an important concept that requires study and practice to master.`,
      detailedExplanation: `${topic} is a fundamental concept in this subject area. It involves understanding key principles, applying them in various contexts, and practicing with different examples. Mastering ${topic} will help build a strong foundation for more advanced topics.`,
      keyPoints: [
        `Understand the basic definition of ${topic}`,
        `Learn the key principles and rules`,
        `Practice with examples and exercises`,
        `Apply knowledge to solve problems`
      ],
      examples: [
        `Basic example of ${topic}`,
        `Practical application of ${topic}`
      ],
      difficulty: 'Intermediate'
    };
  }

  /**
   * Generate quiz using Groq for speed
   */
  async generateQuiz(topic: string, count: number = 5): Promise<QuizData> {
    // Check if Groq API key is available
    if (!this.groqKey) {
      console.warn('Groq API key not found, using fallback quiz');
      return this.generateFallbackQuiz(topic, count);
    }

    try {
      const systemPrompt = `You are an expert educational quiz generator.

Generate EXACTLY ${count} UNIQUE MCQs for the given topic.

RULES:
- Every question MUST be different
- Avoid repeating concepts
- Questions must test real understanding
- Include beginner-friendly explanations
- Randomize correct answers between A, B, C, and D
- Use realistic options
- No duplicate questions
- No placeholder text
- Return ONLY valid JSON

Distribute correct answers randomly between A, B, C, and D.`;

      const userPrompt = `Generate ${count} MCQs for the topic: "${topic}"

Return in this EXACT JSON format:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": "q1",
      "question": "What is...?",
      "options": [
        "Option 1",
        "Option 2", 
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct"
    }
  ]
}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API error ${response.status}:`, errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
      }

      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        
        // Validate and deduplicate questions
        const validatedQuiz = this.validateAndDeduplicateQuiz(parsed, topic, count);
        return validatedQuiz;
      } catch (error) {
        console.warn('Failed to parse AI quiz response, using fallback');
        return this.generateFallbackQuiz(topic, count);
      }
    } catch (error) {
      console.warn('Quiz generation failed, using fallback:', error);
      return this.generateFallbackQuiz(topic, count);
    }
  }

  /**
   * Validate quiz structure and remove duplicates
   */
  private validateAndDeduplicateQuiz(parsed: any, topic: string, count: number): QuizData {
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid quiz structure');
    }

    const uniqueQuestions = new Set<string>();
    const validQuestions = [];

    for (const q of parsed.questions) {
      // Check if question is valid and unique
      if (
        q.question && 
        q.options && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        q.correctAnswer &&
        q.explanation &&
        !uniqueQuestions.has(q.question.toLowerCase())
      ) {
        uniqueQuestions.add(q.question.toLowerCase());
        
        // Ensure proper ID
        q.id = q.id || `q${validQuestions.length + 1}`;
        
        // Validate correct answer format
        if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
          q.correctAnswer = 'A'; // Default fallback
        }
        
        validQuestions.push(q);
      }
    }

    // If we don't have enough valid questions, generate fallback
    if (validQuestions.length < Math.min(count, 3)) {
      return this.generateFallbackQuiz(topic, count);
    }

    return {
      topic: parsed.topic || topic,
      questions: validQuestions.slice(0, count)
    };
  }

  /**
   * Generate fallback quiz when AI is unavailable
   */
  private generateFallbackQuiz(topic: string, count: number): QuizData {
    const questions = [];
    
    const questionTemplates = [
      {
        question: `What is the fundamental concept behind ${topic}?`,
        options: [
          'Understanding the core principles and applications',
          'Memorizing definitions without context',
          'Skipping theoretical foundations',
          'Avoiding practical examples'
        ],
        correctAnswer: 'A',
        explanation: 'Understanding core principles is essential for mastering any topic effectively.'
      },
      {
        question: `Which approach is most effective when learning ${topic}?`,
        options: [
          'Reading without practice',
          'Combining theory with hands-on practice',
          'Only watching videos',
          'Memorizing without understanding'
        ],
        correctAnswer: 'B',
        explanation: 'Combining theoretical knowledge with practical application leads to deeper understanding.'
      },
      {
        question: `What is a common mistake when studying ${topic}?`,
        options: [
          'Taking detailed notes',
          'Practicing regularly',
          'Rushing through concepts without understanding',
          'Asking questions when confused'
        ],
        correctAnswer: 'C',
        explanation: 'Rushing through material without proper understanding leads to weak foundations.'
      },
      {
        question: `How can you best retain knowledge about ${topic}?`,
        options: [
          'Passive reading only',
          'Single study session',
          'Ignoring difficult parts',
          'Regular review and active practice'
        ],
        correctAnswer: 'D',
        explanation: 'Regular review and active practice help consolidate knowledge in long-term memory.'
      },
      {
        question: `What indicates good understanding of ${topic}?`,
        options: [
          'Ability to explain concepts to others',
          'Memorizing all definitions',
          'Completing assignments quickly',
          'Avoiding challenging problems'
        ],
        correctAnswer: 'A',
        explanation: 'Being able to explain concepts clearly to others demonstrates true understanding.'
      }
    ];
    
    for (let i = 0; i < Math.min(count, questionTemplates.length); i++) {
      const template = questionTemplates[i];
      questions.push({
        id: `q${i + 1}`,
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation
      });
    }

    return {
      topic,
      questions
    };
  }

  /**
   * Generate revision notes
   */
  async generateNotes(topic: string, examMode: boolean = false): Promise<string> {
    try {
      const prompt = examMode 
        ? `Create exam-focused revision notes for "${topic}". Include key formulas, important points, and quick facts.`
        : `Create comprehensive study notes for "${topic}". Include explanations, examples, and practice points.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a study notes generator. Return clean, formatted text.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
      }

      return data.choices[0].message.content;
    } catch (error) {
      return this.generateFallbackNotes(topic, examMode);
    }
  }

  /**
   * Generate fallback notes when AI is unavailable
   */
  private generateFallbackNotes(topic: string, examMode: boolean): string {
    if (examMode) {
      return `# ${topic} - Exam Notes

## Key Points:
- Master the fundamental concepts
- Practice with examples
- Review common patterns
- Focus on problem-solving techniques

## Quick Facts:
- ${topic} is essential for understanding this subject
- Regular practice improves retention
- Connect concepts to real-world applications

## Study Tips:
- Create summary cards
- Practice active recall
- Test yourself regularly`;
    } else {
      return `# ${topic} - Study Notes

## Overview:
${topic} is an important concept that requires thorough understanding and practice.

## Key Concepts:
1. Fundamental principles
2. Core definitions
3. Important relationships
4. Practical applications

## Examples:
- Basic examples to illustrate concepts
- Step-by-step problem solving
- Common use cases

## Practice Points:
- Work through exercises
- Apply concepts to new problems
- Review and reinforce learning`;
    }
  }

  /**
   * Analyze performance and provide adaptive updates
   */
  async analyzePerformance(_quizResults: any[], _currentPlan: any): Promise<any> {
    // Implementation for adaptive learning
    return {
      weakTopics: [],
      recommendations: [],
      adjustedSchedule: []
    };
  }
}

export const aiService = new AIService();
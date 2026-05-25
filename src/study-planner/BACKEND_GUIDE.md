# 🔧 Backend Implementation Guide - Study Planner API

This guide provides the backend implementation requirements for the AI Study Planner module.

## 📋 Database Schema

### StudyPlan Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  subject: String,
  topics: [String],
  examDate: Date,
  dailyHours: Number,
  difficultyLevel: String, // 'Beginner' | 'Intermediate' | 'Advanced'
  createdAt: Date,
  updatedAt: Date,
  schedule: [{
    day: String,
    date: Date,
    tasks: [{
      id: String,
      topic: String,
      type: String, // 'Learn' | 'Practice' | 'Review' | 'Quiz'
      duration: Number,
      resources: [{
        id: String,
        title: String,
        type: String, // 'Video' | 'Article' | 'Question' | 'Note'
        url: String,
        duration: Number,
        relevance: Number
      }],
      completed: Boolean,
      performance: Number
    }],
    completed: Boolean
  }],
  performance: {
    overallScore: Number,
    topicScores: Map<String, Number>,
    weakTopics: [String],
    strongTopics: [String],
    studyStreak: Number,
    totalHoursSpent: Number,
    lastUpdated: Date
  }
}
```

### QuizAttempt Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  planId: ObjectId,
  topic: String,
  questions: [ObjectId], // References to Question collection
  answers: Map<String, String>,
  score: Number,
  timestamp: Date,
  weakAreas: [String]
}
```

## 🔌 API Endpoints Implementation

### 1. Generate Study Plan
```javascript
POST /api/study-planner/generate
Authorization: Bearer <token>

Request Body:
{
  subject: String,
  topics: [String],
  examDate: String (ISO date),
  dailyHours: Number,
  difficultyLevel: String
}

Response:
{
  id: String,
  subject: String,
  topics: [String],
  examDate: String,
  dailyHours: Number,
  difficultyLevel: String,
  createdAt: String,
  schedule: DaySchedule[],
  performance: PerformanceMetrics
}

Implementation:
1. Validate user authentication
2. Calculate days until exam
3. Use OpenAI API to generate schedule:
   - Create daily tasks for each topic
   - Distribute topics across days
   - Include Learn, Practice, Review, Quiz tasks
   - Add revision cycles
4. Generate resources for each task (YouTube API integration)
5. Save to database
6. Return generated plan
```

### 2. Get Topic Explanation
```javascript
POST /api/study-planner/explain
Authorization: Bearer <token>

Request Body:
{
  topic: String,
  style: String // 'simple' | 'detailed'
}

Response:
{
  topic: String,
  simple: String,
  detailed: String,
  keyPoints: [String],
  examples: [String],
  realWorldApplications: [String]
}

Implementation:
1. Validate user authentication
2. Use OpenAI API with prompt:
   - For 'simple': "Explain [topic] like I'm 5 years old"
   - For 'detailed': "Provide a detailed technical explanation of [topic]"
3. Parse response into structured format
4. Cache results for 24 hours
5. Return explanation
```

### 3. Generate Questions
```javascript
POST /api/study-planner/questions
Authorization: Bearer <token>

Request Body:
{
  topic: String,
  count: Number,
  difficulty: String // 'Easy' | 'Medium' | 'Hard'
}

Response:
[{
  id: String,
  topic: String,
  type: String, // 'MCQ' | 'ShortAnswer' | 'LongAnswer' | 'Coding' | 'Scenario'
  question: String,
  options: [String], // For MCQ
  correctAnswer: String,
  explanation: String,
  difficulty: String
}]

Implementation:
1. Validate user authentication
2. Use OpenAI API to generate questions:
   - Vary question types
   - Adjust difficulty level
   - Include explanations
3. Validate question quality
4. Cache for 48 hours
5. Return questions array
```

### 4. Submit Quiz Attempt
```javascript
POST /api/study-planner/quiz-submit
Authorization: Bearer <token>

Request Body:
{
  topic: String,
  questions: Question[],
  answers: Map<String, String>,
  score: Number,
  weakAreas: [String]
}

Response:
{
  score: Number,
  feedback: String,
  adaptiveUpdates: [{
    action: String, // 'reschedule' | 'addPractice' | 'recommendVideo' | 'increaseRevision'
    topic: String,
    reason: String,
    changes: Object
  }]
}

Implementation:
1. Validate user authentication
2. Calculate score:
   - Compare answers with correct answers
   - Calculate percentage
3. Identify weak areas (< 60% score)
4. Generate adaptive updates:
   - If score < 60: reschedule topic, add practice
   - If score 60-80: recommend videos, increase revision
   - If score > 80: mark as strong topic
5. Update user's performance metrics
6. Save quiz attempt to database
7. Return score and adaptive updates
```

### 5. Get Recommended Videos
```javascript
POST /api/study-planner/videos
Authorization: Bearer <token>

Request Body:
{
  topic: String
}

Response:
[{
  title: String,
  url: String,
  duration: Number,
  relevance: Number // 0-100
}]

Implementation:
1. Validate user authentication
2. Use YouTube API to search for videos:
   - Query: "[topic] tutorial"
   - Filter by duration (5-30 mins)
   - Sort by relevance
3. Get top 3 results
4. Calculate relevance score based on:
   - View count
   - Rating
   - Upload date
5. Cache for 7 days
6. Return video recommendations
```

### 6. Update Plan Progress
```javascript
PUT /api/study-planner/{planId}/progress
Authorization: Bearer <token>

Request Body:
{
  taskId: String,
  completed: Boolean,
  performance: Number // 0-100
}

Response: StudyPlan (updated)

Implementation:
1. Validate user authentication
2. Verify user owns the plan
3. Find and update task:
   - Set completed status
   - Record performance score
   - Update timestamp
4. Recalculate plan metrics:
   - Overall progress
   - Topic scores
   - Study streak
5. Check for adaptive triggers:
   - If performance < 60: flag for adaptive update
6. Save to database
7. Return updated plan
```

### 7. Get Adaptive Updates
```javascript
GET /api/study-planner/{planId}/adaptive
Authorization: Bearer <token>

Response:
[{
  action: String,
  topic: String,
  reason: String,
  changes: Object
}]

Implementation:
1. Validate user authentication
2. Verify user owns the plan
3. Analyze performance data:
   - Identify weak topics (< 60%)
   - Check study patterns
   - Calculate time spent
4. Generate adaptive updates:
   - Reschedule weak topics
   - Add extra practice questions
   - Recommend easier videos
   - Increase revision frequency
5. Apply changes to schedule
6. Return updates
```

### 8. Generate Notes
```javascript
POST /api/study-planner/notes
Authorization: Bearer <token>

Request Body:
{
  topic: String,
  examMode: Boolean // true for exam-focused notes
}

Response:
String (markdown formatted notes)

Implementation:
1. Validate user authentication
2. Use OpenAI API to generate notes:
   - If examMode: focus on important concepts, formulas, key points
   - Otherwise: comprehensive notes
3. Format as markdown
4. Include:
   - Summary
   - Key concepts
   - Formulas/Definitions
   - Examples
   - Common mistakes
5. Cache for 24 hours
6. Return notes as string
```

### 9. Get Plan
```javascript
GET /api/study-planner/{planId}
Authorization: Bearer <token>

Response: StudyPlan

Implementation:
1. Validate user authentication
2. Verify user owns the plan
3. Fetch from database
4. Return plan
```

### 10. Get Analytics
```javascript
GET /api/study-planner/{planId}/analytics
Authorization: Bearer <token>

Response: PerformanceMetrics

Implementation:
1. Validate user authentication
2. Verify user owns the plan
3. Calculate metrics:
   - Overall score (average of all topic scores)
   - Topic-wise scores
   - Weak topics (< 60%)
   - Strong topics (> 80%)
   - Study streak (consecutive days studied)
   - Total hours spent
4. Return metrics
```

## 🤖 AI Integration (OpenAI API)

### System Prompt for Study Planner
```
You are an expert AI tutor for students. Your role is to:
1. Create personalized study plans
2. Explain complex topics in simple terms
3. Generate diverse practice questions
4. Provide detailed explanations
5. Identify weak areas and recommend improvements

Always:
- Be encouraging and supportive
- Use real-world examples
- Break down complex concepts
- Provide step-by-step explanations
- Adapt to student's level
```

### Example Prompts

**Plan Generation:**
```
Create a study plan for a student with:
- Subject: [subject]
- Topics: [topics]
- Exam Date: [date]
- Daily Study Hours: [hours]
- Difficulty Level: [level]

Generate a schedule with:
1. Daily tasks (Learn, Practice, Review, Quiz)
2. Balanced distribution of topics
3. Revision cycles
4. Realistic time allocations

Return as JSON with schedule array.
```

**Topic Explanation:**
```
Explain "[topic]" in a simple way that a beginner can understand.
Include:
1. Simple explanation (2-3 sentences)
2. Detailed explanation (5-7 sentences)
3. 3-5 key points
4. 2-3 real-world examples
5. 2-3 real-world applications

Return as JSON.
```

**Question Generation:**
```
Generate 5 [difficulty] questions about "[topic]".
Include:
- 2 MCQs
- 1 Short answer
- 1 Long answer
- 1 Scenario-based

For each question provide:
- Question text
- Options (for MCQ)
- Correct answer
- Detailed explanation

Return as JSON array.
```

## 🔄 Adaptive Learning Logic

```javascript
function generateAdaptiveUpdates(performance, plan) {
  const updates = [];
  
  // Analyze weak topics
  const weakTopics = Object.entries(performance.topicScores)
    .filter(([_, score]) => score < 60)
    .map(([topic, _]) => topic);
  
  weakTopics.forEach(topic => {
    // Reschedule weak topic
    updates.push({
      action: 'reschedule',
      topic,
      reason: `Your score in ${topic} is below 60%. Rescheduling for tomorrow.`,
      changes: { rescheduleDate: tomorrow }
    });
    
    // Add practice questions
    updates.push({
      action: 'addPractice',
      topic,
      reason: `Adding 5 extra practice questions for ${topic}`,
      changes: { addQuestions: 5 }
    });
    
    // Recommend easier videos
    updates.push({
      action: 'recommendVideo',
      topic,
      reason: `Recommending beginner-friendly videos for ${topic}`,
      changes: { videoLevel: 'Beginner' }
    });
  });
  
  return updates;
}
```

## 📊 Performance Calculation

```javascript
function calculatePerformance(quizAttempts) {
  const topicScores = {};
  
  // Group attempts by topic
  const byTopic = groupBy(quizAttempts, 'topic');
  
  // Calculate average score per topic
  Object.entries(byTopic).forEach(([topic, attempts]) => {
    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
    topicScores[topic] = avgScore;
  });
  
  // Identify weak and strong topics
  const weakTopics = Object.entries(topicScores)
    .filter(([_, score]) => score < 60)
    .map(([topic, _]) => topic);
  
  const strongTopics = Object.entries(topicScores)
    .filter(([_, score]) => score >= 80)
    .map(([topic, _]) => topic);
  
  // Calculate overall score
  const overallScore = Object.values(topicScores)
    .reduce((sum, score) => sum + score, 0) / Object.keys(topicScores).length;
  
  return {
    overallScore,
    topicScores,
    weakTopics,
    strongTopics,
    studyStreak: calculateStreak(quizAttempts),
    totalHoursSpent: calculateHours(quizAttempts),
    lastUpdated: new Date()
  };
}
```

## 🔐 Security Considerations

1. **Authentication**: Verify JWT token on all endpoints
2. **Authorization**: Ensure user owns the resource
3. **Rate Limiting**: Limit API calls to prevent abuse
4. **Input Validation**: Validate all input data
5. **Error Handling**: Don't expose sensitive information in errors
6. **CORS**: Configure appropriate CORS headers

## 📈 Performance Optimization

1. **Caching**: Cache AI responses for 24-48 hours
2. **Pagination**: Paginate large result sets
3. **Indexing**: Index userId, planId, topic fields
4. **Lazy Loading**: Load schedule data on demand
5. **Compression**: Compress API responses

## 🧪 Testing

```javascript
// Example test cases
describe('Study Planner API', () => {
  test('Generate plan with valid input', async () => {
    const plan = await generatePlan({
      subject: 'Data Structures',
      topics: ['Arrays', 'Linked Lists'],
      examDate: '2024-12-31',
      dailyHours: 2,
      difficultyLevel: 'Intermediate'
    });
    expect(plan.schedule).toBeDefined();
    expect(plan.schedule.length).toBeGreaterThan(0);
  });
  
  test('Calculate performance correctly', async () => {
    const metrics = calculatePerformance(quizAttempts);
    expect(metrics.overallScore).toBeLessThanOrEqual(100);
    expect(metrics.overallScore).toBeGreaterThanOrEqual(0);
  });
});
```

## 📝 Notes

- All timestamps should be in ISO 8601 format
- All IDs should be MongoDB ObjectIds
- Cache responses to reduce API calls
- Use batch operations for bulk updates
- Monitor API usage and costs

# 🏗️ AI Study Planner - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EchoMentor Frontend                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              StudyPlanner.tsx (Main Page)               │  │
│  │  - Orchestrates all components                          │  │
│  │  - Manages view modes (dashboard, schedule, etc)        │  │
│  │  - Handles navigation                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐        │
│    │ Plan    │         │ Study   │         │ Topic   │        │
│    │Generator│         │Schedule │         │Learner  │        │
│    └────┬────┘         └────┬────┘         └────┬────┘        │
│         │                   │                    │             │
│    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐        │
│    │ Quiz    │         │Performance          │ (Learn) │       │
│    │Engine   │         │Analytics │         │         │       │
│    └────┬────┘         └────┬────┘         └────┬────┘        │
│         │                   │                    │             │
│         └───────────────────┼────────────────────┘             │
│                             │                                  │
│         ┌───────────────────▼────────────────────┐             │
│         │   studyPlannerService.ts               │             │
│         │   (API Integration Layer)              │             │
│         │   - generatePlan()                     │             │
│         │   - getTopicExplanation()              │             │
│         │   - generateQuestions()                │             │
│         │   - submitQuizAttempt()                │             │
│         │   - getRecommendedVideos()             │             │
│         │   - updatePlanProgress()               │             │
│         │   - getAdaptiveUpdates()               │             │
│         │   - generateNotes()                    │             │
│         │   - getPerformanceAnalytics()          │             │
│         └───────────────────┬────────────────────┘             │
│                             │                                  │
└─────────────────────────────┼──────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   HTTP Requests   │
                    │   (JWT Auth)      │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────┐
│                   Backend API (Node.js/Express)               │
├─────────────────────────────┼──────────────────────────────────┤
│                             │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │              API Routes & Controllers                   │  │
│  │  - POST /api/study-planner/generate                    │  │
│  │  - POST /api/study-planner/explain                     │  │
│  │  - POST /api/study-planner/questions                   │  │
│  │  - POST /api/study-planner/quiz-submit                 │  │
│  │  - POST /api/study-planner/videos                      │  │
│  │  - PUT /api/study-planner/{planId}/progress            │  │
│  │  - GET /api/study-planner/{planId}/adaptive            │  │
│  │  - POST /api/study-planner/notes                       │  │
│  │  - GET /api/study-planner/{planId}                     │  │
│  │  - GET /api/study-planner/{planId}/analytics           │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │         Business Logic & Services                       │  │
│  │  - Plan Generation Engine                              │  │
│  │  - Topic Explanation Service                           │  │
│  │  - Question Generator                                  │  │
│  │  - Quiz Scoring Engine                                 │  │
│  │  - Performance Calculator                              │  │
│  │  - Adaptive Learning Engine                            │  │
│  │  - Notes Generator                                     │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │         External AI Services                            │  │
│  │  - OpenAI API (Plan, Explain, Questions, Notes)        │  │
│  │  - YouTube API (Video Recommendations)                 │  │
│  │  - Whisper API (Voice Input - Optional)                │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │         Database Layer (MongoDB)                        │  │
│  │  - StudyPlan Collection                                │  │
│  │  - QuizAttempt Collection                              │  │
│  │  - User Performance Data                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
StudyPlanner (Main Page)
├── PlanGenerator (Modal)
│   └── Form Inputs
│       ├── Subject
│       ├── Topics
│       ├── Exam Date
│       ├── Daily Hours
│       └── Difficulty Level
│
├── StudySchedule
│   └── DaySchedule[]
│       └── StudyTask[]
│           ├── Task Type Badge
│           ├── Duration
│           ├── Resources
│           └── Completion Status
│
├── TopicLearner
│   ├── Mode Toggle (Simple/Detailed)
│   ├── Explanation Text
│   ├── Key Points List
│   ├── Examples
│   └── Real-World Applications
│
├── QuizEngine
│   ├── Question Display
│   ├── Answer Options (MCQ)
│   ├── Text Input (Short/Long Answer)
│   ├── Progress Bar
│   ├── Navigation Buttons
│   └── Results Screen
│
└── PerformanceAnalytics
    ├── Overall Score Card
    ├── Study Streak Card
    ├── Hours Spent Card
    ├── Topics Mastered Card
    ├── Weak Areas Alert
    └── Topic Breakdown Chart
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interaction Flow                        │
└─────────────────────────────────────────────────────────────────┘

1. CREATE PLAN
   User Input (Subject, Topics, Exam Date, Hours, Difficulty)
        │
        ▼
   PlanGenerator Component
        │
        ▼
   studyPlannerService.generatePlan()
        │
        ▼
   Backend: POST /api/study-planner/generate
        │
        ▼
   OpenAI API (Generate Schedule)
        │
        ▼
   YouTube API (Get Video Recommendations)
        │
        ▼
   Save to Database
        │
        ▼
   Return StudyPlan Object
        │
        ▼
   Display in StudySchedule Component

2. LEARN TOPIC
   User Clicks on Topic
        │
        ▼
   TopicLearner Component
        │
        ▼
   studyPlannerService.getTopicExplanation()
        │
        ▼
   Backend: POST /api/study-planner/explain
        │
        ▼
   OpenAI API (Generate Explanation)
        │
        ▼
   Return TopicExplanation Object
        │
        ▼
   Display Simple/Detailed Explanation

3. TAKE QUIZ
   User Clicks "Take Quiz"
        │
        ▼
   QuizEngine Component
        │
        ▼
   studyPlannerService.generateQuestions()
        │
        ▼
   Backend: POST /api/study-planner/questions
        │
        ▼
   OpenAI API (Generate Questions)
        │
        ▼
   Return Question[] Array
        │
        ▼
   Display Quiz Interface
        │
        ▼
   User Answers Questions
        │
        ▼
   studyPlannerService.submitQuizAttempt()
        │
        ▼
   Backend: POST /api/study-planner/quiz-submit
        │
        ▼
   Calculate Score & Weak Areas
        │
        ▼
   Generate Adaptive Updates
        │
        ▼
   Update Performance Metrics
        │
        ▼
   Return Score & Feedback
        │
        ▼
   Display Results & Recommendations

4. VIEW ANALYTICS
   User Clicks Analytics
        │
        ▼
   PerformanceAnalytics Component
        │
        ▼
   studyPlannerService.getPerformanceAnalytics()
        │
        ▼
   Backend: GET /api/study-planner/{planId}/analytics
        │
        ▼
   Calculate Metrics from Database
        │
        ▼
   Return PerformanceMetrics Object
        │
        ▼
   Display Charts & Insights

5. ADAPTIVE LEARNING
   Performance Drops Below 60%
        │
        ▼
   Backend Detects Weak Area
        │
        ▼
   Generate Adaptive Updates
        │
        ▼
   studyPlannerService.getAdaptiveUpdates()
        │
        ▼
   Backend: GET /api/study-planner/{planId}/adaptive
        │
        ▼
   Return AdaptiveUpdate[] Array
        │
        ▼
   Apply Changes to Schedule
        │
        ▼
   Notify User of Changes
```

## State Management Flow

```
StudyPlanner Component State
│
├── currentPlan: StudyPlan | null
│   ├── id, subject, topics
│   ├── schedule: DaySchedule[]
│   └── performance: PerformanceMetrics
│
├── viewMode: 'dashboard' | 'schedule' | 'learn' | 'quiz' | 'analytics'
│
├── selectedTopic: string | null
│
├── selectedTask: StudyTask | null
│
├── showPlanGenerator: boolean
│
├── loading: boolean
│
└── error: string | null

Component Updates:
- User creates plan → currentPlan updated
- User switches view → viewMode updated
- User selects topic → selectedTopic updated
- User completes task → currentPlan.schedule updated
- Quiz submitted → currentPlan.performance updated
- Adaptive updates applied → currentPlan.schedule rescheduled
```

## API Request/Response Flow

```
Frontend Request
    │
    ▼
studyPlannerService Method
    │
    ├── Validate Input
    ├── Add JWT Token
    ├── Set Headers
    └── Make HTTP Request
    │
    ▼
Backend Receives Request
    │
    ├── Verify JWT Token
    ├── Authorize User
    ├── Validate Input
    └── Process Request
    │
    ▼
Business Logic
    │
    ├── Database Query/Update
    ├── AI API Call (if needed)
    ├── Calculation/Processing
    └── Generate Response
    │
    ▼
Backend Returns Response
    │
    ├── Success: Return Data
    └── Error: Return Error Message
    │
    ▼
Frontend Receives Response
    │
    ├── Parse JSON
    ├── Update Component State
    ├── Handle Errors
    └── Update UI
    │
    ▼
User Sees Updated Content
```

## Database Schema Relationships

```
User
  │
  ├─── StudyPlan (1:Many)
  │      │
  │      ├─── DaySchedule (1:Many)
  │      │      │
  │      │      └─── StudyTask (1:Many)
  │      │             │
  │      │             └─── Resource (1:Many)
  │      │
  │      └─── PerformanceMetrics (1:1)
  │
  └─── QuizAttempt (1:Many)
         │
         ├─── Question (Many:Many)
         │
         └─── Answer (1:Many)
```

## Performance Optimization Strategy

```
Frontend Optimization
├── Component Lazy Loading
├── Memoization (React.memo)
├── Code Splitting
└── Image Optimization

Backend Optimization
├── Database Indexing
│   ├── userId
│   ├── planId
│   └── topic
├── Query Optimization
├── Response Caching
│   ├── AI Responses (24h)
│   ├── Video Recommendations (7d)
│   └── Topic Explanations (24h)
└── API Response Compression

Network Optimization
├── Gzip Compression
├── Minified Assets
├── CDN for Static Files
└── Lazy Loading of Data
```

## Security Architecture

```
Frontend Security
├── JWT Token Storage (localStorage)
├── HTTPS Only
├── Input Validation
└── XSS Prevention

Backend Security
├── JWT Verification
├── Authorization Checks
├── Input Sanitization
├── Rate Limiting
├── CORS Configuration
└── Error Handling (No Sensitive Info)

Database Security
├── User Isolation
├── Encrypted Passwords
├── Audit Logging
└── Backup Strategy
```

## Scalability Architecture

```
Horizontal Scaling
├── Load Balancer
├── Multiple API Servers
├── Database Replication
└── Cache Layer (Redis)

Vertical Scaling
├── Optimize Queries
├── Increase Server Resources
├── Database Optimization
└── Code Optimization

Monitoring & Alerts
├── API Response Time
├── Error Rate
├── Database Performance
├── User Engagement
└── System Health
```

---

This architecture ensures:
- ✅ Scalability
- ✅ Performance
- ✅ Security
- ✅ Maintainability
- ✅ User Experience

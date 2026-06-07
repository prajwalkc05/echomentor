# EchoMentor 🎓

An AI-powered mentorship platform for students — helping them learn smarter, track progress, build resumes, and explore opportunities.

---

## 🌐 Live URLs

| Service | URL |
|--------|-----|
| Frontend | *(Deploy via Netlify / Vercel)* |
| Backend API | https://echobackend-dexy.onrender.com |

---

## 📋 Project Overview

EchoMentor is a full-stack web application that provides students with a suite of AI-powered tools including:

- AI Chat Mentor
- Code Assistant
- Resume Builder
- Study Planner
- Mood Tracker
- PPT Generator
- Opportunities Board
- Courses & Startup Guide

---

## 🧰 Technologies Used

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.3 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.2.4 | Build tool & dev server |
| Tailwind CSS | 4.1.17 | Styling |
| Lucide React | 1.14.0 | Icons |
| Recharts | 3.8.1 | Charts & data visualization |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.4.0 | Tailwind class merging |
| Firebase | 12.12.1 | Auth / Storage (optional) |
| vite-plugin-singlefile | 2.3.0 | Bundle into single HTML file |

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Render | Hosting platform |

---

## 📁 Frontend Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── NotificationDropdown.tsx  # Notification bell & dropdown
│   └── Logo.tsx
├── context/             # Global state management
│   ├── UserContext.tsx  # Auth & user state
│   ├── AppDataContext.tsx # All API data state
│   ├── NotificationContext.tsx  # Notification state & actions
│   └── AdminContext.tsx
├── pages/               # Application pages
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── Dashboard.tsx
│   ├── AiChat.tsx       # Includes notification dropdown
│   ├── CodeAssistant.tsx
│   ├── MoodTracker.tsx
│   ├── StudyPlanner.tsx
│   ├── PptGenerator.tsx
│   ├── ResumeBuilder.tsx
│   ├── Opportunities.tsx  # Includes notification dropdown
│   ├── Courses.tsx
│   ├── StartupGuide.tsx
│   ├── Settings.tsx
│   └── HelpSupport.tsx
├── resume-builder/      # Standalone Resume Builder module
│   ├── components/      # Form components
│   ├── templates/       # 4 resume templates
│   ├── types/           # TypeScript interfaces
│   ├── data/            # Default data
│   └── utils/           # Helper functions
├── services/
│   └── api.service.ts   # All backend API calls
├── utils/
│   ├── api.ts           # Base API utility with JWT headers
│   └── cn.ts            # Class name utility
├── types/
│   └── index.ts         # Page type definitions
├── App.tsx              # Root component & routing
├── main.tsx             # Entry point
└── index.css            # Global styles & print styles
```

---

## 🔌 Backend API Endpoints

### Auth — No token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user, returns JWT token |

### User — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |

### AI Chat — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Send message to AI |
| GET | `/api/ai/history` | Get chat history |

### Code Assistant — Token required

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/code/assist` | `{ action, input, language }` | generate / explain / debug / review |
| GET | `/api/code/history` | — | Get code history |

### Resume — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/ai` | Generate AI resume |
| POST | `/api/resume/manual` | Save manual resume |
| GET | `/api/resume/` | Get all resumes |

### Study Planner — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study-planner/create` | Generate AI study plan |

### Mood Tracker — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mood/track` | Track mood with AI |
| GET | `/api/mood/history` | Get mood history |

### PPT Generator — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ppt/generate` | Generate & download PPT |
| GET | `/api/ppt/history` | Get PPT history |

### Opportunities — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opportunities/` | Get all opportunities |
| GET | `/api/opportunities/matched` | Get matched opportunities |
| POST | `/api/opportunities/bookmark` | Bookmark opportunity |
| GET | `/api/opportunities/bookmarks` | Get bookmarks |
| DELETE | `/api/opportunities/bookmark/:id` | Remove bookmark |
| POST | `/api/opportunities/admin/create` | **(Admin)** Create new opportunity |

### Notifications — Token required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | Get all notifications |
| GET | `/api/notifications/unread` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |
| PUT | `/api/notifications/read/:id` | Mark one as read |
| POST | `/api/admin/notifications/send` | **(Admin)** Send targeted notifications |

---

## 🔐 Authentication Flow

1. User signs up → `POST /api/auth/signup` → JWT token returned
2. Token stored in `localStorage`
3. All protected requests include `Authorization: Bearer <token>` header
4. On app load, token is validated via `GET /api/user/profile`
5. Logout clears token from localStorage

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Frontend Setup

```bash
# Clone the repository
git clone <repo-url>
cd echomentor

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=https://echobackend-dexy.onrender.com
```

---

## 🎨 Resume Builder

The Resume Builder is a standalone module with 4 professional templates:

| Template | Style | Colors |
|----------|-------|--------|
| Classic Dark | Sidebar layout | `#2d2d2d` dark |
| Warm Beige | Two-column decorative | `#b8935a` tan |
| Minimal Clean | Single column badges | `#4a5568` gray |
| Modern Teal | Geometric shapes | `#2d5f6e` teal |

**Features:**
- Live preview (A4 sized — 794×1123px)
- Print / Save as PDF
- AI Resume Generation (connected to `/api/resume/ai`)
- Manual form with dynamic sections
- Photo upload

---

## 🖥️ Pages & Features

| Page | Description |
|------|-------------|
| Landing | Marketing page with features & CTA |
| Signup / Login | JWT-based authentication |
| Dashboard | Stats, quick access, activity feed, calendar |
| AI Chat | Real-time AI conversation with history, notifications |
| Code Assistant | Write, explain, debug, review code with AI |
| Study Planner | AI-generated study plans |
| Mood Tracker | Daily mood tracking with AI suggestions |
| PPT Generator | AI-powered presentation generator |
| Resume Builder | 4-template resume builder with PDF export |
| Opportunities | Job, internship & scholarship listings, notifications |
| Courses | Learning resources |
| Startup Guide | Entrepreneurship resources |
| Settings | Profile & preferences |
| Help & Support | FAQs and contact |
| **Admin Panel** | Manage opportunities, send notifications, view analytics |

---

## 🎨 Design System

| Property | Value |
|----------|-------|
| Primary Color | `#7c3aed` (Purple) |
| Background | `#0f0f1e` (Dark Navy) |
| Card Background | `#1a1a2e` |
| Text Primary | `#ffffff` |
| Text Secondary | `#9ca3af` |
| Border | `rgba(255,255,255,0.05)` |
| Font | Inter, system-ui |

---

## 📦 Build Output

The project builds into a **single `index.html` file** using `vite-plugin-singlefile` — all JS and CSS are inlined, making deployment as simple as uploading one file.

```
dist/
└── index.html  (~480KB gzipped: ~120KB)
```

---

## 🌍 Deployment

### Frontend (Netlify — Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Frontend (Vercel)

```bash
npm install -g vercel
vercel --prod
```

### Backend

Currently hosted on **Render** at:
`https://echobackend-dexy.onrender.com`

---

## 👥 Team

Built with ❤️ for students by the EchoMentor team.

---

## 🔔 Notification System

### User Features
- **Bell Icon Dropdown** in page headers (Opportunities, AI Chat)
- Real-time unread count badge
- Notification types: Admin, Announcement, Alert, Update, Info
- Click to mark as read
- Auto-refresh every 30 seconds

### Admin Features
- Send targeted notifications to:
  - All Users
  - Free Users only
  - Pro Users only
  - Premium Users only
- Set notification title, message, type, and priority
- Track notification analytics

### Example Admin Notification:
```json
{
  "title": "🎉 New Feature Alert!",
  "message": "Check out our new AI Resume Builder with 4 templates!",
  "targetAudience": "all",
  "type": "announcement",
  "priority": "high"
}
```

**API Endpoint:** `POST /api/admin/notifications/send`

---

## 📊 Admin Panel Features

### Dashboard
- User statistics (total, free, pro, premium)
- Daily activity tracking
- Revenue analytics
- Recent user activity feed

### Opportunities Management
- Create, edit, delete opportunities
- Support for Jobs, Internships, Hackathons, Scholarships, Fellowships
- Filter by category

### Notification System
- Broadcast messages to users
- Target specific subscription tiers
- Track notification delivery and read status

### Analytics
- AI usage monitoring
- Resume generation stats
- PPT creation tracking
- User engagement metrics

**Access:** Login as admin with `ADMIN_EMAIL` environment variable

import { useEffect, useState } from 'react';
import { Page } from './types';
import { useUser } from './context/UserContext';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AiChat from './pages/AiChat';
import MoodTracker from './pages/MoodTracker';
import StudyPlanner from './pages/StudyPlanner';
import Opportunities from './pages/Opportunities';
import ResumeBuilder from './pages/ResumeBuilder';
import CodeAssistant from './pages/CodeAssistant';
import PptGenerator from './pages/PptGenerator';
import Courses from './pages/Courses';
import Settings from './pages/Settings';
import StartupGuide from './pages/StartupGuide';
import HelpSupport from './pages/HelpSupport';
import Onboarding from './pages/Onboarding';
import CourseOnboarding from './courses/CourseOnboarding';
import AdminApp from './admin/AdminApp';

const PROTECTED_PAGES: Page[] = [
  'dashboard', 'ai-chat', 'mood-tracker', 'study-planner',
  'opportunities', 'resume-builder', 'code-assistant', 'ppt-generator',
  'courses', 'settings', 'startup-guide', 'help', 'ai-tools',
];

export default function App() {
  const { user, isLoggedIn, logout } = useUser();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [showCourseOnboarding, setShowCourseOnboarding] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Check admin authentication on mount
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && currentPage === 'admin') {
      setIsAdminAuthenticated(true);
    }
  }, [currentPage]);

  useEffect(() => {
    if (user.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.darkMode]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Check if user needs course onboarding - only for new users
  useEffect(() => {
    if (isLoggedIn && !hasCheckedOnboarding && isNewUser) {
      const profile = localStorage.getItem('userLearningProfile');
      if (!profile) {
        setShowCourseOnboarding(true);
      }
      setHasCheckedOnboarding(true);
    }
    
    if (!isLoggedIn) {
      setHasCheckedOnboarding(false);
      setShowCourseOnboarding(false);
      setIsNewUser(false);
    }
  }, [isLoggedIn, hasCheckedOnboarding, isNewUser]);

  const navigate = (page: Page) => {
    // Admin page requires separate authentication
    if (page === 'admin') {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setIsAdminAuthenticated(false);
      } else {
        setIsAdminAuthenticated(true);
      }
      setCurrentPage(page);
      return;
    }

    // Block access to protected pages if not logged in
    if (PROTECTED_PAGES.includes(page) && !isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    if (['ai-chat', 'ppt-generator', 'code-assistant'].includes(page)) {
      setAiToolsOpen(true);
    }
  };

  // Only show CourseOnboarding if logged in and on a non-public page
  if (showCourseOnboarding && isLoggedIn && !['landing', 'signup', 'login'].includes(currentPage)) {
    return (
      <CourseOnboarding
        onComplete={() => {
          setShowCourseOnboarding(false);
          setCurrentPage('dashboard');
        }}
        onSkip={() => {
          setShowCourseOnboarding(false);
          setCurrentPage('dashboard');
        }}
      />
    );
  }

  if (currentPage === 'landing') return <LandingPage onNavigate={navigate} />;
  if (currentPage === 'signup') return <SignupPage onNavigate={navigate} onNewUserSignup={() => setIsNewUser(true)} />;
  if (currentPage === 'login') return <LoginPage onNavigate={navigate} />;
  if (currentPage === 'onboarding') return <Onboarding onNavigate={navigate} />;
  
  // Admin panel with separate authentication
  if (currentPage === 'admin') {
    if (!isAdminAuthenticated) {
      return <LandingPage onNavigate={navigate} />;
    }
    return <AdminApp onLogout={() => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setIsAdminAuthenticated(false);
      navigate('landing');
    }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        aiToolsOpen={aiToolsOpen}
        setAiToolsOpen={setAiToolsOpen}
      />
      {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {currentPage === 'ai-chat' && <AiChat onNavigate={navigate} />}
      {currentPage === 'mood-tracker' && <MoodTracker />}
      {currentPage === 'study-planner' && <StudyPlanner />}
      {currentPage === 'opportunities' && <Opportunities />}
      {currentPage === 'resume-builder' && <ResumeBuilder />}
      {currentPage === 'code-assistant' && <CodeAssistant />}
      {currentPage === 'ppt-generator' && <PptGenerator />}
      {currentPage === 'courses' && <Courses />}
      {currentPage === 'settings' && <Settings onNavigate={navigate} />}
      {currentPage === 'startup-guide' && <StartupGuide />}
      {currentPage === 'help' && <HelpSupport />}
    </div>
  );
}

import { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import { AdminSubscriptions, AdminAIUsage, AdminResume, AdminPPT, AdminCourses, AdminOpportunities, AdminNotifications, AdminSettings, AdminSecurity } from './pages/AdminPages';
import AdminStartupGuide from './pages/AdminStartupGuide';

export type AdminPage =
  | 'dashboard' | 'users' | 'subscriptions' | 'analytics'
  | 'ai-usage' | 'resume' | 'ppt' | 'courses' | 'startup'
  | 'opportunities' | 'notifications' | 'settings' | 'security';

export default function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>('dashboard');

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden">
      <AdminSidebar currentPage={page} onNavigate={setPage} onLogout={onLogout} />
      <div className="flex-1 overflow-y-auto">
        {page === 'dashboard' && <AdminDashboard />}
        {page === 'users' && <AdminUsers />}
        {page === 'analytics' && <AdminAnalytics />}
        {page === 'subscriptions' && <AdminSubscriptions />}
        {page === 'ai-usage' && <AdminAIUsage />}
        {page === 'resume' && <AdminResume />}
        {page === 'ppt' && <AdminPPT />}
        {page === 'courses' && <AdminCourses />}
        {page === 'startup' && <AdminStartupGuide />}
        {page === 'opportunities' && <AdminOpportunities />}
        {page === 'notifications' && <AdminNotifications />}
        {page === 'settings' && <AdminSettings />}
        {page === 'security' && <AdminSecurity />}
      </div>
    </div>
  );
}

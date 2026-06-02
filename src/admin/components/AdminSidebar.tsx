import { LayoutDashboard, Users, CreditCard, Bot, FileText, Presentation, BookOpen, Rocket, Briefcase, Bell, Tag, Settings, Shield, BarChart3, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminPage } from '../AdminApp';
import { useState } from 'react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'ai-usage', label: 'AI Usage', icon: Bot },
  { id: 'resume', label: 'Resume Builder', icon: FileText },
  { id: 'ppt', label: 'PPT Generator', icon: Presentation },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'startup', label: 'Startup Guide', icon: Rocket },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
];

interface Props {
  currentPage: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ currentPage, onNavigate, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-[68px]' : 'w-60'} h-screen bg-[#0F172A] border-r border-white/5 flex flex-col transition-all duration-200 shrink-0`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">E</div>
            <span className="text-white font-bold text-sm">EchoMentor</span>
            <span className="text-purple-400 text-xs bg-purple-500/20 px-1.5 py-0.5 rounded-md">Admin</span>
          </div>
        )}
        {collapsed && <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white mx-auto">E</div>}
        <button onClick={() => setCollapsed(p => !p)} className="text-gray-500 hover:text-white transition-colors ml-auto">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id as AdminPage)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-linear-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/5 pt-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

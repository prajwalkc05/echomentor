import {
  LayoutDashboard, MessageCircle, Smile, Calendar, Wrench, Briefcase,
  FileText, Rocket, BookOpen, Settings, HelpCircle, ChevronRight, ChevronDown, Zap
} from 'lucide-react';
import { Page } from '../types';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  aiToolsOpen: boolean;
  setAiToolsOpen: (open: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-chat', label: 'AI Chat', icon: MessageCircle },
  { id: 'mood-tracker', label: 'Mood Tracker', icon: Smile },
  { id: 'study-planner', label: 'Study Planner', icon: Calendar },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
  { id: 'startup-guide', label: 'Startup Guide', icon: Rocket },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

const aiSubItems = [
  { id: 'ai-chat', label: 'AI Chat' },
  { id: 'ppt-generator', label: 'PPT Generator' },
  { id: 'code-assistant', label: 'Code Assistant' },
];

export default function Sidebar({ currentPage, onNavigate, aiToolsOpen, setAiToolsOpen }: SidebarProps) {
  const { user } = useUser();
  return (
    <div className="w-52 min-w-52 h-screen bg-[#0d0d1a] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-4 pb-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="9" r="5" fill="white" opacity="0.9"/>
              <circle cx="9.5" cy="8" r="1.5" fill="#7c3aed"/>
              <circle cx="14.5" cy="8" r="1.5" fill="#7c3aed"/>
              <path d="M9 13 Q12 16 15 13" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold">
            <span className="text-white">Echo</span>
            <span className="text-purple-400">Mentor</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        {/* AI Tools dropdown */}
        <button
          onClick={() => setAiToolsOpen(!aiToolsOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            ['ai-chat','ppt-generator','code-assistant'].includes(currentPage)
              ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Wrench size={18} />
          <span className="flex-1 text-left">AI Tools</span>
          {aiToolsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {aiToolsOpen && (
          <div className="ml-6 space-y-0.5">
            {aiSubItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  currentPage === item.id
                    ? 'text-purple-400 bg-purple-600/10'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {navItems.slice(4).map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Subscription widget */}
      {(user.subscriptionPlan === 'Pro' || user.subscriptionPlan === 'Premium') ? (
        <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold">{user.subscriptionPlan} Plan ✓</p>
            {user.subscriptionData?.endDate && (
              <p className="text-gray-500 text-xs truncate">
                Until {new Date(user.subscriptionData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-3 mb-3">
          <button
            onClick={() => onNavigate('subscription')}
            className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl bg-gradient-to-r from-purple-600/25 to-indigo-600/25 border border-purple-500/30 hover:border-purple-500/60 hover:from-purple-600/35 hover:to-indigo-600/35 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-600/40 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-yellow-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-xs font-semibold">Upgrade to Pro</p>
              <p className="text-purple-400 text-xs">Unlock all features</p>
            </div>
          </button>
        </div>
      )}

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer" onClick={() => onNavigate('settings')}>
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{user.avatar}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name || 'My Account'}</p>
            <p className="text-purple-400 text-xs">{user.role}</p>
          </div>
          <ChevronDown size={12} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}

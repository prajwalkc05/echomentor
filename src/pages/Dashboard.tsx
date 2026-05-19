import { useEffect } from 'react';
import { ChevronRight, ArrowRight, Flame, MessageCircle, CheckSquare, Smile, Calendar, Presentation, Code, FileText, Briefcase, Plus } from 'lucide-react';
import { Page } from '../types';
import { useUser } from '../context/UserContext';
import { useAppData } from '../context';
import { storage } from '../utils/storage';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const quickAccess = [
  { icon: <MessageCircle size={22} className="text-purple-400" />, bg: 'bg-purple-600/20', title: 'AI Chat', desc: 'Get instant help from your AI mentor', page: 'ai-chat' as Page },
  { icon: <Calendar size={22} className="text-green-400" />, bg: 'bg-green-600/20', title: 'Study Planner', desc: 'Plan your study and track progress', page: 'study-planner' as Page },
  { icon: <Smile size={22} className="text-yellow-400" />, bg: 'bg-yellow-600/20', title: 'Mood Tracker', desc: 'Track your mood and well-being', page: 'mood-tracker' as Page },
  { icon: <Presentation size={22} className="text-pink-400" />, bg: 'bg-pink-600/20', title: 'PPT Generator', desc: 'Create presentations in seconds', page: 'ppt-generator' as Page },
  { icon: <Code size={22} className="text-blue-400" />, bg: 'bg-blue-600/20', title: 'Code Assistant', desc: 'Write, debug and optimize code', page: 'code-assistant' as Page },
  { icon: <FileText size={22} className="text-indigo-400" />, bg: 'bg-indigo-600/20', title: 'Resume Builder', desc: 'Build a professional resume', page: 'resume-builder' as Page },
];

const quotes = [
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useUser();
  const { chatHistory, moodHistory, studyPlans, fetchChatHistory, fetchMoodHistory } = useAppData();

  // Read local chat sessions count for accurate display
  const localSessions = (() => {
    try { return storage.getJSON('aiChatSessions') || []; } catch { return []; }
  })();
  const chatCount = Math.max(Array.isArray(chatHistory) ? chatHistory.length : 0, Array.isArray(localSessions) ? localSessions.length : 0);

  useEffect(() => {
    fetchChatHistory();
    fetchMoodHistory();
  }, []);

  const today = new Date();
  const quote = quotes[today.getDate() % quotes.length];
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const todayMood = moodHistory.find(m => new Date(m.date).toDateString() === today.toDateString());
  const moodEmojiMap: Record<string, string> = { awesome: '😄', good: '🙂', neutral: '😐', low: '😕', bad: '😢', happy: '😄', sad: '😢', angry: '😠', anxious: '😰' };
  const moodKey = todayMood?.mood?.toLowerCase().split(' ')[0] || '';
  const moodEmoji = moodEmojiMap[moodKey] || (todayMood ? '😐' : '—');

  const stats = [
    { icon: <Flame size={20} className="text-orange-400" />, bg: 'bg-orange-400/10', label: 'Study Streak', val: String(Array.isArray(studyPlans) ? studyPlans.length : 0), unit: 'plans', color: 'text-orange-400' },
    { icon: <MessageCircle size={20} className="text-blue-400" />, bg: 'bg-blue-400/10', label: 'AI Chats', val: String(chatCount), unit: 'sessions', color: 'text-blue-400' },
    { icon: <CheckSquare size={20} className="text-green-400" />, bg: 'bg-green-400/10', label: 'Study Plans', val: String(Array.isArray(studyPlans) ? studyPlans.length : 0), unit: 'total', color: 'text-green-400' },
    { icon: <Smile size={20} className="text-yellow-400" />, bg: 'bg-yellow-400/10', label: 'Mood Today', val: moodEmoji, unit: todayMood ? todayMood.mood.split(' ')[0] : 'not set', color: 'text-yellow-400' },
  ];

  // Merge local sessions + backend history for recent activity
  const localChatActivity = Array.isArray(localSessions) ? localSessions.slice(0, 3).map((s: any) => ({
    icon: <MessageCircle size={14} className="text-blue-400" />,
    bg: 'bg-blue-600/20',
    title: (s.title || s.messages?.[0]?.text || 'Chat session').slice(0, 50),
    time: s.time || 'Recently',
    page: 'ai-chat' as Page,
  })) : [];

  const recentActivity = [
    ...(localChatActivity.length > 0 ? localChatActivity : (Array.isArray(chatHistory) ? chatHistory.slice(0, 3) : []).map(chat => ({
      icon: <MessageCircle size={14} className="text-blue-400" />,
      bg: 'bg-blue-600/20',
      title: (chat.message || '').slice(0, 50) || 'Chat session',
      time: chat.timestamp && !isNaN(new Date(chat.timestamp).getTime())
        ? new Date(chat.timestamp).toLocaleDateString() : 'Recently',
      page: 'ai-chat' as Page,
    }))),
    ...(Array.isArray(moodHistory) ? moodHistory.slice(0, 2) : []).map(mood => ({
      icon: <Smile size={14} className="text-yellow-400" />,
      bg: 'bg-yellow-600/20',
      title: `Mood: ${(mood.mood || '').split(' ')[0]}`,
      time: mood.date && !isNaN(new Date(mood.date).getTime())
        ? new Date(mood.date).toLocaleDateString() : 'Recently',
      page: 'mood-tracker' as Page,
    })),
  ].slice(0, 4);

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-white text-xl font-bold">Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋</h1>
          <p className="text-gray-400 text-sm">Let's make today productive and amazing.</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          {user.avatar}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-[1fr_280px] gap-6">

          {/* Left column */}
          <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
                  <div>
                    <p className="text-gray-500 text-xs">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-gray-600 text-xs">{s.unit}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Access */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-semibold">Quick Access</h2>
                <button className="text-purple-400 text-sm flex items-center gap-1">View all <ArrowRight size={14} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {quickAccess.map((q, i) => (
                  <button key={i} onClick={() => onNavigate(q.page)} className="bg-[#1a1a2e] border border-white/5 rounded-xl p-4 text-left hover:border-purple-500/30 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${q.bg} rounded-xl flex items-center justify-center shrink-0`}>{q.icon}</div>
                      <div>
                        <p className="text-white text-sm font-medium">{q.title}</p>
                        <p className="text-gray-500 text-xs">{q.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <div className="flex items-center gap-3 py-4 text-center justify-center">
                  <MessageCircle size={18} className="text-gray-600" />
                  <p className="text-gray-500 text-sm">No activity yet. Start using the app!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((item, i) => (
                    <div key={i} onClick={() => onNavigate(item.page)} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <div className={`w-7 h-7 ${item.bg} rounded-lg flex items-center justify-center shrink-0`}>{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{item.title}</p>
                        <p className="text-gray-500 text-xs">{item.time}</p>
                      </div>
                      <ChevronRight size={12} className="text-gray-600 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Calendar */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Calendar</h3>
                <span className="text-gray-400 text-xs">{monthName}</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <span key={i} className="text-gray-600 text-xs">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - firstDay + 1;
                  if (day < 1 || day > daysInMonth) return <div key={i} />;
                  const isToday = day === today.getDate();
                  return (
                    <div key={i} className={`text-xs py-1.5 rounded-lg cursor-pointer transition-colors ${isToday ? 'bg-purple-600 text-white font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Study Plans</h3>
                <button onClick={() => onNavigate('study-planner')} className="text-purple-400 text-xs flex items-center gap-1"><Plus size={12} /> Add</button>
              </div>
              {(Array.isArray(studyPlans) ? studyPlans.length : 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-2">
                    <CheckSquare size={20} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-xs">No study plans yet.</p>
                  <button onClick={() => onNavigate('study-planner')} className="text-purple-400 text-xs mt-2 hover:underline">Go to Study Planner →</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {(Array.isArray(studyPlans) ? studyPlans.slice(0, 3) : []).map((plan, i) => (
                    <div key={i} onClick={() => onNavigate('study-planner')} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <CheckSquare size={12} className="text-purple-400 shrink-0" />
                      <p className="text-gray-300 text-xs truncate">{plan.title}</p>
                    </div>
                  ))}
                  {(Array.isArray(studyPlans) ? studyPlans.length : 0) > 3 && (
                    <button onClick={() => onNavigate('study-planner')} className="text-purple-400 text-xs hover:underline w-full text-center pt-1">+{(Array.isArray(studyPlans) ? studyPlans.length : 0) - 3} more →</button>
                  )}
                </div>
              )}
            </div>

            {/* Daily Motivation */}
            <div className="bg-linear-to-br from-purple-900 to-indigo-900 border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.3),transparent)] pointer-events-none" />
              <h3 className="text-white font-semibold text-sm mb-2 relative z-10">Daily Motivation ✨</h3>
              <p className="text-gray-300 text-sm italic relative z-10 mb-2">"{quote.text}"</p>
              <p className="text-purple-300 text-xs relative z-10">– {quote.author}</p>
            </div>

            {/* Opportunities */}
            <div onClick={() => onNavigate('opportunities')} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-purple-500/30 transition-all">
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center shrink-0">
                <Briefcase size={20} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Explore Opportunities</p>
                <p className="text-gray-500 text-xs">Discover internships, jobs & scholarships.</p>
              </div>
              <ChevronRight size={14} className="text-gray-600 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Bell, Settings, Plus, BookOpen, Target, Flame, Trophy, Calendar, TrendingUp, MoreVertical, CheckCircle, AlertCircle, History, Zap } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useStudyStore } from '../store/studyStore';

interface PremiumDashboardProps {
  onNewPlan?: () => void;
  onViewHistory?: () => void;
  currentPlan?: any;
  completedTopics?: Set<string>;
  topicScores?: Record<string, number>;
  studyStreak?: number;
}

export default function PremiumDashboard({ 
  onNewPlan, 
  onViewHistory,
  currentPlan, 
}: PremiumDashboardProps) {
  const store = useStudyStore();
  const completedTopics = store.topicsCompleted;
  const topicScores = store.topicScores;
  const studyStreak = store.streak;
  
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  // Calculate real data from current plan
  const totalTopics = currentPlan?.topics?.length || 0;
  const completedCount = Array.from(completedTopics || []).length;
  const avgScore = Object.keys(topicScores || {}).length > 0 
    ? Math.round(Object.values(topicScores || {}).reduce((sum: number, score: number) => sum + score, 0) / Object.values(topicScores || {}).length)
    : 0;

  // Generate chart data from schedule
  const chartData = (currentPlan?.schedule || []).slice(0, 7).map((day: any) => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: (day.tasks?.reduce((sum: number, task: any) => sum + (task.duration || 0), 0) || 0) / 60
  }));

  // Generate subjects data from topics
  const subjectsData = (currentPlan?.topics || []).map((topic: string, idx: number) => ({
    name: topic,
    value: completedTopics?.has(topic) ? 100 : Math.floor(Math.random() * 40),
    color: ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F97316'][idx % 5]
  }));

  // Get today's tasks from schedule
  const todaysTasks = (currentPlan?.schedule || []).find((day: any) => {
    const dayDate = new Date(day.date);
    return dayDate.toDateString() === today.toDateString();
  })?.tasks?.map((task: any) => ({
    time: `${task.startTime || '09:00 AM'} - ${task.endTime || '10:00 AM'}`,
    subject: task.topic || 'Study',
    topic: task.description || 'Learning session',
    duration: `${task.duration || 60}m`,
    status: task.completed ? 'completed' : 'pending'
  })) || [];

  const statsCards = [
    { 
      icon: BookOpen, 
      title: 'Total Study Hours', 
      value: `${(chartData.reduce((sum: number, d: any) => sum + d.hours, 0)).toFixed(1)} hrs`, 
      growth: '+12%', 
      color: 'from-blue-600/20 to-blue-900/20', 
      iconColor: 'text-blue-400', 
      borderColor: 'border-blue-500/30' 
    },
    { 
      icon: Target, 
      title: 'Tasks Completed', 
      value: `${completedCount}/${totalTopics}`, 
      growth: '+15%', 
      color: 'from-purple-600/20 to-purple-900/20', 
      iconColor: 'text-purple-400', 
      borderColor: 'border-purple-500/30' 
    },
    { 
      icon: Flame, 
      title: 'Current Streak', 
      value: `${studyStreak} Days`, 
      growth: 'Keep it up!', 
      color: 'from-orange-600/20 to-orange-900/20', 
      iconColor: 'text-orange-400', 
      borderColor: 'border-orange-500/30' 
    },
    { 
      icon: Trophy, 
      title: 'Average Score', 
      value: `${avgScore}%`, 
      growth: completedCount > 0 ? 'Great progress!' : 'Start learning', 
      color: 'from-green-600/20 to-green-900/20', 
      iconColor: 'text-green-400', 
      borderColor: 'border-green-500/30' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in-progress':
        return <Zap size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-[#0f0f1e] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f1e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Study Planner</h1>
            <p className="text-gray-400 text-sm mt-1">Plan your study, stay focused and achieve your goals</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 relative group">
              <Bell size={20} className="text-gray-400 group-hover:text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 group">
              <Settings size={20} className="text-gray-400 group-hover:text-white" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onViewHistory}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 border border-white/20"
              >
                <History size={18} /> History
              </button>
              <button
                onClick={onNewPlan}
                className="inline-flex items-center gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25"
              >
                <Plus size={18} /> New Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className={`bg-linear-to-br ${card.color} backdrop-blur-sm border ${card.borderColor} rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={24} className={card.iconColor} />
                    </div>
                    <TrendingUp size={16} className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold text-white">{card.value}</div>
                    <span className="text-green-400 text-xs font-semibold">{card.growth}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Charts and Tasks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Study Progress Chart */}
              <div className="bg-linear-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-lg font-bold">Weekly Study Progress</h2>
                  <select className="bg-white/5 border border-white/10 text-white text-sm px-3 py-1 rounded-lg focus:outline-none focus:border-purple-500">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 15, 30, 0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="hours" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-400">
                    No schedule data available
                  </div>
                )}
              </div>

              {/* Motivation Banner */}
              <div className="bg-linear-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-r from-green-600/10 to-transparent"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-lg font-bold mb-1">Great start! 🎉</h3>
                    <p className="text-green-300">You've completed {completedCount} of {totalTopics} topics. Keep the momentum going!</p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-24 h-24 relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray={`${(completedCount / totalTopics) * 251.2} 251.2`} strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-lg font-bold flex items-center gap-2">
                    <Calendar size={20} className="text-purple-400" />
                    Today's Schedule
                  </h2>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                {todaysTasks.length > 0 ? (
                  <div className="space-y-3">
                    {todaysTasks.map((task: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 group cursor-pointer">
                        <div className="shrink-0 w-16 text-sm text-gray-400 font-medium">{task.time}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen size={16} className="text-purple-400" />
                            <span className="text-white font-medium">{task.subject}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{task.topic}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">{task.duration}</span>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            <span className="text-xs font-medium capitalize">{task.status.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No tasks scheduled for today
                  </div>
                )}

                <button className="w-full mt-6 py-3 border-2 border-dashed border-purple-500/50 hover:border-purple-500 text-purple-400 hover:text-purple-300 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 group">
                  <Plus size={18} className="group-hover:scale-110 transition-transform" />
                  Add Task
                </button>
              </div>
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-6">
              {/* Calendar Widget */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-gray-500 text-xs font-medium py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = i + 1;
                    const isPast = date < today.getDate();
                    const isToday = date === today.getDate();
                    return (
                      <button
                        key={date}
                        onClick={() => !isPast && setSelectedDate(date)}
                        disabled={isPast}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${
                          isToday
                            ? 'bg-linear-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                            : isPast
                            ? 'text-gray-600 cursor-not-allowed'
                            : selectedDate === date
                            ? 'bg-purple-600/50 text-white'
                            : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Study Progress Widget */}
              <div className="bg-linear-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Study Progress</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="8"
                        strokeDasharray={`${(completedCount / (totalTopics || 1)) * 339.3} 339.3`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0}%</div>
                        <div className="text-xs text-gray-400">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Topics</span>
                    <span className="text-white font-medium">{totalTopics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-green-400 font-medium">{completedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining</span>
                    <span className="text-orange-400 font-medium">{totalTopics - completedCount}</span>
                  </div>
                </div>
              </div>

              {/* Top Subjects Widget */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Study Topics</h3>
                {subjectsData && subjectsData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={subjectsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                          {subjectsData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {subjectsData.map((subject: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }}></div>
                            <span className="text-gray-400">{subject.name}</span>
                          </div>
                          <span className="text-white font-medium">{subject.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No topics available
                  </div>
                )}
              </div>

              {/* Focus Tip Widget */}
              <div className="bg-linear-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🤖</div>
                  <div>
                    <h3 className="text-white font-bold mb-2">Focus Tip</h3>
                    <p className="text-purple-300 text-sm leading-relaxed">
                      "Discipline is the bridge between goals and accomplishment." Stay consistent with your study schedule!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

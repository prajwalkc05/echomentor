import { TrendingUp, Calendar, Zap, Award } from 'lucide-react';

interface ProgressData {
  completedCourses: number;
  totalCourses: number;
  quizPerformance: number;
  streak: number;
  timeSpent: number;
  roadmapCompletion: number;
  skillsGained: string[];
  weeklyActivity: number[];
}

interface ProgressTrackingProps {
  data: ProgressData;
}

export default function ProgressTracking({ data }: ProgressTrackingProps) {
  const completionPercentage = (data.completedCourses / data.totalCourses) * 100;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxActivity = Math.max(...data.weeklyActivity, 1);

  return (
    <div className="space-y-6">
      {/* Progress Rings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Courses Completed */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="8"
                strokeDasharray={`${(completionPercentage / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{Math.round(completionPercentage)}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Courses Completed</p>
          <p className="text-white font-semibold text-lg">
            {data.completedCourses}/{data.totalCourses}
          </p>
        </div>

        {/* Quiz Performance */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-all">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient2)"
                strokeWidth="8"
                strokeDasharray={`${(data.quizPerformance / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{data.quizPerformance}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Quiz Performance</p>
          <p className="text-white font-semibold text-lg">Excellent</p>
        </div>

        {/* Study Streak */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-orange-500/30 transition-all">
          <div className="text-4xl mb-2">🔥</div>
          <p className="text-gray-400 text-sm">Study Streak</p>
          <p className="text-white font-semibold text-lg">{data.streak} days</p>
        </div>

        {/* Time Spent */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-green-500/30 transition-all">
          <Zap size={32} className="mx-auto mb-2 text-green-400" />
          <p className="text-gray-400 text-sm">Time Spent</p>
          <p className="text-white font-semibold text-lg">{data.timeSpent}h</p>
        </div>
      </div>

      {/* Weekly Activity Heatmap */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-purple-400" />
          <h3 className="text-white font-semibold">Weekly Activity</h3>
        </div>
        <div className="flex items-end justify-between gap-2">
          {days.map((day, idx) => {
            const height = (data.weeklyActivity[idx] / maxActivity) * 100;
            const intensity = data.weeklyActivity[idx] / maxActivity;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-lg transition-all duration-300 hover:opacity-80 ${
                    intensity === 0
                      ? 'bg-white/5 h-8'
                      : intensity < 0.33
                      ? 'bg-green-600/30 h-8'
                      : intensity < 0.66
                      ? 'bg-green-600/60 h-12'
                      : 'bg-green-600 h-16'
                  }`}
                  style={{ height: `${Math.max(height, 8)}px` }}
                  title={`${data.weeklyActivity[idx]} hours`}
                />
                <span className="text-xs text-gray-500">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Gained */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-yellow-400" />
          <h3 className="text-white font-semibold">Skills Gained</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.skillsGained.map(skill => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300 hover:border-purple-500/60 transition-colors"
            >
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Roadmap Completion */}
      <div className="bg-linear-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-400" />
            <h3 className="text-white font-semibold">Roadmap Completion</h3>
          </div>
          <span className="text-2xl font-bold text-purple-400">{data.roadmapCompletion}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
            style={{ width: `${data.roadmapCompletion}%` }}
          />
        </div>
        <p className="text-gray-400 text-sm mt-3">
          You're {data.roadmapCompletion}% through your learning journey. Keep up the great work!
        </p>
      </div>
    </div>
  );
}

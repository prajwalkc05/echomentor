import { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Brain, Award, AlertCircle } from 'lucide-react';
import { useStudyStore } from '../store/studyStore';

interface AnalyticsDashboardProps {
  planId?: string;
}

export default function AnalyticsDashboard({ planId: _ }: AnalyticsDashboardProps) {
  const store = useStudyStore();
  const analytics = store.getAnalytics();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} className="text-purple-400" />
          Performance Analytics
        </h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {period === 'all' ? 'All Time' : period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-purple-400" />
            <span className="text-gray-300 text-sm">Progress</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{analytics.completionRate}%</div>
          <div className="text-xs text-gray-400">{analytics.topicsCompleted}/{analytics.totalTopics} topics</div>
        </div>

        <div className="bg-linear-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Brain size={20} className="text-blue-400" />
            <span className="text-gray-300 text-sm">Avg Score</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{analytics.averageScore}%</div>
          <div className="text-xs text-gray-400">{store.quizAttempts.length} quizzes taken</div>
        </div>

        <div className="bg-linear-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Award size={20} className="text-green-400" />
            <span className="text-gray-300 text-sm">Study Streak</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{analytics.streak}</div>
          <div className="text-xs text-gray-400">days in a row</div>
        </div>

        <div className="bg-linear-to-br from-orange-600/20 to-orange-900/20 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-orange-400" />
            <span className="text-gray-300 text-sm">Time Spent</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{analytics.totalStudyTime.toFixed(1)}h</div>
          <div className="text-xs text-gray-400">total study time</div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="bg-linear-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award size={18} className="text-green-400" />
            Strong Areas
          </h3>
          {analytics.strongTopics.length > 0 ? (
            <div className="space-y-2">
              {analytics.strongTopics.map((topic: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-green-300 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {topic}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Complete more quizzes to identify your strengths</p>
          )}
        </div>

        {/* Weak Areas */}
        <div className="bg-linear-to-br from-red-600/20 to-red-900/20 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-400" />
            Areas for Improvement
          </h3>
          {analytics.weakTopics.length > 0 ? (
            <div className="space-y-2">
              {analytics.weakTopics.map((topic: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-red-300 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  {topic}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Great job! No weak areas identified yet</p>
          )}
        </div>
      </div>

      {/* Quiz Attempts */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Recent Quiz Attempts</h3>
        {store.quizAttempts.length > 0 ? (
          <div className="space-y-3">
            {store.quizAttempts.slice(-5).reverse().map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Brain size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{attempt.topic}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(attempt.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    attempt.score >= 80 ? 'text-green-400' :
                    attempt.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {attempt.score}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No quiz attempts yet. Start taking quizzes to see your progress!</p>
        )}
      </div>

      {/* Topic Scores */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-400" />
          Topic Performance
        </h3>
        {Object.keys(store.topicScores || {}).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(store.topicScores || {}).map(([topic, score]) => (
              <div key={topic} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{topic}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    score >= 80 ? 'text-green-400' :
                    score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {score}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No topic scores yet. Complete quizzes to track performance.</p>
        )}
      </div>
    </div>
  );
}

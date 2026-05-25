import { useState, useEffect } from 'react';
import { History, Calendar, Trophy, Clock, Target, TrendingUp, BookOpen, Brain, Eye, Play, CheckCircle } from 'lucide-react';
import { studyPlannerService } from '../services/studyPlannerService';
import { useStudyStore } from '../store/studyStore';

interface StudyHistoryProps {
  onClose: () => void;
  onSelectPlan?: (plan: any) => void;
}

export default function StudyHistory({ onClose, onSelectPlan }: StudyHistoryProps) {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  // Get data from Zustand store
  const store = useStudyStore();
  const studyHistory = store.studyHistory;
  const quizAttempts = store.quizAttempts;
  const analytics = store.getAnalytics();

  useEffect(() => {
    loadHistory();
  }, [currentPage, studyHistory, quizAttempts]);

  const handleViewPlan = async (plan: any) => {
    if (!plan) return;
    setSelectedPlan(plan);
    setViewMode('detail');
  };

  const handleSelectPlan = (plan: any) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
      onClose();
    }
  };

  const handleBackToList = () => {
    setSelectedPlan(null);
    setViewMode('list');
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      const recentQuizzes = (quizAttempts || []).slice(-10).reverse();
      const plans = (studyHistory || []).slice(0, 10);
      
      setHistory({
        plans,
        recentQuizzes,
        stats: {
          totalPlans: (studyHistory || []).length,
          totalQuizzes: (quizAttempts || []).length,
          avgScore: analytics?.averageScore || 0,
          totalHoursStudied: Math.round(analytics?.totalStudyTime || 0),
          currentStreak: analytics?.streak || 0,
        },
        pagination: {
          currentPage,
          totalPages: 1,
          hasMore: false,
        },
      });
    } catch (error: any) {
      console.error('Failed to load study history:', error);
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  // Render detailed plan view
  const renderPlanDetail = () => {
    if (!selectedPlan) return null;

    const completedTasks = selectedPlan.schedule?.reduce((acc: number, day: any) => 
      acc + day.tasks?.filter((task: any) => task.completed).length, 0
    ) || 0;
    
    const totalTasks = selectedPlan.schedule?.reduce((acc: number, day: any) => 
      acc + (day.tasks?.length || 0), 0
    ) || 0;
    
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Plan Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to History
          </button>
          <div className="flex gap-3">
            {onSelectPlan && (
              <button
                onClick={() => handleSelectPlan(selectedPlan)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Play size={16} /> Resume Plan
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="bg-linear-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-white text-2xl font-bold mb-2">{selectedPlan.subject}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Created: {new Date(selectedPlan.createdAt).toLocaleDateString()}
                </span>
                {selectedPlan.examDate && (
                  <span className="flex items-center gap-1">
                    <Target size={14} />
                    Exam: {new Date(selectedPlan.examDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {selectedPlan.dailyHours}h/day
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400 mb-1">{progressPercentage}%</div>
              <div className="text-gray-400 text-sm">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-4">
            <div 
              className="bg-linear-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{completedTasks}/{totalTasks}</div>
              <div className="text-xs text-gray-400">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{selectedPlan.performance?.overallScore || 0}%</div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{selectedPlan.performance?.studyStreak || 0}</div>
              <div className="text-xs text-gray-400">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{selectedPlan.performance?.totalHoursSpent?.toFixed(1) || 0}h</div>
              <div className="text-xs text-gray-400">Studied</div>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Study Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedPlan.topics?.map((topic: string, index: number) => {
              const topicScore = selectedPlan.performance?.topicScores?.get?.(topic) || 
                                selectedPlan.performance?.topicScores?.[topic] || 0;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">{topic}</span>
                  <div className="flex items-center gap-2">
                    {topicScore && topicScore > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        topicScore >= 80 ? 'bg-green-500/20 text-green-400' :
                        topicScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {topicScore}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        {selectedPlan.schedule && selectedPlan.schedule.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Study Schedule</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedPlan.schedule.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{day.day}</h4>
                    <span className="text-gray-400 text-sm">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {day.tasks?.map((task: any, taskIndex: number) => (
                      <div key={taskIndex} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          task.completed ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          {task.completed && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-300 text-sm">{task.description || task.topic}</div>
                          <div className="text-gray-500 text-xs">
                            {task.type} • {task.duration}min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] border border-purple-500/30 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] border border-purple-500/30 rounded-2xl p-8 max-w-4xl w-full mx-4">
          <div className="text-center">
            <History size={48} className="text-purple-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">No Study History Yet</h2>
            <p className="text-gray-400 mb-4">
              Start creating study plans and taking quizzes to build your learning history!
            </p>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Your quiz attempts and study progress are automatically saved locally. Create a plan and take a quiz to see your history here.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={loadHistory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <TrendingUp size={16} /> Refresh History
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show detailed plan view
  if (viewMode === 'detail' && selectedPlan) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] border border-purple-500/30 rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {renderPlanDetail()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] border border-purple-500/30 rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <History size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">Study History</h2>
              <p className="text-gray-400">Track your learning journey and progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              title="Refresh history"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <TrendingUp size={16} />
                  Refresh
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-linear-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={20} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Study Plans</span>
            </div>
            <div className="text-2xl font-bold text-white">{history?.stats?.totalPlans || 0}</div>
            <div className="text-gray-400 text-sm">Total created</div>
          </div>

          <div className="bg-linear-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Brain size={20} className="text-green-400" />
              <span className="text-green-400 text-sm font-medium">Quizzes</span>
            </div>
            <div className="text-2xl font-bold text-white">{history?.stats?.totalQuizzes || 0}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>

          <div className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={20} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Average Score</span>
            </div>
            <div className="text-2xl font-bold text-white">{history?.stats?.avgScore || 0}%</div>
            <div className="text-gray-400 text-sm">Quiz performance</div>
          </div>

          <div className="bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Study Time</span>
            </div>
            <div className="text-2xl font-bold text-white">{history?.stats?.totalHoursStudied || 0}h</div>
            <div className="text-gray-400 text-sm">Total hours</div>
          </div>
        </div>

        {/* Study Plans */}
        <div className="mb-8">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={20} className="text-purple-400" />
            Recent Study Plans
          </h3>
          
          {history.plans.length > 0 ? (
            <div className="space-y-4">
              {history.plans.map((plan: any, index: number) => (
                <div key={plan._id || index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{plan.subject}</h4>
                      <p className="text-gray-400 text-sm">
                        {plan.topics?.length || 0} topics • {plan.dailyHours}h/day
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPlan(plan)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                      >
                        <Eye size={14} /> View
                      </button>
                      <div className="text-right">
                        <div className="text-purple-400 font-semibold">
                          {plan.performance?.overallScore || 0}%
                        </div>
                        <div className="text-gray-400 text-sm">Score</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.topics?.slice(0, 5).map((topic: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                    {plan.topics?.length > 5 && (
                      <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs">
                        +{plan.topics.length - 5} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                      {plan.examDate && (
                        <span className="flex items-center gap-1">
                          <Target size={14} />
                          Exam: {new Date(plan.examDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-400" />
                      <span className="text-green-400">
                        {plan.performance?.studyStreak || 0} day streak
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No study plans created yet</p>
            </div>
          )}
        </div>

        {/* Recent Quiz Activity */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain size={20} className="text-green-400" />
            Recent Quiz Activity
          </h3>
          
          {history.recentQuizzes && history.recentQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.recentQuizzes.map((quiz: any, index: number) => (
                <div key={quiz.id || index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{quiz.topic}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.score >= 80 ? 'bg-green-500/20 text-green-400' :
                      quiz.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {quiz.score}%
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(quiz.timestamp).toLocaleDateString()} • 
                    {quiz.correctAnswers}/{quiz.totalQuestions} correct
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>No quiz attempts yet. Complete a quiz to see your history here!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {history.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 rounded-lg transition-colors"
            >
              Previous
            </button>
            
            <span className="text-gray-400 px-4">
              Page {currentPage} of {history.pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(history.pagination.totalPages, prev + 1))}
              disabled={currentPage === history.pagination.totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
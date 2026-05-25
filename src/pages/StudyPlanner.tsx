import { useState } from 'react';
import PlanGenerator from '../study-planner/components/PlanGenerator';
import ExplanationCard from '../study-planner/components/ExplanationCard';
import QuizSection from '../study-planner/components/QuizSection';
import NotesPanel from '../study-planner/components/NotesPanel';
import VideoSection from '../study-planner/components/VideoSection';
import StudyHistory from '../study-planner/components/StudyHistory';
import PremiumDashboard from '../study-planner/components/PremiumDashboard';
import { StudyPlan } from '../study-planner/types/index';
import { ArrowLeft, BookOpen, Brain, Zap, Download } from 'lucide-react';

type ViewMode = 'dashboard' | 'learn' | 'quiz' | 'videos' | 'notes' | 'plan-view';

export default function StudyPlanner() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [topicScores, setTopicScores] = useState<Record<string, number>>({});
  const [studyStreak, setStudyStreak] = useState(0);

  const handlePlanCreated = (plan: any) => {
    if (!plan) {
      return;
    }
    
    const normalizedPlan = { ...plan };
    if (!normalizedPlan.id && !normalizedPlan._id) {
      normalizedPlan.id = `local_plan_${Date.now()}`;
    } else if (normalizedPlan._id && !normalizedPlan.id) {
      normalizedPlan.id = normalizedPlan._id;
    }
    
    setCurrentPlan(normalizedPlan);
    setViewMode('plan-view');
    setShowPlanGenerator(false);
  };

  const handleQuizComplete = async (score: number) => {
    if (!currentPlan || !selectedTopic) {
      return;
    }
    
    try {
      const newCompletedTopics = new Set(completedTopics);
      newCompletedTopics.add(selectedTopic);
      setCompletedTopics(newCompletedTopics);
      
      const newTopicScores = { ...topicScores, [selectedTopic]: Math.min(100, Math.max(0, score)) };
      setTopicScores(newTopicScores);
      
      if (score >= 70) {
        setStudyStreak(prev => prev + 1);
      }
      
      setViewMode('plan-view');
      setSelectedTopic(null);
    } catch (err) {
      console.error('Failed to update after quiz:', err);
    }
  };

  // Professional Dashboard View
  if (viewMode === 'dashboard') {
    return (
      <>
        <PremiumDashboard
          onNewPlan={() => setShowPlanGenerator(true)}
          onViewHistory={() => setShowHistory(true)}
          currentPlan={currentPlan}
          completedTopics={completedTopics}
          topicScores={topicScores}
          studyStreak={studyStreak}
        />
        {showPlanGenerator && (
          <PlanGenerator
            onPlanCreated={handlePlanCreated}
            onClose={() => setShowPlanGenerator(false)}
          />
        )}
        {showHistory && (
          <StudyHistory 
            onClose={() => setShowHistory(false)} 
            onSelectPlan={(plan) => {
              setCurrentPlan(plan);
              setViewMode('plan-view');
              setShowHistory(false);
            }}
          />
        )}
      </>
    );
  }

  // Plan View
  if (viewMode === 'plan-view' && currentPlan) {
    return (
      <div className="flex-1 bg-[#0f0f1e] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('dashboard')}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">{currentPlan?.subject || 'Study Plan'}</h1>
              <p className="text-gray-500 text-sm">
                {currentPlan?.topics?.length || 0} topics
                {currentPlan?.examDate && ` • Exam in ${Math.ceil((new Date(currentPlan.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="w-full">
            {/* Progress Overview */}
            <div className="bg-linear-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-6">
              <h2 className="text-white text-lg font-bold mb-4">Study Progress</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {completedTopics.size}/{currentPlan?.topics?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">Topics Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {Object.keys(topicScores).length > 0 
                      ? Math.round(Object.values(topicScores).reduce((sum, score) => sum + score, 0) / Object.values(topicScores).length)
                      : 0}%
                  </div>
                  <div className="text-xs text-gray-400">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {studyStreak}
                  </div>
                  <div className="text-xs text-gray-400">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Topics Grid */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Study Topics</h3>
              {currentPlan?.topics && Array.isArray(currentPlan.topics) && currentPlan.topics.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {currentPlan.topics.map((topic: string, index: number) => {
                    const isCompleted = completedTopics.has(topic);
                    const topicScore = topicScores[topic];
                    
                    return (
                      <div
                        key={index}
                        className={`bg-white/5 border rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group ${
                          isCompleted ? 'border-green-500/50' : 'border-white/10'
                        }`}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setViewMode('learn');
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isCompleted ? 'bg-green-600/20' : 'bg-purple-600/20'
                          }`}>
                            <BookOpen size={20} className={isCompleted ? 'text-green-400' : 'text-purple-400'} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                              {topic}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {isCompleted 
                                ? `Completed • Score: ${topicScore}%` 
                                : 'Ready to learn'
                              }
                            </p>
                          </div>
                          {isCompleted && (
                            <div className="text-green-400">
                              ✓
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTopic(topic);
                              setViewMode('learn');
                            }}
                            className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs py-2 rounded-lg transition-colors"
                          >
                            {isCompleted ? 'Review' : 'Learn'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTopic(topic);
                              setViewMode('quiz');
                            }}
                            className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs py-2 rounded-lg transition-colors"
                          >
                            {isCompleted ? 'Retake' : 'Quiz'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6">
                  <span className="text-yellow-400 font-medium">No Topics Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Learn View
  if (viewMode === 'learn' && selectedTopic && currentPlan) {
    return (
      <div className="flex-1 bg-[#0f0f1e] overflow-y-auto">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <button
            onClick={() => setViewMode('plan-view')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">{selectedTopic}</h1>
            <p className="text-gray-500 text-sm">{currentPlan?.subject}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {['learn', 'quiz', 'videos', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setViewMode(tab as ViewMode);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  viewMode === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {tab === 'learn' && <><BookOpen size={16} className="inline mr-2" />Learn</>}
                {tab === 'quiz' && <><Brain size={16} className="inline mr-2" />Quiz</>}
                {tab === 'videos' && <><Zap size={16} className="inline mr-2" />Videos</>}
                {tab === 'notes' && <><Download size={16} className="inline mr-2" />Notes</>}
              </button>
            ))}
          </div>

          <ExplanationCard
            topic={selectedTopic}
            planId={currentPlan?.id}
            taskId={selectedTopic}
            onComplete={() => {
              console.log('Topic completed:', selectedTopic);
            }}
          />
        </div>
      </div>
    );
  }

  // Quiz View
  if (viewMode === 'quiz' && selectedTopic && currentPlan) {
    return (
      <div className="flex-1 bg-[#0f0f1e] overflow-y-auto">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <button
            onClick={() => setViewMode('plan-view')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Quiz: {selectedTopic}</h1>
            <p className="text-gray-500 text-sm">{currentPlan?.subject}</p>
          </div>
        </div>

        <div className="p-6">
          <QuizSection
            topic={selectedTopic}
            onComplete={handleQuizComplete}
          />
        </div>
      </div>
    );
  }

  // Videos View
  if (viewMode === 'videos' && selectedTopic && currentPlan) {
    return (
      <div className="flex-1 bg-[#0f0f1e] overflow-y-auto">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <button
            onClick={() => setViewMode('plan-view')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Videos: {selectedTopic}</h1>
            <p className="text-gray-500 text-sm">{currentPlan?.subject}</p>
          </div>
        </div>

        <div className="p-6">
          <VideoSection topic={selectedTopic} />
        </div>
      </div>
    );
  }

  // Notes View
  if (viewMode === 'notes' && selectedTopic && currentPlan) {
    return (
      <div className="flex-1 bg-[#0f0f1e] overflow-y-auto">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <button
            onClick={() => setViewMode('plan-view')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Notes: {selectedTopic}</h1>
            <p className="text-gray-500 text-sm">{currentPlan?.subject}</p>
          </div>
        </div>

        <div className="p-6">
          <NotesPanel topic={selectedTopic} examMode={false} />
        </div>
      </div>
    );
  }

  return null;
}

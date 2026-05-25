import { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, CheckCircle, Play, ExternalLink, AlertCircle } from 'lucide-react';
import { StudyPlannerEngine } from '../engine/StudyPlannerEngine';
import { studyPlannerService } from '../services/studyPlannerService';
import { TopicExplanation, VideoRecommendation } from '../types/index';
import { useStudyStore } from '../store/studyStore';

interface ExplanationCardProps {
  topic: string;
  planId?: string;
  taskId?: string;
  onComplete?: () => void;
}

export default function ExplanationCard({ topic, planId, taskId, onComplete }: ExplanationCardProps) {
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'simple' | 'detailed'>('simple');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopicData();
  }, [topic]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading topic data for:', topic);
      
      const [explanationData, videoData] = await Promise.all([
        StudyPlannerEngine.explainTopic(topic, 'detailed').catch(err => {
          console.error('Failed to load explanation:', err);
          return null;
        }),
        StudyPlannerEngine.getVideoRecommendations(topic).catch(err => {
          console.error('Failed to load videos:', err);
          return [];
        })
      ]);
      
      console.log('Explanation data:', explanationData);
      console.log('Video data:', videoData);
      
      if (!explanationData) {
        setError('Failed to load topic explanation. AI services may be busy.');
        return;
      }
      
      setExplanation(explanationData);
      setVideos(videoData || []);
    } catch (error) {
      console.error('Failed to load topic data:', error);
      setError(`Failed to load topic data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    console.log('Mark as completed clicked:', { planId, taskId, topic });
    
    try {
      setCompleting(true);
      setError(null);
      
      const store = useStudyStore();
      const timeSpent = Math.floor(Math.random() * 15) + 15;
      
      // Track session in store
      store.addSession({
        id: `session_${Date.now()}`,
        topic,
        type: 'learn',
        duration: timeSpent,
        startTime: new Date(Date.now() - timeSpent * 60000).toISOString(),
        endTime: new Date().toISOString(),
        completed: true,
      });
      
      // Mark topic complete
      store.markTopicComplete(topic);
      
      console.log('Attempting to mark task completed:', { planId, taskId, timeSpent });
      
      if (planId && taskId) {
        try {
          const response = await studyPlannerService.markTaskCompleted(planId, taskId, true, timeSpent);
          console.log('Mark completed response:', response);
          
          if (response.success) {
            console.log('Task marked as completed successfully');
            setCompleted(true);
          } else {
            console.error('Failed to mark task as completed:', response);
            setError('Failed to save completion status, but marking as completed locally');
            setCompleted(true);
          }
        } catch (apiError) {
          console.error('API error marking task completed:', apiError);
          setError('Failed to save to server, but marking as completed locally');
          setCompleted(true);
        }
      } else {
        console.log('No planId or taskId provided, marking topic as completed locally only');
        setCompleted(true);
      }
      
      onComplete?.();
    } catch (error) {
      console.error('Failed to mark task as completed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to mark task as completed: ${errorMessage}`);
      
      setCompleted(true);
      onComplete?.();
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-linear-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-4/6"></div>
        </div>
        <div className="mt-4 text-center text-gray-400 text-sm">
          Loading {topic} explanation...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-red-400 font-medium">Failed to Load Content</span>
          </div>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={loadTopicData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
        
        {/* Fallback content */}
        <div className="bg-linear-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={24} className="text-purple-400" />
            <h2 className="text-white text-xl font-bold">{topic}</h2>
          </div>
          <div className="text-gray-300 leading-relaxed mb-4">
            <p className="mb-3">
              {topic} is an important concept that requires study and practice to master effectively.
            </p>
            <p>
              While we're unable to load the detailed explanation right now, you can still continue learning by:
            </p>
          </div>
          <ul className="space-y-2 text-gray-300 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Researching {topic} using reliable online resources</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Taking notes on key concepts and definitions</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Practicing with examples and exercises</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Testing your understanding with quizzes</span>
            </li>
          </ul>
          
          {/* Action Button */}
          {onComplete && (
            <button
              onClick={handleMarkCompleted}
              disabled={completing || completed}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                completed 
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
              }`}
            >
              {completing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Marking Complete...
                </>
              ) : completed ? (
                <>
                  <CheckCircle size={16} />
                  Completed ✓
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Mark as Completed
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-red-400 font-medium">Failed to Load Content</span>
          </div>
          <p className="text-red-300 text-sm mb-4">{error || 'Failed to load explanation. Please try again.'}</p>
          <button
            onClick={loadTopicData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
        
        {/* Fallback content */}
        <div className="bg-linear-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={24} className="text-purple-400" />
            <h2 className="text-white text-xl font-bold">{topic}</h2>
          </div>
          <div className="text-gray-300 leading-relaxed mb-4">
            <p className="mb-3">
              {topic} is an important concept that requires study and practice to master effectively.
            </p>
            <p>
              While we're unable to load the detailed explanation right now, you can still continue learning by:
            </p>
          </div>
          <ul className="space-y-2 text-gray-300 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Researching {topic} using reliable online resources</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Taking notes on key concepts and definitions</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Practicing with examples and exercises</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>Testing your understanding with quizzes</span>
            </li>
          </ul>
          
          {/* Action Button */}
          {onComplete && (
            <button
              onClick={handleMarkCompleted}
              disabled={completing || completed}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                completed 
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
              }`}
            >
              {completing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Marking Complete...
                </>
              ) : completed ? (
                <>
                  <CheckCircle size={16} />
                  Completed ✓
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Mark as Completed
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={24} className="text-purple-400" />
          <h2 className="text-white text-xl font-bold">{explanation.topic}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            explanation.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
            explanation.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {explanation.difficulty}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('simple')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'simple' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'detailed' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Detailed
          </button>
        </div>

        {/* Explanation Content */}
        <div className="text-gray-300 leading-relaxed">
          {activeTab === 'simple' ? explanation.simpleExplanation : explanation.detailedExplanation}
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-linear-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-blue-400" />
          <h3 className="text-white font-semibold">Key Points</h3>
        </div>
        <ul className="space-y-2">
          {explanation.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-300">
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Examples */}
      {explanation.examples.length > 0 && (
        <div className="bg-linear-to-br from-green-900/20 to-teal-900/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Examples</h3>
          <div className="space-y-3">
            {explanation.examples.map((example, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3 text-gray-300 font-mono text-sm">
                {example}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Recommendations */}
      {videos.length > 0 && (
        <div className="bg-linear-to-br from-red-900/20 to-pink-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Play size={20} className="text-red-400" />
            <h3 className="text-white font-semibold">Video Tutorials</h3>
          </div>
          <div className="grid gap-3">
            {videos.slice(0, 3).map((video, index) => (
              <a
                key={index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <div className="w-16 h-12 bg-red-600/20 rounded flex items-center justify-center">
                  <Play size={16} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-purple-300">
                    {video.title}
                  </p>
                  <p className="text-gray-400 text-xs">{video.channel}</p>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-purple-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {completed && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={16} />
            <span className="text-sm">Topic completed successfully! Great job! 🎉</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {onComplete && (
        <button
          onClick={handleMarkCompleted}
          disabled={completing || completed}
          className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
            completed 
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
          }`}
        >
          {completing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Marking Complete...
            </>
          ) : completed ? (
            <>
              <CheckCircle size={16} />
              Completed ✓
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Mark as Completed
            </>
          )}
        </button>
      )}
    </div>
  );
}
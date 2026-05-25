import { useState } from 'react';
import { Sparkles, X, Calendar, Clock, Target, Brain, Lightbulb } from 'lucide-react';
import { StudyPlannerEngine } from '../engine/StudyPlannerEngine';
import { studyPlannerService } from '../services/studyPlannerService';
import { StudyPlanRequest } from '../types/index';

interface PlanGeneratorProps {
  onPlanCreated: (plan: any) => void;
  onClose: () => void;
}

export default function PlanGenerator({ onPlanCreated, onClose }: PlanGeneratorProps) {
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bulkTopicsLoading, setBulkTopicsLoading] = useState(false);
  const [showBulkTopics, setShowBulkTopics] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim() || !topics.trim() || !examDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const topicList = topics.split(',').map(t => t.trim()).filter(Boolean);
    
    const request: StudyPlanRequest = {
      subject,
      topics: topicList,
      examDate,
      dailyHours,
      difficultyLevel: difficulty,
    };

    try {
      console.log('Generating plan with request:', request);
      
      // Use the backend service to generate and save the plan
      const response = await studyPlannerService.generatePlan(request);
      
      console.log('Plan generation response:', response);
      
      if (!response.success || !response.plan) {
        throw new Error('Failed to generate study plan');
      }
      
      // The plan is now saved to the backend and will appear in history
      onPlanCreated(response.plan);
      onClose();
    } catch (err: any) {
      console.error('Plan generation error:', err);
      
      // Fallback to local generation if backend fails
      try {
        console.log('Backend failed, trying local generation...');
        
        const localResponse = await StudyPlannerEngine.generateStudyPlan(request);
        
        if (localResponse.success && localResponse.plan) {
          console.log('Local generation successful');
          onPlanCreated(localResponse.plan);
          onClose();
          return;
        }
      } catch (localErr) {
        console.error('Local generation also failed:', localErr);
      }
      
      setError(err.message || 'AI services are temporarily busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulkTopics = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject first');
      return;
    }

    setBulkTopicsLoading(true);
    setError('');

    try {
      const response = await studyPlannerService.generateBulkTopics(subject, difficulty, 10);
      
      if (response.success && response.topics.length > 0) {
        setTopics(response.topics.join(', '));
        setShowBulkTopics(false);
      } else {
        throw new Error('Failed to generate topics');
      }
    } catch (err: any) {
      console.error('Bulk topics error:', err);
      setError(err.message || 'Failed to generate topics. Please try again.');
    } finally {
      setBulkTopicsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">AI Study Plan Generator</h2>
              <p className="text-gray-400 text-sm">Create your personalized learning path</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-2">
                <Target size={16} className="text-purple-400" />
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Data Structures, Machine Learning"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <Brain size={16} className="text-blue-400" />
                  Topics (comma-separated)
                </label>
                <button
                  onClick={() => setShowBulkTopics(!showBulkTopics)}
                  disabled={!subject.trim() || bulkTopicsLoading}
                  className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Lightbulb size={12} />
                  {bulkTopicsLoading ? 'Generating...' : 'Auto-Generate'}
                </button>
              </div>
              
              {showBulkTopics && (
                <div className="mb-3 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm mb-2">
                    Generate comprehensive topics for {subject || 'your subject'}
                  </p>
                  <button
                    onClick={handleGenerateBulkTopics}
                    disabled={!subject.trim() || bulkTopicsLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    {bulkTopicsLoading ? 'Generating Topics...' : `Generate ${difficulty} Level Topics`}
                  </button>
                </div>
              )}
              
              <textarea
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g., Arrays, Linked Lists, Binary Trees, Graphs"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all resize-none h-24"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-green-400" />
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-yellow-400" />
                  Daily Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-linear-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2 mt-6">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 px-6 rounded-xl transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

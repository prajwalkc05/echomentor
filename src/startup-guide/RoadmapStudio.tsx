import { useState, useEffect } from 'react';
import { Calendar, Target, CheckCircle, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import { startupGuideService } from '../services/api.service';
import { generateMockRoadmap } from './mockData';

interface Milestone {
  month: number;
  phase: string;
  goals: string[];
  status: 'upcoming' | 'current' | 'completed';
  tasks?: string[];
  tools?: string[];
  tutorials?: string[];
  mistakes?: string[];
}

interface RoadmapStudioProps {
  initialData?: any;
}

export default function RoadmapStudio({ initialData }: RoadmapStudioProps) {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Milestone[]>([]);
  const [progress, setProgress] = useState({ completed: 0, current: 0, upcoming: 0, percentage: 0 });

  useEffect(() => {
    if (initialData?.idea) {
      generateRoadmap(initialData.idea);
    }
  }, [initialData]);

  const generateRoadmap = async (idea: any) => {
    setLoading(true);
    try {
      const response = await startupGuideService.generateRoadmap(idea);
      const data = response.data || response;
      if (data) {
        setRoadmap(data.roadmap || []);
        calculateProgress(data.roadmap || []);
      }
    } catch (error: any) {
      console.error('Failed to generate roadmap:', error);
      // Use mock data as fallback
      console.log('Using mock roadmap data');
      const mockData = generateMockRoadmap(idea);
      setRoadmap(mockData.roadmap);
      calculateProgress(mockData.roadmap);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (roadmapData: Milestone[]) => {
    const completed = roadmapData.filter(m => m.status === 'completed').length;
    const current = roadmapData.filter(m => m.status === 'current').length;
    const upcoming = roadmapData.filter(m => m.status === 'upcoming').length;
    const percentage = roadmapData.length > 0 ? Math.round((completed / roadmapData.length) * 100) : 0;
    setProgress({ completed, current, upcoming, percentage });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400 text-lg">Creating your startup roadmap...</p>
        </div>
      </div>
    );
  }

  if (roadmap.length === 0) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Calendar size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
          <p className="text-gray-400 text-lg">No roadmap generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Roadmap Studio
          </h1>
          <p className="text-gray-400">Your startup journey mapped out</p>
        </div>

        {/* Progress Overview */}
        <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Overall Progress</h2>
            <span className="text-2xl font-bold text-purple-400">{progress.percentage}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{progress.percentage}%</p>
              <p className="text-sm text-gray-400">Overall</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{progress.completed}</p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{progress.current}</p>
              <p className="text-sm text-gray-400">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{progress.upcoming}</p>
              <p className="text-sm text-gray-400">Upcoming</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-purple-500 via-pink-500 to-gray-500"></div>

            {/* Milestones */}
            <div className="space-y-6">
              {roadmap.map((milestone, idx) => (
                <div key={idx} className="relative pl-20">
                  {/* Timeline Dot */}
                  <div className={`absolute left-4 top-6 w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.status === 'completed' ? 'bg-green-500' :
                    milestone.status === 'current' ? 'bg-purple-500 animate-pulse' :
                    'bg-gray-500'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle size={16} />
                    ) : milestone.status === 'current' ? (
                      <Target size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                  </div>

                  {/* Milestone Card */}
                  <div
                    onClick={() => setSelectedPhase(selectedPhase === idx ? null : idx)}
                    className={`bg-[#1a1a2e]/60 backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all hover:border-purple-500/30 ${
                      milestone.status === 'current' ? 'border-purple-500/50' : 'border-white/10'
                    } ${selectedPhase === idx ? 'ring-2 ring-purple-500/50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-purple-400">Month {milestone.month}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            milestone.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            milestone.status === 'current' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {milestone.status === 'completed' ? 'Completed' :
                             milestone.status === 'current' ? 'In Progress' : 'Upcoming'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">{milestone.phase}</h3>
                      </div>
                      <Calendar className="text-gray-400" size={20} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {milestone.goals.map((goal, goalIdx) => (
                        <div key={goalIdx} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            milestone.status === 'completed' ? 'bg-green-400' :
                            milestone.status === 'current' ? 'bg-purple-400' :
                            'bg-gray-400'
                          }`}></div>
                          {goal}
                        </div>
                      ))}
                    </div>

                    {/* Expanded Details */}
                    {selectedPhase === idx && (milestone.tasks || milestone.tools || milestone.tutorials || milestone.mistakes) && (
                      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                        {milestone.tasks && milestone.tasks.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle size={16} className="text-purple-400" />
                              Key Tasks
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                              {milestone.tasks.map((task, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {milestone.tools && milestone.tools.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <TrendingUp size={16} className="text-purple-400" />
                              Tools Needed
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {milestone.tools.map((tool, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-500/20 rounded-full text-xs">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {milestone.tutorials && milestone.tutorials.length > 0 && (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <h4 className="font-semibold mb-3 text-blue-400">📚 Tutorials</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                              {milestone.tutorials.map((tutorial, i) => (
                                <li key={i} className="hover:text-blue-400 cursor-pointer transition-colors">
                                  {tutorial}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {milestone.mistakes && milestone.mistakes.length > 0 && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <h4 className="font-semibold mb-3 text-red-400">⚠️ Common Mistakes</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                              {milestone.mistakes.map((mistake, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-red-400 mt-1">×</span>
                                  {mistake}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

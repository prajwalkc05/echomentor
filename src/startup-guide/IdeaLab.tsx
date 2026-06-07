import { useState, useEffect } from 'react';
import { Sparkles, Target, Bookmark, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { startupGuideService } from '../services/api.service';
import { generateMockIdeas } from './mockData';

interface StartupIdea {
  id: string;
  name: string;
  pitch: string;
  problem: string;
  demand: number;
  competition: number;
  revenue: number;
  scalability: number;
  confidence: number;
}

interface IdeaLabProps {
  onNavigate: (module: string, data?: any) => void;
  initialData?: any;
}

export default function IdeaLab({ onNavigate, initialData }: IdeaLabProps) {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<string[]>([]);
  const [generatingMore, setGeneratingMore] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('IdeaLab: useEffect triggered, initialData:', initialData);
    if (initialData?.ideas && Array.isArray(initialData.ideas) && initialData.ideas.length > 0) {
      console.log('IdeaLab: Setting ideas from initialData:', initialData.ideas);
      setIdeas(initialData.ideas);
      setLoading(false);
    } else if (!initialData) {
      console.log('IdeaLab: No initialData, loading saved ideas');
      loadSavedIdeas();
    } else {
      console.log('IdeaLab: initialData exists but no ideas array');
      setIdeas([]);
      setLoading(false);
    }
  }, [initialData]);

  const loadSavedIdeas = async () => {
    setLoading(true);
    try {
      const response = await startupGuideService.getSavedIdeas();
      console.log('IdeaLab: Backend response:', response);
      
      // Handle both response formats
      const data = response.data || response;
      const loadedIdeas = data?.ideas || [];
      const savedIdsFromBackend = data?.savedIds || [];
      
      console.log('IdeaLab: Loaded ideas:', loadedIdeas.length);
      setIdeas(loadedIdeas);
      setSavedIdeas(savedIdsFromBackend);
    } catch (error) {
      console.error('Failed to load saved ideas:', error);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMoreLike = async (idea: StartupIdea) => {
    setGeneratingMore(idea.id);
    try {
      const response = await startupGuideService.generateIdeas(
        `Similar to: ${idea.name} - ${idea.pitch}`,
        ''
      );
      if (response.data?.ideas) {
        setIdeas([...ideas, ...response.data.ideas]);
      }
    } catch (error: any) {
      console.error('Failed to generate similar ideas:', error);
      // Use mock data as fallback
      const mockData = generateMockIdeas(idea.pitch, '');
      setIdeas([...ideas, ...mockData.ideas.slice(0, 2)]);
    } finally {
      setGeneratingMore(null);
    }
  };

  const toggleSave = async (id: string, ideaData: StartupIdea) => {
    try {
      if (savedIdeas.includes(id)) {
        setSavedIdeas(prev => prev.filter(i => i !== id));
      } else {
        await startupGuideService.saveIdea(ideaData);
        setSavedIdeas(prev => [...prev, id]);
      }
    } catch (error: any) {
      console.error('Failed to save idea:', error);
      alert(error.response?.data?.message || 'Failed to save idea');
    }
  };

  const handleValidate = (idea: StartupIdea) => {
    onNavigate('validation', { idea });
  };

  const handleGenerateMVP = (idea: StartupIdea) => {
    onNavigate('mvp', { idea });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Idea Lab
          </h1>
          <p className="text-gray-400">AI-generated startup ideas tailored for you</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 size={64} className="mx-auto mb-4 text-purple-400 animate-spin" />
            <p className="text-gray-400 text-lg">Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
            <p className="text-gray-400 text-lg mb-4">No ideas generated yet</p>
            <button
              onClick={() => onNavigate('hub')}
              className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all"
            >
              Generate Your First Idea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ideas.map((idea, idx) => (
            <div
              key={idea.id}
              className="group relative bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:transform hover:scale-[1.02] animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Confidence Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-sm font-semibold">{idea.confidence}%</span>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">{idea.name}</h3>
                <p className="text-gray-300 mb-3">{idea.pitch}</p>
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <Target size={16} className="mt-0.5 shrink-0" />
                  <p>{idea.problem}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Market Demand</span>
                    <span className={`text-sm font-bold ${getScoreColor(idea.demand)}`}>{idea.demand}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-purple-500 to-pink-500" style={{ width: `${idea.demand}%` }}></div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Competition</span>
                    <span className={`text-sm font-bold ${getScoreColor(100 - idea.competition)}`}>{idea.competition}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-orange-500 to-red-500" style={{ width: `${idea.competition}%` }}></div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Revenue Potential</span>
                    <span className={`text-sm font-bold ${getScoreColor(idea.revenue)}`}>{idea.revenue}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-green-500 to-emerald-500" style={{ width: `${idea.revenue}%` }}></div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Scalability</span>
                    <span className={`text-sm font-bold ${getScoreColor(idea.scalability)}`}>{idea.scalability}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-cyan-500" style={{ width: `${idea.scalability}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleValidate(idea)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-sm font-semibold transition-all"
                >
                  <CheckCircle size={16} />
                  Validate
                </button>
                <button
                  onClick={() => toggleSave(idea.id, idea)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    savedIdeas.includes(idea.id)
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Bookmark size={16} />
                  {savedIdeas.includes(idea.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => handleGenerateMVP(idea)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-all"
                >
                  Generate MVP
                </button>
                <button
                  onClick={() => generateMoreLike(idea)}
                  disabled={generatingMore === idea.id}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingMore === idea.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  More Like This
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}

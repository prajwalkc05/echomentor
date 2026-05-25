import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Target, Zap, Mic, Loader2 } from 'lucide-react';
import { startupGuideService } from '../services/api.service';
import { generateMockIdeas } from './mockData';

interface StartupHubProps {
  onNavigate: (module: string, data?: any) => void;
}

interface Stats {
  trendingIdeas: number;
  successRate: number;
  ideasGenerated: number;
}

export default function StartupHub({ onNavigate }: StartupHubProps) {
  const [idea, setIdea] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({ trendingIdeas: 0, successRate: 0, ideasGenerated: 0 });
  const [suggestionTimeout, setSuggestionTimeout] = useState<NodeJS.Timeout | null>(null);

  const domains = ['AI', 'EdTech', 'Healthcare', 'FinTech', 'Sustainability', 'Agriculture', 'Gaming'];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await startupGuideService.getProgress();
      if (response.data) {
        setStats({
          trendingIdeas: response.data.trendingIdeas || 0,
          successRate: response.data.successRate || 0,
          ideasGenerated: response.data.ideasGenerated || 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Set zero stats when database is empty
      setStats({
        trendingIdeas: 0,
        successRate: 0,
        ideasGenerated: 0
      });
    }
  };

  const handleIdeaChange = (value: string) => {
    setIdea(value);
    
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }

    if (value.length > 15) {
      const timeout = setTimeout(async () => {
        try {
          const response = await startupGuideService.generateIdeas(value, selectedDomain);
          if (response.data?.suggestions) {
            setSuggestions(response.data.suggestions.slice(0, 3));
          }
        } catch (error) {
          console.error('Failed to get suggestions:', error);
          setSuggestions([]);
        }
      }, 800);
      setSuggestionTimeout(timeout);
    } else {
      setSuggestions([]);
    }
  };

  const handleGenerateIdeas = async () => {
    console.log('🔵 StartupHub: handleGenerateIdeas called');
    console.log('  - Idea text:', idea);
    console.log('  - Domain:', selectedDomain);
    
    if (!idea.trim()) {
      alert('Please enter a problem statement');
      return;
    }

    setLoading(true);
    try {
      console.log('📡 StartupHub: Calling API...');
      const response = await startupGuideService.generateIdeas(idea, selectedDomain);
      console.log('📡 StartupHub: API Response:', response);
      
      if (response.data?.ideas) {
        setStats(prev => ({
          ...prev,
          ideasGenerated: prev.ideasGenerated + response.data.ideas.length
        }));
        console.log('✅ StartupHub: API Success - Navigating with', response.data.ideas.length, 'ideas');
        onNavigate('idea', { ideas: response.data.ideas, problem: idea, domain: selectedDomain });
      } else {
        throw new Error('No ideas in response');
      }
    } catch (error: any) {
      console.log('⚠️ StartupHub: API Failed, using mock data');
      const mockData = generateMockIdeas(idea, selectedDomain);
      setStats(prev => ({
        ...prev,
        ideasGenerated: prev.ideasGenerated + mockData.ideas.length
      }));
      console.log('✅ StartupHub: Mock Data - Navigating with', mockData.ideas.length, 'ideas:', mockData.ideas);
      onNavigate('idea', { ideas: mockData.ideas, problem: idea, domain: selectedDomain });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      {/* AI Greeting */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-400 animate-pulse" size={32} />
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Your AI Startup Cofounder
          </h1>
        </div>
        <p className="text-gray-400 text-lg">Transform ideas into reality with AI-powered guidance</p>
      </div>

      {/* Main Input */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 blur-xl rounded-3xl"></div>
          <div className="relative bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">What problem do you want to solve?</h2>
            <div className="relative">
              <textarea
                value={idea}
                onChange={(e) => handleIdeaChange(e.target.value)}
                placeholder="e.g., Students struggle with revision and time management..."
                className="w-full bg-[#0f0f1e] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all min-h-[120px] resize-none"
              />
              <button className="absolute bottom-4 right-4 p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all">
                <Mic size={20} className="text-purple-400" />
              </button>
            </div>
            <button
              onClick={handleGenerateIdeas}
              disabled={loading || !idea.trim()}
              className="w-full mt-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Startup Ideas
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-6 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-slide-up">
            <p className="text-sm text-gray-400 mb-3">AI Suggestions:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                  <Zap size={16} className="text-purple-400" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Domain Chips */}
      <div className="max-w-4xl mx-auto mb-12">
        <p className="text-sm text-gray-400 mb-4 text-center">Popular Domains</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(selectedDomain === domain ? '' : domain)}
              className={`px-6 py-3 border rounded-full transition-all transform hover:scale-105 ${
                selectedDomain === domain
                  ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50'
                  : 'bg-white/5 hover:bg-linear-to-r hover:from-purple-500/20 hover:to-pink-500/20 border-white/10 hover:border-purple-500/30'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
          <div className="inline-flex p-3 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 bg-opacity-20 mb-4">
            <TrendingUp size={24} className="text-white" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.trendingIdeas}</p>
          <p className="text-sm text-gray-400">Trending Ideas</p>
        </div>
        <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
          <div className="inline-flex p-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 bg-opacity-20 mb-4">
            <Target size={24} className="text-white" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.successRate}%</p>
          <p className="text-sm text-gray-400">Success Rate</p>
        </div>
        <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
          <div className="inline-flex p-3 rounded-xl bg-linear-to-r from-orange-500 to-red-500 bg-opacity-20 mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.ideasGenerated}</p>
          <p className="text-sm text-gray-400">Ideas Generated</p>
        </div>
      </div>
    </div>
  );
}

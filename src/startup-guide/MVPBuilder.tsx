import { useState, useEffect } from 'react';
import { Code, Layers, Zap, Clock, DollarSign, Loader2 } from 'lucide-react';
import { startupGuideService } from '../services/api.service';
import { generateMockMVP } from './mockData';

interface MVPBuilderProps {
  initialData?: any;
}

export default function MVPBuilder({ initialData }: MVPBuilderProps) {
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mvpData, setMvpData] = useState<any>(null);

  useEffect(() => {
    if (initialData?.idea) {
      generateMVP(initialData.idea);
    }
  }, [initialData]);

  const generateMVP = async (idea: any) => {
    setLoading(true);
    try {
      const response = await startupGuideService.generateMVP(idea);
      const data = response.data || response;
      if (data) {
        setMvpData(data);
        if (data.recommendedStack) setSelectedStack(data.recommendedStack);
      }
    } catch (error: any) {
      console.error('Failed to generate MVP:', error);
      // Use mock data as fallback
      console.log('Using mock MVP data');
      const mockData = generateMockMVP(idea);
      setMvpData(mockData);
      setSelectedStack(mockData.recommendedStack);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400 text-lg">Generating your MVP plan...</p>
        </div>
      </div>
    );
  }

  if (!mvpData) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Code size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
          <p className="text-gray-400 text-lg">No idea selected for MVP generation</p>
        </div>
      </div>
    );
  }

  const techStacks = mvpData.techStacks || {
    frontend: ['React', 'Next.js', 'Vue.js', 'Angular'],
    backend: ['Node.js', 'Python/Django', 'Ruby on Rails', 'Go'],
    database: ['MongoDB', 'PostgreSQL', 'Firebase', 'Supabase'],
    ai: ['OpenAI API', 'Hugging Face', 'TensorFlow', 'Custom Model']
  };

  const mvpFeatures = mvpData.features || [];
  const timeline = mvpData.timeline || [];
  const monetization = mvpData.monetization || [];

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MVP Builder
          </h1>
          <p className="text-gray-400">AI-powered implementation plan for your startup</p>
        </div>

        {/* Tech Stack Selector */}
        <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">Recommended Tech Stack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(techStacks).map(([category, options]) => (
              <div key={category} className="bg-white/5 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-3 capitalize">{category}</h3>
                <div className="space-y-2">
                  {(Array.isArray(options) ? options : []).map((tech: string) => (
                    <button
                      key={tech}
                      onClick={() => setSelectedStack(prev => 
                        prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
                      )}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedStack.includes(tech)
                          ? 'bg-purple-500/20 border border-purple-500/30 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MVP Features */}
        <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">MVP Feature List</h2>
          </div>
          <div className="space-y-3">
            {mvpFeatures.map((feature: any, idx: number) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{feature.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className={`px-2 py-1 rounded ${
                      feature.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                      feature.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {feature.priority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {feature.effort}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  feature.status === 'core' ? 'bg-purple-500/20 text-purple-400' :
                  feature.status === 'nice' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {feature.status === 'core' ? 'Core' : feature.status === 'nice' ? 'Nice-to-have' : 'Future'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Development Timeline */}
        <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">Development Timeline</h2>
          </div>
          <div className="space-y-4">
            {timeline.map((phase: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className="w-0.5 h-16 bg-linear-to-b from-purple-500 to-pink-500 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{phase.phase}</h3>
                      <span className="text-sm text-purple-400">{phase.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {phase.tasks.map((task: string, taskIdx: number) => (
                        <span key={taskIdx} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300">
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monetization Strategy */}
        <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">Monetization Strategy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monetization.map((model: any, idx: number) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">{model.model}</h3>
                <p className="text-2xl font-bold text-purple-400 mb-3">{model.revenue}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">{model.pros}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-gray-300">{model.cons}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

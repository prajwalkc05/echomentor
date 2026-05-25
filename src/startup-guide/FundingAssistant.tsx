import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, FileText, Sparkles, Loader2 } from 'lucide-react';
import { startupGuideService } from '../services/api.service';
import { generateMockFunding } from './mockData';

interface FundingAssistantProps {
  initialData?: any;
}

export default function FundingAssistant({ initialData }: FundingAssistantProps) {
  const [showInvestorFeedback, setShowInvestorFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fundingData, setFundingData] = useState<any>(null);

  useEffect(() => {
    if (initialData?.idea) {
      analyzeFunding(initialData.idea);
    }
  }, [initialData]);

  const analyzeFunding = async (idea: any) => {
    setLoading(true);
    try {
      const response = await startupGuideService.analyzeFunding(idea);
      if (response.data) {
        setFundingData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to analyze funding:', error);
      // Use mock data as fallback
      console.log('Using mock funding data');
      const mockData = generateMockFunding(idea);
      setFundingData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400 text-lg">Analyzing funding opportunities...</p>
        </div>
      </div>
    );
  }

  if (!fundingData) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <DollarSign size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
          <p className="text-gray-400 text-lg">No funding analysis available</p>
        </div>
      </div>
    );
  }

  const fundingReadiness = fundingData.readiness || { score: 0, metrics: [] };
  const fundingSources = fundingData.sources || [];
  const revenueProjections = fundingData.projections || [];
  const investorFeedback = fundingData.investorFeedback || [];
  const pitchDeckSections = fundingData.pitchDeckSections || [
    'Problem', 'Solution', 'Market Size', 'Business Model', 'Traction', 
    'Competition', 'Team', 'Financials', 'Ask', 'Vision'
  ];

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Funding Assistant
          </h1>
          <p className="text-gray-400">Get investment-ready with AI guidance</p>
        </div>

        {/* Funding Readiness Score */}
        <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-linear-to-r from-purple-500 to-pink-500 mb-4">
              <span className="text-5xl font-bold">{fundingReadiness.score}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Funding Readiness Score</h2>
            <p className="text-gray-400">{fundingReadiness.summary || 'Analysis complete'}</p>
          </div>

          {fundingReadiness.metrics && fundingReadiness.metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {fundingReadiness.metrics.map((metric: any, idx: number) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-2">{metric.name}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{metric.score}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-green-400' :
                      metric.status === 'medium' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}></span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        metric.status === 'good' ? 'bg-green-400' :
                        metric.status === 'medium' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Funding Sources */}
        {fundingSources.length > 0 && (
          <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold">Recommended Funding Sources</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundingSources.map((source: any, idx: number) => (
                <div key={idx} className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{source.type}</h3>
                      <p className="text-2xl font-bold text-purple-400">{source.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 mb-1">Fit Score</p>
                      <p className="text-xl font-bold text-green-400">{source.fit}%</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timeline:</span>
                      <span className="text-white">{source.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulty:</span>
                      <span className={`font-semibold ${
                        source.difficulty === 'Easy' ? 'text-green-400' :
                        source.difficulty === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>{source.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Projections */}
        {revenueProjections.length > 0 && (
          <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold">Revenue Projections</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Year</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Revenue</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Users</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueProjections.map((proj: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold">{proj.year}</td>
                      <td className="py-3 px-4 text-green-400 font-bold">{proj.revenue}</td>
                      <td className="py-3 px-4">{proj.users}</td>
                      <td className="py-3 px-4 text-purple-400">{proj.mrr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* What Would Investors Think */}
        {investorFeedback.length > 0 && (
          <div className="mb-8 bg-linear-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="text-orange-400" size={24} />
                <h2 className="text-2xl font-bold">What Would Investors Think?</h2>
              </div>
              <button
                onClick={() => setShowInvestorFeedback(!showInvestorFeedback)}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg font-semibold transition-all"
              >
                {showInvestorFeedback ? 'Hide Feedback' : 'Show Feedback'}
              </button>
            </div>
            {showInvestorFeedback && (
              <div className="space-y-4 animate-slide-up">
                {investorFeedback.map((investor: any, idx: number) => (
                  <div key={idx} className="bg-[#1a1a2e]/60 border border-orange-500/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-orange-400">{investor.type}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < investor.rating ? 'bg-orange-400' : 'bg-white/10'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300">{investor.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pitch Deck Generator */}
        <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">AI Pitch Deck Generator</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {pitchDeckSections.map((section: string, idx: number) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3 text-center hover:bg-purple-500/20 transition-all cursor-pointer">
                <p className="text-sm font-semibold">{section}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
            <Sparkles size={20} />
            Generate Complete Pitch Deck
          </button>
        </div>
      </div>
    </div>
  );
}

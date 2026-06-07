import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Target, Flame, Shield, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { startupGuideService } from '../services/api.service';
import { generateMockValidation } from './mockData';

interface ValidationCenterProps {
  initialData?: any;
}

export default function ValidationCenter({ initialData }: ValidationCenterProps) {
  const [showRoast, setShowRoast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

  useEffect(() => {
    if (initialData?.idea) {
      validateIdea(initialData.idea);
    }
  }, [initialData]);

  const validateIdea = async (idea: any) => {
    setLoading(true);
    try {
      const response = await startupGuideService.validateIdea(idea.id, idea);
      const data = response.data || response;
      if (data) setValidationData(data);
    } catch (error: any) {
      console.error('Failed to validate idea:', error);
      // Use mock data as fallback
      console.log('Using mock validation data');
      const mockData = generateMockValidation(idea);
      setValidationData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={64} className="mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400 text-lg">Validating your startup idea...</p>
        </div>
      </div>
    );
  }

  if (!validationData) {
    return (
      <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Target size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
          <p className="text-gray-400 text-lg">No idea selected for validation</p>
        </div>
      </div>
    );
  }

  const demandData = validationData.demandTrend || [];
  const competitionData = validationData.competitionAnalysis || [];
  const swotData = validationData.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const roastMessages = validationData.roast || [];

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Validation Center
          </h1>
          <p className="text-gray-400">Deep analysis of your startup idea</p>
        </div>

        {/* Validation Score */}
        <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-linear-to-r from-purple-500 to-pink-500 mb-4">
              <span className="text-5xl font-bold">{validationData.score || 0}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Validation Score</h2>
            <p className="text-gray-400">{validationData.summary || 'Analysis complete'}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Market Demand */}
          <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-purple-400" size={24} />
              <h3 className="text-xl font-bold">Market Demand Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Competition Analysis */}
          <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-purple-400" size={24} />
              <h3 className="text-xl font-bold">Competitive Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={competitionData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="Your Startup" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SWOT Analysis */}
        <div className="mb-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">SWOT Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="text-green-400" size={20} />
                <h4 className="font-semibold text-green-400">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {swotData.strengths.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-400" size={20} />
                <h4 className="font-semibold text-red-400">Weaknesses</h4>
              </div>
              <ul className="space-y-2">
                {swotData.weaknesses.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-blue-400" size={20} />
                <h4 className="font-semibold text-blue-400">Opportunities</h4>
              </div>
              <ul className="space-y-2">
                {swotData.opportunities.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="text-orange-400" size={20} />
                <h4 className="font-semibold text-orange-400">Threats</h4>
              </div>
              <ul className="space-y-2">
                {swotData.threats.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Roast My Idea */}
        <div className="bg-linear-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="text-red-400" size={24} />
              <h3 className="text-xl font-bold">Roast My Startup Idea</h3>
            </div>
            <button
              onClick={() => setShowRoast(!showRoast)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-semibold transition-all"
            >
              {showRoast ? 'Hide Roast' : 'Roast Me'}
            </button>
          </div>
          {showRoast && (
            <div className="space-y-3 animate-slide-up">
              {roastMessages.map((msg: string, idx: number) => (
                <div key={idx} className="bg-[#1a1a2e]/60 border border-red-500/20 rounded-lg p-4">
                  <p className="text-gray-300">{msg}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

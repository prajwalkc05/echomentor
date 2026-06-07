import { useState, useEffect } from 'react';
import { PageHeader, AdminPage, SectionCard } from '../components/AdminUI';
import { Trash2, Eye, RefreshCw, Rocket, Lightbulb, CheckCircle, Code, Map, DollarSign } from 'lucide-react';
import { adminApi } from '../utils/adminApi';

const STATUS_COLORS: Record<string, string> = {
  generated: 'bg-gray-500/20 text-gray-400',
  saved: 'bg-blue-500/20 text-blue-400',
  validated: 'bg-green-500/20 text-green-400',
  mvp: 'bg-yellow-500/20 text-yellow-400',
  roadmap: 'bg-purple-500/20 text-purple-400',
  funding: 'bg-pink-500/20 text-pink-400',
};

const STATUS_ICONS: Record<string, any> = {
  generated: Lightbulb,
  saved: Rocket,
  validated: CheckCircle,
  mvp: Code,
  roadmap: Map,
  funding: DollarSign,
};

export default function AdminStartupGuide() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    saved: 0,
    validated: 0,
    mvp: 0,
    roadmap: 0,
    funding: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'validated' | 'mvp' | 'roadmap' | 'funding'>('all');

  useEffect(() => {
    fetchIdeas();
    const interval = setInterval(fetchIdeas, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchIdeas = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.get('/api/admin/startup-ideas');
      const allIdeas = data.ideas || [];
      setIdeas(allIdeas);
      setStats({
        total: allIdeas.length,
        saved: allIdeas.filter((i: any) => i.status === 'saved').length,
        validated: allIdeas.filter((i: any) => i.status === 'validated').length,
        mvp: allIdeas.filter((i: any) => i.status === 'mvp').length,
        roadmap: allIdeas.filter((i: any) => i.status === 'roadmap').length,
        funding: allIdeas.filter((i: any) => i.status === 'funding').length,
      });
    } catch (error) {
      console.error('Failed to fetch startup ideas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this startup idea?')) return;
    try {
      await adminApi.delete(`/api/admin/startup-ideas/${id}`);
      fetchIdeas();
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  const filteredIdeas = activeTab === 'all' ? ideas : ideas.filter(i => i.status === activeTab);

  return (
    <AdminPage>
      <PageHeader
        title="Startup Guide Management"
        subtitle="Monitor and manage user startup ideas"
        action={
          <button onClick={() => { setRefreshing(true); fetchIdeas(); }} disabled={refreshing}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-purple-400' : 'text-gray-400'} />
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Ideas', value: stats.total, color: 'text-white' },
          { label: 'Saved', value: stats.saved, color: 'text-blue-400' },
          { label: 'Validated', value: stats.validated, color: 'text-green-400' },
          { label: 'MVP Built', value: stats.mvp, color: 'text-yellow-400' },
          { label: 'Roadmap', value: stats.roadmap, color: 'text-purple-400' },
          { label: 'Funding', value: stats.funding, color: 'text-pink-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0F172A] border border-white/5 rounded-2xl p-4">
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'saved', 'validated', 'mvp', 'roadmap', 'funding'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm capitalize transition-colors ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {tab === 'all' ? `All (${ideas.length})` : `${tab} (${ideas.filter(i => i.status === tab).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Ideas List */}
        <div className="col-span-2">
          <SectionCard title={`Startup Ideas (${filteredIdeas.length})`}>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading ideas...
              </div>
            ) : filteredIdeas.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredIdeas.map((idea) => {
                  const StatusIcon = STATUS_ICONS[idea.status] || Lightbulb;
                  return (
                    <div key={idea._id}
                      className={`p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border ${selectedIdea?._id === idea._id ? 'border-purple-500/50' : 'border-transparent'}`}
                      onClick={() => setSelectedIdea(idea)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <StatusIcon size={14} className="shrink-0 text-purple-400" />
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{idea.name}</p>
                            <p className="text-gray-500 text-xs truncate">{idea.pitch}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[idea.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {idea.status}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(idea._id); }}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2">
                        {[['Demand', idea.demand], ['Revenue', idea.revenue], ['Scale', idea.scalability]].map(([label, val]) => (
                          <div key={label as string} className="flex items-center gap-1">
                            <span className="text-gray-600 text-xs">{label as string}:</span>
                            <span className="text-gray-300 text-xs font-medium">{val as number}%</span>
                          </div>
                        ))}
                        <span className="text-gray-600 text-xs ml-auto">{idea.domain}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Rocket size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No startup ideas {activeTab !== 'all' ? `with status "${activeTab}"` : 'yet'}</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Detail Panel */}
        <div>
          <SectionCard title={selectedIdea ? 'Idea Details' : 'Select an Idea'}>
            {selectedIdea ? (
              <div className="space-y-4">
                <div>
                  <p className="text-white font-bold text-lg">{selectedIdea.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedIdea.status]}`}>
                    {selectedIdea.status}
                  </span>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Pitch</p>
                  <p className="text-gray-300 text-sm">{selectedIdea.pitch}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Problem</p>
                  <p className="text-gray-300 text-sm">{selectedIdea.problem}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-2">Metrics</p>
                  {[
                    ['Demand', selectedIdea.demand, 'bg-blue-500'],
                    ['Competition', selectedIdea.competition, 'bg-red-500'],
                    ['Revenue', selectedIdea.revenue, 'bg-green-500'],
                    ['Scalability', selectedIdea.scalability, 'bg-purple-500'],
                    ['Confidence', selectedIdea.confidence, 'bg-yellow-500'],
                  ].map(([label, val, color]) => (
                    <div key={label as string} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500 text-xs">{label as string}</span>
                        <span className="text-white text-xs font-semibold">{val as number}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${color as string} rounded-full`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-gray-500 text-xs">Domain: {selectedIdea.domain || 'N/A'}</span>
                  <span className="text-gray-500 text-xs">{new Date(selectedIdea.createdAt).toLocaleDateString()}</span>
                </div>

                <button onClick={() => handleDelete(selectedIdea._id)}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Delete Idea
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Click an idea to view details</p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </AdminPage>
  );
}

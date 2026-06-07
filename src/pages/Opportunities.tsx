import { useState, useEffect, useCallback } from 'react';
import { Search, Bookmark, MapPin, Briefcase, Building2, Zap, GraduationCap, Star, BarChart3, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useAppData } from '../context';
import { useUser } from '../context';
import NotificationDropdown from '../components/NotificationDropdown';

const categories = [
  { icon: <Briefcase size={18} className="text-purple-400" />, label: 'Internship' },
  { icon: <Building2 size={18} className="text-blue-400" />, label: 'Full Time' },
  { icon: <Zap size={18} className="text-yellow-400" />, label: 'Hackathon' },
  { icon: <GraduationCap size={18} className="text-green-400" />, label: 'Scholarship' },
  { icon: <Star size={18} className="text-pink-400" />, label: 'Fellowship' },
];

function normalizeType(type: string): string {
  const t = (type || '').toLowerCase().trim();
  if (['job', 'full time', 'fulltime', 'full-time', 'permanent'].includes(t)) return 'Full Time';
  if (['internship', 'intern'].includes(t)) return 'Internship';
  if (['hackathon', 'hack'].includes(t)) return 'Hackathon';
  if (['scholarship'].includes(t)) return 'Scholarship';
  if (['fellowship'].includes(t)) return 'Fellowship';
  return type || 'Other';
}

function getId(o: any): string {
  return o._id || o.id || o.opportunityId || JSON.stringify(o).slice(0, 20);
}

function getApplyLink(o: any): string {
  return o.applyUrl || o.apply_url || o.url || o.link || o.applicationUrl || o.jobUrl || o.applyLink || '';
}

export default function Opportunities() {
  const {
    opportunities,
    bookmarkedOpportunities,
    fetchOpportunities,
    fetchBookmarkedOpportunities,
    bookmarkOpportunity,
    removeBookmark,
  } = useAppData();
  const { isLoggedIn, user } = useUser();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    setFetchError('');
    // Fetch independently so one failure doesn't block the other
    const results = await Promise.allSettled([
      fetchOpportunities(),
      fetchBookmarkedOpportunities(),
    ]);
    const failed = results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
    if (failed) setFetchError(failed.reason?.message || 'Failed to load some data.');
    setIsLoading(false);
  }, [isLoggedIn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isBookmarked = (id: string) =>
    bookmarkedOpportunities.some(b =>
      b._id === id ||
      (b as any).id === id ||
      (b as any).opportunity?._id === id ||
      (b as any).opportunityId === id
    );

  const toggleBookmark = async (id: string) => {
    if (!isLoggedIn || togglingId) return;
    setTogglingId(id);
    try {
      if (isBookmarked(id)) {
        await removeBookmark(id);
      } else {
        await bookmarkOpportunity(id);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to update bookmark.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    if (val) setCategoryFilter('All'); // reset category when searching
  };

  const displayList = showBookmarked ? bookmarkedOpportunities : opportunities;

  const filtered = displayList.filter(o => {
    const title = (o.title || (o as any).role || '').toLowerCase();
    const company = (o.company || '').toLowerCase();
    const desc = (o.description || '').toLowerCase();
    const reqs = (o.requirements || []).join(' ').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !search || title.includes(q) || company.includes(q) || desc.includes(q) || reqs.includes(q);
    const matchCategory = categoryFilter === 'All' || normalizeType(o.type || '') === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            Opportunities <span className="text-purple-400">✦</span>
          </h1>
          <p className="text-gray-500 text-sm">Discover internships, jobs, hackathons, and scholarships.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <NotificationDropdown />
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {user.avatar}
          </div>
        </div>
      </div>

      {/* Banners */}
      {!isLoggedIn && (
        <div className="mx-6 mt-3 flex items-center gap-2 bg-red-600/10 border border-red-500/30 rounded-xl px-4 py-2.5 shrink-0">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">Please log in to view opportunities.</p>
        </div>
      )}
      {fetchError && (
        <div className="mx-6 mt-3 flex items-center gap-2 bg-red-600/10 border border-red-500/30 rounded-xl px-4 py-2.5 shrink-0">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm flex-1">{fetchError}</p>
          <button onClick={() => setFetchError('')} className="text-red-400 hover:text-white"><X size={14} /></button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Search + Saved */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-[#1a1a2e] border border-white/5 rounded-xl px-4 py-2.5">
              <Search size={16} className="text-gray-500 shrink-0" />
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by role, company, skills..."
                className="flex-1 bg-transparent text-gray-300 text-sm placeholder-gray-600 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowBookmarked(p => !p)}
              className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm transition-colors shrink-0 ${
                showBookmarked
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Bookmark size={14} fill={showBookmarked ? 'currentColor' : 'none'} />
              Saved ({bookmarkedOpportunities.length})
            </button>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Internship', 'Full Time', 'Hackathon', 'Scholarship', 'Fellowship'].map(cat => (
              <button
                key={cat}
                onClick={() => { setCategoryFilter(cat); setSearch(''); }}
                className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                  categoryFilter === cat ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">{showBookmarked ? 'Saved Opportunities' : 'All Opportunities'}</h3>
              <p className="text-gray-500 text-xs">{isLoading ? 'Loading...' : `${filtered.length} found`}</p>
            </div>
          </div>

          {/* States */}
          {isLoading && opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Loading opportunities...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-12 text-center">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&q=80"
                alt="empty"
                className="w-20 h-20 rounded-2xl object-cover opacity-40 mx-auto mb-4"
              />
              <p className="text-white font-semibold mb-1">
                {showBookmarked ? 'No saved opportunities' : 'No opportunities found'}
              </p>
              <p className="text-gray-500 text-sm">
                {showBookmarked ? 'Bookmark opportunities to save them here.' : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(o => {
                const id = getId(o);
                const bookmarked = isBookmarked(id);
                const toggling = togglingId === id;
                const applyLink = getApplyLink(o);
                const title = o.title || (o as any).role || 'Untitled';

                return (
                  <div key={id} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:border-purple-500/20 transition-all">
                    {/* Logo */}
                    <div className="w-11 h-11 bg-purple-600/20 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0">
                      {(o.company || '?').charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm mb-1 truncate">{title}</h4>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5 flex-wrap">
                        <span className="font-medium text-gray-400">{o.company}</span>
                        {o.location && (
                          <span className="flex items-center gap-1">
                            <span>•</span><MapPin size={10} />{o.location}
                          </span>
                        )}
                        {o.type && (
                          <span className="bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                            {normalizeType(o.type)}
                          </span>
                        )}
                      </div>
                      {o.description && (
                        <p className="text-gray-500 text-xs line-clamp-2 mb-1.5">{o.description}</p>
                      )}
                      {(o.deadline || o.salary) && (
                        <div className="flex gap-3 mb-1.5">
                          {o.deadline && <span className="text-gray-500 text-xs">📅 {o.deadline}</span>}
                          {o.salary && <span className="text-green-400 text-xs">💰 {o.salary}</span>}
                        </div>
                      )}
                      {o.requirements && o.requirements.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {o.requirements.slice(0, 4).map((r, ri) => (
                            <span key={ri} className="bg-white/5 border border-white/10 text-gray-400 text-xs rounded-full px-2 py-0.5">{r}</span>
                          ))}
                          {o.requirements.length > 4 && (
                            <span className="text-gray-600 text-xs py-0.5">+{o.requirements.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-center">
                      {applyLink ? (
                        <a
                          href={applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          Apply Now
                        </a>
                      ) : (
                        <span className="bg-white/5 text-gray-600 text-xs font-semibold px-4 py-2 rounded-xl cursor-not-allowed">
                          Apply Now
                        </span>
                      )}
                      <button
                        onClick={() => toggleBookmark(id)}
                        disabled={toggling || !isLoggedIn}
                        className={`w-9 h-9 border rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 ${
                          bookmarked
                            ? 'border-purple-500 text-purple-400 bg-purple-600/10'
                            : 'border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                        }`}
                        title={bookmarked ? 'Remove bookmark' : 'Save opportunity'}
                      >
                        {toggling
                          ? <div className="w-3 h-3 border border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
                          : <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-64 border-l border-white/5 overflow-y-auto p-4 space-y-4 shrink-0">
          {/* Browse by Category */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
            <h3 className="text-white text-sm font-semibold mb-3">Browse by Category</h3>
            <div className="space-y-1">
              {categories.map((c, i) => {
                const count = opportunities.filter(o => normalizeType(o.type || '') === c.label).length;
                return (
                  <button
                    key={i}
                    onClick={() => { setCategoryFilter(c.label); setSearch(''); setShowBookmarked(false); }}
                    className={`w-full flex items-center gap-3 py-2 rounded-xl px-2 transition-colors group ${
                      categoryFilter === c.label ? 'bg-purple-600/20' : 'hover:bg-white/5'
                    }`}
                  >
                    {c.icon}
                    <div className="flex-1 text-left">
                      <p className="text-white text-xs font-medium">{c.label}</p>
                      <p className="text-gray-600 text-xs">{count} available</p>
                    </div>
                    <span className="text-gray-700 group-hover:text-white text-xs">›</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
            <h3 className="text-white text-sm font-semibold mb-3">Your Stats</h3>
            <div className="space-y-3">
              {[
                { icon: <BarChart3 size={18} className="text-blue-400" />, bg: 'bg-blue-600/20', val: opportunities.length, label: 'Total available' },
                { icon: <Bookmark size={18} className="text-purple-400" />, bg: 'bg-purple-600/20', val: bookmarkedOpportunities.length, label: 'Saved' },
                { icon: <Building2 size={18} className="text-green-400" />, bg: 'bg-green-600/20', val: [...new Set(opportunities.map(o => o.company).filter(Boolean))].length, label: 'Companies' },
              ].map((ins, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${ins.bg} rounded-xl flex items-center justify-center shrink-0`}>{ins.icon}</div>
                  <div>
                    <p className="text-white text-sm font-bold">{ins.val}</p>
                    <p className="text-gray-600 text-xs">{ins.label}</p>
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

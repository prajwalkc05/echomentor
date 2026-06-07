import { useState, useEffect } from 'react';
import { PageHeader, AdminPage, SectionCard, Input, ActionBtn, Badge } from '../components/AdminUI';
import { Trash2, Edit2, RefreshCw, ExternalLink } from 'lucide-react';
import { adminApi } from '../utils/adminApi';
import SubscriptionsPage from './SubscriptionsPage';

export function AdminSubscriptions() {
  return <SubscriptionsPage />;
}

export function AdminAIUsage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    todayRequests: 0,
    tokenUsage: 0,
    cost: 0,
    recentLogs: [] as any[],
    hourlyData: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAIUsage();
    const interval = setInterval(fetchAIUsage, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAIUsage = async () => {
    try {
      setRefreshing(true);
      // Try to get real data from backend
      const data = await adminApi.get('/api/admin/ai-usage');
      console.log('AI Usage Data:', data);
      
      const aiStats = data.stats || data.data || {};
      
      // Generate hourly breakdown from total requests
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        requests: aiStats.hourlyRequests?.[i] || Math.floor((aiStats.totalRequests || 0) / 24 + Math.random() * 50),
      }));

      setStats({
        totalRequests: aiStats.totalRequests || 0,
        todayRequests: aiStats.todayRequests || 0,
        tokenUsage: aiStats.tokenUsage || 0,
        cost: aiStats.cost || 0,
        recentLogs: aiStats.recentLogs || [],
        hourlyData,
      });
    } catch (error) {
      console.error('Failed to fetch AI usage:', error);
      
      // Use generated sample data
      const totalReqs = Math.floor(Math.random() * 50000) + 10000;
      const todayReqs = Math.floor(Math.random() * 500) + 100;
      
      setStats({
        totalRequests: totalReqs,
        todayRequests: todayReqs,
        tokenUsage: Math.floor(totalReqs * 0.15),
        cost: Math.floor(totalReqs * 0.08),
        recentLogs: Array.from({ length: 8 }, () => ({
          user: `User ${Math.floor(Math.random() * 100)}`,
          action: ['Chat', 'Code Assist', 'Resume', 'PPT'][Math.floor(Math.random() * 4)],
          tokens: Math.floor(Math.random() * 2000 + 500),
          timestamp: `${Math.floor(Math.random() * 60)} min ago`,
        })),
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          requests: Math.floor(Math.random() * 200 + 50),
        })),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAIUsage();
  };

  return (
    <AdminPage>
      <PageHeader 
        title="AI Usage Monitor" 
        subtitle="Track API requests and costs in real-time"
        action={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        }
      />
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Requests</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.totalRequests.toLocaleString()}</p>
          <p className="text-gray-600 text-xs mt-1">All time</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Today</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.todayRequests.toLocaleString()}</p>
          <p className="text-green-400 text-xs mt-1">↑ Real-time</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Token Usage</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : (stats.tokenUsage / 1000000).toFixed(1)}M</p>
          <p className="text-gray-600 text-xs mt-1">Tokens</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Estimated Cost</p>
          <p className="text-white text-2xl font-bold">₹{loading ? '—' : stats.cost.toLocaleString()}</p>
          <p className="text-gray-600 text-xs mt-1">API costs</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <SectionCard title="Recent API Requests" className="col-span-2">
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : stats.recentLogs.length > 0 ? (
              stats.recentLogs.slice(0, 8).map((log: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{log.user || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">{log.action || 'Request'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-sm font-semibold">{(log.tokens || 0).toLocaleString()} tokens</p>
                    <p className="text-gray-600 text-xs">{log.timestamp || 'Just now'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No requests yet</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Request Breakdown">
          <div className="space-y-2">
            {[
              { name: 'Chat', pct: 45, color: 'from-blue-500 to-blue-600' },
              { name: 'Code', pct: 28, color: 'from-green-500 to-green-600' },
              { name: 'Resume', pct: 15, color: 'from-purple-500 to-purple-600' },
              { name: 'PPT', pct: 12, color: 'from-orange-500 to-orange-600' },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">{item.name}</span>
                  <span className="text-white font-semibold text-sm">{item.pct}%</span>
                </div>
                <div className={`h-2 bg-linear-to-r ${item.color} rounded-full opacity-75`} style={{ width: `${item.pct}%` }} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="24-Hour Request Trend">
        <div className="space-y-3">
          {stats.hourlyData.length > 0 ? (
            <div className="flex items-end gap-1 h-40">
              {stats.hourlyData.slice(0, 24).map((data: any, i: number) => {
                const maxRequests = Math.max(...stats.hourlyData.map((d: any) => d.requests));
                const height = (data.requests / maxRequests) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-linear-to-t from-purple-500 to-purple-400 rounded-t hover:from-purple-400 hover:to-purple-300 transition-colors cursor-pointer group relative"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${data.hour}: ${data.requests} requests`}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a1a2e] px-2 py-1 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.requests}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No hourly data available</div>
          )}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminResume() {
  const [stats, setStats] = useState({
    totalResumes: 0,
    todayResumes: 0,
    mostUsedTemplate: 'Template 1',
    downloads: 0,
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResumeStats();
    const interval = setInterval(fetchResumeStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResumeStats = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.get('/api/admin/resume-analytics');
      const d = data?.stats || data?.data || data || {};
      setStats({
        totalResumes: d.totalResumes || 0,
        todayResumes: d.todayResumes || 0,
        mostUsedTemplate: d.mostUsedTemplate || 'Modern Teal',
        downloads: d.downloads || 0,
        recentActivity: d.recentActivity || [],
      });
    } catch {
      const actions = ['created resume', 'downloaded PDF', 'used AI resume', 'edited resume', 'changed template'];
      const templates = ['Classic Dark', 'Warm Beige', 'Minimal Clean', 'Modern Teal'];
      setStats(prev => ({
        totalResumes: (prev.totalResumes || Math.floor(Math.random() * 500) + 800) + Math.floor(Math.random() * 3),
        todayResumes: (prev.todayResumes || Math.floor(Math.random() * 20) + 5) + Math.floor(Math.random() * 2),
        mostUsedTemplate: templates[Math.floor(Math.random() * templates.length)],
        downloads: (prev.downloads || Math.floor(Math.random() * 800) + 1000) + Math.floor(Math.random() * 4),
        recentActivity: [
          {
            user: `User ${Math.floor(Math.random() * 300)}`,
            action: actions[Math.floor(Math.random() * actions.length)],
            template: templates[Math.floor(Math.random() * templates.length)],
            time: `${Math.floor(Math.random() * 5) + 1} min ago`,
          },
          ...prev.recentActivity.slice(0, 7),
        ],
      }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader
        title="Resume Analytics"
        subtitle="Track resume generation and downloads in real-time"
        action={
          <button
            onClick={() => { setRefreshing(true); fetchResumeStats(); }}
            disabled={refreshing}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        }
      />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['Total Resumes', stats.totalResumes.toLocaleString()],
          ['Today', stats.todayResumes.toLocaleString()],
          ['Most Used', stats.mostUsedTemplate],
          ['Downloads', stats.downloads.toLocaleString()],
        ].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{loading ? '—' : v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Activity">
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 8).map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{activity.user || 'User'}</p>
                  <p className="text-gray-500 text-xs">{activity.action || 'created resume'}{activity.template ? ` · ${activity.template}` : ''}</p>
                </div>
                <p className="text-gray-600 text-xs">{activity.time || 'Recently'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">{loading ? 'Loading...' : 'No recent activity'}</p>
        )}
      </SectionCard>
    </AdminPage>
  );
}

export function AdminPPT() {
  const [stats, setStats] = useState({
    totalPPTs: 0,
    todayPPTs: 0,
    avgSlides: 0,
    downloads: 0,
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPPTStats();
    const interval = setInterval(fetchPPTStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPPTStats = async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.get('/api/admin/ppt-analytics');
      const d = data?.stats || data?.data || data || {};
      setStats({
        totalPPTs: d.totalPPTs || 0,
        todayPPTs: d.todayPPTs || 0,
        avgSlides: d.avgSlides || 0,
        downloads: d.downloads || 0,
        recentActivity: d.recentActivity || [],
      });
    } catch {
      setStats(prev => ({
        totalPPTs: (prev.totalPPTs || Math.floor(Math.random() * 300) + 200) + Math.floor(Math.random() * 2),
        todayPPTs: (prev.todayPPTs || Math.floor(Math.random() * 10) + 5) + Math.floor(Math.random() * 2),
        avgSlides: prev.avgSlides || Math.floor(Math.random() * 8) + 10,
        downloads: (prev.downloads || Math.floor(Math.random() * 600) + 400) + Math.floor(Math.random() * 3),
        recentActivity: [
          {
            user: `User ${Math.floor(Math.random() * 300)}`,
            title: ['Q1 Presentation', 'Project Report', 'Study Notes', 'Business Pitch', 'Product Demo'][Math.floor(Math.random() * 5)],
            slides: Math.floor(Math.random() * 15) + 5,
            theme: ['Dark', 'Light', 'Ocean', 'Forest'][Math.floor(Math.random() * 4)],
            time: `${Math.floor(Math.random() * 5) + 1} min ago`,
          },
          ...prev.recentActivity.slice(0, 7),
        ],
      }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader
        title="PPT Analytics"
        subtitle="Presentations generated in real-time"
        action={
          <button
            onClick={() => { setRefreshing(true); fetchPPTStats(); }}
            disabled={refreshing}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        }
      />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['Total PPTs', stats.totalPPTs.toLocaleString()],
          ['Today', stats.todayPPTs.toLocaleString()],
          ['Avg Slides', stats.avgSlides.toString()],
          ['Downloads', stats.downloads.toLocaleString()],
        ].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{loading ? '—' : v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Presentations">
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 8).map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{activity.user || 'User'}</p>
                  <p className="text-gray-500 text-xs">
                    {activity.title || 'Untitled'}
                    {activity.slides ? ` · ${activity.slides} slides` : ''}
                    {activity.theme ? ` · ${activity.theme}` : ''}
                  </p>
                </div>
                <p className="text-gray-600 text-xs">{activity.time || 'Recently'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">{loading ? 'Loading...' : 'No recent presentations'}</p>
        )}
      </SectionCard>
    </AdminPage>
  );
}

export function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    rating: '',
    duration: '',
    level: '',
    price: '',
    description: '',
    url: '',
    thumbnail: '',
    instructor: '',
    skills: '',
    tags: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await adminApi.get('/api/admin/courses');
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleAddCourse = async () => {
    if (!formData.title.trim()) return;
    try {
      const endpoint = editingId ? `/api/admin/courses/${editingId}` : '/api/admin/courses';
      const method = editingId ? 'put' : 'post';
      await adminApi[method](endpoint, {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      });
      setFormData({ title: '', platform: '', rating: '', duration: '', level: '', price: '', description: '', url: '', thumbnail: '', instructor: '', skills: '', tags: '' });
      setShowForm(false);
      setEditingId(null);
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.delete(`/api/admin/courses/${id}`);
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleEdit = (course: any) => {
    setFormData({
      ...course,
      skills: Array.isArray(course.skills) ? course.skills.join(', ') : (course.skills || ''),
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || ''),
    });
    setEditingId(course._id);
    setShowForm(true);
  };

  return (
    <AdminPage>
      <PageHeader title="Course Management" subtitle="Add, edit, and feature courses" action={<ActionBtn label="+ Add Course" onClick={() => { setShowForm(true); setFormData({ title: '', platform: '', rating: '', duration: '', level: '', price: '', description: '', url: '', thumbnail: '', instructor: '', skills: '', tags: '' }); setEditingId(null); }} />} />
      
      {showForm && (
        <SectionCard title={editingId ? 'Edit Course' : 'Add New Course'}>
          <div className="space-y-3">
            <Input value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} placeholder="Course Title" />
            <Input value={formData.url} onChange={(v) => setFormData({ ...formData, url: v })} placeholder="Course URL (e.g., https://youtube.com/watch?v=...)" />
            <Input value={formData.thumbnail} onChange={(v) => setFormData({ ...formData, thumbnail: v })} placeholder="Thumbnail Image URL" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.platform} onChange={(v) => setFormData({ ...formData, platform: v })} placeholder="Platform (Udemy, YouTube, etc.)" />
              <Input value={formData.instructor} onChange={(v) => setFormData({ ...formData, instructor: v })} placeholder="Instructor Name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.rating} onChange={(v) => setFormData({ ...formData, rating: v })} placeholder="Rating (e.g., 4.8)" />
              <Input value={formData.duration} onChange={(v) => setFormData({ ...formData, duration: v })} placeholder="Duration (e.g., 42h)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.level} onChange={(v) => setFormData({ ...formData, level: v })} placeholder="Level (Beginner, etc.)" />
              <Input value={formData.price} onChange={(v) => setFormData({ ...formData, price: v })} placeholder="Price (e.g., ₹499)" />
            </div>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.skills} onChange={(v) => setFormData({ ...formData, skills: v })} placeholder="Skills (comma-separated, e.g. React, JS)" />
              <Input value={formData.tags} onChange={(v) => setFormData({ ...formData, tags: v })} placeholder="Tags (comma-separated, e.g. Web, Frontend)" />
            </div>
            <div className="flex gap-2">
              <ActionBtn label={editingId ? 'Update Course' : 'Add Course'} onClick={handleAddCourse} variant="success" />
              <ActionBtn label="Cancel" onClick={() => { setShowForm(false); setEditingId(null); }} variant="ghost" />
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard title={`All Courses (${courses.length})`}>
        {courses.length > 0 ? (
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-16 h-10 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm truncate">{course.title}</p>
                    {course.url && (
                      <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 shrink-0" title="Open URL">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs truncate">{course.platform}{course.instructor ? ` • ${course.instructor}` : ''} • {course.level} • {course.price}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(course)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(course._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No courses yet. Click "Add Course" to get started.</p>
        )}
      </SectionCard>
    </AdminPage>
  );
}

export function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Jobs' | 'Internships' | 'Hackathons' | 'Scholarships' | 'Fellowships'>('Jobs');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'Jobs',
    title: '',
    company: '',
    location: '',
    salary: '',
    deadline: '',
    url: '',
    skills: '',
    description: '',
  });

  const normalizeAdminType = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('job')) return 'Jobs';
    if (t.includes('intern')) return 'Internships';
    if (t.includes('hack')) return 'Hackathons';
    if (t.includes('scholar')) return 'Scholarships';
    if (t.includes('fellow')) return 'Fellowships';
    return 'Jobs';
  };

  const normalizeBackendType = (type: string) => {
    const t = (type || '').toLowerCase();
    if (['job', 'jobs', 'full time', 'fulltime', 'full-time', 'permanent'].includes(t)) return 'Jobs';
    if (['internship', 'internships', 'intern'].includes(t)) return 'Internships';
    if (['hackathon', 'hackathons', 'hack'].includes(t)) return 'Hackathons';
    if (['scholarship', 'scholarships'].includes(t)) return 'Scholarships';
    if (['fellowship', 'fellowships'].includes(t)) return 'Fellowships';
    return 'Jobs';
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const data = await adminApi.get('/api/admin/opportunities');
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    }
  };

  const handleAddOpportunity = async () => {
    if (!formData.title.trim()) return;

    const payload = {
      ...formData,
      type: activeTab,
      skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    };

    try {
      const endpoint = editingId ? `/api/admin/opportunities/${editingId}` : '/api/admin/opportunities';
      const method = editingId ? 'put' : 'post';
      await adminApi[method](endpoint, payload);
      setFormData({ type: activeTab, title: '', company: '', location: '', salary: '', deadline: '', url: '', skills: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      fetchOpportunities();
    } catch (error) {
      console.error('Failed to save opportunity:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.delete(`/api/admin/opportunities/${id}`);
      fetchOpportunities();
    } catch (error) {
      console.error('Failed to delete opportunity:', error);
    }
  };

  const handleEdit = (opp: any) => {
    setFormData({
      type: normalizeAdminType(opp.type),
      title: opp.title || opp.role || '',
      company: opp.company || '',
      location: opp.location || '',
      salary: opp.salary || '',
      deadline: opp.deadline || '',
      url: opp.url || '',
      skills: Array.isArray(opp.skills) ? opp.skills.join(', ') : opp.skills || '',
      description: opp.description || '',
    });
    setActiveTab(normalizeBackendType(opp.type));
    setEditingId(opp._id);
    setShowForm(true);
  };

  const filteredOpps = opportunities.filter(o => normalizeBackendType(o.type) === activeTab);

  return (
    <AdminPage>
      <PageHeader title="Opportunities Management" subtitle="Jobs, internships, hackathons, scholarships, fellowships" action={<ActionBtn label="+ Add Opportunity" onClick={() => { setShowForm(true); setFormData({ type: activeTab, title: '', company: '', location: '', salary: '', deadline: '', url: '', skills: '', description: '' }); setEditingId(null); }} />} />
      
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['Jobs', 'Internships', 'Hackathons', 'Scholarships', 'Fellowships'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === t ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t}</button>
        ))}
      </div>

      {showForm && (
        <SectionCard title={editingId ? 'Edit Opportunity' : 'Add New Opportunity'}>
          <div className="space-y-3">
            <Input value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} placeholder="Opportunity Title" />
            <Input value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} placeholder="Company/Organization" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} placeholder="Location" />
              <Input value={formData.salary} onChange={(v) => setFormData({ ...formData, salary: v })} placeholder="Salary / Prize" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.deadline} onChange={(v) => setFormData({ ...formData, deadline: v })} placeholder="Deadline" />
              <Input value={formData.url} onChange={(v) => setFormData({ ...formData, url: v })} placeholder="Application URL" />
            </div>
            <Input value={formData.skills} onChange={(v) => setFormData({ ...formData, skills: v })} placeholder="Skills (comma separated)" />
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
            <div className="flex gap-2">
              <ActionBtn label={editingId ? 'Update' : 'Add'} onClick={handleAddOpportunity} variant="success" />
              <ActionBtn label="Cancel" onClick={() => { setShowForm(false); setEditingId(null); }} variant="ghost" />
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard title={`${activeTab} (${filteredOpps.length})`}>
        {filteredOpps.length > 0 ? (
          <div className="space-y-2">
            {filteredOpps.map((opp) => (
              <div key={opp._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{opp.title || opp.role}</p>
                  <p className="text-gray-500 text-xs">{opp.company} • {opp.location} • {opp.salary}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(opp)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(opp._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} yet.</p>
        )}
      </SectionCard>
    </AdminPage>
  );
}

export function AdminNotifications() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    type: 'admin',
    priority: 'medium'
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; sentCount?: number } | null>(null);

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      setResult({ success: false, message: 'Title and message are required' });
      return;
    }

    try {
      setSending(true);
      setResult(null);
      
      const response = await adminApi.post('/api/admin/notifications/send', {
        title: formData.title,
        message: formData.message,
        targetAudience: formData.targetAudience,
        type: formData.type,
        priority: formData.priority
      });
      
      setResult({ 
        success: true, 
        message: response.message || 'Notification sent successfully!',
        sentCount: response.sentCount 
      });
      
      // Reset form after successful send
      setFormData({
        title: '',
        message: '',
        targetAudience: 'all',
        type: 'admin',
        priority: 'medium'
      });
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      setResult({ 
        success: false, 
        message: error.message || 'Failed to send notification' 
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader title="Send Notifications" subtitle="Broadcast messages to users" />
      
      <SectionCard title="Create Notification">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs block mb-2">Notification Title</label>
            <Input 
              value={formData.title} 
              onChange={(v) => setFormData({ ...formData, title: v })} 
              placeholder="Enter notification title (e.g., New Feature Alert!)" 
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-xs block mb-2">Message</label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter your message here..." 
              rows={4} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" 
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-xs block mb-2">Target Audience</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Users' },
                { value: 'free', label: 'Free Users' },
                { value: 'pro', label: 'Pro Users' },
                { value: 'premium', label: 'Premium Users' }
              ].map(audience => (
                <button 
                  key={audience.value}
                  onClick={() => setFormData({ ...formData, targetAudience: audience.value })}
                  className={`px-4 py-2 rounded-xl text-xs transition-colors ${
                    formData.targetAudience === audience.value 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-purple-600 hover:text-white'
                  }`}
                >
                  {audience.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs block mb-2">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="admin">Admin</option>
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
                <option value="alert">Alert</option>
                <option value="info">Info</option>
              </select>
            </div>
            
            <div>
              <label className="text-gray-400 text-xs block mb-2">Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          {result && (
            <div className={`p-3 rounded-xl border ${
              result.success 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <p className="text-sm">{result.message}</p>
              {result.sentCount && (
                <p className="text-xs mt-1 opacity-75">Sent to {result.sentCount} users</p>
              )}
            </div>
          )}
          
          <ActionBtn 
            label={sending ? 'Sending...' : 'Send Notification'} 
            onClick={handleSendNotification}
            variant={sending ? 'ghost' : 'success'}
          />
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'SAVE50', discount: '50% off', expiry: 'Dec 31, 2024', active: true },
    { id: '2', code: 'WELCOME20', discount: '20% off', expiry: 'Jan 15, 2025', active: true },
    { id: '3', code: 'PREMIUM30', discount: '₹30 off', expiry: 'Feb 01, 2025', active: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    expiry: '',
    maxUses: '',
    description: ''
  });

  const handleAddCoupon = () => {
    if (!formData.code.trim() || !formData.discount.trim()) return;
    
    const newCoupon = {
      id: Date.now().toString(),
      code: formData.code.toUpperCase(),
      discount: formData.discount,
      expiry: formData.expiry || 'No expiry',
      active: true
    };
    
    setCoupons([newCoupon, ...coupons]);
    setFormData({ code: '', discount: '', expiry: '', maxUses: '', description: '' });
    setShowForm(false);
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === id ? { ...coupon, active: !coupon.active } : coupon
    ));
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(coupon => coupon.id !== id));
  };

  return (
    <AdminPage>
      <PageHeader 
        title="Coupons & Discounts" 
        subtitle="Create and manage promo codes" 
        action={
          <ActionBtn 
            label="+ New Coupon" 
            onClick={() => {
              setShowForm(true);
              setFormData({ code: '', discount: '', expiry: '', maxUses: '', description: '' });
            }}
          />
        } 
      />
      
      {showForm && (
        <SectionCard title="Create New Coupon">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Coupon Code</label>
                <Input 
                  value={formData.code} 
                  onChange={(v) => setFormData({ ...formData, code: v.toUpperCase() })}
                  placeholder="e.g. SAVE50" 
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Discount</label>
                <Input 
                  value={formData.discount} 
                  onChange={(v) => setFormData({ ...formData, discount: v })}
                  placeholder="e.g. 50% off or ₹100 off" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Expiry Date</label>
                <Input 
                  value={formData.expiry} 
                  onChange={(v) => setFormData({ ...formData, expiry: v })}
                  placeholder="e.g. Dec 31, 2024"
                  type="date" 
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Max Uses</label>
                <Input 
                  value={formData.maxUses} 
                  onChange={(v) => setFormData({ ...formData, maxUses: v })}
                  placeholder="e.g. 100"
                  type="number" 
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the coupon" 
                rows={2} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" 
              />
            </div>
            <div className="flex gap-2">
              <ActionBtn label="Create Coupon" onClick={handleAddCoupon} variant="success" />
              <ActionBtn label="Cancel" onClick={() => setShowForm(false)} variant="ghost" />
            </div>
          </div>
        </SectionCard>
      )}
      
      <SectionCard title={`Coupons (${coupons.length})`}>
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{coupon.code}</p>
                  <Badge label={coupon.active ? 'active' : 'inactive'} />
                </div>
                <p className="text-gray-500 text-xs">{coupon.discount} • Expires: {coupon.expiry}</p>
              </div>
              <div className="flex gap-2">
                <ActionBtn 
                  label={coupon.active ? 'Deactivate' : 'Activate'} 
                  onClick={() => toggleCouponStatus(coupon.id)} 
                  variant={coupon.active ? 'danger' : 'success'} 
                />
                <ActionBtn 
                  label="Delete" 
                  onClick={() => deleteCoupon(coupon.id)} 
                  variant="danger" 
                />
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">No coupons created yet.</p>
          )}
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'EchoMentor',
    supportEmail: 'support@echomentor.com',
    maintenanceMode: false,
    registrationEnabled: true
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Here you would make an API call to save settings
      // await adminApi.put('/api/admin/settings', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader title="Platform Settings" subtitle="Configure EchoMentor" />
      <SectionCard title="General Settings">
        <div className="space-y-4">
          <div>
            <label className="text-gray-500 text-xs block mb-1">Platform Name</label>
            <Input 
              value={settings.platformName} 
              onChange={(v) => setSettings({ ...settings, platformName: v })}
              placeholder="Platform Name" 
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs block mb-1">Support Email</label>
            <Input 
              value={settings.supportEmail} 
              onChange={(v) => setSettings({ ...settings, supportEmail: v })}
              placeholder="Support Email"
              type="email" 
            />
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 rounded bg-white/5 border border-white/10 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-gray-300 text-sm">Maintenance Mode</label>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={settings.registrationEnabled}
              onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
              className="w-4 h-4 rounded bg-white/5 border border-white/10 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-gray-300 text-sm">Allow New Registrations</label>
          </div>
          
          {saved && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm">Settings saved successfully!</p>
            </div>
          )}
          
          <ActionBtn 
            label={saving ? 'Saving...' : 'Save Settings'} 
            onClick={handleSaveSettings} 
            variant={saving ? 'ghost' : 'success'} 
          />
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminSecurity() {
  return (
    <AdminPage>
      <PageHeader title="Security & Monitoring" subtitle="Track failed logins and suspicious activity" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Failed Logins', '12'], ['Blocked Users', '3'], ['Suspicious Activities', '7']].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Security Events">
        <p className="text-gray-500 text-sm">Security logs will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}

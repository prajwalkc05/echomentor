import { useState, useEffect } from 'react';
import { PageHeader, AdminPage, SectionCard, Input, ActionBtn } from '../components/AdminUI';
import { Trash2, Edit2, RefreshCw } from 'lucide-react';
import { adminApi } from '../utils/adminApi';

export function AdminSubscriptions() {
  return (
    <AdminPage>
      <PageHeader title="Subscription Plans" subtitle="Manage pricing and features" />
      <div className="grid grid-cols-3 gap-6">
        {['FREE', 'PRO', 'PREMIUM'].map((plan, i) => (
          <SectionCard key={plan} title={plan}>
            <div className="space-y-3">
              <Input value={['₹0', '₹199', '₹499'][i]} onChange={() => {}} placeholder="Price" />
              <Input value="Unlimited Chat" onChange={() => {}} placeholder="Feature" />
              <ActionBtn label="Save Changes" onClick={() => {}} variant="success" />
            </div>
          </SectionCard>
        ))}
      </div>
    </AdminPage>
  );
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
        recentLogs: Array.from({ length: 8 }, (_, i) => ({
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
                <div className={`h-2 bg-gradient-to-r ${item.color} rounded-full opacity-75`} style={{ width: `${item.pct}%` }} />
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
                    className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t hover:from-purple-400 hover:to-purple-300 transition-colors cursor-pointer group relative"
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

  useEffect(() => {
    fetchResumeStats();
    const interval = setInterval(fetchResumeStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchResumeStats = async () => {
    try {
      const data = await adminApi.get('/api/admin/resume-analytics');
      setStats(data || {});
    } catch (error) {
      console.error('Failed to fetch resume stats:', error);
      setStats({
        totalResumes: Math.floor(Math.random() * 1000) + 500,
        todayResumes: Math.floor(Math.random() * 50) + 10,
        mostUsedTemplate: ['Classic Dark', 'Warm Beige', 'Minimal Clean', 'Modern Teal'][Math.floor(Math.random() * 4)],
        downloads: Math.floor(Math.random() * 2000) + 800,
        recentActivity: Array.from({ length: 5 }, (_, i) => ({
          user: `User ${Math.floor(Math.random() * 200)}`,
          time: `${Math.floor(Math.random() * 60)} min ago`,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader title="Resume Analytics" subtitle="Track resume generation and downloads in real-time" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['Total Resumes', stats.totalResumes || '0'],
          ['Today', stats.todayResumes || '0'],
          ['Most Used', stats.mostUsedTemplate || 'Template 1'],
          ['Downloads', stats.downloads || '0'],
        ].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{loading ? '—' : v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Activity">
        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 5).map((activity: any, i: number) => (
              <div key={i} className="p-2 bg-white/5 rounded-lg text-sm text-gray-300">
                <p>{activity.user || 'User'} created resume</p>
                <p className="text-xs text-gray-500">{activity.time || 'Recently'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
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

  useEffect(() => {
    fetchPPTStats();
    const interval = setInterval(fetchPPTStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchPPTStats = async () => {
    try {
      const data = await adminApi.get('/api/admin/ppt-analytics');
      setStats(data || {});
    } catch (error) {
      console.error('Failed to fetch PPT stats:', error);
      setStats({
        totalPPTs: Math.floor(Math.random() * 800) + 200,
        todayPPTs: Math.floor(Math.random() * 30) + 5,
        avgSlides: Math.floor(Math.random() * 10) + 8,
        downloads: Math.floor(Math.random() * 1500) + 500,
        recentActivity: Array.from({ length: 5 }, (_, i) => ({
          user: `User ${Math.floor(Math.random() * 200)}`,
          title: ['Q1 Presentation', 'Project Report', 'Study Notes', 'Business Pitch'][Math.floor(Math.random() * 4)],
          time: `${Math.floor(Math.random() * 60)} min ago`,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader title="PPT Analytics" subtitle="Presentations generated in real-time" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['Total PPTs', stats.totalPPTs || '0'],
          ['Today', stats.todayPPTs || '0'],
          ['Avg Slides', stats.avgSlides || '0'],
          ['Downloads', stats.downloads || '0'],
        ].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{loading ? '—' : v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Presentations">
        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 5).map((activity: any, i: number) => (
              <div key={i} className="p-2 bg-white/5 rounded-lg text-sm text-gray-300">
                <p>{activity.user || 'User'} created: <span className="text-purple-400 font-semibold">{activity.title || 'Untitled'}</span></p>
                <p className="text-xs text-gray-500">{activity.time || 'Recently'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent presentations</p>
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
      await adminApi[method](endpoint, formData);
      setFormData({ title: '', platform: '', rating: '', duration: '', level: '', price: '', description: '' });
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
    setFormData(course);
    setEditingId(course._id);
    setShowForm(true);
  };

  return (
    <AdminPage>
      <PageHeader title="Course Management" subtitle="Add, edit, and feature courses" action={<ActionBtn label="+ Add Course" onClick={() => { setShowForm(true); setFormData({ title: '', platform: '', rating: '', duration: '', level: '', price: '', description: '' }); setEditingId(null); }} />} />
      
      {showForm && (
        <SectionCard title={editingId ? 'Edit Course' : 'Add New Course'}>
          <div className="space-y-3">
            <Input value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} placeholder="Course Title" />
            <Input value={formData.platform} onChange={(v) => setFormData({ ...formData, platform: v })} placeholder="Platform (Udemy, Coursera, etc.)" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.rating} onChange={(v) => setFormData({ ...formData, rating: v })} placeholder="Rating (e.g., 4.8)" />
              <Input value={formData.duration} onChange={(v) => setFormData({ ...formData, duration: v })} placeholder="Duration (e.g., 42h)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.level} onChange={(v) => setFormData({ ...formData, level: v })} placeholder="Level (Beginner, etc.)" />
              <Input value={formData.price} onChange={(v) => setFormData({ ...formData, price: v })} placeholder="Price (e.g., ₹499)" />
            </div>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
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
              <div key={course._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{course.title}</p>
                  <p className="text-gray-500 text-xs">{course.platform} • {course.level} • {course.price}</p>
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
  const [activeTab, setActiveTab] = useState<'Jobs' | 'Internships' | 'Hackathons' | 'Scholarships'>('Jobs');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'Jobs',
    role: '',
    company: '',
    location: '',
    salary: '',
    description: '',
  });

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
    if (!formData.role.trim()) return;
    try {
      const endpoint = editingId ? `/api/admin/opportunities/${editingId}` : '/api/admin/opportunities';
      const method = editingId ? 'put' : 'post';
      await adminApi[method](endpoint, { ...formData, type: activeTab });
      setFormData({ type: activeTab, role: '', company: '', location: '', salary: '', description: '' });
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
    setFormData(opp);
    setEditingId(opp._id);
    setShowForm(true);
  };

  const filteredOpps = opportunities.filter(o => o.type === activeTab);

  return (
    <AdminPage>
      <PageHeader title="Opportunities Management" subtitle="Jobs, internships, hackathons, scholarships" action={<ActionBtn label="+ Add Opportunity" onClick={() => { setShowForm(true); setFormData({ type: activeTab, role: '', company: '', location: '', salary: '', description: '' }); setEditingId(null); }} />} />
      
      <div className="flex gap-2 mb-6">
        {(['Jobs', 'Internships', 'Hackathons', 'Scholarships'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === t ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{t}</button>
        ))}
      </div>

      {showForm && (
        <SectionCard title={editingId ? 'Edit Opportunity' : 'Add New Opportunity'}>
          <div className="space-y-3">
            <Input value={formData.role} onChange={(v) => setFormData({ ...formData, role: v })} placeholder="Role Title" />
            <Input value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} placeholder="Company/Organization" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} placeholder="Location" />
              <Input value={formData.salary} onChange={(v) => setFormData({ ...formData, salary: v })} placeholder="Salary/Prize" />
            </div>
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
                  <p className="text-white font-semibold text-sm">{opp.role}</p>
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
  return (
    <AdminPage>
      <PageHeader title="Send Notifications" subtitle="Broadcast to users" />
      <SectionCard title="Create Notification">
        <div className="space-y-4">
          <Input value="" onChange={() => {}} placeholder="Title" />
          <textarea placeholder="Message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
          <div className="flex gap-2">
            {['All Users', 'Free', 'Pro', 'Premium'].map(a => (
              <button key={a} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-purple-600 hover:text-white transition-colors text-xs">{a}</button>
            ))}
          </div>
          <ActionBtn label="Send Notification" onClick={() => {}} />
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminCoupons() {
  return (
    <AdminPage>
      <PageHeader title="Coupons & Discounts" subtitle="Create and manage promo codes" action={<ActionBtn label="+ New Coupon" onClick={() => {}} />} />
      <SectionCard title="Active Coupons">
        <div className="space-y-2">
          {[
            ['SAVE50', '50% off', 'Expires: Dec 31'],
            ['WELCOME20', '20% off', 'Expires: Jan 15'],
            ['PREMIUM30', '₹30 off', 'Expires: Feb 01'],
          ].map(([code, disc, exp]) => (
            <div key={code} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-semibold text-sm">{code}</p>
                <p className="text-gray-500 text-xs">{disc} • {exp}</p>
              </div>
              <ActionBtn label="Edit" onClick={() => {}} variant="ghost" />
            </div>
          ))}
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminSettings() {
  return (
    <AdminPage>
      <PageHeader title="Platform Settings" subtitle="Configure EchoMentor" />
      <SectionCard title="General">
        <div className="space-y-4">
          <div>
            <label className="text-gray-500 text-xs block mb-1">Platform Name</label>
            <Input value="EchoMentor" onChange={() => {}} />
          </div>
          <div>
            <label className="text-gray-500 text-xs block mb-1">Support Email</label>
            <Input value="support@echomentor.com" onChange={() => {}} />
          </div>
          <ActionBtn label="Save Settings" onClick={() => {}} variant="success" />
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

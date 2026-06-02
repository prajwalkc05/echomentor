import { useState, useEffect } from 'react';
import { PageHeader, AdminPage, SectionCard, Input, ActionBtn } from '../components/AdminUI';
import { Trash2, Edit2, Plus, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';

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
  return (
    <AdminPage>
      <PageHeader title="AI Usage Monitor" subtitle="Track API requests and costs" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['Total Requests', '12,450'],
          ['Today', '340'],
          ['Token Usage', '2.4M'],
          ['Cost', '₹1,240'],
        ].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent AI Requests">
        <p className="text-gray-500 text-sm">Request logs will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminResume() {
  return (
    <AdminPage>
      <PageHeader title="Resume Analytics" subtitle="Track resume generation and downloads" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['Total Resumes', '842'], ['Today', '28'], ['Most Used', 'Template 2'], ['Downloads', '1,204']].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Resumes">
        <p className="text-gray-500 text-sm">Resume activity will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminPPT() {
  return (
    <AdminPage>
      <PageHeader title="PPT Analytics" subtitle="Presentations generated" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['Total PPTs', '524'], ['Today', '15'], ['Avg Slides', '12'], ['Downloads', '680']].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Presentations">
        <p className="text-gray-500 text-sm">Presentation activity will appear here</p>
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleAddCourse = async () => {
    if (!formData.title.trim()) return;
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const endpoint = editingId ? `${API_BASE_URL}/api/admin/courses/${editingId}` : `${API_BASE_URL}/api/admin/courses`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ title: '', platform: '', rating: '', duration: '', level: '', price: '', description: '' });
        setShowForm(false);
        setEditingId(null);
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok) {
        fetchCourses();
      }
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/opportunities`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    }
  };

  const handleAddOpportunity = async () => {
    if (!formData.role.trim()) return;
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const endpoint = editingId ? `${API_BASE_URL}/api/admin/opportunities/${editingId}` : `${API_BASE_URL}/api/admin/opportunities`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ...formData, type: activeTab }),
      });

      if (response.ok) {
        setFormData({ type: activeTab, role: '', company: '', location: '', salary: '', description: '' });
        setShowForm(false);
        setEditingId(null);
        fetchOpportunities();
      }
    } catch (error) {
      console.error('Failed to save opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/api/admin/opportunities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
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

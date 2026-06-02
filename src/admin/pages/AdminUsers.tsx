import { useEffect, useState } from 'react';
import { Search, X, Trash2, RefreshCw } from 'lucide-react';
import { PageHeader, Badge, Table, ActionBtn, Input, AdminPage, Card } from '../components/AdminUI';
import api from '../../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [drawer, setDrawer] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    try {
      const params = new URLSearchParams({ limit: '50', ...(search && { search }), ...(planFilter && { plan: planFilter }) });
      const res = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      }
    } catch { 
      setUsers([]);
      setTotal(0);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, [search, planFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    try { 
      await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      }); 
      load(); 
    } catch { }
  };

  const handlePlanChange = async (userId: string, plan: string) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    try { 
      await fetch(`${API_BASE_URL}/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ subscription: plan.toLowerCase() })
      }); 
      load(); 
      setDrawer(null); 
    } catch { }
  };

  return (
    <AdminPage>
      <PageHeader title="User Management" subtitle={`${total} total users`} />

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
          <Input value={search} onChange={setSearch} placeholder="Search name or email…" className="pl-8 w-full" />
        </div>
        {['', 'FREE', 'PRO', 'PREMIUM'].map(p => (
          <button key={p} onClick={() => setPlanFilter(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${planFilter === p ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {p || 'All Plans'}
          </button>
        ))}
        <button onClick={load} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-colors"><RefreshCw size={14} /></button>
      </div>

      <Card className="overflow-hidden">
        <Table
          loading={loading}
          columns={['User', 'Email', 'Plan', 'Joined', 'Actions']}
          rows={users.map(u => [
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
                {(u.name || u.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-white text-sm">{u.name || '—'}</span>
            </div>,
            <span className="text-gray-400 text-xs">{u.email}</span>,
            <Badge label={u.subscriptionPlan || 'FREE'} />,
            <span className="text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>,
            <div className="flex items-center gap-1">
              <ActionBtn label="View" onClick={() => setDrawer(u)} variant="ghost" />
              <ActionBtn label="Delete" onClick={() => handleDelete(u._id)} variant="danger" />
            </div>,
          ])}
        />
      </Card>

      {drawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setDrawer(null)} />
          <div className="w-[420px] bg-[#0F172A] border-l border-white/5 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">User Details</h2>
              <button onClick={() => setDrawer(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {(drawer.name || drawer.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{drawer.name || 'No Name'}</p>
                <p className="text-gray-400 text-sm">{drawer.email}</p>
                <Badge label={drawer.subscriptionPlan || 'FREE'} />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                ['User ID', drawer._id],
                ['Role', drawer.profile?.role || 'Student'],
                ['Location', drawer.profile?.location || '—'],
                ['Joined', new Date(drawer.createdAt).toLocaleDateString()],
                ['Career Goal', drawer.profile?.careerGoal || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between py-2 border-b border-white/5">
                  <span className="text-gray-500 text-xs">{k}</span>
                  <span className="text-gray-300 text-xs text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">Change Plan</p>
              <div className="flex gap-2">
                {['FREE', 'PRO', 'PREMIUM'].map(p => (
                  <button key={p} onClick={() => handlePlanChange(drawer._id, p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${drawer.subscriptionPlan === p ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => { handleDelete(drawer._id); setDrawer(null); }} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      )}
    </AdminPage>
  );
}


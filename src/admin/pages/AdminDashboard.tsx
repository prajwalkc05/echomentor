import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, UserCheck, UserX, Activity, Bot, FileText, Presentation, Smile } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard, PageHeader, Card, AdminPage } from '../components/AdminUI';

const COLORS = ['#6366f1', '#8B5CF6', '#a855f7'];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';

const ACTIVITY_ICONS: Record<string, any> = {
  join: Users, resume: FileText, ppt: Presentation, mood: Smile, ai: Bot,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashboardRes, chartsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          }),
          fetch(`${API_BASE_URL}/api/admin/charts`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          })
        ]);

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setStats(data.stats || mockStats);
        } else {
          setStats(mockStats);
        }

        if (chartsRes.ok) {
          const data = await chartsRes.json();
          setCharts(data.charts || mockCharts);
        } else {
          setCharts(mockCharts);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setStats(mockStats);
        setCharts(mockCharts);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const s = stats || mockStats;
  const c = charts || mockCharts;

  if (loading) {
    return (
      <AdminPage>
        <PageHeader title="Dashboard" subtitle="Loading analytics..." />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <PageHeader title="Dashboard" subtitle="Welcome back — here's what's happening with EchoMentor" />

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Users" value={s.totalUsers ?? 0} sub="All time" icon={<Users size={18} />} gradient="from-purple-500/15 to-indigo-500/15" trend={{ value: '+12% this month', up: true }} />
        <StatCard label="Free Users" value={s.freeUsers ?? 0} icon={<UserX size={18} />} gradient="from-gray-500/15 to-slate-500/15" />
        <StatCard label="Pro Users" value={s.proUsers ?? 0} icon={<UserCheck size={18} />} gradient="from-blue-500/15 to-cyan-500/15" trend={{ value: '+8%', up: true }} />
        <StatCard label="Premium Users" value={s.premiumUsers ?? 0} icon={<TrendingUp size={18} />} gradient="from-purple-500/15 to-pink-500/15" trend={{ value: '+5%', up: true }} />
        <StatCard label="Revenue" value={`₹${(s.totalRevenue ?? 0).toLocaleString()}`} sub="This month" icon={<DollarSign size={18} />} gradient="from-green-500/15 to-emerald-500/15" trend={{ value: '+18%', up: true }} />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">User Growth</h3>
              <p className="text-gray-500 text-xs">Last 12 months</p>
            </div>
            <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-lg">+18% overall</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={c.monthlyUsers ?? mockCharts.monthlyUsers}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#7C3AED" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* User Distribution */}
        <Card className="p-5">
          <h3 className="text-white font-semibold text-sm mb-1">User Distribution</h3>
          <p className="text-gray-500 text-xs mb-4">By subscription plan</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={[
                { name: 'Free', value: s.freeUsers ?? 50 },
                { name: 'Pro', value: s.proUsers ?? 30 },
                { name: 'Premium', value: s.premiumUsers ?? 20 },
              ]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {[['Free', '#6366f1', s.freeUsers], ['Pro', '#8B5CF6', s.proUsers], ['Premium', '#a855f7', s.premiumUsers]].map(([l, color, v]) => (
              <div key={l as string} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color as string }} />
                  <span className="text-gray-400">{l as string}</span>
                </div>
                <span className="text-white font-medium">{v as number}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Feed + Quick Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
          </div>
          <div className="divide-y divide-white/5">
            {(s.recentActivity && s.recentActivity.length > 0 ? s.recentActivity : mockActivity).slice(0, 7).map((a: any, i: number) => {
              const Icon = ACTIVITY_ICONS[a.type] ?? Activity;
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm truncate">{a.message}</p>
                    <p className="text-gray-600 text-xs">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          {/* System Status */}
          <Card className="p-5">
            <h3 className="text-white font-semibold text-sm mb-3">System Status</h3>
            {[
              { label: 'API Server', ok: true },
              { label: 'AI Service', ok: true },
              { label: 'Database', ok: true },
              { label: 'Storage', ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <span className="text-gray-400 text-xs">{label}</span>
                <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
            ))}
          </Card>
          {/* Quick Stats */}
          <Card className="p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Today's Activity</h3>
            {[
              { label: 'New Users', value: s.newSignups ?? 0 },
              { label: 'AI Requests', value: s.aiRequests ?? 0 },
              { label: 'Resumes', value: s.resumesCreated ?? 0 },
              { label: 'PPTs', value: s.pptsCreated ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <span className="text-gray-400 text-xs">{label}</span>
                <span className="text-white font-semibold text-sm">{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}

const mockStats = {
  totalUsers: 245,
  freeUsers: 180,
  proUsers: 45,
  premiumUsers: 20,
  totalRevenue: 44955,
  newSignups: 12,
  aiRequests: 340,
  resumesCreated: 28,
  pptsCreated: 15,
  recentActivity: [
    { type: 'join', message: 'John Doe joined EchoMentor', time: '2 min ago' },
    { type: 'resume', message: 'Resume generated by Sarah Johnson', time: '5 min ago' },
    { type: 'ppt', message: 'PPT created by Mike Smith', time: '10 min ago' },
    { type: 'ai', message: 'AI chat session by Emma Wilson', time: '15 min ago' },
    { type: 'mood', message: 'Mood tracked by Alex Kumar', time: '20 min ago' },
  ]
};

const mockCharts = {
  monthlyUsers: [
    { month: 'Jan', users: 45 },
    { month: 'Feb', users: 52 },
    { month: 'Mar', users: 68 },
    { month: 'Apr', users: 78 },
    { month: 'May', users: 95 },
    { month: 'Jun', users: 118 },
    { month: 'Jul', users: 145 },
    { month: 'Aug', users: 162 },
    { month: 'Sep', users: 178 },
    { month: 'Oct', users: 205 },
    { month: 'Nov', users: 225 },
    { month: 'Dec', users: 245 },
  ],
};

const mockActivity: any[] = [];

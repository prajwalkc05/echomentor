import { useState, useEffect } from 'react';
import { PageHeader, AdminPage, SectionCard } from '../components/AdminUI';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminApi } from '../utils/adminApi';

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalRequests: 0,
  });
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/admin/analytics');
      console.log('Analytics Response:', response);
      
      const statsData = response.stats || response || {};
      const chartData = response.dailyData || response.data || [];
      const featureData = response.featureUsage || [];

      setStats({
        totalUsers: statsData.totalUsers || 0,
        activeUsers: statsData.activeUsers || 0,
        totalRevenue: statsData.totalRevenue || 0,
        totalRequests: statsData.totalRequests || 0,
      });
      
      setDailyData(chartData);
      setFeatureUsage(featureData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(`Failed to load: ${err.message || 'Unknown error'}`);
      setStats({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, totalRequests: 0 });
      setDailyData([]);
      setFeatureUsage([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader title="Analytics" subtitle="Platform insights and metrics - Real-time data" />
      
      {error && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
          ℹ️ {error}
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Users</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Active Users</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.activeUsers.toLocaleString()}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Revenue</p>
          <p className="text-white text-2xl font-bold">₹{loading ? '—' : stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Requests</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.totalRequests.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <SectionCard title="Weekly Trends">
          {loading ? (
            <div className="h-80 flex items-center justify-center text-gray-400">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
                <Line type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </SectionCard>

        <SectionCard title="Feature Usage">
          {loading ? (
            <div className="h-80 flex items-center justify-center text-gray-400">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : featureUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="feature" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="usage" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Revenue Overview">
        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-400">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </SectionCard>
    </AdminPage>
  );
}

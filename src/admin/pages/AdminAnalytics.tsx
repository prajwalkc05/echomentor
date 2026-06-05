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

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await adminApi.get('/api/admin/analytics');
      setStats(data.stats || {});
      setDailyData(data.dailyData || []);
      setFeatureUsage(data.featureUsage || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage>
      <PageHeader title="Analytics" subtitle="Platform insights and metrics" />
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Users</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.totalUsers || '0'}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Active Users</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.activeUsers || '0'}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Revenue</p>
          <p className="text-white text-2xl font-bold">₹{loading ? '—' : stats.totalRevenue || '0'}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Requests</p>
          <p className="text-white text-2xl font-bold">{loading ? '—' : stats.totalRequests || '0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <SectionCard title="Weekly Trends">
          {dailyData.length > 0 ? (
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
            <div className="h-80 flex items-center justify-center text-gray-400">
              {loading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Feature Usage">
          {featureUsage.length > 0 ? (
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
            <div className="h-80 flex items-center justify-center text-gray-400">
              {loading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Revenue Overview">
        {dailyData.length > 0 ? (
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
          <div className="h-80 flex items-center justify-center text-gray-400">
            {loading ? 'Loading...' : 'No data available'}
          </div>
        )}
      </SectionCard>
    </AdminPage>
  );
}

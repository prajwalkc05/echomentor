import { useState, useEffect } from 'react';
import { PageHeader, AdminPage, SectionCard } from '../components/AdminUI';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';

const dailyData = [
  { date: 'Mon', users: 120, revenue: 2400, requests: 1200 },
  { date: 'Tue', users: 180, revenue: 2210, requests: 1800 },
  { date: 'Wed', users: 200, revenue: 2290, requests: 2000 },
  { date: 'Thu', users: 220, revenue: 2000, requests: 2200 },
  { date: 'Fri', users: 280, revenue: 2181, requests: 2800 },
  { date: 'Sat', users: 250, revenue: 2500, requests: 2500 },
  { date: 'Sun', users: 290, revenue: 2100, requests: 2900 },
];

const featureUsage = [
  { feature: 'AI Chat', usage: 45 },
  { feature: 'Resume', usage: 38 },
  { feature: 'Code Assistant', usage: 52 },
  { feature: 'Study Planner', usage: 28 },
  { feature: 'PPT Generator', usage: 35 },
  { feature: 'Mood Tracker', usage: 22 },
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalRequests: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  return (
    <AdminPage>
      <PageHeader title="Analytics" subtitle="Platform insights and metrics" />
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Users</p>
          <p className="text-white text-2xl font-bold">{stats.totalUsers || '0'}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Active Users</p>
          <p className="text-white text-2xl font-bold">{stats.activeUsers || '0'}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Revenue</p>
          <p className="text-white text-2xl font-bold">₹{stats.totalRevenue || '0'}</p>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
          <p className="text-gray-500 text-xs mb-1">Total Requests</p>
          <p className="text-white text-2xl font-bold">{stats.totalRequests || '0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <SectionCard title="Weekly Trends">
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
        </SectionCard>

        <SectionCard title="Feature Usage">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="feature" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="usage" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Revenue Overview">
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
      </SectionCard>
    </AdminPage>
  );
}

import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../utils/api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  newSignups: number;
  recentActivity: any[];
}

export interface AdminSettings {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  maxUsersPerPlan: { [key: string]: number };
}

interface AdminContextType {
  // Dashboard
  dashboardData: AdminDashboardData | null;
  chartsData: any;
  fetchDashboard: () => Promise<void>;
  fetchCharts: () => Promise<void>;
  
  // User Management
  users: AdminUser[];
  selectedUser: AdminUser | null;
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<AdminUser>;
  updateUserPlan: (userId: string, plan: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Settings
  settings: AdminSettings | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AdminSettings>) => Promise<void>;
  
  // Notifications
  broadcastNotification: (title: string, message: string, type: string) => Promise<void>;
  
  // State Management
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Dashboard
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/admin/dashboard');
      setDashboardData(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCharts = async () => {
    try {
      const data = await api.get('/api/admin/charts');
      setChartsData(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch charts data');
    }
  };

  // User Management
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/admin/users');
      setUsers(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await api.get(`/api/admin/users/${id}`);
      setSelectedUser(user);
      return user;
    } catch (error: any) {
      setError(error.message || 'Failed to fetch user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/admin/update-plan', { userId, plan });
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, plan } : user
        )
      );
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, plan } : null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update user plan');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(user => user._id !== id));
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Settings
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/admin/settings');
      setSettings(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSettings = await api.put('/api/admin/settings', newSettings);
      setSettings(updatedSettings);
    } catch (error: any) {
      setError(error.message || 'Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Notifications
  const broadcastNotification = async (title: string, message: string, type: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/notifications/broadcast', { title, message, type });
    } catch (error: any) {
      setError(error.message || 'Failed to broadcast notification');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{
      dashboardData,
      chartsData,
      fetchDashboard,
      fetchCharts,
      users,
      selectedUser,
      fetchUsers,
      fetchUserById,
      updateUserPlan,
      deleteUser,
      settings,
      fetchSettings,
      updateSettings,
      broadcastNotification,
      loading,
      error,
      clearError
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { notificationsService } from '../services/api.service';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'admin' | 'announcement' | 'alert' | 'update';
  read: boolean;
  createdAt: string;
  priority?: string;
  targetAudience?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const [notificationsData, unreadData] = await Promise.all([
        notificationsService.getAll(),
        notificationsService.getUnreadCount()
      ]);
      
      console.log('Notifications data:', notificationsData);
      console.log('Unread data:', unreadData);
      
      // Handle different response formats
      let notifList = [];
      if (Array.isArray(notificationsData)) {
        notifList = notificationsData;
      } else if (notificationsData?.notifications) {
        notifList = notificationsData.notifications;
      } else if (notificationsData?.data) {
        notifList = notificationsData.data;
      }
      
      setNotifications(notifList);
      setUnreadCount(unreadData?.count || 0);
    } catch (error: any) {
      console.error('Fetch notifications error:', error);
      setError(error.message || 'Failed to fetch notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markOneRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      setError(error.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      setError(error.message || 'Failed to mark all notifications as read');
    }
  };

  const clearError = () => setError(null);

  // Auto-fetch notifications on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchNotifications();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      clearError
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
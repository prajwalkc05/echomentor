import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Clock } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications]);

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      alert: '🚨',
      announcement: '📢',
      update: '🆕',
      info: 'ℹ️',
      admin: '🔔'
    };
    return icons[type] || '🔔';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
        <Bell size={18} className="text-gray-400 hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              <p className="text-gray-500 text-xs">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-purple-400 hover:text-purple-300" title="Mark all as read">
                  <CheckCheck size={16} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-500 text-sm">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Bell size={32} className="text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-600 text-xs">Updates will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification._id, notification.read)}
                    className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${!notification.read ? 'bg-purple-600/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg shrink-0">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0 mt-1"></div>}
                        </div>
                        <p className={`text-xs mt-1 line-clamp-2 ${notification.read ? 'text-gray-500' : 'text-gray-400'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock size={10} />
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            notification.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                            notification.type === 'announcement' ? 'bg-green-500/20 text-green-400' :
                            notification.type === 'update' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 border-t border-white/5 text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">View all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

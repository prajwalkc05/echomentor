import { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { NotificationProvider } from './NotificationContext';
import { AppDataProvider } from './AppDataContext';
import { AdminProvider } from './AdminContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UserProvider>
      <NotificationProvider>
        <AppDataProvider>
          <AdminProvider>
            {children}
          </AdminProvider>
        </AppDataProvider>
      </NotificationProvider>
    </UserProvider>
  );
}

// Export all hooks for convenience
export { useUser } from './UserContext';
export { useNotifications } from './NotificationContext';
export { useAppData } from './AppDataContext';
export { useAdmin } from './AdminContext';

// Export all types for convenience
export type { UserProfile } from './UserContext';
export type { Notification } from './NotificationContext';
export type { 
  Resume, 
  StudyPlan, 
  MoodEntry, 
  Opportunity, 
  ChatMessage 
} from './AppDataContext';
export type { 
  AdminUser, 
  AdminDashboardData, 
  AdminSettings 
} from './AdminContext';
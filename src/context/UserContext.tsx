import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services/api.service';
import { userService } from '../services/api.service';
import { signInWithGoogle } from '../utils/firebase';
import { storage } from '../utils/storage';

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  role: string;
  avatar: string;
  phone: string;
  location: string;
  notifications: { email: boolean; push: boolean; reminders: boolean };
  darkMode: boolean;
  isGoogleUser?: boolean;
  _id?: string;
  subscriptionPlan?: string;
  subscriptionData?: { startDate?: string; endDate?: string; paymentId?: string };
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  bio: '',
  role: 'Student',
  avatar: 'U',
  phone: '',
  location: '',
  notifications: { email: true, push: true, reminders: true },
  darkMode: true,
};

interface UserContextType {
  user: UserProfile;
  updateUser: (partial: Partial<UserProfile>) => void;
  saveProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoggedIn: boolean;
  loginWithGoogle: () => Promise<{ isNewUser: boolean }>;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultProfile);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await userService.getProfile();
          const avatar = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
          setUser({ ...defaultProfile, ...userData, avatar, isGoogleUser: !!userData.isGoogleUser });
          setIsLoggedIn(true);
        } catch (error) {
          localStorage.removeItem('authToken');
        }
      }
    };
    checkAuth();
  }, []);

  const updateUser = (partial: Partial<UserProfile>) =>
    setUser(prev => ({ ...prev, ...partial }));

  const saveProfile = async (data: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token');
      const updatedUser = await userService.updateProfile(data);
      const avatar = updatedUser.name ? updatedUser.name.charAt(0).toUpperCase() : user.avatar;
      setUser(prev => ({ ...prev, ...updatedUser, avatar }));
      setSuccessMessage('Profile updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getProfile();
      const avatar = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
      setUser({ ...defaultProfile, ...userData, avatar });
    } catch (error: any) {
      setError(error.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccessMessage(null);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { name, email } = await signInWithGoogle();
      const response = await authService.googleLogin(email, name);
      if (response.token) localStorage.setItem('authToken', response.token);
      const userData = response.user || { name, email };
      const avatar = (userData.name || name || email).charAt(0).toUpperCase();
      setUser({ ...defaultProfile, ...userData, name: userData.name || name, email: userData.email || email, avatar, isGoogleUser: true });
      setIsLoggedIn(true);
      setSuccessMessage('Signed in with Google successfully!');
      // isNewUser from backend — true if just created, false if existing user
      return { isNewUser: response.isNewUser ?? !storage.get('echomentorOnboarding') };
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    if (!password) {
      throw new Error('Password is required');
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await authService.login(email, password);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      const avatar = response.user.name ? response.user.name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase();
      setUser({ ...defaultProfile, ...response.user, avatar });
      setIsLoggedIn(true);
      setSuccessMessage('Login successful! Welcome back.');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await authService.signup(name, email, password);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      const avatar = name.charAt(0).toUpperCase();
      setUser({ ...defaultProfile, ...response.user, name, email, avatar });
      setIsLoggedIn(true);
      setSuccessMessage('Account created successfully! Welcome to EchoMentor.');
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Get current user ID before clearing token
    const currentUserId = (() => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return 'guest';
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload._id || payload.sub || 'guest';
      } catch {
        return 'guest';
      }
    })();
    
    // Clear auth token
    localStorage.removeItem('authToken');
    
    // Clear user-specific data
    if (currentUserId !== 'guest') {
      storage.clearUser(currentUserId);
    }
    
    setUser(defaultProfile);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      saveProfile, 
      refreshProfile, 
      isLoggedIn, 
      loginWithGoogle,
      login, 
      logout, 
      signup, 
      loading, 
      error, 
      successMessage,
      clearError,
      clearSuccess
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

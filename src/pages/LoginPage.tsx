import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Sparkles, BookOpen, Trophy, Users, ArrowLeft } from 'lucide-react';
import { Page } from '../types';
import { useUser } from '../context/UserContext';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
  onAdminLogin?: () => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, loginWithGoogle, loading } = useUser();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    try {
      await login(email.trim(), password);
      const adminEmail = 'admin@echomentor.com';
      if (email.trim() === adminEmail) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';
        const adminResponse = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          localStorage.setItem('adminToken', adminData.token);
          localStorage.setItem('adminUser', JSON.stringify(adminData.admin));
          onNavigate('admin');
          return;
        }
      }
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { isNewUser } = await loginWithGoogle();
      setTimeout(() => onNavigate(isNewUser ? 'onboarding' : 'dashboard'), 100);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Full Image */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden">
        <img
          src="/images/signupleft.png"
          alt="EchoMentor"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-linear-to-br from-gray-50 to-purple-50 flex items-center justify-center p-8 relative">
        <button
          onClick={() => onNavigate('landing')}
          className="absolute top-8 left-8 p-2 hover:bg-white rounded-lg transition-colors group"
          title="Back to home"
        >
          <ArrowLeft size={20} className="text-gray-600 group-hover:text-purple-600" />
        </button>
        <div className="w-full max-w-md">
          {/* Logo & Welcome */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <button onClick={() => onNavigate('signup')} className="text-purple-600 hover:underline font-semibold">Sign up</button>
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleLogin} disabled={googleLoading || loading} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl py-3 transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {googleLoading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />}
              <span className="text-sm font-medium text-gray-700">{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-linear-to-br from-gray-50 to-purple-50 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <span className="text-purple-600 text-sm cursor-pointer hover:underline">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleLogin} disabled={loading} className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen size={18} className="text-purple-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Smart Learning</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Trophy size={18} className="text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Track Progress</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users size={18} className="text-green-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

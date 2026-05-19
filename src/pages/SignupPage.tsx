import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { Page } from '../types';
import { useUser } from '../context/UserContext';

interface SignupPageProps {
  onNavigate: (page: Page) => void;
}

export default function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup, loginWithGoogle, loading } = useUser();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) { setError('Please fill in all fields.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please agree to the terms.'); return; }
    setError('');
    try {
      await signup(name.trim(), email.trim(), password);
      setTimeout(() => onNavigate('onboarding'), 100);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
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
      <div className="flex-1 bg-linear-to-br from-gray-50 to-purple-50 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Logo & Welcome */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join EchoMentor</h2>
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="text-purple-600 hover:underline font-semibold">Log in</button>
            </p>
          </div>

          {/* Social Signup */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleSignup} disabled={googleLoading || loading} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl py-3 transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {googleLoading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />}
              <span className="text-sm font-medium text-gray-700">{googleLoading ? 'Signing in...' : 'Sign up with Google'}</span>
            </button>

          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-linear-to-br from-gray-50 to-purple-50 text-gray-500">Or sign up with email</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Enter your full name" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email address" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Create a strong password" className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={confirm} onChange={e => setConfirm(e.target.value)} type={showConfirm ? 'text' : 'password'} placeholder="Confirm your password" className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 accent-purple-600 rounded mt-0.5" id="agree" />
              <label htmlFor="agree" className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-purple-600 hover:underline font-medium">Terms & Conditions</a> and <a href="#" className="text-purple-600 hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-purple-100 hover:border-purple-300 transition-all">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap size={18} className="text-purple-600" />
              </div>
              <p className="text-xs text-gray-700 font-medium">AI Powered</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-blue-100 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield size={18} className="text-blue-600" />
              </div>
              <p className="text-xs text-gray-700 font-medium">Secure</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-green-100 hover:border-green-300 transition-all">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Rocket size={18} className="text-green-600" />
              </div>
              <p className="text-xs text-gray-700 font-medium">Fast Setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

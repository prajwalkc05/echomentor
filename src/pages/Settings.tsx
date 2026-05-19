import { useState } from 'react';
import { Bell, Lock, Shield, ChevronRight, Check, X } from 'lucide-react';
import { useUser } from '../context';
import { Page } from '../types';

interface SettingsProps {
  onNavigate: (page: Page) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const { user, updateUser, saveProfile, logout, loading, error, successMessage } = useUser();
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState({ name: user.name, email: user.email, bio: user.bio, role: user.role, phone: user.phone, location: user.location });
  const [saved, setSaved] = useState(false);

  const saveProfileChanges = async () => {
    try {
      await saveProfile(draft);
      setEditingProfile(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const cancelEdit = () => {
    setDraft({ name: user.name, email: user.email, bio: user.bio, role: user.role, phone: user.phone, location: user.location });
    setEditingProfile(false);
  };

  const toggleNotif = (key: keyof typeof user.notifications) => {
    updateUser({ notifications: { ...user.notifications, [key]: !user.notifications[key] } });
  };

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-white text-xl font-bold">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your account and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          {(saved || successMessage) && <span className="text-green-400 text-sm flex items-center gap-1"><Check size={14} /> {successMessage || 'Saved'}</span>}
          {error && <span className="text-red-400 text-sm">{error}</span>}
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{user.avatar}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-4">

          {/* Profile Card */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{user.name || 'Your Name'}</h3>
                <p className="text-gray-400 text-sm">{user.email || 'your@email.com'}</p>
                <span className="text-purple-400 text-xs bg-purple-600/20 px-2 py-0.5 rounded-full">{user.role}</span>
              </div>
              <button onClick={() => { setDraft({ name: user.name, email: user.email, bio: user.bio, role: user.role, phone: user.phone, location: user.location }); setEditingProfile(!editingProfile); }} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl transition-colors">
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editingProfile && (
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Full Name</label>
                    <input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Role</label>
                    <select value={draft.role} onChange={e => setDraft(p => ({ ...p, role: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm focus:outline-none">
                      <option>Student</option>
                      <option>Developer</option>
                      <option>Designer</option>
                      <option>Researcher</option>
                      <option>Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Email</label>
                    <input value={draft.email} onChange={e => setDraft(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Phone</label>
                    <input value={draft.phone} onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-500 text-xs mb-1 block">Location</label>
                    <input value={draft.location} onChange={e => setDraft(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-500 text-xs mb-1 block">Bio</label>
                    <textarea value={draft.bio} onChange={e => setDraft(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProfileChanges} disabled={loading} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    {loading ? (
                      <><span className="animate-spin">⏳</span> Saving...</>
                    ) : (
                      <><Check size={14} /> Save Changes</>
                    )}
                  </button>
                  <button onClick={cancelEdit} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 text-sm px-5 py-2 rounded-xl transition-colors">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            )}

            {!editingProfile && (user.bio || user.phone || user.location) && (
              <div className="border-t border-white/5 pt-3 space-y-1">
                {user.bio && <p className="text-gray-400 text-sm">{user.bio}</p>}
                <div className="flex gap-4 text-gray-500 text-xs">
                  {user.phone && <span>📞 {user.phone}</span>}
                  {user.location && <span>📍 {user.location}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
              <Bell size={18} className="text-blue-400" />
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
            </div>
            {[
              { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push' as const, label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'reminders' as const, label: 'Study Reminders', desc: 'Daily study reminders' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-gray-300 text-sm">{item.label}</p>
                  <p className="text-gray-600 text-xs">{item.desc}</p>
                </div>
                <button onClick={() => toggleNotif(item.key)} className={`w-11 h-6 rounded-full relative transition-colors ${user.notifications[item.key] ? 'bg-purple-600' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${user.notifications[item.key] ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Security — needs backend */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
              <Lock size={18} className="text-green-400" />
              <h3 className="text-white font-semibold text-sm">Security</h3>
            </div>
            {['Change Password', 'Two-Factor Authentication', 'Active Sessions'].map((item, j) => (
              <div key={j} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0">
                <span className="text-gray-300 text-sm">{item}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs">Requires backend</span>
                  <ChevronRight size={16} className="text-gray-700" />
                </div>
              </div>
            ))}
          </div>

          {/* Privacy — needs backend */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
              <Shield size={18} className="text-orange-400" />
              <h3 className="text-white font-semibold text-sm">Privacy</h3>
            </div>
            {['Data & Privacy', 'Cookie Settings', 'Delete Account'].map((item, j) => (
              <div key={j} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0">
                <span className="text-gray-300 text-sm">{item}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs">Requires backend</span>
                  <ChevronRight size={16} className="text-gray-700" />
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold py-3 rounded-2xl transition-colors text-sm">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

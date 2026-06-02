import { useState, useEffect } from 'react';
import { Bell, Lock, Shield, Check, X, Loader, Eye, EyeOff, Monitor, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useUser } from '../context';
import { Page } from '../types';
import { userService } from '../services/api.service';

interface SettingsProps {
  onNavigate: (page: Page) => void;
}

interface Session {
  id: string;
  device: string;
  ip: string;
  current: boolean;
  createdAt: string;
}

type SectionKey = 'notifications' | 'security' | 'privacy';

export default function Settings({ onNavigate }: SettingsProps) {
  const { user, updateUser, saveProfile, logout, loading, error, successMessage } = useUser();

  // Profile
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState({ name: user.name, email: user.email, bio: user.bio, role: user.role, phone: user.phone, location: user.location });
  const [profileSaved, setProfileSaved] = useState(false);

  // Section expand/collapse
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({ notifications: true, security: false, privacy: false });

  // Feedback
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Notifications
  const [notifs, setNotifs] = useState({ email: user.notifications.email, push: user.notifications.push, reminders: user.notifications.reminders });

  // Security
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdData, setPwdData] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  // Privacy
  const [privacy, setPrivacy] = useState({ dataCollection: true, analytics: true });
  const [cookies, setCookies] = useState({ functional: true, analytics: true, marketing: false });
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const feedback = (success: string | null, err?: string | null) => {
    setActionSuccess(success);
    setActionError(err || null);
    if (success) setTimeout(() => setActionSuccess(null), 3000);
  };

  const toggle = (section: SectionKey) =>
    setExpanded(p => ({ ...p, [section]: !p[section] }));

  // Profile
  const saveProfileChanges = async () => {
    try {
      await saveProfile(draft);
      setEditingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch { }
  };

  // Notifications
  const toggleNotif = async (key: 'email' | 'push' | 'reminders') => {
    const newNotifs = { ...notifs, [key]: !notifs[key] };
    setNotifs(newNotifs);
    updateUser({ notifications: newNotifs });
    try {
      setBusy(`notif_${key}`);
      await userService.updateNotificationPreferences(newNotifs);
      feedback('Notification preference saved!');
    } catch (err: any) {
      // revert on fail
      setNotifs(notifs);
      updateUser({ notifications: notifs });
      feedback(null, err.message || 'Failed to update');
    } finally {
      setBusy(null);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!pwdData.current || !pwdData.next || !pwdData.confirm) return feedback(null, 'All fields are required');
    if (pwdData.next !== pwdData.confirm) return feedback(null, 'New passwords do not match');
    if (pwdData.next.length < 6) return feedback(null, 'Password must be at least 6 characters');
    try {
      setBusy('password');
      setActionError(null);
      await userService.changePassword(pwdData.current, pwdData.next);
      setPwdData({ current: '', next: '', confirm: '' });
      setShowChangePwd(false);
      feedback('Password changed successfully!');
    } catch (err: any) {
      feedback(null, err.message || 'Failed to change password');
    } finally {
      setBusy(null);
    }
  };

  // 2FA
  const handleToggle2FA = async () => {
    try {
      setBusy('2fa');
      setActionError(null);
      await userService.toggleTwoFactor();
      setTwoFA(p => !p);
      feedback('Two-factor authentication updated!');
    } catch (err: any) {
      feedback(null, err.message || 'Failed to update 2FA');
    } finally {
      setBusy(null);
    }
  };

  // Sessions
  const loadSessions = async () => {
    if (sessionsLoaded) return;
    try {
      setBusy('sessions');
      const data = await userService.getSessions();
      setSessions(data.sessions || []);
      setSessionsLoaded(true);
    } catch {
      setSessions([]);
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (expanded.security) loadSessions();
  }, [expanded.security]);

  // Privacy
  const handlePrivacySave = async () => {
    try {
      setBusy('privacy');
      setActionError(null);
      await userService.updatePrivacy(privacy);
      feedback('Privacy settings saved!');
    } catch (err: any) {
      feedback(null, err.message || 'Failed to save');
    } finally {
      setBusy(null);
    }
  };

  const handleCookiesSave = async () => {
    try {
      setBusy('cookies');
      setActionError(null);
      await userService.updateCookies(cookies);
      feedback('Cookie settings saved!');
    } catch (err: any) {
      feedback(null, err.message || 'Failed to save');
    } finally {
      setBusy(null);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const isGoogle = !!user.isGoogleUser;
    if (!isGoogle && !deletePassword) return feedback(null, 'Enter your password to confirm');
    if (!window.confirm('This will permanently delete your account. Continue?')) return;
    try {
      setBusy('delete');
      setActionError(null);
      await userService.deleteAccount(isGoogle ? '' : deletePassword);
      logout();
      onNavigate('landing');
    } catch (err: any) {
      feedback(null, err.message || 'Incorrect password');
    } finally {
      setBusy(null);
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50';
  const Toggle = ({ on, onClick, id }: { on: boolean; onClick: () => void; id: string }) => (
    <button onClick={onClick} disabled={busy === id} className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${on ? 'bg-purple-600' : 'bg-white/10'} disabled:opacity-50`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${on ? 'right-1' : 'left-1'}`} />
    </button>
  );

  const SectionHeader = ({ icon, title, color, sectionKey }: { icon: React.ReactNode; title: string; color: string; sectionKey: SectionKey }) => (
    <button onClick={() => toggle(sectionKey)} className="w-full flex items-center justify-between px-5 py-3 border-b border-white/5 hover:bg-white/2 transition-colors">
      <div className="flex items-center gap-3">
        <span className={color}>{icon}</span>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      {expanded[sectionKey] ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-white text-xl font-bold">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your account and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          {(profileSaved || successMessage || actionSuccess) && (
            <span className="text-green-400 text-sm flex items-center gap-1"><Check size={14} /> {actionSuccess || successMessage || 'Saved'}</span>
          )}
          {(error || actionError) && <span className="text-red-400 text-sm">{actionError || error}</span>}
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
              <button
                onClick={() => { setDraft({ name: user.name, email: user.email, bio: user.bio, role: user.role, phone: user.phone, location: user.location }); setEditingProfile(p => !p); }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
              >
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editingProfile && (
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Full Name</label>
                    <input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Role</label>
                    <select value={draft.role} onChange={e => setDraft(p => ({ ...p, role: e.target.value }))} className={inputCls}>
                      <option>Student</option><option>Developer</option><option>Designer</option><option>Researcher</option><option>Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Email</label>
                    <input value={draft.email} onChange={e => setDraft(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Phone</label>
                    <input value={draft.phone} onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-500 text-xs mb-1 block">Location</label>
                    <input value={draft.location} onChange={e => setDraft(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-500 text-xs mb-1 block">Bio</label>
                    <textarea value={draft.bio} onChange={e => setDraft(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} className={`${inputCls} resize-none`} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProfileChanges} disabled={loading} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    {loading ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Check size={14} /> Save Changes</>}
                  </button>
                  <button onClick={() => setEditingProfile(false)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 text-sm px-5 py-2 rounded-xl transition-colors">
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
            <SectionHeader icon={<Bell size={18} />} title="Notifications" color="text-blue-400" sectionKey="notifications" />
            {expanded.notifications && (
              <>
                {([
                  { key: 'email' as const, label: 'Email Notifications', desc: 'Receive course updates and tips via email' },
                  { key: 'push' as const, label: 'Push Notifications', desc: 'Browser push notifications for activity' },
                  { key: 'reminders' as const, label: 'Study Reminders', desc: 'Daily reminders to keep your streak going' },
                ] as const).map(item => (
                  <div key={item.key} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-gray-300 text-sm">{item.label}</p>
                      <p className="text-gray-600 text-xs">{item.desc}</p>
                    </div>
                    <Toggle on={notifs[item.key]} onClick={() => toggleNotif(item.key)} id={`notif_${item.key}`} />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Security */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <SectionHeader icon={<Lock size={18} />} title="Security" color="text-green-400" sectionKey="security" />
            {expanded.security && (
              <div className="divide-y divide-white/5">

                {/* Change Password — hidden for Google users */}
                {!user.isGoogleUser && (
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-300 text-sm">Change Password</p>
                      <p className="text-gray-600 text-xs">Update your login password</p>
                    </div>
                    <button onClick={() => setShowChangePwd(p => !p)} className="text-purple-400 text-xs border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors">
                      {showChangePwd ? 'Cancel' : 'Change'}
                    </button>
                  </div>
                  {showChangePwd && (
                    <div className="space-y-3">
                      {(['current', 'next', 'confirm'] as const).map(f => (
                        <div key={f} className="relative">
                          <input
                            type={showPwd[f] ? 'text' : 'password'}
                            value={pwdData[f]}
                            onChange={e => setPwdData(p => ({ ...p, [f]: e.target.value }))}
                            placeholder={f === 'current' ? 'Current password' : f === 'next' ? 'New password' : 'Confirm new password'}
                            className={`${inputCls} pr-10`}
                          />
                          <button onClick={() => setShowPwd(p => ({ ...p, [f]: !p[f] }))} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300">
                            {showPwd[f] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      ))}
                      <button onClick={handleChangePassword} disabled={busy === 'password'} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        {busy === 'password' ? <><Loader size={13} className="animate-spin" /> Updating...</> : <><Check size={13} /> Update Password</>}
                      </button>
                    </div>
                  )}
                </div>
                )}

                {/* Two-Factor Auth */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-gray-300 text-sm">Two-Factor Authentication</p>
                    <p className="text-gray-600 text-xs">{twoFA ? 'Enabled — extra security layer is active' : 'Add an extra layer of security to your account'}</p>
                  </div>
                  <Toggle on={twoFA} onClick={handleToggle2FA} id="2fa" />
                </div>

                {/* Active Sessions */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-300 text-sm">Active Sessions</p>
                      <p className="text-gray-600 text-xs">Devices currently logged in to your account</p>
                    </div>
                    {busy === 'sessions' && <Loader size={14} className="text-gray-500 animate-spin" />}
                  </div>
                  {sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessions.map(s => (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                          <Monitor size={16} className="text-gray-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-300 text-xs truncate">{s.device}</p>
                            <p className="text-gray-600 text-xs">{s.ip} {s.current && <span className="text-green-400 ml-1">• Current</span>}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-xs">No session data available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Privacy */}
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
            <SectionHeader icon={<Shield size={18} />} title="Privacy" color="text-orange-400" sectionKey="privacy" />
            {expanded.privacy && (
              <div className="divide-y divide-white/5">

                {/* Data & Privacy */}
                <div className="px-5 py-4">
                  <p className="text-gray-300 text-sm mb-1">Data & Privacy</p>
                  <p className="text-gray-600 text-xs mb-3">Control how your data is used</p>
                  <div className="space-y-3">
                    {([
                      { key: 'dataCollection' as const, label: 'Data Collection', desc: 'Allow us to improve your experience' },
                      { key: 'analytics' as const, label: 'Usage Analytics', desc: 'Help improve EchoMentor with anonymous data' },
                    ] as const).map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm">{item.label}</p>
                          <p className="text-gray-600 text-xs">{item.desc}</p>
                        </div>
                        <Toggle on={privacy[item.key]} onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))} id={`privacy_${item.key}`} />
                      </div>
                    ))}
                    <button onClick={handlePrivacySave} disabled={busy === 'privacy'} className="flex items-center gap-2 bg-orange-600/80 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
                      {busy === 'privacy' ? <><Loader size={12} className="animate-spin" /> Saving...</> : <><Check size={12} /> Save Privacy Settings</>}
                    </button>
                  </div>
                </div>

                {/* Cookie Settings */}
                <div className="px-5 py-4">
                  <p className="text-gray-300 text-sm mb-1">Cookie Settings</p>
                  <p className="text-gray-600 text-xs mb-3">Manage your cookie preferences</p>
                  <div className="space-y-3">
                    {([
                      { key: 'functional' as const, label: 'Functional Cookies', desc: 'Required for the site to work', locked: true },
                      { key: 'analytics' as const, label: 'Analytics Cookies', desc: 'Help us understand site usage', locked: false },
                      { key: 'marketing' as const, label: 'Marketing Cookies', desc: 'Used for personalized ads', locked: false },
                    ] as const).map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm">{item.label}</p>
                          <p className="text-gray-600 text-xs">{item.desc}</p>
                        </div>
                        <Toggle on={cookies[item.key]} onClick={() => !item.locked && setCookies(p => ({ ...p, [item.key]: !p[item.key] }))} id={`cookie_${item.key}`} />
                      </div>
                    ))}
                    <button onClick={handleCookiesSave} disabled={busy === 'cookies'} className="flex items-center gap-2 bg-orange-600/80 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
                      {busy === 'cookies' ? <><Loader size={12} className="animate-spin" /> Saving...</> : <><Check size={12} /> Save Cookie Preferences</>}
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-red-400 text-sm">Delete Account</p>
                      <p className="text-gray-600 text-xs">Permanently delete your account and all data</p>
                    </div>
                    <button onClick={() => setShowDeleteAccount(p => !p)} className="flex items-center gap-1.5 text-red-400 text-xs border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                      <Trash2 size={12} /> {showDeleteAccount ? 'Cancel' : 'Delete'}
                    </button>
                  </div>
                  {showDeleteAccount && (
                    <div className="space-y-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <p className="text-red-400 text-xs">⚠️ This action is irreversible. All your data will be permanently deleted.</p>
                      {user.isGoogleUser ? (
                        <p className="text-gray-400 text-xs bg-white/5 rounded-lg px-3 py-2">Signed in with Google — no password required to delete your account.</p>
                      ) : (
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          placeholder="Enter your password to confirm"
                          className={`${inputCls} border-red-500/30 focus:border-red-500/60`}
                        />
                      )}
                      <button onClick={handleDeleteAccount} disabled={busy === 'delete'} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        {busy === 'delete' ? <><Loader size={13} className="animate-spin" /> Deleting...</> : <><Trash2 size={13} /> Permanently Delete Account</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button onClick={() => { logout(); onNavigate('landing'); }} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold py-3 rounded-2xl transition-colors text-sm">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

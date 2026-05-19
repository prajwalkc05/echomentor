import { useState, useEffect } from 'react';
import { Bell, TrendingUp, Flame, Smile, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { useAppData } from '../context';
import { useUser } from '../context';
import { storage } from '../utils/storage';

function InsightIcon({ name }: { name: string }) {
  if (name === 'mood') return <Smile size={16} className="text-blue-400" />;
  if (name === 'avg') return <TrendingUp size={16} className="text-green-400" />;
  return <Flame size={16} className="text-orange-400" />;
}

const moods = [
  { label: 'Awesome', emoji: '😄', value: 5, color: 'text-blue-400' },
  { label: 'Good', emoji: '🙂', value: 4, color: 'text-green-400' },
  { label: 'Neutral', emoji: '😐', value: 3, color: 'text-gray-400' },
  { label: 'Low', emoji: '😕', value: 2, color: 'text-orange-400' },
  { label: 'Bad', emoji: '😢', value: 1, color: 'text-red-400' },
];

interface MoodEntry {
  id: number;
  date: string;
  mood: string;
  emoji: string;
  note: string;
  time: string;
  color: string;
  value: number;
}

export default function MoodTracker() {
  const { trackMood, fetchMoodHistory, moodHistory, loading } = useAppData();
  const { isLoggedIn } = useUser();
  const [selectedMood, setSelectedMood] = useState(1);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [suggestion, setSuggestion] = useState<string>(() => storage.get('moodSuggestion') || '');
  const [savedEntry, setSavedEntry] = useState<MoodEntry | null>(() => storage.getJSON<MoodEntry>('moodSavedEntry'));
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      const savedHistory = storage.getJSON<MoodEntry[]>('moodTrackerHistory');
      if (savedHistory) {
        try { setHistory(savedHistory); } catch {}
      }
      fetchMoodHistory();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (history.length > 0) {
      storage.setJSON('moodTrackerHistory', history);
    } else {
      storage.remove('moodTrackerHistory');
    }
  }, [history]);

  useEffect(() => {
    if (moodHistory && moodHistory.length > 0 && history.length === 0) {
      const converted = moodHistory.map((entry: any, index: number) => {
        const moodData = moods.find(m => m.label.toLowerCase() === entry.mood?.toLowerCase()) || moods[2];
        return {
          id: Date.now() + index,
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          mood: moodData.label,
          emoji: moodData.emoji,
          note: entry.note || 'No note added.',
          time: new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: moodData.color,
          value: moodData.value,
        };
      });
      setHistory(converted);
    }
  }, [moodHistory, history.length]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const saveMood = async () => {
    if (!isLoggedIn) {
      showToast('error', 'Please log in to track your mood');
      return;
    }

    const m = moods[selectedMood];
    setSaving(true);
    setSuggestion('');
    setSavedEntry(null);
    storage.remove('moodSuggestion');
    storage.remove('moodSavedEntry');

    try {
      const message = note.trim() ? `${m.label}. ${note.trim()}` : m.label;
      const response = await trackMood(message, note.trim() || undefined);

      if (response?.suggestion) {
        setSuggestion(response.suggestion);
        storage.set('moodSuggestion', response.suggestion);
      }

      const now = new Date();
      const entry: MoodEntry = {
        id: Date.now(),
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        mood: m.label,
        emoji: m.emoji,
        note: note.trim() || 'No note added.',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: m.color,
        value: m.value,
      };

      const updatedHistory = [entry, ...history];
      setHistory(updatedHistory);
      storage.setJSON('moodTrackerHistory', updatedHistory);
      setSavedEntry(entry);
      storage.setJSON('moodSavedEntry', entry);
      setNote('');
      showToast('success', 'Mood saved successfully!');
    } catch (error: any) {
      const msg = error.message?.includes('401') || error.message?.includes('Invalid token')
        ? 'Authentication failed. Please log in again.'
        : error.message || 'Failed to save mood. Please try again.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const avgMood = history.length > 0
    ? (history.reduce((sum, h) => sum + h.value, 0) / history.length).toFixed(1)
    : '—';

  const mostCommon = history.length > 0
    ? (() => {
        const counts: Record<string, number> = {};
        history.forEach(h => { counts[h.mood] = (counts[h.mood] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      })()
    : '—';

  const streak = history.length > 0 ? [...new Set(history.map(h => h.date))].length : 0;
  const barHeights = history.slice(0, 7).reverse().map(h => h.value);
  const barColors = ['bg-purple-500', 'bg-purple-400', 'bg-blue-400', 'bg-purple-600', 'bg-pink-500', 'bg-orange-400', 'bg-yellow-400'];

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-white text-lg font-bold flex items-center gap-2">
            <Smile size={22} className="text-purple-400" /> Mood Tracker
          </h1>
          <p className="text-gray-500 text-sm">Track your emotions. Understand yourself. Grow every day.</p>
        </div>
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-1.5">
              <Flame size={14} className="text-orange-400" />
              <span className="text-orange-400 font-bold text-sm">{streak}</span>
              <div>
                <p className="text-white text-xs font-medium">Day Streak</p>
                <p className="text-gray-500 text-xs">Keep it up!</p>
              </div>
            </div>
          )}
          <Bell size={18} className="text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-red-600/20 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-500 text-sm mb-6">Please log in to track your mood and view your history.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_280px] gap-6">
            <div className="space-y-5">
              {/* Mood Input */}
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-1">How are you feeling today?</h3>
                <p className="text-gray-500 text-sm mb-4">Your mood matters. Let's track it.</p>
                <div className="flex items-center gap-3 mb-4">
                  {moods.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedMood(i)}
                      className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                        selectedMood === i
                          ? 'border-purple-500 bg-purple-600/20 text-purple-300'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="What's on your mind today? (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none h-20"
                />
                <div className="flex items-center justify-end mt-3">
                  <button
                    onClick={saveMood}
                    disabled={saving || loading}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Mood'}
                  </button>
                </div>

                {/* AI Suggestion */}
                {suggestion && (
                  <div className="mt-4 p-4 bg-linear-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
                        <Sparkles size={15} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-purple-300 text-sm font-semibold mb-1 flex items-center gap-1">
                          AI Suggestion
                          {savedEntry && <span className="text-purple-400/60 text-xs font-normal">· based on your {savedEntry.emoji} {savedEntry.mood} mood</span>}
                        </h4>
                        <p className="text-gray-200 text-sm leading-relaxed">{suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mood Insights */}
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Mood Insights</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: 'mood', title: 'Most Common', val: mostCommon },
                    { icon: 'avg', title: 'Avg Mood', val: avgMood },
                    { icon: 'streak', title: 'Days Tracked', val: streak.toString() },
                  ].map((ins, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3">
                      <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <InsightIcon name={ins.icon} />
                      </div>
                      <p className="text-gray-500 text-xs mt-2">{ins.title}</p>
                      <p className="text-white text-sm font-bold">{ins.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Journal */}
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-3">Recent Journal Entries</h3>
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No entries yet. Save your first mood above!</p>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 5).map(entry => (
                      <div key={entry.id} className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                        <div className="bg-purple-600 rounded-lg px-2 py-1 text-center min-w-10">
                          <p className="text-purple-200 text-xs">{entry.date.split(' ')[0]}</p>
                          <p className="text-white text-lg font-bold">{entry.date.split(' ')[1]?.replace(',', '')}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300 text-sm">{entry.note}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl">{entry.emoji}</span>
                          <p className={`text-xs mt-1 ${entry.color}`}>{entry.mood}</p>
                          <p className="text-gray-600 text-xs">{entry.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-4">
              {/* Mood Overview */}
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Mood Overview</h3>
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e3a" strokeWidth="4"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#moodGrad)" strokeWidth="4"
                        strokeDasharray={`${avgMood !== '—' ? Math.round((parseFloat(avgMood) / 5) * 100) : 0} 100`}
                        strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="moodGrad" x1="1" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed"/>
                          <stop offset="100%" stopColor="#ec4899"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-white text-lg font-bold">{avgMood}</p>
                      <p className="text-gray-500 text-xs">Avg Mood</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end gap-1 h-20">
                    {barHeights.length > 0 ? barHeights.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-full ${barColors[i % barColors.length]} rounded-t-sm`} style={{ height: `${(h / 5) * 100}%` }} />
                      </div>
                    )) : (
                      <p className="text-gray-600 text-xs w-full text-center self-center">No data yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mood History */}
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Mood History</h3>
                {history.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-4">No history yet.</p>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 6).map(h => (
                      <div key={h.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-xs">{h.date}</p>
                          <p className="text-gray-300 text-xs truncate">{h.note}</p>
                        </div>
                        <span className="text-xl">{h.emoji}</span>
                        <span className={`text-xs font-medium ${h.color}`}>{h.mood}</span>
                        <span className="text-gray-600 text-xs">{h.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mood Scale */}
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Mood Scale</h3>
                <div className="space-y-2">
                  {moods.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-lg">{m.emoji}</span>
                      <span className={`text-xs font-medium ${m.color}`}>{m.label}</span>
                      <span className="text-gray-600 text-xs ml-auto">{m.value}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

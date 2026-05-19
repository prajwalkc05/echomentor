import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Bell, Plus, Check, Trash2, Calendar, Sparkles, Send } from 'lucide-react';
import { useAppData } from '../context';
import { useUser } from '../context/UserContext';

interface Task {
  id: number;
  title: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  subject: string;
  done: boolean;
}

const subjects = ['All', 'DBMS', 'Web Dev', 'ML', 'Aptitude', 'Startup', 'Other'];
const priorities = { High: 'text-red-400 bg-red-400/10', Medium: 'text-yellow-400 bg-yellow-400/10', Low: 'text-green-400 bg-green-400/10' };

export default function StudyPlanner() {
  const { studyPlans, fetchStudyPlans, createStudyPlan } = useAppData();
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('All');
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newSubject, setNewSubject] = useState('Other');
  const [showAiPlanner, setShowAiPlanner] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStudyPlans();
      // Load tasks from localStorage
      const savedTasks = storage.get('studyPlannerTasks');
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (error) {
          console.error('Failed to load saved tasks:', error);
        }
      }
    }
  }, [user, fetchStudyPlans]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      storage.setJSON('studyPlannerTasks', tasks);
    }
  }, [tasks]);

  useEffect(() => {
    // Load existing study plans if any
    if (studyPlans.length > 0) {
      // Convert study plans to tasks format if needed
      console.log('Existing study plans:', studyPlans);
    }
  }, [studyPlans]);

  const generateAiPlan = async () => {
    if (!aiPrompt.trim()) return;
    if (!user) {
      setError('Please log in to create study plans');
      return;
    }

    setAiGenerating(true);
    setError(null);
    
    try {
      // Parse the prompt to extract subject and topics
      const prompt = aiPrompt.toLowerCase();
      let subject = 'General Study';
      let topics: string[] = [];
      let hoursPerDay = 2;

      // Extract subject and topics from prompt
      if (prompt.includes('javascript') || prompt.includes('js')) {
        subject = 'JavaScript';
        topics = ['Variables', 'Functions', 'Arrays', 'Objects', 'DOM Manipulation'];
      } else if (prompt.includes('python')) {
        subject = 'Python';
        topics = ['Syntax', 'Data Structures', 'Functions', 'Libraries', 'Projects'];
      } else if (prompt.includes('database') || prompt.includes('dbms') || prompt.includes('sql')) {
        subject = 'Database Management';
        topics = ['SQL Queries', 'Database Design', 'Normalization', 'Transactions', 'Indexing'];
      } else if (prompt.includes('machine learning') || prompt.includes('ml')) {
        subject = 'Machine Learning';
        topics = ['Algorithms', 'Data Processing', 'Model Training', 'Evaluation', 'Deployment'];
      } else if (prompt.includes('web') || prompt.includes('frontend') || prompt.includes('backend')) {
        subject = 'Web Development';
        topics = ['HTML/CSS', 'JavaScript', 'Frameworks', 'APIs', 'Deployment'];
      } else if (prompt.includes('exam') || prompt.includes('test')) {
        subject = 'Exam Preparation';
        topics = ['Review Notes', 'Practice Tests', 'Key Concepts', 'Problem Solving', 'Final Review'];
      } else {
        // Extract topics from the prompt
        const words = prompt.split(' ');
        topics = words.filter(word => word.length > 3).slice(0, 5);
        if (topics.length === 0) {
          topics = ['Study Session', 'Practice', 'Review', 'Assessment'];
        }
      }

      // Extract hours if mentioned
      const hourMatch = prompt.match(/(\d+)\s*hours?/);
      if (hourMatch) {
        hoursPerDay = parseInt(hourMatch[1]);
      }

      // Call backend API
      const result = await createStudyPlan({
        subject,
        topics,
        hoursPerDay
      });

      // Backend returns: {success: true, aiPlan: "..."} but createStudyPlan returns StudyPlan
      // Check if result has aiPlan property (from backend) or if it's a StudyPlan object
      if (result && (result as any).success && (result as any).aiPlan) {
        // Parse the AI plan and convert to tasks
        const aiPlan = (result as any).aiPlan;
        const planLines = aiPlan.split('\n').filter((line: string) => line.trim());
        const newTasks: Task[] = [];
        
        let taskId = Date.now();
        planLines.forEach((line: string, index: number) => {
          if (line.includes('Task') || line.includes('**') || line.includes('-')) {
            const cleanLine = line.replace(/\*\*/g, '').replace(/###/g, '').replace(/- /g, '').trim();
            if (cleanLine.length > 10) {
              const time = `${9 + Math.floor(index / 2)}:00 ${index % 2 === 0 ? 'AM' : 'PM'}`;
              newTasks.push({
                id: taskId++,
                title: cleanLine,
                time,
                priority: index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low',
                subject: subject.includes('JavaScript') ? 'Web Dev' : 
                        subject.includes('Python') ? 'Other' :
                        subject.includes('Database') ? 'DBMS' :
                        subject.includes('Machine Learning') ? 'ML' : 'Study',
                done: false
              });
            }
          }
        });

        if (newTasks.length > 0) {
          setTasks(prev => {
            const updatedTasks = [...prev, ...newTasks];
            storage.setJSON('studyPlannerTasks', updatedTasks);
            return updatedTasks;
          });
          alert(`AI Study Plan created successfully! 🎉\nAdded ${newTasks.length} tasks to your planner.`);
        } else {
          alert('Study plan created successfully! Check your study plans section.');
        }
      } else {
        // If it's a regular StudyPlan object, just show success message
        alert('Study plan created successfully! Check your study plans section.');
      }
      
      // Refresh study plans
      await fetchStudyPlans();
      
    } catch (error: any) {
      console.error('Failed to create study plan:', error);
      setError(error.message || 'Failed to create study plan. Please try again.');
    } finally {
      setAiGenerating(false);
      setShowAiPlanner(false);
      setAiPrompt('');
    }
  };

  const toggleDone = (id: number) => {
    setTasks(prev => {
      const updatedTasks = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
      storage.setJSON('studyPlannerTasks', updatedTasks);
      return updatedTasks;
    });
  };

  const deleteTask = (id: number) => {
    setTasks(prev => {
      const updatedTasks = prev.filter(t => t.id !== id);
      storage.setJSON('studyPlannerTasks', updatedTasks);
      return updatedTasks;
    });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now(),
      title: newTask.trim(),
      time: newTime || 'No time set',
      priority: newPriority,
      subject: newSubject,
      done: false,
    };
    setTasks(prev => {
      const updatedTasks = [...prev, task];
      storage.setJSON('studyPlannerTasks', updatedTasks);
      return updatedTasks;
    });
    setNewTask('');
    setNewTime('');
  };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.subject === filter);
  const doneCount = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const allSubjects = Array.from(new Set([...subjects, ...tasks.map(t => t.subject)]));
  const subjectCounts = allSubjects.slice(1).map(s => ({
    name: s,
    progress: tasks.filter(t => t.subject === s).length > 0
      ? Math.round((tasks.filter(t => t.subject === s && t.done).length / tasks.filter(t => t.subject === s).length) * 100)
      : 0,
    color: 'bg-purple-500',
  })).filter(s => tasks.some(t => t.subject === s.name));

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2"><Calendar size={22} className="text-purple-400" /> Study Planner</h1>
          <p className="text-gray-500 text-sm">Plan your study, track tasks and stay consistent.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAiPlanner(!showAiPlanner)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Sparkles size={16} /> AI Study Planner
          </button>
          <div className="relative">
            <Bell size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-[1fr_300px] gap-6">
          <div className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200 text-xs mt-2">Dismiss</button>
              </div>
            )}

            {/* AI Study Planner */}
            {showAiPlanner && (
              <div className="bg-linear-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={20} className="text-purple-400" />
                  <h3 className="text-white font-semibold">AI Study Planner</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">Describe your study goal and AI will create a personalized plan for you.</p>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'Create a study plan for my final exams next week' or 'Help me prepare for a project deadline'"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none h-24 mb-3"
                />
                <div className="flex gap-3">
                  <button onClick={generateAiPlan} disabled={!aiPrompt.trim() || aiGenerating} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    {aiGenerating ? (
                      <><span className="animate-spin">⏳</span> Generating...</>
                    ) : (
                      <><Send size={14} /> Generate Plan</>
                    )}
                  </button>
                  <button onClick={() => setShowAiPlanner(false)} className="bg-white/5 hover:bg-white/10 text-gray-400 text-sm px-5 py-2 rounded-xl transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {subjects.map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${filter === s ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Add task */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 space-y-3">
              <h3 className="text-white font-semibold text-sm">Add New Task</h3>
              <div className="flex gap-3">
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Task title..."
                  className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                />
                <input
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  placeholder="Time (e.g. 10:00 AM)"
                  className="w-40 bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="flex gap-3">
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)} className="flex-1 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none">
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <select value={newSubject} onChange={e => setNewSubject(e.target.value)} className="flex-1 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none">
                  {subjects.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={addTask} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Tasks ({filtered.length})</h3>
              {filtered.length === 0 && (
                <div className="bg-[#1a1a2e] border border-white/5 rounded-xl p-8 text-center">
                  <p className="text-gray-500 text-sm">No tasks yet. Add your first task above!</p>
                </div>
              )}
              {filtered.map(task => (
                <div key={task.id} className={`bg-[#1a1a2e] border rounded-xl p-4 flex items-center gap-3 transition-all ${task.done ? 'border-green-500/20 opacity-60' : 'border-white/5 hover:border-purple-500/20'}`}>
                  <button onClick={() => toggleDone(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-purple-500'}`}>
                    {task.done && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.done ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</p>
                    <p className="text-gray-500 text-xs">{task.time}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-600/20 text-purple-400">{task.subject}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${priorities[task.priority]}`}>{task.priority}</span>
                  <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Calendar */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <span key={i} className="text-gray-600 text-xs">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
                  const day = i - firstDay + 1;
                  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                  if (day < 1 || day > daysInMonth) return <div key={i} />;
                  const isToday = day === new Date().getDate();
                  return (
                    <div key={i} className={`text-xs py-1.5 rounded-lg text-center cursor-pointer ${isToday ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">Today's Progress</h3>
              <div className="text-center mb-3">
                <div className="relative w-20 h-20 mx-auto">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e3a" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray={`${progress} ${100 - progress}`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-sm font-bold">{progress}%</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-1">{doneCount} of {tasks.length} tasks done</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Total Tasks', val: tasks.length.toString(), color: 'bg-purple-600' },
                  { label: 'Completed', val: doneCount.toString(), color: 'bg-green-600' },
                  { label: 'Remaining', val: (tasks.length - doneCount).toString(), color: 'bg-orange-500' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${s.color} rounded-full`} />
                      <span className="text-gray-400 text-xs">{s.label}</span>
                    </div>
                    <span className="text-white text-xs font-medium">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects */}
            {subjectCounts.length > 0 && (
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Subjects Progress</h3>
                <div className="space-y-2">
                  {subjectCounts.map((s, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs">{s.name}</span>
                        <span className="text-white text-xs font-medium">{s.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className={`${s.color} h-1.5 rounded-full`} style={{ width: `${s.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

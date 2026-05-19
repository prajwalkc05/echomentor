import { useState } from 'react';
import { Lightbulb, Search, Hammer, Rocket, TrendingUp, BookOpen, Wrench, DollarSign, Heart, Users, Zap, BarChart3, CheckSquare, Layers, Plus, Trash2, Check, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

function PhaseIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    ideation: <Lightbulb size={22} className="text-yellow-400" />,
    validation: <Search size={22} className="text-blue-400" />,
    building: <Hammer size={22} className="text-orange-400" />,
    launch: <Rocket size={22} className="text-purple-400" />,
    growth: <TrendingUp size={22} className="text-green-400" />,
  };
  return <>{map[name] ?? null}</>;
}

function ResourceIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    learning: <BookOpen size={16} className="text-purple-400" />,
    tools: <Wrench size={16} className="text-blue-400" />,
    funding: <DollarSign size={16} className="text-green-400" />,
  };
  return <>{map[name] ?? null}</>;
}

function PrincipleIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    heart: <Heart size={20} className="text-red-400" />,
    users: <Users size={20} className="text-blue-400" />,
    zap: <Zap size={20} className="text-yellow-400" />,
    chart: <BarChart3 size={20} className="text-green-400" />,
  };
  return <>{map[name] ?? null}</>;
}

function TabIcon({ name }: { name: string }) {
  if (name === 'ideas') return <Lightbulb size={14} />;
  if (name === 'checklist') return <CheckSquare size={14} />;
  return <Layers size={14} />;
}


interface Idea {
  id: number;
  title: string;
  description: string;
  stage: 'Idea' | 'Validating' | 'Building' | 'Launched';
  createdAt: string;
}

interface CheckItem {
  id: number;
  text: string;
  done: boolean;
  category: string;
}

const stageColors: Record<string, string> = {
  Idea: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Validating: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Building: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Launched: 'text-green-400 bg-green-400/10 border-green-400/20',
};

const defaultChecklist: CheckItem[] = [
  { id: 1, text: 'Define the problem you are solving', done: false, category: 'Ideation' },
  { id: 2, text: 'Identify your target audience', done: false, category: 'Ideation' },
  { id: 3, text: 'Research existing competitors', done: false, category: 'Ideation' },
  { id: 4, text: 'Write a one-line value proposition', done: false, category: 'Ideation' },
  { id: 5, text: 'Conduct at least 10 user interviews', done: false, category: 'Validation' },
  { id: 6, text: 'Build a landing page to test demand', done: false, category: 'Validation' },
  { id: 7, text: 'Define your MVP features', done: false, category: 'Validation' },
  { id: 8, text: 'Build and ship the MVP', done: false, category: 'Building' },
  { id: 9, text: 'Get your first 10 users', done: false, category: 'Building' },
  { id: 10, text: 'Collect and act on user feedback', done: false, category: 'Building' },
  { id: 11, text: 'Define your revenue model', done: false, category: 'Growth' },
  { id: 12, text: 'Set up analytics and track key metrics', done: false, category: 'Growth' },
];

const resources = [
  { category: 'Learning', icon: 'learning', items: [
    { title: 'The Lean Startup — Eric Ries', url: 'https://theleanstartup.com', desc: 'Build-Measure-Learn methodology' },
    { title: 'Zero to One — Peter Thiel', url: 'https://zerotoonebook.com', desc: 'Building companies that create new things' },
    { title: 'Y Combinator Startup School', url: 'https://startupschool.org', desc: 'Free online startup course' },
    { title: 'The Mom Test — Rob Fitzpatrick', url: 'https://momtestbook.com', desc: 'How to talk to customers & learn if your business is a good idea' },
    { title: 'Hooked — Nir Eyal', url: 'https://nirandfar.com/hooked', desc: 'How to build habit-forming products' },
    { title: 'Crossing the Chasm — Geoffrey Moore', url: 'https://harpercollins.com', desc: 'Marketing and selling disruptive products' },
  ]},
  { category: 'Tools', icon: 'tools', items: [
    { title: 'Notion', url: 'https://notion.so', desc: 'All-in-one workspace for notes and planning' },
    { title: 'Figma', url: 'https://figma.com', desc: 'Design and prototype your product' },
    { title: 'Vercel', url: 'https://vercel.com', desc: 'Deploy your web app instantly' },
    { title: 'GitHub', url: 'https://github.com', desc: 'Version control and collaboration' },
    { title: 'Stripe', url: 'https://stripe.com', desc: 'Payment processing for startups' },
    { title: 'Google Analytics', url: 'https://analytics.google.com', desc: 'Track user behavior and metrics' },
    { title: 'Mailchimp', url: 'https://mailchimp.com', desc: 'Email marketing and automation' },
    { title: 'Canva', url: 'https://canva.com', desc: 'Design marketing materials easily' },
  ]},
  { category: 'Funding', icon: 'funding', items: [
    { title: 'Y Combinator', url: 'https://ycombinator.com', desc: 'Top startup accelerator' },
    { title: 'AngelList', url: 'https://angel.co', desc: 'Connect with angel investors' },
    { title: 'Product Hunt', url: 'https://producthunt.com', desc: 'Launch and get early users' },
    { title: 'Crunchbase', url: 'https://crunchbase.com', desc: 'Research investors and funding rounds' },
    { title: 'Kickstarter', url: 'https://kickstarter.com', desc: 'Crowdfunding for creative projects' },
    { title: 'Indie Hackers', url: 'https://indiehackers.com', desc: 'Community of bootstrapped founders' },
  ]},
];

const phases = [
  { 
    icon: 'ideation', 
    title: 'Ideation', 
    desc: 'Find a real problem worth solving and validate your assumptions before building anything.',
    tips: [
      'Identify a problem you personally experience',
      'Research if others have the same problem',
      'Study existing solutions and their gaps',
      'Write down your unique value proposition'
    ]
  },
  { 
    icon: 'validation', 
    title: 'Validation', 
    desc: 'Talk to potential customers, test your idea cheaply, and confirm people will pay for it.',
    tips: [
      'Conduct 10-20 customer interviews',
      'Create a landing page to test demand',
      'Build a simple prototype or mockup',
      'Get pre-orders or letters of intent'
    ]
  },
  { 
    icon: 'building', 
    title: 'Building MVP', 
    desc: 'Build the smallest version of your product that delivers core value to early users.',
    tips: [
      'Focus on one core feature that solves the main problem',
      'Use no-code tools if possible to move faster',
      'Set a strict deadline (4-8 weeks max)',
      'Get feedback from real users weekly'
    ]
  },
  { 
    icon: 'launch', 
    title: 'Launch', 
    desc: 'Ship to real users, gather feedback, and iterate fast based on what you learn.',
    tips: [
      'Launch on Product Hunt, Hacker News, Reddit',
      'Reach out to your network personally',
      'Collect user feedback through surveys',
      'Track key metrics from day one'
    ]
  },
  { 
    icon: 'growth', 
    title: 'Growth', 
    desc: 'Scale what works, find repeatable acquisition channels, and build a sustainable business.',
    tips: [
      'Double down on channels that work',
      'Implement referral programs',
      'Focus on retention and reducing churn',
      'Build a content marketing strategy'
    ]
  },
];

export default function StartupGuide() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [checklist, setChecklist] = useState<CheckItem[]>(defaultChecklist);
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [ideaForm, setIdeaForm] = useState({ title: '', description: '', stage: 'Idea' as Idea['stage'] });
  const [openResource, setOpenResource] = useState<string | null>('Learning');
  const [activeTab, setActiveTab] = useState<'guide' | 'ideas' | 'checklist' | 'resources'>('guide');
  const [customTask, setCustomTask] = useState('');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const addIdea = () => {
    if (!ideaForm.title.trim()) return;
    setIdeas(prev => [...prev, {
      id: Date.now(),
      title: ideaForm.title.trim(),
      description: ideaForm.description.trim(),
      stage: ideaForm.stage,
      createdAt: new Date().toLocaleDateString(),
    }]);
    setIdeaForm({ title: '', description: '', stage: 'Idea' });
    setShowAddIdea(false);
  };

  const deleteIdea = (id: number) => setIdeas(prev => prev.filter(i => i.id !== id));
  const updateStage = (id: number, stage: Idea['stage']) =>
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, stage } : i));

  const toggleCheck = (id: number) =>
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const addCustomTask = () => {
    if (!customTask.trim()) return;
    setChecklist(prev => [...prev, { id: Date.now(), text: customTask.trim(), done: false, category: 'Custom' }]);
    setCustomTask('');
  };

  const deleteTask = (id: number) => setChecklist(prev => prev.filter(c => c.id !== id));

  const doneCount = checklist.filter(c => c.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);
  const categories = [...new Set(checklist.map(c => c.category))];

  const tabs = [
    { id: 'guide', label: 'Guide', icon: '📖' },
    { id: 'ideas', label: 'My Ideas', icon: 'ideas' },
    { id: 'checklist', label: 'Checklist', icon: 'checklist' },
    { id: 'resources', label: 'Resources', icon: '🔗' },
  ] as const;

  return (
    <div className="w-full h-screen flex flex-col bg-[#0f0f1e] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Rocket size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Startup Guide</h1>
            <p className="text-gray-500 text-sm">From idea to launch — your complete startup roadmap.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-sm font-semibold">{doneCount}/{checklist.length} steps done</p>
            <div className="w-32 bg-white/10 rounded-full h-1.5 mt-1">
              <div className="bg-purple-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 pt-4 border-b border-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-[#1a1a2e] text-white border-t border-l border-r border-white/5' : 'text-gray-500 hover:text-white'}`}>
            <TabIcon name={t.icon} /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className="max-w-full space-y-4">
            <div className="bg-linear-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-6">
              <h2 className="text-white text-lg font-bold mb-2">The Startup Journey</h2>
              <p className="text-gray-400 text-sm">Building a startup is a process. Follow these phases to go from a raw idea to a real business. Each phase has clear goals — don't skip ahead.</p>
            </div>
            {phases.map((phase, i) => (
              <div key={i} className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all">
                <button onClick={() => setExpandedPhase(expandedPhase === i ? null : i)} className="w-full p-5 flex gap-4 text-left">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center shrink-0"><PhaseIcon name={phase.icon} /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-600 text-xs font-mono">Phase {i + 1}</span>
                      <div className="w-1 h-1 bg-gray-700 rounded-full" />
                      <h3 className="text-white font-semibold">{phase.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{phase.desc}</p>
                  </div>
                  {expandedPhase === i ? <ChevronDown size={18} className="text-gray-500 shrink-0" /> : <ChevronRight size={18} className="text-gray-500 shrink-0" />}
                </button>
                {expandedPhase === i && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Key Actions</p>
                    <div className="space-y-2">
                      {phase.tips.map((tip, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                          <p className="text-gray-300 text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3">Key Principles</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'heart', title: 'Fall in love with the problem', desc: 'Not your solution. The problem is what matters.' },
                  { icon: 'users', title: 'Talk to users constantly', desc: 'Every assumption must be validated with real people.' },
                  { icon: 'zap', title: 'Ship fast, learn faster', desc: 'A working product beats a perfect plan every time.' },
                  { icon: 'chart', title: 'Measure everything', desc: 'If you can\'t measure it, you can\'t improve it.' },
                ].map((p, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3">
                    <div className="mb-2"><PrincipleIcon name={p.icon} /></div>
                    <p className="text-white text-sm font-medium">{p.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IDEAS TAB */}
        {activeTab === 'ideas' && (
          <div className="max-w-full space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{ideas.length} idea{ideas.length !== 1 ? 's' : ''} tracked</p>
              <button onClick={() => setShowAddIdea(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus size={14} /> Add Idea
              </button>
            </div>

            {showAddIdea && (
              <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-semibold">New Startup Idea</h3>
                <input value={ideaForm.title} onChange={e => setIdeaForm(p => ({ ...p, title: e.target.value }))} placeholder="Idea title *" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                <textarea value={ideaForm.description} onChange={e => setIdeaForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the problem you're solving..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
                <div className="flex gap-3">
                  <select value={ideaForm.stage} onChange={e => setIdeaForm(p => ({ ...p, stage: e.target.value as Idea['stage'] }))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm focus:outline-none">
                    <option>Idea</option>
                    <option>Validating</option>
                    <option>Building</option>
                    <option>Launched</option>
                  </select>
                  <button onClick={addIdea} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">Save</button>
                  <button onClick={() => setShowAddIdea(false)} className="bg-white/5 hover:bg-white/10 text-gray-400 text-sm px-5 py-2 rounded-xl transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {ideas.length === 0 && !showAddIdea && (
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-12 text-center">
                <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&q=80" alt="ideas" className="w-20 h-20 rounded-2xl object-cover opacity-40 mx-auto mb-4" />
                <p className="text-white font-semibold mb-1">No ideas yet</p>
                <p className="text-gray-500 text-sm mb-4">Start tracking your startup ideas here.</p>
                <button onClick={() => setShowAddIdea(true)} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Add Your First Idea
                </button>
              </div>
            )}

            {ideas.map(idea => (
              <div key={idea.id} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-white font-semibold">{idea.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <select value={idea.stage} onChange={e => updateStage(idea.id, e.target.value as Idea['stage'])} className={`text-xs px-2 py-1 rounded-full border bg-transparent focus:outline-none ${stageColors[idea.stage]}`}>
                      <option>Idea</option>
                      <option>Validating</option>
                      <option>Building</option>
                      <option>Launched</option>
                    </select>
                    <button onClick={() => deleteIdea(idea.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                {idea.description && <p className="text-gray-400 text-sm mb-2">{idea.description}</p>}
                <p className="text-gray-600 text-xs">Added {idea.createdAt}</p>
              </div>
            ))}
          </div>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <div className="max-w-full space-y-5">
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e3a" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray={`${progress} ${100 - progress}`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-xs font-bold">{progress}%</p>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">{doneCount} of {checklist.length} steps completed</p>
                <p className="text-gray-500 text-sm">Keep going — every step brings you closer to launch.</p>
              </div>
            </div>

            {/* Add custom task */}
            <div className="flex gap-3">
              <input value={customTask} onChange={e => setCustomTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomTask()} placeholder="Add a custom task..." className="flex-1 bg-[#1a1a2e] border border-white/5 rounded-xl px-4 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
              <button onClick={addCustomTask} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"><Plus size={16} /></button>
            </div>

            {categories.map(cat => (
              <div key={cat}>
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{cat}</h3>
                <div className="space-y-2">
                  {checklist.filter(c => c.category === cat).map(item => (
                    <div key={item.id} className={`flex items-center gap-3 bg-[#1a1a2e] border rounded-xl px-4 py-3 transition-all group ${item.done ? 'border-green-500/20 opacity-60' : 'border-white/5 hover:border-purple-500/20'}`}>
                      <button onClick={() => toggleCheck(item.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-purple-500'}`}>
                        {item.done && <Check size={10} className="text-white" />}
                      </button>
                      <p className={`flex-1 text-sm ${item.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{item.text}</p>
                      <button onClick={() => deleteTask(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="max-w-full space-y-3">
            <p className="text-gray-500 text-sm">Curated resources to help you build and grow your startup.</p>
            {resources.map(group => (
              <div key={group.category} className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenResource(openResource === group.category ? null : group.category)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center"><ResourceIcon name={group.icon} /></div>
                    <span className="text-white font-semibold">{group.category}</span>
                    <span className="text-gray-600 text-xs">{group.items.length} resources</span>
                  </div>
                  {openResource === group.category ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                </button>
                {openResource === group.category && (
                  <div className="border-t border-white/5">
                    {group.items.map((item, i) => (
                      <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                        <div>
                          <p className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">{item.title}</p>
                          <p className="text-gray-500 text-xs">{item.desc}</p>
                        </div>
                        <ExternalLink size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

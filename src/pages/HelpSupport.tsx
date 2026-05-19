import { useState } from 'react';
import { Rocket, Bot, Settings, BookOpen, MessageCircle, Mail, Bug, HelpCircle, ChevronDown, ChevronRight, Send, Check, Plus } from 'lucide-react';

function FaqIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    rocket: <Rocket size={16} className="text-purple-400" />,
    bot: <Bot size={16} className="text-blue-400" />,
    settings: <Settings size={16} className="text-gray-400" />,
    book: <BookOpen size={16} className="text-green-400" />,
  };
  return <>{map[name] ?? <HelpCircle size={16} className="text-gray-400" />}</>;
}

function ContactIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    chat: <MessageCircle size={22} className="text-purple-400" />,
    email: <Mail size={22} className="text-blue-400" />,
    bug: <Bug size={22} className="text-red-400" />,
  };
  return <>{map[name] ?? null}</>;
}


interface Ticket {
  id: number;
  subject: string;
  message: string;
  category: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
}

const faqs = [
  {
    category: 'Getting Started',
    icon: 'rocket',
    items: [
      { q: 'How do I get started with EchoMentor?', a: 'Sign up for a free account, complete your profile, and explore the dashboard. Use Quick Access to jump into any feature — AI Chat, Study Planner, Mood Tracker, and more.' },
      { q: 'Is EchoMentor free to use?', a: 'Yes! EchoMentor is completely free to use with access to all features including AI Chat, Study Planner, Mood Tracker, Resume Builder, and more.' },
      { q: 'Can I use EchoMentor on mobile?', a: 'EchoMentor is a web app that works on any modern browser including mobile browsers. A dedicated mobile app is on our roadmap.' },
    ],
  },
  {
    category: 'AI Features',
    icon: 'bot',
    items: [
      { q: 'How does the AI Chat work?', a: 'AI Chat uses a language model to answer your questions, explain concepts, help with assignments, and guide your learning. Just type your question and get an instant response.' },
      { q: 'How does the AI PPT Generator work?', a: 'Enter a topic and description, choose your settings, and click Generate. The AI creates a structured outline with slide titles and content. You can edit, add, or remove slides before downloading.' },
      { q: 'Can the Code Assistant run my code?', a: 'The Code Assistant provides a simulated console output. For actual code execution, copy the code to your local environment or an online IDE like Replit or CodeSandbox.' },
    ],
  },
  {
    category: 'Account & Settings',
    icon: 'settings',
    items: [
      { q: 'How do I update my profile?', a: 'Go to Settings → Edit Profile. You can update your name, email, bio, phone, location, and role. Changes are saved instantly.' },
      { q: 'How do I change my password?', a: 'Password management requires backend authentication. This feature will be available once the backend is connected.' },
      { q: 'How do I delete my account?', a: 'Account deletion requires backend support. Please contact us via the support form below and we will process your request.' },
    ],
  },
  {
    category: 'Study Tools',
    icon: 'book',
    items: [
      { q: 'Does my data persist after I close the browser?', a: 'Currently, data is stored in memory and resets on page refresh. Persistent storage with a backend database is on our roadmap.' },
      { q: 'Can I export my resume from the Resume Builder?', a: 'The Download PDF button is available in the Resume Builder. Full PDF export requires backend integration and is coming soon.' },
      { q: 'How does the Mood Tracker help me?', a: 'The Mood Tracker lets you log your daily mood and notes. Over time it shows patterns, insights, and trends to help you understand your emotional well-being and study performance.' },
    ],
  },
];

const categories = ['General', 'Bug Report', 'Feature Request', 'Account Issue', 'Billing'];

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string>('Getting Started');
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [form, setForm] = useState({ subject: '', message: '', category: 'General' });
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState('');

  const submitTicket = () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    const ticket: Ticket = {
      id: Date.now(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      category: form.category,
      status: 'Open',
      createdAt: new Date().toLocaleString(),
    };
    setTickets(prev => [ticket, ...prev]);
    setForm({ subject: '', message: '', category: 'General' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setActiveTab('tickets');
  };

  const filteredFaqs = faqs.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(group => group.items.length > 0);

  const statusColors: Record<string, string> = {
    Open: 'text-yellow-400 bg-yellow-400/10',
    'In Review': 'text-blue-400 bg-blue-400/10',
    Resolved: 'text-green-400 bg-green-400/10',
  };

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={15} /> },
    { id: 'contact', label: 'Contact Us', icon: <MessageCircle size={15} /> },
    { id: 'tickets', label: `My Tickets${tickets.length > 0 ? ` (${tickets.length})` : ''}`, icon: <Bug size={15} /> },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <HelpCircle size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Help & Support</h1>
            <p className="text-gray-500 text-sm">Find answers, report issues, or get in touch with us.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-[#1a1a2e] text-white border-t border-l border-r border-white/5' : 'text-gray-500 hover:text-white'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {/* FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl space-y-5">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/5 rounded-xl px-4 py-2.5">
              <BookOpen size={15} className="text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search frequently asked questions..." className="flex-1 bg-transparent text-gray-300 text-sm placeholder-gray-600 focus:outline-none" />
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No results found for "{search}"</p>
                <button onClick={() => setSearch('')} className="text-purple-400 text-xs mt-2 hover:underline">Clear search</button>
              </div>
            )}

            {filteredFaqs.map(group => (
              <div key={group.category} className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenCategory(openCategory === group.category ? '' : group.category)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center"><FaqIcon name={group.icon} /></div>
                    <span className="text-white font-semibold">{group.category}</span>
                    <span className="text-gray-600 text-xs">{group.items.length} questions</span>
                  </div>
                  {openCategory === group.category ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                </button>

                {openCategory === group.category && (
                  <div className="border-t border-white/5">
                    {group.items.map((item, i) => (
                      <div key={i} className="border-b border-white/5 last:border-0">
                        <button onClick={() => setOpenFaq(openFaq === `${group.category}-${i}` ? null : `${group.category}-${i}`)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors">
                          <p className="text-gray-300 text-sm font-medium pr-4">{item.q}</p>
                          {openFaq === `${group.category}-${i}` ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />}
                        </button>
                        {openFaq === `${group.category}-${i}` && (
                          <div className="px-5 pb-4">
                            <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5 text-center">
              <p className="text-gray-400 text-sm mb-3">Can't find what you're looking for?</p>
              <button onClick={() => setActiveTab('contact')} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="max-w-2xl space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'chat', title: 'Live Chat', desc: 'Chat with our team', note: 'Requires backend' },
                { icon: 'email', title: 'Email Support', desc: 'support@echomentor.app', note: 'We reply within 24h' },
                { icon: 'bug', title: 'Bug Report', desc: 'Found an issue?', note: 'Use the form below' },
              ].map((c, i) => (
                <div key={i} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-2"><ContactIcon name={c.icon} /></div>
                  <p className="text-white text-sm font-semibold">{c.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{c.desc}</p>
                  <p className="text-gray-600 text-xs mt-1">{c.note}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-semibold">Send us a message</h3>

              <div>
                <label className="text-gray-500 text-xs mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 text-sm focus:outline-none">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1 block">Subject *</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of your issue" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1 block">Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe your issue or question in detail..." rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>

              {submitted && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5">
                  <Check size={14} /> Ticket submitted! We'll get back to you soon.
                </div>
              )}

              <button onClick={submitTicket} disabled={!form.subject.trim() || !form.message.trim()} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                <Send size={14} /> Submit Ticket
              </button>
            </div>
          </div>
        )}

        {/* TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} submitted</p>
              <button onClick={() => setActiveTab('contact')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus size={14} /> New Ticket
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-12 text-center">
                <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&q=80" alt="tickets" className="w-20 h-20 rounded-2xl object-cover opacity-40 mx-auto mb-4" />
                <p className="text-white font-semibold mb-1">No tickets yet</p>
                <p className="text-gray-500 text-sm mb-4">Submit a support request and track it here.</p>
                <button onClick={() => setActiveTab('contact')} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Create a Ticket
                </button>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{ticket.subject}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{ticket.category} · {ticket.createdAt}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{ticket.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { ArrowRight, Moon, Sun, MessageCircle, Calendar, Smile, Presentation, Code, FileText, Users, Zap, Award, BookOpen, Briefcase, Lightbulb, Brain, Target, Star, CheckCircle } from 'lucide-react';
import { Page } from '../types';
import { useUser } from '../context/UserContext';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { user, updateUser } = useUser();
  const dark = user.darkMode;
  const toggleDark = () => updateUser({ darkMode: !dark });

  const bg = dark ? 'bg-[#0B0F1A] text-white' : 'bg-white text-gray-900';
  const navBg = dark ? 'bg-[#0B0F1A]/90 border-white/5' : 'bg-white/90 border-gray-200';
  const cardBg = dark ? 'bg-[#111827] border-white/6' : 'bg-gray-50 border-gray-200';
  const subtext = dark ? 'text-gray-400' : 'text-gray-500';

  const features = [
    { icon: <MessageCircle size={20} className="text-purple-400" />, bg: 'bg-purple-600/20', title: 'AI Chat', desc: 'Get instant answers, explanations and guidance from your AI mentor anytime.', tag: 'Popular' },
    { icon: <Calendar size={20} className="text-green-400" />, bg: 'bg-green-600/20', title: 'Study Planner', desc: 'Plan your study sessions, track tasks and stay consistent every day.', tag: '' },
    { icon: <Smile size={20} className="text-yellow-400" />, bg: 'bg-yellow-600/20', title: 'Mood Tracker', desc: 'Track your mood and get AI suggestions to improve your well-being.', tag: '' },
    { icon: <Presentation size={20} className="text-pink-400" />, bg: 'bg-pink-600/20', title: 'AI PPT Generator', desc: 'Create stunning professional presentations in seconds with AI.', tag: 'New' },
    { icon: <Code size={20} className="text-blue-400" />, bg: 'bg-blue-600/20', title: 'Code Assistant', desc: 'Write, debug, review and optimize code with intelligent AI help.', tag: '' },
    { icon: <FileText size={20} className="text-indigo-400" />, bg: 'bg-indigo-600/20', title: 'Resume Builder', desc: 'Build a professional AI-powered resume in minutes with templates.', tag: '' },
    { icon: <BookOpen size={20} className="text-cyan-400" />, bg: 'bg-cyan-600/20', title: 'Courses', desc: 'Discover curated courses from top platforms to build your skills.', tag: '' },
    { icon: <Briefcase size={20} className="text-orange-400" />, bg: 'bg-orange-600/20', title: 'Opportunities', desc: 'Find internships, jobs, hackathons and scholarships tailored for you.', tag: '' },
    { icon: <Lightbulb size={20} className="text-rose-400" />, bg: 'bg-rose-600/20', title: 'Startup Guide', desc: 'Step-by-step guidance to launch and grow your startup idea.', tag: '' },
    { icon: <Brain size={20} className="text-violet-400" />, bg: 'bg-violet-600/20', title: 'Smart Notes', desc: 'AI-powered note taking that organizes and summarizes for you.', tag: 'Soon' },
    { icon: <Target size={20} className="text-teal-400" />, bg: 'bg-teal-600/20', title: 'AI Quiz Generator', desc: 'Generate quizzes from any topic to test and reinforce your knowledge.', tag: 'Soon' },
    { icon: <Star size={20} className="text-amber-400" />, bg: 'bg-amber-600/20', title: 'Progress Dashboard', desc: 'Track your learning progress with detailed analytics and insights.', tag: 'Soon' },
  ];

  const stats = [
    { icon: <Users size={22} className="text-purple-400" />, bg: 'bg-purple-600/20', num: '10K+', label: 'Active Students' },
    { icon: <MessageCircle size={22} className="text-blue-400" />, bg: 'bg-blue-600/20', num: '500+', label: 'AI Sessions Daily' },
    { icon: <Zap size={22} className="text-yellow-400" />, bg: 'bg-yellow-600/20', num: '20+', label: 'Smart Tools' },
    { icon: <Award size={22} className="text-green-400" />, bg: 'bg-green-600/20', num: '95%', label: 'Satisfaction Rate' },
  ];

  const avatarImgs = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
  ];

  const tagColor: Record<string, string> = {
    Popular: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
    New: 'bg-green-600/20 text-green-300 border-green-500/30',
    Soon: 'bg-gray-600/20 text-gray-400 border-gray-500/30',
  };

  const showAdminBtn = import.meta.env.DEV || new URLSearchParams(window.location.search).has('admin');

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-200`} style={{ scrollBehavior: 'smooth' }}>

      {/* Navbar */}
      <nav className={`flex items-center justify-between px-8 py-4 border-b sticky top-0 backdrop-blur-md z-50 ${navBg}`}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="9" r="5" fill="white" opacity="0.9"/>
              <circle cx="9.5" cy="8" r="1.5" fill="#7c3aed"/>
              <circle cx="14.5" cy="8" r="1.5" fill="#7c3aed"/>
              <path d="M9 13 Q12 16 15 13" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold">
            <span className={dark ? 'text-white' : 'text-gray-900'}>Echo</span>
            <span className="text-purple-500">Mentor</span>
          </span>
        </div>
        <div className={`hidden md:flex items-center gap-8 text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#courses" className="hover:text-purple-400 transition-colors">Courses</a>
          <a href="#opportunities" className="hover:text-purple-400 transition-colors">Opportunities</a>
          <a href="#about" className="hover:text-purple-400 transition-colors">About Us</a>
        </div>
        <div className="flex items-center gap-3">
          {showAdminBtn && (
            <button onClick={() => onNavigate('admin')} className="px-3 py-2 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin
            </button>
          )}
          <button onClick={toggleDark} className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => onNavigate('login')} className={`px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${dark ? 'border-white/20 hover:bg-white/5 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
            Log In
          </button>
          <button onClick={() => onNavigate('signup')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-purple-600/30">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-20 pb-16 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-purple-700/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="relative z-10">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6 border ${dark ? 'bg-purple-600/10 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
              <Zap size={12} className="text-purple-400" />
              ✨ POWERED BY AI, DESIGNED FOR YOU
            </div>

            {/* Heading */}
            <h1 className={`text-5xl lg:text-6xl font-extrabold leading-tight mb-5 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Powerful Features<br />
              for{' '}
              <span className="bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Smarter Learning
              </span>
            </h1>

            <p className={`text-lg mb-8 max-w-lg leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              EchoMentor brings together all the tools you need to learn, plan, build, and grow — in one intelligent AI-powered platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => onNavigate('signup')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-600/30">
                Get Started Free <ArrowRight size={18} />
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {avatarImgs.map((src, i) => (
                  <img key={i} src={src} alt="student" className={`w-9 h-9 rounded-full object-cover border-2 ${dark ? 'border-[#0B0F1A]' : 'border-white'}`} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}><strong className={dark ? 'text-white' : 'text-gray-900'}>5K+</strong> students already learning smarter</span>
              </div>
            </div>

            {/* Quick section links */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <BookOpen size={18} className="text-cyan-400" />, bg: 'bg-cyan-600/20', border: 'border-cyan-500/20 hover:border-cyan-500/50', label: 'Courses', desc: '10K+ available', href: '#courses' },
                { icon: <Briefcase size={18} className="text-orange-400" />, bg: 'bg-orange-600/20', border: 'border-orange-500/20 hover:border-orange-500/50', label: 'Opportunities', desc: 'Jobs & internships', href: '#opportunities' },
                { icon: <Users size={18} className="text-purple-400" />, bg: 'bg-purple-600/20', border: 'border-purple-500/20 hover:border-purple-500/50', label: 'About Us', desc: 'Our mission', href: '#about' },
              ].map((item, i) => (
                <a key={i} href={item.href} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer group ${dark ? `bg-white/5 ${item.border}` : `bg-gray-50 border-gray-200 hover:border-purple-400`}`}>
                  <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center shrink-0`}>{item.icon}</div>
                  <div>
                    <p className={`text-xs font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                    <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{item.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right — Robot + Stats Panel */}
          <div className="relative z-10 flex flex-col gap-4">
            {/* Robot illustration card */}
            <div className={`relative rounded-2xl overflow-hidden border ${dark ? 'bg-[#111827] border-white/5' : 'bg-gray-50 border-gray-200'} p-6`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-center py-4">
                {/* AI Robot SVG */}
                <div className="relative">
                  <div className="w-32 h-32 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30 shadow-xl shadow-purple-600/20">
                    <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
                      <rect x="15" y="20" width="50" height="40" rx="12" fill="#7c3aed" opacity="0.9"/>
                      <rect x="22" y="28" width="14" height="10" rx="4" fill="white" opacity="0.9"/>
                      <rect x="44" y="28" width="14" height="10" rx="4" fill="white" opacity="0.9"/>
                      <circle cx="29" cy="33" r="4" fill="#4f46e5"/>
                      <circle cx="51" cy="33" r="4" fill="#4f46e5"/>
                      <path d="M28 46 Q40 54 52 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                      <rect x="36" y="10" width="8" height="12" rx="4" fill="#7c3aed"/>
                      <circle cx="40" cy="9" r="4" fill="#a78bfa"/>
                      <rect x="5" y="30" width="10" height="6" rx="3" fill="#7c3aed" opacity="0.7"/>
                      <rect x="65" y="30" width="10" height="6" rx="3" fill="#7c3aed" opacity="0.7"/>
                    </svg>
                  </div>
                  {/* Floating icons */}
                  <div className="absolute -top-2 -right-4 w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                    <Code size={16} className="text-blue-400" />
                  </div>
                  <div className="absolute -bottom-2 -left-4 w-9 h-9 bg-green-600/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                    <BookOpen size={16} className="text-green-400" />
                  </div>
                  <div className="absolute top-4 -left-6 w-9 h-9 bg-pink-600/20 border border-pink-500/30 rounded-xl flex items-center justify-center">
                    <Presentation size={16} className="text-pink-400" />
                  </div>
                </div>
              </div>
              <div className="text-center mt-2">
                <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Your AI Study Companion</p>
                <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Available 24/7 to help you learn</p>
              </div>
            </div>

            {/* Stats panel */}
            <div className={`rounded-2xl border p-5 ${dark ? 'bg-[#111827] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>All-in-One Platform</p>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-white/5' : 'bg-white border border-gray-100'}`}>
                    <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>{s.icon}</div>
                    <div>
                      <p className={`text-lg font-bold leading-none ${dark ? 'text-white' : 'text-gray-900'}`}>{s.num}</p>
                      <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 px-8 ${dark ? 'bg-[#0d0d1a]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 border ${dark ? 'bg-purple-600/10 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
              <Zap size={12} /> FEATURES
            </div>
            <h2 className={`text-4xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Powerful Features for{' '}
              <span className="bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Smarter Learning</span>
            </h2>
            <p className={`max-w-xl mx-auto ${subtext}`}>Everything you need to learn, plan, build and grow — all in one intelligent platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className={`border rounded-2xl p-5 hover:border-purple-500/40 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 ${cardBg}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center`}>{f.icon}</div>
                  {f.tag && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tagColor[f.tag]}`}>{f.tag}</span>
                  )}
                </div>
                <h3 className={`font-semibold mb-1.5 ${dark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                <p className={`text-xs leading-relaxed mb-3 ${subtext}`}>{f.desc}</p>
                <button className="text-purple-400 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 border ${dark ? 'bg-cyan-600/10 border-cyan-500/30 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
              <BookOpen size={12} /> COURSES
            </div>
            <h2 className={`text-4xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Discover Courses That{' '}
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Build Your Future</span>
            </h2>
            <p className={`max-w-xl mx-auto ${subtext}`}>Curated courses from top platforms like Coursera, Udemy and Google to help you grow your skills.</p>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap justify-center mb-10">
            {['All Categories', 'Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Personal Growth', 'Finance'].map((cat, i) => (
              <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                i === 0
                  ? 'bg-purple-600 text-white border-purple-600'
                  : dark ? 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600'
              }`}>{cat}</button>
            ))}
          </div>

          {/* Course cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Full Stack Web Development', platform: 'Udemy', rating: '4.8', duration: '42h', level: 'Beginner', price: '₹499', original: '₹3,999', tag: 'Bestseller', color: 'bg-blue-600/20', img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80' },
              { title: 'Machine Learning A-Z', platform: 'Coursera', rating: '4.9', duration: '36h', level: 'Intermediate', price: '₹799', original: '₹4,999', tag: 'Popular', color: 'bg-purple-600/20', img: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80' },
              { title: 'UI/UX Design Masterclass', platform: 'Google', rating: '4.7', duration: '28h', level: 'Beginner', price: 'Free', original: '', tag: 'New', color: 'bg-pink-600/20', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80' },
              { title: 'Data Science with Python', platform: 'Udemy', rating: '4.8', duration: '50h', level: 'Intermediate', price: '₹599', original: '₹3,499', tag: 'Bestseller', color: 'bg-green-600/20', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
            ].map((course, i) => (
              <div key={i} className={`border rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 cursor-pointer group ${cardBg}`}>
                <div className="relative h-40 overflow-hidden">
                  <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold ${
                    course.tag === 'Bestseller' ? 'bg-yellow-500 text-black' :
                    course.tag === 'Popular' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
                  }`}>{course.tag}</span>
                </div>
                <div className="p-4">
                  <p className={`text-xs font-medium mb-1 ${dark ? 'text-purple-400' : 'text-purple-600'}`}>{course.platform}</p>
                  <h4 className={`font-semibold text-sm mb-2 leading-snug ${dark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h4>
                  <div className={`flex items-center gap-3 text-xs mb-3 ${subtext}`}>
                    <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-yellow-400" /> {course.rating}</span>
                    <span>{course.duration}</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{course.price}</span>
                      {course.original && <span className={`text-xs line-through ml-2 ${subtext}`}>{course.original}</span>}
                    </div>
                    <button onClick={() => onNavigate('login')} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">Enroll</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={() => onNavigate('login')} className="flex items-center gap-2 mx-auto text-purple-400 hover:text-purple-300 font-medium transition-colors">
              View All Courses <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section id="opportunities" className={`py-20 px-8 ${dark ? 'bg-[#0d0d1a]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 border ${dark ? 'bg-orange-600/10 border-orange-500/30 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
              <Briefcase size={12} /> OPPORTUNITIES
            </div>
            <h2 className={`text-4xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Find Opportunities That{' '}
              <span className="bg-linear-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Shape Your Future</span>
            </h2>
            <p className={`max-w-xl mx-auto ${subtext}`}>Discover internships, full-time jobs, hackathons and scholarships tailored for students and freshers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { type: 'Internship', role: 'Frontend Developer Intern', company: 'Google', location: 'Bangalore, India', salary: '₹25,000/mo', color: 'bg-blue-600/20', iconColor: 'text-blue-400', tag: 'bg-blue-600/20 text-blue-300' },
              { type: 'Full Time', role: 'Data Scientist', company: 'Microsoft', location: 'Hyderabad, India', salary: '₹18 LPA', color: 'bg-purple-600/20', iconColor: 'text-purple-400', tag: 'bg-purple-600/20 text-purple-300' },
              { type: 'Hackathon', role: 'Smart India Hackathon 2025', company: 'Govt. of India', location: 'Pan India', salary: '₹1,00,000 Prize', color: 'bg-yellow-600/20', iconColor: 'text-yellow-400', tag: 'bg-yellow-600/20 text-yellow-300' },
              { type: 'Scholarship', role: 'Merit Scholarship Program', company: 'Tata Trust', location: 'All India', salary: '₹50,000/year', color: 'bg-green-600/20', iconColor: 'text-green-400', tag: 'bg-green-600/20 text-green-300' },
              { type: 'Internship', role: 'ML Engineer Intern', company: 'Amazon', location: 'Remote', salary: '₹30,000/mo', color: 'bg-orange-600/20', iconColor: 'text-orange-400', tag: 'bg-blue-600/20 text-blue-300' },
              { type: 'Full Time', role: 'Product Manager', company: 'Flipkart', location: 'Bangalore, India', salary: '₹22 LPA', color: 'bg-pink-600/20', iconColor: 'text-pink-400', tag: 'bg-purple-600/20 text-purple-300' },
            ].map((opp, i) => (
              <div key={i} className={`border rounded-2xl p-5 hover:border-purple-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 cursor-pointer group ${cardBg}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 ${opp.color} rounded-xl flex items-center justify-center`}>
                    <Briefcase size={20} className={opp.iconColor} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${opp.tag}`}>{opp.type}</span>
                </div>
                <h4 className={`font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{opp.role}</h4>
                <p className={`text-sm mb-3 ${subtext}`}>{opp.company} · {opp.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm font-semibold">{opp.salary}</span>
                  <button onClick={() => onNavigate('login')} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => onNavigate('login')} className="flex items-center gap-2 mx-auto text-purple-400 hover:text-purple-300 font-medium transition-colors">
              View All Opportunities <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border ${dark ? 'bg-purple-600/10 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                <Users size={12} /> ABOUT US
              </div>
              <h2 className={`text-4xl font-bold mb-5 ${dark ? 'text-white' : 'text-gray-900'}`}>
                Built for Students,{' '}
                <span className="bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Powered by AI</span>
              </h2>
              <p className={`text-lg mb-6 leading-relaxed ${subtext}`}>
                EchoMentor was built with one mission — to make quality education, career guidance and AI tools accessible to every student, everywhere.
              </p>
              <p className={`mb-8 leading-relaxed ${subtext}`}>
                We combine cutting-edge AI with a student-first approach to help you learn smarter, plan better, build faster and grow consistently — all in one platform.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Zap size={18} className="text-purple-400" />, bg: 'bg-purple-600/20', title: 'AI Powered', desc: '20+ intelligent tools' },
                  { icon: <Users size={18} className="text-blue-400" />, bg: 'bg-blue-600/20', title: 'Student First', desc: 'Built for learners' },
                  { icon: <Award size={18} className="text-green-400" />, bg: 'bg-green-600/20', title: 'Trusted', desc: '95% satisfaction rate' },
                  { icon: <Target size={18} className="text-orange-400" />, bg: 'bg-orange-600/20', title: 'Goal Oriented', desc: 'Track your progress' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${dark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center shrink-0`}>{item.icon}</div>
                    <div>
                      <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                      <p className={`text-xs ${subtext}`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate('signup')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-purple-600/30">
                Join EchoMentor <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" alt="Students" className="rounded-2xl object-cover h-48 w-full" />
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80" alt="Learning" className="rounded-2xl object-cover h-48 w-full mt-8" />
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80" alt="Team" className="rounded-2xl object-cover h-48 w-full -mt-4" />
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" alt="Tech" className="rounded-2xl object-cover h-48 w-full mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`rounded-3xl p-12 text-center relative overflow-hidden border ${dark ? 'bg-linear-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/20' : 'bg-linear-to-br from-purple-50 to-indigo-50 border-purple-200'}`}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.2),transparent)] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[CheckCircle, CheckCircle, CheckCircle].map((Icon, i) => (
                  <Icon key={i} size={18} className="text-purple-400" />
                ))}
              </div>
              <h2 className={`text-4xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
                Unlock Your Full Potential
              </h2>
              <p className={`mb-8 max-w-lg mx-auto ${subtext}`}>
                Join thousands of students already using EchoMentor to accelerate their learning, career and growth.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => onNavigate('signup')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-600/30">
                  Get Started for Free <ArrowRight size={20} />
                </button>
                <button onClick={() => onNavigate('login')} className={`px-8 py-4 rounded-xl text-lg font-semibold border transition-all ${dark ? 'border-white/20 text-white hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 px-8 ${dark ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Echo<span className="text-purple-500">Mentor</span></span>
          </div>
          <p className={`text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}>© 2025 EchoMentor. All rights reserved.</p>
          <div className={`flex items-center gap-6 text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Search, Bell, BookOpen, Star, Clock, Users } from 'lucide-react';

const allCourses = [
  { title: 'Data Structures & Algorithms', instructor: 'Dr. Rajesh Kumar', lessons: 45, duration: '30h', rating: 4.8, students: 12500, tags: ['Python', 'DSA'], color: 'bg-purple-600' },
  { title: 'Machine Learning Basics', instructor: 'Prof. Anita Singh', lessons: 32, duration: '25h', rating: 4.9, students: 8900, tags: ['Python', 'ML', 'NumPy'], color: 'bg-blue-600' },
  { title: 'Full Stack Web Development', instructor: 'Rahul Sharma', lessons: 60, duration: '45h', rating: 4.7, students: 15000, tags: ['React', 'Node.js', 'MongoDB'], color: 'bg-green-600' },
  { title: 'UI/UX Design Fundamentals', instructor: 'Priya Nair', lessons: 28, duration: '20h', rating: 4.6, students: 6700, tags: ['Figma', 'Design'], color: 'bg-orange-600' },
  { title: 'System Design Masterclass', instructor: 'Vikram Bose', lessons: 35, duration: '28h', rating: 4.8, students: 9200, tags: ['System Design', 'Architecture'], color: 'bg-red-600' },
  { title: 'DevOps & Cloud Computing', instructor: 'Amit Joshi', lessons: 40, duration: '32h', rating: 4.5, students: 7100, tags: ['Docker', 'AWS', 'CI/CD'], color: 'bg-cyan-600' },
];

const filters = ['All Courses', 'Enrolled', 'Completed', 'Python', 'Web Dev', 'ML/AI'];

export default function Courses() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Courses');
  const [enrolled, setEnrolled] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<Record<number, number>>({});

  const enroll = (i: number) => {
    setEnrolled(prev => { const s = new Set(prev); s.add(i); return s; });
    setProgress(prev => ({ ...prev, [i]: 0 }));
  };

  const continueLesson = (i: number) => {
    setProgress(prev => ({ ...prev, [i]: Math.min(100, (prev[i] ?? 0) + 10) }));
  };

  const filtered = allCourses.filter((c, i) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = activeFilter === 'All Courses'
      || (activeFilter === 'Enrolled' && enrolled.has(i))
      || (activeFilter === 'Completed' && (progress[i] ?? 0) >= 100)
      || c.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()));
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2"><BookOpen size={22} className="text-purple-400" /> Courses</h1>
          <p className="text-gray-500 text-sm">Learn new skills with expert-led courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 w-56">
            <Search size={15} className="text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="bg-transparent text-sm text-gray-400 placeholder-gray-600 focus:outline-none flex-1" />
          </div>
          <Bell size={18} className="text-gray-400" />
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">U</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${activeFilter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Enrolled courses */}
        {enrolled.size > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-semibold text-lg mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allCourses.map((c, i) => {
                if (!enrolled.has(i)) return null;
                const pct = progress[i] ?? 0;
                return (
                  <div key={i} className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer group">
                    <div className={`${c.color} h-24 flex items-center justify-center`}>
                      <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" alt="course" className="w-full h-full object-cover opacity-50" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-purple-300 transition-colors">{c.title}</h3>
                      <p className="text-gray-500 text-xs mb-2">{c.instructor}</p>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {c.tags.map(t => <span key={t} className="bg-white/5 text-gray-400 text-xs rounded-full px-2 py-0.5">{t}</span>)}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                        <div className={`${c.color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{pct}% complete</span>
                        <button onClick={() => continueLesson(i)} className="text-purple-400 text-xs font-medium hover:underline">
                          {pct >= 100 ? '✓ Completed' : 'Continue →'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All courses */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">
            {activeFilter === 'All Courses' ? 'All Courses' : activeFilter}
          </h2>
          {filtered.length === 0 ? (
            <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-12 text-center">
              <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80" alt="No courses" className="w-20 h-20 rounded-2xl object-cover opacity-40 mx-auto mb-4" />
              <p className="text-white font-semibold mb-1">No courses found</p>
              <p className="text-gray-500 text-sm">Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c, fi) => {
                const i = allCourses.indexOf(c);
                const isEnrolled = enrolled.has(i);
                return (
                  <div key={fi} className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer group">
                    <div className={`${c.color} h-24 flex items-center justify-center`}>
                      <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" alt="course" className="w-full h-full object-cover opacity-50" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-purple-300 transition-colors">{c.title}</h3>
                      <p className="text-gray-500 text-xs mb-2">{c.instructor}</p>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {c.tags.map(t => <span key={t} className="bg-white/5 text-gray-400 text-xs rounded-full px-2 py-0.5">{t}</span>)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><BookOpen size={10} /> {c.lessons} lessons</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {c.duration}</span>
                        <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" /> {c.rating}</span>
                        <span className="flex items-center gap-1"><Users size={10} /> {(c.students / 1000).toFixed(1)}K</span>
                      </div>
                      {isEnrolled ? (
                        <button onClick={() => continueLesson(i)} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                          Continue Learning
                        </button>
                      ) : (
                        <button onClick={() => enroll(i)} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Sparkles, Play, Bookmark, Plus, TrendingUp, Target, Zap, BookOpen, ChevronRight, Settings } from 'lucide-react';
import { Page } from '../types';

interface UserLearningProfile {
  careerGoal: string;
  interests: string[];
  learningStyle: string[];
  skillLevel: string;
  mainGoal: string;
}

interface Course {
  id: string;
  title: string;
  platform: string;
  difficulty: string;
  duration: string;
  rating: number;
  skills: string[];
  thumbnail: string;
  description: string;
}

interface CoursesDashboardProps {
  profile: UserLearningProfile;
  onResetProfile: () => void;
  onNavigate?: (page: Page) => void;
}

const recommendedCourses: Course[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    platform: 'freeCodeCamp',
    difficulty: 'Beginner',
    duration: '4 hours',
    rating: 4.8,
    skills: ['JavaScript', 'Programming'],
    thumbnail: '📚',
    description: 'Learn JavaScript basics from scratch'
  },
  {
    id: '2',
    title: 'React for Beginners',
    platform: 'YouTube',
    difficulty: 'Beginner',
    duration: '6 hours',
    rating: 4.7,
    skills: ['React', 'Frontend'],
    thumbnail: '⚛️',
    description: 'Master React fundamentals'
  },
  {
    id: '3',
    title: 'Web Design Principles',
    platform: 'Coursera',
    difficulty: 'Beginner',
    duration: '5 hours',
    rating: 4.6,
    skills: ['Design', 'UI/UX'],
    thumbnail: '🎨',
    description: 'Learn web design essentials'
  },
];

const roadmapSteps = [
  { step: 1, title: 'HTML & CSS Basics', status: 'completed' },
  { step: 2, title: 'JavaScript Fundamentals', status: 'in-progress' },
  { step: 3, title: 'React Basics', status: 'upcoming' },
  { step: 4, title: 'State Management', status: 'upcoming' },
  { step: 5, title: 'Backend Integration', status: 'upcoming' },
];

export default function CoursesDashboard({ profile, onResetProfile, onNavigate }: CoursesDashboardProps) {
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roadmap' | 'saved'>('dashboard');

  const toggleSaveCourse = (courseId: string) => {
    setSavedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="flex-1 bg-[#0f0f1e] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f1e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-white text-3xl font-bold flex items-center gap-2">
              <Sparkles size={28} className="text-purple-400" />
              Your Learning Journey
            </h1>
            <p className="text-gray-400 text-sm mt-1">AI-personalized courses for {profile.careerGoal}</p>
          </div>
          <button
            onClick={onResetProfile}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
          >
            <Settings size={16} /> Reset Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 px-8 border-t border-white/5">
          {['dashboard', 'roadmap', 'saved'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* AI Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                    <Zap size={24} className="text-yellow-400" />
                    Recommended For You
                  </h2>
                  <p className="text-gray-400 text-sm">Based on your profile</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCourses.map(course => (
                    <div
                      key={course.id}
                      className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group"
                    >
                      {/* Thumbnail */}
                      <div className="h-40 bg-linear-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                        {course.thumbnail}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-1">{course.title}</h3>
                            <p className="text-gray-400 text-sm">{course.platform}</p>
                          </div>
                          <button
                            onClick={() => toggleSaveCourse(course.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              savedCourses.includes(course.id)
                                ? 'bg-purple-600/20 text-purple-400'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            <Bookmark size={18} fill={savedCourses.includes(course.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <p className="text-gray-400 text-sm mb-4">{course.description}</p>

                        {/* Meta */}
                        <div className="flex items-center justify-between mb-4 text-sm">
                          <div className="flex gap-3">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">{course.difficulty}</span>
                            <span className="text-gray-400">{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-gray-300">{course.rating}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {course.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Button */}
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium">
                          <Play size={16} /> Start Learning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Learning */}
              <div>
                <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen size={24} className="text-blue-400" />
                  Continue Learning
                </h2>
                <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">JavaScript Fundamentals</h3>
                      <p className="text-gray-400 text-sm mb-4">You're 60% through this course</p>
                      <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/5 bg-linear-to-r from-blue-500 to-purple-500" />
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2">
                      <Play size={18} /> Continue
                    </button>
                  </div>
                </div>
              </div>

              {/* What Should I Learn Next */}
              <div>
                <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles size={24} className="text-purple-400" />
                  What Should I Learn Next?
                </h2>
                <div className="bg-linear-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-8">
                  <div className="space-y-4">
                    <p className="text-gray-300 text-lg">
                      Based on your goal to become a <span className="text-purple-300 font-semibold">{profile.careerGoal}</span>, here's what I recommend:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold flex-shrink-0">1</div>
                        <div>
                          <p className="text-white font-medium">Master JavaScript Fundamentals</p>
                          <p className="text-gray-400 text-sm">Essential for any developer role</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold flex-shrink-0">2</div>
                        <div>
                          <p className="text-white font-medium">Learn React or Vue</p>
                          <p className="text-gray-400 text-sm">Modern frontend framework</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold flex-shrink-0">3</div>
                        <div>
                          <p className="text-white font-medium">Build Real Projects</p>
                          <p className="text-gray-400 text-sm">Portfolio building is crucial</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Roadmap Tab */}
          {activeTab === 'roadmap' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-8 flex items-center gap-2">
                <Target size={24} className="text-green-400" />
                Your Learning Roadmap
              </h2>

              <div className="space-y-4">
                {roadmapSteps.map((item, index) => (
                  <div key={item.step} className="flex gap-6">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        item.status === 'completed'
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                          : item.status === 'in-progress'
                          ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500'
                          : 'bg-white/5 text-gray-400 border-2 border-white/10'
                      }`}>
                        {item.status === 'completed' ? '✓' : item.step}
                      </div>
                      {index < roadmapSteps.length - 1 && (
                        <div className={`w-1 h-16 mt-2 ${
                          item.status === 'completed' ? 'bg-green-500' : 'bg-white/10'
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2 pb-8">
                      <div className={`p-4 rounded-xl border-2 transition-all ${
                        item.status === 'completed'
                          ? 'bg-green-500/10 border-green-500/30'
                          : item.status === 'in-progress'
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold">{item.title}</h3>
                            <p className="text-gray-400 text-sm mt-1 capitalize">{item.status.replace('-', ' ')}</p>
                          </div>
                          {item.status === 'in-progress' && (
                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2">
                              <Play size={14} /> Continue
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-8">Saved Courses</h2>
              {savedCourses.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No saved courses yet</p>
                  <p className="text-gray-500 text-sm mt-2">Save courses to access them later</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCourses.filter(c => savedCourses.includes(c.id)).map(course => (
                    <div key={course.id} className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] border border-white/5 rounded-2xl p-6">
                      <div className="text-5xl mb-4">{course.thumbnail}</div>
                      <h3 className="text-white font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{course.platform}</p>
                      <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                        <Play size={16} /> Start Learning
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

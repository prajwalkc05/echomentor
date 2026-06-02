import { useState, useEffect } from 'react';
import { Search, Bell, BookOpen, Star, Clock, Users, Sparkles, Zap, TrendingUp, Award, Loader, ExternalLink, X, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { storage } from '../utils/storage';
import { fetchYouTubeCourses, recommendCourses } from '../services/youtubeCourseFetcher';
import CourseOnboarding from '../courses/CourseOnboarding';
import type { UserLearningProfile as OnboardingProfile } from '../courses/CourseOnboarding';

type UserLearningProfile = OnboardingProfile;

function getCareerLabel(goalId: string): string {
  const labels: Record<string, string> = {
    'frontend': 'Frontend Developer',
    'backend': 'Backend Developer',
    'fullstack': 'Full Stack Developer',
    'data-scientist': 'Data Scientist',
    'ml-engineer': 'ML Engineer',
    'devops': 'DevOps Engineer',
    'designer': 'UI/UX Designer',
    'product-manager': 'Product Manager',
    'entrepreneur': 'Entrepreneur',
    'student': 'Student',
  };
  return labels[goalId] || goalId;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  platform: string;
  platformIcon: string;
  thumbnail: string;
  difficulty: string;
  duration: string;
  rating: number;
  students: number;
  skills: string[];
  tags: string[];
  url: string;
  isFree: boolean;
  certificateAvailable: boolean;
  source: string;
  color?: string;
  lessons?: number;
}

interface CourseProgress {
  progress: number;
  status: 'not-started' | 'in-progress' | 'paused' | 'completed';
  watchedTime: number;
  lastWatchedAt: number;
  enrolledAt: number;
}

const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    'youtube': 'bg-red-600',
    'khan-academy': 'bg-blue-600',
    'freecodecamp': 'bg-green-600',
    'coursera': 'bg-indigo-600',
    'udemy': 'bg-purple-600'
  };
  return colors[platform] || 'bg-purple-600';
};

const mapAggregatedToCourse = (course: any): Course => ({
  ...course,
  color: getPlatformColor(course.platform),
  lessons: Math.floor(Math.random() * 50) + 10
});

const STORAGE_KEY_ENROLLED = 'enrolled_courses';
const STORAGE_KEY_PROGRESS = 'course_progress';

export default function Courses() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [userProfile, setUserProfile] = useState<UserLearningProfile | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [recommendedCourseIds, setRecommendedCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [watchTimer, setWatchTimer] = useState<NodeJS.Timeout | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load data from user-scoped storage on mount
  useEffect(() => {
    const savedEnrolled = storage.getJSON<string[]>(STORAGE_KEY_ENROLLED);
    const savedProgress = storage.getJSON<Record<string, CourseProgress>>(STORAGE_KEY_PROGRESS);
    if (savedEnrolled) setEnrolled(new Set(savedEnrolled));
    if (savedProgress) setProgress(savedProgress);
  }, []);

  // Persist enrolled courses to user-scoped storage
  useEffect(() => {
    storage.setJSON(STORAGE_KEY_ENROLLED, Array.from(enrolled));
  }, [enrolled]);

  // Persist progress to user-scoped storage
  useEffect(() => {
    storage.setJSON(STORAGE_KEY_PROGRESS, progress);
  }, [progress]);

  const loadCourses = async (profile: UserLearningProfile) => {
    setLoading(true);
    try {
      // Get current logged-in user ID to verify we're not loading other user's data
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token - cannot load courses');
        setLoading(false);
        return;
      }
      
      const allYoutubeCourses = await fetchYouTubeCourses(profile.careerGoal, profile.skillLevel);
      if (allYoutubeCourses.length > 0) {
        const mappedAll = allYoutubeCourses.map(mapAggregatedToCourse);
        const recommended = await recommendCourses(profile, allYoutubeCourses);
        const mappedRecommended = recommended.map(mapAggregatedToCourse);
        setRecommendedCourses(mappedRecommended);
        setRecommendedCourseIds(new Set(mappedRecommended.map(course => course.id)));
        setAllCourses(mappedAll);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const profile = storage.getJSON<UserLearningProfile>('userLearningProfile');
    if (profile) {
      setUserProfile(profile);
      loadCourses(profile);
    } else {
      setShowOnboarding(true);
      setLoading(false);
    }
  }, []);

  const handleOnboardingComplete = (profile: OnboardingProfile) => {
    setUserProfile(profile);
    setShowOnboarding(false);
    loadCourses(profile);
  };

  const enroll = (course: Course) => {
    setSelectedCourse(course);
    const now = Date.now();
    setEnrolled(prev => new Set([...prev, course.id]));
    setProgress(prev => ({
      ...prev,
      [course.id]: {
        progress: 0,
        status: 'in-progress',
        watchedTime: 0,
        lastWatchedAt: now,
        enrolledAt: now
      }
    }));
  };

  const pauseCourse = (courseId: string) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], status: 'paused' }
    }));
  };

  const resumeCourse = (courseId: string) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], status: 'in-progress', lastWatchedAt: Date.now() }
    }));
  };

  const resetCourse = (courseId: string) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: {
        progress: 0,
        status: 'in-progress',
        watchedTime: 0,
        lastWatchedAt: Date.now(),
        enrolledAt: progress[courseId]?.enrolledAt || Date.now()
      }
    }));
  };

  const openCoursePlayer = (course: Course) => {
    setSelectedCourse(course);
    setPlayerOpen(true);
    
    // Start tracking watch time
    if (enrolled.has(course.id)) {
      const timer = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          [course.id]: {
            ...prev[course.id],
            watchedTime: (prev[course.id]?.watchedTime || 0) + 1,
            lastWatchedAt: Date.now()
          }
        }));
      }, 1000); // Track every second
      
      setWatchTimer(timer);
    }
  };

  const closeCoursePlayer = () => {
    if (watchTimer) {
      clearInterval(watchTimer);
      setWatchTimer(null);
    }
    setPlayerOpen(false);
    // Auto-pause when closing player
    if (selectedCourse && enrolled.has(selectedCourse.id)) {
      pauseCourse(selectedCourse.id);
    }
    setSelectedCourse(null);
  };

  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPlatformInfo = (platform: string) => {
    const info: Record<string, { name: string; icon: string; color: string; description: string; bgGradient: string }> = {
      'youtube': {
        name: 'YouTube',
        icon: '▶️',
        color: 'text-red-600',
        bgGradient: 'from-red-600 to-red-700',
        description: 'Watch on YouTube - Free video tutorials and playlists'
      },
      'khan-academy': {
        name: 'Khan Academy',
        icon: '🎓',
        color: 'text-blue-600',
        bgGradient: 'from-blue-600 to-blue-700',
        description: 'Learn on Khan Academy - Structured lessons with exercises'
      },
      'freecodecamp': {
        name: 'freeCodeCamp',
        icon: '📚',
        color: 'text-green-600',
        bgGradient: 'from-green-600 to-green-700',
        description: 'Learn on freeCodeCamp - Comprehensive free curriculum'
      },
      'coursera': {
        name: 'Coursera',
        icon: '🎯',
        color: 'text-indigo-600',
        bgGradient: 'from-indigo-600 to-indigo-700',
        description: 'Learn on Coursera - Professional courses with certificates'
      },
      'udemy': {
        name: 'Udemy',
        icon: '🎬',
        color: 'text-purple-600',
        bgGradient: 'from-purple-600 to-purple-700',
        description: 'Learn on Udemy - Affordable paid courses'
      }
    };
    return info[platform] || info['youtube'];
  };

  // Get paused courses (for Continue Learning section)
  const pausedCourses = Array.from(enrolled)
    .map(id => allCourses.find(c => c.id === id))
    .filter(course => course && progress[course.id]?.status === 'paused') as Course[];

  const filters = ['All', 'Enrolled', 'Completed', ...new Set(allCourses.flatMap(c => c.tags)), ...new Set(allCourses.map(c => c.platform))];

  const filtered = allCourses.filter(c => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Enrolled' && enrolled.has(c.id)) ||
      (activeFilter === 'Completed' && (progress[c.id]?.progress ?? 0) >= 100) ||
      c.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase())) ||
      c.platform === activeFilter;
    return matchSearch && matchFilter;
  });

  const orderedCourses = filtered
    .slice()
    .sort((a, b) => {
      const aPreferred = recommendedCourseIds.has(a.id) ? 0 : 1;
      const bPreferred = recommendedCourseIds.has(b.id) ? 0 : 1;
      if (aPreferred !== bPreferred) return aPreferred - bPreferred;
      return b.title.localeCompare(a.title);
    });

  if (showOnboarding) {
    return (
      <CourseOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={() => { setShowOnboarding(false); setLoading(false); }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            <BookOpen size={22} className="text-purple-400" />
            {userProfile?.careerGoal ? `${getCareerLabel(userProfile.careerGoal)} Learning Path` : 'Courses'}
          </h1>
          <p className="text-gray-500 text-sm">
            {userProfile?.careerGoal
              ? 'AI-personalized YouTube courses for your career'
              : 'Learn new skills with expert-led courses.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 w-56">
            <Search size={15} className="text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="bg-transparent text-sm text-gray-400 placeholder-gray-600 focus:outline-none flex-1"
            />
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            title="Set up learning profile"
            className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <Settings size={14} /> {userProfile ? 'Update Profile' : 'Set Up Profile'}
          </button>
          <Bell size={18} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader size={32} className="text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading YouTube courses...</p>
            </div>
          </div>
        )}
        {!loading && (
          <>
            {/* AI Recommendations Section */}
            {userProfile?.careerGoal && recommendedCourses.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-400" />
                    Recommended For You
                  </h2>
                  <p className="text-gray-400 text-sm">Based on your {userProfile.careerGoal} goal</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recommendedCourses.slice(0, 3).map(course => {
                    const isEnrolled = enrolled.has(course.id);
                    return (
                      <div
                        key={course.id}
                        className="bg-linear-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
                      >
                        {/* Course Thumbnail Image */}
                        <div className="relative w-full h-32 bg-[#18182f] overflow-hidden">
                          <img
                            src={course.thumbnail}
                            alt={course.title + ' thumbnail'}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Platform color bar at bottom of image */}
                          <div className={`${course.color} absolute bottom-0 left-0 w-full h-2 opacity-80`} />
                          {/* Sparkles icon overlay */}
                          <span className="absolute top-2 left-2 text-3xl z-10">✨</span>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors flex-1">
                              {course.title}
                            </h3>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                              AI Pick
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mb-2">{course.instructor}</p>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {course.tags.slice(0, 2).map(t => (
                              <span key={t} className="bg-white/5 text-gray-400 text-xs rounded-full px-2 py-0.5">
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star size={10} className="text-yellow-400" /> {course.rating}
                            </span>
                          </div>
                          {isEnrolled ? (
                            <button
                              onClick={() => openCoursePlayer(course)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <Play size={12} /> Continue
                            </button>
                          ) : (
                            <button
                              onClick={() => enroll(course)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* What Should I Learn Next */}
            {userProfile?.careerGoal && recommendedCourses.length > 0 && (
              <div className="mb-8">
                <div className="bg-linear-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400" />
                    What Should I Learn Next?
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Based on your goal to become a <span className="text-purple-300 font-semibold">{getCareerLabel(userProfile.careerGoal)}</span>:
                  </p>
                  <div className="space-y-3">
                    {recommendedCourses.slice(0, 3).map((course, idx) => (
                      <div key={course.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{course.title}</p>
                          <p className="text-gray-400 text-xs mt-1">Learn {course.skills.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            {filters.length > 3 && (
              <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-2">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                      activeFilter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {/* Paused Courses - Continue Learning Section */}
            {pausedCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-orange-400" />
                  Continue Learning (Paused)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pausedCourses.map(course => {
                    const courseProgress = progress[course.id];
                    const pct = courseProgress?.progress ?? 0;
                    return (
                      <div
                        key={course.id}
                        className="bg-[#1a1a2e] border border-orange-500/30 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer group"
                      >
                        <div className={`${course.color} h-24 flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                          <Pause size={32} className="text-white opacity-60" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-orange-300 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-gray-500 text-xs mb-2">{course.instructor}</p>
                          
                          {/* Watch Time */}
                          <p className="text-gray-400 text-xs mb-2">
                            ⏱️ Watched: {formatWatchTime(courseProgress?.watchedTime || 0)}
                          </p>

                          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                            <div
                              className={`${course.color} h-1.5 rounded-full transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{pct}% complete</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => resumeCourse(course.id)}
                              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <Play size={12} /> Resume
                            </button>
                            <button
                              onClick={() => resetCourse(course.id)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <RotateCcw size={12} /> Restart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Courses - Currently Learning Section */}
            {enrolled.size > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" />
                  Currently Learning
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {allCourses.map(course => {
                    if (!enrolled.has(course.id)) return null;
                    const courseProgress = progress[course.id];
                    if (!courseProgress || courseProgress.status === 'paused') return null;
                    
                    const pct = courseProgress.progress ?? 0;
                    return (
                      <div
                        key={course.id}
                        className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all cursor-pointer group"
                      >
                        <div className={`${course.color} h-24 flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                          <Play size={32} className="text-white opacity-60" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-green-300 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-gray-500 text-xs mb-2">{course.instructor}</p>

                          {/* Watch Time */}
                          <p className="text-gray-400 text-xs mb-2">
                            ⏱️ Watched: {formatWatchTime(courseProgress?.watchedTime || 0)}
                          </p>

                          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                            <div
                              className={`${course.color} h-1.5 rounded-full transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{pct}% complete</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openCoursePlayer(course)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <Play size={12} /> Continue
                            </button>
                            <button
                              onClick={() => pauseCourse(course.id)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <Pause size={12} /> Pause
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Courses / Empty State */}
            <div>
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Award size={20} className="text-blue-400" />
                {activeFilter === 'All' ? 'All Courses' : activeFilter}
              </h2>
              {allCourses.length === 0 ? (
                <div className="bg-linear-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} className="text-purple-400" />
                  </div>
                  <p className="text-white font-semibold mb-2">No Courses Available Yet</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Set up your learning profile to get AI-personalized YouTube course recommendations.
                  </p>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    <Sparkles size={16} /> Set Up Learning Profile
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {orderedCourses.map(course => {
                    const isEnrolled = enrolled.has(course.id);
                    return (
                      <div
                        key={course.id}
                        className={`bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group relative focus:outline-none focus:ring-2 focus:ring-purple-500 ${!isEnrolled && 'hover:shadow-lg'}`}
                        tabIndex={0}
                        onClick={e => {
                          // Prevent button click from bubbling
                          if ((e.target as HTMLElement).tagName !== 'BUTTON') setSelectedCourse(course);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') setSelectedCourse(course);
                        }}
                        aria-label={`View details for ${course.title}`}
                      >
                        {/* Course Thumbnail Image */}
                        <div className="relative w-full h-32 bg-[#18182f] overflow-hidden">
                          <img
                            src={course.thumbnail}
                            alt={course.title + ' thumbnail'}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        {/* Progress Ring for Enrolled */}
                          {enrolled.has(course.id) && (
                            <svg className="absolute top-2 right-2 w-8 h-8 z-20" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" stroke="#22223b" strokeWidth="4" />
                              <circle
                                cx="18" cy="18" r="16"
                                fill="none"
                                stroke={progress[course.id]?.status === 'paused' ? '#fb923c' : '#a78bfa'}
                                strokeWidth="4"
                                strokeDasharray={100}
                                strokeDashoffset={100 - (progress[course.id]?.progress ?? 0)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
                              />
                              <text x="18" y="22" textAnchor="middle" fontSize="10" fill="#fff">{progress[course.id]?.progress ?? 0}%</text>
                            </svg>
                          )}
                          {/* Platform color bar at bottom of image */}
                          <div className={`${course.color} absolute bottom-0 left-0 w-full h-2 opacity-80`} />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-purple-300 transition-colors flex-1">
                              {course.title}
                            </h3>
                            <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                              {course.platform}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mb-2">{course.instructor}</p>
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {course.tags.slice(0, 2).map(t => (
                              <span key={t} className="bg-white/5 text-gray-400 text-xs rounded-full px-2 py-0.5">
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star size={10} className="text-yellow-400" /> {course.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={10} /> {(course.students / 1000).toFixed(1)}K
                            </span>
                          </div>
                          {/* Smart AI Label with Tooltip */}
                          <div className="mb-2 flex flex-wrap gap-1">
                            {isEnrolled ? (
                              <span className="inline-block bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full mr-2 animate-pulse" title="You are enrolled in this course">Enrolled</span>
                            ) : recommendedCourseIds.has(course.id) ? (
                              <span className="inline-block bg-purple-600/20 text-purple-300 text-xs px-2 py-0.5 rounded-full mr-2 animate-fade-in" title="AI picked this course for your goal">AI Pick for your goal</span>
                            ) : null}
                            {course.certificateAvailable && (
                              <span className="inline-block bg-blue-600/20 text-blue-300 text-xs px-2 py-0.5 rounded-full" title="Certificate available">Certificate</span>
                            )}
                            {course.isFree && (
                              <span className="inline-block bg-yellow-600/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full ml-2" title="This course is free">Free</span>
                            )}
                          </div>
                          {isEnrolled ? (
                            <button
                              onClick={e => { e.stopPropagation(); openCoursePlayer(course); }}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors shadow-md hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-1"
                            >
                              <Play size={12} /> Continue Learning
                            </button>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); enroll(course); }}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors shadow-md hover:scale-[1.03] active:scale-95"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                        {/* Hover Preview Overlay */}
                        <div className="absolute inset-0 bg-[#18182f]/95 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-center items-center p-6 text-center pointer-events-none">
                          <h4 className="text-white text-base font-bold mb-2">{course.title}</h4>
                          <p className="text-gray-300 text-xs mb-3 line-clamp-3">{course.description}</p>
                          <div className="flex flex-wrap gap-2 justify-center mb-2">
                            {course.skills.slice(0, 3).map(skill => (
                              <span key={skill} className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">{skill}</span>
                            ))}
                          </div>
                          <p className="text-gray-400 text-xs mb-1">After this course you can:</p>
                          <ul className="text-gray-200 text-xs space-y-1 mb-2">
                            {course.skills.slice(0, 2).map((skill, i) => (
                              <li key={i}>• {`Build with ${skill}`}</li>
                            ))}
                          </ul>
                          <span className="inline-block bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full">Preview</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Course Player Modal */}
      {playerOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`bg-linear-to-r ${getPlatformInfo(selectedCourse.platform).bgGradient} p-6 relative`}>
              <button
                onClick={closeCoursePlayer}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-10"
              >
                <X size={20} className="text-white" />
              </button>
              <div className="flex items-start gap-4">
                <div className="text-5xl">{getPlatformInfo(selectedCourse.platform).icon}</div>
                <div className="flex-1">
                  <h2 className="text-white text-2xl font-bold mb-2">{selectedCourse.title}</h2>
                  <p className="text-white/80 text-sm">{getPlatformInfo(selectedCourse.platform).description}</p>
                </div>
              </div>
            </div>

            {/* Player Content */}
            <div className="p-6 space-y-6">
              {/* Video Embed Section */}
              <div className="bg-black rounded-xl overflow-hidden aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(selectedCourse.url)}`}
                  title={selectedCourse.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Watch Time & Progress Tracking */}
              {enrolled.has(selectedCourse.id) && progress[selectedCourse.id] && (
                <div className="bg-linear-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Watch Time</p>
                      <p className="text-white font-bold text-lg">{formatWatchTime(progress[selectedCourse.id].watchedTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Progress</p>
                      <p className="text-white font-bold text-lg">{progress[selectedCourse.id].progress}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <p className="text-white font-bold text-lg capitalize">{progress[selectedCourse.id].status}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`${selectedCourse.color} h-2 rounded-full transition-all`}
                        style={{ width: `${progress[selectedCourse.id].progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Course Details */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink size={18} className="text-purple-400" />
                  Course Information
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Instructor</p>
                    <p className="text-white font-semibold">{selectedCourse.instructor}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Duration</p>
                    <p className="text-white font-semibold">{selectedCourse.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Difficulty</p>
                    <p className="text-white font-semibold">{selectedCourse.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <p className="text-white font-semibold">{selectedCourse.rating}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-2">About This Course</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedCourse.description}</p>
              </div>

              {/* Skills */}
              {selectedCourse.skills.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Skills You'll Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.skills.map(skill => (
                      <span key={skill} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <a
                  href={selectedCourse.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Open on {getPlatformInfo(selectedCourse.platform).name}
                  <ExternalLink size={18} />
                </a>
                {enrolled.has(selectedCourse.id) && progress[selectedCourse.id]?.status === 'in-progress' && (
                  <button
                    onClick={() => pauseCourse(selectedCourse.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Pause size={18} /> Pause
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}


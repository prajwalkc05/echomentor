import { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { userService } from '../services/api.service';

interface CourseOnboardingProps {
  onComplete: (profile: UserLearningProfile) => void;
  onSkip: () => void;
}

export interface UserLearningProfile {
  careerGoal: string;
  interests: string[];
  learningStyle: string;
  skillLevel: string;
  mainGoal: string;
}

const CAREER_GOALS = [
  { id: 'frontend', label: 'Frontend Developer', icon: '🎨' },
  { id: 'backend', label: 'Backend Developer', icon: '⚙️' },
  { id: 'fullstack', label: 'Full Stack Developer', icon: '🔗' },
  { id: 'data-scientist', label: 'Data Scientist', icon: '📊' },
  { id: 'ml-engineer', label: 'ML Engineer', icon: '🤖' },
  { id: 'devops', label: 'DevOps Engineer', icon: '☁️' },
  { id: 'designer', label: 'UI/UX Designer', icon: '✨' },
  { id: 'product-manager', label: 'Product Manager', icon: '📱' },
  { id: 'entrepreneur', label: 'Entrepreneur', icon: '🚀' },
  { id: 'student', label: 'Student (Exam Prep)', icon: '📚' },
];

const INTERESTS = [
  'Programming', 'Mathematics', 'Biology', 'Physics', 'Business',
  'Finance', 'Marketing', 'Design', 'Communication', 'AI',
  'Health', 'Languages', 'Government Exams', 'UPSC', 'NEET', 'JEE'
];

const LEARNING_STYLES = [
  { id: 'videos', label: 'Videos', desc: 'Learn through video tutorials' },
  { id: 'interactive', label: 'Interactive Practice', desc: 'Hands-on coding & exercises' },
  { id: 'reading', label: 'Reading Notes', desc: 'Articles, docs & books' },
  { id: 'projects', label: 'Projects', desc: 'Build real-world projects' },
  { id: 'short-lessons', label: 'Short Lessons', desc: 'Quick bite-sized content' },
  { id: 'visual', label: 'Visual Diagrams', desc: 'Infographics & flowcharts' },
  { id: 'quizzes', label: 'Quizzes', desc: 'Test your knowledge' },
  { id: 'live', label: 'Live Practice', desc: 'Real-time sessions' },
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const MAIN_GOALS = [
  'Get a Job', 'Pass Exams', 'Learn a Skill', 'Career Switch',
  'Build Projects', 'Freelancing', 'Start Business', 'Improve Knowledge'
];

export default function CourseOnboarding({ onComplete, onSkip }: CourseOnboardingProps) {
  const [step, setStep] = useState(1);
  const [careerGoal, setCareerGoal] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [mainGoal, setMainGoal] = useState('');

  const totalSteps = 5;

  const canNext = () => {
    if (step === 1) return careerGoal !== '';
    if (step === 2) return interests.length > 0;
    if (step === 3) return learningStyle !== '';
    if (step === 4) return skillLevel !== '';
    if (step === 5) return mainGoal !== '';
    return true;
  };

  const handleComplete = async () => {
    const profile: UserLearningProfile = {
      careerGoal,
      interests,
      learningStyle,
      skillLevel,
      mainGoal,
    };

    // Check if career goal changed — if so, clear stale course data
    const existing = storage.getJSON<UserLearningProfile>('userLearningProfile');
    if (existing?.careerGoal !== careerGoal) {
      storage.remove('enrolled_courses');
      storage.remove('course_progress');
    }

    storage.setJSON('userLearningProfile', profile);
    
    try {
      await userService.saveCourseOnboarding(profile);
    } catch (err) {
      console.error('Failed to save course onboarding:', err);
    }
    
    onComplete(profile);
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const chipClass = (selected: boolean) =>
    `px-3 py-2 rounded-xl text-sm border cursor-pointer transition-all select-none ${
      selected
        ? 'bg-purple-600 border-purple-500 text-white'
        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-600/30">
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Personalize Your Learning</h1>
          <p className="text-gray-400">Let's find the perfect learning path for you</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-purple-600' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-2xl p-8">
          {/* Step 1 — Career Goal */}
          {step === 1 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What would you like to become?</h2>
              <p className="text-gray-500 text-sm mb-6">Choose your career goal or select "Other" for custom paths</p>
              <div className="grid grid-cols-2 gap-3">
                {CAREER_GOALS.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setCareerGoal(goal.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      careerGoal === goal.id
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <p className="font-semibold text-sm">{goal.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Interests */}
          {step === 2 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What subjects interest you?</h2>
              <p className="text-gray-500 text-sm mb-6">Select multiple interests to get better recommendations</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={chipClass(interests.includes(interest))}
                  >
                    {interests.includes(interest) && <CheckCircle size={12} className="inline mr-1" />}
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Learning Style */}
          {step === 3 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">How do you prefer to learn?</h2>
              <p className="text-gray-500 text-sm mb-6">We'll tailor recommendations to your learning style</p>
              <div className="grid grid-cols-2 gap-3">
                {LEARNING_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setLearningStyle(style.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      learningStyle === style.id
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40'
                    }`}
                  >
                    <p className="font-semibold text-sm">{style.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Skill Level */}
          {step === 4 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What's your current level?</h2>
              <p className="text-gray-500 text-sm mb-6">This helps us recommend the right difficulty</p>
              <div className="grid grid-cols-3 gap-3">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setSkillLevel(level)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      skillLevel === level
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40'
                    }`}
                  >
                    <p className="font-semibold text-sm">{level}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — Main Goal */}
          {step === 5 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What's your main goal?</h2>
              <p className="text-gray-500 text-sm mb-6">This helps us prioritize your learning path</p>
              <div className="flex flex-wrap gap-2">
                {MAIN_GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => setMainGoal(goal)}
                    className={chipClass(mainGoal === goal)}
                  >
                    {mainGoal === goal && <CheckCircle size={12} className="inline mr-1" />}
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => (step > 1 ? setStep(s => s - 1) : onSkip())}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={16} /> {step === 1 ? 'Skip' : 'Back'}
            </button>

            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-xs">{step} of {totalSteps}</span>
              {step < totalSteps ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!canNext()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Start Learning <Sparkles size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

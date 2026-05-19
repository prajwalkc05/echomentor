import { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { Page } from '../types';
import { useUser } from '../context/UserContext';
import { userService } from '../services/api.service';
import { storage } from '../utils/storage';

interface OnboardingProps {
  onNavigate: (page: Page) => void;
}

const INTERESTS = ['AI & Machine Learning', 'Web Development', 'Data Science', 'Mobile Apps', 'Cybersecurity', 'Cloud Computing', 'UI/UX Design', 'Blockchain', 'Game Development', 'DevOps'];
const GOALS = ['Get a Job', 'Start a Startup', 'Freelancing', 'Higher Education', 'Skill Upgrade', 'Career Switch', 'Build Projects', 'Research'];
const EDUCATION_LEVELS = ['High School', 'Diploma', 'Bachelor\'s (Ongoing)', 'Bachelor\'s (Completed)', 'Master\'s (Ongoing)', 'Master\'s (Completed)', 'PhD', 'Self-taught'];
const SKILLS = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'Machine Learning', 'Figma', 'Flutter', 'AWS', 'Docker', 'Git', 'TypeScript', 'MongoDB'];
const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual', desc: 'Videos, diagrams & infographics', icon: '🎨' },
  { id: 'reading', label: 'Reading', desc: 'Articles, docs & books', icon: '📖' },
  { id: 'hands-on', label: 'Hands-on', desc: 'Projects & coding practice', icon: '💻' },
  { id: 'structured', label: 'Structured', desc: 'Courses with clear path', icon: '📋' },
];

export default function Onboarding({ onNavigate }: OnboardingProps) {
  const { user, updateUser } = useUser();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('');
  const [saving, setSaving] = useState(false);

  const totalSteps = 5;

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const canNext = () => {
    if (step === 1) return interests.length > 0;
    if (step === 2) return goals.length > 0;
    if (step === 3) return education !== '';
    if (step === 4) return skills.length > 0;
    if (step === 5) return learningStyle !== '';
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const onboardingData = { interests, goals, education, skills, learningStyle };
      storage.setJSON('echomentorOnboarding', onboardingData);
      updateUser({ role: goals[0] || 'Student' });
      const token = localStorage.getItem('authToken');
      console.log('Saving onboarding, token exists:', !!token);
      await userService.saveOnboarding(onboardingData);
      console.log('Onboarding saved successfully');
    } catch (err) {
      console.error('Onboarding save failed:', err);
    } finally {
      setSaving(false);
      onNavigate('dashboard');
    }
  };

  const chipClass = (selected: boolean) =>
    `px-3 py-2 rounded-xl text-sm border cursor-pointer transition-all select-none ${
      selected
        ? 'bg-purple-600 border-purple-500 text-white'
        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-600/30">
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Set Up Your Profile</h1>
          <p className="text-gray-400 text-sm">Help us personalize your EchoMentor experience</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-purple-600' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-8">

          {/* Step 1 — Interests */}
          {step === 1 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What are your interests?</h2>
              <p className="text-gray-500 text-sm mb-5">Select all that apply. We'll recommend content based on these.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(item => (
                  <button key={item} onClick={() => toggle(interests, item, setInterests)} className={chipClass(interests.includes(item))}>
                    {interests.includes(item) && <CheckCircle size={12} className="inline mr-1" />}{item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Goals */}
          {step === 2 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What are your career goals?</h2>
              <p className="text-gray-500 text-sm mb-5">We'll suggest opportunities and study plans based on your goals.</p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(item => (
                  <button key={item} onClick={() => toggle(goals, item, setGoals)} className={chipClass(goals.includes(item))}>
                    {goals.includes(item) && <CheckCircle size={12} className="inline mr-1" />}{item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Education */}
          {step === 3 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What's your education level?</h2>
              <p className="text-gray-500 text-sm mb-5">This helps us recommend the right level of content for you.</p>
              <div className="grid grid-cols-2 gap-2">
                {EDUCATION_LEVELS.map(item => (
                  <button key={item} onClick={() => setEducation(item)} className={`p-3 rounded-xl text-sm border text-left transition-all ${education === item ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'}`}>
                    {education === item && <CheckCircle size={12} className="inline mr-1.5" />}{item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Skills */}
          {step === 4 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">What skills do you have?</h2>
              <p className="text-gray-500 text-sm mb-5">Select your current skills so we can build on them.</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(item => (
                  <button key={item} onClick={() => toggle(skills, item, setSkills)} className={chipClass(skills.includes(item))}>
                    {skills.includes(item) && <CheckCircle size={12} className="inline mr-1" />}{item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — Learning Style */}
          {step === 5 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">How do you prefer to learn?</h2>
              <p className="text-gray-500 text-sm mb-5">We'll tailor your learning path to match your style.</p>
              <div className="grid grid-cols-2 gap-3">
                {LEARNING_STYLES.map(item => (
                  <button key={item.id} onClick={() => setLearningStyle(item.id)} className={`p-4 rounded-xl border text-left transition-all ${learningStyle === item.id ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/40'}`}>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className={`font-semibold text-sm ${learningStyle === item.id ? 'text-white' : 'text-gray-300'}`}>{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(s => s - 1) : onNavigate('dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={16} /> {step === 1 ? 'Skip for now' : 'Back'}
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
                  onClick={handleFinish}
                  disabled={!canNext() || saving}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <>Finish Setup <Sparkles size={16} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User greeting */}
        {user.name && (
          <p className="text-center text-gray-600 text-xs mt-4">Setting up for <span className="text-purple-400">{user.name}</span></p>
        )}
      </div>
    </div>
  );
}

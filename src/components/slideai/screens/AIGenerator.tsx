import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Settings, Layers, Target, Users, Palette, ChevronDown, Clock, FileText, Presentation, Trash2 } from 'lucide-react';
import { usePresentationStore } from '../../../store/slideai/presentationStore';
import { generateWithAI } from '../../../services/slideai/aiGenerationService';
import { themes } from '../../../templates/slideai/themes';
import type { ThemeId, Presentation as PresentationType } from '../../../types/slideai';
import toast from 'react-hot-toast';
import { pptService } from '../../../services/api.service';
import {
  getRecentPresentations,
  loadPresentationById,
  storedToPresentation,
  deletePresentationFromStorage,
  clearAllPresentations,
} from '../../../services/slideai/presentationPersistence';

const TONES = ['professional', 'creative', 'academic', 'startup', 'minimal'] as const;
const AUDIENCES = ['executive', 'technical', 'academic', 'general', 'students'] as const;
const TYPES = [
  { value: 'business', label: '💼 Business Pitch' },
  { value: 'cybersecurity', label: '🔐 Cybersecurity AI' },
  { value: 'research', label: '🔬 Research Paper' },
  { value: 'education', label: '📚 Education' },
  { value: 'pitch', label: '🚀 Startup Pitch' },
  { value: 'tech', label: '⚡ Tech Presentation' },
] as const;

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  icon?: React.ReactNode;
  dark?: boolean;
}

function SelectField({ value, onChange, options, label, icon }: SelectProps) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
        {icon} {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl font-semibold text-sm cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(124,58,237,0.2)',
            color: '#fff',
            padding: '12px 40px 12px 16px',
            outline: 'none',
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: '#1a1a2e', color: '#fff' }}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
      </div>
    </div>
  );
}

// Generation loading animation
function GenerationLoader({ progress, step }: { progress: number; step: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute"
          style={{ top: '20%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto px-6">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                width: 100,
                height: 100,
                border: '2px solid transparent',
                borderTopColor: '#7c3aed',
                borderRightColor: '#a78bfa',
                margin: -10,
              }}
            />
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 80, height: 80, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles size={32} color="#7c3aed" />
              </motion.div>
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', marginBottom: 8 }}>
          Creating Your Presentation
        </h2>
        <p style={{ color: '#7c3aed', fontSize: 15, fontWeight: 600, marginBottom: 32 }}>
          {step}
        </p>

        <div className="relative mb-4">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                boxShadow: '0 0 10px rgba(124,58,237,0.5)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div
            className="absolute right-0 -top-6 text-xs font-bold"
            style={{ color: '#7c3aed' }}
          >
            {progress}%
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-8">
          {['Analyzing', 'Structuring', 'Generating', 'Styling'].map((s, i) => (
            <div
              key={s}
              className="rounded-xl py-2 text-xs font-semibold"
              style={{
                background: progress >= (i + 1) * 25 ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${progress >= (i + 1) * 25 ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: progress >= (i + 1) * 25 ? '#7c3aed' : 'rgba(255,255,255,0.3)',
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIGenerator() {
  const { setCurrentScreen, generationConfig, setGenerationConfig, setCurrentPresentation, addPresentation, setGenerating, setGenerationProgress, isGenerating, generationProgress, generationStep } = usePresentationStore();

  const [topic, setTopic] = useState(generationConfig.topic || '');
  const [description, setDescription] = useState(generationConfig.description || '');
  const [slideContent, setSlideContent] = useState('');
  const [generationMode, setGenerationMode] = useState<'auto' | 'manual'>('auto');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyCleared, setHistoryCleared] = useState(false);

  useEffect(() => {
    if (!historyCleared) fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);

      const localItems = getRecentPresentations(15).map((p) => ({
        _id: p.id,
        topic: p.title,
        description: p.thumbnail,
        slideCount: p.slideCount,
        theme: p.template,
        updatedAt: p.updatedAt,
        isLocal: true,
        hasSlides: true,
      }));

      let backendItems: any[] = [];
      try {
        const response = await pptService.getHistory();
        if (Array.isArray(response)) {
          backendItems = response;
        } else if (response && Array.isArray(response.data)) {
          backendItems = response.data;
        } else if (response && Array.isArray(response.history)) {
          backendItems = response.history;
        }
      } catch {
        // backend optional — local history still works
      }

      const seen = new Set<string>();
      const merged = [...localItems, ...backendItems].filter((item) => {
        const id = item._id || item.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      merged.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
      );

      setHistory(merged);
    } catch (error: any) {
      setHistoryError(error.message || 'Failed to load history');
      setHistory(getRecentPresentations(10).map((p) => ({
        _id: p.id,
        topic: p.title,
        slideCount: p.slideCount,
        isLocal: true,
        hasSlides: true,
      })));
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadFromHistory = async (item: any) => {
    const id = item._id || item.id;
    const stored = id ? loadPresentationById(id) : null;

    if (stored?.slides?.length) {
      const presentation = storedToPresentation(stored);
      addPresentation(presentation);
      setCurrentPresentation(presentation);
      setCurrentScreen('editor');
      toast.success('Presentation restored!', { icon: '📂' });
      return;
    }

    const config = {
      topic: item.topic || '',
      description: item.description || '',
      slideContent: item.slideContent || '',
      slideCount: item.slideCount || item.slides || 12,
      theme: (item.theme as ThemeId) || 'future-neon',
      presentationType: item.presentationType || 'business',
      tone: item.tone || 'professional',
      audience: item.audience || 'executive',
      includeImages: true,
    };

    setGenerationConfig(config);
    setGenerating(true);
    setGenerationProgress(0, 'Regenerating presentation (no saved slides)...');

    try {
      const slides = await generateWithAI(config, (p, step) => {
        setGenerationProgress(p, step);
      });

      const presentation: PresentationType = {
        id: id || Math.random().toString(36).substr(2, 9),
        title: config.topic,
        description: config.description,
        theme: config.theme,
        slides,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addPresentation(presentation);
      setCurrentPresentation(presentation);
      setGenerating(false);
      setCurrentScreen('editor');
      toast.success('Presentation regenerated!', { icon: '📂' });
    } catch {
      setGenerating(false);
      toast.error('Failed to restore presentation.');
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    setHistoryCleared(true);
    clearAllPresentations();
    try {
      await pptService.clearHistory();
    } catch {
      // backend optional
    }
    toast.success('History cleared!');
  };

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item._id !== id));
    deletePresentationFromStorage(id);
    try {
      await pptService.deleteOne(id);
    } catch {
      // silently fail, UI already updated
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for your presentation');
      return;
    }

    if (generationMode === 'manual' && !slideContent.trim()) {
      toast.error('Please provide slide content to generate the presentation');
      return;
    }

    try {
      const config = { 
        ...generationConfig, 
        topic: topic.trim(), 
        description: description.trim(),
        slideContent: generationMode === 'auto' ? '' : slideContent.trim()
      };
      setGenerationConfig(config);
      setGenerating(true);
      setGenerationProgress(0, 'Starting AI generation...');

      const slides = await generateWithAI(config, (p, step) => {
        setGenerationProgress(p, step);
      });

      const presentation: PresentationType = {
        id: Math.random().toString(36).substr(2, 9),
        title: topic,
        description: description,
        theme: config.theme,
        slides,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addPresentation(presentation);
      setCurrentPresentation(presentation);
      setGenerating(false);
      setCurrentScreen('editor');
      toast.success('Presentation generated successfully!', { icon: '🎉' });
    } catch (error) {
      console.error('Generation error:', error);
      setGenerating(false);
      toast.error('Generation failed. Please try again.');
    }
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-50">
        <GenerationLoader progress={generationProgress} step={generationStep} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1e' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#7c3aed' }}
            >
              <Sparkles size={14} /> AI Powered
            </div>
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 8 }}>
            AI Presentation Generator
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>
            Create professional presentations with AI - just provide your topic name or content outline
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              
              {/* Generation Mode Toggle */}
              <div
                className="rounded-2xl p-4 mb-6 flex gap-3"
                style={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <button
                  onClick={() => setGenerationMode('auto')}
                  className="flex-1 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: generationMode === 'auto' ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    border: generationMode === 'auto' ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Sparkles size={16} /> AI Auto-Generate
                </button>
                <button
                  onClick={() => setGenerationMode('manual')}
                  className="flex-1 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: generationMode === 'manual' ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    border: generationMode === 'manual' ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Layers size={16} /> Manual Outline
                </button>
              </div>

              {/* Topic & Content */}
              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <label className="flex items-center gap-2 mb-3" style={{ color: '#7c3aed', fontSize: 14, fontWeight: 700 }}>
                  <Sparkles size={16} /> Presentation Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Introduction to Artificial Intelligence"
                  className="w-full rounded-xl text-white placeholder-gray-500 font-medium text-base mb-5"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    padding: '14px 18px',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.border = '1px solid rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={(e) => { e.target.style.border = '1px solid rgba(124,58,237,0.3)'; e.target.style.boxShadow = 'none'; }}
                />

                {generationMode === 'manual' ? (
                  <>
                    <label className="flex items-center gap-2 mt-5 mb-3" style={{ color: '#7c3aed', fontSize: 14, fontWeight: 700 }}>
                      <Layers size={16} /> Slide Content Outline *
                    </label>
                    <textarea
                      value={slideContent}
                      onChange={(e) => setSlideContent(e.target.value)}
                      placeholder="Slide 1 — Introduction&#10;- Welcome message&#10;- Overview of topic&#10;&#10;Slide 2 — Main Content&#10;- Key point 1&#10;- Key point 2&#10;&#10;Slide 3 — Conclusion&#10;- Summary&#10;- Call to action"
                      rows={14}
                      className="w-full rounded-xl text-white placeholder-gray-500 font-medium text-sm resize-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `2px solid ${slideContent.trim() ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.2)'}`,
                        padding: '14px 18px',
                        outline: 'none',
                        lineHeight: 1.6,
                      }}
                      onFocus={(e) => { e.target.style.border = '2px solid rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                      onBlur={(e) => { e.target.style.border = `2px solid ${slideContent.trim() ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.2)'}`;  e.target.style.boxShadow = 'none'; }}
                    />
                    <p style={{ color: 'rgba(156,163,175,0.8)', fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                      💡 Structure your content with "Slide X — Title" format and bullet points
                    </p>
                  </>
                ) : (
                  <div
                    className="rounded-xl p-5 mb-5 text-center border"
                    style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.15)' }}
                  >
                    <Sparkles size={24} className="mx-auto mb-3 text-purple-400 animate-pulse" />
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                      AI Auto-Generate Presentation
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6, maxWidth: '85%', margin: '0 auto' }}>
                      Only the presentation topic is required! The AI will automatically structure your slides, write professional outlines, and generate all slide text content for you.
                    </p>
                  </div>
                )}

                <label className="flex items-center gap-2 mt-5 mb-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
                  Additional Notes & Instructions (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any specific instructions or requirements..."
                  rows={2}
                  className="w-full rounded-xl text-white placeholder-gray-500 font-medium text-sm resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px 16px',
                    outline: 'none',
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Settings */}
              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <h3 className="flex items-center gap-2 mb-5" style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                  <Settings size={18} color="#7c3aed" /> Presentation Layout Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Presentation Type"
                    icon={<Target size={14} />}
                    value={generationConfig.presentationType}
                    onChange={(v) => setGenerationConfig({ presentationType: v as any })}
                    options={TYPES.map(t => ({ value: t.value, label: t.label }))}
                  />
                  <SelectField
                    label="Tone & Style"
                    icon={<Sparkles size={14} />}
                    value={generationConfig.tone}
                    onChange={(v) => setGenerationConfig({ tone: v as any })}
                    options={TONES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                  />
                  <SelectField
                    label="Target Audience"
                    icon={<Users size={14} />}
                    value={generationConfig.audience}
                    onChange={(v) => setGenerationConfig({ audience: v as any })}
                    options={AUDIENCES.map(a => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))}
                  />
                  <div>
                    <label className="flex items-center gap-2 mb-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
                      <Layers size={14} /> Number of Slides
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={6}
                        max={22}
                        value={generationConfig.slideCount}
                        onChange={(e) => setGenerationConfig({ slideCount: parseInt(e.target.value) })}
                        className="flex-1"
                        style={{ accentColor: '#7c3aed' }}
                      />
                      <div
                        className="flex items-center justify-center rounded-xl font-black text-lg"
                        style={{ width: 52, height: 44, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#7c3aed' }}
                      >
                        {generationConfig.slideCount}
                      </div>
                    </div>
                  </div>
                  <label
                    className="col-span-2 flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
                  >
                    <input
                      type="checkbox"
                      checked={generationConfig.includeImages}
                      onChange={(e) => setGenerationConfig({ includeImages: e.target.checked })}
                      style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
                    />
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      Include topic-related visuals on each slide
                    </span>
                  </label>
                </div>
              </div>

              {/* Theme Selector */}
              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <h3 className="flex items-center gap-2 mb-5" style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                  <Palette size={18} color="#7c3aed" /> Visual Theme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(themes).map(([id, theme]) => {
                    const themeId = id as ThemeId;
                    const isSelected = generationConfig.theme === themeId;
                    return (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setGenerationConfig({ theme: themeId })}
                        className="rounded-xl overflow-hidden text-left"
                        style={{
                          border: isSelected ? `2px solid ${theme.colors.primary}` : '2px solid rgba(255,255,255,0.08)',
                          boxShadow: isSelected ? `0 0 15px ${theme.colors.primary}30` : 'none',
                        }}
                      >
                        <div
                          style={{
                            height: 40,
                            background: theme.colors.backgroundGradient,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            className="absolute"
                            style={{
                              top: '-20%', right: '-10%',
                              width: 80, height: 80,
                              borderRadius: '50%',
                              background: `radial-gradient(circle, ${theme.colors.primary}40, transparent)`,
                              filter: 'blur(15px)',
                            }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-end pr-3">
                              <div className="flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: theme.colors.primary }}>
                                <span style={{ color: '#fff', fontSize: 11 }}>✓</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          className="px-3 py-2"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 12, color: isSelected ? theme.colors.primary : '#fff' }}>
                            {theme.name}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerate}
                className="w-full rounded-xl font-bold text-lg flex items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  color: '#fff',
                  padding: '16px',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                }}
              >
                <Sparkles size={22} />
                Generate Presentation
              </motion.button>
            </motion.div>
          </div>

          {/* Recent History - Right Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="sticky top-6"
            >
              <div
                className="rounded-2xl p-6"
                style={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2" style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                    <Clock size={18} color="#7c3aed" /> Recent History
                  </h3>
                  {!loadingHistory && history.length > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchHistory}
                        className="text-xs"
                        style={{ color: '#7c3aed', fontWeight: 600 }}
                      >
                        Refresh
                      </button>
                      <button
                        onClick={clearHistory}
                        className="text-xs"
                        style={{ color: '#ef4444', fontWeight: 600 }}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
                
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>Loading...</p>
                  </div>
                ) : historyError ? (
                  <div className="text-center py-8">
                    <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{historyError}</p>
                    <button
                      onClick={fetchHistory}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontWeight: 600 }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <Presentation size={40} color="#4b5563" className="mx-auto mb-3" />
                    <p style={{ color: '#6b7280', fontSize: 13 }}>No presentations yet</p>
                    <p style={{ color: '#4b5563', fontSize: 12, marginTop: 4 }}>Your history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {history.slice(0, 5).map((item) => (
                      <div key={item._id} className="relative group/item">
                        <motion.button
                          whileHover={{ scale: 1.02, background: 'rgba(124,58,237,0.08)' }}
                          onClick={() => loadFromHistory(item)}
                          title="Open in editor"
                          className="w-full text-left rounded-xl p-4 transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <FileText size={16} color="#7c3aed" className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 4 }} className="truncate pr-6">
                                {item.topic}
                                {item.isLocal && (
                                  <span style={{ marginLeft: 6, fontSize: 9, color: '#10B981', fontWeight: 700 }}>SAVED</span>
                                )}
                              </p>
                              {item.description && (
                                <p style={{ color: 'rgba(156,163,175,0.8)', fontSize: 12, marginBottom: 6 }} className="line-clamp-2">
                                  {item.description.substring(0, 60)}{item.description.length > 60 ? '...' : ''}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span style={{ 
                                  fontSize: 10, 
                                  color: '#7c3aed', 
                                  background: 'rgba(124,58,237,0.1)', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}>
                                  {item.slides} slides
                                </span>
                                {item.theme && (
                                  <span style={{ 
                                    fontSize: 10, 
                                    color: 'rgba(156,163,175,0.8)', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px'
                                  }}>
                                    {item.theme}
                                  </span>
                                )}
                              </div>
                              <p style={{ color: '#6b7280', fontSize: 11, marginTop: 6 }}>
                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                        {/* Delete button */}
                        <button
                          onClick={(e) => deleteHistoryItem(e, item._id)}
                          title="Delete"
                          className="absolute top-3 right-3 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                          style={{
                            width: 24, height: 24,
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

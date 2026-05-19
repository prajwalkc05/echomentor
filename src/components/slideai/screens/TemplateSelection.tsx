import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Eye, Sparkles } from 'lucide-react';
import { usePresentationStore } from '../../../store/slideai/presentationStore';
import { themes } from '../../../templates/slideai/themes';
import type { ThemeId } from '../../../types/slideai';

const CATEGORIES = ['All', 'Dark', 'Corporate', 'Tech', 'Research', 'Startup'];

const TEMPLATE_META: Record<ThemeId, { category: string; tags: string[]; previewSlide: { title: string; subtitle: string } }> = {
  'future-neon': {
    category: 'Dark',
    tags: ['Futuristic', 'Neon', 'Tech', 'Dark'],
    previewSlide: { title: 'Future Neon', subtitle: 'Cyberpunk Dark Theme' },
  },
  'cybersecurity': {
    category: 'Tech',
    tags: ['Cybersecurity', 'AI', 'Dark', 'Tech'],
    previewSlide: { title: 'Cybersecurity AI', subtitle: 'Dark Teal Hacker Aesthetic' },
  },
  'corporate-yellow': {
    category: 'Corporate',
    tags: ['Clean', 'Yellow', 'Corporate', 'Research'],
    previewSlide: { title: 'Corporate Research', subtitle: 'Clean Yellow Business Style' },
  },
  'glassmorphism': {
    category: 'Dark',
    tags: ['Glass', 'Aurora', 'Modern', 'Elegant'],
    previewSlide: { title: 'Glassmorphism', subtitle: 'Aurora Gradient Glass Effect' },
  },
  'startup-neon': {
    category: 'Startup',
    tags: ['Startup', 'Bold', 'Pink', 'Electric'],
    previewSlide: { title: 'Startup Neon', subtitle: 'Electric Pink Startup Energy' },
  },
  'minimal-dark': {
    category: 'Dark',
    tags: ['Minimal', 'Clean', 'Indigo', 'Professional'],
    previewSlide: { title: 'Minimal Dark', subtitle: 'Ultra Clean Professional Dark' },
  },
};

function TemplatePreview({ themeId, selected }: { themeId: ThemeId; selected: boolean }) {
  const theme = themes[themeId];
  const meta = TEMPLATE_META[themeId];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: 180,
        background: theme.colors.backgroundGradient,
      }}
    >
      {/* Background decorations */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(${theme.colors.primary}20 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.primary}20 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Glow */}
      <div
        className="absolute"
        style={{
          top: '-20%',
          right: '-10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.primary}25, transparent)`,
          filter: 'blur(30px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '-20%',
          left: '-10%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.secondary}20, transparent)`,
          filter: 'blur(25px)',
        }}
      />

      {/* Content preview */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {/* Accent bar */}
        <div
          className="mb-3"
          style={{
            width: 40,
            height: 3,
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily: theme.colors.headingFont,
            fontWeight: 900,
            fontSize: 20,
            color: theme.colors.text,
            lineHeight: 1.2,
            marginBottom: 6,
            textShadow: themeId !== 'corporate-yellow' ? `0 0 20px ${theme.colors.primary}40` : 'none',
          }}
        >
          {meta.previewSlide.title}
        </div>
        <div
          style={{
            fontFamily: theme.colors.bodyFont,
            fontSize: 11,
            color: theme.colors.textMuted,
          }}
        >
          {meta.previewSlide.subtitle}
        </div>

        {/* Mini slide element */}
        <div
          className="absolute bottom-4 left-4 right-4"
          style={{
            height: 40,
            background: theme.colors.cardBg,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 8,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.colors.primary }} />
          <div style={{ flex: 1, height: 6, background: theme.colors.textMuted + '30', borderRadius: 3 }} />
          <div style={{ width: '30%', height: 6, background: theme.colors.primary + '30', borderRadius: 3 }} />
        </div>
      </div>

      {/* Selected overlay */}
      {selected && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `${theme.colors.primary}20` }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, background: theme.colors.primary }}
          >
            <Check size={20} color="#fff" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplateSelection() {
  const { setCurrentScreen, setGenerationConfig, generationConfig } = usePresentationStore();
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(generationConfig.theme);
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

  const filteredThemes = Object.entries(themes).filter(([id]) => {
    const meta = TEMPLATE_META[id as ThemeId];
    return activeCategory === 'All' || meta.category === activeCategory;
  });

  const handleUseTemplate = () => {
    setGenerationConfig({ theme: selectedTheme });
    setCurrentScreen('generator');
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #081B5B 0%, #060f35 50%, #1a0533 100%)' }}>
      {/* BG grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(60,242,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(60,242,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff' }}>
                Choose Template
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                Select a visual style for your presentation
              </p>
            </div>
          </div>

          {selectedTheme && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUseTemplate}
              className="flex items-center gap-2 rounded-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #3CF2FF, #C026FF)',
                color: '#fff',
                padding: '12px 28px',
                boxShadow: '0 0 20px rgba(60,242,255,0.3)',
              }}
            >
              <Sparkles size={18} /> Use Template
            </motion.button>
          )}
        </motion.div>

        {/* Category filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-8 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-5 py-2 rounded-full font-semibold text-sm transition-all"
              style={{
                background: activeCategory === cat ? 'linear-gradient(135deg, #3CF2FF20, #C026FF20)' : 'rgba(255,255,255,0.05)',
                border: activeCategory === cat ? '1px solid rgba(60,242,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: activeCategory === cat ? '#3CF2FF' : 'rgba(255,255,255,0.6)',
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Templates grid */}
        <div className="grid grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredThemes.map(([id, theme], i) => {
              const themeId = id as ThemeId;
              const meta = TEMPLATE_META[themeId];
              const isSelected = selectedTheme === themeId;
              const isHovered = hoveredTheme === themeId;

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    border: isSelected
                      ? `2px solid ${theme.colors.primary}`
                      : '2px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? `0 0 30px ${theme.colors.primary}30` : 'none',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  onClick={() => setSelectedTheme(themeId)}
                  onHoverStart={() => setHoveredTheme(themeId)}
                  onHoverEnd={() => setHoveredTheme(null)}
                >
                  {/* Preview */}
                  <TemplatePreview themeId={themeId} selected={isSelected} />

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff', marginBottom: 4 }}>
                          {theme.name}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                          {theme.description}
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-center rounded-lg px-3 py-1 text-xs font-bold"
                        style={{ background: `${theme.colors.primary}15`, color: theme.colors.primary, border: `1px solid ${theme.colors.primary}30` }}
                      >
                        {meta.category}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      {meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-xs"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Color palette */}
                    <div className="flex items-center gap-2">
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, ci) => (
                          <div
                            key={ci}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: color,
                              boxShadow: `0 0 8px ${color}60`,
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Color Palette</span>
                    </div>

                    {/* Actions */}
                    <AnimatePresence>
                      {(isHovered || isSelected) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2 mt-4"
                        >
                          <button
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-sm"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            onClick={handleUseTemplate}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm"
                            style={{
                              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                              color: '#fff',
                              border: 'none',
                            }}
                          >
                            <Sparkles size={14} /> Use This
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

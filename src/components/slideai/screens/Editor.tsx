import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Download, Plus, Trash2, Copy,
  ChevronUp, ChevronDown, Save, Monitor, Palette,
  Type, Image, AlignLeft, LayoutTemplate, Share2,
  Eye, Undo2, Redo2
} from 'lucide-react';
import { usePresentationStore } from '../../../store/slideai/presentationStore';
import { SlideRenderer } from '../slides/SlideRenderer';
import { themes } from '../../../templates/slideai/themes';
import type { Slide, LayoutType, ThemeId } from '../../../types/slideai';
import toast from 'react-hot-toast';

const LAYOUTS: { id: LayoutType; label: string; icon: string }[] = [
  { id: 'cover-hero', label: 'Cover / Hero', icon: '🎯' },
  { id: 'split-left-text', label: 'Split Left', icon: '◧' },
  { id: 'split-right-text', label: 'Split Right', icon: '◨' },
  { id: 'center-title', label: 'Center Title', icon: '⬛' },
  { id: 'bullets-image', label: 'Bullets + Image', icon: '📋' },
  { id: 'grid-cards', label: 'Grid Cards', icon: '⊞' },
  { id: 'stats-grid', label: 'Stats Grid', icon: '📊' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'team-grid', label: 'Team Grid', icon: '👥' },
  { id: 'comparison', label: 'Comparison', icon: '⚖️' },
  { id: 'results', label: 'Results', icon: '📈' },
  { id: 'architecture', label: 'Architecture', icon: '🏗️' },
  { id: 'thank-you', label: 'Thank You', icon: '🙏' },
];

function SlideThumbnail({
  slide,
  index,
  isSelected,
  theme,
  onClick,
}: {
  slide: Slide;
  index: number;
  isSelected: boolean;
  theme: ThemeId;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer rounded-lg overflow-hidden"
      style={{
        border: isSelected ? '2px solid #3CF2FF' : '2px solid rgba(255,255,255,0.08)',
        boxShadow: isSelected ? '0 0 15px rgba(60,242,255,0.4)' : 'none',
      }}
    >
      {/* Slide number badge */}
      <div
        className="absolute z-10 rounded-tl-lg"
        style={{
          top: 0, left: 0,
          padding: '2px 6px',
          background: isSelected ? 'rgba(60,242,255,0.8)' : 'rgba(0,0,0,0.6)',
          fontSize: 10, fontWeight: 700,
          color: isSelected ? '#000' : 'rgba(255,255,255,0.7)',
        }}
      >
        {index + 1}
      </div>
      <div style={{ position: 'relative' }}>
        <SlideRenderer slide={slide} theme={theme} scale={0.18} />
      </div>
    </motion.div>
  );
}

function EditPanel({
  slide,
  onUpdate,
  onLayoutChange,
  onThemeChange,
  theme,
}: {
  slide: Slide;
  onUpdate: (updates: Partial<Slide>) => void;
  onLayoutChange: (layout: LayoutType) => void;
  onThemeChange: (theme: ThemeId) => void;
  theme: ThemeId;
}) {
  const [activeTab, setActiveTab] = useState<'content' | 'layout' | 'theme' | 'design'>('content');
  const c = slide.content;

  const updateContent = (key: string, value: unknown) => {
    onUpdate({ content: { ...slide.content, [key]: value } });
  };

  const tabs = [
    { id: 'content', icon: <Type size={14} />, label: 'Content' },
    { id: 'layout', icon: <LayoutTemplate size={14} />, label: 'Layout' },
    { id: 'theme', icon: <Palette size={14} />, label: 'Theme' },
    { id: 'design', icon: <Image size={14} />, label: 'Design' },
  ] as const;

  return (
    <div className="h-full flex flex-col" style={{ color: '#fff' }}>
      {/* Tab nav */}
      <div
        className="flex border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1 py-3 text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(60,242,255,0.08)' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #3CF2FF' : '2px solid transparent',
              color: activeTab === tab.id ? '#3CF2FF' : 'rgba(255,255,255,0.4)',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Title
              </label>
              <input
                value={c.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full rounded-lg text-white text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                placeholder="Slide title..."
              />
            </div>

            {/* Subtitle */}
            {(slide.layout === 'cover-hero' || slide.layout === 'thank-you') && (
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                  Subtitle
                </label>
                <input
                  value={c.subtitle || ''}
                  onChange={(e) => updateContent('subtitle', e.target.value)}
                  className="w-full rounded-lg text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                  placeholder="Subtitle..."
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={c.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                rows={3}
                className="w-full rounded-lg text-white text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', outline: 'none', fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}
                placeholder="Slide description..."
              />
            </div>

            {/* Bullets */}
            {c.bullets && c.bullets.length > 0 && (
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                  Bullet Points
                </label>
                <div className="space-y-2">
                  {c.bullets.map((bullet, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...(c.bullets || [])];
                          newBullets[i] = e.target.value;
                          updateContent('bullets', newBullets);
                        }}
                        className="flex-1 rounded-lg text-white text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                      />
                      <button
                        onClick={() => {
                          const newBullets = (c.bullets || []).filter((_, bi) => bi !== i);
                          updateContent('bullets', newBullets);
                        }}
                        className="rounded-lg flex items-center justify-center shrink-0"
                        style={{ width: 32, height: 32, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateContent('bullets', [...(c.bullets || []), 'New bullet point'])}
                    className="w-full rounded-lg py-2 text-xs font-semibold"
                    style={{ background: 'rgba(60,242,255,0.08)', border: '1px dashed rgba(60,242,255,0.3)', color: '#3CF2FF' }}
                  >
                    + Add Bullet
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Call to Action
              </label>
              <input
                value={c.cta || ''}
                onChange={(e) => updateContent('cta', e.target.value)}
                className="w-full rounded-lg text-white text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                placeholder="Call to action text..."
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Presenter Notes
              </label>
              <textarea
                value={c.notes || ''}
                onChange={(e) => updateContent('notes', e.target.value)}
                rows={3}
                className="w-full rounded-lg text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 12px', outline: 'none', fontFamily: "'Outfit', sans-serif", color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}
                placeholder="Notes for presenter (not visible in presentation)..."
              />
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>
              Select a layout for this slide
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onLayoutChange(l.id)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background: slide.layout === l.id ? 'rgba(60,242,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: slide.layout === l.id ? '1px solid rgba(60,242,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: slide.layout === l.id ? '#3CF2FF' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{l.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{l.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>
              Override theme for this slide
            </p>
            <div className="space-y-2">
              {Object.entries(themes).map(([id, t]) => (
                <button
                  key={id}
                  onClick={() => onThemeChange(id as ThemeId)}
                  className="w-full rounded-xl overflow-hidden flex items-center gap-3"
                  style={{
                    background: (slide.theme || theme) === id ? 'rgba(60,242,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: (slide.theme || theme) === id ? '1px solid rgba(60,242,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    padding: '10px 12px',
                  }}
                >
                  <div className="shrink-0" style={{ width: 40, height: 24, borderRadius: 6, background: t.colors.backgroundGradient, border: `1px solid ${t.colors.border}` }} />
                  <div className="text-left">
                    <div style={{ fontSize: 12, fontWeight: 700, color: (slide.theme || theme) === id ? '#3CF2FF' : '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{t.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-4">
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Slide Layout
              </div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{slide.layout.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Active Theme
              </div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {themes[slide.theme || theme]?.name || 'Future Neon'}
              </div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,216,77,0.06)', border: '1px solid rgba(255,216,77,0.15)' }}
            >
              <div style={{ color: '#FFD84D', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                💡 Pro Tip
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.6 }}>
                Use the Content tab to edit text inline. Switch layouts in the Layout tab to completely change the slide structure while keeping your content.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Editor() {
  const {
    currentPresentation,
    selectedSlideIndex,
    setSelectedSlideIndex,
    updateSlide,
    addSlide,
    removeSlide,
    setCurrentScreen,
    setPresentMode,
    updatePresentation,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePresentationStore();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  if (!currentPresentation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="text-center">
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, marginBottom: 16 }}>No presentation loaded</p>
          <button onClick={() => setCurrentScreen('dashboard')} style={{ color: '#3CF2FF', fontSize: 14 }}>
            ← Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { slides, theme } = currentPresentation;
  const selectedSlide = slides[selectedSlideIndex];

  const handleSlideUpdate = (updates: Partial<Slide>) => {
    if (selectedSlide) {
      updateSlide(selectedSlide.id, updates);
    }
  };

  const handleLayoutChange = (layout: LayoutType) => {
    if (selectedSlide) {
      updateSlide(selectedSlide.id, { layout });
    }
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    if (selectedSlide) {
      updateSlide(selectedSlide.id, { theme: newTheme });
    }
  };

  const handleDuplicateSlide = () => {
    if (selectedSlide) {
      const newSlide: Slide = {
        ...selectedSlide,
        id: Math.random().toString(36).substr(2, 9),
        order: slides.length,
      };
      addSlide(newSlide);
      toast.success('Slide duplicated');
    }
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the only slide');
      return;
    }
    if (selectedSlide) {
      removeSlide(selectedSlide.id);
      toast.success('Slide deleted');
    }
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Math.random().toString(36).substr(2, 9),
      layout: 'center-title',
      theme: undefined,
      content: { title: 'New Slide', description: 'Add your content here', bullets: [] },
      order: slides.length,
    };
    addSlide(newSlide);
    toast.success('Slide added');
  };

  const handleSave = () => {
    if (currentPresentation) {
      updatePresentation(currentPresentation.id, { updatedAt: new Date() });
      toast.success('Presentation saved!', { icon: '💾' });
    }
  };

  const handleExportPDF = async () => {
    setShowExportMenu(false);
    toast.loading('Preparing PDF export...', { id: 'pdf' });
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [960, 540] });
      for (let i = 0; i < slides.length; i++) {
        setSelectedSlideIndex(i);
        await new Promise((r) => setTimeout(r, 300));
        if (slideRef.current) {
          const canvas = await html2canvas(slideRef.current, { scale: 2, useCORS: true, backgroundColor: null });
          const imgData = canvas.toDataURL('image/png');
          if (i > 0) pdf.addPage([960, 540], 'landscape');
          pdf.addImage(imgData, 'PNG', 0, 0, 960, 540);
        }
      }
      pdf.save(`${currentPresentation.title.replace(/\s+/g, '-')}.pdf`);
      toast.success('PDF exported!', { id: 'pdf' });
    } catch (e) {
      toast.error('PDF export failed', { id: 'pdf' });
      console.error(e);
    }
  };

  const handleExportPPTX = async () => {
    setShowExportMenu(false);
    toast.loading('Creating PPTX...', { id: 'pptx' });
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.title = currentPresentation.title;

      const themeColors = themes[theme].colors;

      for (const slide of slides) {
        const pptSlide = pptx.addSlide();
        const bg = theme === 'corporate-yellow' ? 'FFFFFF' : '081B5B';
        pptSlide.background = { color: bg };

        // Add gradient accent
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: '100%', h: 0.06,
          fill: { type: 'solid', color: themeColors.primary.replace('#', '') },
        });

        const title = slide.content.title || '';
        const description = slide.content.description || '';
        const bullets = slide.content.bullets || [];
        const textColor = theme === 'corporate-yellow' ? '1a1a2e' : 'FFFFFF';
        const accentColor = themeColors.primary.replace('#', '');

        // Title
        pptSlide.addText(title, {
          x: 0.5, y: 0.3, w: 9, h: 1.2,
          fontSize: 32, bold: true, color: textColor, fontFace: 'Calibri',
          align: slide.layout === 'cover-hero' || slide.layout === 'center-title' ? 'center' : 'left',
        });

        // Description
        if (description) {
          pptSlide.addText(description, {
            x: 0.5, y: 1.7, w: slide.layout.includes('split') ? 5 : 9, h: 1.5,
            fontSize: 14, color: textColor + 'BB', fontFace: 'Calibri',
            align: slide.layout === 'cover-hero' || slide.layout === 'center-title' ? 'center' : 'left',
          });
        }

        // Bullets
        if (bullets.length > 0) {
          const bulletItems = bullets.map((b) => ({ text: b, options: { bullet: { code: '2022' }, indent: 15 } }));
          pptSlide.addText(bulletItems, {
            x: 0.5, y: 3, w: slide.layout.includes('split') ? 5 : 9, h: 3,
            fontSize: 13, color: textColor, fontFace: 'Calibri',
          });
        }

        // Accent bar
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.5, w: 0.8, h: 0.06,
          fill: { type: 'solid', color: accentColor },
        });

        // Stats
        if (slide.content.stats) {
          slide.content.stats.forEach((stat, si) => {
            const x = 0.5 + (si % 4) * 2.4;
            const y = 2.5 + Math.floor(si / 4) * 1.8;
            pptSlide.addText(stat.value, { x, y, w: 2.2, h: 0.8, fontSize: 28, bold: true, color: accentColor, align: 'center' });
            pptSlide.addText(stat.label, { x, y: y + 0.85, w: 2.2, h: 0.5, fontSize: 11, color: textColor + 'AA', align: 'center' });
          });
        }

        // Cards
        if (slide.content.cards) {
          slide.content.cards.slice(0, 6).forEach((card, ci) => {
            const cols = slide.content.cards!.length <= 4 ? 2 : 3;
            const x = 0.4 + (ci % cols) * (9.4 / cols);
            const y = 2 + Math.floor(ci / cols) * 1.6;
            pptSlide.addText(`${card.icon || ''} ${card.title}`, { x, y, w: 9.4 / cols - 0.2, h: 0.4, fontSize: 13, bold: true, color: accentColor });
            pptSlide.addText(card.description, { x, y: y + 0.45, w: 9.4 / cols - 0.2, h: 0.9, fontSize: 11, color: textColor + 'AA' });
          });
        }
      }

      await pptx.writeFile({ fileName: `${currentPresentation.title.replace(/\s+/g, '-')}.pptx` });
      toast.success('PPTX exported!', { id: 'pptx' });
    } catch (e) {
      toast.error('PPTX export failed', { id: 'pptx' });
      console.error(e);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a0f1e' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ background: 'rgba(8,27,91,0.9)', borderColor: 'rgba(60,242,255,0.1)', backdropFilter: 'blur(10px)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('generator')}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <input
              value={currentPresentation.title}
              onChange={(e) => updatePresentation(currentPresentation.id, { title: e.target.value })}
              className="font-bold text-white bg-transparent border-none outline-none"
              style={{ fontSize: 15, fontFamily: "'Outfit', sans-serif", minWidth: 200 }}
            />
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              {slides.length} slides • {themes[theme]?.name}
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-xl px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
              Slide {selectedSlideIndex + 1} of {slides.length}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <Save size={14} /> Save
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="flex items-center justify-center rounded-xl px-2.5 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: canUndo ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                cursor: canUndo ? 'pointer' : 'not-allowed',
              }}
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="flex items-center justify-center rounded-xl px-2.5 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: canRedo ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                cursor: canRedo ? 'pointer' : 'not-allowed',
              }}
            >
              <Redo2 size={14} />
            </button>
          </div>

          <button
            onClick={() => setCurrentScreen('templates')}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <LayoutTemplate size={14} /> Theme
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              <Download size={14} /> Export
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: '#1a2040', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, minWidth: 160 }}
                >
                  <button
                    onClick={handleExportPPTX}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
                    style={{ color: '#fff' }}
                  >
                    📊 Download PPTX
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
                    style={{ color: '#fff', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    📄 Download PDF
                  </button>
                  <button
                    onClick={() => { setShowExportMenu(false); toast.success('Share link copied!'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
                    style={{ color: '#fff', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <Share2 size={14} /> Share Link
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => { setPresentMode(true); setCurrentScreen('present'); }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #3CF2FF, #C026FF)', color: '#fff', boxShadow: '0 0 15px rgba(60,242,255,0.3)' }}
          >
            <Play size={14} /> Present
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Slide list */}
        <div
          className="w-52 flex flex-col border-r shrink-0"
          style={{ background: 'rgba(8,27,91,0.7)', borderColor: 'rgba(60,242,255,0.08)', height: '100%' }}
        >
          {/* Add slide button */}
          <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleAddSlide}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm"
              style={{ background: 'rgba(60,242,255,0.1)', border: '1px dashed rgba(60,242,255,0.3)', color: '#3CF2FF' }}
            >
              <Plus size={16} /> Add Slide
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(60,242,255,0.3) transparent', minHeight: 0 }}>
            {slides.map((slide, i) => (
              <div key={slide.id} className="relative group">
                <SlideThumbnail
                  slide={slide}
                  index={i}
                  isSelected={i === selectedSlideIndex}
                  theme={slide.theme || theme}
                  onClick={() => setSelectedSlideIndex(i)}
                />
                {/* Actions on hover */}
                <div
                  className="absolute right-1 top-1 flex-col gap-1 hidden group-hover:flex"
                  style={{ zIndex: 10 }}
                >
                  <button
                    onClick={handleDuplicateSlide}
                    className="flex items-center justify-center rounded"
                    style={{ width: 20, height: 20, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
                    title="Duplicate"
                  >
                    <Copy size={10} color="white" />
                  </button>
                  <button
                    onClick={handleDeleteSlide}
                    className="flex items-center justify-center rounded"
                    style={{ width: 20, height: 20, background: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.4)' }}
                    title="Delete"
                  >
                    <Trash2 size={10} color="white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reorder controls */}
          {selectedSlide && (
            <div className="p-3 border-t flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => {
                  if (selectedSlideIndex > 0) {
                    const newSlides = [...slides];
                    [newSlides[selectedSlideIndex - 1], newSlides[selectedSlideIndex]] = [newSlides[selectedSlideIndex], newSlides[selectedSlideIndex - 1]];
                    usePresentationStore.getState().reorderSlides(newSlides);
                    setSelectedSlideIndex(selectedSlideIndex - 1);
                  }
                }}
                disabled={selectedSlideIndex === 0}
                className="flex-1 flex items-center justify-center rounded-xl py-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: selectedSlideIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => {
                  if (selectedSlideIndex < slides.length - 1) {
                    const newSlides = [...slides];
                    [newSlides[selectedSlideIndex], newSlides[selectedSlideIndex + 1]] = [newSlides[selectedSlideIndex + 1], newSlides[selectedSlideIndex]];
                    usePresentationStore.getState().reorderSlides(newSlides);
                    setSelectedSlideIndex(selectedSlideIndex + 1);
                  }
                }}
                disabled={selectedSlideIndex === slides.length - 1}
                className="flex-1 flex items-center justify-center rounded-xl py-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: selectedSlideIndex === slides.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Center: Slide canvas */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(5,10,25,0.8)' }}
        >
          <div className="w-full h-full flex items-center justify-center p-8">
            {selectedSlide ? (
              <motion.div
                key={selectedSlide.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
                style={{ maxWidth: '90%', maxHeight: '90%' }}
                ref={slideRef}
              >
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    boxShadow: `0 0 60px rgba(60,242,255,0.1), 0 20px 80px rgba(0,0,0,0.5)`,
                    border: '1px solid rgba(60,242,255,0.15)',
                  }}
                >
                  <SlideRenderer
                    slide={selectedSlide}
                    theme={selectedSlide.theme || theme}
                    isEditing={true}
                    onUpdate={handleSlideUpdate}
                    scale={1}
                    animate={true}
                  />
                </div>

                {/* Presenter notes */}
                {selectedSlide.content.notes && (
                  <div
                    className="mt-4 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,216,77,0.05)', border: '1px solid rgba(255,216,77,0.15)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlignLeft size={12} color="#FFD84D" />
                      <span style={{ color: '#FFD84D', fontSize: 11, fontWeight: 600 }}>Presenter Notes</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6 }}>
                      {selectedSlide.content.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center">
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>Select a slide to edit</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Properties panel */}
        <div
          className="w-72 border-l shrink-0 overflow-hidden"
          style={{ background: 'rgba(8,27,91,0.7)', borderColor: 'rgba(60,242,255,0.08)' }}
        >
          {selectedSlide ? (
            <EditPanel
              slide={selectedSlide}
              onUpdate={handleSlideUpdate}
              onLayoutChange={handleLayoutChange}
              onThemeChange={handleThemeChange}
              theme={theme}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Select a slide</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        className="px-5 py-2 border-t flex items-center justify-between"
        style={{ background: 'rgba(8,27,91,0.9)', borderColor: 'rgba(60,242,255,0.08)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-4">
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            Theme: {themes[theme]?.name}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            Layout: {selectedSlide?.layout.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPresentMode(true); setCurrentScreen('present'); }}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: '#3CF2FF' }}
          >
            <Monitor size={12} /> Preview Mode
          </button>
          <button
            onClick={() => setCurrentScreen('export')}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <Eye size={12} /> Export
          </button>
        </div>
      </div>
    </div>
  );
}

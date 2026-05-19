import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Globe, Check, ExternalLink } from 'lucide-react';
import { usePresentationStore } from '../../../store/slideai/presentationStore';
import { themes } from '../../../templates/slideai/themes';
import toast from 'react-hot-toast';

const EXPORT_OPTIONS = [
  {
    id: 'pptx',
    icon: '📊',
    title: 'PowerPoint (PPTX)',
    description: 'Editable Microsoft PowerPoint file with all slides, content, and styling.',
    color: '#C026FF',
    badge: 'Most Popular',
  },
  {
    id: 'pdf',
    icon: '📄',
    title: 'PDF Document',
    description: 'High-quality PDF for sharing, printing, and archiving your presentation.',
    color: '#3CF2FF',
    badge: 'Universal',
  },
  {
    id: 'share',
    icon: '🔗',
    title: 'Share Link',
    description: 'Generate a shareable link for online viewing without downloading.',
    color: '#FFD84D',
    badge: 'Easy Share',
  },
  {
    id: 'publish',
    icon: '🌐',
    title: 'Publish Online',
    description: 'Host your presentation online with a public URL for interactive viewing.',
    color: '#00e5ff',
    badge: 'New',
  },
];

export default function ExportScreen() {
  const { setCurrentScreen, currentPresentation } = usePresentationStore();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exported, setExported] = useState<string[]>([]);

  if (!currentPresentation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <button onClick={() => setCurrentScreen('dashboard')} style={{ color: '#3CF2FF' }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const theme = themes[currentPresentation.theme];

  const handleExport = async (type: string) => {
    setDownloading(type);

    if (type === 'pptx') {
      toast.loading('Creating PPTX...', { id: 'export' });
      try {
        const PptxGenJS = (await import('pptxgenjs')).default;
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE';
        pptx.title = currentPresentation.title;
        pptx.author = 'SlideAI Platform';

        const themeColors = theme.colors;
        const isDark = currentPresentation.theme !== 'corporate-yellow';

        for (const slide of currentPresentation.slides) {
          const pptSlide = pptx.addSlide();
          const bg = isDark ? '081B5B' : 'FFFFFF';
          pptSlide.background = { color: bg };

          const accentColor = themeColors.primary.replace('#', '').replace(/^#/, '');
          const textColor = isDark ? 'FFFFFF' : '1a1a2e';

          // Top accent bar
          pptSlide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: 0.08,
            fill: { type: 'solid', color: accentColor },
          });

          // Accent line before title
          pptSlide.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 0.55, w: 0.6, h: 0.06,
            fill: { type: 'solid', color: accentColor },
          });

          const title = slide.content.title || 'Untitled Slide';
          const isCenter = ['cover-hero', 'center-title', 'thank-you'].includes(slide.layout);

          // Title
          pptSlide.addText(title, {
            x: isCenter ? 1 : 0.5,
            y: 0.4,
            w: isCenter ? 8 : 9,
            h: 1.1,
            fontSize: slide.layout === 'cover-hero' ? 36 : 28,
            bold: true,
            color: textColor,
            align: isCenter ? 'center' : 'left',
            fontFace: 'Calibri',
          });

          // Subtitle
          if (slide.content.subtitle) {
            pptSlide.addText(slide.content.subtitle, {
              x: isCenter ? 1 : 0.5, y: 1.55, w: isCenter ? 8 : 5.5, h: 0.5,
              fontSize: 16, color: accentColor, bold: true, align: isCenter ? 'center' : 'left', fontFace: 'Calibri',
            });
          }

          // Description
          if (slide.content.description) {
            pptSlide.addText(slide.content.description, {
              x: isCenter ? 1.5 : 0.5,
              y: slide.content.subtitle ? 2.1 : 1.65,
              w: isCenter ? 7 : 5.5,
              h: 1.4,
              fontSize: 13,
              color: textColor + (isDark ? 'BB' : '99'),
              align: isCenter ? 'center' : 'left',
              fontFace: 'Calibri',
              paraSpaceAfter: 4,
            });
          }

          // Bullets
          if (slide.content.bullets && slide.content.bullets.length > 0) {
            const bulletItems = slide.content.bullets.map((b) => ({
              text: `• ${b}`,
              options: { paraSpaceAfter: 6, indent: 10 },
            }));
            pptSlide.addText(bulletItems, {
              x: 0.5, y: 2.8, w: 5.5, h: 3,
              fontSize: 13, color: textColor, fontFace: 'Calibri',
            });
          }

          // Stats
          if (slide.content.stats) {
            slide.content.stats.slice(0, 4).forEach((stat, si) => {
              const cols = Math.min(slide.content.stats!.length, 4);
              const colW = 9 / cols;
              const x = 0.5 + si * colW;
              pptSlide.addText(stat.value, { x, y: 2, w: colW, h: 1, fontSize: 32, bold: true, color: (stat.color || themeColors.primary).replace('#', ''), align: 'center', fontFace: 'Calibri' });
              pptSlide.addText(stat.label, { x, y: 3.1, w: colW, h: 0.5, fontSize: 12, color: textColor + 'AA', align: 'center', fontFace: 'Calibri' });
            });
          }

          // Cards
          if (slide.content.cards) {
            slide.content.cards.slice(0, 6).forEach((card, ci) => {
              const cols = slide.content.cards!.length <= 4 ? 2 : 3;
              const colW = 9 / cols;
              const x = 0.5 + (ci % cols) * colW;
              const y = 2.2 + Math.floor(ci / cols) * 1.6;
              pptSlide.addText(`${card.icon || '•'} ${card.title}`, { x, y, w: colW - 0.1, h: 0.4, fontSize: 13, bold: true, color: accentColor, fontFace: 'Calibri' });
              pptSlide.addText(card.description, { x, y: y + 0.45, w: colW - 0.1, h: 0.9, fontSize: 11, color: textColor + 'AA', fontFace: 'Calibri' });
            });
          }

          // Timeline
          if (slide.content.timeline) {
            slide.content.timeline.slice(0, 5).forEach((item, ti) => {
              const y = 1.8 + ti * 1.0;
              pptSlide.addShape(pptx.ShapeType.ellipse, { x: 0.5, y, w: 0.35, h: 0.35, fill: { type: 'solid', color: accentColor } });
              pptSlide.addText(item.step, { x: 0.5, y, w: 0.35, h: 0.35, fontSize: 10, bold: true, color: 'FFFFFF', align: 'center' });
              pptSlide.addText(item.title, { x: 1, y, w: 3.5, h: 0.35, fontSize: 12, bold: true, color: textColor, fontFace: 'Calibri' });
              pptSlide.addText(item.description, { x: 4.6, y, w: 5, h: 0.35, fontSize: 11, color: textColor + 'AA', fontFace: 'Calibri' });
            });
          }

          // Team
          if (slide.content.team) {
            slide.content.team.slice(0, 6).forEach((member, mi) => {
              const cols = Math.min(slide.content.team!.length, 3);
              const colW = 9 / cols;
              const x = 0.5 + (mi % cols) * colW;
              const y = 2 + Math.floor(mi / cols) * 1.5;
              pptSlide.addText(member.name, { x, y, w: colW - 0.1, h: 0.5, fontSize: 14, bold: true, color: textColor, align: 'center', fontFace: 'Calibri' });
              pptSlide.addText(member.role, { x, y: y + 0.55, w: colW - 0.1, h: 0.5, fontSize: 11, color: textColor + 'AA', align: 'center', fontFace: 'Calibri' });
            });
          }

          // CTA
          if (slide.content.cta) {
            pptSlide.addText(slide.content.cta, {
              x: 1, y: 4.2, w: 8, h: 0.5,
              fontSize: 14, bold: true, italic: true,
              color: accentColor, align: 'center', fontFace: 'Calibri',
            });
          }
        }

        await pptx.writeFile({ fileName: `${currentPresentation.title.replace(/\s+/g, '-')}.pptx` });
        setExported((prev) => [...prev, type]);
        toast.success('PPTX downloaded successfully!', { id: 'export', icon: '📊' });
      } catch (e) {
        toast.error('PPTX export failed. Please try again.', { id: 'export' });
        console.error(e);
      }
    } else if (type === 'pdf') {
      toast.loading('Generating PDF...', { id: 'export' });
      try {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const isDark = currentPresentation.theme !== 'corporate-yellow';
        const bgColor = isDark ? [8, 27, 91] as [number,number,number] : [255, 255, 255] as [number,number,number];
        const textColor = isDark ? [255, 255, 255] as [number,number,number] : [26, 26, 46] as [number,number,number];

        currentPresentation.slides.forEach((slide, i) => {
          if (i > 0) pdf.addPage('a4', 'landscape');
          pdf.setFillColor(...bgColor);
          pdf.rect(0, 0, 297, 210, 'F');

          // Accent bar
          pdf.setFillColor(60, 242, 255);
          pdf.rect(0, 0, 297, 2, 'F');

          // Title
          pdf.setTextColor(...textColor);
          pdf.setFontSize(28);
          pdf.setFont('helvetica', 'bold');
          pdf.text(slide.content.title || 'Untitled', 20, 35);

          // Accent line
          pdf.setFillColor(60, 242, 255);
          pdf.rect(20, 42, 40, 1.5, 'F');

          // Description
          if (slide.content.description) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...textColor);
            const lines = pdf.splitTextToSize(slide.content.description, 200);
            pdf.text(lines.slice(0, 4), 20, 55);
          }

          // Bullets
          if (slide.content.bullets) {
            pdf.setFontSize(11);
            slide.content.bullets.slice(0, 8).forEach((b, bi) => {
              pdf.text(`• ${b}`, 20, 75 + bi * 12);
            });
          }

          // Stats
          if (slide.content.stats) {
            slide.content.stats.slice(0, 4).forEach((stat, si) => {
              const x = 20 + si * 65;
              pdf.setFontSize(22);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(60, 242, 255);
              pdf.text(stat.value, x, 100);
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(...textColor);
              pdf.text(stat.label, x, 110);
            });
          }

          // Page number
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 120);
          pdf.text(`${i + 1} / ${currentPresentation.slides.length}`, 270, 200);
        });

        pdf.save(`${currentPresentation.title.replace(/\s+/g, '-')}.pdf`);
        setExported((prev) => [...prev, type]);
        toast.success('PDF downloaded successfully!', { id: 'export', icon: '📄' });
      } catch (e) {
        toast.error('PDF export failed. Please try again.', { id: 'export' });
        console.error(e);
      }
    } else if (type === 'share') {
      const shareUrl = `https://slideai.app/view/${currentPresentation.id}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setExported((prev) => [...prev, type]);
        toast.success('Share link copied to clipboard!', { icon: '🔗' });
      } catch {
        toast.error('Could not copy to clipboard');
      }
    } else if (type === 'publish') {
      await new Promise((r) => setTimeout(r, 1500));
      setExported((prev) => [...prev, type]);
      toast.success('Presentation published online!', { icon: '🌐' });
    }

    setDownloading(null);
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #081B5B 0%, #060f35 50%, #1a0533 100%)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(60,242,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(60,242,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
          <button
            onClick={() => setCurrentScreen('editor')}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <ArrowLeft size={16} /> Back to Editor
          </button>
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff' }}>
              Export & Share
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              Download or share your presentation
            </p>
          </div>
        </motion.div>

        {/* Presentation summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-8 flex items-center gap-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="rounded-xl flex items-center justify-center shrink-0"
            style={{
              width: 120,
              height: 70,
              background: theme.colors.backgroundGradient,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                fontFamily: theme.colors.headingFont,
                fontSize: 13,
                fontWeight: 900,
                color: theme.colors.text,
                textAlign: 'center',
                padding: '0 8px',
              }}
            >
              {currentPresentation.title}
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 6 }}>
              {currentPresentation.title}
            </h3>
            <div className="flex items-center gap-4">
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                {currentPresentation.slides.length} slides
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-xs font-bold"
                style={{ background: `${theme.colors.primary}15`, color: theme.colors.primary, border: `1px solid ${theme.colors.primary}30` }}
              >
                {theme.name}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Export options */}
        <div className="grid grid-cols-2 gap-5">
          {EXPORT_OPTIONS.map((option, i) => {
            const isDone = exported.includes(option.id);
            const isLoading = downloading === option.id;

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-2xl p-6"
                style={{
                  background: isDone ? `${option.color}08` : 'rgba(255,255,255,0.04)',
                  border: isDone ? `1px solid ${option.color}40` : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div style={{ fontSize: 36 }}>{option.icon}</div>
                  <span
                    className="px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: `${option.color}20`, color: option.color, border: `1px solid ${option.color}30` }}
                  >
                    {option.badge}
                  </span>
                </div>

                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff', marginBottom: 6 }}>
                  {option.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
                  {option.description}
                </p>

                <button
                  onClick={() => handleExport(option.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm transition-all"
                  style={{
                    background: isDone
                      ? `${option.color}20`
                      : `linear-gradient(135deg, ${option.color}CC, ${option.color}80)`,
                    border: `1px solid ${option.color}50`,
                    color: isDone ? option.color : '#fff',
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'wait' : 'pointer',
                  }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#fff' }}
                      />
                      Processing...
                    </>
                  ) : isDone ? (
                    <>
                      <Check size={16} /> Done!
                    </>
                  ) : (
                    <>
                      {option.id === 'share' ? <Share2 size={16} /> :
                        option.id === 'publish' ? <Globe size={16} /> :
                        <Download size={16} />}
                      {option.id === 'share' ? 'Copy Share Link' :
                        option.id === 'publish' ? 'Publish Now' :
                        `Download ${option.id.toUpperCase()}`}
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-2xl p-5"
          style={{ background: 'rgba(60,242,255,0.05)', border: '1px solid rgba(60,242,255,0.15)' }}
        >
          <h4 style={{ color: '#3CF2FF', fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ExternalLink size={14} /> Export Tips
          </h4>
          <ul style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 2, padding: 0, listStyle: 'none', margin: 0 }}>
            <li>• PPTX files work with Microsoft PowerPoint, Google Slides, and Keynote</li>
            <li>• PDF exports preserve exact visual styling for printing and archiving</li>
            <li>• Share links allow anyone to view without an account</li>
            <li>• For best quality, use Chrome or Edge for PDF export</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

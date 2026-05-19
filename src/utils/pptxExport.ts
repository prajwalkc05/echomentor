import type { Slide, ThemeId } from '../types/slideai';
import { themes } from '../templates/slideai/themes';

export async function generateCleanPPTX(
  slides: Slide[],
  title: string,
  theme: ThemeId
) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = title;

  const themeColors = themes[theme].colors;
  const isDark = theme !== 'corporate-yellow';
  const textColor = isDark ? 'FFFFFF' : '1a1a2e';
  const accentColor = themeColors.primary.replace('#', '');

  for (const slide of slides) {
    const pptSlide = pptx.addSlide();
    const bg = isDark ? '081B5B' : 'FFFFFF';
    pptSlide.background = { color: bg };

    const c = slide.content;
    let yPos = 0.5;

    // Title (only if exists)
    if (c.title) {
      pptSlide.addText(c.title, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: textColor,
        fontFace: 'Calibri',
        align: 'left',
      });
      yPos += 1;
    }

    // Subtitle (only if exists)
    if (c.subtitle) {
      pptSlide.addText(c.subtitle, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.6,
        fontSize: 18,
        bold: true,
        color: accentColor,
        fontFace: 'Calibri',
      });
      yPos += 0.8;
    }

    // Description (only if exists)
    if (c.description) {
      pptSlide.addText(c.description, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 1,
        fontSize: 14,
        color: textColor,
        fontFace: 'Calibri',
      });
      yPos += 1.2;
    }

    // Bullets (only if exist)
    if (c.bullets && c.bullets.length > 0) {
      const bulletItems = c.bullets.map((b) => ({
        text: b,
        options: { bullet: true, indent: 0 },
      }));
      pptSlide.addText(bulletItems, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 3,
        fontSize: 13,
        color: textColor,
        fontFace: 'Calibri',
      });
      yPos += 2;
    }

    // Stats (only if exist)
    if (c.stats && c.stats.length > 0) {
      const cols = Math.min(c.stats.length, 4);
      c.stats.forEach((stat, si) => {
        const colWidth = 9 / cols;
        const x = 0.5 + (si % cols) * colWidth;
        const y = yPos + Math.floor(si / cols) * 1.2;
        pptSlide.addText(stat.value, {
          x,
          y,
          w: colWidth - 0.2,
          h: 0.5,
          fontSize: 24,
          bold: true,
          color: accentColor,
          align: 'center',
        });
        pptSlide.addText(stat.label, {
          x,
          y: y + 0.55,
          w: colWidth - 0.2,
          h: 0.4,
          fontSize: 10,
          color: textColor,
          align: 'center',
        });
      });
      yPos += 1.5;
    }

    // Cards (only if exist)
    if (c.cards && c.cards.length > 0) {
      const cols = c.cards.length <= 3 ? c.cards.length : 3;
      c.cards.forEach((card, ci) => {
        const colWidth = 9 / cols;
        const x = 0.5 + (ci % cols) * colWidth;
        const y = yPos + Math.floor(ci / cols) * 1.2;
        pptSlide.addText(card.title, {
          x,
          y,
          w: colWidth - 0.2,
          h: 0.4,
          fontSize: 12,
          bold: true,
          color: accentColor,
        });
        pptSlide.addText(card.description, {
          x,
          y: y + 0.45,
          w: colWidth - 0.2,
          h: 0.7,
          fontSize: 10,
          color: textColor,
        });
      });
    }

    // Timeline (only if exist)
    if (c.timeline && c.timeline.length > 0) {
      c.timeline.forEach((item, ti) => {
        const y = yPos + ti * 0.9;
        pptSlide.addText(item.step, {
          x: 0.5,
          y,
          w: 0.8,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: accentColor,
          align: 'center',
        });
        pptSlide.addText(item.title, {
          x: 1.4,
          y,
          w: 3,
          h: 0.4,
          fontSize: 12,
          bold: true,
          color: textColor,
        });
        pptSlide.addText(item.description, {
          x: 4.5,
          y,
          w: 5,
          h: 0.4,
          fontSize: 10,
          color: textColor,
        });
      });
    }

    // Team (only if exist)
    if (c.team && c.team.length > 0) {
      const cols = Math.min(c.team.length, 3);
      c.team.forEach((member, mi) => {
        const colWidth = 9 / cols;
        const x = 0.5 + (mi % cols) * colWidth;
        const y = yPos + Math.floor(mi / cols) * 1;
        pptSlide.addText(member.name, {
          x,
          y,
          w: colWidth - 0.2,
          h: 0.4,
          fontSize: 12,
          bold: true,
          color: textColor,
          align: 'center',
        });
        pptSlide.addText(member.role, {
          x,
          y: y + 0.45,
          w: colWidth - 0.2,
          h: 0.4,
          fontSize: 10,
          color: textColor,
          align: 'center',
        });
      });
    }

    // CTA (only if exists)
    if (c.cta) {
      pptSlide.addText(`"${c.cta}"`, {
        x: 0.5,
        y: 5,
        w: 9,
        h: 0.5,
        fontSize: 14,
        italic: true,
        bold: true,
        color: accentColor,
        align: 'center',
      });
    }
  }

  return pptx;
}

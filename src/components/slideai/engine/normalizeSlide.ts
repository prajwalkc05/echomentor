import type { Slide, SlideContent, LayoutType } from '../../../types/slideai';
import { sanitizeBullets, truncateText } from './typography';

function bulletsToComparison(bullets: string[]): SlideContent['comparison'] {
  const mid = Math.ceil(bullets.length / 2);
  return {
    left: { title: 'Traditional', items: bullets.slice(0, mid) },
    right: { title: 'Modern', items: bullets.slice(mid) },
  };
}

function bulletsToCards(bullets: string[]): SlideContent['cards'] {
  return bullets.slice(0, 6).map((b, i) => ({
    title: `Step ${i + 1}`,
    description: b,
    icon: ['⚡', '🔒', '📈', '🧠', '🔄', '✨'][i % 6],
  }));
}

function bulletsToTimeline(bullets: string[]): SlideContent['timeline'] {
  return bullets.slice(0, 6).map((b, i) => ({
    step: String(i + 1).padStart(2, '0'),
    title: truncateText(b, 48),
    description: '',
  }));
}

function bulletsToStats(bullets: string[]): SlideContent['stats'] {
  const defaults = [
    { value: '10x', label: 'Impact', color: '#3CF2FF' },
    { value: '99%', label: 'Reliability', color: '#a78bfa' },
    { value: '-40%', label: 'Cost', color: '#10B981' },
    { value: '3x', label: 'Speed', color: '#FFD84D' },
  ];
  return bullets.slice(0, 4).map((b, i) => {
    const match = b.match(/(\d+[x%]?|\-\d+%?)/i);
    return {
      value: match?.[1] || defaults[i]?.value || `${i + 1}x`,
      label: truncateText(b.replace(match?.[0] || '', '').trim() || `Metric ${i + 1}`, 32),
      color: defaults[i]?.color,
    };
  });
}

export function normalizeSlideContent(
  layout: LayoutType,
  raw: SlideContent
): SlideContent {
  const c: SlideContent = { ...raw };

  c.title = truncateText(c.title || 'Untitled Slide', 80);
  if (c.subtitle) c.subtitle = truncateText(c.subtitle, 100);
  if (c.description) c.description = truncateText(c.description, 220);
  if (c.bullets) c.bullets = sanitizeBullets(c.bullets, 5);

  switch (layout) {
    case 'comparison':
      if (!c.comparison && c.bullets?.length) {
        c.comparison = bulletsToComparison(c.bullets);
        c.bullets = undefined;
      } else if (c.comparison && c.bullets?.length) {
        // keep comparison; bullets optional for notes
      } else if (!c.comparison) {
        c.comparison = {
          left: { title: 'Before', items: ['Manual workflows', 'High friction', 'Slow delivery'] },
          right: { title: 'After', items: ['Automated pipelines', 'Low friction', 'Fast iteration'] },
        };
      }
      break;

    case 'architecture':
    case 'grid-cards':
      if (!c.cards?.length && c.bullets?.length) {
        c.cards = bulletsToCards(c.bullets);
      }
      if (!c.cards?.length) {
        c.cards = [
          { title: 'Discover', description: 'Map goals and constraints', icon: '🔍' },
          { title: 'Design', description: 'Architect the solution', icon: '📐' },
          { title: 'Deliver', description: 'Ship and measure outcomes', icon: '🚀' },
        ];
      }
      break;

    case 'timeline':
    case 'methodology':
      if (!c.timeline?.length && c.bullets?.length) {
        c.timeline = bulletsToTimeline(c.bullets);
      }
      break;

    case 'stats-grid':
      if (!c.stats?.length && c.bullets?.length) {
        c.stats = bulletsToStats(c.bullets);
      }
      break;

    case 'quote':
      if (!c.quote && c.description) {
        c.quote = c.description;
        c.description = undefined;
      }
      if (!c.quote && c.subtitle) {
        c.quote = c.subtitle;
      }
      if (!c.quote) c.quote = '"Your key insight belongs here."';
      break;

    case 'cover-hero':
    case 'full-image':
      if (!c.subtitle && c.description) {
        c.subtitle = truncateText(c.description, 90);
      }
      break;

    case 'bullets-image':
    case 'split-left-text':
    case 'split-right-text':
    case 'results':
      if (!c.bullets?.length && c.description) {
        const parts = c.description.split(/[.;]\s+/).filter((p) => p.length > 8);
        if (parts.length >= 2) {
          c.bullets = sanitizeBullets(parts, 5);
          c.description = truncateText(parts[0], 100);
        } else if (c.description.length > 10) {
          c.bullets = sanitizeBullets([c.description], 1);
        }
      }
      if (!c.imageUrl && !c.imagePrompt) {
        c.imagePrompt = [c.title, c.highlight, ...(c.bullets || []).slice(0, 1)].filter(Boolean).join(', ');
        c.needsImage = true;
      }
      break;

    default:
      break;
  }

  return c;
}

export function normalizeSlide(slide: Slide): Slide {
  return {
    ...slide,
    content: normalizeSlideContent(slide.layout, slide.content),
  };
}

export function normalizeSlides(slides: Slide[]): Slide[] {
  return slides.map((s, i) =>
    normalizeSlide({
      ...s,
      order: i,
      content: normalizeSlideContent(s.layout, {
        ...s.content,
        title: s.content.title || `Slide ${i + 1}`,
      }),
    })
  );
}

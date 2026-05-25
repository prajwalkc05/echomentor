import type { Slide, SlideContent, LayoutType, GenerationConfig } from '../../types/slideai';

const VISUAL_LAYOUTS: LayoutType[] = [
  'cover-hero',
  'split-left-text',
  'split-right-text',
  'bullets-image',
  'full-image',
  'grid-cards',
  'results',
];

export function parseAIJson(text: string): unknown {
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) cleaned = fence[1].trim();
  const jsonStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');
  if (jsonStart >= 0 && (arrStart < 0 || jsonStart < arrStart)) {
    cleaned = cleaned.slice(jsonStart);
  } else if (arrStart >= 0) {
    cleaned = cleaned.slice(arrStart);
  }
  return JSON.parse(cleaned);
}

function toStringList(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>;
          return String(o.text || o.label || o.title || o.point || o.description || '').trim();
        }
        return String(item).trim();
      })
      .filter((s) => s.length > 0);
  }
  if (typeof value === 'string') {
    return value.split(/\n/).map((s) => s.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
  }
  return undefined;
}

/** Normalize one AI slide object into SlideContent */
export function coerceSlideContent(raw: Record<string, unknown>): SlideContent {
  const nested = (raw.content && typeof raw.content === 'object'
    ? raw.content
    : raw) as Record<string, unknown>;

  const bullets =
    toStringList(nested.bullets) ||
    toStringList(nested.bulletPoints) ||
    toStringList(nested.points) ||
    toStringList(nested.keyPoints) ||
    toStringList(raw.bullets);

  const title = String(
    nested.title || raw.title || nested.heading || raw.heading || 'Untitled Slide'
  ).trim();

  const content: SlideContent = {
    title,
    subtitle: nested.subtitle ? String(nested.subtitle) : undefined,
    highlight: nested.highlight ? String(nested.highlight) : undefined,
    description: nested.description
      ? String(nested.description)
      : nested.summary
        ? String(nested.summary)
        : undefined,
    bullets,
    quote: nested.quote ? String(nested.quote) : undefined,
    author: nested.author ? String(nested.author) : undefined,
    cta: nested.cta ? String(nested.cta) : undefined,
    imagePrompt: nested.imagePrompt
      ? String(nested.imagePrompt)
      : nested.image
        ? String(nested.image)
        : undefined,
    imageUrl: nested.imageUrl ? String(nested.imageUrl) : undefined,
    imageAlt: nested.imageAlt ? String(nested.imageAlt) : undefined,
    tags: toStringList(nested.tags),
  };

  if (Array.isArray(nested.cards)) {
    content.cards = nested.cards.map((card: any, i: number) => ({
      title: String(card?.title || `Item ${i + 1}`),
      description: String(card?.description || card?.text || ''),
      icon: card?.icon ? String(card.icon) : '📌',
    }));
  }

  if (Array.isArray(nested.stats)) {
    content.stats = nested.stats.map((s: any) => ({
      value: String(s?.value ?? s?.metric ?? '—'),
      label: String(s?.label ?? s?.name ?? 'Metric'),
      color: s?.color ? String(s.color) : undefined,
    }));
  }

  if (Array.isArray(nested.timeline)) {
    content.timeline = nested.timeline.map((t: any, i: number) => ({
      step: String(t?.step ?? i + 1),
      title: String(t?.title ?? t?.phase ?? `Step ${i + 1}`),
      description: String(t?.description ?? t?.text ?? ''),
    }));
  }

  if (nested.comparison && typeof nested.comparison === 'object') {
    const comp = nested.comparison as Record<string, unknown>;
    const mapSide = (side: unknown, fallbackTitle: string) => {
      if (!side || typeof side !== 'object') {
        return { title: fallbackTitle, items: [] as string[] };
      }
      const s = side as Record<string, unknown>;
      return {
        title: String(s.title || fallbackTitle),
        items: toStringList(s.items) || toStringList(s.points) || [],
      };
    };
    content.comparison = {
      left: mapSide(comp.left, 'Option A'),
      right: mapSide(comp.right, 'Option B'),
    };
  }

  if (Array.isArray(nested.team)) {
    content.team = nested.team.map((m: any) => ({
      name: String(m?.name ?? 'Team Member'),
      role: String(m?.role ?? m?.title ?? ''),
      avatar: m?.avatar ? String(m.avatar) : undefined,
    }));
  }

  return content;
}

export function mapRawSlides(raw: unknown[], config: GenerationConfig): Slide[] {
  return raw.map((item, i) => {
    const s = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const layout = (s.layout || (s.content as any)?.layout || 'split-left-text') as LayoutType;
    const content = coerceSlideContent(s);

    return {
      id: `${Date.now().toString(36)}_${i}`,
      layout,
      theme: config.theme,
      content,
      order: i,
    };
  });
}

export function extractSlidesFromAIResponse(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== 'object') return [];
  const obj = parsed as Record<string, unknown>;
  if (Array.isArray(obj.slides)) return obj.slides;
  if (Array.isArray(obj.presentation)) return obj.presentation;
  if (Array.isArray(obj.data)) return obj.data;
  return [];
}

function buildImagePrompt(slide: Slide, topic: string): string {
  const c = slide.content;
  const bits = [
    topic,
    c.title,
    c.highlight,
    c.subtitle,
    ...(c.bullets || []).slice(0, 2),
    ...(c.cards || []).slice(0, 1).map((card) => card.title),
  ].filter(Boolean);
  return `${bits.join(', ')}, professional presentation visual, modern editorial style, relevant to slide topic, high quality, no text overlay`;
}

export function enrichSlidesWithImages(slides: Slide[], topic: string, enabled = true): Slide[] {
  if (!enabled) return slides;
  return slides.map((slide) => {
    if (!VISUAL_LAYOUTS.includes(slide.layout) && slide.layout !== 'stats-grid') {
      return slide;
    }
    const c = slide.content;
    if (c.imageUrl) return slide;
    return {
      ...slide,
      content: {
        ...c,
        imagePrompt: c.imagePrompt || buildImagePrompt(slide, topic),
        needsImage: true,
      },
    };
  });
}

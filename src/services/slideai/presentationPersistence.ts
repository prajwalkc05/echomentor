import type { Presentation, Slide, ThemeId } from '../../types/slideai';

const STORAGE_KEY = 'echomentor_slideai_presentations';
const MAX_STORED = 30;

export interface StoredPresentationMeta {
  id: string;
  title: string;
  thumbnail?: string;
  template: ThemeId;
  slideCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredPresentation extends StoredPresentationMeta {
  slides: Slide[];
  description?: string;
}

function parseDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function loadAll(): StoredPresentation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(items: StoredPresentation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_STORED)));
}

/** First-slide text thumbnail for recent list */
export function buildTextThumbnail(presentation: Presentation): string {
  const first = presentation.slides[0];
  if (!first) return presentation.title.slice(0, 40);
  const c = first.content;
  const line = c.highlight || c.subtitle || c.title || presentation.title;
  return line.slice(0, 60);
}

export function savePresentationToStorage(
  presentation: Presentation,
  thumbnail?: string
): StoredPresentation {
  const now = new Date().toISOString();
  const stored: StoredPresentation = {
    id: presentation.id,
    title: presentation.title,
    description: presentation.description,
    thumbnail: thumbnail || buildTextThumbnail(presentation),
    template: presentation.theme,
    slideCount: presentation.slides.length,
    createdAt: presentation.createdAt
      ? parseDate(presentation.createdAt).toISOString()
      : now,
    updatedAt: now,
    slides: presentation.slides,
  };

  const all = loadAll().filter((p) => p.id !== presentation.id);
  all.unshift(stored);
  saveAll(all);
  return stored;
}

export function getRecentPresentations(limit = 10): StoredPresentationMeta[] {
  return loadAll()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
    .map(({ slides: _s, description: _d, ...meta }) => meta);
}

export function loadPresentationById(id: string): StoredPresentation | null {
  return loadAll().find((p) => p.id === id) || null;
}

export function deletePresentationFromStorage(id: string) {
  saveAll(loadAll().filter((p) => p.id !== id));
}

export function clearAllPresentations() {
  localStorage.removeItem(STORAGE_KEY);
}

export function storedToPresentation(stored: StoredPresentation): Presentation {
  return {
    id: stored.id,
    title: stored.title,
    description: stored.description,
    theme: stored.template,
    slides: stored.slides,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt),
  };
}

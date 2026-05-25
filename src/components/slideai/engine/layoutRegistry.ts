import type { LayoutType } from '../../../types/slideai';

export interface LayoutMeta {
  id: LayoutType;
  label: string;
  icon: string;
  description: string;
  needsImage?: boolean;
  aliases?: LayoutType[];
}

export const LAYOUT_REGISTRY: LayoutMeta[] = [
  { id: 'cover-hero', label: 'Hero', icon: '🎯', description: 'Opening title with highlight and CTA' },
  { id: 'split-left-text', label: 'Split Left', icon: '◧', description: 'Text left, visual right', needsImage: true },
  { id: 'split-right-text', label: 'Split Right', icon: '◨', description: 'Visual left, text right', needsImage: true },
  { id: 'center-title', label: 'Center Focus', icon: '⬛', description: 'Centered title and key message' },
  { id: 'bullets-image', label: 'Bullets + Image', icon: '📋', description: 'Concise points with visual', needsImage: true },
  { id: 'full-image', label: 'Image Focus', icon: '🖼️', description: 'Full-bleed hero image', needsImage: true },
  { id: 'grid-cards', label: 'Card Grid', icon: '⊞', description: 'Feature cards in a grid' },
  { id: 'timeline', label: 'Timeline', icon: '📅', description: 'Process or roadmap steps' },
  { id: 'stats-grid', label: 'Statistics', icon: '📊', description: 'Metrics and KPIs' },
  { id: 'team-grid', label: 'Team', icon: '👥', description: 'People and roles' },
  { id: 'comparison', label: 'Comparison', icon: '⚖️', description: 'Before/after or vs columns' },
  { id: 'quote', label: 'Quote', icon: '💬', description: 'Pull quote with attribution' },
  { id: 'architecture', label: 'Flow Diagram', icon: '🏗️', description: 'Process or system flow cards' },
  { id: 'results', label: 'Results', icon: '📈', description: 'Outcomes and impact' },
  { id: 'thank-you', label: 'Thank You', icon: '🙏', description: 'Closing slide' },
];

export function pickLayoutForContent(hints: {
  hasStats?: boolean;
  hasTimeline?: boolean;
  hasCards?: boolean;
  hasComparison?: boolean;
  hasQuote?: boolean;
  bulletCount?: number;
  index?: number;
  total?: number;
}): LayoutType {
  if (hints.index === 0) return 'cover-hero';
  if (hints.index !== undefined && hints.total && hints.index === hints.total - 1) return 'thank-you';
  if (hints.hasStats) return 'stats-grid';
  if (hints.hasTimeline) return 'timeline';
  if (hints.hasCards) return 'grid-cards';
  if (hints.hasComparison) return 'comparison';
  if (hints.hasQuote) return 'quote';
  if ((hints.bulletCount || 0) >= 3) return 'bullets-image';
  return 'split-left-text';
}

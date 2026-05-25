/** Presentation typography scale — title 42–64px at scale 1 */
export const TYPO = {
  title: { min: 42, max: 64, weight: 800 },
  subtitle: { min: 22, max: 28, weight: 600 },
  highlight: { min: 18, max: 22, weight: 700 },
  body: { min: 16, max: 20, weight: 400, lineHeight: 1.7 },
  caption: { min: 12, max: 14, weight: 500 },
  stat: { min: 36, max: 48, weight: 900 },
} as const;

export function scaledFont(
  role: keyof typeof TYPO,
  scale: number,
  variant: 'min' | 'max' = 'max'
): number {
  const spec = TYPO[role];
  const base = 'min' in spec && variant in spec ? (spec as { min: number; max: number })[variant] : (spec as { min: number }).min;
  const sized = base * scale * 0.92;
  return Math.max(Math.round(sized), role === 'title' ? 14 : 8);
}

export function truncateText(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen - 1).trim() + '…';
}

/** Cap bullets and trim long lines for presentation density */
export function sanitizeBullets(bullets?: string[], max = 5): string[] {
  if (!bullets?.length) return [];
  return bullets
    .slice(0, max)
    .map((b) => truncateText(b.replace(/^[-*•]\s*/, '').trim(), 120))
    .filter(Boolean);
}

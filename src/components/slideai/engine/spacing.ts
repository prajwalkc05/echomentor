/** 16:9 slide composition grid */
export const SLIDE_SPACING = {
  padding: 60,
  maxContentWidth: 1200,
  gap: 32,
  sectionGap: 24,
  cardGap: 16,
} as const;

export function slidePadding(scale: number): number {
  return Math.max(SLIDE_SPACING.padding * scale, 12);
}

export function slideGap(scale: number): number {
  return Math.max(SLIDE_SPACING.gap * scale, 8);
}

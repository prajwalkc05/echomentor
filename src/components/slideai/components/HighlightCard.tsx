import type { ThemeId } from '../../../types/slideai';
import { getTheme } from '../../../templates/slideai/themes';
import { scaledFont } from '../engine/typography';

interface HighlightCardProps {
  text: string;
  theme: ThemeId;
  scale?: number;
}

export function HighlightCard({ text, theme, scale = 1 }: HighlightCardProps) {
  const t = getTheme(theme);
  return (
    <div
      className="rounded-xl"
      style={{
        background: `${t.colors.primary}12`,
        border: `1px solid ${t.colors.primary}35`,
        padding: `${14 * scale}px ${20 * scale}px`,
        marginBottom: `${16 * scale}px`,
      }}
    >
      <p
        style={{
          fontFamily: t.colors.bodyFont,
          fontSize: scaledFont('highlight', scale),
          color: t.colors.primary,
          fontWeight: 700,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

import type { ThemeId } from '../../../types/slideai';
import { getTheme } from '../../../templates/slideai/themes';
import { scaledFont } from '../engine/typography';

interface QuoteBlockProps {
  quote: string;
  author?: string;
  title?: string;
  theme: ThemeId;
  scale?: number;
}

export function QuoteBlock({ quote, author, title, theme, scale = 1 }: QuoteBlockProps) {
  const t = getTheme(theme);
  const isDark = theme !== 'corporate-yellow';

  return (
    <div className="flex flex-col items-center justify-center text-center w-full">
      {title && (
        <h2
          style={{
            fontFamily: t.colors.headingFont,
            fontSize: scaledFont('subtitle', scale),
            color: t.colors.textMuted,
            fontWeight: 700,
            marginBottom: 24 * scale,
          }}
        >
          {title}
        </h2>
      )}
      <div
        style={{
          fontSize: scaledFont('title', scale, 'min') * 0.85,
          lineHeight: 1.35,
          fontFamily: t.colors.headingFont,
          fontWeight: 800,
          color: t.colors.text,
          maxWidth: '85%',
          fontStyle: 'italic',
          textShadow: isDark ? `0 0 30px ${t.colors.primary}30` : 'none',
        }}
      >
        {quote.startsWith('"') ? quote : `"${quote}"`}
      </div>
      <div
        className="mx-auto"
        style={{
          width: 120 * scale,
          height: 3 * scale,
          background: `linear-gradient(90deg, transparent, ${t.colors.primary}, transparent)`,
          margin: `${28 * scale}px 0`,
        }}
      />
      {author && (
        <p
          style={{
            fontFamily: t.colors.bodyFont,
            fontSize: scaledFont('body', scale),
            color: t.colors.primary,
            fontWeight: 600,
          }}
        >
          — {author}
        </p>
      )}
    </div>
  );
}

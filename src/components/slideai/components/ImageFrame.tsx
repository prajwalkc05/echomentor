import React from 'react';
import type { ThemeId } from '../../../types/slideai';
import { getTheme } from '../../../templates/slideai/themes';

interface ImageFrameProps {
  theme: ThemeId;
  scale?: number;
  size?: 'small' | 'medium' | 'large';
  imageUrl?: string;
  imagePrompt?: string;
  imageAlt?: string;
  onImageClick?: () => void;
  showUploadHint?: boolean;
}

export function ImageFrame({
  theme,
  scale = 1,
  size = 'medium',
  imageUrl,
  imagePrompt,
  imageAlt,
  onImageClick,
  showUploadHint,
}: ImageFrameProps) {
  const t = getTheme(theme);
  const isDark = theme !== 'corporate-yellow';
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const dims =
    size === 'large'
      ? { w: 800, h: 600 }
      : size === 'medium'
        ? { w: 600, h: 450 }
        : { w: 400, h: 300 };
  const minH = size === 'large' ? 160 * scale : size === 'medium' ? 100 * scale : 60 * scale;

  const src =
    imageUrl ||
    (() => {
      const query = imagePrompt || 'professional presentation';
      const encoded = encodeURIComponent(
        `professional presentation slide, ${query}, clean minimal high quality, no text`
      );
      return `https://image.pollinations.ai/prompt/${encoded}?width=${dims.w}&height=${dims.h}&nologo=true&model=flux`;
    })();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl w-full h-full ${onImageClick ? 'cursor-pointer' : ''}`}
      onClick={onImageClick}
      style={{
        border: `1px solid ${t.colors.border}`,
        boxShadow: isDark ? `0 0 40px ${t.colors.primary}20` : '0 8px 40px rgba(0,0,0,0.1)',
        minHeight: minH,
        background: !loaded || error
          ? `linear-gradient(135deg, ${t.colors.cardBg}, ${t.colors.primary}18)`
          : 'transparent',
      }}
    >
      {!error && (
        <img
          src={src}
          alt={imageAlt || imagePrompt || 'Slide visual'}
          className="w-full h-full object-cover"
          style={{ display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          width={dims.w}
          height={dims.h}
        />
      )}
      {showUploadHint && onImageClick && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.35)',
            fontSize: Math.max(10 * scale, 9),
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Click to upload or replace
        </div>
      )}
      {error && imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: t.colors.textMuted }}>
          Image failed to load
        </div>
      )}
    </div>
  );
}

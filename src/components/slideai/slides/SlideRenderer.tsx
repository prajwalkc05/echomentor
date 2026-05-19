import React from 'react';
import { motion } from 'framer-motion';
import type { Slide, ThemeId } from '../../../types/slideai';
import { getTheme } from '../../../templates/slideai/themes';
import { SlideBackground } from './SlideBackgrounds';

interface SlideRendererProps {
  slide: Slide;
  theme: ThemeId;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<Slide>) => void;
  scale?: number;
  animate?: boolean;
}

function SlideImage({
  prompt,
  theme,
  size = 'medium',
  type = 'tech',
  imageUrl,
}: {
  prompt?: string;
  theme: ThemeId;
  size?: 'small' | 'medium' | 'large';
  type?: string;
  imageUrl?: string;
}) {
  const t = getTheme(theme);
  const isDark = theme !== 'corporate-yellow';
  const [loaded, setLoaded] = React.useState(false);

  const dims = size === 'large' ? { w: 800, h: 600 } : size === 'medium' ? { w: 600, h: 450 } : { w: 400, h: 300 };
  const minH = size === 'large' ? 160 : size === 'medium' ? 100 : 60;

  const src = imageUrl || (() => {
    const query = prompt || type;
    const encodedPrompt = encodeURIComponent(
      `professional presentation slide, ${query}, clean minimal high quality, no text`
    );
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.w}&height=${dims.h}&nologo=true&model=flux`;
  })();

  return (
    <div
      className="relative overflow-hidden rounded-2xl w-full h-full"
      style={{
        border: `1px solid ${t.colors.border}`,
        boxShadow: isDark ? `0 0 40px ${t.colors.primary}20` : '0 8px 40px rgba(0,0,0,0.1)',
        minHeight: minH,
        background: !loaded ? `linear-gradient(135deg, ${t.colors.cardBg}, ${t.colors.primary}20)` : 'transparent',
      }}
    >
      <img
        src={src}
        alt={prompt || type}
        className="w-full h-full object-cover"
        style={{ display: loaded ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
        width={dims.w}
        height={dims.h}
      />
    </div>
  );
}



// ─── COVER HERO ────────────────────────────────────────────────────────────────
function CoverHeroLayout({ slide, theme, scale = 1, isEditing, onUpdate }: { slide: Slide; theme: ThemeId; scale?: number; isEditing?: boolean; onUpdate?: (updates: Partial<Slide>) => void }) {
  const t = getTheme(theme);
  const c = slide.content;
  const isDark = theme !== 'corporate-yellow';
  const fs = (size: number) => Math.max(size * scale * 0.9, 10);
  const [editingField, setEditingField] = React.useState<string | null>(null);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12" style={{ zIndex: 10, position: 'relative' }}>
      {isEditing && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          fontSize: '11px',
          color: t.colors.primary,
          background: `${t.colors.primary}20`,
          padding: '4px 8px',
          borderRadius: '4px',
          fontWeight: 600,
        }}>
          Click to edit
        </div>
      )}
      {/* Tags */}
      {c.tags && c.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center mb-4" style={{ marginBottom: `${16 * scale}px` }}>
          {c.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                background: `${t.colors.primary}20`,
                border: `1px solid ${t.colors.primary}40`,
                color: t.colors.primary,
                fontSize: `${fs(10)}px`,
                padding: `${4 * scale}px ${12 * scale}px`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Main Title */}
      {editingField === 'title' && isEditing ? (
        <input
          autoFocus
          value={c.title || ''}
          onChange={(e) => onUpdate?.({ content: { ...c, title: e.target.value } })}
          onBlur={() => setEditingField(null)}
          onKeyDown={(e) => e.key === 'Escape' && setEditingField(null)}
          className="font-black leading-none mb-4 text-center bg-transparent border-b-2 outline-none w-full"
          style={{
            fontFamily: t.colors.headingFont,
            fontSize: `${fs(52)}px`,
            color: t.colors.text,
            borderColor: t.colors.primary,
            lineHeight: 1.1,
            marginBottom: `${16 * scale}px`,
            maxWidth: '85%',
            margin: '0 auto',
          }}
        />
      ) : (
        <h1
          onClick={() => isEditing && setEditingField('title')}
          className="font-black leading-none mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            fontFamily: t.colors.headingFont,
            fontSize: `${fs(52)}px`,
            color: t.colors.text,
            textShadow: isDark ? `0 0 40px ${t.colors.primary}40` : 'none',
            lineHeight: 1.1,
            marginBottom: `${16 * scale}px`,
            maxWidth: '85%',
            padding: isEditing ? '4px 8px' : '0',
            borderRadius: isEditing ? '4px' : '0',
            background: isEditing ? 'rgba(255,255,255,0.02)' : 'transparent',
          }}
        >
          {c.title || 'Your Presentation Title'}
        </h1>
      )}
      <div
        className="mx-auto"
        style={{
          width: `${180 * scale}px`,
          height: `${4 * scale}px`,
          background: `linear-gradient(90deg, transparent, ${t.colors.primary}, ${t.colors.secondary}, transparent)`,
          marginBottom: `${20 * scale}px`,
          borderRadius: `${2 * scale}px`,
        }}
      />

      {/* Subtitle */}
      {c.subtitle && (
        editingField === 'subtitle' && isEditing ? (
          <input
            autoFocus
            value={c.subtitle || ''}
            onChange={(e) => onUpdate?.({ content: { ...c, subtitle: e.target.value } })}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Escape' && setEditingField(null)}
            className="font-semibold mb-3 text-center bg-white/10 border-b-2 outline-none w-full"
            style={{
              fontFamily: t.colors.bodyFont,
              fontSize: `${fs(20)}px`,
              color: isDark ? t.colors.primary : t.colors.secondary,
              borderColor: t.colors.primary,
              marginBottom: `${12 * scale}px`,
              padding: '4px 8px',
            }}
          />
        ) : (
          <p
            onClick={() => isEditing && setEditingField('subtitle')}
            className="font-semibold mb-3 cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: t.colors.bodyFont,
              fontSize: `${fs(20)}px`,
              color: isDark ? t.colors.primary : t.colors.secondary,
              marginBottom: `${12 * scale}px`,
              padding: isEditing ? '4px 8px' : '0',
              borderRadius: isEditing ? '4px' : '0',
              background: isEditing ? 'rgba(255,255,255,0.02)' : 'transparent',
            }}
          >
            {c.subtitle}
          </p>
        )
      )}

      {/* Description */}
      {c.description && (
        editingField === 'description' && isEditing ? (
          <textarea
            autoFocus
            value={c.description || ''}
            onChange={(e) => onUpdate?.({ content: { ...c, description: e.target.value } })}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Escape' && setEditingField(null)}
            className="text-center bg-white/10 border-b-2 outline-none resize-none w-full"
            style={{
              fontFamily: t.colors.bodyFont,
              fontSize: `${fs(15)}px`,
              color: t.colors.textMuted,
              borderColor: t.colors.primary,
              maxWidth: '65%',
              lineHeight: 1.6,
              marginBottom: `${24 * scale}px`,
              padding: '4px 8px',
            }}
          />
        ) : (
          <p
            onClick={() => isEditing && setEditingField('description')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: t.colors.bodyFont,
              fontSize: `${fs(15)}px`,
              color: t.colors.textMuted,
              maxWidth: '65%',
              lineHeight: 1.6,
              marginBottom: `${24 * scale}px`,
              padding: isEditing ? '4px 8px' : '0',
              borderRadius: isEditing ? '4px' : '0',
              background: isEditing ? 'rgba(255,255,255,0.02)' : 'transparent',
            }}
          >
            {c.description}
          </p>
        )
      )}

      {/* CTA */}
      {c.cta && (
        editingField === 'cta' && isEditing ? (
          <input
            autoFocus
            value={c.cta || ''}
            onChange={(e) => onUpdate?.({ content: { ...c, cta: e.target.value } })}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Escape' && setEditingField(null)}
            className="inline-flex items-center gap-2 rounded-full font-bold bg-white/10 border-b-2 outline-none"
            style={{
              borderColor: t.colors.primary,
              padding: `${10 * scale}px ${28 * scale}px`,
              color: '#fff',
              fontSize: `${fs(13)}px`,
            }}
          />
        ) : (
          <div
            onClick={() => isEditing && setEditingField('cta')}
            className="inline-flex items-center gap-2 rounded-full font-bold cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
              padding: `${10 * scale}px ${28 * scale}px`,
              color: '#fff',
              fontSize: `${fs(13)}px`,
              boxShadow: `0 0 30px ${t.colors.primary}40`,
            }}
          >
            {c.cta}
          </div>
        )
      )}
    </div>
  );
}

// ─── SPLIT LEFT TEXT ───────────────────────────────────────────────────────────
function SplitLeftTextLayout({ slide, theme, scale = 1, isEditing, onUpdate }: { slide: Slide; theme: ThemeId; scale?: number; isEditing?: boolean; onUpdate?: (updates: Partial<Slide>) => void }) {
  const t = getTheme(theme);
  const c = slide.content;
  const isDark = theme !== 'corporate-yellow';
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const [editingField, setEditingField] = React.useState<string | null>(null);

  return (
    <div className="absolute inset-0 flex" style={{ zIndex: 10, padding: `${40 * scale}px` }}>
      {/* Left: Text */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '55%', paddingRight: `${32 * scale}px` }}
      >
        {/* Accent line */}
        <div
          style={{
            width: `${50 * scale}px`,
            height: `${4 * scale}px`,
            background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`,
            marginBottom: `${16 * scale}px`,
            borderRadius: `${2 * scale}px`,
          }}
        />

        {editingField === 'title' && isEditing ? (
          <input
            autoFocus
            value={c.title || ''}
            onChange={(e) => onUpdate?.({ content: { ...c, title: e.target.value } })}
            onBlur={() => setEditingField(null)}
            className="font-black mb-4 bg-transparent border-b-2 outline-none"
            style={{
              fontFamily: t.colors.headingFont,
              fontSize: `${fs(36)}px`,
              color: t.colors.text,
              borderColor: t.colors.primary,
              lineHeight: 1.15,
              marginBottom: `${16 * scale}px`,
            }}
          />
        ) : (
          <h2
            onClick={() => isEditing && setEditingField('title')}
            className="font-black mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: t.colors.headingFont,
              fontSize: `${fs(36)}px`,
              color: t.colors.text,
              lineHeight: 1.15,
              marginBottom: `${16 * scale}px`,
            }}
          >
            {c.title}
          </h2>
        )}

        {c.description && (
          editingField === 'description' && isEditing ? (
            <textarea
              autoFocus
              value={c.description || ''}
              onChange={(e) => onUpdate?.({ content: { ...c, description: e.target.value } })}
              onBlur={() => setEditingField(null)}
              className="mb-4 bg-transparent border-b-2 outline-none resize-none"
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(14)}px`,
                color: t.colors.textMuted,
                borderColor: t.colors.primary,
                lineHeight: 1.7,
                marginBottom: `${16 * scale}px`,
              }}
            />
          ) : (
            <p
              onClick={() => isEditing && setEditingField('description')}
              className="mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(14)}px`,
                color: t.colors.textMuted,
                lineHeight: 1.7,
                marginBottom: `${16 * scale}px`,
              }}
            >
              {c.description}
            </p>
          )
        )}

        {c.bullets && c.bullets.length > 0 && (
          <ul className="space-y-2">
            {c.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2"
                style={{ gap: `${10 * scale}px` }}
              >
                <span
                  className="shrink-0 rounded-full flex items-center justify-center font-bold"
                  style={{
                    width: `${20 * scale}px`,
                    height: `${20 * scale}px`,
                    minWidth: `${20 * scale}px`,
                    background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                    fontSize: `${fs(9)}px`,
                    color: '#fff',
                    marginTop: `${2 * scale}px`,
                  }}
                >
                  {i + 1}
                </span>
                {editingField === `bullet-${i}` && isEditing ? (
                  <input
                    autoFocus
                    value={b}
                    onChange={(e) => {
                      const newBullets = [...(c.bullets || [])];
                      newBullets[i] = e.target.value;
                      onUpdate?.({ content: { ...c, bullets: newBullets } });
                    }}
                    onBlur={() => setEditingField(null)}
                    className="flex-1 bg-transparent border-b-2 outline-none"
                    style={{
                      fontFamily: t.colors.bodyFont,
                      fontSize: `${fs(13)}px`,
                      color: t.colors.text,
                      borderColor: t.colors.primary,
                      lineHeight: 1.5,
                    }}
                  />
                ) : (
                  <span
                    onClick={() => isEditing && setEditingField(`bullet-${i}`)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      fontFamily: t.colors.bodyFont,
                      fontSize: `${fs(13)}px`,
                      color: t.colors.text,
                      lineHeight: 1.5,
                    }}
                  >
                    {b}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: Image */}
      <div
        className="flex items-center justify-center"
        style={{ width: '45%', paddingLeft: `${16 * scale}px` }}
      >
        <div
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${t.colors.border}`,
            boxShadow: isDark ? `0 0 40px ${t.colors.primary}20` : '0 8px 40px rgba(0,0,0,0.1)',
          }}
        >
          <SlideImage theme={theme} size="large" type="tech" imageUrl={c.imageUrl} prompt={c.title} />
        </div>
      </div>
    </div>
  );
}

// ─── SPLIT RIGHT TEXT ──────────────────────────────────────────────────────────
function SplitRightTextLayout({ slide, theme, scale = 1, isEditing, onUpdate }: { slide: Slide; theme: ThemeId; scale?: number; isEditing?: boolean; onUpdate?: (updates: Partial<Slide>) => void }) {
  const t = getTheme(theme);
  const c = slide.content;
  const isDark = theme !== 'corporate-yellow';
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const [editingField, setEditingField] = React.useState<string | null>(null);

  return (
    <div className="absolute inset-0 flex" style={{ zIndex: 10, padding: `${40 * scale}px` }}>
      {/* Left: Image */}
      <div style={{ width: '45%', paddingRight: `${16 * scale}px` }}>
        <div
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${t.colors.border}`,
            boxShadow: isDark ? `0 0 40px ${t.colors.primary}20` : '0 8px 40px rgba(0,0,0,0.1)',
          }}
        >
          <SlideImage theme={theme} size="large" type="business" imageUrl={c.imageUrl} prompt={c.title} />
        </div>
      </div>

      {/* Right: Text */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '55%', paddingLeft: `${32 * scale}px` }}
      >
        <div
          style={{
            width: `${50 * scale}px`,
            height: `${4 * scale}px`,
            background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`,
            marginBottom: `${16 * scale}px`,
            borderRadius: `${2 * scale}px`,
          }}
        />
        {editingField === 'title' && isEditing ? (
          <input
            autoFocus
            value={c.title || ''}
            onChange={(e) => onUpdate?.({ content: { ...c, title: e.target.value } })}
            onBlur={() => setEditingField(null)}
            className="font-black mb-4 bg-transparent border-b-2 outline-none"
            style={{
              fontFamily: t.colors.headingFont,
              fontSize: `${fs(34)}px`,
              color: t.colors.text,
              borderColor: t.colors.primary,
              lineHeight: 1.15,
              marginBottom: `${16 * scale}px`,
            }}
          />
        ) : (
          <h2
            onClick={() => isEditing && setEditingField('title')}
            className="font-black mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: t.colors.headingFont,
              fontSize: `${fs(34)}px`,
              color: t.colors.text,
              lineHeight: 1.15,
              marginBottom: `${16 * scale}px`,
            }}
          >
            {c.title}
          </h2>
        )}
        {c.description && (
          editingField === 'description' && isEditing ? (
            <textarea
              autoFocus
              value={c.description || ''}
              onChange={(e) => onUpdate?.({ content: { ...c, description: e.target.value } })}
              onBlur={() => setEditingField(null)}
              className="bg-transparent border-b-2 outline-none resize-none"
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(14)}px`,
                color: t.colors.textMuted,
                borderColor: t.colors.primary,
                lineHeight: 1.7,
                marginBottom: `${16 * scale}px`,
              }}
            />
          ) : (
            <p
              onClick={() => isEditing && setEditingField('description')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(14)}px`,
                color: t.colors.textMuted,
                lineHeight: 1.7,
                marginBottom: `${16 * scale}px`,
              }}
            >
              {c.description}
            </p>
          )
        )}
        {c.bullets && c.bullets.length > 0 && (
          <ul className="space-y-2">
            {c.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    width: `${8 * scale}px`,
                    height: `${8 * scale}px`,
                    minWidth: `${8 * scale}px`,
                    background: t.colors.primary,
                    marginTop: `${6 * scale}px`,
                    boxShadow: `0 0 6px ${t.colors.primary}`,
                  }}
                />
                {editingField === `bullet-${i}` && isEditing ? (
                  <input
                    autoFocus
                    value={b}
                    onChange={(e) => {
                      const newBullets = [...(c.bullets || [])];
                      newBullets[i] = e.target.value;
                      onUpdate?.({ content: { ...c, bullets: newBullets } });
                    }}
                    onBlur={() => setEditingField(null)}
                    className="flex-1 bg-transparent border-b-2 outline-none"
                    style={{
                      fontFamily: t.colors.bodyFont,
                      fontSize: `${fs(13)}px`,
                      color: t.colors.text,
                      borderColor: t.colors.primary,
                      lineHeight: 1.5,
                    }}
                  />
                ) : (
                  <span
                    onClick={() => isEditing && setEditingField(`bullet-${i}`)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      fontFamily: t.colors.bodyFont,
                      fontSize: `${fs(13)}px`,
                      color: t.colors.text,
                      lineHeight: 1.5,
                    }}
                  >
                    {b}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── CENTER TITLE ──────────────────────────────────────────────────────────────
function CenterTitleLayout({ slide, theme, scale = 1, isEditing, onUpdate }: { slide: Slide; theme: ThemeId; scale?: number; isEditing?: boolean; onUpdate?: (updates: Partial<Slide>) => void }) {
  const t = getTheme(theme);
  const c = slide.content;
  const isDark = theme !== 'corporate-yellow';
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const [editingField, setEditingField] = React.useState<string | null>(null);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${40 * scale}px` }}>
      {/* Header */}
      <div className="text-center mb-6" style={{ marginBottom: `${24 * scale}px` }}>
        <div
          className="mx-auto mb-3"
          style={{
            width: `${60 * scale}px`,
            height: `${4 * scale}px`,
            background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`,
            borderRadius: `${2 * scale}px`,
            marginBottom: `${12 * scale}px`,
          }}
        />
        {editingField === 'title' && isEditing ? (
          <input
            autoFocus
            value={c.title || ''}
            onChange={(e) => onUpdate?.({ content: { ...c, title: e.target.value } })}
            onBlur={() => setEditingField(null)}
            className="w-full text-center bg-transparent border-b-2 outline-none"
            style={{
              fontFamily: t.colors.headingFont,
              fontSize: `${fs(38)}px`,
              color: t.colors.text,
              borderColor: t.colors.primary,
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          />
        ) : (
          <h2
            onClick={() => isEditing && setEditingField('title')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: t.colors.headingFont,
              fontSize: `${fs(38)}px`,
              color: t.colors.text,
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          >
            {c.title}
          </h2>
        )}
        {c.description && (
          editingField === 'description' && isEditing ? (
            <textarea
              autoFocus
              value={c.description || ''}
              onChange={(e) => onUpdate?.({ content: { ...c, description: e.target.value } })}
              onBlur={() => setEditingField(null)}
              className="w-full text-center bg-transparent border-b-2 outline-none resize-none"
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(15)}px`,
                color: t.colors.textMuted,
                borderColor: t.colors.primary,
                lineHeight: 1.7,
                maxWidth: '70%',
                margin: `${12 * scale}px auto 0`,
              }}
            />
          ) : (
            <p
              onClick={() => isEditing && setEditingField('description')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(15)}px`,
                color: t.colors.textMuted,
                lineHeight: 1.7,
                maxWidth: '70%',
                margin: `${12 * scale}px auto 0`,
              }}
            >
              {c.description}
            </p>
          )
        )}
      </div>

      {/* Bullets grid */}
      {c.bullets && c.bullets.length > 0 && (
        <div
          className="grid gap-3 flex-1"
          style={{
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: `${12 * scale}px`,
          }}
        >
          {c.bullets.map((b, i) => (
            <div
              key={i}
              className="rounded-xl flex items-center gap-3"
              style={{
                background: `${t.colors.primary}10`,
                border: `1px solid ${t.colors.border}`,
                padding: `${12 * scale}px ${16 * scale}px`,
              }}
            >
              <span
                className="font-black"
                style={{
                  fontSize: `${fs(20)}px`,
                  color: t.colors.primary,
                  fontFamily: t.colors.headingFont,
                  minWidth: `${24 * scale}px`,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {editingField === `bullet-${i}` && isEditing ? (
                <input
                  autoFocus
                  value={b}
                  onChange={(e) => {
                    const newBullets = [...(c.bullets || [])];
                    newBullets[i] = e.target.value;
                    onUpdate?.({ content: { ...c, bullets: newBullets } });
                  }}
                  onBlur={() => setEditingField(null)}
                  className="flex-1 bg-transparent border-b-2 outline-none"
                  style={{
                    fontFamily: t.colors.bodyFont,
                    fontSize: `${fs(12)}px`,
                    color: t.colors.text,
                    borderColor: t.colors.primary,
                    lineHeight: 1.4,
                  }}
                />
              ) : (
                <span
                  onClick={() => isEditing && setEditingField(`bullet-${i}`)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: t.colors.bodyFont,
                    fontSize: `${fs(12)}px`,
                    color: t.colors.text,
                    lineHeight: 1.4,
                  }}
                >
                  {b}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {c.cta && (
        <div
          className="text-center mt-4"
          style={{
            marginTop: `${16 * scale}px`,
            fontFamily: t.colors.bodyFont,
            fontSize: `${fs(14)}px`,
            color: isDark ? t.colors.primary : t.colors.secondary,
            fontWeight: 700,
            fontStyle: 'italic',
          }}
        >
          "{c.cta}"
        </div>
      )}
    </div>
  );
}

// ─── BULLETS IMAGE ─────────────────────────────────────────────────────────────
function BulletsImageLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const isDark = theme !== 'corporate-yellow';
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${36 * scale}px` }}>
      {/* Title */}
      <div className="mb-4" style={{ marginBottom: `${16 * scale}px` }}>
        <div style={{ width: `${50 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${12 * scale}px`, borderRadius: `${2 * scale}px` }} />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(34)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
        {c.description && (
          <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(13)}px`, color: t.colors.textMuted, marginTop: `${8 * scale}px`, lineHeight: 1.6 }}>
            {c.description}
          </p>
        )}
      </div>

      {/* Content: Bullets + Image */}
      <div className="flex flex-1 gap-6" style={{ gap: `${24 * scale}px` }}>
        {/* Bullets */}
        <div className="flex-1 flex flex-col gap-2" style={{ gap: `${10 * scale}px` }}>
          {c.bullets?.map((b, i) => (
            <div
              key={i}
              className="rounded-xl flex items-start gap-3"
              style={{
                background: `${t.colors.primary}08`,
                border: `1px solid ${t.colors.border}`,
                padding: `${10 * scale}px ${14 * scale}px`,
                gap: `${10 * scale}px`,
              }}
            >
              <span
                style={{
                  width: `${24 * scale}px`,
                  height: `${24 * scale}px`,
                  minWidth: `${24 * scale}px`,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${fs(9)}px`,
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(12)}px`, color: t.colors.text, lineHeight: 1.5 }}>
                {b}
              </span>
            </div>
          ))}
        </div>

        {/* Image */}
        <div
          style={{ width: '38%' }}
          className="rounded-2xl overflow-hidden"
        >
          <div
            className="w-full h-full"
            style={{ border: `1px solid ${t.colors.border}`, borderRadius: `${16 * scale}px`, overflow: 'hidden', boxShadow: isDark ? `0 0 30px ${t.colors.primary}20` : '0 8px 30px rgba(0,0,0,0.1)' }}
          >
          <SlideImage theme={theme} size="large" type="cyber" imageUrl={c.imageUrl} prompt={c.title} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GRID CARDS ────────────────────────────────────────────────────────────────
function GridCardsLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const cards = c.cards || [];
  const cols = cards.length <= 4 ? 2 : 3;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${32 * scale}px` }}>
      {/* Header */}
      <div className="mb-4" style={{ marginBottom: `${18 * scale}px` }}>
        <div style={{ width: `${50 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${10 * scale}px`, borderRadius: `${2 * scale}px` }} />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(32)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
        {c.description && (
          <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(13)}px`, color: t.colors.textMuted, marginTop: `${6 * scale}px` }}>
            {c.description}
          </p>
        )}
      </div>

      {/* Cards Grid */}
      <div
        className="flex-1 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${12 * scale}px`,
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-xl"
            style={{
              background: t.colors.cardBg,
              border: `1px solid ${t.colors.border}`,
              padding: `${16 * scale}px`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {card.icon && (
              <div
                className="flex items-center justify-center rounded-xl mb-2"
                style={{
                  width: `${36 * scale}px`,
                  height: `${36 * scale}px`,
                  background: `${t.colors.primary}20`,
                  fontSize: `${fs(18)}px`,
                  marginBottom: `${10 * scale}px`,
                }}
              >
                {card.icon}
              </div>
            )}
            <h4
              style={{
                fontFamily: t.colors.headingFont,
                fontSize: `${fs(14)}px`,
                color: t.colors.text,
                fontWeight: 700,
                marginBottom: `${6 * scale}px`,
              }}
            >
              {card.title}
            </h4>
            <p
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(11)}px`,
                color: t.colors.textMuted,
                lineHeight: 1.5,
              }}
            >
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STATS GRID ────────────────────────────────────────────────────────────────
function StatsGridLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const stats = c.stats || [];

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${40 * scale}px` }}>
      {/* Header */}
      <div className="text-center mb-6" style={{ marginBottom: `${24 * scale}px` }}>
        <div
          className="mx-auto"
          style={{ width: `${60 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${12 * scale}px`, borderRadius: `${2 * scale}px` }}
        />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(36)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
        {c.description && (
          <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(14)}px`, color: t.colors.textMuted, marginTop: `${8 * scale}px` }}>
            {c.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div
        className="flex-1 grid"
        style={{
          gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          gap: `${16 * scale}px`,
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl flex flex-col items-center justify-center text-center"
            style={{
              background: t.colors.cardBg,
              border: `1px solid ${stat.color || t.colors.primary}40`,
              padding: `${24 * scale}px ${16 * scale}px`,
              boxShadow: `0 0 30px ${stat.color || t.colors.primary}15`,
            }}
          >
            <div
              style={{
                fontFamily: t.colors.headingFont,
                fontSize: `${fs(42)}px`,
                fontWeight: 900,
                color: stat.color || t.colors.primary,
                textShadow: `0 0 20px ${stat.color || t.colors.primary}60`,
                lineHeight: 1,
                marginBottom: `${10 * scale}px`,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: t.colors.bodyFont,
                fontSize: `${fs(12)}px`,
                color: t.colors.textMuted,
                lineHeight: 1.4,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
function TimelineLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const items = c.timeline || [];

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${36 * scale}px` }}>
      {/* Header */}
      <div className="mb-4" style={{ marginBottom: `${18 * scale}px` }}>
        <div style={{ width: `${50 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${10 * scale}px`, borderRadius: `${2 * scale}px` }} />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(32)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
        {c.description && (
          <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(13)}px`, color: t.colors.textMuted, marginTop: `${6 * scale}px` }}>
            {c.description}
          </p>
        )}
      </div>

      {/* Timeline items */}
      <div className="flex-1 flex flex-col" style={{ gap: `${10 * scale}px`, overflowY: 'hidden' }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-start" style={{ gap: `${16 * scale}px` }}>
            {/* Step indicator */}
            <div
              className="shrink-0 flex items-center justify-center rounded-full font-black"
              style={{
                width: `${40 * scale}px`,
                height: `${40 * scale}px`,
                minWidth: `${40 * scale}px`,
                background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                fontSize: `${fs(13)}px`,
                color: '#fff',
                boxShadow: `0 0 15px ${t.colors.primary}40`,
              }}
            >
              {item.step}
            </div>

            {/* Connector line */}
            <div className="flex flex-col flex-1" style={{ gap: `${4 * scale}px` }}>
              <div className="flex items-center" style={{ gap: `${10 * scale}px` }}>
                <div style={{ flex: 1, height: `${1 * scale}px`, background: `${t.colors.primary}30` }} />
              </div>
            </div>

            {/* Content */}
            <div
              className="flex-1 rounded-xl"
              style={{
                background: t.colors.cardBg,
                border: `1px solid ${t.colors.border}`,
                padding: `${10 * scale}px ${14 * scale}px`,
              }}
            >
              <h4 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(13)}px`, color: t.colors.primary, fontWeight: 700, marginBottom: `${4 * scale}px` }}>
                {item.title}
              </h4>
              <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(11)}px`, color: t.colors.textMuted, lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TEAM GRID ────────────────────────────────────────────────────────────────
function TeamGridLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const team = c.team || [];
  const colors = [t.colors.primary, t.colors.secondary, t.colors.accent, '#22d3ee', '#f472b6', '#34d399'];

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${36 * scale}px` }}>
      {/* Header */}
      <div className="text-center mb-6" style={{ marginBottom: `${20 * scale}px` }}>
        <div className="mx-auto" style={{ width: `${60 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${12 * scale}px`, borderRadius: `${2 * scale}px` }} />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(34)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
      </div>

      {/* Team grid */}
      <div
        className="flex-1 grid"
        style={{
          gridTemplateColumns: `repeat(${Math.min(team.length, 3)}, 1fr)`,
          gap: `${14 * scale}px`,
        }}
      >
        {team.map((member, i) => (
          <div
            key={i}
            className="rounded-xl flex flex-col items-center text-center"
            style={{
              background: t.colors.cardBg,
              border: `1px solid ${t.colors.border}`,
              padding: `${20 * scale}px ${14 * scale}px`,
            }}
          >
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center font-black mb-3"
              style={{
                width: `${52 * scale}px`,
                height: `${52 * scale}px`,
                background: `linear-gradient(135deg, ${colors[i % colors.length]}40, ${colors[(i + 1) % colors.length]}20)`,
                border: `2px solid ${colors[i % colors.length]}60`,
                fontSize: `${fs(20)}px`,
                color: colors[i % colors.length],
                marginBottom: `${12 * scale}px`,
              }}
            >
              {member.name.charAt(0)}
            </div>
            <h4 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(13)}px`, color: t.colors.text, fontWeight: 700, marginBottom: `${6 * scale}px` }}>
              {member.name}
            </h4>
            <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(10)}px`, color: t.colors.textMuted, lineHeight: 1.4 }}>
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPARISON ───────────────────────────────────────────────────────────────
function ComparisonLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const comparison = (c as any).comparison;
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);

  if (!comparison) return null;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${36 * scale}px` }}>
      {/* Header */}
      <div className="mb-4" style={{ marginBottom: `${18 * scale}px` }}>
        <div style={{ width: `${50 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${10 * scale}px`, borderRadius: `${2 * scale}px` }} />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(32)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
      </div>

      {/* Comparison columns */}
      <div className="flex-1 flex gap-4" style={{ gap: `${16 * scale}px` }}>
        {/* Left */}
        <div
          className="flex-1 rounded-2xl"
          style={{
            background: `rgba(239, 68, 68, 0.08)`,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: `${20 * scale}px`,
          }}
        >
          <h3 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(16)}px`, color: '#ef4444', fontWeight: 800, marginBottom: `${16 * scale}px`, display: 'flex', alignItems: 'center', gap: `${8 * scale}px` }}>
            ✗ {comparison.left.title}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {comparison.left.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start" style={{ marginBottom: `${10 * scale}px`, gap: `${8 * scale}px` }}>
                <span style={{ color: '#ef4444', fontSize: `${fs(12)}px`, marginTop: `${2 * scale}px` }}>✗</span>
                <span style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(12)}px`, color: t.colors.textMuted, lineHeight: 1.4 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center" style={{ width: `${40 * scale}px` }}>
          <div style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(16)}px`, color: t.colors.textMuted, fontWeight: 900, writingMode: 'vertical-rl' }}>VS</div>
        </div>

        {/* Right */}
        <div
          className="flex-1 rounded-2xl"
          style={{
            background: `${t.colors.primary}10`,
            border: `1px solid ${t.colors.primary}40`,
            padding: `${20 * scale}px`,
          }}
        >
          <h3 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(16)}px`, color: t.colors.primary, fontWeight: 800, marginBottom: `${16 * scale}px`, display: 'flex', alignItems: 'center', gap: `${8 * scale}px` }}>
            ✓ {comparison.right.title}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {comparison.right.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start" style={{ marginBottom: `${10 * scale}px`, gap: `${8 * scale}px` }}>
                <span style={{ color: t.colors.primary, fontSize: `${fs(12)}px`, marginTop: `${2 * scale}px` }}>✓</span>
                <span style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(12)}px`, color: t.colors.text, lineHeight: 1.4 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function ResultsLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);
  const stats = c.stats || [];

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${36 * scale}px` }}>
      {/* Header */}
      <div className="mb-4" style={{ marginBottom: `${16 * scale}px` }}>
        <div style={{ width: `${50 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${10 * scale}px`, borderRadius: `${2 * scale}px` }} />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(32)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
        {c.description && (
          <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(13)}px`, color: t.colors.textMuted, marginTop: `${6 * scale}px` }}>
            {c.description}
          </p>
        )}
      </div>

      {/* Stats row */}
      {stats.length > 0 && (
        <div
          className="grid mb-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
            gap: `${12 * scale}px`,
            marginBottom: `${16 * scale}px`,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl text-center"
              style={{
                background: `${stat.color || t.colors.primary}10`,
                border: `1px solid ${stat.color || t.colors.primary}30`,
                padding: `${16 * scale}px ${12 * scale}px`,
              }}
            >
              <div style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(30)}px`, fontWeight: 900, color: stat.color || t.colors.primary, lineHeight: 1, marginBottom: `${6 * scale}px` }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(10)}px`, color: t.colors.textMuted }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bullets */}
      {c.bullets && (
        <div className="flex-1 flex flex-col" style={{ gap: `${8 * scale}px` }}>
          {c.bullets.map((b, i) => (
            <div
              key={i}
              className="flex items-center rounded-lg"
              style={{
                background: t.colors.cardBg,
                border: `1px solid ${t.colors.border}`,
                padding: `${10 * scale}px ${14 * scale}px`,
                gap: `${10 * scale}px`,
              }}
            >
              <span style={{ color: t.colors.primary, fontSize: `${fs(14)}px` }}>→</span>
              <span style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(12)}px`, color: t.colors.text }}>
                {b}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ARCHITECTURE ─────────────────────────────────────────────────────────────
function ArchitectureLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const cards = c.cards || [];
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10, padding: `${36 * scale}px` }}>
      {/* Header */}
      <div className="mb-4" style={{ marginBottom: `${16 * scale}px` }}>
        <div style={{ width: `${50 * scale}px`, height: `${4 * scale}px`, background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.secondary})`, marginBottom: `${10 * scale}px`, borderRadius: `${2 * scale}px` }} />
        <h2 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(32)}px`, color: t.colors.text, fontWeight: 900 }}>
          {c.title}
        </h2>
        {c.description && <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(13)}px`, color: t.colors.textMuted, marginTop: `${6 * scale}px` }}>{c.description}</p>}
      </div>

      {/* Architecture flow */}
      <div className="flex-1 flex items-center justify-between" style={{ gap: `${8 * scale}px` }}>
        {cards.map((card, i) => (
          <React.Fragment key={i}>
            <div
              className="rounded-xl flex flex-col items-center text-center"
              style={{
                flex: 1,
                background: t.colors.cardBg,
                border: `1px solid ${t.colors.primary}40`,
                padding: `${16 * scale}px ${12 * scale}px`,
                boxShadow: `0 0 20px ${t.colors.primary}15`,
              }}
            >
              <div style={{ fontSize: `${fs(28)}px`, marginBottom: `${10 * scale}px` }}>{card.icon}</div>
              <h4 style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(12)}px`, color: t.colors.primary, fontWeight: 700, marginBottom: `${6 * scale}px` }}>
                {card.title}
              </h4>
              <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(10)}px`, color: t.colors.textMuted, lineHeight: 1.4 }}>
                {card.description}
              </p>
            </div>
            {i < cards.length - 1 && (
              <div className="shrink-0" style={{ color: t.colors.primary, fontSize: `${fs(20)}px`, fontWeight: 900 }}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── THANK YOU ────────────────────────────────────────────────────────────────
function ThankYouLayout({ slide, theme, scale = 1 }: { slide: Slide; theme: ThemeId; scale?: number }) {
  const t = getTheme(theme);
  const c = slide.content;
  const isDark = theme !== 'corporate-yellow';
  const fs = (size: number) => Math.max(size * scale * 0.9, 8);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ zIndex: 10, padding: `${40 * scale}px` }}>
      {/* Large thank you */}
      <h1
        style={{
          fontFamily: t.colors.headingFont,
          fontSize: `${fs(60)}px`,
          fontWeight: 900,
          color: t.colors.text,
          textShadow: isDark ? `0 0 40px ${t.colors.primary}40` : 'none',
          lineHeight: 1,
          marginBottom: `${16 * scale}px`,
        }}
      >
        Thank You
      </h1>

      {/* Gradient divider */}
      <div
        className="mx-auto"
        style={{
          width: `${200 * scale}px`,
          height: `${4 * scale}px`,
          background: `linear-gradient(90deg, transparent, ${t.colors.primary}, ${t.colors.secondary}, transparent)`,
          marginBottom: `${24 * scale}px`,
          borderRadius: `${2 * scale}px`,
        }}
      />

      {c.subtitle && (
        <p style={{ fontFamily: t.colors.headingFont, fontSize: `${fs(22)}px`, color: isDark ? t.colors.primary : t.colors.secondary, fontWeight: 700, marginBottom: `${12 * scale}px` }}>
          {c.subtitle}
        </p>
      )}

      {c.description && (
        <p style={{ fontFamily: t.colors.bodyFont, fontSize: `${fs(15)}px`, color: t.colors.textMuted, lineHeight: 1.6, maxWidth: '60%', marginBottom: `${24 * scale}px` }}>
          {c.description}
        </p>
      )}

      {c.cta && (
        <div
          className="rounded-full font-bold"
          style={{
            background: `${t.colors.primary}20`,
            border: `1px solid ${t.colors.primary}50`,
            padding: `${12 * scale}px ${32 * scale}px`,
            color: t.colors.primary,
            fontSize: `${fs(13)}px`,
            fontFamily: t.colors.bodyFont,
          }}
        >
          {c.cta}
        </div>
      )}
    </div>
  );
}

// ─── MAIN RENDERER ─────────────────────────────────────────────────────────────
export function SlideRenderer({
  slide,
  theme,
  isEditing = false,
  onUpdate,
  scale = 1,
  animate = false,
}: SlideRendererProps) {
  const resolvedTheme = slide.theme || theme;

  const layoutProps = { slide, theme: resolvedTheme, scale, isEditing, onUpdate };

  const renderLayout = () => {
    switch (slide.layout) {
      case 'cover-hero': return <CoverHeroLayout {...layoutProps} />;
      case 'split-left-text': return <SplitLeftTextLayout {...layoutProps} />;
      case 'split-right-text': return <SplitRightTextLayout {...layoutProps} />;
      case 'center-title': return <CenterTitleLayout {...layoutProps} />;
      case 'bullets-image': return <BulletsImageLayout {...layoutProps} />;
      case 'grid-cards': return <GridCardsLayout {...layoutProps} />;
      case 'stats-grid': return <StatsGridLayout {...layoutProps} />;
      case 'timeline': return <TimelineLayout {...layoutProps} />;
      case 'team-grid': return <TeamGridLayout {...layoutProps} />;
      case 'comparison': return <ComparisonLayout {...layoutProps} />;
      case 'results': return <ResultsLayout {...layoutProps} />;
      case 'architecture': return <ArchitectureLayout {...layoutProps} />;
      case 'thank-you': return <ThankYouLayout {...layoutProps} />;
      case 'full-image': return <CoverHeroLayout {...layoutProps} />;
      case 'quote': return <CenterTitleLayout {...layoutProps} />;
      case 'methodology': return <TimelineLayout {...layoutProps} />;
      default: return <CenterTitleLayout {...layoutProps} />;
    }
  };

  const Wrapper = animate ? motion.div : 'div';
  const animProps = animate
    ? {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.45, ease: 'easeOut' as const },
      }
    : {};

  return (
    <Wrapper
      className="relative overflow-hidden"
      style={{
        width: '100%',
        paddingTop: '56.25%',
        position: 'relative',
        borderRadius: isEditing ? '0' : `${8 * scale}px`,
      }}
      {...(animProps as any)}
    >
      <div className="absolute inset-0">
        <SlideBackground theme={resolvedTheme} scale={scale} />
        {renderLayout()}
      </div>
    </Wrapper>
  );
}

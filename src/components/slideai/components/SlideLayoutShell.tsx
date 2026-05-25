import React from 'react';
import { slidePadding } from '../engine/spacing';

interface SlideLayoutShellProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
  align?: 'center' | 'start' | 'stretch';
  direction?: 'row' | 'column';
}

/** Consistent slide padding and max-width grid */
export function SlideLayoutShell({
  children,
  scale = 1,
  className = '',
  align = 'stretch',
  direction = 'column',
}: SlideLayoutShellProps) {
  const pad = slidePadding(scale);
  return (
    <div
      className={`absolute inset-0 flex ${className}`}
      style={{
        zIndex: 10,
        padding: pad,
        flexDirection: direction,
        alignItems: align === 'center' ? 'center' : align === 'start' ? 'flex-start' : 'stretch',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        boxSizing: 'border-box',
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <div
        className="w-full h-full flex"
        style={{
          flexDirection: direction,
          gap: 32 * scale,
          maxWidth: 1200 * scale,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}

import React from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export function EditableText({
  value,
  onChange,
  isEditing,
  onEditStart,
  onEditEnd,
  style,
  className,
  placeholder,
  multiline = false,
  rows = 3,
}: EditableTextProps) {
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEditEnd();
    }
    if (e.key === 'Enter' && !multiline) {
      onEditEnd();
    }
  };

  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.Ref<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onEditEnd}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={className}
        style={{
          ...style,
          fontFamily: style?.fontFamily,
          fontSize: style?.fontSize,
          color: style?.color,
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(60,242,255,0.5)',
          borderRadius: '4px',
          padding: '8px 12px',
          outline: 'none',
          resize: 'none',
        }}
      />
    ) : (
      <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onEditEnd}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        style={{
          ...style,
          fontFamily: style?.fontFamily,
          fontSize: style?.fontSize,
          color: style?.color,
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(60,242,255,0.5)',
          borderRadius: '4px',
          padding: '8px 12px',
          outline: 'none',
          width: '100%',
        }}
      />
    );
  }

  return (
    <div
      onClick={onEditStart}
      className={className}
      style={{
        ...style,
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {value || placeholder}
    </div>
  );
}

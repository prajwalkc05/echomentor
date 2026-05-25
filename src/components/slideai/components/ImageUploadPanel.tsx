import { useRef, useState } from 'react';
import { Upload, Sparkles, ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Slide, SlideContent } from '../../../types/slideai';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ImageUploadPanelProps {
  slide: Slide;
  onUpdate: (updates: Partial<Slide>) => void;
}

export function ImageUploadPanel({ slide, onUpdate }: ImageUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const c = slide.content;

  const applyImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image must be under 4MB');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onUpdate({
        content: {
          ...c,
          imageUrl: dataUrl,
          imageAlt: file.name,
          needsImage: false,
        } as SlideContent,
      });
      toast.success('Image added to slide');
    } catch {
      toast.error('Failed to read image');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) applyImage(file);
  };

  const generateAIImage = () => {
    onUpdate({
      content: {
        ...c,
        imageUrl: undefined,
        imagePrompt: c.imagePrompt || c.title || 'professional presentation visual',
        needsImage: true,
      },
    });
    toast.success('AI image will generate on slide preview');
  };

  const useStockPlaceholder = () => {
    onUpdate({
      content: {
        ...c,
        imageUrl: undefined,
        imagePrompt: `stock photo ${c.title || 'business presentation'}`,
        needsImage: true,
      },
    });
    toast.success('Stock-style image placeholder set');
  };

  const removeImage = () => {
    onUpdate({
      content: {
        ...c,
        imageUrl: undefined,
        imageAlt: undefined,
        imagePrompt: c.title,
        needsImage: true,
      },
    });
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl p-6 text-center cursor-pointer transition-all"
        style={{
          background: dragOver ? 'rgba(60,242,255,0.12)' : 'rgba(255,255,255,0.04)',
          border: dragOver ? '2px dashed #3CF2FF' : '2px dashed rgba(255,255,255,0.15)',
        }}
      >
        <Upload size={28} className="mx-auto mb-2" style={{ color: '#3CF2FF' }} />
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Drag & drop image</p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 4 }}>or click to browse (max 4MB)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) applyImage(file);
            e.target.value = '';
          }}
        />
      </div>

      {c.imageUrl && (
        <div className="rounded-lg overflow-hidden relative" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src={c.imageUrl} alt={c.imageAlt || 'Slide'} className="w-full h-24 object-cover" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#ef4444' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
        {c.needsImage ? 'This layout works best with a visual.' : 'Replace or generate a new visual'}
      </p>

      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ background: 'rgba(60,242,255,0.1)', border: '1px solid rgba(60,242,255,0.25)', color: '#3CF2FF' }}
        >
          <ImageIcon size={14} /> Upload image
        </button>
        <button
          type="button"
          onClick={generateAIImage}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
        >
          <Sparkles size={14} /> Generate AI image
        </button>
        <button
          type="button"
          onClick={useStockPlaceholder}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          Use stock-style image
        </button>
      </div>

      <div>
        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 6 }}>
          Image prompt (AI)
        </label>
        <input
          value={c.imagePrompt || ''}
          onChange={(e) => onUpdate({ content: { ...c, imagePrompt: e.target.value } })}
          className="w-full rounded-lg text-white text-xs"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', outline: 'none' }}
          placeholder="Describe the visual..."
        />
      </div>
    </div>
  );
}

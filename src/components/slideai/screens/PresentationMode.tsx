import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Play, Pause } from 'lucide-react';
import { usePresentationStore } from '../../../store/slideai/presentationStore';
import { SlideRenderer } from '../slides/SlideRenderer';

const SLIDE_TRANSITIONS = {
  initial: { opacity: 0, x: 80, scale: 0.96 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -80, scale: 0.96 },
  transition: { duration: 0.45, ease: 'easeInOut' as const },
};

export default function PresentationMode() {
  const {
    currentPresentation,
    presentSlideIndex,
    setPresentSlideIndex,
    setPresentMode,
    setCurrentScreen,
  } = usePresentationStore();

  const slides = currentPresentation?.slides || [];
  const theme = currentPresentation?.theme || 'future-neon';
  const currentSlide = slides[presentSlideIndex];
  const [autoplay, setAutoplay] = useState(false);

  const goNext = useCallback(() => {
    if (presentSlideIndex < slides.length - 1) {
      setPresentSlideIndex(presentSlideIndex + 1);
    }
  }, [presentSlideIndex, slides.length, setPresentSlideIndex]);

  const goPrev = useCallback(() => {
    if (presentSlideIndex > 0) {
      setPresentSlideIndex(presentSlideIndex - 1);
    }
  }, [presentSlideIndex, setPresentSlideIndex]);

  const handleExit = useCallback(() => {
    setPresentMode(false);
    setCurrentScreen('editor');
  }, [setPresentMode, setCurrentScreen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          handleExit();
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, handleExit]);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      if (presentSlideIndex < slides.length - 1) {
        setPresentSlideIndex(presentSlideIndex + 1);
      } else {
        setAutoplay(false);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay, presentSlideIndex, slides.length, setPresentSlideIndex]);

  if (!currentPresentation || !currentSlide) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#000' }}
    >
      {/* Slide area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onClick={goNext}
        style={{ cursor: 'pointer' }}
      >
        <div className="w-full h-full flex items-center justify-center px-4 py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={SLIDE_TRANSITIONS.initial}
              animate={SLIDE_TRANSITIONS.animate}
              exit={SLIDE_TRANSITIONS.exit}
              transition={SLIDE_TRANSITIONS.transition}
              className="w-full"
              style={{
                width: 'min(96vw, calc((100vh - 130px) * 16 / 9))',
                maxHeight: 'calc(100vh - 130px)',
              }}
            >
              <SlideRenderer
                slide={currentSlide}
                theme={currentSlide.theme || theme}
                scale={1}
                animate={true}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Click zones */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/5 flex items-center justify-start pl-4"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          style={{ cursor: presentSlideIndex > 0 ? 'pointer' : 'default' }}
        >
          <AnimatePresence>
            {presentSlideIndex > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                className="flex items-center justify-center rounded-full"
                style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
              >
                <ChevronLeft size={28} color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="absolute right-0 top-0 bottom-0 w-1/5 flex items-center justify-end pr-4"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          style={{ cursor: presentSlideIndex < slides.length - 1 ? 'pointer' : 'default' }}
        >
          <AnimatePresence>
            {presentSlideIndex < slides.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                className="flex items-center justify-center rounded-full"
                style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
              >
                <ChevronRight size={28} color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom HUD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Exit */}
        <button
          onClick={handleExit}
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-sm"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
        >
          <X size={16} /> Exit
        </button>

        {/* Slide dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setPresentSlideIndex(i)}
              whileHover={{ scale: 1.3 }}
              className="rounded-full transition-all"
              style={{
                width: i === presentSlideIndex ? 24 : 8,
                height: 8,
                background: i === presentSlideIndex ? '#3CF2FF' : 'rgba(255,255,255,0.25)',
                boxShadow: i === presentSlideIndex ? '0 0 8px rgba(60,242,255,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Slide counter + controls */}
        <div className="flex items-center gap-3">
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600 }}>
            {presentSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() => setAutoplay((a) => !a)}
            title={autoplay ? 'Pause autoplay' : 'Start autoplay'}
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 32,
              height: 32,
              background: autoplay ? 'rgba(60,242,255,0.2)' : 'rgba(255,255,255,0.08)',
              border: autoplay ? '1px solid rgba(60,242,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
              color: autoplay ? '#3CF2FF' : 'rgba(255,255,255,0.6)',
            }}
          >
            {autoplay ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </motion.div>

      {/* Keyboard hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-xs pointer-events-none"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        Press → or Space to advance • Esc to exit • F for fullscreen
      </motion.div>

      {/* Presenter notes overlay (if notes exist) */}
      {currentSlide.content.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 right-4 max-w-xs rounded-xl p-3"
          style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,216,77,0.3)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ color: '#FFD84D', fontSize: 10, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            📋 Notes
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 1.5 }}>
            {currentSlide.content.notes}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

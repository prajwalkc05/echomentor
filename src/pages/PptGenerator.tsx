import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { usePresentationStore } from '../store/slideai/presentationStore';
import AIGenerator from '../components/slideai/screens/AIGenerator';
import Editor from '../components/slideai/screens/Editor';
import PresentationMode from '../components/slideai/screens/PresentationMode';
import ExportScreen from '../components/slideai/screens/ExportScreen';
import TemplateSelection from '../components/slideai/screens/TemplateSelection';

const TOAST_OPTS = {
  duration: 3000,
  style: {
    background: 'rgba(10,15,40,0.98)',
    color: '#fff',
    border: '1px solid rgba(60,242,255,0.25)',
    borderRadius: '14px',
    fontSize: '14px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  success: { iconTheme: { primary: '#3CF2FF', secondary: '#0a0f1e' } },
  error: { iconTheme: { primary: '#ef4444', secondary: '#0a0f1e' } },
};

export default function PptGenerator() {
  const { currentScreen, isPresentMode, setCurrentScreen } = usePresentationStore();

  useEffect(() => {
    if (currentScreen === 'dashboard') {
      setCurrentScreen('generator');
    }
  }, []);

  const isFullScreen = isPresentMode || currentScreen === 'editor';

  // Full-screen screens rendered via portal to escape sidebar layout
  const fullScreenContent = isFullScreen
    ? createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <Toaster position="bottom-right" toastOptions={TOAST_OPTS} />
          {isPresentMode ? <PresentationMode /> : <Editor />}
        </div>,
        document.body
      )
    : null;

  // Sidebar-compatible screens
  const renderScreen = () => {
    switch (currentScreen) {
      case 'templates': return <TemplateSelection key="templates" />;
      case 'export': return <ExportScreen key="export" />;
      default: return <AIGenerator key="generator" />;
    }
  };

  return (
    <>
      {fullScreenContent}
      <div className="flex-1 overflow-y-auto" style={{ background: '#0a0f1e', display: isFullScreen ? 'none' : undefined }}>
        <Toaster position="bottom-right" toastOptions={TOAST_OPTS} />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

import { create } from 'zustand';
import type { Presentation, Slide, ThemeId, AppScreen, GenerationConfig } from '../../types/slideai';

const MAX_HISTORY = 50;

interface PresentationStore {
  // App state
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;

  // Presentations
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  setCurrentPresentation: (p: Presentation | null) => void;
  addPresentation: (p: Presentation) => void;
  updatePresentation: (id: string, updates: Partial<Presentation>) => void;

  // Editor state
  selectedSlideIndex: number;
  setSelectedSlideIndex: (i: number) => void;
  editingSlide: Slide | null;
  setEditingSlide: (s: Slide | null) => void;

  // Slide operations
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (slides: Slide[]) => void;

  // Undo / Redo
  undoStack: Slide[][];
  redoStack: Slide[][];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  _pushUndoSnapshot: (slides: Slide[]) => void;

  // Generation
  isGenerating: boolean;
  generationProgress: number;
  generationStep: string;
  setGenerating: (v: boolean) => void;
  setGenerationProgress: (v: number, step?: string) => void;

  // Generation config
  generationConfig: GenerationConfig;
  setGenerationConfig: (config: Partial<GenerationConfig>) => void;

  // Present mode
  isPresentMode: boolean;
  presentSlideIndex: number;
  setPresentMode: (v: boolean) => void;
  setPresentSlideIndex: (i: number) => void;

  // Theme
  currentTheme: ThemeId;
  setCurrentTheme: (t: ThemeId) => void;

  // API Key
  apiKey: string;
  setApiKey: (key: string) => void;
}

const defaultGenerationConfig: GenerationConfig = {
  topic: '',
  description: '',
  slideCount: 12,
  tone: 'professional',
  audience: 'executive',
  presentationType: 'business',
  theme: 'future-neon',
  includeImages: true,
};

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  currentScreen: 'dashboard',
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  presentations: [],
  currentPresentation: null,
  setCurrentPresentation: (p) => set({ currentPresentation: p, selectedSlideIndex: 0, undoStack: [], redoStack: [] }),
  addPresentation: (p) => set((s) => ({ presentations: [p, ...s.presentations] })),
  updatePresentation: (id, updates) =>
    set((s) => ({
      presentations: s.presentations.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentPresentation:
        s.currentPresentation?.id === id
          ? { ...s.currentPresentation, ...updates }
          : s.currentPresentation,
    })),

  selectedSlideIndex: 0,
  setSelectedSlideIndex: (i) => set({ selectedSlideIndex: i }),
  editingSlide: null,
  setEditingSlide: (s) => set({ editingSlide: s }),

  // Undo / Redo
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  _pushUndoSnapshot: (slides) =>
    set((s) => {
      const undoStack = [...s.undoStack, slides].slice(-MAX_HISTORY);
      return { undoStack, redoStack: [], canUndo: true, canRedo: false };
    }),

  undo: () =>
    set((s) => {
      if (!s.currentPresentation || s.undoStack.length === 0) return {};
      const undoStack = [...s.undoStack];
      const slides = undoStack.pop()!;
      const redoStack = [...s.redoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const updatedPresentation = { ...s.currentPresentation, slides };
      return {
        undoStack,
        redoStack,
        canUndo: undoStack.length > 0,
        canRedo: true,
        currentPresentation: updatedPresentation,
        presentations: s.presentations.map((p) => p.id === updatedPresentation.id ? updatedPresentation : p),
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.currentPresentation || s.redoStack.length === 0) return {};
      const redoStack = [...s.redoStack];
      const slides = redoStack.pop()!;
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const updatedPresentation = { ...s.currentPresentation, slides };
      return {
        undoStack,
        redoStack,
        canUndo: true,
        canRedo: redoStack.length > 0,
        currentPresentation: updatedPresentation,
        presentations: s.presentations.map((p) => p.id === updatedPresentation.id ? updatedPresentation : p),
      };
    }),

  updateSlide: (slideId, updates) =>
    set((s) => {
      if (!s.currentPresentation) return {};
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const slides = s.currentPresentation.slides.map((sl) =>
        sl.id === slideId ? { ...sl, ...updates } : sl
      );
      const updatedPresentation = { ...s.currentPresentation, slides };
      return {
        undoStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
        currentPresentation: updatedPresentation,
        presentations: s.presentations.map((p) =>
          p.id === updatedPresentation.id ? updatedPresentation : p
        ),
      };
    }),

  addSlide: (slide) =>
    set((s) => {
      if (!s.currentPresentation) return {};
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const slides = [...s.currentPresentation.slides, slide];
      const updatedPresentation = { ...s.currentPresentation, slides };
      return {
        undoStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
        currentPresentation: updatedPresentation,
        selectedSlideIndex: slides.length - 1,
      };
    }),

  removeSlide: (slideId) =>
    set((s) => {
      if (!s.currentPresentation) return {};
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const slides = s.currentPresentation.slides.filter((sl) => sl.id !== slideId);
      const updatedPresentation = { ...s.currentPresentation, slides };
      return {
        undoStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
        currentPresentation: updatedPresentation,
        selectedSlideIndex: Math.max(0, s.selectedSlideIndex - 1),
      };
    }),

  reorderSlides: (slides) =>
    set((s) => {
      if (!s.currentPresentation) return {};
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      return {
        undoStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
        currentPresentation: { ...s.currentPresentation, slides },
      };
    }),

  isGenerating: false,
  generationProgress: 0,
  generationStep: '',
  setGenerating: (v) => set({ isGenerating: v }),
  setGenerationProgress: (v, step = '') =>
    set({ generationProgress: v, generationStep: step }),

  generationConfig: defaultGenerationConfig,
  setGenerationConfig: (config) =>
    set((s) => ({ generationConfig: { ...s.generationConfig, ...config } })),

  isPresentMode: false,
  presentSlideIndex: 0,
  setPresentMode: (v) => set({ isPresentMode: v, presentSlideIndex: 0 }),
  setPresentSlideIndex: (i) => set({ presentSlideIndex: i }),

  currentTheme: 'future-neon',
  setCurrentTheme: (t) => set({ currentTheme: t }),

  apiKey: '',
  setApiKey: (key) => set({ apiKey: key }),
}));

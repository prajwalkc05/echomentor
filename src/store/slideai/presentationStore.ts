import { create } from 'zustand';
import type { Presentation, Slide, ThemeId, AppScreen, GenerationConfig } from '../../types/slideai';
import {
  savePresentationToStorage,
  storedToPresentation,
  getRecentPresentations,
} from '../../services/slideai/presentationPersistence';

const MAX_HISTORY = 50;

function loadPresentationsFromLocal(): Presentation[] {
  try {
    const recent = getRecentPresentations(30);
    return recent.map(meta => ({
      id: meta.id,
      title: meta.title,
      description: '',
      theme: meta.template,
      slides: [],
      createdAt: new Date(meta.createdAt),
      updatedAt: new Date(meta.updatedAt),
    }));
  } catch {
    return [];
  }
}

interface PresentationStore {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;

  presentations: Presentation[];
  currentPresentation: Presentation | null;
  setCurrentPresentation: (p: Presentation | null) => void;
  addPresentation: (p: Presentation) => void;
  updatePresentation: (id: string, updates: Partial<Presentation>) => void;
  savePresentation: () => void;
  loadPresentationsFromStorage: () => void;

  selectedSlideIndex: number;
  setSelectedSlideIndex: (i: number) => void;
  editingSlide: Slide | null;
  setEditingSlide: (s: Slide | null) => void;

  updateSlide: (slideId: string, updates: Partial<Slide>, options?: { skipUndo?: boolean }) => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (slides: Slide[]) => void;

  undoStack: Slide[][];
  redoStack: Slide[][];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pushUndoSnapshot: () => void;

  isGenerating: boolean;
  generationProgress: number;
  generationStep: string;
  setGenerating: (v: boolean) => void;
  setGenerationProgress: (v: number, step?: string) => void;

  generationConfig: GenerationConfig;
  setGenerationConfig: (config: Partial<GenerationConfig>) => void;

  isPresentMode: boolean;
  presentSlideIndex: number;
  setPresentMode: (v: boolean) => void;
  setPresentSlideIndex: (i: number) => void;

  currentTheme: ThemeId;
  setCurrentTheme: (t: ThemeId) => void;

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

function syncPresentationList(
  presentations: Presentation[],
  updated: Presentation
): Presentation[] {
  const exists = presentations.some((p) => p.id === updated.id);
  if (exists) {
    return presentations.map((p) => (p.id === updated.id ? updated : p));
  }
  return [updated, ...presentations];
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  currentScreen: 'dashboard',
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  presentations: loadPresentationsFromLocal(),
  currentPresentation: null,
  setCurrentPresentation: (p) =>
    set({ currentPresentation: p, selectedSlideIndex: 0, undoStack: [], redoStack: [] }),

  addPresentation: (p) => {
    savePresentationToStorage(p);
    set((s) => ({
      presentations: [p, ...s.presentations.filter((x) => x.id !== p.id)].slice(0, 30),
    }));
  },

  updatePresentation: (id, updates) =>
    set((s) => {
      const next =
        s.currentPresentation?.id === id
          ? { ...s.currentPresentation, ...updates, updatedAt: new Date() }
          : s.currentPresentation;
      const presentations = s.presentations.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      );
      if (next) savePresentationToStorage(next);
      return {
        presentations,
        currentPresentation: next,
      };
    }),

  savePresentation: () => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;
    const updated = { ...currentPresentation, updatedAt: new Date() };
    savePresentationToStorage(updated);
    set((s) => ({
      currentPresentation: updated,
      presentations: syncPresentationList(s.presentations, updated),
    }));
  },

  loadPresentationsFromStorage: () => {
    set({ presentations: loadPresentationsFromLocal() });
  },

  selectedSlideIndex: 0,
  setSelectedSlideIndex: (i) => set({ selectedSlideIndex: i }),
  editingSlide: null,
  setEditingSlide: (s) => set({ editingSlide: s }),

  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  pushUndoSnapshot: () =>
    set((s) => {
      if (!s.currentPresentation) return {};
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      return { undoStack, redoStack: [], canUndo: true, canRedo: false };
    }),

  undo: () =>
    set((s) => {
      if (!s.currentPresentation || s.undoStack.length === 0) return {};
      const undoStack = [...s.undoStack];
      const slides = undoStack.pop()!;
      const redoStack = [...s.redoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const updatedPresentation = { ...s.currentPresentation, slides };
      savePresentationToStorage(updatedPresentation);
      return {
        undoStack,
        redoStack,
        canUndo: undoStack.length > 0,
        canRedo: true,
        currentPresentation: updatedPresentation,
        presentations: syncPresentationList(s.presentations, updatedPresentation),
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.currentPresentation || s.redoStack.length === 0) return {};
      const redoStack = [...s.redoStack];
      const slides = redoStack.pop()!;
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const updatedPresentation = { ...s.currentPresentation, slides };
      savePresentationToStorage(updatedPresentation);
      return {
        undoStack,
        redoStack,
        canUndo: true,
        canRedo: redoStack.length > 0,
        currentPresentation: updatedPresentation,
        presentations: syncPresentationList(s.presentations, updatedPresentation),
      };
    }),

  updateSlide: (slideId, updates, options) =>
    set((s) => {
      if (!s.currentPresentation) return {};
      const slides = s.currentPresentation.slides.map((sl) =>
        sl.id === slideId ? { ...sl, ...updates } : sl
      );
      const updatedPresentation = { ...s.currentPresentation, slides, updatedAt: new Date() };
      const patch: Partial<PresentationStore> = {
        currentPresentation: updatedPresentation,
        presentations: syncPresentationList(s.presentations, updatedPresentation),
      };
      if (!options?.skipUndo) {
        patch.undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
        patch.redoStack = [];
        patch.canUndo = true;
        patch.canRedo = false;
      }
      return patch;
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
        presentations: syncPresentationList(s.presentations, updatedPresentation),
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
        presentations: syncPresentationList(s.presentations, updatedPresentation),
        selectedSlideIndex: Math.max(0, s.selectedSlideIndex - 1),
      };
    }),

  reorderSlides: (slides) =>
    set((s) => {
      if (!s.currentPresentation) return {};
      const undoStack = [...s.undoStack, s.currentPresentation.slides].slice(-MAX_HISTORY);
      const updatedPresentation = { ...s.currentPresentation, slides };
      return {
        undoStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
        currentPresentation: updatedPresentation,
        presentations: syncPresentationList(s.presentations, updatedPresentation),
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

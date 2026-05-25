export type ThemeId = 'future-neon' | 'cybersecurity' | 'corporate-yellow' | 'glassmorphism' | 'startup-neon' | 'minimal-dark';

export type LayoutType =
  | 'cover-hero'
  | 'split-left-text'
  | 'split-right-text'
  | 'center-title'
  | 'bullets-image'
  | 'full-image'
  | 'grid-cards'
  | 'timeline'
  | 'stats-grid'
  | 'team-grid'
  | 'methodology'
  | 'comparison'
  | 'thank-you'
  | 'quote'
  | 'architecture'
  | 'results';

export interface SlideContent {
  title?: string;
  subtitle?: string;
  highlight?: string;
  description?: string;
  bullets?: string[];
  imagePrompt?: string;
  needsImage?: boolean;
  cards?: { title: string; description: string; icon?: string }[];
  stats?: { value: string; label: string; color?: string }[];
  timeline?: { step: string; title: string; description: string }[];
  team?: { name: string; role: string; avatar?: string }[];
  comparison?: { left: { title: string; items: string[] }; right: { title: string; items: string[] } };
  quote?: string;
  author?: string;
  imageUrl?: string;
  imageAlt?: string;
  tableData?: { headers: string[]; rows: string[][] };
  tags?: string[];
  cta?: string;
  notes?: string;
}

export interface Slide {
  id: string;
  layout: LayoutType;
  theme?: ThemeId;
  content: SlideContent;
  order: number;
  backgroundColor?: string;
  customStyles?: Record<string, string>;
}

export interface ThemeColors {
  background: string;
  backgroundGradient: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  cardBg: string;
  border: string;
  headingFont: string;
  bodyFont: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: string;
  colors: ThemeColors;
  decorations: string[];
}

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  theme: ThemeId;
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags?: string[];
}

export interface GenerationConfig {
  topic: string;
  description?: string;
  slideContent?: string;
  slideCount: number;
  tone: 'professional' | 'creative' | 'academic' | 'startup' | 'minimal';
  audience: 'executive' | 'technical' | 'academic' | 'general' | 'students';
  presentationType: 'business' | 'research' | 'education' | 'pitch' | 'cybersecurity' | 'tech';
  theme: ThemeId;
  includeImages: boolean;
}

export type AppScreen = 'dashboard' | 'templates' | 'generator' | 'editor' | 'present' | 'export';

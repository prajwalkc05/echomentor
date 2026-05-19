import type { Slide, GenerationConfig, LayoutType } from '../../types/slideai';

const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

interface GeneratedSlideData {
  title: string;
  layout: LayoutType;
  content: Record<string, unknown>;
}

// Save presentation history to backend
async function saveToHistory(config: GenerationConfig): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';
    
    if (!token) return;

    await fetch(`${baseURL}/api/ppt/generate-slides`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: config.topic,
        slideContent: config.slideContent,
        description: config.description,
        slideCount: config.slideCount,
        presentationType: config.presentationType,
        tone: config.tone,
        audience: config.audience,
        theme: config.theme,
      }),
    });
    
    console.log('✅ Presentation saved to history');
  } catch (error) {
    console.warn('⚠️ Failed to save to history:', error);
  }
}

function parseSlideContent(slideContent: string, config: GenerationConfig): GeneratedSlideData[] {
  const lines = slideContent.split('\n');
  const slides: GeneratedSlideData[] = [];
  let currentSlide: any = null;
  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) continue;

    // Detect slide header: "Slide X — Title" or "Slide X: Title"
    const slideMatch = trimmed.match(/^Slide\s+(\d+)\s*[—:—-]\s*(.+)$/i);
    
    if (slideMatch) {
      // Save previous slide
      if (currentSlide) {
        slides.push(currentSlide);
      }
      
      // Start new slide
      const slideNum = parseInt(slideMatch[1]);
      const slideTitle = slideMatch[2].trim();
      
      currentSlide = {
        title: slideTitle,
        layout: slideNum === 1 ? 'cover-hero' : 'split-left-text',
        content: {
          title: slideTitle,
          subtitle: '',
          description: '',
          bullets: [],
          sections: {}
        },
      };
      currentSection = '';
      continue;
    }

    if (!currentSlide) continue;

    // Check if line is a section header (ends with colon and not a bullet)
    if (trimmed.endsWith(':') && !trimmed.startsWith('-')) {
      currentSection = trimmed.slice(0, -1);
      if (!currentSlide.content.sections[currentSection]) {
        currentSlide.content.sections[currentSection] = {
          title: currentSection,
          content: [],
          bullets: []
        };
      }
      continue;
    }

    // Handle bullet points
    if (trimmed.startsWith('-')) {
      const bullet = trimmed.substring(1).trim();
      if (bullet) {
        if (currentSection && currentSlide.content.sections[currentSection]) {
          currentSlide.content.sections[currentSection].bullets.push(bullet);
        }
        currentSlide.content.bullets.push(bullet);
      }
      continue;
    }

    // Handle regular text
    if (trimmed) {
      // Check if it's a main title (ALL CAPS)
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.includes(':')) {
        if (!currentSlide.content.subtitle) {
          currentSlide.content.subtitle = trimmed;
        }
      } else {
        // Add to description or section content
        if (currentSection && currentSlide.content.sections[currentSection]) {
          currentSlide.content.sections[currentSection].content.push(trimmed);
        } else {
          if (currentSlide.content.description) {
            currentSlide.content.description += ' ' + trimmed;
          } else {
            currentSlide.content.description = trimmed;
          }
        }
      }
    }
  }

  // Add last slide
  if (currentSlide) {
    slides.push(currentSlide);
  }

  // Process and enhance slides
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const bulletCount = slide.content.bullets?.length || 0;
    const sections = slide.content.sections || {};
    const sectionKeys = Object.keys(sections);

    // First slide - Cover
    if (i === 0) {
      slide.layout = 'cover-hero';
      const mainTitle = slide.content.subtitle || slide.title;
      const subTitle = slide.content.description || '';
      
      slide.content = {
        title: mainTitle,
        subtitle: subTitle,
        description: slide.content.bullets.slice(0, 3).join(' • ') || `A ${config.tone} presentation for ${config.audience} audience`,
        tags: [config.presentationType, config.tone, new Date().getFullYear().toString()],
        cta: 'Let\'s Get Started',
      };
    }
    // Last slide - Thank You
    else if (i === slides.length - 1 && (
      slide.title.toLowerCase().includes('thank') ||
      slide.title.toLowerCase().includes('conclusion')
    )) {
      slide.layout = 'thank-you';
      slide.content = {
        title: slide.title,
        subtitle: slide.content.subtitle || slide.content.description || 'Thank you for your attention',
        description: slide.content.bullets.slice(0, 2).join(' • ') || '',
        cta: 'Questions?',
      };
    }
    // Middle slides - Determine layout based on content
    else {
      // Consolidate all bullets from sections
      const allBullets: string[] = [];
      sectionKeys.forEach(key => {
        const section = sections[key];
        if (section.bullets && section.bullets.length > 0) {
          allBullets.push(...section.bullets);
        }
        if (section.content && section.content.length > 0) {
          section.content.forEach((text: string) => {
            if (text && text.length > 10) {
              allBullets.push(text);
            }
          });
        }
      });

      // Merge with existing bullets
      const finalBullets = [...new Set([...slide.content.bullets, ...allBullets])];

      // Build description from sections
      let fullDescription = slide.content.description || '';
      sectionKeys.forEach(key => {
        const section = sections[key];
        if (section.content && section.content.length > 0) {
          const sectionText = section.content.join(' ');
          if (sectionText.length > 20 && !fullDescription.includes(sectionText)) {
            fullDescription += (fullDescription ? ' ' : '') + sectionText;
          }
        }
      });

      // Choose layout based on content structure
      if (finalBullets.length >= 6) {
        slide.layout = 'bullets-image';
      } else if (finalBullets.length >= 3 && finalBullets.length < 6) {
        slide.layout = i % 2 === 0 ? 'split-left-text' : 'split-right-text';
      } else if (sectionKeys.length >= 4) {
        slide.layout = 'grid-cards';
        // Convert sections to cards
        slide.content.cards = sectionKeys.slice(0, 6).map(key => ({
          title: key,
          description: sections[key].content.join(' ') || sections[key].bullets.join(', '),
          icon: '📌'
        }));
      } else if (finalBullets.length === 0 && fullDescription.length > 100) {
        slide.layout = 'center-title';
      } else {
        slide.layout = 'split-left-text';
      }

      // Update content
      slide.content = {
        title: slide.title,
        subtitle: slide.content.subtitle,
        description: fullDescription.substring(0, 300),
        bullets: finalBullets.slice(0, 8),
        ...(slide.content.cards && { cards: slide.content.cards })
      };
    }
  }

  return slides;
}

function buildTopicSlides(config: GenerationConfig): GeneratedSlideData[] {
  const { topic, presentationType, tone, audience, slideCount } = config;
  const t = topic.trim();

  const allSlides: GeneratedSlideData[] = [
    {
      title: t,
      layout: 'cover-hero',
      content: {
        subtitle: presentationType === 'business' ? 'Transforming the Future' :
                  presentationType === 'education' ? 'A Complete Learning Guide' :
                  presentationType === 'research' ? 'Research & Analysis' :
                  presentationType === 'cybersecurity' ? 'Security Intelligence Report' :
                  presentationType === 'pitch' ? 'Investor Pitch Deck' : 'Technical Overview',
        description: `A ${tone} presentation for ${audience} audience`,
        tags: [t.split(' ')[0], presentationType, tone, new Date().getFullYear().toString()],
        cta: 'Let\'s Get Started',
      },
    },
    {
      title: 'Overview',
      layout: 'split-left-text',
      content: {
        description: `${t} represents a significant advancement in its field, offering transformative capabilities and real-world impact across multiple domains.`,
        bullets: [
          `${t} addresses critical challenges in modern ${presentationType}`,
          'Proven methodology with measurable outcomes',
          'Scalable approach suitable for diverse use cases',
          'Built on industry best practices and standards',
          'Designed for maximum impact and efficiency',
        ],
      },
    },
  ];

  return allSlides.slice(0, slideCount);
}

export function generateSlidesFromConfig(config: GenerationConfig): Slide[] {
  let slides: GeneratedSlideData[];
  
  if (config.slideContent && config.slideContent.trim()) {
    // Parse user-provided slide content
    slides = parseSlideContent(config.slideContent, config);
  } else {
    // Fallback to topic-based generation
    slides = buildTopicSlides(config);
  }
  
  return slides.map((s, i) => ({
    id: genId(),
    layout: s.layout,
    theme: config.theme,
    content: {
      ...(s.content as any),
      title: s.content.title || s.title,
    },
    order: i,
  }));
}

export async function generateWithAI(
  config: GenerationConfig,
  _apiKey: string,
  onProgress: (p: number, step: string) => void
): Promise<Slide[]> {
  // Always save to history in background
  saveToHistory(config);
  
  // Generate slides locally
  return mockGeneration(config, onProgress);
}

async function mockGeneration(
  config: GenerationConfig,
  onProgress: (p: number, step: string) => void
): Promise<Slide[]> {
  const steps: [number, string][] = [
    [15, `Analyzing "${config.topic}"...`],
    [30, 'Structuring slide outline...'],
    [50, 'Generating content...'],
    [70, 'Creating visual layouts...'],
    [85, 'Applying theme & styles...'],
    [100, 'Complete!'],
  ];

  for (const [progress, step] of steps) {
    onProgress(progress, step);
    await new Promise((r) => setTimeout(r, 350));
  }

  return generateSlidesFromConfig(config);
}

import type { Slide, GenerationConfig, LayoutType } from '../../types/slideai';
import { normalizeSlides } from '../../components/slideai/engine/normalizeSlide';
import { buildPresentationPrompt } from './aiPrompt';
import {
  parseAIJson,
  mapRawSlides,
  extractSlidesFromAIResponse,
  enrichSlidesWithImages,
  coerceSlideContent,
} from './slideContentMapper';

const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

function finalizeSlides(slides: Slide[], config: GenerationConfig): Slide[] {
  const withImages = enrichSlidesWithImages(slides, config.topic, config.includeImages !== false);
  return normalizeSlides(withImages.map((s) => ({ ...s, theme: config.theme })));
}

function parseSlidesFromAIResponse(text: string, config: GenerationConfig): Slide[] | null {
  try {
    const parsed = parseAIJson(text);
    const raw = extractSlidesFromAIResponse(parsed);
    if (raw.length === 0) return null;
    return finalizeSlides(mapRawSlides(raw, config), config);
  } catch (e) {
    console.warn('Failed to parse AI slide JSON:', e);
    return null;
  }
}

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
    const isBulletCheck = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•') || /^\d+[\s.)-]/.test(trimmed);
    if (trimmed.endsWith(':') && !isBulletCheck) {
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
    const bulletMatch = trimmed.match(/^[-*•]\s*(.+)$/) || trimmed.match(/^\d+[\s.)-]+\s*(.+)$/);
    if (bulletMatch) {
      const bullet = bulletMatch[1].trim();
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
    const sections = slide.content.sections as Record<string, any> || {};
    const sectionKeys = Object.keys(sections);

    // First slide - Cover
    if (i === 0) {
      slide.layout = 'cover-hero';
      const mainTitle = slide.content.subtitle || slide.title;
      const subTitle = slide.content.description || '';
      
      slide.content = {
        title: mainTitle,
        subtitle: subTitle,
        description: (Array.isArray(slide.content.bullets) ? slide.content.bullets.slice(0, 3).join(' • ') : '') || `A ${config.tone} presentation for ${config.audience} audience`,
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
        description: (Array.isArray(slide.content.bullets) ? slide.content.bullets.slice(0, 2).join(' • ') : '') || '',
        cta: 'Questions?',
      };
    }
    // Middle slides - Determine layout based on content
    else {
      // Consolidate all bullets from sections
      const allBullets: string[] = [];
      sectionKeys.forEach(key => {
        const section = sections[key];
        if (Array.isArray(section.bullets) && section.bullets.length > 0) {
          allBullets.push(...section.bullets);
        }
        if (Array.isArray(section.content) && section.content.length > 0) {
          section.content.forEach((text: string) => {
            if (text && text.length > 10) {
              allBullets.push(text);
            }
          });
        }
      });

      // Merge with existing bullets
      const existingBullets = Array.isArray(slide.content.bullets) ? slide.content.bullets : [];
      const finalBullets = [...new Set([...existingBullets, ...allBullets])];

      // Build description from sections
      let fullDescription = (typeof slide.content.description === 'string' ? slide.content.description : '') || '';
      sectionKeys.forEach(key => {
        const section = sections[key];
        if (Array.isArray(section.content) && section.content.length > 0) {
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
        slide.content.cards = sectionKeys.slice(0, 6).map(key => {
          const section = sections[key];
          const contentStr = Array.isArray(section.content) ? section.content.join(' ') : '';
          const bulletsStr = Array.isArray(section.bullets) ? section.bullets.join(', ') : '';
          return {
            title: key,
            description: contentStr || bulletsStr,
            icon: '📌'
          };
        });
      } else if (finalBullets.length === 0 && fullDescription.length > 100) {
        slide.layout = 'center-title';
      } else {
        slide.layout = 'split-left-text';
      }

      // Update content
      const descStr = typeof fullDescription === 'string' ? fullDescription : '';
      const cards = slide.content.cards;
      slide.content = {
        title: slide.title,
        subtitle: slide.content.subtitle,
        highlight: finalBullets[0] ? String(finalBullets[0]).slice(0, 80) : undefined,
        description: descStr.substring(0, 300),
        bullets: finalBullets.slice(0, 8),
        imagePrompt: `${slide.title}, ${config.topic}`,
        needsImage: ['split-left-text', 'split-right-text', 'bullets-image'].includes(slide.layout),
        ...(cards && typeof cards === 'object' ? { cards } : {}),
      };
    }
  }

  return slides;
}

function buildTopicSlides(config: GenerationConfig): GeneratedSlideData[] {
  const { topic, presentationType, tone, audience, slideCount } = config;
  const t = topic.trim();

  // Create a pool of slides
  const pool: GeneratedSlideData[] = [
    // 1. Cover
    {
      title: t,
      layout: 'cover-hero',
      content: {
        subtitle: presentationType === 'business' ? 'Transforming the Future' :
                  presentationType === 'education' ? 'A Complete Learning Guide' :
                  presentationType === 'research' ? 'Research & Analysis' :
                  presentationType === 'cybersecurity' ? 'Security Intelligence Report' :
                  presentationType === 'pitch' ? 'Investor Pitch Deck' : 'Technical Overview',
        description: `A ${tone} presentation custom tailored for a ${audience} audience, detailing strategies, methodologies, and outcomes for ${t}.`,
        tags: [t.split(' ')[0], presentationType, tone, new Date().getFullYear().toString()],
        cta: 'Let\'s Get Started',
      },
    },
    // 2. Executive Summary / Overview
    {
      title: 'Executive Summary',
      layout: 'split-left-text',
      content: {
        imagePrompt: `${t}, executive summary business presentation`,
        description: `${t} represents a significant paradigm shift in its field, offering cutting-edge capabilities and real-world impact across multiple operational domains.`,
        bullets: [
          `Addresses critical structural challenges in modern ${presentationType}`,
          'Establishes a proven methodology with clear and measurable outcomes',
          'Offers highly scalable solutions suitable for diverse organizational needs',
          'Built on rigorous industry best practices and global standards',
          'Designed for maximum strategic impact, efficiency, and robustness',
        ],
      },
    },
    // 3. Strategic Goals & Vision
    {
      title: 'Strategic Goals',
      layout: 'center-title',
      content: {
        subtitle: 'Our Core Objectives',
        description: `Delivering sustainable innovation, operational excellence, and unmatched value through the strategic deployment and scaling of ${t}.`,
        cta: 'Learn More about our Vision',
      },
    },
    // 4. Core Challenges & Problem Statement
    {
      title: 'Current Challenges',
      layout: 'split-right-text',
      content: {
        imagePrompt: `${t}, challenges and problems infographic`,
        description: 'Organizations face multi-faceted bottlenecks that require dynamic, modern interventions rather than legacy frameworks.',
        bullets: [
          'High complexity and operational friction limiting speed to market',
          'Difficulty in keeping pace with rapid technological advancements',
          'Inadequate scaling mechanisms that fail under peak demands',
          'Growing security concerns and compliance requirements',
          'Lack of centralized, data-driven decision making pipelines',
        ],
      },
    },
    // 5. Solution Architecture
    {
      title: 'Solution Architecture',
      layout: 'architecture',
      content: {
        description: `A comprehensive overview of the logical flow and layered structural components of the ${t} solution framework.`,
        bullets: [
          'Data Ingestion Layer: High-throughput connectors to gather multi-source inputs',
          'Processing Core: Automated analysis engine leveraging advanced model execution',
          'Security & Governance: Continuous encryption and strict policy compliance checks',
          'Delivery & Application: Intuitive frontends and API endpoints for seamless action',
        ],
      },
    },
    // 6. Key Value Pillars
    {
      title: 'Key Pillars of Value',
      layout: 'grid-cards',
      content: {
        description: `The foundational strengths of ${t} that drive business acceleration and technical resilience.`,
        cards: [
          { title: 'Extreme Velocity', description: 'Accelerating workflows from hours to milliseconds through automation.', icon: '⚡' },
          { title: 'Robust Safety', description: 'Hardened security frameworks protecting critical resources and keys.', icon: '🔒' },
          { title: 'Elastic Scale', description: 'Dynamically adapts and scales horizontally to meet high concurrency.', icon: '📈' },
          { title: 'Smart Insights', description: 'AI-assisted diagnostics revealing optimization opportunities.', icon: '🧠' },
          { title: 'Seamless Sync', description: 'Integrates out-of-the-box with existing databases and tools.', icon: '🔄' },
          { title: 'User Centered', description: 'Tailored specifically for modern developers and stakeholders.', icon: '👥' },
        ],
      },
    },
    // 7. Success & Impact Metrics
    {
      title: 'Success & Impact Metrics',
      layout: 'stats-grid',
      content: {
        description: 'Key performance indicators showcasing the quantified improvements and performance multipliers.',
        stats: [
          { value: '10x', label: 'Processing Speedup', color: '#3CF2FF' },
          { value: '99.9%', label: 'System Reliability', color: '#a78bfa' },
          { value: '-45%', label: 'Operating Overhead', color: '#10B981' },
          { value: '3x', label: 'Developer Output', color: '#FFD84D' },
        ],
      },
    },
    // 8. Implementation Timeline
    {
      title: 'Implementation Roadmap',
      layout: 'timeline',
      content: {
        description: 'Phased methodology designed to ensure smooth deployment, onboarding, and rapid returns on investment.',
        timeline: [
          { step: '01', title: 'Discovery & Audit', description: 'Thorough mapping of current pipelines and goal alignment.' },
          { step: '02', title: 'Architecture & Design', description: 'Configuring custom endpoints, connectors, and security rules.' },
          { step: '03', title: 'Pilot & Validation', description: 'Deploying initial use cases in pre-production staging environments.' },
          { step: '04', title: 'Full Scale Launch', description: 'Migrating production workflows to the optimized infrastructure.' },
          { step: '05', title: 'Optimization Loop', description: 'Continuous tuning and updates based on real operational feedback.' },
        ],
      },
    },
    // 9. Comparative Advantage
    {
      title: 'Comparative Analysis',
      layout: 'comparison',
      content: {
        description: `How our strategic model for ${t} compares against legacy approaches and generic competitors.`,
        bullets: [
          'Feature Depth: Custom modular features versus standard out-of-the-box utilities',
          'Deploy Speed: Fully automated provisioning versus manual script configuration',
          'Long-term Cost: Minimal cloud footprint versus bloated, expensive licensing models',
          'Integration Level: Native API sync versus clunky database connectors and webhooks',
        ],
      },
    },
    // 10. Expected Outcomes
    {
      title: 'Expected Outcomes',
      layout: 'results',
      content: {
        description: 'Realized business values and technical accomplishments post-implementation.',
        bullets: [
          'Unified control plane simplifying operational complexity',
          'Future-proofed technological foundation ready to adopt subsequent shifts',
          'Enhanced team collaboration and productivity multipliers',
          'Drastic reduction in MTTR (Mean Time To Resolution) for system issues',
        ],
      },
    },
    // 11. Strategic Leadership
    {
      title: 'Our Leadership Team',
      layout: 'team-grid',
      content: {
        description: 'Meet the industry experts and visionaries driving the development and successful integration of this project.',
        team: [
          { name: 'Dr. Sarah Connor', role: 'Chief Innovation Officer' },
          { name: 'David Lightman', role: 'Head of Cybersecurity & AI' },
          { name: 'Marcus Wright', role: 'Principal Systems Architect' },
        ],
      },
    },
    // 12. Strategic Inspiration
    {
      title: 'Strategic Inspiration',
      layout: 'quote',
      content: {
        subtitle: 'Looking to the Horizon',
        description: '"Innovation is not about creating complex systems; it is about taking complex challenges and rendering them elegantly simple, secure, and accessible to all."',
        cta: 'The Path Forward',
      },
    },
    // 13. Visual Insights
    {
      title: 'Core Enablers',
      layout: 'bullets-image',
      content: {
        imagePrompt: `${t}, technology workflow dashboard`,
        description: 'The visual workflow, training resources, and continuous telemetry monitoring that keep systems running smoothly.',
        bullets: [
          'Comprehensive developer documentation and quickstart starter templates',
          'Self-healing automation pipelines that instantly resolve network drops',
          '24/7/365 live system health monitors and unified metrics dashboards',
          'Global server-edge replication ensuring sub-millisecond response latency',
        ],
      },
    },
  ];

  // Dynamically build the exact requested slideCount slides.
  // The first slide is always the cover (index 0).
  // The last slide is always a thank-you slide (index slideCount - 1).
  // Middle slides are taken from the pool or dynamically generated if pool is exceeded.
  
  const selectedSlides: GeneratedSlideData[] = [];
  
  // 1. First slide is cover
  selectedSlides.push(pool[0]);
  
  // 2. Add middle slides
  const middleCount = slideCount - 2;
  for (let i = 0; i < middleCount; i++) {
    // Cycle through pool indices 1 to 12
    const poolIndex = 1 + (i % (pool.length - 1));
    const originalSlide = pool[poolIndex];
    
    // Duplicate to avoid side-effects
    selectedSlides.push({
      ...originalSlide,
      // If we are cycling, adjust the title slightly
      title: i >= (pool.length - 1) ? `${originalSlide.title} (Part ${Math.floor(i / (pool.length - 1)) + 1})` : originalSlide.title,
    });
  }
  
  // 3. Last slide is thank-you
  selectedSlides.push({
    title: 'Thank You',
    layout: 'thank-you',
    content: {
      subtitle: `Empowering ${t}`,
      description: `Thank you for exploring the future of ${t} with us. We invite you to join us on this journey of innovation, excellence, and shared success.`,
      cta: 'Get in Touch: contact@echomentor.com',
    },
  });

  return selectedSlides;
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
  
  const mapped = slides.map((s, i) => ({
    id: genId(),
    layout: s.layout,
    theme: config.theme,
    content: {
      ...(s.content as any),
      title: s.content.title || s.title,
    },
    order: i,
  }));
  return finalizeSlides(mapped, config);
}

export async function generateWithAI(
  config: GenerationConfig,
  onProgress: (p: number, step: string) => void
): Promise<Slide[]> {
  saveToHistory(config);

  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const prompt = buildPresentationPrompt(config);

  // 1. Backend AI (primary)
  try {
    onProgress(10, 'Connecting to EchoMentor AI...');
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://echobackend-dexy.onrender.com';
    const response = await fetch(`${baseUrl}/api/ppt/generate-slides`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: config.topic,
        description: config.description,
        slideContent: config.slideContent,
        slideCount: config.slideCount,
        presentationType: config.presentationType,
        tone: config.tone,
        audience: config.audience,
        theme: config.theme,
        includeImages: true,
      }),
    });
    if (response.ok) {
      onProgress(70, 'Building slides with visuals...');
      const resJSON = await response.json();
      const raw = extractSlidesFromAIResponse(resJSON);
      if (raw.length > 0) {
        onProgress(100, 'Done!');
        return finalizeSlides(mapRawSlides(raw, config), config);
      }
      if (typeof resJSON === 'string') {
        const slides = parseSlidesFromAIResponse(resJSON, config);
        if (slides?.length) {
          onProgress(100, 'Done!');
          return slides;
        }
      }
    }
  } catch (e: unknown) {
    console.warn('Backend generation failed:', e);
  }

  // 2. OpenRouter (optional env)
  if (openRouterKey && openRouterKey.trim()) {
    try {
      onProgress(15, `Connecting to OpenRouter (DeepSeek)...`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a professional presentation outline generator. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (response.ok) {
        onProgress(60, 'Generating slide content...');
        const data = await response.json();
        const slides = parseSlidesFromAIResponse(data.choices[0].message.content, config);
        if (slides?.length) {
          onProgress(100, 'Done!');
          return slides;
        }
      }
    } catch (e: unknown) {
      console.warn('OpenRouter generation failed:', e);
    }
  }

  // 3. Groq (optional env)
  if (groqKey && groqKey.trim()) {
    try {
      onProgress(15, `Connecting to Groq (Llama-3)...`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a professional presentation outline generator. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (response.ok) {
        onProgress(60, 'Generating slide content...');
        const data = await response.json();
        const slides = parseSlidesFromAIResponse(data.choices[0].message.content, config);
        if (slides?.length) {
          onProgress(100, 'Done!');
          return slides;
        }
      }
    } catch (e: unknown) {
      console.warn('Groq generation failed:', e);
    }
  }

  onProgress(40, 'Using built-in presentation templates...');
  return mockGeneration(config, onProgress);
}

export async function generateSingleSlideWithAI(
  prompt: string,
  layout: string
): Promise<Partial<Slide['content']>> {
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  const aiPrompt = `Generate one presentation slide for: "${prompt}".
Layout: "${layout}".
Return JSON only with: title, subtitle, highlight, description, bullets (array of strings), imagePrompt (detailed visual for this slide), cards/stats/timeline/comparison if layout needs them.`;

  const tryParse = (text: string) => coerceSlideContent(parseAIJson(text) as Record<string, unknown>);

  if (openRouterKey?.trim()) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: 'Return only valid JSON for one slide.' },
            { role: 'user', content: aiPrompt },
          ],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return tryParse(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn('OpenRouter single-slide failed:', e);
    }
  }

  if (groqKey?.trim()) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Return only valid JSON for one slide.' },
            { role: 'user', content: aiPrompt },
          ],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return tryParse(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn('Groq single-slide failed:', e);
    }
  }

  return coerceSlideContent({
    title: prompt.slice(0, 60),
    highlight: 'Key insight',
    bullets: ['Point one', 'Point two', 'Point three'],
    imagePrompt: `${prompt}, professional presentation visual`,
  });
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

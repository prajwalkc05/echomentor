import type { GenerationConfig } from '../../types/slideai';

export function buildPresentationPrompt(config: GenerationConfig): string {
  return `Create a professional ${config.presentationType} presentation about: "${config.topic}".
Context: ${config.description || 'None'}.
Slides: exactly ${config.slideCount}.
Tone: ${config.tone}. Audience: ${config.audience}.
Theme: ${config.theme}. Include image placeholders: ${config.includeImages}.

Return ONLY valid JSON:
{
  "slides": [
    {
      "title": "Slide Title",
      "layout": "cover-hero" | "split-left-text" | "split-right-text" | "center-title" | "bullets-image" | "grid-cards" | "timeline" | "stats-grid" | "team-grid" | "comparison" | "thank-you" | "quote" | "architecture" | "results" | "full-image",
      "content": {
        "title": "Main title (short)",
        "subtitle": "Subtitle (optional)",
        "highlight": "One key emphasis line",
        "description": "Max 2 short sentences",
        "bullets": ["Max 5 concise points, under 15 words each"],
        "cards": [{"title": "Card", "description": "Short", "icon": "emoji"}],
        "stats": [{"value": "10x", "label": "Metric"}],
        "timeline": [{"step": "01", "title": "Phase", "description": "Brief"}],
        "comparison": {"left": {"title": "Before", "items": ["a","b"]}, "right": {"title": "After", "items": ["c","d"]}},
        "quote": "Quote text",
        "author": "Name",
        "imagePrompt": "Visual description for image",
        "cta": "Call to action"
      }
    }
  ]
}

RULES:
1. First slide: layout "cover-hero". Last slide: layout "thank-you".
2. PER SLIDE: 1 title, 0-1 highlight, max 5 bullets OR cards/stats/timeline — never long paragraphs.
3. Use varied layouts: split-left-text, bullets-image, grid-cards, stats-grid, timeline, comparison, quote.
4. For comparison layout you MUST include content.comparison with left/right items (not bullets only).
5. For grid-cards/architecture include content.cards. For stats-grid include content.stats.
6. EVERY split-left-text, split-right-text, and bullets-image slide MUST include content.imagePrompt describing a relevant professional photo/illustration for that slide topic.
7. Use bullets as string arrays only. Put title inside content.title AND top-level title.
8. No markdown fences.`;
}

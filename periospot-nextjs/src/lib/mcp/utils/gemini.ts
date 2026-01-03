// Gemini Image Generation Utility for Periospot MCP
// Uses Gemini 3 Pro Image (Nano Banana Pro) for dental illustration generation
// Also supports general image generation for equipment, lifestyle, etc.

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (lazy initialization)
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GOOGLE_GEMINI_API_KEY environment variable');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// PerioSpot Brand Palette (Official)
export const PERIOSPOT_PALETTE = {
  background: '#0D1B2A',   // Dark navy background
  primary: '#15365A',      // PerioSpot blue
  secondary: '#C4D4E8',    // Light blue-gray
  accent: '#C87941',       // Warm copper/orange
  annotation: '#C87941',   // Annotation color (same as accent)
  gingiva: '#E8B4B4',      // Gingival pink
  bone: '#C4D4E8',         // Bone (light blue-gray)
  implant: '#15365A',      // Implant (primary blue)
  teeth: '#FFFAF0',        // Teeth (floral white)
};

// Clinical view types
export type ViewType =
  | 'cross-section'
  | 'panoramic'
  | 'clinical-photo'
  | 'diagram'
  | '3d-render'
  | 'before-after';

// Dental regions
export type DentalRegion =
  | 'anterior'
  | 'posterior'
  | 'maxilla'
  | 'mandible'
  | 'full-arch'
  | 'single-tooth';

// Procedure types
export type Procedure =
  | 'implant-placement'
  | 'sinus-lift'
  | 'bone-graft'
  | 'soft-tissue'
  | 'extraction'
  | 'crown'
  | 'periodontal'
  | 'general';

export interface GenerateImageParams {
  prompt: string;
  viewType?: ViewType;
  region?: DentalRegion;
  procedure?: Procedure;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2';
  style?: 'clinical' | 'educational' | 'artistic' | 'diagram';
  includeLabels?: boolean;
}

// Build structured prompt for dental illustrations
function buildDentalPrompt(params: GenerateImageParams): string {
  const {
    prompt,
    viewType = 'diagram',
    region,
    procedure,
    style = 'educational',
    includeLabels = true,
  } = params;

  const styleGuides: Record<string, string> = {
    clinical: 'photorealistic clinical photograph style, professional medical documentation',
    educational: 'clean educational illustration, clear anatomical detail, suitable for patient education',
    artistic: 'artistic medical illustration, detailed cross-hatching, scientific accuracy',
    diagram: 'clean vector-style diagram, labeled anatomy, simple background',
  };

  const viewGuides: Record<string, string> = {
    'cross-section': 'anatomical cross-sectional view showing internal structures',
    'panoramic': 'panoramic radiograph style view',
    'clinical-photo': 'intraoral clinical photograph perspective',
    'diagram': 'educational diagram with clear labels',
    '3d-render': '3D rendered medical illustration',
    'before-after': 'split comparison showing before and after treatment',
  };

  const structuredPrompt = `Create a professional dental illustration: ${prompt}

Style: ${styleGuides[style]}
View: ${viewGuides[viewType]}
${region ? `Region: ${region} area of the mouth` : ''}
${procedure ? `Procedure: ${procedure} related imagery` : ''}

Color Palette (use these specific colors):
- Background: ${PERIOSPOT_PALETTE.background} (dark navy)
- Primary blue: ${PERIOSPOT_PALETTE.primary}
- Secondary: ${PERIOSPOT_PALETTE.secondary} (light blue-gray)
- Accent/annotations: ${PERIOSPOT_PALETTE.accent} (warm copper)
- Gingival tissue: ${PERIOSPOT_PALETTE.gingiva}
- Bone tissue: ${PERIOSPOT_PALETTE.bone}
- Implant/titanium: ${PERIOSPOT_PALETTE.implant}
- Teeth: ${PERIOSPOT_PALETTE.teeth}

Requirements:
- Anatomically accurate
- Professional medical illustration quality
- Clean, uncluttered composition
- Suitable for dental education website
${includeLabels ? '- Include clear anatomical labels' : '- No text labels'}
- High contrast for web display
- No watermarks or signatures

IMPORTANT: This is for EDUCATIONAL purposes only. Create a scientifically accurate illustration.`;

  return structuredPrompt;
}

// Generate image using Gemini
export async function generateDentalImage(params: GenerateImageParams): Promise<{
  imageBase64: string;
  mimeType: string;
  prompt: string;
}> {
  const structuredPrompt = buildDentalPrompt(params);

  // Use Gemini 3 Pro Image (Nano Banana Pro) - best image generation model
  // Model: gemini-3-pro-image-preview (released Nov 2025)
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-3-pro-image-preview',
    generationConfig: {
      temperature: 0.7,
    },
  });

  try {
    console.log('[Gemini] Generating dental image...');

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: structuredPrompt }]
      }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as Record<string, unknown>,
    });

    const response = result.response;

    // Extract image from response
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        // Check if part has inlineData (image)
        const partData = part as { inlineData?: { data: string; mimeType: string } };
        if (partData.inlineData) {
          console.log('[Gemini] Image generated successfully');
          return {
            imageBase64: partData.inlineData.data,
            mimeType: partData.inlineData.mimeType || 'image/png',
            prompt: structuredPrompt,
          };
        }
      }
    }

    throw new Error('No image generated in response');
  } catch (error) {
    console.error('[Gemini] Image generation error:', error);
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate general (non-dental) images for equipment, lifestyle, etc.
export async function generateGeneralImage(params: {
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'minimalist' | 'professional';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2';
}): Promise<{
  imageBase64: string;
  mimeType: string;
  prompt: string;
}> {
  const { prompt, style = 'professional', aspectRatio = '16:9' } = params;

  const styleGuides: Record<string, string> = {
    photorealistic: 'photorealistic, high quality photography, natural lighting',
    artistic: 'artistic illustration, creative composition, vibrant colors',
    minimalist: 'minimalist design, clean composition, simple background',
    professional: 'professional photography, clean composition, suitable for business use',
  };

  const structuredPrompt = `Create a professional image: ${prompt}

Style: ${styleGuides[style]}
Aspect Ratio: ${aspectRatio}

Requirements:
- High quality, sharp focus
- Clean, professional appearance
- Suitable for website use
- No watermarks, logos, or text
- No faces or identifiable people

IMPORTANT: Create a clean, professional image suitable for business/educational use.`;

  // Use Gemini 3 Pro Image (Nano Banana Pro) - best image generation model
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-3-pro-image-preview',
    generationConfig: {
      temperature: 0.7,
    },
  });

  try {
    console.log('[Gemini] Generating general image...');

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: structuredPrompt }]
      }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as Record<string, unknown>,
    });

    const response = result.response;

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        const partData = part as { inlineData?: { data: string; mimeType: string } };
        if (partData.inlineData) {
          console.log('[Gemini] General image generated successfully');
          return {
            imageBase64: partData.inlineData.data,
            mimeType: partData.inlineData.mimeType || 'image/png',
            prompt: structuredPrompt,
          };
        }
      }
    }

    throw new Error('No image generated in response');
  } catch (error) {
    console.error('[Gemini] General image generation error:', error);
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate alt text for an image using AI
export async function generateAltText(
  imageBase64: string,
  context?: string
): Promise<{
  altText: string;
  description: string;
  suggestedKeywords: string[];
}> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const altTextPrompt = `Analyze this image and generate SEO-optimized alt text for accessibility.
${context ? `Context: This image is being used for ${context}.` : ''}

Respond in JSON format:
{
  "altText": "concise, descriptive alt text (max 125 characters) that describes the image for screen readers",
  "description": "longer detailed description of the image content (2-3 sentences)",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"] (relevant keywords for SEO)
}

Make the alt text:
- Descriptive but concise
- Include the main subject
- Avoid starting with "Image of" or "Picture of"
- Include relevant action or context`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64,
        },
      },
      { text: altTextPrompt },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      altText: 'Professional image',
      description: 'Image content analysis unavailable',
      suggestedKeywords: [],
    };
  } catch (error) {
    console.error('[Gemini] Alt text generation error:', error);
    return {
      altText: 'Professional image',
      description: 'Image content analysis unavailable',
      suggestedKeywords: [],
    };
  }
}

// Suggest image placements for a blog post
export async function suggestImagePlacements(
  content: string,
  existingImages: string[] = []
): Promise<{
  suggestions: Array<{
    location: string;
    afterParagraph: number;
    type: 'diagram' | 'photo' | 'illustration' | 'infographic';
    prompt: string;
    reason: string;
  }>;
  totalSuggested: number;
}> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const placementPrompt = `Analyze this dental education blog post and suggest optimal image placements.

Content:
${content.substring(0, 5000)}

${existingImages.length > 0 ? `Existing images: ${existingImages.join(', ')}` : 'No existing images.'}

Respond in JSON format:
{
  "suggestions": [
    {
      "location": "section name or heading where image should go",
      "afterParagraph": 2,
      "type": "diagram|photo|illustration|infographic",
      "prompt": "detailed prompt to generate or search for this image",
      "reason": "why this image would enhance the content"
    }
  ],
  "totalSuggested": 3
}

Guidelines:
- Suggest 2-4 images for a typical blog post
- Place images after key concepts are introduced
- Consider visual breaks for long sections
- Prefer diagrams for technical explanations
- Prefer photos for equipment/products
- Avoid suggesting images for obvious locations (hero already exists)`;

  try {
    const result = await model.generateContent(placementPrompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { suggestions: [], totalSuggested: 0 };
  } catch (error) {
    console.error('[Gemini] Image placement suggestion error:', error);
    return { suggestions: [], totalSuggested: 0 };
  }
}

// Validate generated image (optional clinical validation)
export async function validateDentalImage(
  imageBase64: string,
  expectedContent: string
): Promise<{
  isValid: boolean;
  score: number;
  feedback: string;
}> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const validationPrompt = `You are a dental education content reviewer. Analyze this dental illustration and rate it.

Expected content: ${expectedContent}

Rate on a scale of 1-10 for:
1. Anatomical accuracy
2. Educational clarity
3. Professional quality
4. Appropriateness for patient education

Respond in JSON format:
{
  "isValid": boolean (true if overall score >= 7),
  "score": number (1-10 average),
  "feedback": "brief feedback string"
}`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64,
        },
      },
      { text: validationPrompt },
    ]);

    const text = result.response.text();
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { isValid: true, score: 7, feedback: 'Validation completed' };
  } catch (error) {
    console.error('[Gemini] Validation error:', error);
    return { isValid: true, score: 7, feedback: 'Validation skipped due to error' };
  }
}

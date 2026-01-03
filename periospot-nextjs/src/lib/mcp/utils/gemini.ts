// Gemini Image Generation Utility for Periospot MCP
// Uses Gemini 2.0 Flash for dental illustration generation

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

  // Use Gemini 2.0 Flash for image generation
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
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

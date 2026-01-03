// MCP Tools for Image Management

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MCPToolManifest } from '@/lib/types/mcp';
import { sanitizeFilename, getMimeType } from '../utils/helpers';
import {
  generateDentalImage,
  generateGeneralImage,
  generateAltText,
  suggestImagePlacements,
  validateDentalImage,
  type ViewType,
  type DentalRegion,
  type Procedure,
} from '../utils/gemini';

// =============================================================================
// TOOL MANIFESTS
// =============================================================================

export const imageToolManifests: MCPToolManifest[] = [
  {
    name: 'upload_image',
    description:
      'Upload an image to Periospot media library. Provide either base64 image data or a URL to download from.',
    parameters: {
      type: 'object',
      properties: {
        image_base64: {
          type: 'string',
          description:
            'Base64-encoded image data (can include or omit data:image prefix)',
        },
        image_url: {
          type: 'string',
          description: 'URL of image to download and upload',
        },
        filename: {
          type: 'string',
          description:
            'Filename for the uploaded image (e.g., dental-implant-hero.jpg)',
        },
        folder: {
          type: 'string',
          description: 'Folder to organize the image',
          enum: ['blog', 'courses', 'profiles', 'general'],
          default: 'general',
        },
        alt_text: {
          type: 'string',
          description: 'Alt text for accessibility and SEO',
        },
        caption: {
          type: 'string',
          description: 'Optional caption for the image',
        },
      },
      required: ['filename'],
    },
  },
  {
    name: 'list_images',
    description: 'List images in the media library with optional filters',
    parameters: {
      type: 'object',
      properties: {
        folder: {
          type: 'string',
          description: 'Filter by folder',
          enum: ['blog', 'courses', 'profiles', 'general'],
        },
        search: {
          type: 'string',
          description: 'Search in filename and alt_text',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of images to return',
          default: 20,
        },
        offset: {
          type: 'number',
          description: 'Number of images to skip for pagination',
          default: 0,
        },
      },
      required: [],
    },
  },
  {
    name: 'get_image',
    description: 'Get details of a specific image',
    parameters: {
      type: 'object',
      properties: {
        image_id: {
          type: 'string',
          description: 'The UUID of the image',
        },
      },
      required: ['image_id'],
    },
  },
  {
    name: 'update_image',
    description: 'Update image metadata (alt text, caption, folder)',
    parameters: {
      type: 'object',
      properties: {
        image_id: {
          type: 'string',
          description: 'The UUID of the image to update',
        },
        alt_text: {
          type: 'string',
          description: 'New alt text',
        },
        caption: {
          type: 'string',
          description: 'New caption',
        },
        folder: {
          type: 'string',
          description: 'Move to a different folder',
          enum: ['blog', 'courses', 'profiles', 'general'],
        },
      },
      required: ['image_id'],
    },
  },
  {
    name: 'delete_image',
    description: 'Delete an image from the media library and storage',
    parameters: {
      type: 'object',
      properties: {
        image_id: {
          type: 'string',
          description: 'The UUID of the image to delete',
        },
      },
      required: ['image_id'],
    },
  },
  {
    name: 'generate_dental_image',
    description: 'Generate a dental illustration using AI (Gemini). Creates professional clinical illustrations, diagrams, and educational images for dental content. Automatically uses PerioSpot brand colors and clinical accuracy guidelines.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Description of the dental image to generate (e.g., "cross-section of dental implant in posterior mandible showing osseointegration")',
        },
        filename: {
          type: 'string',
          description: 'Filename for the generated image (e.g., "implant-osseointegration.png")',
        },
        view_type: {
          type: 'string',
          description: 'Type of view for the illustration',
          enum: ['cross-section', 'panoramic', 'clinical-photo', 'diagram', '3d-render', 'before-after'],
          default: 'diagram',
        },
        region: {
          type: 'string',
          description: 'Dental region to focus on',
          enum: ['anterior', 'posterior', 'maxilla', 'mandible', 'full-arch', 'single-tooth'],
        },
        procedure: {
          type: 'string',
          description: 'Related dental procedure',
          enum: ['implant-placement', 'sinus-lift', 'bone-graft', 'soft-tissue', 'extraction', 'crown', 'periodontal', 'general'],
        },
        style: {
          type: 'string',
          description: 'Visual style of the illustration',
          enum: ['clinical', 'educational', 'artistic', 'diagram'],
          default: 'educational',
        },
        aspect_ratio: {
          type: 'string',
          description: 'Aspect ratio for the image',
          enum: ['1:1', '16:9', '4:3', '3:2'],
          default: '16:9',
        },
        include_labels: {
          type: 'boolean',
          description: 'Whether to include anatomical labels in the image',
          default: true,
        },
        folder: {
          type: 'string',
          description: 'Folder to save the image in',
          enum: ['blog', 'courses', 'general'],
          default: 'blog',
        },
        validate: {
          type: 'boolean',
          description: 'Whether to run clinical validation on the generated image',
          default: false,
        },
      },
      required: ['prompt', 'filename'],
    },
  },
  {
    name: 'generate_blog_hero_image',
    description: 'Generate a hero image for a blog post. Optimized for blog headers with 16:9 aspect ratio and educational style.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The blog post topic (e.g., "dental implant surgery", "periodontal disease prevention")',
        },
        slug: {
          type: 'string',
          description: 'The blog post slug (used for filename)',
        },
        style: {
          type: 'string',
          description: 'Visual style',
          enum: ['clinical', 'educational', 'artistic', 'diagram'],
          default: 'educational',
        },
      },
      required: ['topic', 'slug'],
    },
  },
  {
    name: 'generate_og_image',
    description: 'Generate an Open Graph (social share) image for a blog post. Optimized for social media with text overlay area.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The blog post title to feature',
        },
        slug: {
          type: 'string',
          description: 'The blog post slug',
        },
        subtitle: {
          type: 'string',
          description: 'Optional subtitle or category',
        },
      },
      required: ['title', 'slug'],
    },
  },
  {
    name: 'generate_general_image',
    description: 'Generate a general (non-dental) image using AI. Perfect for equipment photos, lifestyle shots, abstract backgrounds, and professional imagery.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Description of the image to generate (e.g., "professional camera equipment on desk", "modern dental office interior")',
        },
        filename: {
          type: 'string',
          description: 'Filename for the generated image',
        },
        style: {
          type: 'string',
          description: 'Visual style for the image',
          enum: ['photorealistic', 'artistic', 'minimalist', 'professional'],
          default: 'professional',
        },
        aspect_ratio: {
          type: 'string',
          description: 'Aspect ratio for the image',
          enum: ['1:1', '16:9', '4:3', '3:2'],
          default: '16:9',
        },
        folder: {
          type: 'string',
          description: 'Folder to save the image in',
          enum: ['blog', 'courses', 'general'],
          default: 'general',
        },
      },
      required: ['prompt', 'filename'],
    },
  },
  {
    name: 'auto_generate_alt_text',
    description: 'Automatically generate SEO-optimized alt text for an image using AI analysis. Returns alt text, description, and suggested keywords.',
    parameters: {
      type: 'object',
      properties: {
        image_id: {
          type: 'string',
          description: 'The UUID of the image to analyze',
        },
        image_url: {
          type: 'string',
          description: 'URL of an image to analyze (alternative to image_id)',
        },
        context: {
          type: 'string',
          description: 'Context about where the image is used (e.g., "dental implant blog post hero")',
        },
        update_image: {
          type: 'boolean',
          description: 'Whether to automatically update the image record with the generated alt text',
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: 'suggest_image_placements',
    description: 'AI analyzes a blog post and suggests optimal locations for images, with prompts to generate or search for each suggested image.',
    parameters: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'The UUID of the blog post to analyze',
        },
        content: {
          type: 'string',
          description: 'Blog post content to analyze (alternative to post_id)',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_stock_images',
    description: 'Search for free stock images from Unsplash. Returns image URLs that can be downloaded and uploaded to the media library.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "dental equipment", "camera macro lens", "modern office")',
        },
        count: {
          type: 'number',
          description: 'Number of images to return (1-30)',
          default: 5,
        },
        orientation: {
          type: 'string',
          description: 'Image orientation filter',
          enum: ['landscape', 'portrait', 'squarish'],
        },
      },
      required: ['query'],
    },
  },
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

interface UploadImageParams {
  image_base64?: string;
  image_url?: string;
  filename: string;
  folder?: 'blog' | 'courses' | 'profiles' | 'general';
  alt_text?: string;
  caption?: string;
}

interface ListImagesParams {
  folder?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

interface GetImageParams {
  image_id: string;
}

interface UpdateImageParams {
  image_id: string;
  alt_text?: string;
  caption?: string;
  folder?: 'blog' | 'courses' | 'profiles' | 'general';
}

interface DeleteImageParams {
  image_id: string;
}

export const imageTools = {
  async upload_image(
    params: UploadImageParams,
    supabase: SupabaseClient
  ): Promise<{
    message: string;
    image_id: string;
    url: string;
    filename: string;
    folder: string;
  }> {
    const {
      image_base64,
      image_url,
      filename,
      folder = 'general',
      alt_text,
      caption,
    } = params;

    if (!image_base64 && !image_url) {
      throw new Error('Either image_base64 or image_url is required');
    }

    let imageBuffer: Buffer;
    let mimeType: string;
    const safeFilename = sanitizeFilename(filename);

    if (image_base64) {
      // Remove data URL prefix if present
      const base64Data = image_base64.replace(
        /^data:image\/[a-z+]+;base64,/i,
        ''
      );
      imageBuffer = Buffer.from(base64Data, 'base64');
      mimeType = getMimeType(safeFilename);
    } else if (image_url) {
      // Download from URL
      const response = await fetch(image_url);
      if (!response.ok) {
        throw new Error(
          `Failed to download image from URL: ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      mimeType =
        response.headers.get('content-type') || getMimeType(safeFilename);
    } else {
      throw new Error('No image data provided');
    }

    // Generate unique storage path
    const timestamp = Date.now();
    const storagePath = `${folder}/${timestamp}-${safeFilename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, imageBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Save metadata to database
    const { data: image, error: dbError } = await supabase
      .from('images')
      .insert({
        url: publicUrl,
        storage_path: storagePath,
        filename: safeFilename,
        original_filename: filename,
        alt_text: alt_text || safeFilename,
        caption: caption || null,
        folder,
        mime_type: mimeType,
        size_bytes: imageBuffer.length,
      })
      .select()
      .single();

    if (dbError) {
      // Try to clean up the uploaded file
      await supabase.storage.from('images').remove([storagePath]);
      throw new Error(`Failed to save image metadata: ${dbError.message}`);
    }

    return {
      message: 'Image uploaded successfully',
      image_id: image.id,
      url: publicUrl,
      filename: safeFilename,
      folder,
    };
  },

  async list_images(
    params: ListImagesParams,
    supabase: SupabaseClient
  ): Promise<{
    images: Array<Record<string, unknown>>;
    total: number | null;
    limit: number;
    offset: number;
  }> {
    const { folder, search, limit = 20, offset = 0 } = params;

    const safeLimit = Math.min(Math.max(1, limit), 100);

    let query = supabase
      .from('images')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + safeLimit - 1);

    if (folder) {
      query = query.eq('folder', folder);
    }

    if (search) {
      query = query.or(
        `filename.ilike.%${search}%,alt_text.ilike.%${search}%`
      );
    }

    const { data: images, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list images: ${error.message}`);
    }

    return {
      images: images || [],
      total: count,
      limit: safeLimit,
      offset,
    };
  },

  async get_image(
    params: GetImageParams,
    supabase: SupabaseClient
  ): Promise<Record<string, unknown>> {
    const { image_id } = params;

    const { data: image, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', image_id)
      .single();

    if (error) {
      throw new Error(`Failed to get image: ${error.message}`);
    }

    return image;
  },

  async update_image(
    params: UpdateImageParams,
    supabase: SupabaseClient
  ): Promise<{ message: string; image_id: string }> {
    const { image_id, alt_text, caption, folder } = params;

    const updateData: Record<string, unknown> = {};
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (caption !== undefined) updateData.caption = caption;
    if (folder !== undefined) updateData.folder = folder;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No updates provided');
    }

    const { error } = await supabase
      .from('images')
      .update(updateData)
      .eq('id', image_id);

    if (error) {
      throw new Error(`Failed to update image: ${error.message}`);
    }

    return {
      message: 'Image updated successfully',
      image_id,
    };
  },

  async delete_image(
    params: DeleteImageParams,
    supabase: SupabaseClient
  ): Promise<{ message: string; image_id: string }> {
    const { image_id } = params;

    // Get image to find storage path
    const { data: image, error: fetchError } = await supabase
      .from('images')
      .select('storage_path')
      .eq('id', image_id)
      .single();

    if (fetchError) {
      throw new Error(`Image not found: ${fetchError.message}`);
    }

    // Delete from storage
    if (image.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([image.storage_path]);

      if (storageError) {
        console.error('Storage delete failed:', storageError);
        // Continue anyway - we still want to remove the DB record
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', image_id);

    if (dbError) {
      throw new Error(`Failed to delete image: ${dbError.message}`);
    }

    return {
      message: 'Image deleted successfully',
      image_id,
    };
  },

  // =========================================================================
  // AI IMAGE GENERATION TOOLS
  // =========================================================================

  async generate_dental_image(
    params: {
      prompt: string;
      filename: string;
      view_type?: ViewType;
      region?: DentalRegion;
      procedure?: Procedure;
      style?: 'clinical' | 'educational' | 'artistic' | 'diagram';
      aspect_ratio?: '1:1' | '16:9' | '4:3' | '3:2';
      include_labels?: boolean;
      folder?: 'blog' | 'courses' | 'general';
      validate?: boolean;
    },
    supabase: SupabaseClient
  ): Promise<{
    success: boolean;
    message: string;
    image_id?: string;
    url: string;
    filename: string;
    dimensions: { width: number; height: number };
    validation?: { isValid: boolean; score: number; feedback: string } | null;
    prompt_used: string;
  }> {
    const {
      prompt,
      filename,
      view_type = 'diagram',
      region,
      procedure,
      style = 'educational',
      aspect_ratio = '16:9',
      include_labels = true,
      folder = 'blog',
      validate = false,
    } = params;

    console.log(`[MCP] Generating dental image: ${prompt.substring(0, 50)}...`);

    // Generate image with Gemini
    const { imageBase64, mimeType, prompt: usedPrompt } = await generateDentalImage({
      prompt,
      viewType: view_type,
      region,
      procedure,
      style,
      aspectRatio: aspect_ratio,
      includeLabels: include_labels,
    });

    // Optional validation
    let validation = null;
    if (validate) {
      validation = await validateDentalImage(imageBase64, prompt);
      if (!validation.isValid) {
        console.log(`[MCP] Image validation warning: ${validation.feedback}`);
      }
    }

    // Process image buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Determine dimensions based on aspect ratio
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1920, height: 1080 },
      '4:3': { width: 1600, height: 1200 },
      '3:2': { width: 1800, height: 1200 },
    };

    const { width, height } = dimensions[aspect_ratio] || dimensions['16:9'];

    // Try to process with Sharp if available
    let processedBuffer: Buffer = imageBuffer;
    try {
      const sharp = (await import('sharp')).default;
      processedBuffer = await sharp(imageBuffer)
        .resize(width, height, { fit: 'cover' })
        .png({ quality: 90 })
        .toBuffer();
    } catch (e) {
      console.log('[MCP] Sharp processing skipped, using original image');
    }

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const cleanFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    const safeFilename = sanitizeFilename(cleanFilename);
    const storagePath = `${folder}/${timestamp}-${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, processedBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath);

    // Save metadata to database
    const { data: image, error: dbError } = await supabase
      .from('images')
      .insert({
        url: urlData.publicUrl,
        storage_path: storagePath,
        filename: safeFilename,
        alt_text: prompt.substring(0, 200),
        folder,
        mime_type: 'image/png',
        width,
        height,
        size_bytes: processedBuffer.length,
        metadata: {
          generator: 'gemini-2.0-flash',
          prompt: usedPrompt,
          view_type,
          region,
          procedure,
          style,
          validation,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to save image metadata:', dbError);
    }

    return {
      success: true,
      message: 'Dental image generated successfully',
      image_id: image?.id,
      url: urlData.publicUrl,
      filename: safeFilename,
      dimensions: { width, height },
      validation,
      prompt_used: usedPrompt.substring(0, 200) + '...',
    };
  },

  async generate_blog_hero_image(
    params: {
      topic: string;
      slug: string;
      style?: 'clinical' | 'educational' | 'artistic' | 'diagram';
    },
    supabase: SupabaseClient
  ): Promise<{
    success: boolean;
    message: string;
    image_id?: string;
    url: string;
    filename: string;
    dimensions: { width: number; height: number };
    prompt_used: string;
  }> {
    const { topic, slug, style = 'educational' } = params;

    // Build optimized hero image prompt
    const heroPrompt = `Professional hero image for dental blog post about "${topic}".
Wide composition suitable for website header.
Clean, modern design with space for text overlay on the left side.
Focus on visual impact and educational value.`;

    return await imageTools.generate_dental_image(
      {
        prompt: heroPrompt,
        filename: `${slug}-hero.png`,
        view_type: 'diagram',
        style,
        aspect_ratio: '16:9',
        include_labels: false,
        folder: 'blog',
        validate: false,
      },
      supabase
    );
  },

  async generate_og_image(
    params: {
      title: string;
      slug: string;
      subtitle?: string;
    },
    supabase: SupabaseClient
  ): Promise<{
    success: boolean;
    message: string;
    image_id?: string;
    url: string;
    filename: string;
    dimensions: { width: number; height: number };
    prompt_used: string;
  }> {
    const { title, slug, subtitle } = params;

    // OG images need space for text overlay
    const ogPrompt = `Social media share image for dental article titled "${title}".
${subtitle ? `Subtitle: ${subtitle}.` : ''}
Clean background with subtle dental imagery.
Leave large area (60% of image) with clean background for text overlay.
Professional, trustworthy appearance.
PerioSpot brand colors: dark navy background (#0D1B2A), primary blue (#15365A), and copper accent (#C87941).`;

    return await imageTools.generate_dental_image(
      {
        prompt: ogPrompt,
        filename: `${slug}-og.png`,
        view_type: 'diagram',
        style: 'educational',
        aspect_ratio: '16:9',
        include_labels: false,
        folder: 'blog',
        validate: false,
      },
      supabase
    );
  },

  // =========================================================================
  // NEW ENHANCED IMAGE TOOLS
  // =========================================================================

  async generate_general_image(
    params: {
      prompt: string;
      filename: string;
      style?: 'photorealistic' | 'artistic' | 'minimalist' | 'professional';
      aspect_ratio?: '1:1' | '16:9' | '4:3' | '3:2';
      folder?: 'blog' | 'courses' | 'general';
    },
    supabase: SupabaseClient
  ): Promise<{
    success: boolean;
    message: string;
    image_id?: string;
    url: string;
    filename: string;
    dimensions: { width: number; height: number };
    prompt_used: string;
  }> {
    const {
      prompt,
      filename,
      style = 'professional',
      aspect_ratio = '16:9',
      folder = 'general',
    } = params;

    console.log(`[MCP] Generating general image: ${prompt.substring(0, 50)}...`);

    // Generate image with Gemini
    const { imageBase64, prompt: usedPrompt } = await generateGeneralImage({
      prompt,
      style,
      aspectRatio: aspect_ratio,
    });

    // Process image buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Determine dimensions based on aspect ratio
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1920, height: 1080 },
      '4:3': { width: 1600, height: 1200 },
      '3:2': { width: 1800, height: 1200 },
    };

    const { width, height } = dimensions[aspect_ratio] || dimensions['16:9'];

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const cleanFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    const safeFilename = sanitizeFilename(cleanFilename);
    const storagePath = `${folder}/${timestamp}-${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath);

    // Save metadata to database
    const { data: image, error: dbError } = await supabase
      .from('images')
      .insert({
        url: urlData.publicUrl,
        storage_path: storagePath,
        filename: safeFilename,
        alt_text: prompt.substring(0, 200),
        folder,
        mime_type: 'image/png',
        width,
        height,
        size_bytes: imageBuffer.length,
        metadata: {
          generator: 'gemini-general',
          prompt: usedPrompt,
          style,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to save image metadata:', dbError);
    }

    return {
      success: true,
      message: 'General image generated successfully',
      image_id: image?.id,
      url: urlData.publicUrl,
      filename: safeFilename,
      dimensions: { width, height },
      prompt_used: usedPrompt.substring(0, 200) + '...',
    };
  },

  async auto_generate_alt_text(
    params: {
      image_id?: string;
      image_url?: string;
      context?: string;
      update_image?: boolean;
    },
    supabase: SupabaseClient
  ): Promise<{
    altText: string;
    description: string;
    suggestedKeywords: string[];
    updated: boolean;
  }> {
    const { image_id, image_url, context, update_image = false } = params;

    if (!image_id && !image_url) {
      throw new Error('Either image_id or image_url is required');
    }

    let imageBase64: string;

    if (image_id) {
      // Get image from database
      const { data: image, error } = await supabase
        .from('images')
        .select('url')
        .eq('id', image_id)
        .single();

      if (error) {
        throw new Error(`Image not found: ${error.message}`);
      }

      // Fetch image and convert to base64
      const response = await fetch(image.url);
      const arrayBuffer = await response.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    } else if (image_url) {
      // Fetch from URL
      const response = await fetch(image_url);
      const arrayBuffer = await response.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      throw new Error('No image source provided');
    }

    // Generate alt text using AI
    const result = await generateAltText(imageBase64, context);

    // Optionally update the image record
    let updated = false;
    if (update_image && image_id) {
      const { error } = await supabase
        .from('images')
        .update({ alt_text: result.altText })
        .eq('id', image_id);

      updated = !error;
    }

    return {
      ...result,
      updated,
    };
  },

  async suggest_image_placements(
    params: {
      post_id?: string;
      content?: string;
    },
    supabase: SupabaseClient
  ): Promise<{
    suggestions: Array<{
      location: string;
      afterParagraph: number;
      type: 'diagram' | 'photo' | 'illustration' | 'infographic';
      prompt: string;
      reason: string;
    }>;
    totalSuggested: number;
    post_title?: string;
  }> {
    const { post_id, content: directContent } = params;

    let content: string;
    let postTitle: string | undefined;

    if (post_id) {
      // Get post content from database
      const { data: post, error } = await supabase
        .from('posts')
        .select('title, content')
        .eq('id', post_id)
        .single();

      if (error) {
        throw new Error(`Post not found: ${error.message}`);
      }

      content = post.content || '';
      postTitle = post.title;
    } else if (directContent) {
      content = directContent;
    } else {
      throw new Error('Either post_id or content is required');
    }

    // Get suggestions from AI
    const result = await suggestImagePlacements(content);

    return {
      ...result,
      post_title: postTitle,
    };
  },

  async search_stock_images(
    params: {
      query: string;
      count?: number;
      orientation?: 'landscape' | 'portrait' | 'squarish';
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _supabase: SupabaseClient
  ): Promise<{
    images: Array<{
      id: string;
      url: string;
      download_url: string;
      width: number;
      height: number;
      description: string | null;
      photographer: string;
      photographer_url: string;
    }>;
    total: number;
    query: string;
  }> {
    const { query, count = 5, orientation } = params;

    // Use Unsplash API
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashKey) {
      throw new Error('UNSPLASH_ACCESS_KEY environment variable not set');
    }

    const searchParams = new URLSearchParams({
      query,
      per_page: String(Math.min(Math.max(1, count), 30)),
    });

    if (orientation) {
      searchParams.set('orientation', orientation);
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      images: data.results.map((img: {
        id: string;
        urls: { regular: string; full: string };
        width: number;
        height: number;
        description: string | null;
        alt_description: string | null;
        user: { name: string; links: { html: string } };
      }) => ({
        id: img.id,
        url: img.urls.regular,
        download_url: img.urls.full,
        width: img.width,
        height: img.height,
        description: img.description || img.alt_description,
        photographer: img.user.name,
        photographer_url: img.user.links.html,
      })),
      total: data.total,
      query,
    };
  },
};

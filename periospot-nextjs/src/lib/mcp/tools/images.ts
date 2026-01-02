// MCP Tools for Image Management

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MCPToolManifest } from '@/lib/types/mcp';
import { sanitizeFilename, getMimeType } from '../utils/helpers';

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
};

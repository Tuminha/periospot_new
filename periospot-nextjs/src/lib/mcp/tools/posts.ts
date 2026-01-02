// MCP Tools for Blog Post Management

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MCPToolManifest } from '@/lib/types/mcp';
import {
  generateSlug,
  calculateReadingTime,
  generateExcerpt,
  simpleMarkdownToHtml,
} from '../utils/helpers';

// =============================================================================
// TOOL MANIFESTS
// =============================================================================

export const postToolManifests: MCPToolManifest[] = [
  {
    name: 'create_post',
    description: 'Create a new blog post on Periospot. Returns the created post with its URL.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the blog post',
        },
        content: {
          type: 'string',
          description: 'The content of the post in Markdown format',
        },
        excerpt: {
          type: 'string',
          description: 'A short excerpt/summary of the post (1-2 sentences). Auto-generated if not provided.',
        },
        category: {
          type: 'string',
          description: 'Category slug',
          enum: ['periodontics', 'implants', 'digital-dentistry', 'photography', 'education', 'news'],
        },
        tags: {
          type: 'string',
          description: 'Comma-separated list of tags',
        },
        featured_image_url: {
          type: 'string',
          description: 'URL of the featured image',
        },
        featured_image_alt: {
          type: 'string',
          description: 'Alt text for the featured image',
        },
        meta_title: {
          type: 'string',
          description: 'SEO meta title (defaults to title if not provided)',
        },
        meta_description: {
          type: 'string',
          description: 'SEO meta description (defaults to excerpt if not provided)',
        },
        status: {
          type: 'string',
          description: 'Post status',
          enum: ['draft', 'published'],
          default: 'draft',
        },
        is_featured: {
          type: 'boolean',
          description: 'Whether to feature this post on the homepage',
          default: false,
        },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'update_post',
    description: 'Update an existing blog post. Provide either post_id or slug to identify the post.',
    parameters: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'The UUID of the post to update',
        },
        slug: {
          type: 'string',
          description: 'The slug of the post to update (alternative to post_id)',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        content: {
          type: 'string',
          description: 'New content in Markdown',
        },
        excerpt: {
          type: 'string',
          description: 'New excerpt',
        },
        category: {
          type: 'string',
          description: 'New category slug',
        },
        tags: {
          type: 'string',
          description: 'New comma-separated tags',
        },
        featured_image_url: {
          type: 'string',
          description: 'New featured image URL',
        },
        featured_image_alt: {
          type: 'string',
          description: 'New alt text',
        },
        meta_title: {
          type: 'string',
          description: 'New meta title',
        },
        meta_description: {
          type: 'string',
          description: 'New meta description',
        },
        status: {
          type: 'string',
          description: 'New status',
          enum: ['draft', 'published', 'archived'],
        },
        is_featured: {
          type: 'boolean',
          description: 'Feature on homepage',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_posts',
    description: 'Get a list of blog posts with optional filters',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['draft', 'published', 'scheduled', 'archived', 'all'],
          default: 'all',
        },
        category: {
          type: 'string',
          description: 'Filter by category slug',
        },
        search: {
          type: 'string',
          description: 'Search in title and content',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of posts to return (default: 10, max: 100)',
          default: 10,
        },
        offset: {
          type: 'number',
          description: 'Number of posts to skip for pagination',
          default: 0,
        },
        order_by: {
          type: 'string',
          description: 'Field to order by',
          enum: ['created_at', 'published_at', 'title', 'view_count'],
          default: 'created_at',
        },
        order: {
          type: 'string',
          description: 'Sort order',
          enum: ['asc', 'desc'],
          default: 'desc',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_post',
    description: 'Get a single post by ID or slug',
    parameters: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'The UUID of the post',
        },
        slug: {
          type: 'string',
          description: 'The slug of the post',
        },
      },
      required: [],
    },
  },
  {
    name: 'delete_post',
    description: 'Delete a blog post. By default archives it; use permanent=true to fully delete.',
    parameters: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'The UUID of the post to delete',
        },
        slug: {
          type: 'string',
          description: 'The slug of the post to delete',
        },
        permanent: {
          type: 'boolean',
          description: 'Permanently delete instead of archive',
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: 'publish_post',
    description: 'Publish a draft post immediately',
    parameters: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'The UUID of the post',
        },
        slug: {
          type: 'string',
          description: 'The slug of the post',
        },
      },
      required: [],
    },
  },
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

interface CreatePostParams {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  status?: 'draft' | 'published';
  is_featured?: boolean;
}

interface UpdatePostParams {
  post_id?: string;
  slug?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
}

interface GetPostsParams {
  status?: 'draft' | 'published' | 'scheduled' | 'archived' | 'all';
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: 'created_at' | 'published_at' | 'title' | 'view_count';
  order?: 'asc' | 'desc';
}

interface GetPostParams {
  post_id?: string;
  slug?: string;
}

interface DeletePostParams {
  post_id?: string;
  slug?: string;
  permanent?: boolean;
}

export const postTools = {
  async create_post(
    params: CreatePostParams,
    supabase: SupabaseClient
  ): Promise<{
    message: string;
    post_id: string;
    slug: string;
    status: string;
    url: string;
  }> {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featured_image_url,
      featured_image_alt,
      meta_title,
      meta_description,
      status = 'draft',
      is_featured = false,
    } = params;

    // Generate slug from title
    const slug = generateSlug(title);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('posts')
      .select('slug')
      .eq('slug', slug)
      .single();

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    // Convert markdown to HTML
    const content_html = simpleMarkdownToHtml(content);

    // Calculate reading time
    const reading_time_minutes = calculateReadingTime(content);

    // Auto-generate excerpt if not provided
    const finalExcerpt = excerpt || generateExcerpt(content);

    // Get category ID if provided
    let category_id: string | null = null;
    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      category_id = cat?.id || null;
    }

    // Parse tags into array for the existing tags column
    const tagsArray = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Categories array (using the category slug)
    const categoriesArray = category ? [category] : [];

    // Create the post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug: finalSlug,
        content,
        content_html,
        excerpt: finalExcerpt,
        featured_image_url: featured_image_url || null,
        featured_image_alt: featured_image_alt || null,
        meta_title: meta_title || title,
        meta_description: meta_description || finalExcerpt,
        category_id,
        categories: categoriesArray,  // Store in array column too
        tags: tagsArray,              // Store in array column
        status,
        is_featured,
        reading_time_minutes,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    // Also store tags in the tags table for normalization
    if (tagsArray.length > 0 && post) {
      for (const tagName of tagsArray) {
        const tagSlug = generateSlug(tagName);

        // Create tag if it doesn't exist
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', tagSlug)
          .single();

        let tagId = existingTag?.id;
        if (!tagId) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName, slug: tagSlug })
            .select()
            .single();
          tagId = newTag?.id;
        }

        // Link tag to post via junction table
        if (tagId) {
          await supabase
            .from('post_tags')
            .upsert({ post_id: post.id, tag_id: tagId });
        }
      }
    }

    return {
      message: `Post "${title}" created successfully`,
      post_id: post.id,
      slug: post.slug,
      status: post.status,
      url: `https://periospot.com/blog/${post.slug}`,
    };
  },

  async update_post(
    params: UpdatePostParams,
    supabase: SupabaseClient
  ): Promise<{
    message: string;
    post_id: string;
    slug: string;
    url: string;
  }> {
    const { post_id, slug, ...updates } = params;

    if (!post_id && !slug) {
      throw new Error('Either post_id or slug is required');
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (updates.title) {
      updateData.title = updates.title;
      updateData.slug = generateSlug(updates.title);
    }
    if (updates.content) {
      updateData.content = updates.content;
      updateData.content_html = simpleMarkdownToHtml(updates.content);
      updateData.reading_time_minutes = calculateReadingTime(updates.content);
    }
    if (updates.excerpt) updateData.excerpt = updates.excerpt;
    if (updates.featured_image_url)
      updateData.featured_image_url = updates.featured_image_url;
    if (updates.featured_image_alt)
      updateData.featured_image_alt = updates.featured_image_alt;
    if (updates.meta_title) updateData.meta_title = updates.meta_title;
    if (updates.meta_description)
      updateData.meta_description = updates.meta_description;
    if (updates.status) {
      updateData.status = updates.status;
      if (updates.status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (typeof updates.is_featured === 'boolean') {
      updateData.is_featured = updates.is_featured;
    }

    // Get category ID if updating category
    if (updates.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', updates.category)
        .single();
      updateData.category_id = cat?.id || null;
      updateData.categories = [updates.category];  // Update array column too
    }

    // Handle tags - update the array column
    if (updates.tags) {
      const tagsArray = updates.tags.split(',').map((t) => t.trim()).filter(Boolean);
      updateData.tags = tagsArray;
    }

    // Update the post
    let query = supabase.from('posts').update(updateData);
    if (post_id) {
      query = query.eq('id', post_id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: post, error } = await query.select().single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    // Also update the tags junction table for normalization
    if (updates.tags && post) {
      // Remove existing tag links
      await supabase.from('post_tags').delete().eq('post_id', post.id);

      // Add new tags
      const tagList = updates.tags.split(',').map((t) => t.trim()).filter(Boolean);
      for (const tagName of tagList) {
        const tagSlug = generateSlug(tagName);

        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', tagSlug)
          .single();

        let tagId = existingTag?.id;
        if (!tagId) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName, slug: tagSlug })
            .select()
            .single();
          tagId = newTag?.id;
        }

        if (tagId) {
          await supabase
            .from('post_tags')
            .upsert({ post_id: post.id, tag_id: tagId });
        }
      }
    }

    return {
      message: 'Post updated successfully',
      post_id: post.id,
      slug: post.slug,
      url: `https://periospot.com/blog/${post.slug}`,
    };
  },

  async get_posts(
    params: GetPostsParams,
    supabase: SupabaseClient
  ): Promise<{
    posts: Array<Record<string, unknown>>;
    total: number | null;
    limit: number;
    offset: number;
  }> {
    const {
      status = 'all',
      category,
      search,
      limit = 10,
      offset = 0,
      order_by = 'created_at',
      order = 'desc',
    } = params;

    // Ensure limit is reasonable
    const safeLimit = Math.min(Math.max(1, limit), 100);

    let query = supabase
      .from('posts')
      .select(
        `
        id, title, slug, excerpt, status, published_at, created_at,
        view_count, reading_time_minutes, is_featured,
        featured_image_url, featured_image_alt,
        categories, tags
      `,
        { count: 'exact' }
      )
      .order(order_by, { ascending: order === 'asc' })
      .range(offset, offset + safeLimit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (category) {
      // Filter by category array containing the slug
      query = query.contains('categories', [category]);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get posts: ${error.message}`);
    }

    return {
      posts:
        posts?.map((p) => ({
          ...p,
          url: `https://periospot.com/blog/${p.slug}`,
        })) || [],
      total: count,
      limit: safeLimit,
      offset,
    };
  },

  async get_post(
    params: GetPostParams,
    supabase: SupabaseClient
  ): Promise<Record<string, unknown>> {
    const { post_id, slug } = params;

    if (!post_id && !slug) {
      throw new Error('Either post_id or slug is required');
    }

    let query = supabase.from('posts').select('*');

    if (post_id) {
      query = query.eq('id', post_id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: post, error } = await query.single();

    if (error) {
      throw new Error(`Failed to get post: ${error.message}`);
    }

    // Post already has categories and tags as arrays
    return {
      ...post,
      url: `https://periospot.com/blog/${post.slug}`,
    };
  },

  async delete_post(
    params: DeletePostParams,
    supabase: SupabaseClient
  ): Promise<{ message: string; post_id?: string }> {
    const { post_id, slug, permanent = false } = params;

    if (!post_id && !slug) {
      throw new Error('Either post_id or slug is required');
    }

    if (permanent) {
      // Permanently delete
      let query = supabase.from('posts').delete();
      if (post_id) {
        query = query.eq('id', post_id);
      } else if (slug) {
        query = query.eq('slug', slug);
      }

      const { error } = await query;
      if (error) {
        throw new Error(`Failed to delete post: ${error.message}`);
      }

      return { message: 'Post permanently deleted' };
    } else {
      // Archive instead
      let query = supabase.from('posts').update({ status: 'archived' });
      if (post_id) {
        query = query.eq('id', post_id);
      } else if (slug) {
        query = query.eq('slug', slug);
      }

      const { data: post, error } = await query.select().single();
      if (error) {
        throw new Error(`Failed to archive post: ${error.message}`);
      }

      return { message: 'Post archived', post_id: post.id };
    }
  },

  async publish_post(
    params: GetPostParams,
    supabase: SupabaseClient
  ): Promise<{ message: string; url: string }> {
    const { post_id, slug } = params;

    if (!post_id && !slug) {
      throw new Error('Either post_id or slug is required');
    }

    let query = supabase.from('posts').update({
      status: 'published',
      published_at: new Date().toISOString(),
    });

    if (post_id) {
      query = query.eq('id', post_id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: post, error } = await query.select().single();

    if (error) {
      throw new Error(`Failed to publish post: ${error.message}`);
    }

    return {
      message: `Post "${post.title}" published successfully`,
      url: `https://periospot.com/blog/${post.slug}`,
    };
  },
};

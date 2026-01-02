// MCP Tools for Category Management

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MCPToolManifest } from '@/lib/types/mcp';
import { generateSlug } from '../utils/helpers';

// =============================================================================
// TOOL MANIFESTS
// =============================================================================

export const categoryToolManifests: MCPToolManifest[] = [
  {
    name: 'list_categories',
    description: 'List all blog categories',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_category',
    description: 'Create a new blog category',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Category name (e.g., "Dental Implants")',
        },
        description: {
          type: 'string',
          description: 'Category description',
        },
        parent_slug: {
          type: 'string',
          description: 'Parent category slug for nested categories',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_category',
    description: 'Update a category',
    parameters: {
      type: 'object',
      properties: {
        category_id: {
          type: 'string',
          description: 'Category UUID',
        },
        slug: {
          type: 'string',
          description: 'Category slug (alternative to ID)',
        },
        name: {
          type: 'string',
          description: 'New name',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
      },
      required: [],
    },
  },
  {
    name: 'delete_category',
    description: 'Delete a category (posts will be uncategorized)',
    parameters: {
      type: 'object',
      properties: {
        category_id: {
          type: 'string',
          description: 'Category UUID',
        },
        slug: {
          type: 'string',
          description: 'Category slug',
        },
      },
      required: [],
    },
  },
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

export const categoryTools = {
  async list_categories(
    _params: Record<string, unknown>,
    supabase: SupabaseClient
  ): Promise<{ categories: Array<Record<string, unknown>> }> {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to list categories: ${error.message}`);
    }

    return { categories: categories || [] };
  },

  async create_category(
    params: { name: string; description?: string; parent_slug?: string },
    supabase: SupabaseClient
  ): Promise<{
    message: string;
    category_id: string;
    slug: string;
  }> {
    const { name, description, parent_slug } = params;
    const slug = generateSlug(name);

    // Check if slug exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      throw new Error(`Category with slug "${slug}" already exists`);
    }

    // Get parent ID if provided
    let parent_id: string | null = null;
    if (parent_slug) {
      const { data: parent } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', parent_slug)
        .single();
      parent_id = parent?.id || null;
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        parent_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return {
      message: `Category "${name}" created successfully`,
      category_id: category.id,
      slug: category.slug,
    };
  },

  async update_category(
    params: {
      category_id?: string;
      slug?: string;
      name?: string;
      description?: string;
    },
    supabase: SupabaseClient
  ): Promise<{ message: string; category_id: string }> {
    const { category_id, slug, name, description } = params;

    if (!category_id && !slug) {
      throw new Error('Either category_id or slug is required');
    }

    const updateData: Record<string, unknown> = {};
    if (name) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No updates provided');
    }

    let query = supabase.from('categories').update(updateData);
    if (category_id) {
      query = query.eq('id', category_id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: category, error } = await query.select().single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return {
      message: 'Category updated successfully',
      category_id: category.id,
    };
  },

  async delete_category(
    params: { category_id?: string; slug?: string },
    supabase: SupabaseClient
  ): Promise<{ message: string }> {
    const { category_id, slug } = params;

    if (!category_id && !slug) {
      throw new Error('Either category_id or slug is required');
    }

    let query = supabase.from('categories').delete();
    if (category_id) {
      query = query.eq('id', category_id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    return { message: 'Category deleted successfully' };
  },
};

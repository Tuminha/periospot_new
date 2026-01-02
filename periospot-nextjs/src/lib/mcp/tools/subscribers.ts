// MCP Tools for Newsletter Subscriber Management

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MCPToolManifest } from '@/lib/types/mcp';
import { isValidEmail } from '../utils/helpers';

// =============================================================================
// TOOL MANIFESTS
// =============================================================================

export const subscriberToolManifests: MCPToolManifest[] = [
  {
    name: 'add_subscriber',
    description: 'Add a new newsletter subscriber',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Subscriber email address',
        },
        name: {
          type: 'string',
          description: 'Subscriber name (optional)',
        },
        source: {
          type: 'string',
          description: 'How they subscribed (e.g., "homepage", "blog", "course")',
        },
        tags: {
          type: 'string',
          description: 'Comma-separated tags for segmentation',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'list_subscribers',
    description: 'List newsletter subscribers with optional filters',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['active', 'unsubscribed', 'bounced', 'all'],
          default: 'active',
        },
        search: {
          type: 'string',
          description: 'Search by email or name',
        },
        tag: {
          type: 'string',
          description: 'Filter by tag',
        },
        limit: {
          type: 'number',
          description: 'Maximum subscribers to return',
          default: 50,
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
          default: 0,
        },
      },
      required: [],
    },
  },
  {
    name: 'update_subscriber',
    description: 'Update subscriber details or status',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Subscriber email to update',
        },
        subscriber_id: {
          type: 'string',
          description: 'Subscriber UUID (alternative to email)',
        },
        name: {
          type: 'string',
          description: 'New name',
        },
        status: {
          type: 'string',
          description: 'New status',
          enum: ['active', 'unsubscribed', 'bounced'],
        },
        tags: {
          type: 'string',
          description: 'New comma-separated tags (replaces existing)',
        },
      },
      required: [],
    },
  },
  {
    name: 'unsubscribe',
    description: 'Unsubscribe an email from the newsletter',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email to unsubscribe',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'get_subscriber_stats',
    description: 'Get newsletter subscriber statistics',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

export const subscriberTools = {
  async add_subscriber(
    params: { email: string; name?: string; source?: string; tags?: string },
    supabase: SupabaseClient
  ): Promise<{
    message: string;
    subscriber_id: string;
    email: string;
  }> {
    const { email, name, source, tags } = params;

    if (!isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'active') {
        throw new Error('Email is already subscribed');
      }
      // Reactivate if previously unsubscribed
      const { data: updated, error } = await supabase
        .from('subscribers')
        .update({
          status: 'active',
          unsubscribed_at: null,
          name: name || undefined,
          source: source || undefined,
          tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reactivate subscriber: ${error.message}`);
      }

      return {
        message: 'Subscriber reactivated successfully',
        subscriber_id: updated.id,
        email: updated.email,
      };
    }

    // Create new subscriber
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        source: source || null,
        tags: tags ? tags.split(',').map((t) => t.trim()) : null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add subscriber: ${error.message}`);
    }

    return {
      message: 'Subscriber added successfully',
      subscriber_id: subscriber.id,
      email: subscriber.email,
    };
  },

  async list_subscribers(
    params: {
      status?: 'active' | 'unsubscribed' | 'bounced' | 'all';
      search?: string;
      tag?: string;
      limit?: number;
      offset?: number;
    },
    supabase: SupabaseClient
  ): Promise<{
    subscribers: Array<Record<string, unknown>>;
    total: number | null;
    limit: number;
    offset: number;
  }> {
    const {
      status = 'active',
      search,
      tag,
      limit = 50,
      offset = 0,
    } = params;

    const safeLimit = Math.min(Math.max(1, limit), 500);

    let query = supabase
      .from('subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + safeLimit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: subscribers, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list subscribers: ${error.message}`);
    }

    return {
      subscribers: subscribers || [],
      total: count,
      limit: safeLimit,
      offset,
    };
  },

  async update_subscriber(
    params: {
      email?: string;
      subscriber_id?: string;
      name?: string;
      status?: 'active' | 'unsubscribed' | 'bounced';
      tags?: string;
    },
    supabase: SupabaseClient
  ): Promise<{ message: string; subscriber_id: string }> {
    const { email, subscriber_id, name, status, tags } = params;

    if (!email && !subscriber_id) {
      throw new Error('Either email or subscriber_id is required');
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'unsubscribed') {
        updateData.unsubscribed_at = new Date().toISOString();
      }
    }
    if (tags !== undefined) {
      updateData.tags = tags.split(',').map((t) => t.trim());
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No updates provided');
    }

    let query = supabase.from('subscribers').update(updateData);
    if (subscriber_id) {
      query = query.eq('id', subscriber_id);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    const { data: subscriber, error } = await query.select().single();

    if (error) {
      throw new Error(`Failed to update subscriber: ${error.message}`);
    }

    return {
      message: 'Subscriber updated successfully',
      subscriber_id: subscriber.id,
    };
  },

  async unsubscribe(
    params: { email: string },
    supabase: SupabaseClient
  ): Promise<{ message: string }> {
    const { email } = params;

    const { error } = await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase());

    if (error) {
      throw new Error(`Failed to unsubscribe: ${error.message}`);
    }

    return { message: 'Unsubscribed successfully' };
  },

  async get_subscriber_stats(
    _params: Record<string, unknown>,
    supabase: SupabaseClient
  ): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
    this_month: number;
  }> {
    // Get counts by status
    const { data: stats, error } = await supabase
      .from('subscribers')
      .select('status');

    if (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }

    const total = stats?.length || 0;
    const active = stats?.filter((s) => s.status === 'active').length || 0;
    const unsubscribed =
      stats?.filter((s) => s.status === 'unsubscribed').length || 0;
    const bounced = stats?.filter((s) => s.status === 'bounced').length || 0;

    // Get this month's new subscribers
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonth } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', startOfMonth.toISOString());

    return {
      total,
      active,
      unsubscribed,
      bounced,
      this_month: thisMonth || 0,
    };
  },
};

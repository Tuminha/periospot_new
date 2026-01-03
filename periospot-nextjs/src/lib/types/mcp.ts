// MCP (Model Context Protocol) Types for Periospot

export interface MCPRequest {
  tool: string;
  params: Record<string, unknown>;
}

export interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MCPToolManifest {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      default?: unknown;
    }>;
    required: string[];
  };
}

export interface MCPManifest {
  name: string;
  version: string;
  description: string;
  tools: MCPToolManifest[];
}

// Database types matching Supabase schema

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  content_html: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category_id: string | null;
  author_id: string | null;
  status: PostStatus;
  published_at: string | null;
  scheduled_for: string | null;
  view_count: number;
  reading_time_minutes: number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Image {
  id: string;
  url: string;
  storage_path: string | null;
  filename: string | null;
  original_filename: string | null;
  alt_text: string | null;
  caption: string | null;
  folder: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string | null;
  tags: string[] | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface AffiliateLink {
  id: string;
  original_url: string;
  short_url: string;
  short_code: string | null;
  group_name: string | null;
  description: string | null;
  clicks: number;
  created_at: string;
}

export interface MCPAuditLog {
  id?: string;
  tool_name: string;
  input_params: Record<string, unknown> | null;
  result: unknown | null;
  success: boolean;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at?: string;
}

// Tool handler type - accepts a flexible params object
export type MCPToolHandler = (
  params: Record<string, unknown>,
  supabase: import('@supabase/supabase-js').SupabaseClient
) => Promise<unknown>;

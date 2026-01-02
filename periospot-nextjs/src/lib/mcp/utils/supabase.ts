// Supabase Service Role Client for MCP Operations
// This client bypasses Row Level Security (RLS) for admin operations

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serviceClient: SupabaseClient | null = null;

/**
 * Create a Supabase client with service role key
 * This client has full database access and bypasses RLS
 * Only use for server-side MCP operations
 */
export function createServiceRoleClient(): SupabaseClient {
  // Return cached client if available
  if (serviceClient) {
    return serviceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}

/**
 * Get the public URL for a file in Supabase Storage
 */
export function getStoragePublicUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

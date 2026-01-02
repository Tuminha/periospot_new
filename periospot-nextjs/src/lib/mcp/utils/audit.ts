// MCP Audit Logging

import { createClient } from '@supabase/supabase-js';
import type { MCPAuditLog } from '@/lib/types/mcp';

/**
 * Log an MCP action to the audit log table
 * Uses a separate client to avoid affecting the main operation
 */
export async function logMCPAction(log: Omit<MCPAuditLog, 'id' | 'created_at'>): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.warn('Supabase credentials not available for audit logging');
      return;
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    await supabase.from('mcp_audit_log').insert({
      tool_name: log.tool_name,
      input_params: log.input_params,
      result: log.result,
      success: log.success,
      error_message: log.error_message,
      execution_time_ms: log.execution_time_ms,
    });
  } catch (error) {
    // Don't throw - audit logging should never break the main operation
    console.error('Failed to log MCP action:', error);
  }
}

/**
 * Get recent MCP audit logs
 */
export async function getAuditLogs(limit: number = 50): Promise<MCPAuditLog[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not available');
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from('mcp_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  return data || [];
}

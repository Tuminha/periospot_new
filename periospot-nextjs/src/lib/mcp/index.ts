// Main MCP Handler for Periospot
// This module handles MCP requests and routes them to the appropriate tools

import type { MCPRequest, MCPResponse, MCPManifest } from '@/lib/types/mcp';
import { tools, toolManifests } from './tools';
import { createServiceRoleClient } from './utils/supabase';
import { logMCPAction } from './utils/audit';

// =============================================================================
// MCP MANIFEST
// =============================================================================

/**
 * Get the MCP manifest describing all available tools
 * This is returned on GET requests to the MCP endpoint
 */
export function getMCPManifest(): MCPManifest {
  return {
    name: 'periospot-mcp',
    version: '1.0.0',
    description:
      'MCP server for Periospot content management. Manage blog posts, images, categories, and newsletter subscribers.',
    tools: toolManifests,
  };
}

// =============================================================================
// MCP REQUEST HANDLER
// =============================================================================

/**
 * Handle an MCP request
 * Routes the request to the appropriate tool and returns the result
 */
export async function handleMCPRequest(
  request: MCPRequest
): Promise<MCPResponse> {
  const startTime = Date.now();
  const { tool, params } = request;

  // Validate request
  if (!tool) {
    return {
      success: false,
      error: 'Missing required field: tool',
    };
  }

  // Get the tool handler
  const handler = tools[tool];
  if (!handler) {
    return {
      success: false,
      error: `Unknown tool: ${tool}. Available tools: ${Object.keys(tools).join(', ')}`,
    };
  }

  try {
    // Create Supabase client with service role for full access
    const supabase = createServiceRoleClient();

    // Execute the tool
    const result = await handler(params || {}, supabase);

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    // Log the successful action (don't await - fire and forget)
    logMCPAction({
      tool_name: tool,
      input_params: params,
      result,
      success: true,
      error_message: null,
      execution_time_ms: executionTime,
    }).catch(console.error);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const executionTime = Date.now() - startTime;

    // Log the failed action (don't await - fire and forget)
    logMCPAction({
      tool_name: tool,
      input_params: params,
      result: null,
      success: false,
      error_message: errorMessage,
      execution_time_ms: executionTime,
    }).catch(console.error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// BATCH REQUEST HANDLER
// =============================================================================

/**
 * Handle multiple MCP requests in a batch
 * Useful for executing multiple operations in sequence
 */
export async function handleMCPBatch(
  requests: MCPRequest[]
): Promise<MCPResponse[]> {
  const results: MCPResponse[] = [];

  for (const request of requests) {
    const result = await handleMCPRequest(request);
    results.push(result);

    // Stop on first error if needed (optional)
    // if (!result.success) break;
  }

  return results;
}

// =============================================================================
// TOOL INFO
// =============================================================================

/**
 * Get information about a specific tool
 */
export function getToolInfo(
  toolName: string
): { exists: boolean; manifest?: (typeof toolManifests)[0] } {
  const manifest = toolManifests.find((m) => m.name === toolName);
  return {
    exists: !!manifest,
    manifest,
  };
}

/**
 * List all available tool names
 */
export function listTools(): string[] {
  return Object.keys(tools);
}

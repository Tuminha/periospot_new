// MCP Protocol Handler for Periospot
// Implements JSON-RPC 2.0 over SSE for Claude Desktop integration

import { tools, toolManifests } from './tools';
import { createServiceRoleClient } from './utils/supabase';

// MCP Protocol Version
const PROTOCOL_VERSION = '2024-11-05';

// Server Info
const SERVER_INFO = {
  name: 'periospot-mcp',
  version: '1.0.0',
};

// JSON-RPC Error Codes
const ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
};

// Types for JSON-RPC
interface JsonRpcRequest {
  jsonrpc: string;
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number | string | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

// Convert our tool manifests to MCP format
export function getMCPTools(): MCPTool[] {
  return toolManifests.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.parameters,
  }));
}

// Create JSON-RPC error response
function createError(
  id: number | string | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data !== undefined && { data }),
    },
  };
}

// Create JSON-RPC success response
function createSuccess(id: number | string | null, result: unknown): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

// Handle tool calls
async function handleToolCall(
  id: number | string | null,
  params: { name?: string; arguments?: Record<string, unknown> }
): Promise<JsonRpcResponse> {
  const { name, arguments: args } = params;

  if (!name) {
    return createError(id, ERROR_CODES.INVALID_PARAMS, 'Missing tool name');
  }

  const handler = tools[name];
  if (!handler) {
    return createError(
      id,
      ERROR_CODES.INVALID_PARAMS,
      `Unknown tool: ${name}. Available tools: ${Object.keys(tools).join(', ')}`
    );
  }

  try {
    const supabase = createServiceRoleClient();
    const result = await handler(args || {}, supabase);

    return createSuccess(id, {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    });
  } catch (error) {
    // Return error as tool result (not JSON-RPC error) per MCP spec
    return createSuccess(id, {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    });
  }
}

// Handle JSON-RPC requests
export async function handleMCPMessage(
  message: JsonRpcRequest
): Promise<JsonRpcResponse | null> {
  const { jsonrpc, id, method, params } = message;

  // Validate JSON-RPC version
  if (jsonrpc !== '2.0') {
    return createError(id ?? null, ERROR_CODES.INVALID_REQUEST, 'Invalid JSON-RPC version');
  }

  try {
    switch (method) {
      // Initialize handshake
      case 'initialize':
        return createSuccess(id ?? null, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: {},
          },
          serverInfo: SERVER_INFO,
        });

      // Client acknowledgment - no response needed
      case 'initialized':
        return null;

      // List available tools
      case 'tools/list':
        return createSuccess(id ?? null, {
          tools: getMCPTools(),
        });

      // Execute a tool
      case 'tools/call':
        return await handleToolCall(
          id ?? null,
          (params as { name?: string; arguments?: Record<string, unknown> }) || {}
        );

      // Ping/pong for keepalive
      case 'ping':
        return createSuccess(id ?? null, {});

      // Notifications/shutdown
      case 'notifications/cancelled':
      case 'shutdown':
        return null;

      // Unknown method
      default:
        return createError(
          id ?? null,
          ERROR_CODES.METHOD_NOT_FOUND,
          `Method not found: ${method}`
        );
    }
  } catch (error) {
    console.error('MCP Protocol Error:', error);
    return createError(
      id ?? null,
      ERROR_CODES.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Internal error'
    );
  }
}

// Export constants for use in routes
export { PROTOCOL_VERSION, SERVER_INFO, ERROR_CODES };

// MCP Message Endpoint for Claude Desktop
// Receives JSON-RPC messages and returns responses

import { NextRequest, NextResponse } from 'next/server';
import { handleMCPMessage, ERROR_CODES } from '@/lib/mcp/protocol';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: NextRequest) {
  try {
    // Get session ID from query params (optional - for session validation)
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MCP] Message received (session: ${sessionId || 'none'})`);
    }

    // Parse the JSON-RPC message
    let message;
    try {
      message = await request.json();
    } catch {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: ERROR_CODES.PARSE_ERROR,
            message: 'Parse error: Invalid JSON',
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Log the incoming message (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[MCP] Request:', JSON.stringify(message, null, 2));
    }

    // Handle the message
    const response = await handleMCPMessage(message);

    // If no response needed (e.g., 'initialized' notification)
    if (response === null) {
      return new NextResponse(null, { status: 202, headers: corsHeaders });
    }

    // Log the response (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[MCP] Response:', JSON.stringify(response, null, 2));
    }

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('[MCP] Message Error:', error);

    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Use Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

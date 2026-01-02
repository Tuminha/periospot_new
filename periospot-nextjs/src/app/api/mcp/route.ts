// MCP API Route for Periospot
// Handles Model Context Protocol requests from Claude and other AI assistants

import { NextRequest, NextResponse } from 'next/server';
import { handleMCPRequest, getMCPManifest, handleMCPBatch } from '@/lib/mcp';

// =============================================================================
// CORS CONFIGURATION
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// =============================================================================
// OPTIONS - CORS Preflight
// =============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// =============================================================================
// GET - Return MCP Manifest
// =============================================================================

export async function GET() {
  try {
    const manifest = getMCPManifest();
    return NextResponse.json(manifest, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('MCP GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get MCP manifest' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// =============================================================================
// POST - Execute MCP Tool
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify MCP authentication
    const authValid = await verifyMCPAuth(request);
    if (!authValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if this is a batch request
    if (Array.isArray(body)) {
      const results = await handleMCPBatch(body);
      return NextResponse.json(results, { headers: corsHeaders });
    }

    // Validate single request
    if (!body.tool) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: tool' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle single request
    const result = await handleMCPRequest({
      tool: body.tool,
      params: body.params || {},
    });

    // Return appropriate status code
    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status, headers: corsHeaders });
  } catch (error) {
    console.error('MCP POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

/**
 * Verify MCP API key authentication
 * Supports both Bearer token and X-API-Key header
 */
async function verifyMCPAuth(request: NextRequest): Promise<boolean> {
  const apiKey = process.env.MCP_API_KEY;

  // If no API key is configured, allow all requests (dev mode)
  if (!apiKey) {
    console.warn('MCP_API_KEY not set - allowing unauthenticated requests');
    return true;
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (token === apiKey) {
      return true;
    }
  }

  // Check X-API-Key header
  const xApiKey = request.headers.get('X-API-Key');
  if (xApiKey === apiKey) {
    return true;
  }

  return false;
}

// =============================================================================
// RUNTIME CONFIGURATION
// =============================================================================

// Use Node.js runtime for full Node API access (Buffer, etc.)
export const runtime = 'nodejs';

// Don't cache MCP responses
export const dynamic = 'force-dynamic';

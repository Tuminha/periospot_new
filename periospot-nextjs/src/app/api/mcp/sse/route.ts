// MCP SSE Endpoint for Claude Desktop
// Establishes Server-Sent Events connection and provides message endpoint URL

import { NextRequest } from 'next/server';

// Store active sessions (in production, consider using Redis)
const sessions = new Map<
  string,
  {
    messageEndpoint: string;
    createdAt: number;
  }
>();

// Clean up old sessions periodically
function cleanupSessions() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, session] of sessions) {
    if (session.createdAt < oneHourAgo) {
      sessions.delete(id);
    }
  }
}

export async function GET(request: NextRequest) {
  // Generate unique session ID
  const sessionId = crypto.randomUUID();

  // Get the base URL for the message endpoint
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const messageEndpoint = `${baseUrl}/api/mcp/message?sessionId=${sessionId}`;

  // Store session
  sessions.set(sessionId, {
    messageEndpoint,
    createdAt: Date.now(),
  });

  // Clean up old sessions
  cleanupSessions();

  // Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send the endpoint event immediately
      // This tells Claude Desktop where to send JSON-RPC messages
      const endpointEvent = `event: endpoint\ndata: ${messageEndpoint}\n\n`;
      controller.enqueue(encoder.encode(endpointEvent));

      // Keep connection alive with periodic pings (every 30 seconds)
      const pingInterval = setInterval(() => {
        try {
          const ping = `: ping ${Date.now()}\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch {
          // Connection closed, clean up
          clearInterval(pingInterval);
          sessions.delete(sessionId);
        }
      }, 30000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        sessions.delete(sessionId);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Export sessions for validation in message endpoint
export { sessions };

// Use Node.js runtime for streaming support
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

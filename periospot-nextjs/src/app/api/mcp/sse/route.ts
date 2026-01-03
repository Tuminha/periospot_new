import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Vercel Pro: 300s max - user upgraded to Pro plan
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const sessionId = crypto.randomUUID();
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const messageEndpoint = `${baseUrl}/api/mcp/message?sessionId=${sessionId}`;

  let isConnected = true;
  const startTime = Date.now();

  const stream = new ReadableStream({
    start(controller) {
      console.log(`[MCP SSE] Connection opened: ${sessionId}`);

      // Send endpoint event immediately
      const endpointEvent = `event: endpoint\ndata: ${messageEndpoint}\n\n`;
      controller.enqueue(encoder.encode(endpointEvent));

      // Send keepalive every 5 seconds (more frequent for stability)
      const pingInterval = setInterval(() => {
        if (!isConnected) {
          clearInterval(pingInterval);
          return;
        }

        // Check if approaching timeout (close gracefully before Vercel kills us)
        const elapsed = Date.now() - startTime;
        if (elapsed > 290000) { // 290 seconds - close before 300s Pro timeout
          console.log(`[MCP SSE] Approaching timeout, closing gracefully: ${sessionId}`);
          clearInterval(pingInterval);
          isConnected = false;
          try {
            // Send a reconnect hint before closing
            controller.enqueue(encoder.encode(`event: reconnect\ndata: ${messageEndpoint}\n\n`));
            controller.close();
          } catch (e) {
            // Already closed
          }
          return;
        }

        try {
          controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
        } catch (e) {
          console.log(`[MCP SSE] Ping failed, closing: ${sessionId}`);
          clearInterval(pingInterval);
          isConnected = false;
        }
      }, 5000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[MCP SSE] Client disconnected: ${sessionId}`);
        isConnected = false;
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
      });
    },
    cancel() {
      console.log(`[MCP SSE] Stream cancelled: ${sessionId}`);
      isConnected = false;
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=300',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Handle OPTIONS for CORS
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

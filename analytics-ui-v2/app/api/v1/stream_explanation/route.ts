import { NextRequest } from 'next/server';

// Force Node.js runtime for this route (required for streaming)
export const runtime = 'nodejs';
import { components } from '@/common';

const { analyticsAIAdaptor } = components;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryId = searchParams.get('queryId');

  if (!queryId) {
    return new Response(JSON.stringify({ error: 'queryId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const stream = await analyticsAIAdaptor.getAskStreamingResult(queryId);

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(encoder.encode(chunk.toString()));
        });

        stream.on('end', () => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        });

        stream.on('error', (error) => {
          controller.error(error);
        });

        // Handle client disconnect
        req.signal.addEventListener('abort', () => {
          stream.destroy();
          controller.close();
        });
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


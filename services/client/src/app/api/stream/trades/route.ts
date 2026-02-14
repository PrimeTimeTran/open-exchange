import Redis from 'ioredis';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instrumentIdsParam = searchParams.get('instrumentId');

  if (!instrumentIdsParam) {
    return new Response('Missing instrumentId', { status: 400 });
  }

  const instrumentIds = instrumentIdsParam.split(',');

  console.log(
    `[Stream] Client connected for instruments: ${instrumentIds.join(', ')}`,
  );

  const stream = new ReadableStream({
    async start(controller) {
      // Create a dedicated Redis connection for this subscription
      // (Redis requires a dedicated connection for Pub/Sub)
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      console.log(`[Stream] Connecting to Redis at ${redisUrl}`);
      const subscriber = new Redis(redisUrl);

      const channels = instrumentIds.flatMap((id) => [
        `trade.${id}`,
        `orderbook.${id}`,
      ]);

      try {
        await subscriber.subscribe(...channels);
        console.log(`[Stream] Subscribed to channels: ${channels.join(', ')}`);

        subscriber.on('message', (channel, message) => {
          if (req.signal.aborted) return;

          console.log(`[Stream] Received message on ${channel}: ${message}`);
          try {
            const event = JSON.parse(message);

            // Inject event type based on channel if needed, or rely on payload
            if (channel.startsWith('trade.')) {
              event.eventType = 'trade';
            } else if (channel.startsWith('orderbook.')) {
              event.eventType = 'orderbook';
            }

            // Format as Server-Sent Event (SSE)
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          } catch (err) {
            console.warn('[Stream] Error enqueuing message:', err);
            // If controller is closed, we should probably stop
            if (String(err).includes('closed')) {
              subscriber.quit();
            }
          }
        });

        // Keep-alive to prevent timeout
        const keepAlive = setInterval(() => {
          if (req.signal.aborted) {
            clearInterval(keepAlive);
            return;
          }
          try {
            controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
          } catch (err) {
            console.warn('[Stream] Error sending keep-alive:', err);
            clearInterval(keepAlive);
            subscriber.quit();
          }
        }, 15000);

        // Cleanup when client disconnects
        req.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          subscriber.quit();
        });
      } catch (err) {
        console.error('Redis subscription error:', err);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

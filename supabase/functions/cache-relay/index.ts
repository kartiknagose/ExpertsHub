/// <reference path="../types.d.ts" />

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const relaySecret = Deno.env.get('CACHE_RELAY_SECRET') || '';
    const incomingSecret = req.headers.get('x-cache-secret') || '';

    // Validate secret
    if (!relaySecret || incomingSecret !== relaySecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const relayUrl = Deno.env.get('CACHE_RELAY_URL');
    if (!relayUrl) {
      return new Response(JSON.stringify({ error: 'CACHE_RELAY_URL not configured' }), { status: 500 });
    }

    // Forward to Render backend
    const response = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-cache-secret': incomingSecret,
      },
      body: await req.text(),
    });

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});

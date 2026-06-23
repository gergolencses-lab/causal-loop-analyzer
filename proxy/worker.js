// Cloudflare Worker — Anthropic API proxy for causal-loop-analyzer.
// The Anthropic API key lives ONLY here, as the encrypted Worker secret
// `ANTHROPIC_API_KEY` (set via `wrangler secret put ANTHROPIC_API_KEY`).
//
// The browser calls this Worker; the Worker injects the key and forwards to
// Anthropic with `stream: true`, then pipes the SSE body back. Streaming keeps
// bytes flowing immediately so a long generation never trips Cloudflare's ~100s
// edge timeout (HTTP 524). Transient overloads/rate-limits are retried
// server-side — including the case where Anthropic returns HTTP 200 and an
// `error` event as the FIRST thing on the stream. The key never reaches the
// client bundle.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const ALLOWED_ORIGINS = [
  'https://gergolencses-lab.github.io', // production (GitHub Pages)
  'http://localhost:5173', // local Vite dev
];

const MAX_RETRIES = 5;
const MAX_BACKOFF_MS = 8000;
const RETRYABLE_SSE_ERRORS = new Set(['overloaded_error', 'rate_limit_error', 'api_error']);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function backoffMs(attempt, resp) {
  const retryAfter = parseInt(resp?.headers.get('retry-after') || '0', 10);
  const base = retryAfter > 0 ? retryAfter * 1000 : Math.min(500 * 2 ** attempt, MAX_BACKOFF_MS);
  return base + Math.floor(Math.random() * 300);
}

// Scan the first SSE chunk for an `error` event opening the stream; return its
// error type (e.g. "overloaded_error") or null if the stream looks healthy.
function openingErrorType(text) {
  for (const line of text.split('\n')) {
    const s = line.trim();
    if (!s.startsWith('data:')) continue;
    try {
      const evt = JSON.parse(s.slice(5).trim());
      if (evt.type === 'error') return evt.error?.type || 'error';
    } catch (_) { /* partial/non-JSON line — ignore */ }
  }
  return null;
}

async function callAnthropic(body, apiKey) {
  return fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body,
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: allowed ? 204 : 403,
        headers: allowed ? corsHeaders(origin) : {},
      });
    }

    // Server-side origin gate: blocks other sites' browsers from using the
    // proxy. (Not a hard wall against non-browser clients — pair with an
    // Anthropic spend limit and/or Cloudflare rate limiting as a backstop.)
    if (!allowed) {
      return new Response('Forbidden', { status: 403 });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    const body = await request.text();

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const upstream = await callAnthropic(body, env.ANTHROPIC_API_KEY);

      // Non-200: retry transient HTTP statuses, otherwise return the error body.
      if (upstream.status !== 200) {
        const retryable =
          upstream.status === 429 || upstream.status === 529 || upstream.status >= 500;
        if (retryable && attempt < MAX_RETRIES) {
          try { await upstream.body?.cancel(); } catch (_) { /* ignore */ }
          await sleep(backoffMs(attempt, upstream));
          continue;
        }
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': upstream.headers.get('content-type') || 'application/json',
            'Cache-Control': 'no-store',
          },
        });
      }

      // 200 stream: peek the first chunk. A transient `error` event opening the
      // stream is retryable; anything else is a real generation we stream on.
      const reader = upstream.body.getReader();
      const first = await reader.read();
      const firstText = first.value ? new TextDecoder().decode(first.value) : '';
      const errType = openingErrorType(firstText);

      if (errType && RETRYABLE_SSE_ERRORS.has(errType) && attempt < MAX_RETRIES) {
        try { await reader.cancel(); } catch (_) { /* ignore */ }
        await sleep(backoffMs(attempt, null));
        continue;
      }

      // Healthy (or final) stream: re-emit the peeked chunk, then pipe the rest.
      const out = new ReadableStream({
        start(controller) {
          if (first.value) controller.enqueue(first.value);
          if (first.done) { controller.close(); return; }
          (async () => {
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          })();
        },
        cancel(reason) { reader.cancel(reason); },
      });

      return new Response(out, {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
          'Cache-Control': 'no-store',
        },
      });
    }
  },
};

// Cloudflare Worker — Anthropic API proxy for causal-loop-analyzer.
// The Anthropic API key lives ONLY here, as the encrypted Worker secret
// `ANTHROPIC_API_KEY` (set via `wrangler secret put ANTHROPIC_API_KEY`).
// The browser calls this Worker; the Worker injects the key and forwards to
// Anthropic — retrying transient overloads/rate-limits server-side so the
// client doesn't see them. The key is never shipped to the client bundle.

const ALLOWED_ORIGINS = [
  'https://gergolencses-lab.github.io', // production (GitHub Pages)
  'http://localhost:5173', // local Vite dev
];

const MAX_RETRIES = 4; // retry on 429 / 529 / 5xx
const MAX_BACKOFF_MS = 8000;

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

// Forward to Anthropic, retrying transient failures (overloaded, rate-limited,
// 5xx) with exponential backoff + jitter. Honors Retry-After when present.
async function forwardWithRetry(body, apiKey) {
  let resp;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body,
    });

    const retryable = resp.status === 429 || resp.status === 529 || resp.status >= 500;
    if (!retryable || attempt === MAX_RETRIES) return resp;

    const retryAfter = parseInt(resp.headers.get('retry-after') || '0', 10);
    const backoff =
      retryAfter > 0 ? retryAfter * 1000 : Math.min(500 * 2 ** attempt, MAX_BACKOFF_MS);
    await sleep(backoff + Math.floor(Math.random() * 300));
  }
  return resp;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === 'OPTIONS') {
      // Preflight — only answer for allowed origins.
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
    const upstream = await forwardWithRetry(body, env.ANTHROPIC_API_KEY);
    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  },
};

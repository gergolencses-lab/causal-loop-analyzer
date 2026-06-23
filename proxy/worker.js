// Cloudflare Worker — Anthropic API proxy for causal-loop-analyzer.
// The Anthropic API key lives ONLY here, as the encrypted Worker secret
// `ANTHROPIC_API_KEY` (set via `wrangler secret put ANTHROPIC_API_KEY`).
// The browser calls this Worker; the Worker injects the key and forwards to
// Anthropic. The key is never shipped to the client bundle.

const ALLOWED_ORIGINS = [
  'https://gergolencses-lab.github.io', // production (GitHub Pages)
  'http://localhost:5173', // local Vite dev
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
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

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  },
};

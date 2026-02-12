/**
 * Vercel serverless proxy: forwards /api/* to your backend.
 * Set BACKEND_URL in Vercel (e.g. https://your-app.railway.app) so the frontend
 * can use relative /api and still reach the backend. If VITE_API_URL is set
 * in Vercel instead, the client will call the backend directly and this proxy
 * is not used.
 */

const BACKEND_URL = process.env.BACKEND_URL || process.env.VITE_API_URL;

export default async function handler(req: Request): Promise<Response> {
  if (!BACKEND_URL) {
    return new Response(
      JSON.stringify({
        error: 'Backend not configured. Set BACKEND_URL (or VITE_API_URL) in Vercel Environment Variables.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const url = new URL(req.url);
  const pathname = url.pathname; // e.g. /api/notes
  const backendUrl = `${BACKEND_URL.replace(/\/$/, '')}${pathname}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: req.method,
    headers,
  };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    init.body = req.body;
  }

  try {
    const res = await fetch(backendUrl, init);
    const resHeaders = new Headers(res.headers);
    resHeaders.delete('content-encoding');
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return new Response(
      JSON.stringify({ error: 'Backend unreachable. Check BACKEND_URL and that the backend is running.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

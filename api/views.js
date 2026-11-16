// Page-view counter for harshkaptan.vercel.app
//   POST /api/views  -> counts one view, returns { value }
//   GET  /api/views  -> returns { value } without counting
// Stored in Upstash Redis (connect it in Vercel: Storage -> Upstash for Redis).
// Starts from 347, the count carried over from the old counter service.

const KEY = 'portfolio:views';
const START = 347;

// Vercel may add a custom prefix to the variable names (e.g. STORAGE_KV_REST_API_URL),
// so accept any *_KV_REST_API_URL / *_REDIS_REST_URL with its matching token.
function redisEnv() {
  const env = process.env;
  const pairs = [['KV_REST_API_URL', 'KV_REST_API_TOKEN'], ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']];
  for (const [u, t] of pairs) {
    const urlKey = Object.keys(env).find(k => k === u || k.endsWith('_' + u));
    if (!urlKey) continue;
    const tokenKey = urlKey.slice(0, urlKey.length - u.length) + t;
    if (env[urlKey] && env[tokenKey]) return { url: env[urlKey], token: env[tokenKey] };
  }
  return {};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { url, token } = redisEnv();
  if (!url || !token) return res.status(503).json({ error: 'counter storage not connected' });

  const count = req.method === 'POST';
  if (!count && req.method !== 'GET') return res.status(405).json({ error: 'use GET or POST' });

  const commands = [['SET', KEY, String(START), 'NX'], count ? ['INCR', KEY] : ['GET', KEY]];
  try {
    const r = await fetch(url.replace(/\/$/, '') + '/pipeline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
    });
    if (!r.ok) throw new Error('redis ' + r.status);
    const out = await r.json();
    const value = Number(out[1] && out[1].result);
    if (!Number.isFinite(value)) throw new Error('bad value');
    return res.status(200).json({ value });
  } catch (e) {
    return res.status(502).json({ error: 'counter storage unavailable' });
  }
};

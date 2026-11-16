// Page-view counter for harshkaptan.vercel.app
//   POST /api/views  -> counts one view, returns { value }
//   GET  /api/views  -> returns { value } without counting
// Works with either Redis option in Vercel → Storage:
//   - Upstash for Redis  (KV_REST_API_URL / KV_REST_API_TOKEN, REST API)
//   - Redis              (REDIS_URL, normal Redis connection)
// Variable names may carry a custom prefix (e.g. STORAGE_REDIS_URL).
// Starts from 347, the count carried over from the old counter service.

const KEY = 'portfolio:views';
const START = 347;

const findKey = suffix => Object.keys(process.env).find(k => k === suffix || k.endsWith('_' + suffix));

function restEnv() {
  for (const [u, t] of [['KV_REST_API_URL', 'KV_REST_API_TOKEN'], ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']]) {
    const urlKey = findKey(u);
    if (!urlKey) continue;
    const tokenKey = urlKey.slice(0, urlKey.length - u.length) + t;
    if (process.env[urlKey] && process.env[tokenKey]) return { url: process.env[urlKey], token: process.env[tokenKey] };
  }
  return null;
}

async function viaRest({ url, token }, count) {
  const commands = [['SET', KEY, String(START), 'NX'], count ? ['INCR', KEY] : ['GET', KEY]];
  const r = await fetch(url.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error('redis rest ' + r.status);
  const out = await r.json();
  return Number(out[1] && out[1].result);
}

let client = null; // reused across warm invocations
async function viaRedisUrl(redisUrl, count) {
  if (!client) {
    const { createClient } = require('redis');
    client = createClient({ url: redisUrl, socket: { connectTimeout: 5000 } });
    client.on('error', () => {});
    await client.connect();
  }
  await client.set(KEY, String(START), { NX: true });
  return Number(count ? await client.incr(KEY) : await client.get(KEY));
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const count = req.method === 'POST';
  if (!count && req.method !== 'GET') return res.status(405).json({ error: 'use GET or POST' });

  const rest = restEnv();
  const urlKey = findKey('REDIS_URL') || findKey('KV_URL');
  if (!rest && !urlKey) {
    // names only (never values), to make setup problems easy to spot
    const seen = Object.keys(process.env).filter(k => /REDIS|KV_|UPSTASH/.test(k));
    return res.status(503).json({ error: 'counter storage not connected', seen });
  }
  try {
    const value = rest ? await viaRest(rest, count) : await viaRedisUrl(process.env[urlKey], count);
    if (!Number.isFinite(value)) throw new Error('bad value');
    return res.status(200).json({ value });
  } catch (e) {
    client = null;
    return res.status(502).json({ error: 'counter storage unavailable' });
  }
};

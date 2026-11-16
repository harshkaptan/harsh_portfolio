// Page-view counter for harshkaptan.vercel.app
//   POST /api/views  -> counts one view, returns { value }
//   GET  /api/views  -> returns { value } without counting
// Stored in Upstash Redis (connect it in Vercel: Storage -> Upstash for Redis).
// Starts from 347, the count carried over from the old counter service.

const KEY = 'portfolio:views';
const START = 347;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
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

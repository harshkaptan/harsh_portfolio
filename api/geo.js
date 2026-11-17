// Visitor's approximate location for the "your local time" pill.
// Uses the city/country Vercel already attaches to every request
// (x-vercel-ip-* headers). Nothing is stored or logged.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  const h = name => {
    const v = req.headers[name];
    if (!v) return null;
    try { return decodeURIComponent(String(v)); } catch (e) { return String(v); }
  };
  res.status(200).json({
    city: h('x-vercel-ip-city'),
    region: h('x-vercel-ip-country-region'),
    country: h('x-vercel-ip-country'),
  });
};

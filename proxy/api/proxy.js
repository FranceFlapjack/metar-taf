// GET /api/proxy?url=… — a CORS proxy for aviationweather.gov's data API only,
// so this can never be used as an open proxy.
const { cors, getText } = require('./_lib');

function allowedTarget(raw) {
  let u;
  try { u = new URL(raw); } catch (_) { return false; }
  return u.protocol === 'https:' && u.hostname === 'aviationweather.gov' &&
         !u.port && u.pathname.startsWith('/api/data/');
}

async function handler(req, res) {
  if (!cors(req, res)) return;
  const target = req.query.url;
  if (!allowedTarget(target)) return res.status(400).send('url not allowed');
  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(await getText(target, 7000));
  } catch (e) {
    res.status(502).send('upstream failed: ' + e.message);
  }
}

module.exports = handler;
module.exports.allowedTarget = allowedTarget;

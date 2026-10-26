// Self-checks for the proxy: `node tests/check.js`. Offline except the
// last check, which fetches nsweb live through the real handler.
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const tmd = require('../api/tmd');
const proxy = require('../api/proxy');
const { allowedOrigin } = require('../api/_lib');

// Extractor against a hand-made page in nsweb's markup (NIL report dropped)
assert.deepStrictEqual(tmd.extractReports(fs.readFileSync(path.join(__dirname, 'nsweb-fixture.html'), 'utf8')), [
  'METAR VTBS 260700Z 09005KT 9999 FEW020 34/23 Q1010 NOSIG',
  'SPECI VTCC 260702Z 09010KT 9000 -TSRA FEW025CB BKN032 26/24 Q1013 TEMPO 4000 TSRA',
  'METAR COR VTPP 260700Z 28004KT 9999 FEW020 SCT100 30/25 Q1011 NOSIG',
]);

// Allowlists
assert.ok(proxy.allowedTarget('https://aviationweather.gov/api/data/metar?ids=VTBS'));
for (const bad of ['https://evil.com/api/data/x', 'https://aviationweather.gov.evil.com/api/data/x',
                   'http://aviationweather.gov/api/data/x', 'https://aviationweather.gov/other',
                   'https://aviationweather.gov:8443/api/data/x', undefined, 'not a url'])
  assert.ok(!proxy.allowedTarget(bad), bad);
assert.ok(allowedOrigin('https://franceflapjack.github.io'));
assert.ok(allowedOrigin('http://localhost:8765'));
assert.ok(!allowedOrigin('https://franceflapjack.github.io.evil.com'));
assert.ok(allowedOrigin('https://metar-th.vercel.app'));
assert.ok(!allowedOrigin('https://evil.com'));

// Handler end to end with a fake req/res
function call(handler, req) {
  return new Promise(resolve => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.code = c; return this; }, send(b) { this.body = b; resolve(this); } };
    handler(req, res);
  });
}
(async () => {
  const denied = await call(tmd, { headers: { origin: 'https://evil.com' }, query: {} });
  assert.strictEqual(denied.code, 403);
  // Same-origin GET from the app on metar-th.vercel.app carries no Origin.
  const same = await call(proxy, { headers: {}, query: { url: 'https://example.com/' } });
  assert.strictEqual(same.code, 400);
  assert.strictEqual(same.headers['Access-Control-Allow-Origin'], undefined);
  if (process.argv.includes('--live')) {
    const r = await call(tmd, { headers: { origin: 'https://franceflapjack.github.io' }, query: {} });
    assert.strictEqual(r.code, 200, r.body);
    assert.strictEqual(r.headers['Access-Control-Allow-Origin'], 'https://franceflapjack.github.io');
    console.log(r.body.split('\n').filter(l => / VT[A-Z]{2} /.test(l)).slice(0, 3).join('\n'));
  }
  console.log('proxy checks passed');
})();

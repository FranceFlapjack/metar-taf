// GET /api/tmd — the latest METAR/SPECI per station from TMD's nsWEBPIB, as
// plain text, one report per line. nsWEBPIB has Thai SPECI/COR that never
// reach aviationweather.gov, but it keeps only the newest report per station.
const { cors, getText } = require('./_lib');

const NSWEB_URL = 'https://nsweb.tmd.go.th/pages/actuals/metars.php?region=';

// Each report sits in <div class="js-metar"><a …>View Decoded</a>REPORT=</div>.
function extractReports(html) {
  const out = [];
  for (const m of html.matchAll(/<div class="js-metar">([\s\S]*?)<\/div>/g)) {
    const text = m[1]
      .replace(/<a\b[\s\S]*?<\/a>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ').trim()
      .replace(/\s*=$/, '');
    if (/^(METAR|SPECI) /.test(text) && !/ NIL$/.test(text)) out.push(text);
  }
  return out;
}

async function handler(req, res) {
  if (!cors(req, res)) return;
  try {
    const reports = extractReports(await getText(NSWEB_URL, 7000));
    // No reports = TMD changed its page or is down; never answer "nothing new".
    if (!reports.length) return res.status(502).send('no reports found');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(reports.join('\n'));
  } catch (e) {
    res.status(502).send('TMD fetch failed: ' + e.message);
  }
}

module.exports = handler;
module.exports.extractReports = extractReports;

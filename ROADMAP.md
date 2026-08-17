# METAR/TAF Briefing App — Roadmap

Status date: 2026-07-11. Current version is considered good and stable; the app
is deliberately left online and untouched between roadmap pushes.

## Done

- **2026-08-17 — TAF fix**: the whole TAF section was silently dead — upstream
  removed `hours` from `/api/data/taf`, which now answers HTTP 400
  ("Unexpected query parameter provided"). Every proxy therefore failed,
  `tafRaw` came back `null`, and every station rendered "No data available".
  METAR was unaffected (`/api/data/metar` still takes `hours`). Both TAF URLs
  now omit `hours`; nothing is lost, that endpoint only ever returned the
  current TAF per station.
- **2026-07-11 — Proxy reliability**: `fetchViaProxy` rewritten as a staggered
  parallel race (1.5 s stagger, first valid wins, winner remembered in
  localStorage). Proxy list health-checked and refreshed (5 entries). A dead
  proxy now costs at most one stagger delay, never a serial timeout cascade.
- **2026-07-11 — SIGMET fix**: feature was silently dead — upstream removed
  `hazard=CONVECTIVE` (HTTP 400) and `/api/data/sigmet` is US-domestic only.
  Now uses `/api/data/isigmet` and filters `VTBB|VTBD|VTCC` (VTBB = Bangkok
  FIR issues all Thai SIGMETs).
- **2026-07-11 — UI**: SIGMET section moved below TAF (main info first);
  station ICAO codes bolded in METAR/SPECI/TAF lines.

## Planned (suggested order)

1. [ ] **Shareable URLs** — encode stations in query params
       (`?stations=VTPO,VTPP`) so a daily briefing is a one-click bookmark.
       Small effort, daily payoff.
2. [ ] **Parser tests** — unit tests for `decodeToken`, `classifyFlight`,
       `findBestMetarForTime`, `colorizeLine` against a corpus of real METARs.
       The most fragile code; protects the leave-it-untouched strategy.
3. [ ] **TAF timeline visualization** — horizontal validity bar showing
       BECMG/TEMPO/FM change groups, colored by flight category.
4. [ ] **NOTAMs** — the one item a real briefing sheet has that this doesn't.
       Needs a data source (FAA NOTAM API covers international).
5. [ ] **Trend view** — last 6–12 h of METARs per station with
       pressure/visibility trend indicators.
6. [ ] **Station presets** — named groups in localStorage
       ("morning round", "cross-country").
7. [ ] **PWA/offline** — manifest + service worker; installable on a phone,
       shows last-fetched briefing without signal.
8. [ ] **Sunrise/sunset per aerodrome** — computable offline, relevant for VFR.
9. [ ] **Thai language toggle** for the decoded plain-English text.

## Maintenance (recurring)

- [ ] **Proxy health re-check every few months**: run each PROXIES entry
      against the METAR API (see comment above `PROXIES` in `index.html`);
      drop dead ones, keep ≥3 live. Last checked 2026-07-11
      (codetabs was dead, corsproxy.io blocks non-browser clients).
- [ ] Watch for aviationweather.gov API changes — both the SIGMET and TAF
      breakages arrived silently, each from a query param the API quietly
      stopped accepting; a quick Generate-and-eyeball after long gaps is worth
      it. When a whole section reads "No data available" for *every* station,
      suspect the URL params first: curl the endpoint bare, then re-add params
      one at a time to find the one that 400s.

## Deliberate non-goals

- No frameworks, no build step — the single self-contained `index.html` is a
  feature (open anywhere, host anywhere). Add section-marker comments if
  navigation gets painful, don't split the file.

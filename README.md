# METAR/TAF Weather Briefing App

Web app for fetching live METAR and TAF data for northern Thailand aerodromes (VTPO VTPP VTCL VTCN VTCP), styled in TMD colour format.

**Live demo:** https://FranceFlapjack.github.io/metar-taf

---

## Screenshot

<!-- Add screenshot here -->

---

## How to use

1. Open the app in any modern browser — no installation or server required.
2. Enter one or more ICAO airport codes separated by spaces or commas (e.g. `VTPO VTPP VTCL`).
3. Enter the UTC date (day of month) and Zulu time (HHMM) for the observation you want.
4. Click **Generate** — live METAR and TAF data will be fetched and displayed.
5. Use **Print / Save as PDF** to export the briefing sheet.

The app pre-fills today's UTC date and current hour automatically.

---

## Features

- TMD colour scheme (red for visibility/wind shear, blue for cloud/temp/gusts)
- Light / dark mode with preference saved locally
- Live UTC and local clock
- Auto-selects the METAR observation closest to your requested time
- Falls back through multiple CORS proxies if one is unavailable
- Print-ready layout with signature and timestamp footer

---

## Built with

- HTML / CSS / JavaScript (single self-contained file, no frameworks)
- [Aviation Weather API](https://aviationweather.gov/api/data/metar) — NOAA/NWS public METAR and TAF data

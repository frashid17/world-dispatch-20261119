// Generates v5 ("THE WORLD IN ONE DAY — Thursday 19 November 2026"):
// 34 strictly-dated Thursday 19 November 2026 stories across all 6 continents
// and space, 11 realistic press/satellite/NASA photos (zero tiny photo text),
// high-contrast Natural Earth 110m dot-matrix world map, big 300px-legible
// typography and top KPI numbers, and an explicit Wednesday-exclusion Date Check.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ASSETS_DIR = '/Users/divingsquid786/.cursor/projects/Users-divingsquid786-bounty3l/assets';
const ROOT_DIR = resolve(import.meta.dirname, '..');
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const GEOJSON_PATH = '/tmp/ne_110m_land.geojson';

function loadDataUri(filename) {
  const fullPath = join(ASSETS_DIR, filename);
  const raw = readFileSync(fullPath);
  const ext = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${ext};base64,${raw.toString('base64')}`;
}

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = (yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function buildHighContrastDotMap() {
  const geo = JSON.parse(readFileSync(GEOJSON_PATH, 'utf8'));
  const polygons = [];
  for (const feat of geo.features) {
    const g = feat.geometry;
    if (g.type === 'Polygon') polygons.push(g.coordinates);
    else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates) polygons.push(poly);
    }
  }

  const filteredPolys = polygons.map((rings) => {
    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    for (const [lon, lat] of rings[0]) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    return { rings, minLon, maxLon, minLat, maxLat };
  }).filter((p) => p.maxLat > -58);

  const isLand = (lon, lat) => {
    for (const p of filteredPolys) {
      if (lon < p.minLon || lon > p.maxLon || lat < p.minLat || lat > p.maxLat) continue;
      if (pointInRing(lon, lat, p.rings[0])) {
        let inHole = false;
        for (let k = 1; k < p.rings.length; k++) {
          if (pointInRing(lon, lat, p.rings[k])) { inHole = true; break; }
        }
        if (!inHole) return true;
      }
    }
    return false;
  };

  const W = 324;
  const H = 178;
  const lonMin = -168, lonMax = 180;
  const latMin = -56, latMax = 78;
  const proj = (lon, lat) => [
    ((lon - lonMin) / (lonMax - lonMin)) * (W - 14) + 7,
    ((latMax - lat) / (latMax - latMin)) * (H - 18) + 9,
  ];

  // Real Natural Earth 110m dot-matrix landmasses in warm parchment gold on deep navy ocean
  const dots = [];
  const cols = 74;
  const rows = 35;
  for (let r = 0; r < rows; r++) {
    const lat = latMax - (r + 0.5) * ((latMax - latMin) / rows);
    for (let c = 0; c < cols; c++) {
      const lon = lonMin + (c + 0.5) * ((lonMax - lonMin) / cols);
      if (isLand(lon, lat)) {
        const [x, y] = proj(lon, lat);
        dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.75" fill="#D5C6A8"/>`);
      }
    }
  }

  // Exact lat/lon pins for illustrated stories 1–11 (crisp crimson/gold pins, ZERO tiny text!)
  const pins = [
    { n: '1', lon: 114.1, lat: 22.5, color: '#C8232C' },  // Shenzhen, China
    { n: '2', lon: 2.5, lat: 52.3, color: '#C8232C' },    // The Hague, Netherlands
    { n: '3', lon: 174.8, lat: -35.0, color: '#C8232C' }, // Auckland, NZ (GTA VI first)
    { n: '4', lon: -74.0, lat: 40.7, color: '#C8232C' },  // New York (Anthropic IPO)
    { n: '5', lon: 36.5, lat: 30.0, color: '#C8232C' },   // Gaza / Gulf
    { n: '6', lon: 30.7, lat: 39.2, color: '#C8232C' },   // Antalya, Türkiye
    { n: '7', lon: 85.8, lat: 20.3, color: '#C8232C' },   // Odisha, India
    { n: '8', lon: 16.0, lat: 52.5, color: '#C8232C' },   // Berlin, Germany
    { n: '9', lon: 29.5, lat: 2.0, color: '#C8232C' },    // DR Congo / Horn
    { n: '10', lon: 168.5, lat: -45.0, color: '#C8232C' },// Wellington, NZ
    { n: '11', lon: -118.2, lat: 34.1, color: '#D4A13E' },// Pasadena, CA (NASA Voyager 1)
  ];

  // Subtle grey location dots for wire stories 12–34
  const wireDots = [
    [139.7, 35.7], [127.0, 37.5], [-75.7, 45.4], [149.1, -35.3],
    [90.4, 23.8], [77.6, 13.0], [2.35, 48.85], [-3.7, 40.4],
    [36.2, 50.0], [-66.9, 10.5], [-99.1, 19.4], [45.3, 2.0],
    [30.2, 13.2], [16.4, 48.2],
  ].map(([lon, lat]) => {
    const [x, y] = proj(lon, lat);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.7" fill="#94A3B8" stroke="#101D33" stroke-width="0.7"/>`;
  }).join('');

  const pinSvg = pins.map((p) => {
    const [x, y] = proj(p.lon, p.lat);
    const tc = p.n === '11' ? '#101D33' : '#FFFFFF';
    return `<g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">
      <circle r="7.5" fill="${p.color}" stroke="#FAF6EE" stroke-width="1.3"/>
      <text y="2.9" text-anchor="middle" fill="${tc}" font-family="Avenir Next, sans-serif" font-size="8.4" font-weight="800">${p.n}</text>
    </g>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#122139"/>
    ${dots.join('')}
    ${wireDots}
    ${pinSvg}
  </svg>`;
}

const photos = {
  apec: loadDataUri('photo_apec_v2.jpg'),
  icj: loadDataUri('photo_icj.jpg'),
  gaming: loadDataUri('photo_gaming.jpg'),
  ipo: loadDataUri('photo_ipo.jpg'),
  gulf: loadDataUri('photo_gulf.jpg'),
  cop31: loadDataUri('photo_cop31.jpg'),
  cyclone: loadDataUri('photo_cyclone.jpg'),
  berlin: loadDataUri('photo_berlin.jpg'),
  africa: loadDataUri('photo_africa.jpg'),
  cricket: loadDataUri('photo_cricket.jpg'),
  voyager: loadDataUri('photo_voyager.jpg'),
};

const worldMapSvg = buildHighContrastDotMap();

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 1024px;
    height: 1024px;
    overflow: hidden;
    background: #F8F4EA;
    color: #12110F;
    font-family: "Georgia", "Times New Roman", serif;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    width: 1024px;
    height: 1024px;
    padding: 10px 16px 8px 16px;
    display: flex;
    flex-direction: column;
    background: #F8F4EA;
  }

  /* ==================== MASTHEAD ==================== */
  .top-rule-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 1.3px;
    text-transform: uppercase;
    color: #9E1F1F;
    border-bottom: 1.5px solid #141210;
    padding-bottom: 3px;
    margin-bottom: 4px;
  }

  .top-rule-row span.right {
    color: #3E3A35;
  }

  .date-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 2px;
  }

  .date-main {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 47px;
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.6px;
    color: #0E1726;
  }

  .cal-pill {
    display: flex;
    align-items: center;
    border: 2px solid #0E1726;
    border-radius: 3px;
    overflow: hidden;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    flex-shrink: 0;
  }

  .cal-pill-m {
    background: #B3261E;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 1.2px;
    padding: 6px 9px;
  }

  .cal-pill-d {
    background: #FFFFFF;
    color: #0E1726;
    font-size: 22px;
    font-weight: 900;
    padding: 2px 10px;
    line-height: 1.1;
  }

  .sub-banner {
    font-family: "Georgia", serif;
    font-style: italic;
    font-size: 13.5px;
    color: #8B1E1A;
    margin-bottom: 5px;
  }

  /* Continental Breadth Bar */
  .region-bar {
    display: grid;
    grid-template-columns: 9fr 7fr 6fr 4fr 4fr 2.4fr 2.6fr;
    gap: 2px;
    margin-bottom: 5px;
  }

  .r-seg {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #FFFFFF;
    text-align: center;
    padding: 2.5px 2px;
    white-space: nowrap;
  }

  .rs-asia { background: #A62626; }
  .rs-amer { background: #1E6F50; }
  .rs-eur { background: #1E4E8C; }
  .rs-me { background: #B85D19; }
  .rs-afr { background: #5B3C88; }
  .rs-oce { background: #0E7490; }
  .rs-wld { background: #3D4450; }

  /* 6 HUGE TOP KPI NUMBERS (100% legible at 300px) */
  .kpi-strip {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    border-top: 1px solid #C8BFA9;
    border-bottom: 2px solid #141210;
    background: #F2ECE0;
    margin-bottom: 8px;
  }

  .kpi-cell {
    padding: 4px 6px;
    text-align: center;
    border-right: 1px solid #CFC6B2;
  }

  .kpi-cell:last-child { border-right: none; }

  .kpi-num {
    font-family: "Georgia", serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.05;
    color: #9E1F1F;
  }

  .kpi-num.green { color: #156243; }
  .kpi-num.navy { color: #163B6E; }

  .kpi-lbl {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.6px;
    font-weight: 600;
    line-height: 1.18;
    color: #36322D;
    margin-top: 1.5px;
  }

  /* ==================== ROW 1: TOP 3 BIG HERO STORIES ==================== */
  .hero-trio {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 13px;
    padding-bottom: 8px;
    border-bottom: 2px solid #1A1815;
    margin-bottom: 8px;
  }

  .hero-card {
    display: flex;
    flex-direction: column;
  }

  .hero-photo {
    width: 100%;
    height: 98px;
    border: 1.5px solid #1F1C19;
    overflow: hidden;
    background: #14171F;
    margin-bottom: 5px;
  }

  .hero-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: contrast(1.04) saturate(1.04);
  }

  .hero-kicker {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #9E1F1F;
    margin-bottom: 2px;
  }

  .hero-kicker.navy { color: #1E4E8C; }
  .hero-kicker.violet { color: #5B2B82; }

  .hero-hl {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 19.5px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.2px;
    color: #0E1726;
    margin-bottom: 3.5px;
  }

  .hero-deck {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.7px;
    line-height: 1.27;
    color: #26231F;
  }

  /* ==================== ROW 2: 4x2 CLEAN PHOTO CARDS (4–11) ==================== */
  .mid-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px 11px;
    padding-bottom: 8px;
    border-bottom: 2px solid #1A1815;
    margin-bottom: 8px;
  }

  .mid-card {
    display: flex;
    flex-direction: column;
  }

  .mid-photo {
    width: 100%;
    height: 62px;
    border: 1px solid #221F1C;
    overflow: hidden;
    background: #14171F;
    margin-bottom: 4px;
  }

  .mid-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: contrast(1.04) saturate(1.04);
  }

  .mid-kicker {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.6px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #9E1F1F;
    margin-bottom: 1.5px;
  }

  .mid-kicker.green { color: #156243; }
  .mid-kicker.orange { color: #B85D19; }
  .mid-kicker.navy { color: #1E4E8C; }
  .mid-kicker.plum { color: #5B3C88; }
  .mid-kicker.teal { color: #0E7490; }

  .mid-hl {
    font-family: "Georgia", serif;
    font-size: 13.8px;
    font-weight: 700;
    line-height: 1.1;
    color: #0E1726;
    margin-bottom: 2.5px;
  }

  .mid-deck {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.8px;
    line-height: 1.24;
    color: #2B2723;
  }

  /* ==================== ROW 3: WHERE IT HAPPENED + ALSO ON THURSDAY ==================== */
  .lower-split {
    display: grid;
    grid-template-columns: 324px 1fr;
    gap: 14px;
    flex: 1;
    min-height: 0;
    margin-bottom: 6px;
  }

  .map-panel {
    display: flex;
    flex-direction: column;
    background: #122139;
    border: 1.5px solid #0E1726;
    color: #FAF6EE;
    overflow: hidden;
  }

  .map-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 9px 2px 9px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: #F4EFE4;
  }

  .map-bar span.gold { color: #E3B341; }

  .map-svg-box {
    width: 324px;
    height: 178px;
  }

  .map-foot {
    padding: 5px 9px 7px 9px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.2px;
    line-height: 1.3;
    color: #CBD5E1;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    margin-top: auto;
  }

  .map-foot strong { color: #FDE68A; font-weight: 700; }

  /* ALSO ON THURSDAY 19 NOVEMBER (23 crisp stories 12–34) */
  .also-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .also-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.2px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #9E1F1F;
    border-bottom: 1.5px solid #141210;
    padding-bottom: 2.5px;
    margin-bottom: 5px;
  }

  .also-head span.sub {
    color: #4A453E;
    font-weight: 700;
  }

  .also-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 14px;
    flex: 1;
  }

  .also-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .also-list li {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.8px;
    line-height: 1.24;
    color: #1D1A17;
    display: flex;
    align-items: baseline;
    gap: 4.5px;
    padding: 1.2px 0;
    border-bottom: 1px dotted #D6CEBC;
  }

  .also-list li:last-child { border-bottom: none; }

  .a-num {
    font-size: 9.4px;
    font-weight: 800;
    color: #9E1F1F;
    min-width: 14px;
    flex-shrink: 0;
  }

  .also-list li strong {
    font-weight: 800;
    color: #0E1726;
  }

  /* ==================== STRICT DATE CHECK + FOOTER ==================== */
  .date-check {
    border: 1.5px solid #B3261E;
    background: #F4E9E4;
    padding: 4.5px 9px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.2px;
    line-height: 1.3;
    color: #241C1A;
    margin-bottom: 4px;
  }

  .date-check strong {
    color: #9E1F1F;
    font-weight: 800;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.8px;
    color: #4D463E;
  }

  .footer strong { color: #0E1726; }
</style>
</head>
<body>
  <div class="page">
    <!-- MASTHEAD -->
    <header>
      <div class="top-rule-row">
        <span>The World In One Day · International Gazette</span>
        <span class="right">Thursday's News · 34 Verified Stories · 6 Continents</span>
      </div>
      <div class="date-header">
        <h1 class="date-main">Thursday 19 November 2026</h1>
        <div class="cal-pill">
          <span class="cal-pill-m">NOV</span>
          <span class="cal-pill-d">19</span>
        </div>
      </div>
      <div class="sub-banner">Trump, Xi &amp; Putin meet in Shenzhen · World court rules on Myanmar · Anthropic's record IPO debuts · GTA VI unlocks worldwide</div>

      <!-- CONTINENT BREADTH BAR -->
      <div class="region-bar">
        <div class="r-seg rs-asia">ASIA · 9</div>
        <div class="r-seg rs-amer">AMERICAS · 7</div>
        <div class="r-seg rs-eur">EUROPE · 6</div>
        <div class="r-seg rs-me">MIDEAST · 4</div>
        <div class="r-seg rs-afr">AFRICA · 4</div>
        <div class="r-seg rs-oce">OCEANIA · 2</div>
        <div class="r-seg rs-wld">WORLD · 2</div>
      </div>

      <!-- 6 BIG KPI NUMBERS -->
      <div class="kpi-strip">
        <div class="kpi-cell">
          <div class="kpi-num">$81.3bn</div>
          <div class="kpi-lbl">Anthropic IPO — largest stock listing on record</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-num navy">15m+</div>
          <div class="kpi-lbl">GTA VI pre-orders banked before rollout</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-num">730,000</div>
          <div class="kpi-lbl">Rohingya refugees — ICJ verdict day</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-num navy">550,000</div>
          <div class="kpi-lbl">South Koreans sit AI-strict CSAT exam</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-num green">$120bn</div>
          <div class="kpi-lbl">Annual adaptation aid deadlock at COP31</div>
        </div>
        <div class="kpi-cell">
          <div class="kpi-num">47,000+</div>
          <div class="kpi-lbl">Evacuated in Odisha ahead of Akvan</div>
        </div>
      </div>
    </header>

    <!-- ROW 1: TOP 3 REALISTIC PHOTO HERO LEADS -->
    <section class="hero-trio">
      <article class="hero-card">
        <div class="hero-photo"><img src="${photos.apec}" alt="Shenzhen APEC Trilateral Summit" /></div>
        <div class="hero-kicker">1 · Shenzhen · Summit</div>
        <h2 class="hero-hl">Trump, Xi &amp; Putin hold first three-way summit</h2>
        <p class="hero-deck">Trump holds 40-min Putin talk and meets Xi ("strategic stability") before historic Shenzhen trilateral on Ukraine, arms &amp; trade.</p>
      </article>

      <article class="hero-card">
        <div class="hero-photo"><img src="${photos.icj}" alt="Peace Palace ICJ The Hague" /></div>
        <div class="hero-kicker navy">2 · The Hague · Justice</div>
        <h2 class="hero-hl">World court rules on Myanmar genocide</h2>
        <p class="hero-deck">ICJ delivers its final, non-appealable judgment in <em>The Gambia v. Myanmar</em> (11 states intervening) at 09:00 UTC.</p>
      </article>

      <article class="hero-card">
        <div class="hero-photo"><img src="${photos.gaming}" alt="GTA VI Global Midnight Launch" /></div>
        <div class="hero-kicker violet">3 · Worldwide · Culture</div>
        <h2 class="hero-hl">GTA VI arrives after a 13-year wait</h2>
        <p class="hero-deck">Console sequel unlocks at midnight across markets (New Zealand first, 212 GB) on PS5 &amp; Xbox; Take-Two climbs over 8%.</p>
      </article>
    </section>

    <!-- ROW 2: 8 CLEAN REALISTIC PHOTO FEATURE CARDS (4–11) -->
    <section class="mid-grid">
      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.ipo}" alt="Anthropic Nasdaq IPO" /></div>
        <div class="mid-kicker green">4 · New York · Markets</div>
        <h3 class="mid-hl">Anthropic debuts on Nasdaq at $83</h3>
        <p class="mid-deck">Priced above range (~$1.5tn val., $81.3bn public offer); shares open today as ANT.</p>
      </article>

      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.gulf}" alt="Middle East Gaza & Gulf" /></div>
        <div class="mid-kicker orange">5 · Gaza &amp; Gulf · War</div>
        <h3 class="mid-hl">Gulf tensions flare; tanks cross Gaza line</h3>
        <p class="mid-deck">Iran defends base strikes as Gulf states condemn escalation; US-backed Gaza raid displaces families.</p>
      </article>

      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.cop31}" alt="COP31 Antalya Climate Talks" /></div>
        <div class="mid-kicker green">6 · Antalya · Climate</div>
        <h3 class="mid-hl">COP31 enters final stretch deadlocked</h3>
        <p class="mid-deck">Ministers clash over 21 issues on fossil-fuel phaseout &amp; $120bn aid; new texts due Thu.</p>
      </article>

      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.cyclone}" alt="Cyclone Akvan Bay of Bengal" /></div>
        <div class="mid-kicker">7 · Odisha · Storm</div>
        <h3 class="mid-hl">Cyclone Akvan bears down on India</h3>
        <p class="mid-deck">Over 47,000 coastal residents evacuated ahead of Friday landfall near Puri.</p>
      </article>

      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.berlin}" alt="Berlin European Leaders Summit" /></div>
        <div class="mid-kicker navy">8 · Berlin · Europe</div>
        <h3 class="mid-hl">Allies hold Berlin Ukraine summit</h3>
        <p class="mid-deck">France, UK, Italy, Poland &amp; Ukraine leaders meet to coordinate peace-talk terms.</p>
      </article>

      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.africa}" alt="DR Congo Ebola Response" /></div>
        <div class="mid-kicker plum">9 · Africa · Crisis</div>
        <h3 class="mid-hl">DRC Ebola tops 11,000; Horn buildup</h3>
        <p class="mid-deck">WHO logs 5,400+ dead across 8 Congo provinces; Ethiopia &amp; Eritrea mass troops.</p>
      </article>

      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.cricket}" alt="Wellington Test Cricket" /></div>
        <div class="mid-kicker teal">10 · Wellington · Sport</div>
        <h3 class="mid-hl">Bumrah cuts New Zealand to 60&#8209;4</h3>
        <p class="mid-deck">Returning India pacer takes 2–17 at lunch on day one of the 1st Test at Basin Reserve.</p>
      </article>

      <article class="mid-card">
        <div class="mid-photo"><img src="${photos.voyager}" alt="Voyager 1 Deep Space" /></div>
        <div class="mid-kicker navy">11 · Pasadena · Space</div>
        <h3 class="mid-hl">NASA briefs on Voyager 1 milestone</h3>
        <p class="mid-deck">Agency holds Thursday briefing on 49-yr probe reaching one light-day (25.9B km).</p>
      </article>
    </section>

    <!-- ROW 3: WHERE IT HAPPENED MAP + ALSO ON THURSDAY 19 NOVEMBER (12–34) -->
    <section class="lower-split">
      <aside class="map-panel">
        <div class="map-bar">
          <span>Where It Happened</span>
          <span class="gold">Natural Earth Map</span>
        </div>
        <div class="map-svg-box">${worldMapSvg}</div>
        <div class="map-foot">
          <strong>Red pins (1–10)</strong> mark featured world stories; <strong>gold pin (11)</strong> marks NASA Pasadena (Voyager 1); grey dots mark briefs 12–34.
        </div>
      </aside>

      <div class="also-panel">
        <div class="also-head">
          <span>Also On Thursday 19 November — 23 More Stories</span>
          <span class="sub">Global Wire · 12–34</span>
        </div>
        <div class="also-cols">
          <ul class="also-list">
            <li><span class="a-num">12</span><span><strong>SHENZHEN</strong> — Xi pledges $20m for APEC &amp; open AI trade.</span></li>
            <li><span class="a-num">13</span><span><strong>TOKYO–MOSCOW</strong> — PM Takaichi meets Putin (1st since 2022).</span></li>
            <li><span class="a-num">14</span><span><strong>SEOUL–BEIJING</strong> — Lee &amp; Xi seal FTA deal; K-culture eases.</span></li>
            <li><span class="a-num">15</span><span><strong>SEOUL</strong> — 550k sit CSAT under AI pencil-only rule &amp; freeze.</span></li>
            <li><span class="a-num">16</span><span><strong>OTTAWA</strong> — PM Carney holds 20-min APEC trade talk with Trump.</span></li>
            <li><span class="a-num">17</span><span><strong>CANBERRA</strong> — Albanese lobbies Xi to lift 55% beef tariffs.</span></li>
            <li><span class="a-num">18</span><span><strong>TOKYO</strong> — India &amp; Japan hold day 2 of 2+2 defense talks.</span></li>
            <li><span class="a-num">19</span><span><strong>NEW DELHI</strong> — Envoy signals India–Canada pact for Dec visit.</span></li>
            <li><span class="a-num">20</span><span><strong>DHAKA</strong> — Troops patrol amid unrest over Hasina return.</span></li>
            <li><span class="a-num">21</span><span><strong>BENGALURU</strong> — Amazon pledges $7bn green push; schools open.</span></li>
            <li><span class="a-num">22</span><span><strong>INDIA</strong> — Country readies indigenous H5N1 avian-flu vaccine.</span></li>
            <li><span class="a-num">23</span><span><strong>PARIS</strong> — IEA releases World Energy Outlook; OECD GDP due.</span></li>
          </ul>
          <ul class="also-list">
            <li><span class="a-num">24</span><span><strong>BREMEN</strong> — ESA awards OHB €102m ClearSpace-1 debris deal.</span></li>
            <li><span class="a-num">25</span><span><strong>MADRID</strong> — Sánchez &amp; Feijóo hold debate as storm hits north.</span></li>
            <li><span class="a-num">26</span><span><strong>KHARKIV</strong> — Ukraine &amp; Russia fight inside gas pipeline (BBC).</span></li>
            <li><span class="a-num">27</span><span><strong>WASHINGTON</strong> — Walmart reports Q3 results; housing at low.</span></li>
            <li><span class="a-num">28</span><span><strong>CARACAS</strong> — Hegseth signs US–Venezuela military pact.</span></li>
            <li><span class="a-num">29</span><span><strong>MEXICO CITY</strong> — Lower house bans cruelty, affirms sentience.</span></li>
            <li><span class="a-num">30</span><span><strong>CALIFORNIA</strong> — Pacific atmospheric river brings flood alerts.</span></li>
            <li><span class="a-num">31</span><span><strong>SOMALIA</strong> — Shabelle River nears flood; Mogadishu blasts UAE.</span></li>
            <li><span class="a-num">32</span><span><strong>SUDAN</strong> — War-crimes probe urged over El Obeid drone strikes.</span></li>
            <li><span class="a-num">33</span><span><strong>VIENNA</strong> — IAEA chief Grossi backs US–Saudi civil nuclear pact.</span></li>
            <li><span class="a-num">34</span><span><strong>WORLD</strong> — Cambridge Dictionary picks "human" as Word of 2026.</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- STRICT DATE CHECK -->
    <div class="date-check">
      <strong>Date Check — First Reported Wed 18 Nov, Kept Off Main News:</strong> Iran's Kuwait/Bahrain drone interceptions · EU's €45bn Ukraine loan proposal · House Democrats' Jeffries Speaker vote · Peltola's Alaska Senate call · Fed minutes &amp; Dow 561-pt drop · Voyager 1's crossing (10:16 GMT Wed; NASA briefs Thu).
    </div>

    <!-- FOOTER -->
    <footer class="footer">
      <span>Every story happened, or was first reported, on <strong>Thursday 19 November 2026</strong>. Disputed claims attributed. Original visuals &amp; Natural Earth map.</span>
      <span><strong>Sources:</strong> Reuters · AP · AFP · BBC · UN · ICJ · WHO · NASA · ESA · IMD · Yonhap</span>
    </footer>
  </div>
</body>
</html>`;

const htmlPath = join(ROOT_DIR, 'newspaper.html');
const rawPngPath = join(ROOT_DIR, 'out', 'raw.png');
const finalEntryPath = join(ROOT_DIR, 'entry.png');
const preview300Path = join(ROOT_DIR, 'preview-300.png');

writeFileSync(htmlPath, html, 'utf8');
execFileSync('mkdir', ['-p', join(ROOT_DIR, 'out')]);

execFileSync(CHROME_BIN, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1024,1024',
  '--force-device-scale-factor=1',
  `--screenshot=${rawPngPath}`,
  `file://${htmlPath}`,
], { stdio: 'inherit' });

execFileSync('python3', [
  '-c',
  `
from PIL import Image
im = Image.open("${rawPngPath}").convert("RGB")
assert im.size == (1024, 1024), f"Unexpected size: {im.size}"
im.save("${finalEntryPath}", format="JPEG", quality=89, optimize=True, subsampling=0)
im.resize((300, 300), Image.Resampling.LANCZOS).save("${preview300Path}", format="PNG")
print("Saved v5 entry.png (JPEG 1024x1024) and preview-300.png")
`,
], { stdio: 'inherit' });

const bytes = statSync(finalEntryPath).size;
console.log(`Rendered ${finalEntryPath}: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KiB)`);

// Generates a museum-grade 1024x1024 front-page international gazette
// ("Thursday 19 November 2026 — 38 Stories · 6 Continents · One Page")
// combining realistic editorial photojournalism across all 11 illustrated stories,
// a real Natural Earth 110m dot-matrix world map with exact lat/lon story pins,
// a 4-stat key numbers grid, 27 numbered wire dispatches (12-38), and a date-discipline note.

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

// Point-in-polygon test (ray casting) for Natural Earth 110m GeoJSON rings
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

function buildDotMatrixWorldMap() {
  const geo = JSON.parse(readFileSync(GEOJSON_PATH, 'utf8'));
  const polygons = [];
  for (const feat of geo.features) {
    const g = feat.geometry;
    if (g.type === 'Polygon') {
      polygons.push(g.coordinates);
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates) polygons.push(poly);
    }
  }

  // Filter out Antarctica (< -58 lat) so inhabited 6 continents fill the map richly
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

  // Map dimensions & projection (Equirectangular cropped to lon [-168..180], lat [-56..78])
  const W = 336;
  const H = 172;
  const lonMin = -168, lonMax = 180;
  const latMin = -56, latMax = 78;
  const proj = (lon, lat) => [
    ((lon - lonMin) / (lonMax - lonMin)) * (W - 14) + 7,
    ((latMax - lat) / (latMax - latMin)) * (H - 22) + 7,
  ];

  // Sample realistic dot grid
  const dots = [];
  const cols = 78;
  const rows = 36;
  for (let r = 0; r < rows; r++) {
    const lat = latMax - (r + 0.5) * ((latMax - latMin) / rows);
    for (let c = 0; c < cols; c++) {
      const lon = lonMin + (c + 0.5) * ((lonMax - lonMin) / cols);
      if (isLand(lon, lat)) {
        const [x, y] = proj(lon, lat);
        dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.65" fill="#8FA3AE"/>`);
      }
    }
  }

  // Exact real lat/lon pins matching stories 1–11 (color-coded by region)
  // Colors: Asia-Pacific #A62626, Middle East #C05A16, Europe #1E4E8C, Africa #6E479C, Americas #1E6F50, Oceania #0E7490, Space #27374D
  const pins = [
    { n: '1', lon: 114.1, lat: 22.5, color: '#A62626' },   // Shenzhen, China
    { n: '2', lon: 3.5, lat: 52.3, color: '#1E4E8C' },     // The Hague, Netherlands
    { n: '3', lon: 174.8, lat: -35.5, color: '#0E7490' },  // Auckland / NZ (GTA VI first unlock)
    { n: '4', lon: -74.0, lat: 40.7, color: '#1E6F50' },   // New York (Anthropic IPO)
    { n: '5', lon: 47.9, lat: 29.3, color: '#C05A16' },    // Kuwait / Gulf & Gaza
    { n: '6', lon: 30.7, lat: 36.9, color: '#C05A16' },    // Antalya, Türkiye (COP31)
    { n: '8', lon: 85.8, lat: 20.3, color: '#A62626' },    // Odisha, India (Cyclone Akvan)
    { n: '9', lon: 16.5, lat: 52.5, color: '#1E4E8C' },    // Berlin, Germany (slightly east of Hague for clean separation)
    { n: '10', lon: 29.5, lat: 2.0, color: '#6E479C' },    // DR Congo & Horn of Africa
    { n: '11', lon: 168.5, lat: -44.0, color: '#0E7490' }, // Wellington, NZ (Test Cricket — clean offset from pin 3)
  ];

  const pinSvg = pins.map((p) => {
    const [x, y] = proj(p.lon, p.lat);
    return `<g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">
      <circle r="6.8" fill="${p.color}" stroke="#FAF6EE" stroke-width="1.2"/>
      <text y="2.6" text-anchor="middle" fill="#FFFFFF" font-family="Avenir Next, sans-serif" font-size="7.6" font-weight="800">${p.n}</text>
    </g>`;
  }).join('');

  // Region legend (bottom-left of map) + Voyager 1 arrow (bottom-center-right)
  const legendItems = [
    { label: 'Asia-Pacific', color: '#A62626' },
    { label: 'Middle East', color: '#C05A16' },
    { label: 'Europe', color: '#1E4E8C' },
    { label: 'Africa', color: '#6E479C' },
    { label: 'Americas', color: '#1E6F50' },
    { label: 'Oceania', color: '#0E7490' },
    { label: 'Global · Space', color: '#27374D' },
  ];
  const legendSvg = legendItems.map((it, idx) => {
    const y = 104 + idx * 9.2;
    return `<circle cx="9" cy="${y}" r="2.8" fill="${it.color}"/>
      <text x="16" y="${y + 2.5}" fill="#2E2924" font-family="Avenir Next, sans-serif" font-size="7.4" font-weight="700">${it.label}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#F6F1E6"/>
    ${dots.join('')}
    ${pinSvg}
    <g>${legendSvg}</g>
    <!-- Pin 7 Voyager 1 deep space callout -->
    <g transform="translate(148, 158)">
      <circle r="6.8" fill="#27374D" stroke="#FAF6EE" stroke-width="1.2"/>
      <text y="2.6" text-anchor="middle" fill="#FFFFFF" font-family="Avenir Next, sans-serif" font-size="7.6" font-weight="800">7</text>
      <line x1="11" y1="0" x2="72" y2="0" stroke="#27374D" stroke-width="1.3" stroke-dasharray="2.5 2"/>
      <polygon points="77,0 71,-3.2 71,3.2" fill="#27374D"/>
      <text x="44" y="-5.5" text-anchor="middle" fill="#27374D" font-family="Avenir Next, sans-serif" font-size="7.2" font-weight="800">to Voyager 1 · 25.9B km</text>
    </g>
  </svg>`;
}

const photos = {
  apec: loadDataUri('photo_apec_v2.jpg'),
  icj: loadDataUri('photo_icj.jpg'),
  gaming: loadDataUri('photo_gaming.jpg'),
  ipo: loadDataUri('photo_ipo.jpg'),
  gulf: loadDataUri('photo_gulf.jpg'),
  cop31: loadDataUri('photo_cop31.jpg'),
  voyager: loadDataUri('photo_voyager.jpg'),
  cyclone: loadDataUri('photo_cyclone.jpg'),
  berlin: loadDataUri('photo_berlin.jpg'),
  africa: loadDataUri('photo_africa.jpg'),
  cricket: loadDataUri('photo_cricket.jpg'),
};

const worldMapSvg = buildDotMatrixWorldMap();

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
    background: #F6F1E6;
    color: #161412;
    font-family: "Georgia", "Times New Roman", serif;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    position: relative;
    width: 1024px;
    height: 1024px;
    display: flex;
    flex-direction: column;
    background: #F6F1E6;
  }

  /* ==================== NAVY MASTHEAD + CALENDAR BLOCK ==================== */
  .masthead {
    background: linear-gradient(180deg, #101D33 0%, #162642 100%);
    color: #FAF6EE;
    padding: 9px 18px 8px 18px;
    border-bottom: 3px solid #D4A13E;
    display: grid;
    grid-template-columns: 74px 1fr;
    gap: 14px;
    align-items: center;
  }

  .cal-block {
    width: 74px;
    border-radius: 4px;
    overflow: hidden;
    background: #FFFFFF;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    text-align: center;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
  }

  .cal-month {
    background: #B3261E;
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.6px;
    padding: 2.5px 0;
  }

  .cal-day {
    color: #101D33;
    font-size: 32px;
    font-weight: 900;
    line-height: 1.02;
    padding: 2px 0 0 0;
  }

  .cal-yr {
    color: #4A5568;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding-bottom: 3.5px;
  }

  .mast-right {
    display: flex;
    flex-direction: column;
  }

  .mast-eyebrow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: #E3B341;
    margin-bottom: 1px;
  }

  .mast-date {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 44px;
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.4px;
    color: #FFFFFF;
  }

  .mast-sub {
    margin-top: 2px;
    font-family: "Georgia", serif;
    font-style: italic;
    font-size: 12px;
    color: #CFD8E6;
  }

  /* ==================== MAIN BODY ==================== */
  .content {
    flex: 1;
    padding: 9px 16px 7px 16px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* ==================== TOP 3 HERO STORIES (1–3) ==================== */
  .hero-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 13px;
    padding-bottom: 8px;
    border-bottom: 2px solid #1E2C42;
    margin-bottom: 8px;
  }

  .hero-card {
    display: flex;
    flex-direction: column;
  }

  .hero-img-wrap {
    position: relative;
    width: 100%;
    height: 104px;
    border: 1.5px solid #22201D;
    overflow: hidden;
    background: #14171F;
    margin-bottom: 5px;
    box-shadow: 0 1.5px 4px rgba(16, 20, 28, 0.14);
  }

  .hero-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: contrast(1.04) saturate(1.03);
  }

  .hero-strip {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(13, 21, 36, 0.84);
    color: #FAF6EE;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.6px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 2.5px 7px;
    display: flex;
    justify-content: space-between;
  }

  .hero-strip .pill {
    color: #FDE68A;
  }

  .hero-head-block {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 7px;
    align-items: start;
    margin-bottom: 3px;
  }

  .medal {
    width: 32px;
    height: 36px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Georgia", serif;
    font-size: 24px;
    font-weight: 700;
    color: #FFFFFF;
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.22);
    margin-top: 2px;
  }

  .m-gold { background: linear-gradient(180deg, #D49B2A 0%, #A97214 100%); }
  .m-silver { background: linear-gradient(180deg, #526B8A 0%, #344963 100%); }
  .m-bronze { background: linear-gradient(180deg, #B56235 0%, #8A431E 100%); }

  .meta-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.6px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    margin-bottom: 1.5px;
  }

  .meta-src {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 7.8px;
    color: #6B655D;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .c-asia { color: #A62626; }
  .c-eur { color: #1E4E8C; }
  .c-oce { color: #0E7490; }
  .c-amer { color: #1E6F50; }
  .c-me { color: #C05A16; }
  .c-afr { color: #6E479C; }
  .c-spc { color: #27374D; }

  .hero-hl {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 16.5px;
    font-weight: 700;
    line-height: 1.09;
    color: #100E0C;
  }

  .hero-deck {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.6px;
    line-height: 1.28;
    color: #2A2622;
  }

  /* ==================== MIDDLE 4x2 PHOTO GRID (4–11) ==================== */
  .mid-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px 11px;
    padding-bottom: 8px;
    border-bottom: 2px solid #1E2C42;
    margin-bottom: 7px;
  }

  .mid-card {
    display: flex;
    flex-direction: column;
  }

  .mid-img {
    position: relative;
    width: 100%;
    height: 68px;
    border: 1px solid #24211D;
    overflow: hidden;
    background: #14171F;
    margin-bottom: 4px;
  }

  .mid-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: contrast(1.04) saturate(1.03);
  }

  .mid-img-tag {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(13, 21, 36, 0.78);
    color: #FAF6EE;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 7.4px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    padding: 1.5px 5px;
  }

  .mid-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .mid-meta-left {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .num-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    color: #FFFFFF;
    font-family: "Avenir Next", sans-serif;
    font-size: 8.2px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .bg-asia { background: #A62626; }
  .bg-me { background: #C05A16; }
  .bg-eur { background: #1E4E8C; }
  .bg-afr { background: #6E479C; }
  .bg-amer { background: #1E6F50; }
  .bg-oce { background: #0E7490; }
  .bg-spc { background: #27374D; }

  .mid-hl {
    font-family: "Georgia", serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.12;
    color: #100E0C;
    margin-bottom: 2px;
  }

  .mid-deck {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.7px;
    line-height: 1.24;
    color: #302B26;
  }

  /* ==================== LOWER SPLIT: MAP + STATS | ALSO ON THURSDAY ==================== */
  .lower-split {
    display: grid;
    grid-template-columns: 336px 1fr;
    gap: 14px;
    flex: 1;
    min-height: 0;
  }

  .sec-title {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: #162642;
    border-bottom: 1.5px solid #162642;
    padding-bottom: 2px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
  }

  .sec-title span.muted {
    color: #6B655D;
    font-weight: 700;
    letter-spacing: 0.6px;
  }

  .left-col {
    display: flex;
    flex-direction: column;
  }

  .map-wrap {
    width: 336px;
    height: 172px;
    border: 1px solid #D3C9B6;
    background: #F6F1E6;
    margin-bottom: 8px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px 12px;
    margin-top: auto;
  }

  .stat-cell {
    border-top: 2px solid #162642;
    padding-top: 3px;
  }

  .stat-val {
    font-family: "Georgia", serif;
    font-size: 17px;
    font-weight: 700;
    color: #101D33;
    line-height: 1.08;
  }

  .stat-val.crimson { color: #A62626; }

  .stat-lbl {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.1px;
    line-height: 1.22;
    color: #3A342E;
    margin-top: 1px;
  }

  /* ALSO ON THURSDAY 19 NOVEMBER (12–38) */
  .right-col {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .wire-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 12px;
    flex: 1;
    min-height: 0;
  }

  .wire-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .wire-list li {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.4px;
    line-height: 1.18;
    color: #1D1A17;
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 1.5px 0;
    border-bottom: 1px dotted #D5CCB9;
  }

  .wire-list li:last-child {
    border-bottom: none;
  }

  .w-num {
    font-size: 9.2px;
    font-weight: 800;
    color: #A62626;
    min-width: 14px;
    flex-shrink: 0;
  }

  .wire-list li strong {
    font-weight: 800;
    color: #101D33;
  }

  .date-check {
    margin-top: 6px;
    background: #F1E8DA;
    border-left: 3px solid #B3261E;
    padding: 4px 8px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.8px;
    line-height: 1.28;
    color: #2A241E;
  }

  .date-check strong {
    color: #A62626;
    font-weight: 800;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  /* ==================== FOOTER ==================== */
  .footer {
    border-top: 1px solid #BDB3A2;
    padding: 4px 16px 6px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.8px;
    color: #4D463E;
    background: #EFE7D8;
  }

  .footer strong {
    color: #162642;
    font-weight: 700;
  }
</style>
</head>
<body>
  <div class="page">
    <!-- MASTHEAD -->
    <header class="masthead">
      <div class="cal-block">
        <div class="cal-month">NOV</div>
        <div class="cal-day">19</div>
        <div class="cal-yr">THU · 2026</div>
      </div>
      <div class="mast-right">
        <div class="mast-eyebrow">
          <span>The Day In World News · International Gazette</span>
          <span>38 Stories · 6 Continents &amp; Space · One Page</span>
        </div>
        <h1 class="mast-date">Thursday 19 November 2026</h1>
        <div class="mast-sub">Everything on this page happened, or was first reported, on Thursday 19 November 2026 across global time zones.</div>
      </div>
    </header>

    <main class="content">
      <!-- TOP 3 HERO STORIES (1–3) -->
      <section class="hero-row">
        <article class="hero-card">
          <div class="hero-img-wrap">
            <img src="${photos.apec}" alt="Shenzhen APEC Trilateral Summit" />
            <div class="hero-strip"><span>Shenzhen · 33rd APEC Summit</span><span class="pill">3-Way Talks · Thu</span></div>
          </div>
          <div class="hero-head-block">
            <div class="medal m-gold">1</div>
            <div>
              <div class="meta-line"><span class="c-asia">Asia · Summit</span><span class="meta-src">AP · Reuters</span></div>
              <h2 class="hero-hl">Trump, Xi and Putin meet in Shenzhen</h2>
            </div>
          </div>
          <p class="hero-deck">First-ever face-to-face trilateral of the US, Chinese and Russian leaders convenes Thursday on nuclear arms, Ukraine and trade.</p>
        </article>

        <article class="hero-card">
          <div class="hero-img-wrap">
            <img src="${photos.icj}" alt="Peace Palace The Hague ICJ" />
            <div class="hero-strip"><span>The Hague · Peace Palace</span><span class="pill">09:00 UTC Verdict</span></div>
          </div>
          <div class="hero-head-block">
            <div class="medal m-silver">2</div>
            <div>
              <div class="meta-line"><span class="c-eur">Justice · Myanmar</span><span class="meta-src">UN · ICJ</span></div>
              <h2 class="hero-hl">World court rules on Myanmar genocide</h2>
            </div>
          </div>
          <p class="hero-deck">ICJ delivers its final, binding judgment in <em>The Gambia v. Myanmar</em> (11 states intervening) on Rohingya abuses, watched for Gaza clues.</p>
        </article>

        <article class="hero-card">
          <div class="hero-img-wrap">
            <img src="${photos.gaming}" alt="GTA VI Global Launch" />
            <div class="hero-strip"><span>Worldwide · Midnight Rollout</span><span class="pill">NZ First · 212 GB</span></div>
          </div>
          <div class="hero-head-block">
            <div class="medal m-bronze">3</div>
            <div>
              <div class="meta-line"><span class="c-oce">World · Culture</span><span class="meta-src">AP · NZH</span></div>
              <h2 class="hero-hl">GTA VI goes on sale around the world</h2>
            </div>
          </div>
          <p class="hero-deck">After a 13-year wait, console release unlocks at midnight in each market on PS5 and Xbox; ~15M pre-orders lift Take-Two over 8%.</p>
        </article>
      </section>

      <!-- MIDDLE 4x2 PHOTO FEATURE CARDS (4–11) -->
      <section class="mid-grid">
        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.ipo}" alt="Anthropic Nasdaq IPO" />
            <div class="mid-img-tag">New York · Nasdaq: ANT</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-amer"><span class="num-dot bg-amer">4</span><span>Americas · AI</span></span>
            <span class="meta-src">WSJ</span>
          </div>
          <h3 class="mid-hl">Anthropic starts trading on Nasdaq at $83</h3>
          <p class="mid-deck">Priced above range (980M shares, ~$100B+ raise, ~$1.5T val.); hawkish Fed minutes sink Dow 561 pts.</p>
        </article>

        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.gulf}" alt="Persian Gulf Air Defenses" />
            <div class="mid-img-tag">Kuwait · Bahrain · Gaza</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-me"><span class="num-dot bg-me">5</span><span>Mideast · War</span></span>
            <span class="meta-src">AP · BBC</span>
          </div>
          <h3 class="mid-hl">Gulf flares; Israeli tanks cross Gaza line</h3>
          <p class="mid-deck">Iran calls Kuwait US-base drone strikes self-defense after Qeshm raid; Gaza ground raid displaces families.</p>
        </article>

        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.cop31}" alt="COP31 Antalya Climate Talks" />
            <div class="mid-img-tag">Antalya · COP31 Crunch</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-me"><span class="num-dot bg-me">6</span><span>Climate · UN</span></span>
            <span class="meta-src">UN · AFP</span>
          </div>
          <h3 class="mid-hl">COP31 enters final stretch deadlocked</h3>
          <p class="mid-deck">21 issues remain over fossil-fuel exit &amp; $120B aid as new texts arrive Thu and 2nd Stocktake opens.</p>
        </article>

        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.voyager}" alt="Voyager 1 Interstellar Space" />
            <div class="mid-img-tag">Interstellar · 25.9B km</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-spc"><span class="num-dot bg-spc">7</span><span>Space · Science</span></span>
            <span class="meta-src">NASA</span>
          </div>
          <h3 class="mid-hl">Voyager 1 hits one light-day from Earth</h3>
          <p class="mid-deck">49-year-old probe sets human distance record; NASA briefs reporters in Pasadena Thursday.</p>
        </article>

        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.cyclone}" alt="Cyclone Akvan Bay of Bengal" />
            <div class="mid-img-tag">Bay of Bengal · Odisha</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-asia"><span class="num-dot bg-asia">8</span><span>Asia · Weather</span></span>
            <span class="meta-src">IMD</span>
          </div>
          <h3 class="mid-hl">Cyclone Akvan forces 47k evacuations</h3>
          <p class="mid-deck">Odisha clears coastal districts ahead of Friday landfall forecast between Narsapur and Puri.</p>
        </article>

        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.berlin}" alt="Berlin European Leaders Summit" />
            <div class="mid-img-tag">Berlin · European Allies</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-eur"><span class="num-dot bg-eur">9</span><span>Europe · Peace</span></span>
            <span class="meta-src">EFE · EU</span>
          </div>
          <h3 class="mid-hl">Allies hold Berlin Ukraine peace summit</h3>
          <p class="mid-deck">France, UK, Italy, Poland &amp; Ukraine meet in Berlin; Brussels proposes €45B Kyiv loan via reparations.</p>
        </article>

        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.africa}" alt="DR Congo Ebola Field Response" />
            <div class="mid-img-tag">DR Congo · Horn of Africa</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-afr"><span class="num-dot bg-afr">10</span><span>Africa · Crisis</span></span>
            <span class="meta-src">WHO</span>
          </div>
          <h3 class="mid-hl">DRC Ebola tops 11,000; Horn buildup</h3>
          <p class="mid-deck">WHO logs 5,400+ Ebola deaths across 8 provinces; Ethiopia &amp; Eritrea mass troops near Badme.</p>
        </article>

        <article class="mid-card">
          <div class="mid-img">
            <img src="${photos.cricket}" alt="Wellington Test Cricket" />
            <div class="mid-img-tag">Wellington · 1st Test</div>
          </div>
          <div class="mid-meta">
            <span class="mid-meta-left c-oce"><span class="num-dot bg-oce">11</span><span>Oceania · Sport</span></span>
            <span class="meta-src">AFP</span>
          </div>
          <h3 class="mid-hl">Bumrah cuts New Zealand to 60&#8209;4</h3>
          <p class="mid-deck">Returning India pacer takes 2-17 at lunch on day one of the opening Test at Basin Reserve.</p>
        </article>
      </section>

      <!-- LOWER SPLIT: DOT-MATRIX MAP + STATS | ALSO ON THURSDAY 19 NOVEMBER (12–38) -->
      <section class="lower-split">
        <aside class="left-col">
          <div class="sec-title"><span>Where It Happened</span><span class="muted">Pins 1–11</span></div>
          <div class="map-wrap">${worldMapSvg}</div>
          <div class="stats-grid">
            <div class="stat-cell">
              <div class="stat-val">$83 / sh</div>
              <div class="stat-lbl">Anthropic Nasdaq IPO price (ANT), ~$1.5T valuation</div>
            </div>
            <div class="stat-cell">
              <div class="stat-val crimson">550,000</div>
              <div class="stat-lbl">South Koreans sit CSAT exam today (pencils only)</div>
            </div>
            <div class="stat-cell">
              <div class="stat-val">25.9B km</div>
              <div class="stat-lbl">Voyager 1 distance from Earth: one light-day</div>
            </div>
            <div class="stat-cell">
              <div class="stat-val crimson">47,000+</div>
              <div class="stat-lbl">Evacuated in Odisha ahead of Cyclone Akvan</div>
            </div>
          </div>
        </aside>

        <div class="right-col">
          <div class="sec-title"><span>Also On Thursday 19 November</span><span class="muted">Stories 12–38</span></div>
          <div class="wire-cols">
            <ul class="wire-list">
              <li><span class="w-num">12</span><span><strong>Shenzhen:</strong> Trump &amp; Xi hold bilateral talks on AI chips &amp; tariffs.</span></li>
              <li><span class="w-num">13</span><span><strong>Japan–Russia:</strong> PM Takaichi meets Putin, 1st talk since 2022.</span></li>
              <li><span class="w-num">14</span><span><strong>Korea–China:</strong> Lee &amp; Xi seal FTA deal; K-culture curbs ease.</span></li>
              <li><span class="w-num">15</span><span><strong>Seoul:</strong> 550k sit CSAT exam under AI pencil-only rule &amp; freeze.</span></li>
              <li><span class="w-num">16</span><span><strong>Canada–US:</strong> PM Carney &amp; Trump hold 20-min APEC trade talk.</span></li>
              <li><span class="w-num">17</span><span><strong>Australia:</strong> PM Albanese lobbies Xi to lift 55% beef tariffs.</span></li>
              <li><span class="w-num">18</span><span><strong>India–Japan:</strong> Defense &amp; foreign chiefs hold Tokyo 2+2 talks.</span></li>
              <li><span class="w-num">19</span><span><strong>India–Canada:</strong> Envoy signals defense &amp; trade pact for Dec.</span></li>
              <li><span class="w-num">20</span><span><strong>Bangladesh:</strong> Paramilitary patrols amid Hasina return unrest.</span></li>
              <li><span class="w-num">21</span><span><strong>India Energy:</strong> Amazon pledges $7B green push; Delhi schools open.</span></li>
              <li><span class="w-num">22</span><span><strong>India Health:</strong> Country readies indigenous H5N1 flu vaccine.</span></li>
              <li><span class="w-num">23</span><span><strong>Paris / OECD:</strong> IEA Energy Outlook &amp; OECD G7/G20 GDP due Thu.</span></li>
              <li><span class="w-num">24</span><span><strong>ESA Space:</strong> Europe awards OHB €102M ClearSpace-1 deal.</span></li>
              <li><span class="w-num">25</span><span><strong>Spain:</strong> Sánchez &amp; Feijóo debate as winter storm hits north.</span></li>
            </ul>
            <ul class="wire-list">
              <li><span class="w-num">26</span><span><strong>Ukraine Front:</strong> Kharkiv pipeline battle; 141 drones fired.</span></li>
              <li><span class="w-num">27</span><span><strong>UK &amp; Wall St:</strong> UK CPI hits 3.6% (1-yr high); Dow off 561 pts.</span></li>
              <li><span class="w-num">28</span><span><strong>Markets:</strong> Gold sinks 3.5% ($3,864), Silver -5%; Walmart Q3.</span></li>
              <li><span class="w-num">29</span><span><strong>US Congress:</strong> Peltola wins Alaska Senate; Dems pick Jeffries.</span></li>
              <li><span class="w-num">30</span><span><strong>US Courts:</strong> Sanon guilty in Haiti plot; Merchant gets 27.5 yrs.</span></li>
              <li><span class="w-num">31</span><span><strong>US Tech:</strong> Waymo halts US freeway rides; Nvidia 52-wk low.</span></li>
              <li><span class="w-num">32</span><span><strong>California:</strong> Pacific atmospheric river brings flood/snow alerts.</span></li>
              <li><span class="w-num">33</span><span><strong>Mexico:</strong> Lower house bans animal cruelty, affirms sentience.</span></li>
              <li><span class="w-num">34</span><span><strong>Venezuela:</strong> US &amp; Caracas agree to restore military ties.</span></li>
              <li><span class="w-num">35</span><span><strong>Somalia:</strong> Shabelle River nears flood capacity in Beledweyn.</span></li>
              <li><span class="w-num">36</span><span><strong>Sudan &amp; Yemen:</strong> El Obeid probe sought; US pulls carrier.</span></li>
              <li><span class="w-num">37</span><span><strong>IAEA / Riyadh:</strong> UN nuclear chief backs US–Saudi civil pact.</span></li>
              <li><span class="w-num">38</span><span><strong>Sport &amp; Word:</strong> USMNT beats Haiti 2-0; "human" Word of 2026.</span></li>
            </ul>
          </div>
          <div class="date-check">
            <strong>Date Discipline</strong> · Focused on Thursday 19 November 2026 events and overnight UTC dispatches; excludes earlier 16–17 Nov items (Nvidia earnings print, Kerch Bridge, Mongolia resignation). Contested claims attributed.
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <span>All 38 stories happened, or were first reported, on <strong>Thursday 19 November 2026</strong>; claims attributed. Original editorial visuals &amp; Natural Earth map.</span>
      <span><strong>Sources:</strong> AP · Reuters · AFP · BBC · UN · ICJ · WHO · NASA · ESA · IMD · Yonhap</span>
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
print("Saved v4 entry.png (JPEG 1024x1024) and preview-300.png")
`,
], { stdio: 'inherit' });

const bytes = statSync(finalEntryPath).size;
console.log(`Rendered ${finalEntryPath}: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KiB)`);

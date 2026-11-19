// Generates v6 — Dark-Mode Digital Editorial Front Page ("The Economist × NYT Visuals"):
// Exact 1024x1024 px obsidian (#0D1117) editorial canvas with elevated #161B22 cards,
// glowing continent pills, gradient-lit 3-column hero cards with realistic photography,
// giant high-contrast white KPI numbers, 8 photo-backed secondary cards,
// a glowing Natural Earth 110m dot-matrix world map, 23 verified wire briefs (12-34),
// and strict Thursday 19 November 2026 date discipline.

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

function buildGlowingDarkDotMap() {
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

  const W = 328;
  const H = 198;
  const lonMin = -168, lonMax = 180;
  const latMin = -56, latMax = 78;
  const proj = (lon, lat) => [
    ((lon - lonMin) / (lonMax - lonMin)) * (W - 14) + 7,
    ((latMax - lat) / (latMax - latMin)) * (H - 20) + 10,
  ];

  // Crisp steel-grey Natural Earth dot landmasses on obsidian #0D1117
  const dots = [];
  const cols = 74;
  const rows = 35;
  for (let r = 0; r < rows; r++) {
    const lat = latMax - (r + 0.5) * ((latMax - latMin) / rows);
    for (let c = 0; c < cols; c++) {
      const lon = lonMin + (c + 0.5) * ((lonMax - lonMin) / cols);
      if (isLand(lon, lat)) {
        const [x, y] = proj(lon, lat);
        dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill="#5B6B80"/>`);
      }
    }
  }

  // Subtle cyan/slate markers for briefs 12–34
  const wireDots = [
    [139.7, 35.7], [127.0, 37.5], [-75.7, 45.4], [149.1, -35.3],
    [90.4, 23.8], [77.6, 13.0], [2.35, 48.85], [-3.7, 40.4],
    [36.2, 50.0], [-66.9, 10.5], [-99.1, 19.4], [45.3, 2.0],
    [30.2, 13.2], [16.4, 48.2],
  ].map(([lon, lat]) => {
    const [x, y] = proj(lon, lat);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#94A3B8" stroke="#0D1117" stroke-width="0.7"/>`;
  }).join('');

  // Glowing continent-coded pins matching stories 1–11
  const pins = [
    { n: '1', lon: 114.1, lat: 22.5, color: '#E84545' },  // Shenzhen (Asia)
    { n: '2', lon: -74.0, lat: 40.7, color: '#2D6BE4' },  // New York (Americas)
    { n: '3', lon: 174.8, lat: -35.0, color: '#06B6D4' }, // Auckland NZ (Oceania/Global)
    { n: '4', lon: 2.0, lat: 52.3, color: '#3D9E5F' },    // The Hague (Europe)
    { n: '5', lon: 30.7, lat: 39.2, color: '#D4A017' },   // Antalya (Mideast/Climate)
    { n: '6', lon: 85.8, lat: 20.3, color: '#E84545' },   // Odisha (Asia)
    { n: '7', lon: 16.5, lat: 52.5, color: '#3D9E5F' },   // Berlin (Europe)
    { n: '8', lon: 36.8, lat: 29.8, color: '#D4A017' },   // Gaza & Gulf (Mideast)
    { n: '9', lon: 29.5, lat: 2.0, color: '#8B5CF6' },    // DR Congo / Horn (Africa)
    { n: '10', lon: 168.5, lat: -45.0, color: '#06B6D4' },// Wellington NZ (Oceania)
    { n: '11', lon: -118.2, lat: 34.1, color: '#2D6BE4' },// Pasadena NASA (Americas/Space)
  ];

  const pinSvg = pins.map((p) => {
    const [x, y] = proj(p.lon, p.lat);
    return `<g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">
      <circle r="11" fill="${p.color}" fill-opacity="0.24"/>
      <circle r="7.4" fill="${p.color}" stroke="#0D1117" stroke-width="1.3"/>
      <text y="2.8" text-anchor="middle" fill="#FFFFFF" font-family="Avenir Next, sans-serif" font-size="8.3" font-weight="800">${p.n}</text>
    </g>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#0D1117"/>
    <g stroke="#1E293B" stroke-width="0.6" stroke-dasharray="2 3">
      <line x1="0" y1="44" x2="${W}" y2="44"/>
      <line x1="0" y1="88" x2="${W}" y2="88"/>
      <line x1="0" y1="132" x2="${W}" y2="132"/>
      <line x1="82" y1="0" x2="82" y2="${H}"/>
      <line x1="164" y1="0" x2="164" y2="${H}"/>
      <line x1="246" y1="0" x2="246" y2="${H}"/>
    </g>
    ${dots.join('')}
    ${wireDots}
    ${pinSvg}
  </svg>`;
}

const photos = {
  apec: loadDataUri('photo_apec_v2.jpg'),
  ipo: loadDataUri('photo_ipo.jpg'),
  gaming: loadDataUri('photo_gaming.jpg'),
  icj: loadDataUri('photo_icj.jpg'),
  cop31: loadDataUri('photo_cop31.jpg'),
  cyclone: loadDataUri('photo_cyclone.jpg'),
  berlin: loadDataUri('photo_berlin.jpg'),
  gulf: loadDataUri('photo_gulf.jpg'),
  africa: loadDataUri('photo_africa.jpg'),
  cricket: loadDataUri('photo_cricket.jpg'),
  voyager: loadDataUri('photo_voyager.jpg'),
};

const worldMapSvg = buildGlowingDarkDotMap();

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
    background: #0D1117;
    color: #F0F6FC;
    font-family: -apple-system, BlinkMacSystemFont, "Avenir Next", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    width: 1024px;
    height: 1024px;
    padding: 10px 14px 8px 14px;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(45, 107, 228, 0.12), transparent 55%),
      #0D1117;
  }

  /* ==================== HERO HEADER ==================== */
  .header {
    background: linear-gradient(180deg, #131922 0%, #0F141C 100%);
    border: 1px solid #30363D;
    border-top: 3px solid #E84545;
    border-radius: 6px;
    padding: 8px 14px 7px 14px;
    margin-bottom: 7px;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .date-title {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 42px;
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.5px;
    color: #FFFFFF;
  }

  .header-right {
    text-align: right;
  }

  .eyebrow {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #E84545;
  }

  .subtitle {
    font-family: "Georgia", serif;
    font-style: italic;
    font-size: 13px;
    color: #9FB0C4;
    margin-top: 2px;
  }

  /* Six glowing continent pills */
  .continent-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    margin-top: 5px;
  }

  .c-pill {
    font-size: 9.2px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    text-align: center;
    padding: 3px 4px;
    border-radius: 4px;
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .cp-asia { background: rgba(232, 69, 69, 0.24); border-color: #E84545; color: #FF9494; box-shadow: 0 0 10px rgba(232, 69, 69, 0.28); }
  .cp-amer { background: rgba(45, 107, 228, 0.24); border-color: #2D6BE4; color: #93C5FD; box-shadow: 0 0 10px rgba(45, 107, 228, 0.28); }
  .cp-eur  { background: rgba(61, 158, 95, 0.24);  border-color: #3D9E5F; color: #86EFAC; box-shadow: 0 0 10px rgba(61, 158, 95, 0.28); }
  .cp-me   { background: rgba(212, 160, 23, 0.24); border-color: #D4A017; color: #FDE68A; box-shadow: 0 0 10px rgba(212, 160, 23, 0.28); }
  .cp-afr  { background: rgba(139, 92, 246, 0.24); border-color: #8B5CF6; color: #DDD6FE; box-shadow: 0 0 10px rgba(139, 92, 246, 0.28); }
  .cp-oce  { background: rgba(6, 182, 212, 0.24);  border-color: #06B6D4; color: #A5F3FC; box-shadow: 0 0 10px rgba(6, 182, 212, 0.28); }

  /* ==================== GIANT STAT BAR (20% BIGGER NUMBERS) ==================== */
  .stat-bar {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    background: #161B22;
    border: 1px solid #30363D;
    border-radius: 6px;
    margin-bottom: 8px;
    overflow: hidden;
  }

  .stat-item {
    padding: 6px 6px 5px 6px;
    text-align: center;
    border-right: 1px solid #2A313C;
  }

  .stat-item:last-child { border-right: none; }

  .stat-num {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 25px;
    font-weight: 700;
    line-height: 1.02;
    color: #FFFFFF;
    letter-spacing: -0.4px;
  }

  .stat-num.accent-blue { color: #79C0FF; }
  .stat-num.accent-cyan { color: #67E8F9; }
  .stat-num.accent-gold { color: #FDE047; }
  .stat-num.accent-red  { color: #FF7B72; }
  .stat-num.accent-grn  { color: #7EE787; }

  .stat-lbl {
    font-size: 8.6px;
    font-weight: 600;
    line-height: 1.18;
    color: #9FB0C4;
    margin-top: 2px;
  }

  /* ==================== THREE HERO CARDS ==================== */
  .hero-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    margin-bottom: 8px;
  }

  .hero-card {
    position: relative;
    background: #161B22;
    border: 1px solid #30363D;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .hero-card.red   { border-left: 4px solid #E84545; background: radial-gradient(circle at 0% 0%, rgba(232, 69, 69, 0.22), transparent 58%), #161B22; }
  .hero-card.blue  { border-left: 4px solid #2D6BE4; background: radial-gradient(circle at 0% 0%, rgba(45, 107, 228, 0.22), transparent 58%), #161B22; }
  .hero-card.cyan  { border-left: 4px solid #06B6D4; background: radial-gradient(circle at 0% 0%, rgba(6, 182, 212, 0.22), transparent 58%), #161B22; }

  .hero-photo {
    position: relative;
    width: 100%;
    height: 98px;
    overflow: hidden;
    background: #0D1117;
  }

  .hero-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: contrast(1.06) saturate(1.06);
  }

  .hero-photo::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(13,17,23,0.05) 45%, rgba(22,27,34,0.88) 100%);
  }

  .hero-body {
    padding: 5px 9px 7px 9px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .loc-pill {
    display: inline-block;
    align-self: flex-start;
    font-size: 8.8px;
    font-weight: 800;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 1.5px 6px;
    border-radius: 3px;
    margin-bottom: 3.5px;
  }

  .lp-red    { background: rgba(232, 69, 69, 0.22); color: #FF8A8A; border: 1px solid rgba(232, 69, 69, 0.55); }
  .lp-blue   { background: rgba(45, 107, 228, 0.22); color: #93C5FD; border: 1px solid rgba(45, 107, 228, 0.55); }
  .lp-cyan   { background: rgba(6, 182, 212, 0.22); color: #67E8F9; border: 1px solid rgba(6, 182, 212, 0.55); }
  .lp-green  { background: rgba(61, 158, 95, 0.22); color: #86EFAC; border: 1px solid rgba(61, 158, 95, 0.55); }
  .lp-gold   { background: rgba(212, 160, 23, 0.22); color: #FDE68A; border: 1px solid rgba(212, 160, 23, 0.55); }
  .lp-purple { background: rgba(139, 92, 246, 0.22); color: #DDD6FE; border: 1px solid rgba(139, 92, 246, 0.55); }

  .hero-hl {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.09;
    color: #FFFFFF;
    margin-bottom: 3.5px;
  }

  .hero-deck {
    font-size: 10.4px;
    line-height: 1.27;
    color: #B8C4D4;
  }

  /* ==================== 8 SECONDARY ILLUSTRATED CARDS (4x2) ==================== */
  .sec-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px 9px;
    margin-bottom: 8px;
  }

  .sec-card {
    background: #161B22;
    border: 1px solid #30363D;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sc-red    { border-left: 3.5px solid #E84545; }
  .sc-blue   { border-left: 3.5px solid #2D6BE4; }
  .sc-green  { border-left: 3.5px solid #3D9E5F; }
  .sc-gold   { border-left: 3.5px solid #D4A017; }
  .sc-purple { border-left: 3.5px solid #8B5CF6; }
  .sc-cyan   { border-left: 3.5px solid #06B6D4; }

  .sec-photo {
    position: relative;
    width: 100%;
    height: 58px;
    overflow: hidden;
    background: #0D1117;
  }

  .sec-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: contrast(1.06) saturate(1.05);
  }

  .sec-photo::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(13,17,23,0) 50%, rgba(22,27,34,0.82) 100%);
  }

  .sec-body {
    padding: 4px 7px 5.5px 7px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .sec-kicker {
    font-size: 8.2px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    margin-bottom: 1.5px;
  }

  .sk-red    { color: #FF8A8A; }
  .sk-blue   { color: #93C5FD; }
  .sk-green  { color: #86EFAC; }
  .sk-gold   { color: #FDE68A; }
  .sk-purple { color: #DDD6FE; }
  .sk-cyan   { color: #67E8F9; }

  .sec-hl {
    font-family: "Georgia", serif;
    font-size: 13.2px;
    font-weight: 700;
    line-height: 1.1;
    color: #FFFFFF;
    margin-bottom: 2px;
  }

  .sec-deck {
    font-size: 9.5px;
    line-height: 1.22;
    color: #A6B4C6;
  }

  /* ==================== LOWER SPLIT: DARK WORLD MAP + ALSO ON 19 NOV ==================== */
  .lower-split {
    display: grid;
    grid-template-columns: 328px 1fr;
    gap: 10px;
    flex: 1;
    min-height: 0;
    margin-bottom: 6px;
  }

  .map-panel {
    background: #161B22;
    border: 1px solid #30363D;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4.5px 9px;
    background: #1C232D;
    border-bottom: 1px solid #30363D;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #F0F6FC;
  }

  .panel-head span.sub { color: #9FB0C4; font-weight: 700; }

  .map-wrap {
    width: 328px;
    height: 198px;
  }

  .map-note {
    padding: 4.5px 9px 5px 9px;
    font-size: 8.9px;
    line-height: 1.28;
    color: #9FB0C4;
    border-top: 1px solid #2A313C;
    margin-top: auto;
  }

  .map-note strong { color: #FFFFFF; }

  .also-panel {
    background: #161B22;
    border: 1px solid #30363D;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .also-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 12px;
    padding: 5px 9px;
    flex: 1;
  }

  .also-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .also-list li {
    font-size: 9.6px;
    line-height: 1.21;
    color: #C9D3E0;
    display: flex;
    align-items: baseline;
    gap: 5px;
    padding: 1px 0;
    border-bottom: 1px dotted #2A313C;
  }

  .also-list li:last-child { border-bottom: none; }

  .a-num {
    font-size: 9px;
    font-weight: 800;
    color: #FF7B72;
    min-width: 14px;
    flex-shrink: 0;
  }

  .also-list li strong {
    font-weight: 800;
    color: #FFFFFF;
  }

  /* ==================== DATE CHECK + FOOTER ==================== */
  .date-check {
    background: rgba(232, 69, 69, 0.12);
    border: 1px solid rgba(232, 69, 69, 0.48);
    border-left: 3.5px solid #E84545;
    border-radius: 4px;
    padding: 4px 9px;
    font-size: 8.9px;
    line-height: 1.28;
    color: #D2DCE8;
    margin-bottom: 4px;
  }

  .date-check strong {
    color: #FF8A8A;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.6px;
    color: #8B98A9;
  }

  .footer strong { color: #D2DCE8; }
</style>
</head>
<body>
  <div class="page">
    <!-- HERO HEADER -->
    <header class="header">
      <div class="header-top">
        <h1 class="date-title">Thursday 19 November 2026</h1>
        <div class="header-right">
          <div class="eyebrow">The World In One Day · Global Front Page</div>
          <div class="subtitle">34 Verified Stories · 6 Continents &amp; Space · One Day</div>
        </div>
      </div>
      <div class="continent-row">
        <div class="c-pill cp-asia">Asia-Pacific · 9</div>
        <div class="c-pill cp-amer">Americas · 7</div>
        <div class="c-pill cp-eur">Europe · 6</div>
        <div class="c-pill cp-me">Middle East · 4</div>
        <div class="c-pill cp-afr">Africa · 4</div>
        <div class="c-pill cp-oce">Oceania &amp; Space · 4</div>
      </div>
    </header>

    <!-- GIANT STAT BAR -->
    <section class="stat-bar">
      <div class="stat-item">
        <div class="stat-num accent-blue">$81.3bn</div>
        <div class="stat-lbl">Anthropic IPO — largest on record</div>
      </div>
      <div class="stat-item">
        <div class="stat-num accent-cyan">15m+</div>
        <div class="stat-lbl">GTA VI pre-orders at launch</div>
      </div>
      <div class="stat-item">
        <div class="stat-num accent-grn">730,000</div>
        <div class="stat-lbl">Rohingya refugees — ICJ verdict</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">550,000</div>
        <div class="stat-lbl">S. Koreans sit AI-strict CSAT</div>
      </div>
      <div class="stat-item">
        <div class="stat-num accent-gold">$120bn</div>
        <div class="stat-lbl">Adaptation aid gap at COP31</div>
      </div>
      <div class="stat-item">
        <div class="stat-num accent-red">47,000+</div>
        <div class="stat-lbl">Odisha Akvan evacuations</div>
      </div>
    </section>

    <!-- THREE HERO PHOTO CARDS -->
    <section class="hero-grid">
      <article class="hero-card red">
        <div class="hero-photo"><img src="${photos.apec}" alt="Shenzhen APEC Trilateral Summit" /></div>
        <div class="hero-body">
          <span class="loc-pill lp-red">1 · Shenzhen · Summit</span>
          <h2 class="hero-hl">Trump, Xi &amp; Putin Hold First Three-Way Summit</h2>
          <p class="hero-deck">Trump holds 40-min Putin talk and meets Xi ("strategic stability") ahead of historic Shenzhen APEC trilateral on arms, Ukraine &amp; trade.</p>
        </div>
      </article>

      <article class="hero-card blue">
        <div class="hero-photo"><img src="${photos.ipo}" alt="Anthropic Nasdaq IPO" /></div>
        <div class="hero-body">
          <span class="loc-pill lp-blue">2 · New York · Markets</span>
          <h2 class="hero-hl">Anthropic Debuts in Biggest IPO on Record</h2>
          <p class="hero-deck">Priced at $83, above range, raising $81.3bn public (~$1.5tn valuation). Claude maker opens Nasdaq trading today under ticker ANT.</p>
        </div>
      </article>

      <article class="hero-card cyan">
        <div class="hero-photo"><img src="${photos.gaming}" alt="GTA VI Global Launch" /></div>
        <div class="hero-body">
          <span class="loc-pill lp-cyan">3 · Worldwide · Culture</span>
          <h2 class="hero-hl">GTA VI Arrives After a 13-Year Wait</h2>
          <p class="hero-deck">Rockstar's sequel unlocks at midnight across global markets (New Zealand first, 212 GB) on PS5 &amp; Xbox; Take-Two climbs over 8%.</p>
        </div>
      </article>
    </section>

    <!-- EIGHT SECONDARY ILLUSTRATED CARDS (4–11) -->
    <section class="sec-grid">
      <article class="sec-card sc-green">
        <div class="sec-photo"><img src="${photos.icj}" alt="Peace Palace ICJ The Hague" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-green">4 · The Hague · Law</div>
          <h3 class="sec-hl">World Court Rules on Myanmar Genocide</h3>
          <p class="sec-deck">ICJ delivers final, binding verdict in <em>The Gambia v. Myanmar</em> at 09:00 UTC.</p>
        </div>
      </article>

      <article class="sec-card sc-gold">
        <div class="sec-photo"><img src="${photos.cop31}" alt="COP31 Antalya Climate Summit" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-gold">5 · Antalya · Climate</div>
          <h3 class="sec-hl">COP31 Enters Final Stretch Deadlocked</h3>
          <p class="sec-deck">Ministers clash across 21 issues on fossil-fuel exit &amp; $120bn aid; new texts Thu.</p>
        </div>
      </article>

      <article class="sec-card sc-red">
        <div class="sec-photo"><img src="${photos.cyclone}" alt="Cyclone Akvan Bay of Bengal" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-red">6 · Odisha · Storm</div>
          <h3 class="sec-hl">Cyclone Akvan Bears Down on India</h3>
          <p class="sec-deck">Over 47,000 evacuated along eastern coast ahead of Friday landfall near Puri.</p>
        </div>
      </article>

      <article class="sec-card sc-green">
        <div class="sec-photo"><img src="${photos.berlin}" alt="Berlin Ukraine Allies Summit" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-green">7 · Berlin · Europe</div>
          <h3 class="sec-hl">Allies Hold Berlin Ukraine Summit</h3>
          <p class="sec-deck">France, UK, Italy, Poland &amp; Ukraine leaders coordinate European peace terms.</p>
        </div>
      </article>

      <article class="sec-card sc-gold">
        <div class="sec-photo"><img src="${photos.gulf}" alt="Persian Gulf & Gaza Tensions" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-gold">8 · Gaza &amp; Gulf · War</div>
          <h3 class="sec-hl">Gulf Tensions Flare; Gaza Tank Raid</h3>
          <p class="sec-deck">Iran defends strikes as Gulf states condemn; US-backed Gaza raid displaces civilians.</p>
        </div>
      </article>

      <article class="sec-card sc-purple">
        <div class="sec-photo"><img src="${photos.africa}" alt="DR Congo Ebola Field Response" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-purple">9 · Africa · Crisis</div>
          <h3 class="sec-hl">DRC Ebola Tops 11,000; Horn Buildup</h3>
          <p class="sec-deck">WHO logs 5,400+ dead across 8 Congo provinces; Ethiopia &amp; Eritrea mass troops.</p>
        </div>
      </article>

      <article class="sec-card sc-cyan">
        <div class="sec-photo"><img src="${photos.cricket}" alt="Wellington Basin Reserve Cricket" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-cyan">10 · Wellington · Sport</div>
          <h3 class="sec-hl">Bumrah Cuts New Zealand to 60&#8209;4</h3>
          <p class="sec-deck">Returning India star takes 2–17 at lunch on day one of the 1st Test in Wellington.</p>
        </div>
      </article>

      <article class="sec-card sc-blue">
        <div class="sec-photo"><img src="${photos.voyager}" alt="Voyager 1 Interstellar Probe" /></div>
        <div class="sec-body">
          <div class="sec-kicker sk-blue">11 · Pasadena · Space</div>
          <h3 class="sec-hl">NASA Briefs on Voyager 1 Milestone</h3>
          <p class="sec-deck">Thursday briefing marks 49-yr probe reaching one light-day (25.9B km).</p>
        </div>
      </article>
    </section>

    <!-- LOWER SPLIT: GLOWING NATURAL EARTH MAP + ALSO ON 19 NOV WIRE -->
    <section class="lower-split">
      <aside class="map-panel">
        <div class="panel-head">
          <span>Where It Happened</span>
          <span class="sub">Pins 1–11 · Natural Earth</span>
        </div>
        <div class="map-wrap">${worldMapSvg}</div>
        <div class="map-note">
          <strong>Glowing pins (1–11)</strong> match continent colors for featured stories above; slate dots locate global briefs <strong>12–34</strong>.
        </div>
      </aside>

      <div class="also-panel">
        <div class="panel-head">
          <span>Also On Thursday 19 November — 23 More Stories</span>
          <span class="sub">Global Wire · 12–34</span>
        </div>
        <div class="also-cols">
          <ul class="also-list">
            <li><span class="a-num">12</span><span><strong>SHENZHEN</strong> — Xi pledges $20m for APEC &amp; AI trade.</span></li>
            <li><span class="a-num">13</span><span><strong>TOKYO–MOSCOW</strong> — Takaichi meets Putin (1st since '22).</span></li>
            <li><span class="a-num">14</span><span><strong>SEOUL–BEIJING</strong> — Lee &amp; Xi seal FTA; K-culture eases.</span></li>
            <li><span class="a-num">15</span><span><strong>SEOUL</strong> — 550k sit CSAT under AI pencil rule &amp; freeze.</span></li>
            <li><span class="a-num">16</span><span><strong>OTTAWA</strong> — Carney &amp; Trump hold 20-min APEC talk.</span></li>
            <li><span class="a-num">17</span><span><strong>CANBERRA</strong> — Albanese lobbies Xi on 55% beef tariffs.</span></li>
            <li><span class="a-num">18</span><span><strong>TOKYO</strong> — India &amp; Japan hold day 2 of 2+2 talks.</span></li>
            <li><span class="a-num">19</span><span><strong>NEW DELHI</strong> — Envoy signals India–Canada Dec pact.</span></li>
            <li><span class="a-num">20</span><span><strong>DHAKA</strong> — Troops patrol amid Hasina return unrest.</span></li>
            <li><span class="a-num">21</span><span><strong>BENGALURU</strong> — Amazon pledges $7bn; schools reopen.</span></li>
            <li><span class="a-num">22</span><span><strong>INDIA</strong> — Country readies indigenous H5N1 vaccine.</span></li>
            <li><span class="a-num">23</span><span><strong>PARIS</strong> — IEA Energy Outlook &amp; OECD GDP due.</span></li>
          </ul>
          <ul class="also-list">
            <li><span class="a-num">24</span><span><strong>BREMEN</strong> — ESA signs €102m ClearSpace-1 debris deal.</span></li>
            <li><span class="a-num">25</span><span><strong>MADRID</strong> — Sánchez &amp; Feijóo debate amid storm.</span></li>
            <li><span class="a-num">26</span><span><strong>KHARKIV</strong> — Troops fight inside gas pipeline (BBC).</span></li>
            <li><span class="a-num">27</span><span><strong>WASHINGTON</strong> — Walmart Q3 due; housing hits low.</span></li>
            <li><span class="a-num">28</span><span><strong>CARACAS</strong> — Hegseth signs US–Venezuela military pact.</span></li>
            <li><span class="a-num">29</span><span><strong>MEXICO CITY</strong> — House bans cruelty, affirms sentience.</span></li>
            <li><span class="a-num">30</span><span><strong>CALIFORNIA</strong> — Atmospheric river brings flood alerts.</span></li>
            <li><span class="a-num">31</span><span><strong>SOMALIA</strong> — Shabelle flood alert; Mogadishu hits UAE.</span></li>
            <li><span class="a-num">32</span><span><strong>SUDAN</strong> — War-crimes probe urged on El Obeid strikes.</span></li>
            <li><span class="a-num">33</span><span><strong>VIENNA</strong> — IAEA backs US–Saudi civil nuclear pact.</span></li>
            <li><span class="a-num">34</span><span><strong>WORLD</strong> — Cambridge names "human" Word of 2026.</span></li>
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
      <span>Every story happened, or was first reported, on <strong>Thursday 19 November 2026</strong>. Disputed claims attributed. Original editorial visuals &amp; Natural Earth map.</span>
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
im.save("${finalEntryPath}", format="JPEG", quality=90, optimize=True, subsampling=0)
im.resize((300, 300), Image.Resampling.LANCZOS).save("${preview300Path}", format="PNG")
print("Saved v6 dark-mode entry.png (JPEG 1024x1024) and preview-300.png")
`,
], { stdio: 'inherit' });

const bytes = statSync(finalEntryPath).size;
console.log(`Rendered ${finalEntryPath}: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KiB)`);

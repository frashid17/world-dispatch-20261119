// Generates a rich, collector's-edition 1024x1024 front-page gazette
// ("THE WORLD GAZETTE — THURSDAY, 19 NOVEMBER 2026") featuring 36 verified
// world news stories across 6 continents and deep space, 6 bespoke realistic
// press photographs, 3 custom editorial illustrations, a 6-continent news pin
// map, "Also on Thursday 19 November" wire list, and a UTC timeline bar.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ASSETS_DIR = '/Users/divingsquid786/.cursor/projects/Users-divingsquid786-bounty3l/assets';
const ROOT_DIR = resolve(import.meta.dirname, '..');
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function loadDataUri(filename) {
  const fullPath = join(ASSETS_DIR, filename);
  const raw = readFileSync(fullPath);
  const ext = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${ext};base64,${raw.toString('base64')}`;
}

const photos = {
  apec: loadDataUri('photo_apec_v2.jpg'),
  gaming: loadDataUri('photo_gaming.jpg'),
  icj: loadDataUri('photo_icj.jpg'),
  ipo: loadDataUri('photo_ipo.jpg'),
  gulf: loadDataUri('photo_gulf.jpg'),
  cop31: loadDataUri('photo_cop31.jpg'),
};

const icons = {
  globeCrest: `<svg viewBox="0 0 36 36" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="15.5" stroke="#161311" stroke-width="1.8" fill="#EFE6D5"/>
    <ellipse cx="18" cy="18" rx="7.5" ry="15.5" stroke="#161311" stroke-width="1.4"/>
    <line x1="2.5" y1="18" x2="33.5" y2="18" stroke="#161311" stroke-width="1.4"/>
    <path d="M5 10.5C9.2 12.2 13.4 13 18 13C22.6 13 26.8 12.2 31 10.5" stroke="#161311" stroke-width="1.2"/>
    <path d="M5 25.5C9.2 23.8 13.4 23 18 23C22.6 23 26.8 23.8 31 25.5" stroke="#161311" stroke-width="1.2"/>
    <circle cx="18" cy="18" r="2.4" fill="#A6261E"/>
  </svg>`,
  diplomacy: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.8"/>
    <ellipse cx="10" cy="10" rx="3.4" ry="7.5" stroke="currentColor" stroke-width="1.4"/>
    <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.4"/>
  </svg>`,
  gamepad: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.2" y="5.5" width="15.6" height="9.2" rx="4.2" stroke="currentColor" stroke-width="1.7"/>
    <path d="M6.5 8.4V11.8M4.8 10.1H8.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="13.6" cy="9.2" r="1" fill="currentColor"/>
    <circle cx="15.2" cy="11" r="1" fill="currentColor"/>
  </svg>`,
  scales: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V17M6 17H14M4 6.5H16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M4 6.5L2.3 11.2H5.7L4 6.5ZM16 6.5L14.3 11.2H17.7L16 6.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`,
  marketSpark: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 14.5L7.5 9.5L11 12.5L17.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.5 5.5H17.5V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  radarShield: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.2L16.5 4.8V9.6C16.5 13.7 13.7 16.9 10 18.2C6.3 16.9 3.5 13.7 3.5 9.6V4.8L10 2.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M10 6.8V10.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
    <circle cx="10" cy="13.4" r="1.1" fill="currentColor"/>
  </svg>`,
  climateLeaf: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 3.8C11.2 3.8 5.2 6.4 4.2 13.8C3.9 15.8 4.4 16.5 4.4 16.5C4.4 16.5 12.6 16.8 15.4 11.4C16.7 8.9 16.8 6.1 16.5 3.8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M4.2 16.2L11.5 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  orbitIcon: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="10" cy="10" rx="7.8" ry="3.2" transform="rotate(-28 10 10)" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="10" cy="10" r="2.6" fill="currentColor"/>
    <circle cx="15.2" cy="6.6" r="1.4" fill="#FDE047"/>
  </svg>`,
  cycloneIcon: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="2.4" stroke="currentColor" stroke-width="1.7"/>
    <path d="M10 7.6C10 4.5 13.5 3.2 15.8 4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M10 12.4C10 15.5 6.5 16.8 4.2 15.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  </svg>`,
  healthCross: `<svg viewBox="0 0 20 20" width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.1 3.5H11.9V8.1H16.5V11.9H11.9V16.5H8.1V11.9H3.5V8.1H8.1V3.5Z" fill="currentColor"/>
  </svg>`,
  clockIcon: `<svg viewBox="0 0 20 20" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.6" stroke="#E3B341" stroke-width="1.8"/>
    <path d="M10 5.5V10L13.2 12" stroke="#FAF4E8" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  pinIcon: `<svg viewBox="0 0 20 20" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18C10 18 15.8 12.6 15.8 8.2C15.8 4.8 13.2 2.2 10 2.2C6.8 2.2 4.2 4.8 4.2 8.2C4.2 12.6 10 18 10 18Z" stroke="#E3B341" stroke-width="1.8"/>
    <circle cx="10" cy="8" r="2.2" fill="#FAF4E8"/>
  </svg>`,
};

// Bespoke editorial graphic cards for Space (Voyager 1), Cyclone Akvan, and Africa/Health
const graphicVoyager = `<svg viewBox="0 0 120 76" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sp" cx="25%" cy="50%" r="85%">
      <stop offset="0%" stop-color="#1E3A68"/>
      <stop offset="55%" stop-color="#0D1930"/>
      <stop offset="100%" stop-color="#060B17"/>
    </radialGradient>
  </defs>
  <rect width="120" height="76" fill="url(#sp)"/>
  <g fill="#FFFFFF" opacity="0.75">
    <circle cx="14" cy="14" r="0.9"/><circle cx="32" cy="22" r="0.7"/><circle cx="52" cy="12" r="1.1"/>
    <circle cx="76" cy="16" r="0.8"/><circle cx="102" cy="14" r="1"/><circle cx="108" cy="54" r="0.8"/>
    <circle cx="64" cy="60" r="0.9"/><circle cx="24" cy="62" r="0.7"/><circle cx="92" cy="64" r="1"/>
  </g>
  <!-- Earth glow on left -->
  <circle cx="16" cy="42" r="7.5" fill="#3B82F6" stroke="#93C5FD" stroke-width="1.2"/>
  <path d="M12 40 Q16 37 20 41 Q17 45 13 44 Z" fill="#34D399" opacity="0.85"/>
  <!-- 1 light-day signal beam -->
  <path d="M24 42 Q56 32 82 36" fill="none" stroke="#FBBF24" stroke-width="1.5" stroke-dasharray="3.5 2.5"/>
  <!-- Voyager high-gain dish & booms -->
  <g transform="translate(86, 36) rotate(-18)">
    <ellipse cx="0" cy="0" rx="5.5" ry="11" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="1"/>
    <ellipse cx="1.2" cy="0" rx="2.5" ry="6.5" fill="#CBD5E1"/>
    <line x1="5" y1="0" x2="18" y2="-11" stroke="#F59E0B" stroke-width="1.5"/>
    <line x1="5" y1="0" x2="20" y2="9" stroke="#CBD5E1" stroke-width="1.3"/>
    <line x1="-2" y1="0" x2="-10" y2="0" stroke="#FDE047" stroke-width="1.4"/>
    <circle cx="-11" cy="0" r="1.6" fill="#FDE047"/>
  </g>
  <rect x="0" y="61" width="120" height="15" fill="#050811" fill-opacity="0.82"/>
  <text x="60" y="71.5" text-anchor="middle" fill="#FDE68A" font-family="Avenir Next, sans-serif" font-size="8.2" font-weight="800" letter-spacing="0.6">26B KM · 1 LIGHT-DAY</text>
</svg>`;

const graphicCyclone = `<svg viewBox="0 0 120 76" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bay" cx="62%" cy="46%" r="75%">
      <stop offset="0%" stop-color="#0E4F5C"/>
      <stop offset="100%" stop-color="#072830"/>
    </radialGradient>
  </defs>
  <rect width="120" height="76" fill="url(#bay)"/>
  <!-- Eastern India coast silhouette -->
  <path d="M0 0 L46 0 L39 20 L34 38 L24 58 L20 76 L0 76 Z" fill="#C9B796" stroke="#8C7B5E" stroke-width="1"/>
  <!-- Red alert coastal zone -->
  <path d="M39 20 L34 38 L24 58" fill="none" stroke="#EF4444" stroke-width="3.2" stroke-linecap="round"/>
  <!-- Cyclone spiral -->
  <g transform="translate(74, 36)">
    <circle r="22" fill="#38BDF8" fill-opacity="0.16"/>
    <circle r="15" fill="#7DD3FC" fill-opacity="0.22"/>
    <path d="M0 -8 C10 -16 24 -8 22 6" fill="none" stroke="#E0F2FE" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M0 8 C-10 16 -24 8 -22 -6" fill="none" stroke="#E0F2FE" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M-8 0 C-15 -10 -7 -21 6 -19" fill="none" stroke="#7DD3FC" stroke-width="2" stroke-linecap="round"/>
    <path d="M8 0 C15 10 7 21 -6 19" fill="none" stroke="#7DD3FC" stroke-width="2" stroke-linecap="round"/>
    <circle r="4.5" fill="#072830" stroke="#F8FAFC" stroke-width="2"/>
  </g>
  <!-- Forecast track arrow -->
  <path d="M68 35 Q51 35 37 36" fill="none" stroke="#F87171" stroke-width="1.8" stroke-dasharray="3 2"/>
  <polygon points="34,36 40,32.5 40,39.5" fill="#F87171"/>
  <rect x="0" y="61" width="120" height="15" fill="#04191F" fill-opacity="0.85"/>
  <text x="60" y="71.2" text-anchor="middle" fill="#BAE6FD" font-family="Avenir Next, sans-serif" font-size="7.6" font-weight="800" letter-spacing="0.4">ODISHA · 47K EVAC</text>
</svg>`;

const graphicAfrica = `<svg viewBox="0 0 120 76" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="76" fill="#2A1715"/>
  <!-- Stylized East/Central Africa map -->
  <path d="M24 6 L72 6 L88 22 L106 24 L94 46 L82 62 L58 72 L38 64 L26 42 Z" fill="#D5BE9C" stroke="#8C6E4D" stroke-width="1.2"/>
  <!-- Ethiopia-Eritrea Badme flashpoint -->
  <circle cx="80" cy="22" r="10" fill="#DC2626" fill-opacity="0.28"/>
  <circle cx="80" cy="22" r="5" fill="#DC2626" stroke="#FEF2F2" stroke-width="1.4"/>
  <!-- DR Congo Ebola epicenter -->
  <circle cx="48" cy="46" r="13" fill="#B91C1C" fill-opacity="0.32"/>
  <circle cx="48" cy="46" r="7.5" fill="#991B1B" stroke="#FEF2F2" stroke-width="1.3"/>
  <path d="M46.4 42H49.6V44.4H52V47.6H49.6V50H46.4V47.6H44V44.4H46.4V42Z" fill="#FFFFFF"/>
  <!-- Alert arcs -->
  <path d="M56 46 Q68 38 76 27" fill="none" stroke="#FCA5A5" stroke-width="1.1" stroke-dasharray="2.5 2"/>
  <rect x="0" y="61" width="120" height="15" fill="#1A0C0B" fill-opacity="0.88"/>
  <text x="60" y="71.5" text-anchor="middle" fill="#FECACA" font-family="Avenir Next, sans-serif" font-size="8.2" font-weight="800" letter-spacing="0.5">BADME &amp; DR CONGO</text>
</svg>`;

// Clean archival 6-continent "WHERE IT HAPPENED" world pin map (pins 1–9)
const worldMapSvg = `<svg viewBox="0 0 320 148" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#DCE6EE"/>
      <stop offset="100%" stop-color="#C6D6E3"/>
    </linearGradient>
  </defs>
  <rect width="320" height="148" fill="url(#sea)"/>
  <g stroke="#8AA4BA" stroke-opacity="0.35" stroke-width="0.6" stroke-dasharray="2 2">
    <line x1="0" y1="37" x2="320" y2="37"/>
    <line x1="0" y1="74" x2="320" y2="74"/>
    <line x1="0" y1="111" x2="320" y2="111"/>
    <line x1="80" y1="0" x2="80" y2="148"/>
    <line x1="160" y1="0" x2="160" y2="148"/>
    <line x1="240" y1="0" x2="240" y2="148"/>
  </g>
  <g fill="#D5C8AE" stroke="#7A6E5A" stroke-width="0.85" stroke-linejoin="round">
    <path d="M18 24 L52 16 L84 22 L94 38 L84 52 L72 60 L68 72 L60 74 L50 62 L36 54 L28 42 Z"/>
    <path d="M98 10 L120 8 L124 22 L106 25 Z"/>
    <path d="M72 82 L92 86 L106 100 L96 126 L84 142 L74 137 L76 114 L66 98 Z"/>
    <path d="M142 22 L168 18 L184 26 L182 42 L166 48 L148 48 L140 38 Z"/>
    <path d="M144 54 L176 54 L194 68 L192 94 L178 126 L164 130 L154 108 L144 88 L138 68 Z"/>
    <path d="M184 20 L244 16 L286 28 L292 48 L274 68 L254 78 L236 80 L224 68 L212 74 L196 62 L184 48 Z"/>
    <path d="M276 50 L284 48 L282 60 L274 60 Z"/>
    <path d="M248 86 L266 88 L270 94 L250 94 Z"/>
    <path d="M254 104 L284 104 L290 122 L274 130 L254 124 Z"/>
    <path d="M296 128 L305 124 L307 136 L298 138 Z"/>
  </g>
  <g fill="none" stroke="#9E1F1F" stroke-width="0.9" stroke-opacity="0.45" stroke-dasharray="2.5 2">
    <path d="M76 46 Q162 14 256 60"/>
    <path d="M153 33 Q202 36 256 60"/>
    <path d="M196 60 Q186 74 176 92"/>
  </g>
  <!-- 1: Shenzhen -->
  <g transform="translate(256, 61)">
    <circle r="8" fill="#1A3A63" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">1</text>
  </g>
  <!-- 2: New Zealand / Global GTA VI -->
  <g transform="translate(300, 130)">
    <circle r="8" fill="#5B2B82" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">2</text>
  </g>
  <!-- 3: The Hague (ICJ) -->
  <g transform="translate(153, 33)">
    <circle r="8" fill="#7C2D12" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">3</text>
  </g>
  <!-- 4: New York (Anthropic IPO) -->
  <g transform="translate(76, 46)">
    <circle r="8" fill="#0E5A43" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">4</text>
  </g>
  <!-- 5: Kuwait / Gaza -->
  <g transform="translate(198, 60)">
    <circle r="8" fill="#9E1F1F" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">5</text>
  </g>
  <!-- 6: Antalya (COP31) -->
  <g transform="translate(174, 46)">
    <circle r="8" fill="#236B42" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">6</text>
  </g>
  <!-- 7: Deep Space badge (top-left ocean corner) -->
  <g transform="translate(22, 126)">
    <circle r="8" fill="#172A4D" stroke="#E3B341" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FDE68A" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">7</text>
  </g>
  <!-- 8: Odisha, India (Cyclone Akvan) -->
  <g transform="translate(229, 71)">
    <circle r="8" fill="#0F545C" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">8</text>
  </g>
  <!-- 9: Africa (Badme & DR Congo) -->
  <g transform="translate(176, 92)">
    <circle r="8" fill="#9E1F1F" stroke="#FAF6EE" stroke-width="1.3"/>
    <text y="3" text-anchor="middle" fill="#FFF" font-family="Avenir Next, sans-serif" font-size="8.8" font-weight="800">9</text>
  </g>
</svg>`;

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
    background: #F4EFE4;
    color: #13110F;
    font-family: "Georgia", "Times New Roman", serif;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    position: relative;
    width: 1024px;
    height: 1024px;
    padding: 9px 13px 8px 13px;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.48), rgba(232,221,199,0.22) 70%, rgba(208,194,168,0.28) 100%),
      linear-gradient(180deg, #F6F1E6 0%, #F2EBDC 50%, #EFE6D5 100%);
  }

  .page::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      repeating-linear-gradient(0deg, rgba(20,18,16,0.012) 0px, rgba(20,18,16,0.012) 1px, transparent 1px, transparent 3px);
    z-index: 20;
  }

  .page::after {
    content: "";
    position: absolute;
    inset: 4px;
    border: 1px solid rgba(20, 18, 16, 0.24);
    pointer-events: none;
    z-index: 21;
  }

  /* ==================== MASTHEAD ==================== */
  .top-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.8px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #7A1E1A;
    margin-bottom: 2px;
  }

  .masthead-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2.5px solid #161311;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }

  .masthead-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .masthead-title {
    font-family: "Bodoni 72", "Didot", "Georgia", serif;
    font-size: 38px;
    font-weight: 700;
    letter-spacing: 0.6px;
    line-height: 0.95;
    color: #100E0C;
    text-transform: uppercase;
  }

  .date-badge {
    background: #161311;
    color: #FFFFFF;
    padding: 5px 13px;
    border-left: 3.5px solid #B3261E;
    border-right: 3.5px solid #C6973F;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    line-height: 1;
  }

  /* Continental breadth bar */
  .region-bar {
    display: grid;
    grid-template-columns: 9fr 9fr 6fr 5fr 4fr 2.4fr 3.6fr;
    gap: 3px;
    margin-bottom: 4px;
  }

  .r-pill {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #FFFFFF;
    text-align: center;
    padding: 2.5px 2px;
    border-radius: 1.5px;
    white-space: nowrap;
  }

  .rp-asia { background: #5B2B82; }
  .rp-amer { background: #A12323; }
  .rp-eur { background: #1E467A; }
  .rp-me { background: #8F4A10; }
  .rp-afr { background: #1F683D; }
  .rp-oce { background: #1B7A91; }
  .rp-wld { background: #464442; }

  /* Day in Numbers strip */
  .numbers-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #BDB3A2;
    border-bottom: 2px solid #231F1B;
    background: rgba(255, 252, 245, 0.72);
    padding: 3px 8px;
    margin-bottom: 6px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.2px;
    color: #2A241E;
  }

  .numbers-bar .lbl {
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #100E0C;
    text-transform: uppercase;
  }

  .numbers-bar strong {
    color: #9E1F1F;
    font-weight: 800;
  }

  /* ==================== ROW 1: TOP 3 PHOTO HERO LEADS ==================== */
  .hero-trio {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    padding-bottom: 7px;
    border-bottom: 2.5px double #24201C;
    margin-bottom: 7px;
  }

  .hero-card {
    display: flex;
    flex-direction: column;
    padding: 0 9px;
    border-right: 1px solid #BDB3A2;
  }

  .hero-card:first-child { padding-left: 0; }
  .hero-card:last-child { padding-right: 0; border-right: none; }

  .hero-photo {
    position: relative;
    width: 100%;
    height: 118px;
    border: 1.5px solid #221E1A;
    overflow: hidden;
    background: #1B1917;
    margin-bottom: 4px;
    box-shadow: 0 1.5px 4px rgba(20,18,16,0.14);
  }

  .hero-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: contrast(1.04) saturate(1.03);
  }

  .hero-tag {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: rgba(16, 14, 12, 0.86);
    color: #FAF6EE;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    padding: 2px 5.5px;
    border-left: 2.5px solid #D4A13E;
  }

  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.2px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    padding: 1.5px 5.5px;
    border-radius: 1.5px;
    color: #FFFFFF;
    margin-bottom: 3px;
  }

  .k-navy { background: #1A3A63; }
  .k-violet { background: #5B2B82; }
  .k-rust { background: #7C2D12; }
  .k-emerald { background: #0E5A43; }
  .k-crimson { background: #9E1F1F; }
  .k-forest { background: #236B42; }
  .k-space { background: #172A4D; }
  .k-teal { background: #0F545C; }

  .hero-hl {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 18.2px;
    font-weight: 700;
    line-height: 1.09;
    color: #100E0C;
    margin-bottom: 3px;
  }

  .hero-deck {
    font-family: "Georgia", serif;
    font-size: 11.4px;
    line-height: 1.24;
    color: #24201B;
  }

  /* ==================== ROW 2: 6 ILLUSTRATED FEATURE CARDS (4–9) ==================== */
  .mid-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px 11px;
    padding-bottom: 7px;
    border-bottom: 2px solid #24201C;
    margin-bottom: 7px;
  }

  .mid-card {
    display: grid;
    grid-template-columns: 112px 1fr;
    gap: 8px;
    align-items: stretch;
    background: rgba(255, 252, 246, 0.56);
    border: 1px solid #C8BDA9;
    padding: 4.5px;
  }

  .mid-thumb {
    width: 112px;
    height: 76px;
    border: 1px solid #24201C;
    overflow: hidden;
    background: #171412;
    position: relative;
  }

  .mid-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .mid-thumb-tag {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(14, 12, 10, 0.82);
    color: #FAF4E8;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 7.6px;
    font-weight: 800;
    text-align: center;
    letter-spacing: 0.4px;
    padding: 1.5px 2px;
    text-transform: uppercase;
  }

  .mid-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .mid-hl {
    font-family: "Georgia", serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.12;
    color: #100E0C;
    margin-bottom: 2px;
  }

  .mid-deck {
    font-family: "Georgia", serif;
    font-size: 10.4px;
    line-height: 1.22;
    color: #29241E;
  }

  /* ==================== ROW 3: WHERE IT HAPPENED + ALSO ON THURSDAY (10–36) ==================== */
  .lower-split {
    display: grid;
    grid-template-columns: 314px 1fr;
    gap: 10px;
    flex: 1;
    min-height: 0;
    margin-bottom: 6px;
  }

  .map-panel {
    display: flex;
    flex-direction: column;
    border: 1.5px solid #24201C;
    background: #EDE4D3;
    overflow: hidden;
  }

  .panel-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #1B1815;
    color: #FAF4E8;
    padding: 3.5px 8px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.8px;
    font-weight: 800;
    letter-spacing: 1.1px;
    text-transform: uppercase;
  }

  .panel-bar-left {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .panel-bar .gold { color: #E3B341; }

  .map-wrap {
    width: 100%;
    height: 170px;
    border-bottom: 1px solid #BDB3A2;
  }

  .map-caption {
    padding: 5px 7px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9px;
    line-height: 1.32;
    color: #26211C;
    border-bottom: 1px solid #C5B9A3;
    background: rgba(255, 252, 246, 0.72);
  }

  .map-caption strong { color: #100E0C; font-weight: 800; }

  .pulse-box {
    padding: 5px 7px;
    display: flex;
    flex-direction: column;
    gap: 3.5px;
    background: #F4EDE0;
    border-bottom: 1px solid #C5B9A3;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9px;
    line-height: 1.24;
    color: #241F1A;
  }

  .pulse-row {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .pulse-tag {
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    color: #FFFFFF;
    padding: 1px 4.5px;
    border-radius: 1.5px;
    flex-shrink: 0;
  }

  .pt-energy { background: #8F4A10; }
  .pt-aid { background: #9E1F1F; }
  .pt-green { background: #1F683D; }

  .market-box {
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: auto;
    background: #171412;
    color: #FAF4E8;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
  }

  .market-box-title {
    font-size: 8.6px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #E3B341;
    text-transform: uppercase;
  }

  .market-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px 5px;
    font-size: 9.2px;
    font-weight: 700;
  }

  .market-grid .up { color: #4ADE80; }
  .market-grid .dn { color: #F87171; }

  /* ALSO ON THURSDAY 19 NOVEMBER (2-col numbered list 10–36) */
  .also-panel {
    display: flex;
    flex-direction: column;
    border: 1.5px solid #24201C;
    background: #EFE7D8;
    overflow: hidden;
  }

  .also-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    padding: 5px 8px;
    flex: 1;
  }

  .also-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 8px;
    border-right: 1px solid #C4B8A3;
  }

  .also-list.right {
    padding-right: 0;
    padding-left: 9px;
    border-right: none;
  }

  .also-list li {
    font-family: "Georgia", serif;
    font-size: 10.3px;
    line-height: 1.22;
    color: #1D1915;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .num {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.2px;
    font-weight: 800;
    color: #9E1F1F;
    min-width: 15px;
    flex-shrink: 0;
  }

  .also-list li strong {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.8px;
    font-weight: 800;
    color: #100E0C;
  }

  /* ==================== FOOTER: BY THE CLOCK · UTC ==================== */
  .clock-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #171412;
    color: #FAF4E8;
    padding: 4.5px 9px;
    border-top: 2px solid #C6973F;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.4px;
    font-weight: 600;
  }

  .clock-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 800;
    letter-spacing: 0.9px;
    color: #E3B341;
    text-transform: uppercase;
  }

  .clock-bar strong {
    color: #FDE68A;
    font-weight: 800;
  }

  .src-foot {
    margin-top: 3px;
    display: flex;
    justify-content: space-between;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 8.6px;
    font-weight: 600;
    color: #4D453B;
  }
</style>
</head>
<body>
  <div class="page">
    <!-- MASTHEAD -->
    <header>
      <div class="top-meta">
        <span>The World's News In One Front Page · International Gazette</span>
        <span>36 Verified Stories · 6 Continents &amp; Deep Space · Vol. CCXXVI No. 323</span>
      </div>
      <div class="masthead-row">
        <div class="masthead-left">
          ${icons.globeCrest}
          <h1 class="masthead-title">THE WORLD GAZETTE</h1>
        </div>
        <div class="date-badge">THURSDAY, 19 NOVEMBER 2026</div>
      </div>

      <!-- CONTINENT COVERAGE BAR -->
      <div class="region-bar">
        <div class="r-pill rp-asia">ASIA · 9</div>
        <div class="r-pill rp-amer">AMERICAS · 9</div>
        <div class="r-pill rp-eur">EUROPE · 6</div>
        <div class="r-pill rp-me">MIDEAST · 4</div>
        <div class="r-pill rp-afr">AFRICA · 4</div>
        <div class="r-pill rp-oce">OCEANIA · 2</div>
        <div class="r-pill rp-wld">WORLD/SPACE · 2</div>
      </div>

      <!-- DAY IN NUMBERS -->
      <div class="numbers-bar">
        <span class="lbl">The Day In Numbers:</span>
        <span><strong>3</strong> nuclear leaders (Shenzhen)</span>
        <span><strong>$83</strong> Anthropic IPO (ANT)</span>
        <span><strong>11</strong> states at ICJ ruling</span>
        <span><strong>212 GB</strong> GTA VI rollout</span>
        <span><strong>26B km</strong> Voyager 1</span>
        <span><strong>47k</strong> Odisha evacuees</span>
      </div>
    </header>

    <!-- ROW 1: TOP 3 REALISTIC PHOTO HERO LEADS -->
    <section class="hero-trio">
      <article class="hero-card">
        <div class="hero-photo">
          <img src="${photos.apec}" alt="Shenzhen APEC Trilateral Summit" />
          <div class="hero-tag">Shenzhen · 33rd APEC Summit</div>
        </div>
        <div><span class="kicker k-navy">${icons.diplomacy}<span>1 · Asia · Diplomacy</span></span></div>
        <h2 class="hero-hl">Trump, Xi &amp; Putin Meet in Shenzhen</h2>
        <p class="hero-deck">First-ever US–China–Russia 3-way talks convene Thursday after APEC plenary on nuclear arms, Ukraine &amp; trade.</p>
      </article>

      <article class="hero-card">
        <div class="hero-photo">
          <img src="${photos.gaming}" alt="GTA VI Global Launch" />
          <div class="hero-tag">Global Midnight Rollout</div>
        </div>
        <div><span class="kicker k-violet">${icons.gamepad}<span>2 · World · Culture</span></span></div>
        <h2 class="hero-hl">GTA VI Launches Globally After 13 Years</h2>
        <p class="hero-deck">PS5 &amp; Xbox release unlocks at midnight (New Zealand first); ~15M pre-orders ($1.45B) lift Take-Two +8%.</p>
      </article>

      <article class="hero-card">
        <div class="hero-photo">
          <img src="${photos.icj}" alt="Peace Palace ICJ The Hague" />
          <div class="hero-tag">The Hague · Peace Palace</div>
        </div>
        <div><span class="kicker k-rust">${icons.scales}<span>3 · Justice · Myanmar</span></span></div>
        <h2 class="hero-hl">World Court Rules on Myanmar Genocide</h2>
        <p class="hero-deck">ICJ delivers final, binding judgment in <em>The Gambia v. Myanmar</em> on Rohingya atrocities at 09:00 UTC.</p>
      </article>
    </section>

    <!-- ROW 2: 6 ILLUSTRATED FEATURE CARDS (4–9) -->
    <section class="mid-grid">
      <article class="mid-card">
        <div class="mid-thumb">
          <img src="${photos.ipo}" alt="Anthropic Nasdaq IPO" />
          <div class="mid-thumb-tag">Nasdaq · ANT</div>
        </div>
        <div class="mid-body">
          <div><span class="kicker k-emerald">${icons.marketSpark}<span>4 · Americas · AI</span></span></div>
          <h3 class="mid-hl">Anthropic Prices $83 IPO for Thu Debut</h3>
          <p class="mid-deck">980M shares (~$100B+ raise, ~$1.5T val.) open on Nasdaq; Fed minutes sink Dow 561 pts.</p>
        </div>
      </article>

      <article class="mid-card">
        <div class="mid-thumb">
          <img src="${photos.gulf}" alt="Persian Gulf Air Defenses" />
          <div class="mid-thumb-tag">Kuwait · Gaza</div>
        </div>
        <div class="mid-body">
          <div><span class="kicker k-crimson">${icons.radarShield}<span>5 · Mideast · War</span></span></div>
          <h3 class="mid-hl">Iran Targets US Base in Kuwait; Gaza Raid</h3>
          <p class="mid-deck">Gulf defenses repel drones after US Qeshm raid; Israeli tanks cross Gaza Yellow Line.</p>
        </div>
      </article>

      <article class="mid-card">
        <div class="mid-thumb">
          <img src="${photos.cop31}" alt="COP31 Antalya Summit" />
          <div class="mid-thumb-tag">Antalya · COP31</div>
        </div>
        <div class="mid-body">
          <div><span class="kicker k-forest">${icons.climateLeaf}<span>6 · Climate · UN</span></span></div>
          <h3 class="mid-hl">COP31 Deadlocked in Crunch 'Divan'</h3>
          <p class="mid-deck">21 issues unresolved on fossil fuels &amp; $120B aid as 2nd Global Stocktake opens.</p>
        </div>
      </article>

      <article class="mid-card">
        <div class="mid-thumb">${graphicVoyager}</div>
        <div class="mid-body">
          <div><span class="kicker k-space">${icons.orbitIcon}<span>7 · Deep Space</span></span></div>
          <h3 class="mid-hl">Voyager 1 Reaches One Light-Day</h3>
          <p class="mid-deck">49-year-old probe crosses 26B km milestone; NASA holds Pasadena briefing Thu.</p>
        </div>
      </article>

      <article class="mid-card">
        <div class="mid-thumb">${graphicCyclone}</div>
        <div class="mid-body">
          <div><span class="kicker k-teal">${icons.cycloneIcon}<span>8 · Asia · Storm</span></span></div>
          <h3 class="mid-hl">Cyclone Akvan Forces 47k Evacuations</h3>
          <p class="mid-deck">Odisha clears coastal zones ahead of Friday landfall between Narsapur &amp; Puri.</p>
        </div>
      </article>

      <article class="mid-card">
        <div class="mid-thumb">${graphicAfrica}</div>
        <div class="mid-body">
          <div><span class="kicker k-crimson">${icons.healthCross}<span>9 · Africa · Crisis</span></span></div>
          <h3 class="mid-hl">Horn Troop Buildup &amp; DRC Ebola Toll</h3>
          <p class="mid-deck">Ethiopia &amp; Eritrea mass near Badme; WHO logs 11,000+ Ebola cases, 5,400+ dead.</p>
        </div>
      </article>
    </section>

    <!-- ROW 3: WHERE IT HAPPENED MAP + ALSO ON THURSDAY 19 NOVEMBER (10–36) -->
    <section class="lower-split">
      <!-- LEFT: WORLD MAP + MARKET SNAPSHOT -->
      <aside class="map-panel">
        <div class="panel-bar">
          <span class="panel-bar-left">${icons.pinIcon}<span>Where It Happened</span></span>
          <span class="gold">Pins 1–9</span>
        </div>
        <div class="map-wrap">${worldMapSvg}</div>
        <div class="map-caption">
          <strong>1</strong> Shenzhen · <strong>2</strong> NZ/Global · <strong>3</strong> The Hague · <strong>4</strong> New York · <strong>5</strong> Kuwait/Gaza · <strong>6</strong> Antalya · <strong>7</strong> Deep Space · <strong>8</strong> Odisha · <strong>9</strong> Horn/DRC
        </div>
        <div class="pulse-box">
          <div class="pulse-row"><span class="pulse-tag pt-energy">Energy</span><span>Brent crude <strong>$91.9/bbl</strong> (-1.3%); WTI $86.0; USD index nears 104.</span></div>
          <div class="pulse-row"><span class="pulse-tag pt-aid">Rights</span><span>740k Rohingya case concludes at ICJ; 8 DRC provinces hit by Ebola.</span></div>
          <div class="pulse-row"><span class="pulse-tag pt-green">COP31</span><span>75 nations back 35% global electrification target by 2035.</span></div>
        </div>
        <div class="market-box">
          <div class="market-box-title">Global Markets &amp; Macro Snapshot</div>
          <div class="market-grid">
            <span>DOW <span class="dn">50,198</span></span>
            <span>S&amp;P <span class="dn">-0.2%</span></span>
            <span>NASDAQ <span class="up">+0.4%</span></span>
            <span>GOLD <span class="dn">-3.5%</span></span>
            <span>SILVER <span class="dn">-5.0%</span></span>
            <span>UK CPI <span class="dn">3.6%</span></span>
          </div>
        </div>
      </aside>

      <!-- RIGHT: ALSO ON THURSDAY, 19 NOVEMBER 2026 (27 MORE STORIES!) -->
      <div class="also-panel">
        <div class="panel-bar">
          <span>Also On Thursday, 19 November 2026</span>
          <span class="gold">Stories 10–36 · Global Wire</span>
        </div>
        <div class="also-cols">
          <ul class="also-list">
            <li><span class="num">10</span><span><strong>US–China Bilateral:</strong> Trump &amp; Xi hold 1-on-1 talks on AI chips &amp; tariffs in Shenzhen.</span></li>
            <li><span class="num">11</span><span><strong>Japan–Russia:</strong> PM Takaichi meets Putin (1st leaders' talk since 2022) on journalist.</span></li>
            <li><span class="num">12</span><span><strong>Korea–China:</strong> S. Korea's Lee &amp; Xi advance FTA follow-up &amp; cultural-curb talks.</span></li>
            <li><span class="num">13</span><span><strong>Canada–US:</strong> PM Carney &amp; Trump hold 20-min APEC trade meeting in Shenzhen.</span></li>
            <li><span class="num">14</span><span><strong>Berlin Summit:</strong> France, UK, Italy, Poland &amp; Ukraine leaders meet on peace terms.</span></li>
            <li><span class="num">15</span><span><strong>EU Ukraine Loan:</strong> Brussels proposes €45B Kyiv loan repaid via Russian reparations.</span></li>
            <li><span class="num">16</span><span><strong>Ukraine Front:</strong> Russia fires 141 drones (126 downed); Kharkiv gas-pipeline battle.</span></li>
            <li><span class="num">17</span><span><strong>ESA Space:</strong> Europe awards OHB €102M ClearSpace-1 orbital debris contract.</span></li>
            <li><span class="num">18</span><span><strong>Energy &amp; GDP:</strong> IEA releases World Energy Outlook 2026; OECD publishes G7/G20 GDP.</span></li>
            <li><span class="num">19</span><span><strong>Spain Election:</strong> Sánchez &amp; Feijóo hold campaign debate as cold storm hits north.</span></li>
            <li><span class="num">20</span><span><strong>US Congress:</strong> Dem Mary Peltola wins Alaska Senate (56-44); Dems pick H. Jeffries.</span></li>
            <li><span class="num">21</span><span><strong>Walmart Q3:</strong> Retail giant reports Q3 earnings Thu as US housing index hits low.</span></li>
            <li><span class="num">22</span><span><strong>US Courts:</strong> Pastor Sanon guilty in Haiti plot; Asif Merchant gets 27.5 yrs.</span></li>
            <li><span class="num">23</span><span><strong>US Tech:</strong> Waymo halts US freeway driverless rides; Nvidia hits 52-week closing low.</span></li>
          </ul>
          <ul class="also-list right">
            <li><span class="num">24</span><span><strong>Mexico Law:</strong> Lower house bans animal cruelty, recognizes animals as sentient.</span></li>
            <li><span class="num">25</span><span><strong>US–Venezuela:</strong> Washington &amp; Caracas agree to restore military &amp; intel ties.</span></li>
            <li><span class="num">26</span><span><strong>California Storm:</strong> Major Pacific atmospheric river brings flood &amp; heavy snow alerts.</span></li>
            <li><span class="num">27</span><span><strong>Sudan Crisis:</strong> Calls mount for war-crimes probe over El Obeid drone strikes.</span></li>
            <li><span class="num">28</span><span><strong>Yemen &amp; Gulf:</strong> US withdraws Mideast carrier; Saudi warns Houthi war may last months.</span></li>
            <li><span class="num">29</span><span><strong>Ebola Spillover:</strong> WHO flags imported cases in Kenya &amp; Nigeria; new vaccine trials near.</span></li>
            <li><span class="num">30</span><span><strong>India Green Push:</strong> Amazon pledges $7B for renewables; Delhi schools reopen.</span></li>
            <li><span class="num">31</span><span><strong>India–Japan 2+2:</strong> Defense &amp; foreign ministers hold day two of security talks in Tokyo.</span></li>
            <li><span class="num">32</span><span><strong>India Health:</strong> Country readies first indigenous H5N1 avian-flu vaccine launch.</span></li>
            <li><span class="num">33</span><span><strong>Test Cricket (NZ):</strong> Bumrah (2-17) slashes New Zealand to 60-4 vs India in Wellington.</span></li>
            <li><span class="num">34</span><span><strong>Australia Sport:</strong> Cameron Bancroft claims whole team knew of ball-tampering plot.</span></li>
            <li><span class="num">35</span><span><strong>Football:</strong> USMNT beats Haiti 2-0 (8-0 agg.) to book Concacaf Nations League Finals.</span></li>
            <li><span class="num">36</span><span><strong>Word of 2026:</strong> Cambridge Dictionary picks "human" amid global AI debate.</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- FOOTER: BY THE CLOCK · UTC -->
    <footer>
      <div class="clock-bar">
        <span class="clock-label">${icons.clockIcon}<span>By The Clock (UTC)</span></span>
        <span><strong>00:00</strong> GTA VI unlocks globally</span>
        <span><strong>06:30</strong> Shenzhen APEC trilateral</span>
        <span><strong>09:00</strong> ICJ Myanmar ruling, Hague</span>
        <span><strong>14:30</strong> Anthropic ANT Nasdaq debut</span>
        <span><strong>17:00</strong> NASA Voyager 1 talk</span>
      </div>
      <div class="src-foot">
        <span>All stories reported for Thursday, 19 November 2026 (including overnight global time-zone dispatches). Contested claims attributed.</span>
        <span>Wire sources: AP, Reuters, AFP, BBC, UN News, ICJ, WHO, NASA, ESA, WSJ</span>
      </div>
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
print("Saved v3 entry.png (JPEG 1024x1024) and preview-300.png")
`,
], { stdio: 'inherit' });

const bytes = statSync(finalEntryPath).size;
console.log(`Rendered ${finalEntryPath}: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KiB)`);

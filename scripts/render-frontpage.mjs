// Generates a realistic 1024x1024 front-page broadsheet newspaper summarizing
// Thursday, 19 November 2026 world news, complete with editorial photography
// and custom vector icons. Renders via headless Chrome and optimizes under 1 MiB.

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
  ipo: loadDataUri('photo_ipo.jpg'),
  gulf: loadDataUri('photo_gulf.jpg'),
  cop31: loadDataUri('photo_cop31.jpg'),
  gaming: loadDataUri('photo_gaming.jpg'),
};

// Crisp editorial SVG icons
const icons = {
  globeCrest: `<svg viewBox="0 0 36 36" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="15.5" stroke="#181512" stroke-width="1.8" fill="#EFE6D5"/>
    <ellipse cx="18" cy="18" rx="7.5" ry="15.5" stroke="#181512" stroke-width="1.4"/>
    <line x1="2.5" y1="18" x2="33.5" y2="18" stroke="#181512" stroke-width="1.4"/>
    <path d="M5 10.5C9.2 12.2 13.4 13 18 13C22.6 13 26.8 12.2 31 10.5" stroke="#181512" stroke-width="1.2"/>
    <path d="M5 25.5C9.2 23.8 13.4 23 18 23C22.6 23 26.8 23.8 31 25.5" stroke="#181512" stroke-width="1.2"/>
    <circle cx="18" cy="18" r="2.2" fill="#A6261E"/>
  </svg>`,
  trendDown: `<svg viewBox="0 0 20 20" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 5.5L7.8 10.8L11.2 7.4L17.5 13.7" stroke="#B3261E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 13.7H17.5V9.2" stroke="#B3261E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  editionStar: `<svg viewBox="0 0 20 20" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="#1B365D" stroke-width="1.8"/>
    <path d="M10 4.5L11.6 8.2L15.6 8.6L12.6 11.2L13.5 15.1L10 13.1L6.5 15.1L7.4 11.2L4.4 8.6L8.4 8.2L10 4.5Z" fill="#B8860B"/>
  </svg>`,
  diplomacy: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.7"/>
    <ellipse cx="10" cy="10" rx="3.4" ry="7.5" stroke="currentColor" stroke-width="1.4"/>
    <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.4"/>
  </svg>`,
  marketSpark: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 14.5L7.5 9.5L11 12.5L17.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.5 5.5H17.5V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  radarShield: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2.2L16.5 4.8V9.6C16.5 13.7 13.7 16.9 10 18.2C6.3 16.9 3.5 13.7 3.5 9.6V4.8L10 2.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M10 6.8V10.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
    <circle cx="10" cy="13.4" r="1.1" fill="currentColor"/>
  </svg>`,
  climateLeaf: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 3.8C11.2 3.8 5.2 6.4 4.2 13.8C3.9 15.8 4.4 16.5 4.4 16.5C4.4 16.5 12.6 16.8 15.4 11.4C16.7 8.9 16.8 6.1 16.5 3.8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M4.2 16.2L11.5 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  gamepad: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.2" y="5.5" width="15.6" height="9.2" rx="4.2" stroke="currentColor" stroke-width="1.7"/>
    <path d="M6.5 8.4V11.8M4.8 10.1H8.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="13.6" cy="9.2" r="1" fill="currentColor"/>
    <circle cx="15.2" cy="11" r="1" fill="currentColor"/>
  </svg>`,
  africaHealth: `<svg viewBox="0 0 40 40" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="#9E1F1F" stroke="#5E1010" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="15.5" stroke="#F7DFC2" stroke-opacity="0.35" stroke-width="1"/>
    <path d="M17.2 10.5H22.8V17.2H29.5V22.8H22.8V29.5H17.2V22.8H10.5V17.2H17.2V10.5Z" fill="#FDF8EF"/>
  </svg>`,
  spaceProbe: `<svg viewBox="0 0 40 40" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="#172A4D" stroke="#0C172B" stroke-width="1.5"/>
    <ellipse cx="20" cy="20" rx="14" ry="5.5" transform="rotate(-28 20 20)" stroke="#E3B341" stroke-width="1.7"/>
    <circle cx="20" cy="20" r="5" fill="#FDF8EF"/>
    <circle cx="30" cy="14" r="2.3" fill="#E3B341"/>
    <circle cx="11" cy="27" r="1.4" fill="#8AB4F8"/>
    <circle cx="12" cy="11" r="1.2" fill="#FDF8EF"/>
  </svg>`,
  cycloneAid: `<svg viewBox="0 0 40 40" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="#135D66" stroke="#0A3A40" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="4.2" stroke="#FDF8EF" stroke-width="2.2"/>
    <path d="M20 15.8C20 10.5 26 8.5 30 11" stroke="#FDF8EF" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M20 24.2C20 29.5 14 31.5 10 29" stroke="#FDF8EF" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M15.8 20C10.5 20 8.5 14 11 10" stroke="#A7F3D0" stroke-width="1.9" stroke-linecap="round"/>
    <path d="M24.2 20C29.5 20 31.5 26 29 30" stroke="#A7F3D0" stroke-width="1.9" stroke-linecap="round"/>
  </svg>`,
};

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
    color: #141210;
    font-family: "Georgia", "Times New Roman", serif;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    position: relative;
    width: 1024px;
    height: 1024px;
    padding: 13px 18px 12px 18px;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.45), rgba(232,221,199,0.22) 70%, rgba(208,194,168,0.28) 100%),
      linear-gradient(180deg, #F6F1E6 0%, #F2EBDC 50%, #EFE6D5 100%);
  }

  /* Subtle archival newsprint grain + authentic broadsheet fold highlight along the mid-rule */
  .page::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      repeating-linear-gradient(0deg, rgba(20,18,16,0.013) 0px, rgba(20,18,16,0.013) 1px, transparent 1px, transparent 3px),
      linear-gradient(180deg, transparent 52.0%, rgba(255,255,255,0.32) 52.45%, rgba(60,48,34,0.08) 52.8%, transparent 53.35%);
    z-index: 20;
  }

  /* Outer press frame */
  .page::after {
    content: "";
    position: absolute;
    inset: 6px;
    border: 1px solid rgba(20, 18, 16, 0.22);
    pointer-events: none;
    z-index: 21;
  }

  /* ==================== MASTHEAD ==================== */
  .masthead-top {
    display: grid;
    grid-template-columns: 222px 1fr 222px;
    align-items: center;
    gap: 10px;
    padding-bottom: 6px;
  }

  .ear-box {
    border: 1.5px solid #26221E;
    background: rgba(255, 252, 246, 0.65);
    padding: 5px 8px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
  }

  .ear-header {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: #534A40;
    margin-bottom: 2px;
  }

  .ear-main {
    font-size: 11.5px;
    font-weight: 800;
    color: #141210;
    letter-spacing: 0.1px;
    line-height: 1.2;
  }

  .ear-main .down {
    color: #B3261E;
  }

  .ear-sub {
    font-size: 9.5px;
    font-weight: 600;
    color: #4A4239;
    margin-top: 1px;
  }

  .title-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .masthead-name {
    font-family: "Bodoni 72", "Didot", "Georgia", serif;
    font-size: 42px;
    font-weight: 700;
    letter-spacing: 1.2px;
    line-height: 0.98;
    color: #110F0D;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .masthead-motto {
    margin-top: 3px;
    font-family: "Georgia", serif;
    font-style: italic;
    font-size: 11px;
    color: #4D453C;
    letter-spacing: 0.4px;
  }

  /* ==================== DATELINE BAR ==================== */
  .dateline-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #171412;
    color: #FAF6EE;
    padding: 6px 14px;
    border-top: 2px solid #B3261E;
    border-bottom: 2.5px solid #C6973F;
    margin-bottom: 10px;
  }

  .dateline-side {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #DFD5C3;
  }

  .dateline-date {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 3.2px;
    text-transform: uppercase;
    color: #FFFFFF;
  }

  /* ==================== SHARED TYPOGRAPHY & BADGES ==================== */
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 2.5px 7px;
    border-radius: 2px;
    color: #FFFFFF;
    margin-bottom: 5px;
  }

  .kicker-navy { background: #1A3A63; }
  .kicker-emerald { background: #0E5A43; }
  .kicker-crimson { background: #9E1F1F; }
  .kicker-forest { background: #236B42; }
  .kicker-violet { background: #5B2B82; }

  .photo-frame {
    position: relative;
    width: 100%;
    overflow: hidden;
    border: 1.5px solid #221E1A;
    background: #1B1917;
    box-shadow: 0 2px 5px rgba(20, 18, 16, 0.14);
  }

  .photo-frame img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: contrast(1.04) saturate(1.02);
  }

  .photo-tag {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: rgba(16, 14, 12, 0.82);
    color: #FBF7EF;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 2.5px 7px;
    border-left: 2.5px solid #D4A13E;
  }

  /* ==================== UPPER HERO SECTION ==================== */
  .hero-grid {
    display: grid;
    grid-template-columns: 586px 1fr;
    gap: 16px;
    padding-bottom: 10px;
    border-bottom: 3px double #24201C;
    margin-bottom: 11px;
  }

  .lead-story {
    padding-right: 16px;
    border-right: 1px solid #BDB3A2;
    display: flex;
    flex-direction: column;
  }

  .lead-headline {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 31px;
    font-weight: 700;
    line-height: 1.06;
    letter-spacing: -0.35px;
    color: #100E0C;
    margin-bottom: 7px;
  }

  .lead-photo {
    height: 256px;
    margin-bottom: 7px;
  }

  .lead-deck {
    font-family: "Georgia", serif;
    font-size: 14.2px;
    line-height: 1.3;
    color: #221E1A;
  }

  .lead-deck strong {
    color: #0F0D0B;
  }

  .feature-story {
    display: flex;
    flex-direction: column;
  }

  .feature-headline {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 23.5px;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.25px;
    color: #100E0C;
    margin-bottom: 7px;
  }

  .feature-photo {
    height: 206px;
    margin-bottom: 7px;
  }

  .feature-deck {
    font-family: "Georgia", serif;
    font-size: 13.5px;
    line-height: 1.3;
    color: #24201B;
  }

  .ticker-pill {
    margin-top: auto;
    padding-top: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #1B1917;
    color: #F7F1E5;
    padding: 5.5px 10px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
    border-left: 3px solid #16A34A;
  }

  .ticker-pill .green { color: #4ADE80; }
  .ticker-pill .red { color: #F87171; }

  /* ==================== MIDDLE TRIO SECTION ==================== */
  .trio-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    padding-bottom: 10px;
    margin-bottom: 8px;
  }

  .trio-card {
    display: flex;
    flex-direction: column;
    padding: 0 13px;
    border-right: 1px solid #BDB3A2;
  }

  .trio-card:first-child {
    padding-left: 0;
  }

  .trio-card:last-child {
    padding-right: 0;
    border-right: none;
  }

  .trio-photo {
    height: 146px;
    margin-bottom: 7px;
  }

  .trio-headline {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 19.2px;
    font-weight: 700;
    line-height: 1.11;
    color: #110F0D;
    margin-bottom: 5px;
  }

  .trio-deck {
    font-family: "Georgia", serif;
    font-size: 13.1px;
    line-height: 1.28;
    color: #26221D;
  }

  /* ==================== BOTTOM WORLD WIRE STRIP ==================== */
  .wire-strip {
    margin-top: auto;
    border: 1.5px solid #24201C;
    background: #EAE0CE;
  }

  .wire-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #231F1B;
    color: #FAF4E8;
    padding: 4.5px 11px;
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .wire-header span.accent {
    color: #E3B341;
  }

  .wire-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .wire-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 11px 11px 11px;
    border-right: 1px solid #BFB39E;
  }

  .wire-item:last-child {
    border-right: none;
  }

  .wire-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .wire-body {
    display: flex;
    flex-direction: column;
  }

  .wire-region {
    font-family: "Avenir Next", "Helvetica Neue", sans-serif;
    font-size: 9.8px;
    font-weight: 800;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: #6B211A;
    margin-bottom: 2px;
  }

  .wire-region.space { color: #1A3A63; }
  .wire-region.asia { color: #0F545C; }

  .wire-title {
    font-family: "Georgia", serif;
    font-size: 14.8px;
    font-weight: 700;
    line-height: 1.13;
    color: #110F0D;
    margin-bottom: 3px;
  }

  .wire-text {
    font-family: "Georgia", serif;
    font-size: 12.1px;
    line-height: 1.25;
    color: #26221D;
  }
</style>
</head>
<body>
  <div class="page">
    <!-- MASTHEAD -->
    <header>
      <div class="masthead-top">
        <div class="ear-box">
          <div class="ear-header">${icons.trendDown}<span>Wall Street &amp; Gold</span></div>
          <div class="ear-main">DOW 50,198 <span class="down">-561 PTS</span></div>
          <div class="ear-sub">Gold -3.5% · Hawkish Fed minutes</div>
        </div>

        <div class="title-block">
          <div class="title-row">
            ${icons.globeCrest}
            <h1 class="masthead-name">THE WORLD DISPATCH</h1>
          </div>
          <div class="masthead-motto">Independent Global Front Page · Every Region, One Day</div>
        </div>

        <div class="ear-box">
          <div class="ear-header">${icons.editionStar}<span>International Edition</span></div>
          <div class="ear-main">VOL. CCXXVI · NO. 323</div>
          <div class="ear-sub">Shenzhen · New York · Antalya · Gulf</div>
        </div>
      </div>

      <div class="dateline-bar">
        <span class="dateline-side">GLOBAL FRONT PAGE</span>
        <span class="dateline-date">THURSDAY, 19 NOVEMBER 2026</span>
        <span class="dateline-side">WORLD NEWS SUMMARY</span>
      </div>
    </header>

    <!-- ROW 1: HERO LEAD + TOP FEATURE -->
    <section class="hero-grid">
      <article class="lead-story">
        <div>
          <span class="kicker kicker-navy">${icons.diplomacy}<span>Diplomacy · Shenzhen, China</span></span>
        </div>
        <h2 class="lead-headline">TRUMP, XI &amp; PUTIN HOLD HISTORIC APEC TRILATERAL</h2>
        <div class="photo-frame lead-photo">
          <img src="${photos.apec}" alt="Shenzhen APEC Trilateral Summit" />
          <div class="photo-tag">33rd APEC Summit · First US–China–Russia 3-Way Talks</div>
        </div>
        <p class="lead-deck">
          <strong>Unprecedented three-power summit:</strong> Leaders of the United States, China and Russia sit down face to face in Shenzhen on Thursday alongside APEC meetings, with nuclear arms limits, Russia's war in Ukraine, trade tariffs and AI high on the agenda.
        </p>
      </article>

      <article class="feature-story">
        <div>
          <span class="kicker kicker-emerald">${icons.marketSpark}<span>Tech &amp; Markets · New York</span></span>
        </div>
        <h2 class="feature-headline">ANTHROPIC DEBUTS ON NASDAQ AT $83 IN $100B+ IPO</h2>
        <div class="photo-frame feature-photo">
          <img src="${photos.ipo}" alt="Anthropic Nasdaq IPO Trading Floor" />
          <div class="photo-tag">Nasdaq Debut · Ticker: ANT</div>
        </div>
        <p class="feature-deck">
          Claude maker begins trading Thursday after pricing 980M shares at $83 (~$1.5T valuation), the largest IPO on record. Hawkish Fed minutes sink Dow 561 pts &amp; gold 3.5%.
        </p>
        <div class="ticker-pill">
          <span>ANT IPO <span class="green">$83.00</span></span>
          <span>S&amp;P <span class="red">-0.2%</span></span>
          <span>SILVER <span class="red">-5.0%</span></span>
        </div>
      </article>
    </section>

    <!-- ROW 2: THREE EQUAL COLUMNS -->
    <section class="trio-grid">
      <article class="trio-card">
        <div>
          <span class="kicker kicker-crimson">${icons.radarShield}<span>Middle East · Gulf &amp; Gaza</span></span>
        </div>
        <div class="photo-frame trio-photo">
          <img src="${photos.gulf}" alt="Persian Gulf Air Defenses" />
          <div class="photo-tag">Kuwait &amp; Bahrain Intercepts</div>
        </div>
        <h3 class="trio-headline">Iran Targets US Base in Kuwait; Gaza Raid</h3>
        <p class="trio-deck">
          Iran fires drones at Ali Al Salem base after US strike on Qeshm Island; Gulf air defenses repel attacks. Israeli tanks cross Gaza's Yellow Line in rare raid.
        </p>
      </article>

      <article class="trio-card">
        <div>
          <span class="kicker kicker-forest">${icons.climateLeaf}<span>Climate · Antalya, Türkiye</span></span>
        </div>
        <div class="photo-frame trio-photo">
          <img src="${photos.cop31}" alt="COP31 Antalya Climate Summit" />
          <div class="photo-tag">COP31 Crunch Talks</div>
        </div>
        <h3 class="trio-headline">COP31 Deadlocked in Final 'Divan' Talks</h3>
        <p class="trio-deck">
          Nearly 200 nations remain split across 21 issues—fossil-fuel exit and $120B adaptation aid—as fresh texts arrive Thursday and 2nd Global Stocktake begins.
        </p>
      </article>

      <article class="trio-card">
        <div>
          <span class="kicker kicker-violet">${icons.gamepad}<span>Culture · Worldwide</span></span>
        </div>
        <div class="photo-frame trio-photo">
          <img src="${photos.gaming}" alt="Global Gaming Release Night" />
          <div class="photo-tag">Global Midnight Rollout</div>
        </div>
        <h3 class="trio-headline">GTA VI Launches Globally After 13-Year Wait</h3>
        <p class="trio-deck">
          Blockbuster unlocks Thursday starting in New Zealand on PS5 and Xbox Series X|S, following ~15 million pre-orders and $1.45 billion in pre-release sales.
        </p>
      </article>
    </section>

    <!-- ROW 3: BOTTOM WORLD WIRE STRIP -->
    <section class="wire-strip">
      <div class="wire-header">
        <span>Around The Globe · <span class="accent">World Wire</span></span>
        <span>Africa · Deep Space · South Asia &amp; Europe</span>
      </div>
      <div class="wire-grid">
        <div class="wire-item">
          <div class="wire-icon">${icons.africaHealth}</div>
          <div class="wire-body">
            <span class="wire-region">Africa · Horn &amp; DR Congo</span>
            <h4 class="wire-title">Border Buildup &amp; Ebola Crisis</h4>
            <p class="wire-text">Ethiopia &amp; Eritrea mass troops near Badme; WHO reports 11,000+ DRC Ebola cases and 5,400+ dead across 8 provinces.</p>
          </div>
        </div>

        <div class="wire-item">
          <div class="wire-icon">${icons.spaceProbe}</div>
          <div class="wire-body">
            <span class="wire-region space">Space · Deep Space &amp; EU</span>
            <h4 class="wire-title">Voyager 1 Hits 1 Light-Day</h4>
            <p class="wire-text">NASA probe crosses 26B km milestone ahead of Thursday Pasadena talk; ESA awards €102M ClearSpace-1 debris deal.</p>
          </div>
        </div>

        <div class="wire-item">
          <div class="wire-icon">${icons.cycloneAid}</div>
          <div class="wire-body">
            <span class="wire-region asia">Asia &amp; Europe · Storm &amp; Aid</span>
            <h4 class="wire-title">Cyclone Akvan &amp; €45B Loan</h4>
            <p class="wire-text">47,000+ evacuated in Odisha ahead of cyclone landfall; EU proposes €45B Ukraine loan tied to Russian reparations.</p>
          </div>
        </div>
      </div>
    </section>
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

// Verify exact 1024x1024 dimensions, convert to crisp JPEG (<= 1 MiB) saved as entry.png,
// and generate a 300x300 legibility preview.
execFileSync('python3', [
  '-c',
  `
from PIL import Image
im = Image.open("${rawPngPath}").convert("RGB")
assert im.size == (1024, 1024), f"Unexpected size: {im.size}"
im.save("${finalEntryPath}", format="JPEG", quality=92, optimize=True, subsampling=0)
im.resize((300, 300), Image.Resampling.LANCZOS).save("${preview300Path}", format="PNG")
print("Saved entry.png (JPEG 1024x1024) and preview-300.png")
`,
], { stdio: 'inherit' });

const bytes = statSync(finalEntryPath).size;
console.log(`Rendered ${finalEntryPath}: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KiB)`);

# Wingman — Visual Improvement Plan
**For a code agent. Read top-to-bottom and implement in order.**
**Source of truth for every design decision: Figma file `bgpquXiTqq4UY6DYgypTpK`, page `0:1`.**

---

## What this plan does

The current implementation uses a generic card layout that does not match the Figma designs. This plan rewrites the visual layer in four ordered steps. Do not change any TypeScript FSM logic, event handling, or screen routing — only HTML structure inside `mount()` functions and CSS files.

---

## Step 1 — Replace `src/ui-glasses/tokens.css`

Replace the entire file with the following. Every value is derived from the Figma design file.

```css
/* ═══════════════════════════════════════════════════════
   tokens.css — design tokens derived from Figma
   File key: bgpquXiTqq4UY6DYgypTpK
   ═══════════════════════════════════════════════════════ */

/* Google Sans — closest available public match to the Figma font */
@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap');

:root {
  /* ── Colours ─────────────────────────────────────────── */
  --bg:           #181820;          /* page background                  */
  --card-bg:      #1e1e2a;          /* outer card fill                  */
  --tile-bg:      rgba(255,255,255,0.10); /* inner content tiles        */
  --tile-bg-2:    rgba(255,255,255,0.07); /* secondary / nested tiles   */
  --card-border:  rgba(255,255,255,0.15); /* outer card border          */
  --tile-border:  rgba(255,255,255,0.10); /* inner tile border          */
  --chip-bg:      rgba(255,255,255,0.12); /* header chip background     */

  --orange:       #f36c21;          /* PostNL orange — primary CTA      */
  --purple:       #6161ff;          /* AI button / shelf badge          */
  --green:        #2fd87c;          /* success / Ja thuis               */
  --danger:       #c0392b;          /* Niet thuis button                */
  --danger-bg:    rgba(192,57,43,0.25); /* Niet thuis tile bg           */

  --text:         #ffffff;
  --text-mute:    rgba(255,255,255,0.65);
  --text-dim:     rgba(255,255,255,0.35);

  /* ── Typography ─────────────────────────────────────── */
  --font:         'Google Sans', system-ui, -apple-system, sans-serif;
  --fs-xs:        12px;
  --fs-sm:        14px;
  --fs-md:        16px;
  --fs-lg:        20px;
  --fs-xl:        28px;
  --fs-2xl:       36px;
  --fs-hero:      52px;  /* large position numbers e.g. "12 / 40"      */

  /* ── Radius ──────────────────────────────────────────── */
  --r-card:       24px;  /* outer card                                  */
  --r-tile:       20px;  /* inner content tiles                         */
  --r-pill:       999px; /* pill buttons and chips                      */
  --r-badge:      10px;  /* shelf letter badge (B)                      */

  /* ── Spacing ─────────────────────────────────────────── */
  --sp-1:  4px;
  --sp-2:  8px;
  --sp-3:  12px;
  --sp-4:  16px;
  --sp-5:  20px;
  --sp-6:  24px;
  --sp-7:  28px;
  --sp-8:  32px;

  /* ── Focus ring (additive-safe orange) ──────────────── */
  --focus-ring: 0 0 0 2px var(--orange), 0 0 0 4px rgba(243,108,33,0.30);

  /* ── Min tap target ──────────────────────────────────── */
  --min-target:   52px;
}

/* ── Reset ────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font);
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

/* ── Modes ────────────────────────────────────────────── */
body[data-mode="glasses"] {
  width: 600px; height: 600px; margin: 0 auto; overflow: hidden;
  background: #000;
}

body[data-mode="lab"] {
  display: grid;
  place-items: center;
  min-height: 100dvh;
}

body[data-mode="lab"] #app {
  width: min(420px, 100vw);
  overflow-y: auto;
  max-height: 92dvh;
}

/* ── Focus ────────────────────────────────────────────── */
.focusable:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.visually-hidden {
  position: absolute; width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}
```

---

## Step 2 — Replace `src/ui-glasses/layout.css`

Replace the entire file. This defines every reusable component in the system.

```css
/* ═══════════════════════════════════════════════════════
   layout.css — component library derived from Figma
   ═══════════════════════════════════════════════════════ */

/* ── SCREEN WRAPPER ───────────────────────────────────────
   Every screen mounts inside #app.
   Structure:
     <div class="screen">
       <div class="screen-card"> ... </div>
       <div class="cta-layer"> ... </div>
     </div>
   ─────────────────────────────────────────────────────── */

.screen {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-4);
}

/* ── OUTER CARD ────────────────────────────────────────── */

.screen-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--r-card);
  padding: var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

/* ── HEADER CHIP ───────────────────────────────────────────
   Pill at the top of every card. Icon + UPPERCASE label.
   Usage: <div class="screen-chip"><span>ICON</span> LABEL</div>
   ─────────────────────────────────────────────────────── */

.screen-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 6px var(--sp-3);
  border-radius: var(--r-pill);
  background: var(--chip-bg);
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text);
  align-self: flex-start;
  line-height: 1;
}

.screen-chip svg,
.screen-chip .chip-icon {
  width: 14px;
  height: 14px;
  opacity: 0.85;
  flex-shrink: 0;
}

/* Right-side badge (e.g. "1 / 150" counter) */
.screen-chip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chip-counter {
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--text-mute);
  letter-spacing: 0.04em;
}

/* ── INNER TILE ────────────────────────────────────────── */

.tile {
  background: var(--tile-bg);
  border-radius: var(--r-tile);
  padding: var(--sp-4);
}

.tile-sm {
  padding: var(--sp-3);
}

/* ── ADDRESS HERO TILE ─────────────────────────────────────
   The main info tile (zoek, laden, thuis, buren, etc.)
   Shows: address (large) + position row + barcode row
   ─────────────────────────────────────────────────────── */

.address-hero {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.address-hero-name {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
}

/* "12 / 40  B" row — huge numerals + shelf badge */
.address-hero-position {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.position-number {
  font-size: var(--fs-hero);
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.shelf-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--r-badge);
  background: var(--purple);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

/* Meta row: stop number + barcode */
.address-hero-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  font-size: var(--fs-sm);
  color: var(--text-mute);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.meta-icon {
  font-size: 13px;
  opacity: 0.7;
}

/* ── PLATE/DOCK PILL ───────────────────────────────────────
   Wide pill showing kenteken (left) and dock (right).
   Figma: AB-123-C ................ DOCK-6
   ─────────────────────────────────────────────────────── */

.plate-dock-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-5);
  background: var(--tile-bg);
  border-radius: var(--r-pill);
  font-size: var(--fs-lg);
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--text);
}

/* ── VOICE HINT ROW ────────────────────────────────────── */

.voice-hint {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
  color: var(--text-mute);
  padding: var(--sp-1) 0;
}

.voice-hint-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.voice-hint strong,
.voice-hint b {
  color: var(--text);
}

/* ── BUS DIAGRAM ───────────────────────────────────────────
   Rows A / B / C with small cells. Active cell = green.
   ─────────────────────────────────────────────────────── */

.bus-diagram {
  background: var(--tile-bg);
  border-radius: var(--r-tile);
  padding: var(--sp-3) var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.bus-diagram-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-1);
}

.bus-diagram-label {
  font-size: var(--fs-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-mute);
}

.bus-diagram-pos {
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--text-mute);
}

.bus-row {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.bus-row-label {
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--text-dim);
  width: 14px;
  flex-shrink: 0;
}

.bus-cell {
  flex: 1;
  height: 18px;
  border-radius: 4px;
  background: var(--tile-bg-2);
}

.bus-cell.active {
  background: var(--green);
}

/* ── ROUTE TAB BAR ─────────────────────────────────────────
   Three equal-width tabs. Active = lighter bg.
   Each tab: large count number above label text.
   ─────────────────────────────────────────────────────── */

.tab-bar {
  display: flex;
  gap: 2px;
  background: var(--tile-bg);
  border-radius: var(--r-pill);
  padding: 3px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: var(--sp-2) var(--sp-1);
  border-radius: var(--r-pill);
  background: transparent;
  border: none;
  cursor: pointer;
  min-height: var(--min-target);
  transition: background 0.15s;
  color: var(--text-mute);
}

.tab-btn.active {
  background: var(--tile-bg);
  color: var(--text);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.tab-count {
  font-size: var(--fs-lg);
  font-weight: 700;
  line-height: 1;
  color: inherit;
}

.tab-label {
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: inherit;
}

/* ── ROUTE STOP ITEM ───────────────────────────────────── */

.stop-item {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-3) var(--sp-4);
  background: var(--tile-bg);
  border-radius: var(--r-tile);
  cursor: pointer;
  border: 2px solid transparent;
  text-align: left;
  width: 100%;
}

.stop-item:focus { border-color: var(--orange); }

.stop-item-address {
  font-size: var(--fs-md);
  font-weight: 700;
  color: var(--text);
}

.stop-item-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-size: var(--fs-sm);
  color: var(--text-mute);
}

/* ── CHOICE GRID ───────────────────────────────────────────
   2×2 grid of tappable tiles (niet-thuis, veiligeplek, etc.)
   ─────────────────────────────────────────────────────── */

.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
}

.choice-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-1);
  padding: var(--sp-4) var(--sp-3);
  background: var(--tile-bg);
  border-radius: var(--r-tile);
  border: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  min-height: var(--min-target);
  transition: border-color 0.15s;
}

.choice-tile:focus,
.choice-tile.selected { border-color: var(--orange); }

.choice-tile-icon {
  font-size: 18px;
  line-height: 1;
}

.choice-tile-label {
  font-size: var(--fs-md);
  font-weight: 700;
  color: var(--text);
}

.choice-tile-sub {
  font-size: var(--fs-sm);
  color: var(--text-mute);
  line-height: 1.3;
}

/* ── STATS ROW (punt screen) ───────────────────────────── */

.stats-row {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--sp-3) var(--sp-2);
  border-right: 1px solid var(--card-border);
}

.stat-item:last-child { border-right: none; }

.stat-value {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--text-mute);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── CTA LAYER ─────────────────────────────────────────────
   Sits OUTSIDE .screen-card, below it.
   Contains: AI button (left) + primary action (right).
   Some screens: only AI button (bevestigen).
   Some screens: two full-width colored buttons (thuis).
   ─────────────────────────────────────────────────────── */

.cta-layer {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 0 var(--sp-2);
}

/* AI gradient triangle button (always left in cta-layer) */
.btn-ai {
  width: 52px;
  height: 52px;
  border-radius: var(--r-pill);
  border: none;
  background: linear-gradient(135deg, var(--purple) 0%, var(--orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.btn-ai:active { opacity: 0.8; }

.btn-ai svg { width: 18px; height: 18px; fill: #fff; }

/* Triangle SVG for the AI button — use this inline */
/* <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> */

/* Primary orange action button */
.btn-primary {
  flex: 1;
  height: var(--min-target);
  border-radius: var(--r-pill);
  border: none;
  background: var(--orange);
  color: #fff;
  font-family: var(--font);
  font-size: var(--fs-md);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  transition: opacity 0.15s;
}

.btn-primary:active { opacity: 0.8; }

/* Green "Ja, thuis" button */
.btn-yes {
  flex: 1;
  height: var(--min-target);
  border-radius: var(--r-pill);
  border: none;
  background: var(--green);
  color: #fff;
  font-family: var(--font);
  font-size: var(--fs-md);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  transition: opacity 0.15s;
}

/* Dark red "Niet thuis" button */
.btn-no {
  flex: 1;
  height: var(--min-target);
  border-radius: var(--r-pill);
  border: 2px solid rgba(192,57,43,0.6);
  background: rgba(192,57,43,0.20);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--fs-md);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  transition: opacity 0.15s;
}

/* ── LICENSE PLATE INPUT ─────────────────────────────────── */

.plate-input {
  width: 100%;
  height: 52px;
  padding: 0 var(--sp-5);
  border-radius: var(--r-pill);
  border: 1px solid var(--card-border);
  background: var(--tile-bg);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--fs-lg);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
}

.plate-input::placeholder { color: var(--text-dim); }
.plate-input:focus { outline: none; box-shadow: var(--focus-ring); }

/* ── GREETING HEADER (start screen) ──────────────────────── */

.greeting-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-2);
  margin-bottom: var(--sp-1);
}

.greeting-text {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
}

.weather-badge {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--r-pill);
  background: var(--chip-bg);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--text-mute);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── CARD TITLE (kenteken screen "Start laden") ──────────── */

.card-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
}

/* ── BEVESTIGEN 2×2 ACTION GRID ──────────────────────────── */

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-1);
  padding: var(--sp-4) var(--sp-3);
  background: var(--tile-bg);
  border-radius: var(--r-tile);
  border: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  min-height: var(--min-target);
  transition: border-color 0.15s;
}

.action-btn:focus { border-color: var(--orange); }

.action-btn-icon { font-size: 20px; line-height: 1; }
.action-btn-label {
  font-size: var(--fs-md);
  font-weight: 700;
  color: var(--text);
}

/* ── DIVIDER ─────────────────────────────────────────────── */
.divider { height: 1px; background: var(--card-border); }
```

---

## Step 3 — Replace `src/ui-glasses/tier.css`

Replace the entire file:

```css
/* tier.css — adaptive density per experience level */

/* ── Slot rules ──────────────────────────────────── */
body:not([data-exp="beginner"])  .beginner-only   { display: none !important; }
body:not([data-exp="experienced"]) .experienced-only { display: none !important; }
body:not([data-exp="pro"])       .pro-only         { display: none !important; }
body[data-exp="pro"]             .pro-hide         { display: none !important; }

/* ── Compliment banner ─────────────────────────── */
body:not([data-exp="beginner"]) .compliment-banner { display: none !important; }

/* ── Beginner: more breathing room ─────────────── */
body[data-exp="beginner"] .screen-card   { gap: var(--sp-5); }
body[data-exp="beginner"] .choice-tile  { padding: var(--sp-5) var(--sp-4); }

/* ── Experienced: dim hints ──────────────────────── */
body[data-exp="experienced"] .voice-hint { opacity: 0.5; }
body[data-exp="experienced"] .choice-tile-sub { opacity: 0.5; }

/* ── Pro: tighter, minimal ───────────────────────── */
body[data-exp="pro"] .screen-card  { gap: var(--sp-3); }
body[data-exp="pro"] .choice-tile  { padding: var(--sp-3); }
body[data-exp="pro"] .choice-tile-sub { display: none !important; }
body[data-exp="pro"] .bus-diagram-label { display: none !important; }
body[data-exp="pro"] .punt-navigeer-btn { display: none !important; }
body[data-exp="pro"] .card-title { font-size: var(--fs-xl); }
```

---

## Step 4 — Rewrite all screen `mount()` functions

Each screen must use this HTML structure:

```html
<div class="screen">
  <div class="screen-card">
    <!-- header chip -->
    <!-- content tiles -->
    <!-- voice hint (if applicable) -->
  </div>
  <div class="cta-layer">
    <!-- AI button (always, unless screen uses yes/no pattern) -->
    <!-- action button or yes+no buttons -->
  </div>
</div>
```

The AI button SVG to use inline everywhere:
```html
<button class="focusable btn-ai" tabindex="0" aria-label="Wingman AI">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z"/>
  </svg>
</button>
```

---

### 4.1 · `src/screens/start.ts`

**Figma refs:** Beginner `1:953` · Pro `1:4150`

```html
<div class="screen">
  <div class="screen-card">
    <div class="greeting-row">
      <span class="greeting-text">Hi Thomas,</span>
      <div class="weather-badge">☁️ 17°</div>
    </div>

    <!-- Beginner: voice sub-text -->
    <p class="pro-hide" style="font-size:var(--fs-sm);color:var(--text-mute)">
      Voer je kenteken in om de route te laden
    </p>

    <input
      class="focusable plate-input"
      id="plate-input"
      type="text"
      placeholder="AB-123-C"
      tabindex="0"
      autocomplete="off"
      spellcheck="false"
    />

    <div class="voice-hint pro-hide">
      <span class="voice-hint-icon">👆</span>
      Zeg je kenteken of open je hand en zeg <strong>"Menu"</strong>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-start" tabindex="0">
      <span class="pro-hide">Start bezorging</span>
      <span class="pro-only">Start</span>
    </button>
  </div>
</div>
```

---

### 4.2 · `src/screens/kenteken.ts`

**Figma refs:** Beginner `1:608` · Pro `1:3821`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip-row">
      <div class="screen-chip">
        🚌 Bus laden
      </div>
    </div>

    <div class="card-title">Start laden</div>

    <div class="plate-dock-pill">
      <span id="plate-display">AB-123-C</span>
      <span>DOCK-6</span>
    </div>

    <div class="voice-hint beginner-only">
      <span class="voice-hint-icon">👍</span>
      Duim omhoog of zeg <strong>"start laden"</strong>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-start-laden" tabindex="0">
      <span class="pro-hide">Start bezorging</span>
      <span class="pro-only">Start</span>
    </button>
  </div>
</div>
```

---

### 4.3 · `src/screens/scan.ts`

**Figma refs:** Experienced `1:2088` · Pro `1:3845`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip-row">
      <div class="screen-chip">📦 Scannen</div>
      <span class="chip-counter">1 / 150</span>
    </div>

    <!-- Lab: live camera. Glasses: dashed reticle -->
    [CAMERA_OR_RETICLE]

    <div class="tile tile-sm">
      <div class="meta-item">
        <span class="meta-icon">|||</span>
        <span style="font-size:var(--fs-sm);font-family:monospace" id="scan-code">
          3SCD80340225
        </span>
      </div>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <!-- Glasses only: manual confirm button -->
    <button class="focusable btn-primary" id="btn-scan-ok" tabindex="0">
      Scan bevestigen
    </button>
  </div>
</div>
```

For lab mode: replace `[CAMERA_OR_RETICLE]` with `<video id="scan-video" class="scan-video" autoplay muted playsinline style="border-radius:var(--r-tile);width:100%"></video>`.
For glasses mode: replace with `<div class="scan-reticle" style="height:160px;border:2px dashed var(--card-border);border-radius:var(--r-tile);display:flex;align-items:center;justify-content:center;color:var(--text-mute);font-size:var(--fs-sm)">Richt op barcode</div>`.

---

### 4.4 · `src/screens/scan-error.ts`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">⚠️ Scannen</div>

    <div class="tile" style="text-align:center;padding:var(--sp-7) var(--sp-4)">
      <div style="font-size:40px;margin-bottom:var(--sp-3)">⚠️</div>
      <div style="font-size:var(--fs-lg);font-weight:700;color:var(--danger)">
        Probeer opnieuw
      </div>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-scan-retry" tabindex="0">
      Opnieuw scannen
    </button>
  </div>
</div>
```

---

### 4.5 · `src/screens/laden.ts`

**Figma refs:** Beginner `1:804` · Experienced `1:2407`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip-row">
      <div class="screen-chip">✅ Geplaatst</div>
      <span class="chip-counter">1 / 150</span>
    </div>

    <div class="tile">
      <div class="address-hero">
        <div class="address-hero-name">[delivery.address]</div>
        <div class="address-hero-position">
          <span class="position-number">[positionInRow] / 40</span>
          <span class="shelf-badge">[rowInVan]</span>
        </div>
        <div class="address-hero-meta">
          <span class="meta-item">
            <span class="meta-icon">→</span> 1
          </span>
          <span class="meta-item">
            <span class="meta-icon">|||</span> [delivery.id]
          </span>
        </div>
      </div>
    </div>

    <div class="bus-diagram">
      <div class="bus-diagram-header">
        <span class="bus-diagram-label">Plaatsing in bus</span>
        <span class="bus-diagram-pos">[positionInRow] / 40 [rowInVan]</span>
      </div>
      [BUS_ROWS_A_B_C with active cell]
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-pkg-placed" tabindex="0">
      Pakket geplaatst
    </button>
  </div>
</div>
```

For the bus diagram rows, render `A`, `B`, `C` each as `.bus-row` with 5 `.bus-cell` elements. Add class `active` to the cell at `delivery.positionInRow - 1` in the row matching `delivery.rowInVan`.

---

### 4.6 · `src/screens/route.ts`

**Figma refs:** Beginner `1:701`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">↕ Route van vandaag</div>

    <div class="tab-bar" data-focus-axis="horizontal">
      <button class="focusable tab-btn [active?]" data-tab="todo" tabindex="0">
        <span class="tab-count">[todo.length]</span>
        <span class="tab-label">Te doen</span>
      </button>
      <button class="focusable tab-btn" data-tab="invan" tabindex="0">
        <span class="tab-count">[total]</span>
        <span class="tab-label">In de bus</span>
      </button>
      <button class="focusable tab-btn" data-tab="done" tabindex="0">
        <span class="tab-count">[done.length]</span>
        <span class="tab-label">Gedaan</span>
      </button>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--sp-2)">
      [FOR EACH delivery IN activeTab:]
      <button class="focusable stop-item" tabindex="0">
        <span class="stop-item-address">[d.address] [d.postcode] [d.city]</span>
        <div class="stop-item-meta">
          <span class="meta-item"><span class="meta-icon">→</span> 1</span>
          <span class="meta-item"><span class="meta-icon">←</span> 0</span>
          <span class="meta-item"><span class="meta-icon">🕐</span> [d.window.from] – [d.window.to]</span>
        </div>
      </button>
    </div>

    <div class="voice-hint beginner-only">
      <span class="voice-hint-icon">👍</span>
      Duim omhoog of zeg <strong>"start route"</strong>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-route-start" tabindex="0">
      Start bezorging
    </button>
  </div>
</div>
```

---

### 4.7 · `src/screens/zoek.ts`

**Figma refs:** Beginner `1:1410`

Same structure as laden (§4.5) but with chip "📦 ZOEKEN IN DE BUS" and CTA "Zoek pakket in de bus". The address hero tile is identical. Show 2 bus rows for beginner, 3 for experienced/pro (existing logic).

---

### 4.8 · `src/screens/thuis.ts`

**Figma refs:** Beginner `1:1640`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">🏠 Afleveren</div>

    <div class="tile">
      <div class="address-hero">
        <div class="address-hero-name">[delivery.address]</div>
        <div class="address-hero-meta">
          <span class="meta-item"><span class="meta-icon">→</span> 1</span>
          <span class="meta-item"><span class="meta-icon">|||</span> [delivery.id]</span>
        </div>
      </div>
    </div>

    <div class="voice-hint pro-hide">
      <span class="voice-hint-icon">👍</span>
      Duim omhoog voor ja of zeg <strong>"Thuis"</strong>
    </div>
  </div>

  <!-- thuis uses YES/NO pattern — no AI button, two colored buttons -->
  <div class="cta-layer">
    <button class="focusable btn-yes" id="btn-ja-thuis" tabindex="0">
      🏠 Ja, thuis
    </button>
    <button class="focusable btn-no" id="btn-niet-thuis" tabindex="0">
      ✕ Niet thuis
    </button>
  </div>
</div>
```

---

### 4.9 · `src/screens/bevestigen.ts`

**Figma refs:** Beginner `1:1674`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">✅ Bezorging bevestigen</div>

    <!-- 2×2 action grid — no text CTA button in this screen -->
    <div class="action-grid">
      <button class="focusable action-btn" id="btn-bevestigen-ok" tabindex="0">
        <span class="action-btn-icon">✓</span>
        <span class="action-btn-label">Bevestigen</span>
      </button>
      <button class="focusable action-btn" id="btn-foto" tabindex="0">
        <span class="action-btn-icon">📷</span>
        <span class="action-btn-label">Foto</span>
      </button>
      <!-- hidden for beginner: -->
      <button class="focusable action-btn experienced-only pro-only" id="btn-handtekening" tabindex="0">
        <span class="action-btn-icon">✏️</span>
        <span class="action-btn-label">Handtekening</span>
      </button>
      <button class="focusable action-btn" id="btn-scan-opnieuw" tabindex="0">
        <span class="action-btn-icon">🔄</span>
        <span class="action-btn-label">Scan opnieuw</span>
      </button>
    </div>

    <div class="voice-hint pro-hide">
      <span class="voice-hint-icon">👍</span>
      Duim omhoog of zeg <strong>"keuze...."</strong>
    </div>
  </div>

  <!-- bevestigen: only AI button, no text action button -->
  <div class="cta-layer" style="justify-content:center">
    [AI BUTTON]
  </div>
</div>
```

---

### 4.10 · `src/screens/niet-thuis.ts`

**Figma refs:** Beginner `1:366`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">👤 Niemand thuis</div>

    <div class="choice-grid">
      <button class="focusable choice-tile" id="btn-buren" tabindex="0">
        <span class="choice-tile-icon">👥</span>
        <span class="choice-tile-label">Buren</span>
        <span class="choice-tile-sub pro-hide">Afgeven bij de buren</span>
      </button>
      <button class="focusable choice-tile" id="btn-veiligeplek" tabindex="0">
        <span class="choice-tile-icon">✅</span>
        <span class="choice-tile-label">Veilige plek</span>
        <span class="choice-tile-sub pro-hide">Achterlaten op locatie</span>
      </button>
      <button class="focusable choice-tile" id="btn-punt" tabindex="0">
        <span class="choice-tile-icon">🏪</span>
        <span class="choice-tile-label">PostNL Punt</span>
        <span class="choice-tile-sub pro-hide">Dichtstbijzijnde locatie</span>
      </button>
      <button class="focusable choice-tile" id="btn-later" tabindex="0">
        <span class="choice-tile-icon">🕐</span>
        <span class="choice-tile-label">Later bezorgen</span>
        <span class="choice-tile-sub pro-hide">Vandaag of morgen opnieuw</span>
      </button>
    </div>

    <div class="voice-hint">
      <span class="voice-hint-icon">💬</span>
      Zeg <strong>"keuze...."</strong>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-bevestigen" tabindex="0">
      ✓ Bevestigen
    </button>
  </div>
</div>
```

---

### 4.11 · `src/screens/buren.ts`

**Figma refs:** Beginner `1:539`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">👥 Afgeven buren</div>

    <div style="font-size:var(--fs-md);color:var(--text-mute);padding:0 var(--sp-1)">
      Keesomstraat 10e 1821 BS Alkmaar
    </div>

    <div class="choice-grid" data-focus-axis="horizontal">
      <button class="focusable choice-tile [selected?]" id="btn-left" tabindex="0">
        <span class="choice-tile-icon">🏠</span>
        <span class="choice-tile-label">Nr. 100</span>
        <span class="choice-tile-sub pro-hide">Linker buren</span>
      </button>
      <button class="focusable choice-tile" id="btn-right" tabindex="0">
        <span class="choice-tile-icon">🏠</span>
        <span class="choice-tile-label">Nr. 104</span>
        <span class="choice-tile-sub pro-hide">Rechter buren</span>
      </button>
    </div>

    <div class="voice-hint">
      <span class="voice-hint-icon">💬</span>
      Zeg <strong>"Links"</strong> of <strong>"Rechts"</strong> of <strong>"Huisnummer"</strong>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-buren-bevestigen" tabindex="0">
      ✓ Bevestigen
    </button>
  </div>
</div>
```

---

### 4.12 · `src/screens/veiligeplek.ts`

**Figma refs:** Beginner `1:436`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">✅ Veilige plek</div>

    <div style="font-size:var(--fs-md);color:var(--text-mute)">
      Keesomstraat 10e 1821 BS Alkmaar
    </div>

    <div class="choice-grid">
      <button class="focusable choice-tile [selected?]" data-place="sp.voordeur" tabindex="0">
        <span class="choice-tile-icon">🚪</span>
        <span class="choice-tile-label">Voordeur</span>
      </button>
      <button class="focusable choice-tile" data-place="sp.achtertuin" tabindex="0">
        <span class="choice-tile-icon">🌿</span>
        <span class="choice-tile-label">Achtertuin</span>
      </button>
      <button class="focusable choice-tile" data-place="sp.fietsenstalling" tabindex="0">
        <span class="choice-tile-icon">🚲</span>
        <span class="choice-tile-label">Fietsenstalling</span>
      </button>
      <button class="focusable choice-tile" data-place="sp.anders" tabindex="0">
        <span class="choice-tile-icon">➕</span>
        <span class="choice-tile-label">Anders...</span>
      </button>
    </div>

    <div class="voice-hint pro-hide">
      <span class="voice-hint-icon">💬</span>
      Zeg <strong>"keuze...."</strong>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary" id="btn-veiligeplek-confirm" tabindex="0">
      ✓ Bevestigen
    </button>
  </div>
</div>
```

---

### 4.13 · `src/screens/punt.ts`

**Figma refs:** Beginner `1:490`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">📍 PostNL Punt</div>

    <div class="tile">
      <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-1)">
        <span>🏪</span>
        <div>
          <div style="font-size:var(--fs-md);font-weight:700">Bruna Alkmaar Centrum</div>
          <div style="font-size:var(--fs-sm);color:var(--text-mute)">Langestraat 76, Alkmaar</div>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-value">0.4 km</span>
        <span class="stat-label">Afstand</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">18:00</span>
        <span class="stat-label">Sluit om</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">-3 min</span>
        <span class="stat-label">Rijden</span>
      </div>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary punt-navigeer-btn" id="btn-punt-navigeer" tabindex="0">
      ✓ Navigeer
    </button>
  </div>
</div>
```

---

### 4.14 · `src/screens/later.ts`

**Figma refs:** Beginner `1:280`

```html
<div class="screen">
  <div class="screen-card">
    <div class="screen-chip">🕐 Later bezorgen</div>

    <div class="choice-grid">
      <button class="focusable choice-tile" id="btn-today" tabindex="0">
        <span class="choice-tile-label">Vandaag opnieuw</span>
        <span class="choice-tile-sub pro-hide">Later vandaag terugkomen</span>
      </button>
      <button class="focusable choice-tile" id="btn-tomorrow" tabindex="0">
        <span class="choice-tile-label">2e bezorgpoging</span>
        <span class="choice-tile-sub pro-hide">Morgen een nieuwe afspraak</span>
      </button>
    </div>

    <div class="voice-hint">
      <span class="voice-hint-icon">💬</span>
      Zeg <strong>"later"</strong> of <strong>"morgen"</strong>
    </div>
  </div>

  <div class="cta-layer">
    [AI BUTTON]
    <button class="focusable btn-primary pro-hide" id="btn-later-bevestigen" tabindex="0">
      Bevestigen
    </button>
  </div>
</div>
```

---

## Step 5 — Update `src/main.ts` imports

In `src/main.ts`, remove the import of `@/ui-lab/frame.css` (it will stay as-is). The lab frame CSS does not need structural changes.

---

## Important implementation notes for the code agent

1. **`[AI BUTTON]` placeholder** — replace every occurrence with this exact HTML:
   ```html
   <button class="focusable btn-ai" tabindex="0" aria-label="Wingman AI">
     <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:18px;height:18px;fill:white">
       <path d="M8 5v14l11-7z"/>
     </svg>
   </button>
   ```

2. **`[delivery.address]` etc.** — replace with the actual TypeScript expression from the existing screen code (e.g. `` `${delivery?.address ?? t('laden.address')}` ``).

3. **`[BUS_ROWS_A_B_C]`** — use the existing `buildBusDiagram()` helper already in `laden.ts` and `zoek.ts`, but update the cell HTML to use `.bus-cell` and `.bus-cell.active` instead of the old classes.

4. **Keep all event listeners unchanged** — only the `container.innerHTML = renderFrame({...})` call and its HTML template string changes. The `.querySelector` calls and `.addEventListener` calls below it stay the same.

5. **`renderFrame()` in `_frame.ts` is no longer used** — screens now build their own `.screen` wrapper directly. Delete the call to `renderFrame()` in each `mount()` function and set `container.innerHTML` to the new HTML directly.

6. **Run `pnpm test` after changes** — the FSM tests must still pass (36/36). Only visual HTML/CSS is changing, so all tests should continue to pass without modification.

7. **Verify in browser at `?mode=lab`** — after implementing, open `http://localhost:5173` and check each screen visually against the Figma node IDs listed above each section.

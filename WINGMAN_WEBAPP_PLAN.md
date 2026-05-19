# Wingman Webapp — Single Build Plan (code-agent ready)
**Author:** Thomas Lakeman · Hypersolid · CMD Amsterdam 25/26
**Date:** 2026-05-18
**Targets (one codebase):**
1. Meta Ray-Ban Display (MRBD) — 600 × 600, additive display, D-pad only
2. Desktop / phone browser — portrait "lab" view, voice + camera enabled
**Source material:**
- Existing prototype: `/Wingman copy/` (Vite, vanilla JS, single-page FSM in `main.js`)
- Figma file: `https://www.figma.com/design/bgpquXiTqq4UY6DYgypTpK/Webapp-designs` (page id `0:1`)
- Wingman docs: `Wingman_3Tier_Differentiation.md`, `Wingman_Prototype_Improvement_Plan.md`, `AGENT_IMPLEMENTATION_PLAN.md`, `Wingman_Ethische_Analyse.docx`
- Meta toolkit: `github.com/facebookincubator/meta-wearables-webapp`

> This file IS the spec. A code agent should read this top-to-bottom and start implementing in §6. Do not invent screens, copy, or interactions — every string and state is listed below.

---

## 1 · Goal in one paragraph

Re-implement the Wingman prototype as a single web application that runs *unchanged* on MRBD glasses (600² additive, D-pad input) and on a desktop browser (portrait card, mouse + keyboard + voice + camera). The flow, copy, and tier differentiation come from the Figma file; the FSM and audio prompts come from the existing prototype. Three experience tiers (`beginner`, `experienced`, `pro`) switch visual density and interaction at runtime via a single CSS attribute.

---

## 2 · Platform constraints (authoritative)

### MRBD (canonical glasses build)
- Viewport **600 × 600 px**, additive display — **black renders as transparent**.
- Input: **D-pad only** via EMG wristband, mapped to `ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Enter`. No tap, no swipe, no on-device camera, no on-device mic.
- Sensors available: accelerometer, gyro, compass, geolocation, IMU.
- Focusable elements **must** carry the class `.focusable` and be reachable in DOM order.

### Desktop / phone lab
- Portrait 400–620 px wide × auto height (matches Figma frames).
- Voice (`webkitSpeechRecognition`) and camera (`getUserMedia` + barcode scanner) enabled.
- Same D-pad event bus, so keyboard navigation works identically.

### What the same codebase produces
- Identical FSM, identical strings, identical tier logic.
- Layout chosen at boot from `mode = "glasses" | "lab"` (auto-detected, overridable via `?mode=lab`).
- Bundle size budget: < 200 KB JS, < 50 KB CSS gzipped. No frameworks.

---

## 3 · Tech stack (no surprises)

| Concern | Choice | Notes |
|---|---|---|
| Language | **TypeScript (strict)** | Hypersolid default. |
| Build | **Vite 5+** | Same toolchain as `/Wingman copy/`. |
| Package manager | **pnpm**, install with `pnpm install --ignore-scripts` | Per Hypersolid org rules. |
| Framework | none (vanilla TS + DOM) | Bundle budget + glasses runtime. |
| State | hand-rolled FSM in `src/core/state.ts` | Ported from `main.js` `S.*` constants. |
| Styling | plain CSS with custom properties; `tier.css` selectors carry over | One token file, one layout file, one tier file. |
| Voice (lab) | Web Speech API behind feature flag | Dutch (`nl-NL`) primary, English fallback. |
| Camera (lab) | `getUserMedia` + `@zxing/browser` | Barcode/QR scan; lab-only. |
| Tests | **vitest** for FSM/tier logic | No DOM tests required for the prototype. |

Dependencies kept to the absolute minimum (per Hypersolid org guidance): `typescript`, `vite`, `vitest`, `@zxing/browser`. Nothing else.

---

## 4 · File tree

```
Wingmanweb/
├── WINGMAN_WEBAPP_PLAN.md            (this file)
├── package.json                       pnpm, vite, typescript, vitest, @zxing/browser
├── tsconfig.json                      strict mode
├── vite.config.ts                     base "/", aliases @/* → src/*
├── index.html                         entry; mounts #app; sets body[data-mode] + data-exp
├── public/
│   ├── icons/                         monochrome SVGs (re-export of /Wingman copy/assets/)
│   ├── audio/                         pre-recorded NL .mp3 prompts (TTS fallback for glasses)
│   └── mock/
│       └── deliveries.json            ported from deliveries.js
├── src/
│   ├── main.ts                        boot: detect mode → init router → mount default screen
│   ├── core/
│   │   ├── state.ts                   FSM: states, transitions, guards
│   │   ├── tier.ts                    setTier(), defaults, body[data-exp]
│   │   ├── strings.ts                 NL/EN copy table (ported from STRINGS in main.js)
│   │   ├── audio.ts                   speak(key) — Web Speech TTS in lab, audio file in glasses
│   │   └── events.ts                  app event bus (input, geo, scan, voice)
│   ├── input/
│   │   ├── dpad.ts                    keyboard + (future) wearable bridge → focus traversal
│   │   ├── voice.ts                   webkitSpeechRecognition wrapper, NL commands
│   │   └── camera.ts                  getUserMedia + ZXing scan → emits "scan" event
│   ├── screens/
│   │   ├── _frame.ts                  shared screen shell (header, focus ring, footer hint)
│   │   ├── start.ts
│   │   ├── kenteken.ts                friction 1a — license plate + dock
│   │   ├── scan.ts                    friction 1b — package scan
│   │   ├── scan-error.ts              friction 1b — error
│   │   ├── laden.ts                   friction 1c — placing in van
│   │   ├── route.ts                   friction 2a — route overview
│   │   ├── zoek.ts                    friction 2b — search van (per drop)
│   │   ├── thuis.ts                   friction 3 — recipient at door
│   │   ├── bevestigen.ts              friction 3b — confirm method
│   │   ├── niet-thuis.ts              friction 4 — no-one home choice
│   │   ├── buren.ts                   friction 4a — neighbors
│   │   ├── veiligeplek.ts             friction 4b — safe place
│   │   ├── punt.ts                    friction 4c — PostNL point
│   │   ├── later.ts                   friction 4d — later delivery
│   │   └── compliment.ts              beginner-only banner overlay
│   ├── ui-glasses/
│   │   ├── tokens.css                 colors, type, spacing (additive-safe palette)
│   │   ├── layout.css                 600² square, stack, pill, hud
│   │   └── tier.css                   body[data-exp="..."] selectors
│   ├── ui-lab/
│   │   ├── frame.css                  portrait 414–616 card centered in viewport
│   │   └── companion.ts               dev-only panel: tier switch, mock GPS, mode toggle
│   └── types.ts                       Tier, Mode, Delivery, ScreenId
└── tests/
    ├── state.spec.ts                  every legal FSM transition
    └── tier.spec.ts                   each tier hides/shows the right slots
```

---

## 5 · Core data types

```ts
// src/types.ts
export type Tier = 'beginner' | 'experienced' | 'pro';
export type Mode = 'glasses' | 'lab';

export type ScreenId =
  | 'start' | 'kenteken' | 'scan' | 'scan-error' | 'laden'
  | 'route' | 'zoek' | 'thuis' | 'bevestigen'
  | 'niet-thuis' | 'buren' | 'veiligeplek' | 'punt' | 'later';

export interface Delivery {
  id: string;            // e.g. "3SCD80340225"
  address: string;       // "Keesomstraat 10e"
  postcode: string;      // "1821 BS"
  city: string;          // "Alkmaar"
  rowInVan: string;      // "B"
  positionInRow: number; // 1..N
  window: { from: string; to: string }; // "10:00", "10:30"
}
```

---

## 6 · FSM (port from `/Wingman copy/main.js`)

```
START
  └─ (kenteken submitted) → KENTEKEN
KENTEKEN (bus laden screen)
  └─ ("start laden" / scan first pkg) → SCAN
SCAN
  ├─ (scan ok)    → LADEN
  └─ (scan fail)  → SCAN_ERROR → SCAN
LADEN
  ├─ (more pkgs)  → SCAN
  └─ (all loaded) → ROUTE
ROUTE
  └─ ("start" / select stop) → ZOEK
ZOEK
  └─ (pkg confirmed) → THUIS         // arrives at door
THUIS
  ├─ ("ja thuis")    → BEVESTIGEN
  └─ ("niet thuis")  → NIET_THUIS
NIET_THUIS
  ├─ ("buren")        → BUREN        → BEVESTIGEN
  ├─ ("veilige plek") → VEILIGEPLEK  → BEVESTIGEN
  ├─ ("punt")         → PUNT         → BEVESTIGEN
  └─ ("later")        → LATER        → BEVESTIGEN
BEVESTIGEN
  └─ ("bevestigen" / foto / handtekening) → ROUTE     // next stop or end
```

All transitions are also reachable via D-pad navigation to the corresponding `.focusable` button and `Enter`.

---

## 7 · Screen-by-screen contract (from Figma, page `0:1`)

> **Reading the table:** "B / E / P" = beginner / experienced / pro. A `—` means the element is hidden for that tier. The "Figma node IDs" let the code agent fetch a screenshot per tier (`mcp__Figma__get_screenshot` with that node id) for pixel-accurate styling.

### 7.1 · `start` — Kenteken entry + assistent instellingen
**Figma:** B `1:953` · E `1:2932` · P `1:4150` · sizes 600×426 / 600×419 / 600×320
**Strings:** "House Number", "Street Name" (illustration placeholders), "Voer je kenteken in om de route van vandaag te laden", "AB-123-C", "Zeg 'volgende stop' om te navigeren", "Start bezorging", "Assistent instellingen", "Taal / Language", "Beginner"
**Tier differences:**
- B: shows assistent instellingen + tier label + voice hint.
- E: drops settings block, keeps voice hint.
- P: button label collapses from "Start bezorging" → "Start"; no voice hint, no instellingen.

### 7.2 · `kenteken` — Bus laden + scan launcher
**Figma:** B `1:608` · E `1:2061` · P `1:3821` · sizes 600×441 / 600×434 / 600×385
**Strings:** "Bus laden", "Start laden" / "Start", "AB-123-C", "Dock-6", "Scannen", "1 / 150", "Status:", "3SCD80340225", "Zeg 'volgende stop' om te navigeren"
**Tier differences:** P button label "Start" instead of "Start laden". Voice hint visible for all (will be hidden later by `pro-hide` if needed; Figma keeps it).

### 7.3 · `scan` / `scan-error`
**Figma:** Scan E `1:2088`, P `1:3845` · 450×468 · Error B/E/P `1:668 / 1:2120 / 1:3874`
- Live camera frame in lab mode, dashed reticle in glasses mode.
- Strings: "Scannen", "1 / 150", "3SCD80340225", error: "Probeer opnieuw".

### 7.4 · `laden` — Plaatsing in bus
**Figma:** B `1:804` · E `1:2407` · P **absent** (Pro skips this visualisation)
**Strings:** "Geplaatst", "1 / 150", "Keesomstraat 10e", "12 / 40", "B", "1", "3SCD80340225", "Plaatsing in bus", "12 / 40 B", "A", "B"
**Behaviour:** Pro auto-advances `scan → next scan` without a placement screen.

### 7.5 · `route` — Route van vandaag
**Figma:**
- Full list B `1:701` · E `1:2795` · P `1:3906` · sizes 465×715 / 708 / 659
- Compact card B `1:1293` · E `1:2897` · P `1:4480` · sizes 465×355 / 348 / 299
**Strings:** "Route van vandaag", "Te doen" (count), "In de bus" (count), "Gedaan" (count), per-stop "Keesomstraat 10e 1821 BS Alkmaar", "10:00 – 10:30"
**Counts differ per tier in the Figma source** (B+E show 3 todo, P shows 7) — the agent should use *live data* from `mock/deliveries.json`, not the Figma numbers.

### 7.6 · `zoek` — Zoeken in de bus
**Figma:** B `1:1410 / 1:1550 / 1:1480` · E `1:3035 / 1:3104 / 1:3335` · P `1:4710 / 1:4620 / 1:4910`
**Strings:** "Zoeken in de bus", "Keesomstraat 10e", "12 / 40", "B", "1", "3SCD80340225", "zoeken in bus", and a row legend "A / B / C"
**Behaviour:** B shows 2 rows of the legend, E/P show 3 rows. Row of the package is highlighted (additive green).

### 7.7 · `thuis` — Recipient at door
**Figma:** B `1:1640` · E `1:3195` · P `1:4778` · sizes 482×418 / 411 / 362
**Strings:** "Afleveren", "Keesomstraat 10e", "1", "3SCD80340225", "Zeg 'volgende stop' om te navigeren" *(B/E only)*, "Ja, thuis", "Niet thuis", "Bezorging bevestigen", "Bevestigen", "Foto", "Handtekening" *(E/P only)*
**Tier differences:**
- B: no "Handtekening" button.
- E: full set + voice hint.
- P: full set, **no voice hint**.
**Focus order on D-pad:** `Ja, thuis` → `Niet thuis` → confirm-method options.

### 7.8 · `bevestigen` — Bezorging bevestigen
**Figma:** B `1:1674` · E `1:3228` · P `1:4808`
**Strings:** "Bezorging bevestigen", "Bevestigen", "Foto", "Handtekening", "Scan opniew" *(yes, the typo is in Figma)*, "Zeg 'volgende stop' om te navigeren" *(B/E)*, "Keesomstraat 10e", "1" *(B)*, "Bevestigd" *(E success state)*
**Note for code agent:** fix the typo to "Scan opnieuw" in code STRINGS; keep a comment that Figma has the misspelling.

### 7.9 · `niet-thuis` — Choice screen
**Figma:** B `1:366` · E `1:2198` · P `1:5191` · all 612×~480
**Strings (all tiers identical):** "Niemand thuis", "Buren" / "Afgeven bij de buren", "Veilige plek" / "Achterlaten op locatie", "PostNL Punt" / "Dichtsbijzeinde locatie", "Later bezorgen"
**Tier differences are visual only:**
- B: full sub-lines visible.
- E: same content, less padding.
- P: only top label per tile, sub-line hidden.
**Implementation:** all three tier blocks share the same HTML; sub-lines carry class `pro-hide` (CSS hides them when `body[data-exp="pro"]`).

### 7.10 · `buren` — Neighbours
**Figma:** B `1:539` · E `1:2365` · P `1:5357`
**Strings:** "Afgeven buren", "Keesomstraat 10e 1821 BS Alkmaar", "Nr. 100" / "Linker buren", "Nr. 104" / "Rechter buren", "Bevestigen", and for E only "Geplaatst", "1 / 150", "Keesomstraat 10e", "12 / 40" (post-confirm summary state)
**Behaviour:** ← / → picks left vs right neighbour, Enter confirms → `bevestigen`.

### 7.11 · `veiligeplek` — Safe place
**Figma:** B `1:436` · E `1:2266` · P `1:5260`
**Strings:** "Veilige plek", "Keesomstraat 10e 1821 BS Alkmaar", "Voordeur", "Achtertuin", "Fietsenstalling", "Anders...", "Bevestigen", "Postnl punt", "Bruna Alkmaar Centrum"
**Tier:** B+E show voice hint, P does not. All tiers show the same 4 location chips.

### 7.12 · `punt` — PostNL Point
**Figma:** B `1:490` · E `1:2316` · P `1:5309`
**Strings:** "Postnl punt", "Bruna Alkmaar Centrum", "Langestraat 76, Alkmaar", "0.4 km" / "Afstand", "18:00" / "Sluit om", "-3 min" / "Rijden", "Navigeer" *(B+E only — P drops it)*, "Afgeven buren" *(secondary CTA on B+P, not E)*

### 7.13 · `later` — Later bezorgen
**Figma:** B `1:280` · E `1:2153` · P `1:5147`
**Strings:** "Later bezorgen", "Vandaag opnieuw" / "Later vandaag terugkomen", "2e bezorgingpoging" / "Morgen een nieuwe afspraak", "Bevestigen" *(B+E)*, "Niemand thuis" *(E+P secondary)*, voice hint on all tiers.

---

## 8 · Tier system — single source of truth

`body[data-exp]` is the only switch. CSS slots:

| Class on element | Hidden when |
|---|---|
| `.beginner-only`  | `body:not([data-exp="beginner"])` |
| `.pro-hide`       | `body[data-exp="pro"]` |
| `.experienced-only` | `body:not([data-exp="experienced"])` |
| `.pro-only`       | `body:not([data-exp="pro"])` |

Defaults: page boot sets `data-exp="beginner"` so assessors see the richest variant first. Voice command `"menu" → "beginner|ervaren|pro"` switches at runtime (port the existing `setExperience()` from `main.js`). Lab companion panel exposes the same toggle.

---

## 9 · Compliments (beginner only)

Port `showCompliment(key)` from `AGENT_IMPLEMENTATION_PLAN.md` §D. Trigger keys and Dutch strings:

| Trigger | Key | NL string |
|---|---|---|
| package placed in van | `compliment.placed` | "Goed gedaan! Pakket op de juiste plek." |
| all packages loaded   | `compliment.all.loaded` | "Top! Alle pakketten ingeladen. Goed bezig!" |
| right package found   | `compliment.parcel.found` | "Juist pakket gevonden! Lopen maar." |
| delivery confirmed    | `compliment.delivered` | "Bezorging gelukt! Super gedaan." |
| safeplace drop        | `compliment.safeplace` | "Pakket veilig neergelegd. Goed gedaan!" |
| neighbor drop         | `compliment.neighbor` | "Afgeleverd bij de buren. Goed geregeld!" |
| locker drop           | `compliment.locker` | "Pakket bij het PostNL Punt. Prima werk!" |

Banner spec: `position: fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(34,197,94,.92); color:#fff; padding:10px 20px; border-radius:40px; z-index:9999;` Visible 2.5s. Hidden via `display:none` for non-beginner tiers in `tier.css`.

---

## 10 · D-pad input model

```ts
// src/input/dpad.ts (sketch — not full impl)
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':  return focusPrev('horizontal');
    case 'ArrowRight': return focusNext('horizontal');
    case 'ArrowUp':    return focusPrev('vertical');
    case 'ArrowDown':  return focusNext('vertical');
    case 'Enter':      return activate(document.activeElement);
    case 'Escape':     return dismissOverlay();
  }
});
```

Every interactive element on a screen has `class="focusable"` and `tabindex="0"`. Order in DOM == reading order. Group children of a `[data-focus-axis="horizontal"]` container so ←/→ cycle them and ↑/↓ jump to the next group.

---

## 11 · Voice (lab only)

```ts
// src/input/voice.ts (sketch)
if ('webkitSpeechRecognition' in window) {
  const r = new (window as any).webkitSpeechRecognition();
  r.lang = 'nl-NL'; r.continuous = true; r.interimResults = false;
  r.onresult = (e) => emit('voice', e.results[e.results.length-1][0].transcript.toLowerCase().trim());
  r.start();
}
```

Commands honoured (mirror existing `main.js`):

| NL command | Action |
|---|---|
| "start laden" / "start" | KENTEKEN → SCAN |
| "scan" / "volgende" | next package |
| "volgende stop" | LADEN → ROUTE → ZOEK |
| "ja" / "ja thuis" / "thuis" | THUIS → BEVESTIGEN |
| "niet thuis" | THUIS → NIET_THUIS |
| "buren" / "veilige plek" / "punt" / "later" | NIET_THUIS → sub-flow |
| "bevestigen" / "bezorgd" / "klaar" | confirm and advance |
| "menu" | open tier menu |
| "beginner" / "ervaren" / "pro" | switch tier |

Glasses build silently no-ops voice (no mic). Audio prompts still play via pre-recorded `public/audio/*.mp3` triggered by FSM state changes.

---

## 12 · Camera scan (lab only)

```ts
// src/input/camera.ts (sketch)
import { BrowserMultiFormatReader } from '@zxing/browser';
const reader = new BrowserMultiFormatReader();
reader.decodeFromVideoDevice(undefined, '#scan-video', (result) => {
  if (result) emit('scan', result.getText());
});
```

Glasses build: no camera. Replace with a focusable "Confirm scan" button that emits the same `"scan"` event with a mocked id from `deliveries.json`.

---

## 13 · Mock data (drives the whole demo)

`public/mock/deliveries.json` — 3 deliveries, all sharing the Figma sample address so the demo matches the mockups exactly.

```json
[
  {
    "id": "3SCD80340225",
    "address": "Keesomstraat 10e",
    "postcode": "1821 BS",
    "city": "Alkmaar",
    "rowInVan": "B",
    "positionInRow": 1,
    "window": { "from": "10:00", "to": "10:30" }
  },
  { "id": "3SCD80340226", "address": "Langestraat 76", "postcode": "1811 AL", "city": "Alkmaar", "rowInVan": "A", "positionInRow": 3, "window": { "from": "10:45", "to": "11:15" } },
  { "id": "3SCD80340227", "address": "Voltastraat 12", "postcode": "1821 BS", "city": "Alkmaar", "rowInVan": "C", "positionInRow": 2, "window": { "from": "11:30", "to": "12:00" } }
]
```

License plate "AB-123-C", dock "Dock-6", point "Bruna Alkmaar Centrum / Langestraat 76 / 0.4 km / sluit 18:00".

---

## 14 · Visual tokens (additive-safe)

```css
/* src/ui-glasses/tokens.css */
:root {
  --ink-0: #000000;          /* transparent on glasses */
  --ink-1: rgba(0,0,0,.85);  /* card fill — visible on lab, near-transparent on glasses lens */
  --surface: rgba(255,255,255,.08);
  --line: rgba(255,255,255,.18);
  --text: #ffffff;
  --text-mute: rgba(255,255,255,.7);
  --accent: #ff6a00;         /* PostNL orange */
  --ok: #22c55e;
  --warn: #f59e0b;
  --danger: #ef4444;
  --font: 16px/1.35 system-ui, -apple-system, "Segoe UI", sans-serif;
  --radius-pill: 999px;
  --radius-card: 16px;
  --gap-1: 8px; --gap-2: 12px; --gap-3: 16px; --gap-4: 24px;
}
body[data-mode="glasses"] {
  background: #000;          /* transparent on lens */
  width: 600px; height: 600px; margin: 0 auto;
}
body[data-mode="lab"] {
  background: #1a1a1a;
  display: grid; place-items: center; min-height: 100vh;
}
body[data-mode="lab"] #app {
  width: min(620px, 100vw); aspect-ratio: 9 / 16; max-height: 92vh;
}
```

Type scale: `12 / 14 / 16 / 20 / 28`. Min touch / focus target: **44 × 44 px** on lab, **48 × 48 px** on glasses (D-pad focus ring readability).

Focus ring (additive-safe): `outline: 2px solid #ff6a00; outline-offset: 4px;`

---

## 15 · Build & run

```bash
cd Wingmanweb
pnpm install --ignore-scripts
pnpm dev             # http://localhost:5173 — auto lab mode
pnpm dev -- --open /?mode=glasses   # 600² glasses preview in browser
pnpm test            # vitest FSM + tier tests
pnpm build           # static bundle in dist/
```

Mode detection in `main.ts`:
```ts
const mode: Mode =
  new URLSearchParams(location.search).get('mode') === 'glasses' ? 'glasses' :
  /MetaWearable/i.test(navigator.userAgent) ? 'glasses' : 'lab';
document.body.dataset.mode = mode;
```

---

## 16 · Sprint plan (4 × ~20 h, ~80 h total)

| Sprint | Work | Done when |
|---|---|---|
| **S1 · Foundation** | Scaffold via Meta `create-webapp` skill → migrate to layout above. Port FSM, STRINGS, tier system. Build `start`, `kenteken`, `scan`, `route`, default-empty. | `pnpm dev` shows beginner Start screen pixel-close to Figma `1:953`; D-pad navigates Start→Kenteken→Scan. |
| **S2 · Loading + navigation** | `laden`, `zoek`, `thuis`. Mock data wired. Voice in lab. | Full happy-path loadout → route → arrive at door is demoable. |
| **S3 · Exception flow + tiers** | `niet-thuis` + 4 sub-flows + `bevestigen`. Compliments. All 3 tiers visually verified against Figma. | Switching tier hides/shows correct slots on every screen. |
| **S4 · Glasses polish + recording** | 600² layout pass on every screen. Pre-recorded audio prompts. Lab companion panel (mock GPS, tier switch). Screen-capture for assessor. | Same URL passes the §17 checklist in both modes. |

---

## 17 · Acceptance checklist (assessor-ready)

- [ ] `?mode=lab` and `?mode=glasses` both boot to `start`, default tier `beginner`.
- [ ] Every interactive element is a `.focusable` with `tabindex=0` and reachable via D-pad alone.
- [ ] Every screen renders pixel-close to its Figma frame for *its* tier (spot-check 3 random screens per tier).
- [ ] FSM transitions match §6 — no dead states, no orphan screens.
- [ ] Tier switch (`beginner | experienced | pro`) hides/shows the slots listed in §7 for every screen.
- [ ] Compliments fire **only for beginner**, at the 7 moments in §9.
- [ ] In glasses mode, no element has an opaque background covering > 40 % of the 600² viewport (DR principle 5).
- [ ] In lab mode, voice command `"niet thuis"` advances THUIS → NIET_THUIS.
- [ ] In lab mode, camera scan reads a real barcode (use `/Wingman copy/assets/package-label.png` on a second screen).
- [ ] No console errors. No `any` types in `src/core`. No NPM deps beyond §3.
- [ ] `pnpm build` produces a `dist/` < 250 KB total.
- [ ] Screen recording (≤ 90 s) walks one delivery end-to-end in beginner tier, then re-runs the same flow in pro tier.

---

## 18 · Out of scope (be honest with the assessor)

No backend, no real PostNL APIs, no auth, no persistent settings, no accessibility audit, no production deploy, no native iOS/Android wrappers. Camera scan and voice are demo-only on lab; glasses build uses mock scan + pre-recorded audio. The Figma typo "Scan opniew" is corrected in code only — the source design will be updated separately.

---

## 19 · Open questions (decide before S1)

1. Do we get a physical MRBD device, or do we test only in the Chrome DevTools sensors simulator?
2. Should the glasses build run in the Meta toolkit's web view container, or can it ship as a plain static URL the device opens?
3. Is the Figma library going to ship as a Code Connect mapping, or do we copy tokens by hand?
4. Final NL/EN balance — keep Dutch as primary, English fallback only, agreed?
5. Hosting: Azure Static Web Apps (Hypersolid default) or local-only for the demo?

---

*One codebase. Two modes. Four frictions. Three tiers. Nine principles. Code-ready.*

// ── Wingman Webapp · Entry point ──────────────────────────────────────────
// Detects mode (glasses/lab), sets up FSM, mounts router.
// §15 (plan): mode = URL ?mode=glasses | UA MetaWearable | fallback lab.

import '@/ui-glasses/tokens.css';
import '@/ui-glasses/layout.css';
import '@/ui-glasses/route.css';
import '@/ui-glasses/glasses-layout.css';
import '@/ui-glasses/tier.css';
import '@/ui-glasses/confirm.css';
import '@/ui-glasses/locker.css';
import '@/ui-glasses/branches.css';
import '@/ui-glasses/scan-load.css';
import '@/ui-glasses/load-van.css';
import '@/ui-glasses/return.css';
import '@/ui-glasses/complete.css';
import '@/ui-glasses/menu.css';
import '@/ui-lab/frame.css';

import type { Mode, ScreenId, Delivery } from '@/types';
import { initState, getState, transition, markActiveLoaded, allLoaded } from '@/core/state';
import { setTier } from '@/core/tier';
import { on } from '@/core/events';
import { initDpad } from '@/input/dpad';
import { initVoice } from '@/input/voice';
import { initHandMenu } from '@/ui/hand-menu';
import { initGestures } from '@/input/gestures';
import { applyBootParams, logGlassesPreflight } from '@/core/glasses-preflight';
import { runScreenTransition } from '@/core/screen-transition';

// Screen modules
import { mount as mountStart } from '@/screens/start';
import { mount as mountKenteken } from '@/screens/kenteken';
import { mount as mountScan } from '@/screens/scan';
import { mount as mountScanError } from '@/screens/scan-error';
import { mount as mountLaden } from '@/screens/laden';
import { mount as mountRoute } from '@/screens/route';
import { mount as mountZoek } from '@/screens/zoek';
import { mount as mountThuis } from '@/screens/thuis';
import { mount as mountBevestigen } from '@/screens/bevestigen';
import { mount as mountNietThuis } from '@/screens/niet-thuis';
import { mount as mountBuren } from '@/screens/buren';
import { mount as mountVeiligeplek } from '@/screens/veiligeplek';
import { mount as mountPunt } from '@/screens/punt';
import { mount as mountLater } from '@/screens/later';
import { mount as mountReturn } from '@/screens/return';
import { mount as mountComplete } from '@/screens/complete';

// ── Mode detection ─────────────────────────────────────────────────────────

function detectMode(): Mode {
  const param = new URLSearchParams(location.search).get('mode');
  if (param === 'glasses') return 'glasses';
  if (param === 'lab') return 'lab';
  if (/MetaWearable/i.test(navigator.userAgent)) return 'glasses';
  return 'lab';
}

// ── Router ─────────────────────────────────────────────────────────────────

const SCREEN_MOUNTS: Record<ScreenId, (el: HTMLElement) => () => void> = {
  start:        mountStart,
  kenteken:     mountKenteken,
  scan:         mountScan,
  'scan-error': mountScanError,
  laden:        mountLaden,
  route:        mountRoute,
  zoek:         mountZoek,
  thuis:        mountThuis,
  bevestigen:   mountBevestigen,
  'niet-thuis': mountNietThuis,
  buren:        mountBuren,
  veiligeplek:  mountVeiligeplek,
  punt:         mountPunt,
  later:        mountLater,
  return:       mountReturn,
  complete:     mountComplete,
};

let currentUnmount: (() => void) | null = null;

function mountScreen(id: ScreenId, app: HTMLElement): void {
  runScreenTransition(app, mountEl => {
    currentUnmount?.();
    currentUnmount = null;
    mountEl.innerHTML = '';

    const state = getState();
    if (id === 'laden' && state.tier === 'pro') {
      markActiveLoaded();
      requestAnimationFrame(() => transition(allLoaded() ? 'all_loaded' : 'pkg_placed'));
      return null;
    }

    const mountFn = SCREEN_MOUNTS[id];
    if (!mountFn) {
      mountEl.innerHTML = `<div style="padding:2rem;color:red">Unknown screen: ${id}</div>`;
      return null;
    }

    currentUnmount = mountFn(mountEl);
    return currentUnmount;
  });
}

// ── Boot ───────────────────────────────────────────────────────────────────

function removeLegacyComplimentBanner(): void {
  document.querySelectorAll('.compliment-banner').forEach(el => el.remove());
}

async function boot(): Promise<void> {
  removeLegacyComplimentBanner();

  const mode = detectMode();
  document.body.dataset.mode = mode;

  // Load deliveries
  let deliveries: Delivery[] = [];
  try {
    const res = await fetch('/mock/deliveries.json');
    deliveries = (await res.json()) as Delivery[];
  } catch {
    console.warn('Could not load deliveries.json — using empty list');
  }

  // Init state
  initState(mode, 'beginner', deliveries);
  setTier('beginner');
  applyBootParams(mode);
  if (mode === 'glasses') logGlassesPreflight();

  // D-pad always on
  initDpad();
  initHandMenu();
  initGestures();

  initVoice();

  if (mode === 'lab') {
    const { mountCompanion } = await import('@/ui-lab/companion');
    mountCompanion();
  }

  const app = document.getElementById('app');
  if (!app) throw new Error('#app element not found');

  // Initial screen
  mountScreen(getState().screen, app);

  // Subscribe to FSM state changes
  on('state_change', ({ to }) => {
    mountScreen(to, app);
  });
}

boot().catch(err => {
  console.error('Wingman boot failed:', err);
});

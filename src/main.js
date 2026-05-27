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
import '@/ui-glasses/niet-thuis.css';
import '@/ui-glasses/later.css';
import '@/ui-glasses/buren.css';
import '@/ui-glasses/scan-load.css';
import '@/ui-glasses/load-van.css';
import '@/ui-glasses/zoek-found.css';
import '@/ui-glasses/return.css';
import '@/ui-glasses/complete.css';
import '@/ui-glasses/menu.css';
import '@/ui-glasses/menu-custom.css';
import '@/ui-glasses/drive.css';
import '@/ui-glasses/walk-hud.css';
import '@/ui-lab/frame.css';
import { initState, getState, transition, markActiveLoaded, allLoaded } from '@/core/state';
import { setTier } from '@/core/tier';
import { on } from '@/core/events';
import { initDpad } from '@/input/dpad';
import { initVoice } from '@/input/voice';
import { initHandMenu } from '@/ui/hand-menu';
import { initGestures } from '@/input/gestures';
import { initVolumeGesture } from '@/input/volume-gesture';
import { applyBootParams, logGlassesPreflight } from '@/core/glasses-preflight';
import { applyMrbdDocument } from '@/core/mrbd';
import { runScreenTransition } from '@/core/screen-transition';
import { initWorldMap, syncWorldMapForScreen } from '@/ui/world-map';
// Screen modules
import { mount as mountStart } from '@/screens/start';
import { mount as mountKenteken } from '@/screens/kenteken';
import { mount as mountScan } from '@/screens/scan';
import { mount as mountScanError } from '@/screens/scan-error';
import { mount as mountLaden } from '@/screens/laden';
import { mount as mountRoute } from '@/screens/route';
import { mount as mountDrive } from '@/screens/drive';
import { mount as mountZoek } from '@/screens/zoek';
import { mount as mountWalk } from '@/screens/walk';
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
function detectMode() {
    const param = new URLSearchParams(location.search).get('mode');
    if (param === 'glasses')
        return 'glasses';
    if (param === 'lab')
        return 'lab';
    if (/MetaWearable/i.test(navigator.userAgent))
        return 'glasses';
    return 'lab';
}
// ── Router ─────────────────────────────────────────────────────────────────
const SCREEN_MOUNTS = {
    start: mountStart,
    kenteken: mountKenteken,
    scan: mountScan,
    'scan-error': mountScanError,
    laden: mountLaden,
    route: mountRoute,
    drive: mountDrive,
    zoek: mountZoek,
    walk: mountWalk,
    thuis: mountThuis,
    bevestigen: mountBevestigen,
    'niet-thuis': mountNietThuis,
    buren: mountBuren,
    veiligeplek: mountVeiligeplek,
    punt: mountPunt,
    later: mountLater,
    return: mountReturn,
    complete: mountComplete,
};
let currentUnmount = null;
function mountScreen(id, app) {
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
function removeLegacyComplimentBanner() {
    document.querySelectorAll('.compliment-banner').forEach(el => el.remove());
}
async function boot() {
    removeLegacyComplimentBanner();
    const mode = detectMode();
    applyMrbdDocument(mode);
    document.body.dataset.mode = mode;
    // Load deliveries
    let deliveries = [];
    try {
        const res = await fetch('/mock/deliveries.json');
        deliveries = (await res.json());
    }
    catch {
        console.warn('Could not load deliveries.json — using empty list');
    }
    // Init state
    initState(mode, 'beginner', deliveries);
    setTier('beginner');
    applyBootParams(mode);
    if (mode === 'glasses')
        logGlassesPreflight();
    // D-pad always on
    initDpad();
    initGestures();
    initVolumeGesture();
    initVoice();
    const app = document.getElementById('app');
    if (!app)
        throw new Error('#app element not found');
    initWorldMap();
    syncWorldMapForScreen(getState().screen);
    document.body.dataset.screen = getState().screen;
    // Initial screen (creates .screen-stage before hand menu)
    mountScreen(getState().screen, app);
    initHandMenu();
    // Subscribe to FSM state changes
    on('state_change', ({ to }) => {
        document.body.dataset.screen = to;
        syncWorldMapForScreen(to);
        mountScreen(to, app);
    });
}
boot().catch(err => {
    console.error('Wingman boot failed:', err);
});

// Live navigation between stops — geolocation + audio cues for drive / walk phases.
import { clearWatch, distanceMeters, formatDistanceM, getCurrentFix, isGeolocationSupported, logGeoFix, watchFix, } from './geolocation';
import { speakTierPhrase } from './audio';
import { updateWorldMapPosition } from '@/ui/world-map';
export const DRIVE_PARK_RADIUS_M = 120;
export const WALK_APPROACH_RADIUS_M = 45;
export const WALK_ARRIVAL_RADIUS_M = 15;
const DRIVE_FALLBACK_MS = 13000;
const WALK_FALLBACK_APPROACH_MS = 4000;
const WALK_FALLBACK_ARRIVAL_MS = 9000;
export function deliveryToDestination(d) {
    if (!d?.latitude || !d?.longitude)
        return null;
    return {
        latitude: d.latitude,
        longitude: d.longitude,
        label: `${d.address}, ${d.city}`.trim(),
    };
}
let activeWatchId = -1;
let activeFallbackTimers = [];
function clearNavigationSession() {
    clearWatch(activeWatchId);
    activeWatchId = -1;
    activeFallbackTimers.forEach(clearTimeout);
    activeFallbackTimers = [];
}
function scheduleFallback(fn, ms) {
    activeFallbackTimers.push(setTimeout(fn, ms));
}
/** No-op — drive/walk demo does not request device location (MRBD / prototype). */
export async function ensureGeoReady() {
    return false;
}
/** Drive phase: timed advance only (no GPS — audiobegeleiding is audio-only on MRBD). */
export function startDriveNavigation(opts) {
    clearNavigationSession();
    let announcedNear = false;
    const finish = () => {
        if (announcedNear)
            return;
        announcedNear = true;
        clearNavigationSession();
        opts.onNearDestination();
    };
    scheduleFallback(finish, DRIVE_FALLBACK_MS);
    return clearNavigationSession;
}
/** Walk phase: minimap distance + approaching / arrival audio from GPS. */
export function startWalkNavigation(opts) {
    clearNavigationSession();
    const dest = opts.destination;
    let phase = 'enroute';
    speakTierPhrase('walk.start');
    const applyDistance = (meters) => {
        opts.onDistance(formatDistanceM(meters), meters);
        if (phase === 'enroute' && meters <= WALK_APPROACH_RADIUS_M) {
            phase = 'approaching';
            speakTierPhrase('walk.approaching');
            opts.onApproaching();
        }
        if (phase !== 'arrived' && meters <= WALK_ARRIVAL_RADIUS_M) {
            phase = 'arrived';
            speakTierPhrase('walk.arrival');
            opts.onArrived();
        }
    };
    const checkFix = (fix) => {
        logGeoFix(fix, 'Walk');
        updateWorldMapPosition(fix.latitude, fix.longitude, fix.heading);
        applyDistance(distanceMeters(fix, dest));
    };
    if (isGeolocationSupported()) {
        activeWatchId = watchFix(checkFix, (code, message) => console.warn('[Wingman walk geo]', code, message));
        void getCurrentFix().then(checkFix).catch(() => { });
    }
    else {
        opts.onDistance('120 m', 120);
    }
    scheduleFallback(() => {
        if (phase === 'enroute') {
            phase = 'approaching';
            speakTierPhrase('walk.approaching');
            opts.onApproaching();
            opts.onDistance('45 m', 45);
        }
    }, WALK_FALLBACK_APPROACH_MS);
    scheduleFallback(() => {
        if (phase !== 'arrived') {
            phase = 'arrived';
            speakTierPhrase('walk.arrival');
            opts.onArrived();
            opts.onDistance(formatDistanceM(0), 0);
        }
    }, WALK_FALLBACK_ARRIVAL_MS);
    return clearNavigationSession;
}
export function stopNavigation() {
    clearNavigationSession();
}

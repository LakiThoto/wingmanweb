// Live navigation between stops — geolocation + audio cues for drive / walk phases.

import {
  clearWatch,
  distanceMeters,
  formatDistanceM,
  getCurrentFix,
  isGeolocationSupported,
  logGeoFix,
  watchFix,
  type GeoFix,
  type GeoPoint,
} from './geolocation';
import { speakTierPhrase } from './audio';
import { updateWorldMapPosition } from '@/ui/world-map';
import type { Delivery } from '@/types';

export const DRIVE_PARK_RADIUS_M = 120;
export const WALK_APPROACH_RADIUS_M = 45;
export const WALK_ARRIVAL_RADIUS_M = 15;

const DRIVE_FALLBACK_MS = 13_000;
const WALK_FALLBACK_APPROACH_MS = 4000;
const WALK_FALLBACK_ARRIVAL_MS = 9000;

export interface MapDestination extends GeoPoint {
  label: string;
}

export function deliveryToDestination(d: Delivery | undefined): MapDestination | null {
  if (!d?.latitude || !d?.longitude) return null;
  return {
    latitude: d.latitude,
    longitude: d.longitude,
    label: `${d.address}, ${d.city}`.trim(),
  };
}

let activeWatchId = -1;
let activeFallbackTimers: ReturnType<typeof setTimeout>[] = [];

function clearNavigationSession(): void {
  clearWatch(activeWatchId);
  activeWatchId = -1;
  activeFallbackTimers.forEach(clearTimeout);
  activeFallbackTimers = [];
}

function scheduleFallback(fn: () => void, ms: number): void {
  activeFallbackTimers.push(setTimeout(fn, ms));
}

/** Request permission via user gesture before route_start (MRBD requirement). */
export async function ensureGeoReady(): Promise<boolean> {
  if (!isGeolocationSupported()) return false;
  try {
    const fix = await getCurrentFix();
    logGeoFix(fix, 'Wingman geo (permission OK)');
    updateWorldMapPosition(fix.latitude, fix.longitude, fix.heading);
    return true;
  } catch (err) {
    console.warn('[Wingman geo] permission or fix failed', err);
    return false;
  }
}

/** Drive phase: watch until within parking radius (audio handled by drive screen). */
export function startDriveNavigation(opts: {
  destination: MapDestination;
  onNearDestination: () => void;
}): () => void {
  clearNavigationSession();
  const dest = opts.destination;
  let announcedNear = false;

  const checkFix = (fix: GeoFix) => {
    logGeoFix(fix, 'Drive');
    updateWorldMapPosition(fix.latitude, fix.longitude, fix.heading);
    const dist = distanceMeters(fix, dest);
    if (!announcedNear && dist <= DRIVE_PARK_RADIUS_M) {
      announcedNear = true;
      clearNavigationSession();
      opts.onNearDestination();
    }
  };

  if (isGeolocationSupported()) {
    activeWatchId = watchFix(checkFix, (code, message) =>
      console.warn('[Wingman drive geo]', code, message),
    );
    void getCurrentFix().then(checkFix).catch(() => {});
  }

  scheduleFallback(() => {
    if (!announcedNear) {
      announcedNear = true;
      opts.onNearDestination();
    }
  }, DRIVE_FALLBACK_MS);

  return clearNavigationSession;
}

/** Walk phase: minimap distance + approaching / arrival audio from GPS. */
export function startWalkNavigation(opts: {
  destination: MapDestination;
  onDistance: (formatted: string, meters: number) => void;
  onApproaching: () => void;
  onArrived: () => void;
}): () => void {
  clearNavigationSession();
  const dest = opts.destination;
  let phase: 'enroute' | 'approaching' | 'arrived' = 'enroute';

  speakTierPhrase('walk.start');

  const applyDistance = (meters: number) => {
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

  const checkFix = (fix: GeoFix) => {
    logGeoFix(fix, 'Walk');
    updateWorldMapPosition(fix.latitude, fix.longitude, fix.heading);
    applyDistance(distanceMeters(fix, dest));
  };

  if (isGeolocationSupported()) {
    activeWatchId = watchFix(checkFix, (code, message) =>
      console.warn('[Wingman walk geo]', code, message),
    );
    void getCurrentFix().then(checkFix).catch(() => {});
  } else {
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

export function stopNavigation(): void {
  clearNavigationSession();
}

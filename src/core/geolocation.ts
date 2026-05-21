// MRBD geolocation — navigator.geolocation from paired phone.

export const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5000,
};

const EARTH_RADIUS_M = 6_371_000;

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoFix extends GeoPoint {
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

/** Great-circle distance in meters. */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceM(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '—';
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.max(0, Math.round(meters))} m`;
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

function positionToFix(position: GeolocationPosition): GeoFix {
  const { coords, timestamp } = position;
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    speed: coords.speed,
    heading: coords.heading,
    timestamp,
  };
}

export function getCurrentFix(options: PositionOptions = GEO_OPTIONS): Promise<GeoFix> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      p => resolve(positionToFix(p)),
      err => reject(err),
      options,
    );
  });
}

export function watchFix(
  onFix: (fix: GeoFix) => void,
  onError: (code: number, message: string) => void,
  options: PositionOptions = GEO_OPTIONS,
): number {
  if (!isGeolocationSupported()) return -1;
  return navigator.geolocation.watchPosition(
    p => onFix(positionToFix(p)),
    err => onError(err.code, err.message),
    options,
  );
}

export function clearWatch(watchId: number): void {
  if (watchId >= 0 && isGeolocationSupported()) {
    navigator.geolocation.clearWatch(watchId);
  }
}

export function logGeoFix(fix: GeoFix, label = 'Geolocation'): void {
  console.info(
    `[${label}] lat=${fix.latitude.toFixed(5)} lon=${fix.longitude.toFixed(5)} ` +
      `accuracy=${fix.accuracy.toFixed(0)}m speed=${fix.speed ?? '—'} heading=${fix.heading ?? '—'}`,
  );
}

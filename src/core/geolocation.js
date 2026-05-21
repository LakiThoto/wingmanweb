// MRBD geolocation — navigator.geolocation from paired phone.
export const GEO_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000,
};
const EARTH_RADIUS_M = 6371000;
/** Great-circle distance in meters. */
export function distanceMeters(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function formatDistanceM(meters) {
    if (!Number.isFinite(meters) || meters < 0)
        return '—';
    if (meters >= 1000)
        return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.max(0, Math.round(meters))} m`;
}
export function isGeolocationSupported() {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}
function positionToFix(position) {
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
export function getCurrentFix(options = GEO_OPTIONS) {
    return new Promise((resolve, reject) => {
        if (!isGeolocationSupported()) {
            reject(new Error('Geolocation unavailable'));
            return;
        }
        navigator.geolocation.getCurrentPosition(p => resolve(positionToFix(p)), err => reject(err), options);
    });
}
export function watchFix(onFix, onError, options = GEO_OPTIONS) {
    if (!isGeolocationSupported())
        return -1;
    return navigator.geolocation.watchPosition(p => onFix(positionToFix(p)), err => onError(err.code, err.message), options);
}
export function clearWatch(watchId) {
    if (watchId >= 0 && isGeolocationSupported()) {
        navigator.geolocation.clearWatch(watchId);
    }
}
export function logGeoFix(fix, label = 'Geolocation') {
    console.info(`[${label}] lat=${fix.latitude.toFixed(5)} lon=${fix.longitude.toFixed(5)} ` +
        `accuracy=${fix.accuracy.toFixed(0)}m speed=${fix.speed ?? '—'} heading=${fix.heading ?? '—'}`);
}

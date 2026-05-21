// World map layer — disabled; walk/drive use inline Figma map art (no full-screen background).
/** Keep normal app background on all screens — no global map layer. */
export function syncWorldMapForScreen(_screen) {
    setWorldMapMode('hidden');
}
export function setWorldMapMode(mode) {
    document.body.dataset.mapMode = mode;
    const el = document.getElementById('world-map');
    if (el)
        el.dataset.mode = mode;
}
export function initWorldMap() {
    if (document.getElementById('world-map'))
        return;
    const map = document.createElement('div');
    map.id = 'world-map';
    map.className = 'world-map-layer';
    map.setAttribute('aria-hidden', 'true');
    map.dataset.mode = 'hidden';
    document.body.prepend(map);
}
/** No-op — GPS hooks retained for future use without changing the viewport background. */
export function updateWorldMapPosition(_lat, _lon, _heading) { }
export function setDestinationOnMap(_lat, _lon) { }

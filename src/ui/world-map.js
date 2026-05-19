// World map layer — static map chrome (Mapbox-free) for drive / zoek / walk phases.
const AMBIENT_SCREENS = new Set([
    'route',
    'zoek',
    'walk',
    'thuis',
    'bevestigen',
    'niet-thuis',
    'return',
]);
export function syncWorldMapForScreen(screen) {
    if (screen === 'drive')
        setWorldMapMode('drive');
    else if (screen === 'walk')
        setWorldMapMode('walk');
    else if (AMBIENT_SCREENS.has(screen))
        setWorldMapMode('ambient');
    else
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
    map.innerHTML = `
    <div class="world-map-canvas">
      <div class="world-map-grid"></div>
      <div class="world-map-route"></div>
      <div class="world-map-dest-pin" aria-hidden="true"></div>
    </div>
  `;
    document.body.prepend(map);
}

const MRBD_VIEWPORT = 'width=600, height=600, initial-scale=1.0, user-scalable=no';
const LAB_VIEWPORT = 'width=device-width, initial-scale=1.0';
/** Call before first paint (inline in index.html) or at boot. */
export function applyMrbdDocument(mode) {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
        meta.setAttribute('content', mode === 'glasses' ? MRBD_VIEWPORT : LAB_VIEWPORT);
    }
    document.documentElement.classList.toggle('mrbd', mode === 'glasses');
    document.documentElement.dataset.mrbd = mode === 'glasses' ? '1' : '0';
}
/** Detect mode without importing full app (for inline boot script). */
export function detectModeFromLocation() {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'glasses')
        return 'glasses';
    if (params.get('mode') === 'lab')
        return 'lab';
    if (/MetaWearable/i.test(navigator.userAgent))
        return 'glasses';
    return 'lab';
}

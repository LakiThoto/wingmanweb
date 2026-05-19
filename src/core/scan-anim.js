// Load/scan phase animations — port of WingmanCopy resetLoadScanStatus + beam sweep.
export const SCAN_STATUS_REVEAL_MS = 3000;
export function restartScanBeamAnim(beam) {
    if (!beam)
        return;
    beam.style.animation = 'none';
    void beam.offsetHeight;
    beam.style.animation = '';
}
export function setScanStatusRevealed(previewBlock, revealed) {
    previewBlock?.classList.toggle('is-status-revealed', revealed);
    const shell = previewBlock?.querySelector('.load-status-reveal-shell');
    shell?.setAttribute('aria-hidden', revealed ? 'false' : 'true');
}
/** Beam-only dwell, then staggered status row reveal (Copy LOAD_SCAN_STATUS_REVEAL_MS). */
export function startScanStatusReveal(previewBlock, onRevealed) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
        setScanStatusRevealed(previewBlock, true);
        const id = window.setTimeout(() => onRevealed?.(), 400);
        return () => clearTimeout(id);
    }
    setScanStatusRevealed(previewBlock, false);
    const id = window.setTimeout(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setScanStatusRevealed(previewBlock, true);
                onRevealed?.();
            });
        });
    }, SCAN_STATUS_REVEAL_MS);
    return () => clearTimeout(id);
}

// Screen: scan — package barcode scanning
// Figma 1:637 · beam + package preview in frame
import { focusScreen, buildPrimaryCta } from './_frame';
import { iconImg, loadVoiceMicPill } from '@/ui/icons';
import { transition, getState, setScanBuffer, getActiveDelivery } from '@/core/state';
import { on } from '@/core/events';
import { startCamera } from '@/input/camera';
import { t } from '@/core/strings';
import { restartScanBeamAnim, startScanStatusReveal, } from '@/core/scan-anim';
const SCAN_PACKAGE_IMG = '/assets/scan/package-label.png';
/** Figma 1:647 — package label in frame; lab keeps hidden video for ZXing. */
function buildScanFrameMarkup(mode) {
    const captureVideo = mode === 'lab'
        ? `<video id="scan-video" class="scan-video-in-frame scan-video--capture" autoplay muted playsinline aria-hidden="true"></video>`
        : '';
    return `${captureVideo}<img class="load-package-preview" src="${SCAN_PACKAGE_IMG}" alt="" decoding="async" aria-hidden="true" />`;
}
export function mount(container) {
    const state = getState();
    const { mode } = state;
    const delivery = getActiveDelivery();
    const packageCode = delivery?.id ?? t('scan.package_code');
    const loadedCount = state.deliveries.filter(d => d.loaded).length;
    const counter = state.deliveries.length
        ? `${loadedCount + 1} / ${state.deliveries.length}`
        : t('scan.count');
    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="screen-chip-row">
      <div class="screen-chip"><img class="chip-icon" src="/assets/icons/load-scan-barcode-icon.svg" alt="" /> ${t('scan.title')}</div>
      <span class="chip-counter">${counter}</span>
    </div>

    <div id="scan-preview-block" class="load-scan-preview-block">
      <div class="load-camera-frame">
        ${buildScanFrameMarkup(mode)}
        <div class="load-scan-beam-anim" id="scan-beam" aria-hidden="true"></div>
      </div>
      <div class="load-status-reveal-shell" aria-hidden="true">
        <div class="load-status-row load-status-row--phase-scan">
          <div class="load-status-group">
            <span class="load-status-label">${t('scan.status.label')}</span>
            <span class="load-status-dot load-status-dot--ok" aria-hidden="true"></span>
          </div>
          <div class="load-scan-id-group" aria-live="polite">
            ${iconImg('load-scan-barcode-icon', 'load-scan-id-icon', 24)}
            <span class="load-scan-id-code" id="scan-code">${packageCode}</span>
          </div>
        </div>
      </div>
      <div class="load-voice-row pro-hide">
        ${loadVoiceMicPill()}
        <span class="load-voice-text">${t('scan.voice.hint')}</span>
      </div>
    </div>
  </div>

  <div class="cta-layer">
    ${buildPrimaryCta(t('scan.title'), { id: 'btn-scan-ok' })}
    <button class="sr-only-hidden" id="btn-scan-fail" type="button" tabindex="-1" aria-hidden="true"></button>
  </div>
</div>`;
    const previewBlock = container.querySelector('#scan-preview-block');
    const beam = container.querySelector('#scan-beam');
    restartScanBeamAnim(beam);
    const cancelReveal = startScanStatusReveal(previewBlock);
    let stopCamera = null;
    const cleanupScanEvent = on('scan', ({ code }) => {
        const codeEl = container.querySelector('#scan-code');
        if (codeEl)
            codeEl.textContent = code;
        setScanBuffer(code);
        transition('scan_ok');
    });
    if (mode === 'lab') {
        const videoEl = container.querySelector('#scan-video');
        if (videoEl) {
            startCamera(videoEl).then(stop => { stopCamera = stop; });
        }
    }
    function confirmScan() {
        setScanBuffer(delivery?.id ?? packageCode);
        transition('scan_ok');
    }
    container.querySelector('#btn-scan-ok')?.addEventListener('click', confirmScan);
    container.querySelector('#btn-scan-fail')?.addEventListener('click', () => {
        transition('scan_fail');
    });
    focusScreen(container);
    return () => {
        cancelReveal();
        cleanupScanEvent();
        stopCamera?.();
    };
}

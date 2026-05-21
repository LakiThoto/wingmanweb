// Screen: scan — package barcode scanning
// Figma 1:637 · beam + package preview in frame

import { focusScreen, buildPrimaryCta, buildLoadCameraFrameDecor } from './_frame';
import { iconImg, loadVoiceMicPill } from '@/ui/icons';
import { transition, getState, setScanBuffer, getActiveDelivery } from '@/core/state';
import { on } from '@/core/events';
import { startCamera } from '@/input/camera';
import { acquireCameraStream, bindCameraPreview } from '@/input/photo-capture';
import { t } from '@/core/strings';
import {
  restartScanBeamAnim,
  startScanStatusReveal,
} from '@/core/scan-anim';

const SCAN_PACKAGE_IMG = '/assets/scan/package-label.png';

/** Figma 63:453 — scanner frame; live camera + decor; package preview on reveal. */
function buildScanFrameMarkup(): string {
  return `
    <video id="scan-video" class="scan-video-in-frame" autoplay muted playsinline aria-hidden="true"></video>
    ${buildLoadCameraFrameDecor()}
    <img
      class="load-package-preview"
      src="${SCAN_PACKAGE_IMG}"
      alt=""
      decoding="async"
      aria-hidden="true"
    />`.trim();
}

export function mount(container: HTMLElement): () => void {
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
      <header class="screen-chip"><img class="chip-icon" src="/assets/icons/load-scan-barcode-icon.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" /><span class="screen-chip-label">${t('scan.title')}</span></header>
      <span class="chip-counter">${counter}</span>
    </div>

    <div id="scan-preview-block" class="load-scan-preview-block">
      <div class="load-camera-frame">
        ${buildScanFrameMarkup()}
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

  const previewBlock = container.querySelector<HTMLElement>('#scan-preview-block');
  const beam = container.querySelector<HTMLElement>('#scan-beam');
  restartScanBeamAnim(beam);
  const cancelReveal = startScanStatusReveal(previewBlock);

  let stopCamera: (() => void) | null = null;
  const cleanupScanEvent = on('scan', ({ code }) => {
    const codeEl = container.querySelector('#scan-code');
    if (codeEl) codeEl.textContent = code;
    setScanBuffer(code);
    transition('scan_ok');
  });

  const videoEl = container.querySelector<HTMLVideoElement>('#scan-video');
  if (videoEl) {
    if (mode === 'lab') {
      startCamera(videoEl).then(stop => { stopCamera = stop; });
    } else {
      acquireCameraStream()
        .then(async stream => {
          await bindCameraPreview(videoEl, stream);
          stopCamera = () => {
            stream.getTracks().forEach(track => track.stop());
            videoEl.srcObject = null;
          };
        })
        .catch(() => { /* no camera — frame stays transparent with decor only */ });
    }
  }

  function confirmScan(): void {
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

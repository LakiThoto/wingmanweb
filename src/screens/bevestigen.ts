// Screen: bevestigen — Bezorging bevestigen (multi-phase)
// Figma grid B 1:1674 · summary 1:1717 · photo 1:325 · sign 1:1751 · rescan 1:350 · delivered 1:584

import { focusScreen, buildPrimaryCta } from './_frame';
import { playPhaseEnter } from '@/core/screen-transition';
import { getActiveDelivery, getState, markActiveDelivered } from '@/core/state';
import { restartScanBeamAnim } from '@/core/scan-anim';
import { startCamera } from '@/input/camera';
import { completeDelivery } from '@/core/delivery-complete';
import { getTier } from '@/core/tier';
import { speakByTier } from '@/core/audio';
import { showCompliment } from '@/screens/compliment';
import { t } from '@/core/strings';
import {
  acquireCameraStream,
  bindCameraPreview,
  captureVideoFrame,
  stopCameraStream,
} from '@/input/photo-capture';
import { iconImg, confirmThumbHint, loadVoiceMicPill } from '@/ui/icons';
import { createSignaturePad } from '@/ui/signature-pad';

type ConfirmPhase =
  | 'grid'
  | 'summary'
  | 'photo-capture'
  | 'photo-result'
  | 'sign'
  | 'rescan'
  | 'delivered';

const AUTO_CAPTURE_MS = 1500;
const DELIVERED_DWELL_MS = 3000;
/** After photo proof overlay — skip Figma 1:584 delivered card (proof is the confirmation). */
const PHOTO_CONFIRM_DWELL_MS = 2500;
const MOCK_PHOTO = '/assets/confirm/photo-proof-default.jpg';

function photoResultMarkup(hidden: boolean): string {
  return `
    <div class="screen-card cf-card cf-phase-card cf-photo-card${hidden ? ' cf-hidden' : ''}" id="confirm-photo-card">
      <div class="cf-card-body cf-photo-result-body">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          <img src="/assets/confirm/photo-title-icon.svg" width="20" height="20" alt="" class="cf-badge-icon" aria-hidden="true" decoding="async" />
          <span class="cf-badge-label">${t('bevestigen.title')}</span>
        </header>
        <div class="cf-photo-proof photo-result-zone" id="photo-result-zone">
          <img id="photo-result" src="" alt="Bewijsfoto" decoding="async" />
          <div class="cf-photo-proof-overlay photo-success-overlay" aria-hidden="true">
            <div class="cf-delivered-check">
              <img src="/assets/confirm/photo-success-check.svg" width="20" height="20" alt="" decoding="async" />
            </div>
            <p class="cf-photo-proof-label">${t('confirm.photo.confirmed')}</p>
          </div>
        </div>
      </div>
    </div>`;
}

function deliveredMarkup(hidden: boolean, address: string, code: string, pkgCount: string): string {
  return `
    <div class="screen-card cf-card cf-phase-card cf-delivered-card${hidden ? ' cf-hidden' : ''}" id="confirm-delivered-card">
      <div class="cf-card-body cf-branch-inner cf-delivered-body">
        <header class="cf-badge cf-badge--grid">
          <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" class="cf-badge-icon" aria-hidden="true" />
          <span class="cf-badge-label">${t('bevestigen.title')}</span>
        </header>
        <div class="cf-delivered-tile">
          <div class="cf-delivered-tile-top">
            <div class="cf-delivered-status">
              <div class="cf-delivered-check" aria-hidden="true">
                <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" />
              </div>
              <span class="cf-delivered-status-label">${t('bevestigen.success')}</span>
            </div>
            <p class="cf-delivered-address" id="cf-delivered-address">${address}</p>
          </div>
          <div class="cf-meta-row">
            <div class="cf-meta-group">
              <img src="/assets/confirm/parcel-arrow.svg" width="24" height="24" alt="" class="cf-meta-img cf-meta-img--deliver" aria-hidden="true" />
              <span class="cf-pkg-count" id="cf-delivered-pkg-count">${pkgCount}</span>
            </div>
            <div class="cf-meta-group cf-meta-group--code">
              <img src="/assets/confirm/barcode.svg" width="24" height="24" alt="" class="cf-meta-img" aria-hidden="true" />
              <span class="cf-tracking" id="cf-delivered-tracking">${code}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="cta-layer cf-delivered-cta-layer${hidden ? ' cf-hidden' : ''}" id="confirm-delivered-cta">
      ${buildPrimaryCta(t('bevestigen.success'), { className: 'cf-delivered-cta-static', ariaLabel: t('bevestigen.success') })}
    </div>`;
}

function buildRescanCameraMarkup(): string {
  if (getState().mode === 'lab') {
    return `<video id="rescan-video" class="scan-video-in-frame" autoplay muted playsinline></video>`;
  }
  return `<img class="load-camera-img" src="/assets/confirm/rescan-preview.png" alt="" aria-hidden="true" />`;
}

export function mount(container: HTMLElement): () => void {
  let phase: ConfirmPhase = 'grid';
  let hasRendered = false;
  let rescanTimer: ReturnType<typeof setTimeout> | null = null;
  let autoCaptureTimer: ReturnType<typeof setTimeout> | null = null;
  let deliveredTimer: ReturnType<typeof setTimeout> | null = null;
  let photoConfirmTimer: ReturnType<typeof setTimeout> | null = null;
  let photoStream: MediaStream | null = null;
  let stopRescanCamera: (() => void) | null = null;
  let rescanVerified = false;
  let pendingPhotoSrc: string | null = null;
  const signaturePad = createSignaturePad();

  const bootPhase = new URLSearchParams(location.search).get('confirmPhase');
  if (
    bootPhase === 'summary' ||
    bootPhase === 'photo-capture' ||
    bootPhase === 'photo-result' ||
    bootPhase === 'sign' ||
    bootPhase === 'rescan' ||
    bootPhase === 'delivered'
  ) {
    phase = bootPhase;
  }

  function cleanup(): void {
    if (rescanTimer) clearTimeout(rescanTimer);
    if (autoCaptureTimer) clearTimeout(autoCaptureTimer);
    if (deliveredTimer) clearTimeout(deliveredTimer);
    if (photoConfirmTimer) clearTimeout(photoConfirmTimer);
    stopCameraStream(photoStream);
    photoStream = null;
    stopRescanCamera?.();
    stopRescanCamera = null;
    signaturePad.destroy();
  }

  function clearDeliveredTimer(): void {
    if (deliveredTimer) {
      clearTimeout(deliveredTimer);
      deliveredTimer = null;
    }
  }

  function finishAfterDeliveredDwell(): void {
    clearDeliveredTimer();
    if (phase !== 'delivered') return;
    completeDelivery({ method: 'home', markDelivered: false, skipAcknowledgement: true });
  }

  function clearPhotoConfirmTimer(): void {
    if (photoConfirmTimer) {
      clearTimeout(photoConfirmTimer);
      photoConfirmTimer = null;
    }
  }

  /** Summary CTA — tile already matches delivered card (Figma 1:1717); skip 1:584 dwell. */
  function confirmFromSummary(): void {
    clearDeliveredTimer();
    clearPhotoConfirmTimer();
    stopCameraStream(photoStream);
    photoStream = null;
    completeDelivery({ method: 'home' });
  }

  /** Photo proof (Figma 1:326) is the confirmation — advance without 1:584 delivered card. */
  function confirmFromPhoto(): void {
    clearPhotoConfirmTimer();
    clearDeliveredTimer();
    stopCameraStream(photoStream);
    photoStream = null;
    if (phase !== 'photo-result') return;
    completeDelivery({ method: 'home' });
  }

  /** Handtekening / scan opnieuw — show delivered card (Figma 1:584) then advance. */
  function requestConfirm(): void {
    clearPhotoConfirmTimer();
    clearDeliveredTimer();
    stopCameraStream(photoStream);
    photoStream = null;
    markActiveDelivered();

    const tier = getTier();
    if (tier === 'beginner') {
      setTimeout(() => showCompliment('compliment.delivered'), 380);
    } else {
      setTimeout(() => speakByTier('feedback.delivery.ok'), 380);
    }

    phase = 'delivered';
    render();
    deliveredTimer = setTimeout(finishAfterDeliveredDwell, DELIVERED_DWELL_MS);
  }

  function showPhase(next: ConfirmPhase): void {
    if (next !== 'photo-result') clearPhotoConfirmTimer();
    phase = next;
    if (next === 'rescan') rescanVerified = false;
    render();
  }

  function meta(): { address: string; code: string; pkgCount: string } {
    const d = getActiveDelivery();
    return {
      address: d?.address ?? t('bevestigen.address'),
      code: d?.id ?? t('kenteken.package_code'),
      pkgCount: '1',
    };
  }

  async function startPhotoCapture(): Promise<void> {
    phase = 'photo-capture';
    render();
    await beginPhotoCamera();
  }

  async function beginPhotoCamera(): Promise<void> {
    const vid = container.querySelector<HTMLVideoElement>('#photo-video');
    if (!vid) return;

    try {
      photoStream = await acquireCameraStream();
      await bindCameraPreview(vid, photoStream);
      autoCaptureTimer = setTimeout(() => capturePhoto(false), AUTO_CAPTURE_MS);
    } catch (err) {
      console.warn('[bevestigen] camera unavailable — simulated capture', err);
      autoCaptureTimer = setTimeout(() => capturePhoto(true), 600);
    }
  }

  function capturePhoto(simulated: boolean): void {
    if (autoCaptureTimer) {
      clearTimeout(autoCaptureTimer);
      autoCaptureTimer = null;
    }
    const captureZone = container.querySelector('.photo-capture-zone');
    captureZone?.classList.add('shutter');
    setTimeout(() => captureZone?.classList.remove('shutter'), 120);

    let dataUrl: string | null = null;
    if (!simulated) {
      const vid = container.querySelector<HTMLVideoElement>('#photo-video');
      if (vid) dataUrl = captureVideoFrame(vid);
    }
    stopCameraStream(photoStream);
    photoStream = null;
    showPhotoResult(dataUrl);
  }

  function showPhotoResult(dataUrl: string | null): void {
    phase = 'photo-result';
    pendingPhotoSrc = dataUrl;
    render();
  }

  async function beginRescanCamera(): Promise<void> {
    stopRescanCamera?.();
    stopRescanCamera = null;
    if (getState().mode !== 'lab') return;
    const vid = container.querySelector<HTMLVideoElement>('#rescan-video');
    if (!vid) return;
    try {
      stopRescanCamera = await startCamera(vid);
    } catch (err) {
      console.warn('[bevestigen] rescan camera unavailable', err);
    }
  }

  function startRescanFlow(): void {
    if (rescanTimer) clearTimeout(rescanTimer);
    rescanVerified = false;
    render();
    void beginRescanCamera();
    const beam = container.querySelector<HTMLElement>('#rescan-beam');
    restartScanBeamAnim(beam);
    rescanTimer = setTimeout(() => {
      rescanTimer = null;
      stopRescanCamera?.();
      stopRescanCamera = null;
      rescanVerified = true;
      render();
      focusScreen(container);
    }, 2400);
  }

  function render(): void {
    const { address, code, pkgCount } = meta();
    const isGrid = phase === 'grid';
    const isSummary = phase === 'summary';
    const isPhotoCap = phase === 'photo-capture';
    const isPhotoRes = phase === 'photo-result';
    const isDelivered = phase === 'delivered';
    const isWork = !isGrid && !isPhotoRes && !isDelivered;
    const isSign = phase === 'sign';
    const isRescan = phase === 'rescan';

    container.innerHTML = `
<div class="bevestigen-root" data-phase="${phase}">
  <div class="screen-stack cf-screen-stack">
    <div class="screen-card cf-card cf-grid-card${isGrid ? '' : ' cf-hidden'}">
      <div class="cf-card-body cf-grid-card-body">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" class="cf-badge-icon" aria-hidden="true" />
          <span class="cf-badge-label">${t('bevestigen.title')}</span>
        </header>
        <div class="cf-grid-actions">
          <div class="cf-shortcut-grid confirm-actions-grid" data-focus-axis="horizontal">
            <button type="button" class="focusable confirm-action-btn confirm-action-primary" id="btn-bevestigen-direct" tabindex="0">
              ${iconImg('action-check', 'cf-shortcut-tile__icon ca-icon', 32)}
              <span class="cf-shortcut-tile__label ca-label">${t('btn.bevestigen')}</span>
            </button>
            <button type="button" class="focusable confirm-action-btn" id="btn-foto" tabindex="0">
              ${iconImg('action-photo', 'cf-shortcut-tile__icon ca-icon', 32)}
              <span class="cf-shortcut-tile__label ca-label">${t('btn.foto')}</span>
            </button>
            <button type="button" class="focusable confirm-action-btn" id="btn-handtekening" tabindex="0">
              ${iconImg('action-signature', 'cf-shortcut-tile__icon ca-icon', 32)}
              <span class="cf-shortcut-tile__label ca-label">${t('btn.handtekening')}</span>
            </button>
            <button type="button" class="focusable confirm-action-btn" id="btn-scan-opnieuw" tabindex="0">
              ${iconImg('action-rescan', 'cf-shortcut-tile__icon ca-icon', 32)}
              <span class="cf-shortcut-tile__label ca-label">${t('btn.scan_opnieuw')}</span>
            </button>
          </div>
          <div class="cf-voice-hint cf-voice-hint--grid pro-hide">
            ${confirmThumbHint()}
            <p class="cf-voice-hint-text">
              <span class="cf-voice-dim">${t('confirm.grid.hint_lead')}</span><span class="cf-voice-em">${t('confirm.grid.hint_em')}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="cf-grid-deco${isGrid ? '' : ' cf-hidden'}" aria-hidden="true">
      <img src="/assets/confirm/arrive-ai.svg" width="70" height="69" alt="" class="cf-grid-deco-img" />
    </div>

    <div class="screen-card cf-card cf-work-card${isPhotoCap ? ' cf-work-card--capture' : ''}${isRescan ? ' cf-work-card--rescan' : ''}${isWork ? '' : ' cf-hidden'}" id="confirm-work-card">
      <div class="cf-card-body cf-subflow${isSummary ? '' : ' cf-hidden'}" id="confirm-summary-body">
        <header class="cf-badge cf-badge--grid">
          <span class="cf-badge-label">${t('bevestigen.title')}</span>
        </header>
        <div class="cf-summary-tile">
          <div class="cf-summary-top">
            <div class="cf-check-badge" aria-hidden="true">
              <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" class="cf-check-icon" />
            </div>
            <p class="cf-address" id="cf-address">${address}</p>
          </div>
          <div class="cf-meta-row">
            <div class="cf-meta-group">
              <img src="/assets/confirm/parcel-arrow.svg" width="24" height="24" alt="" class="cf-meta-img cf-meta-img--deliver" aria-hidden="true" />
              <span class="cf-pkg-count">${pkgCount}</span>
            </div>
            <div class="cf-meta-group cf-meta-group--code">
              <img src="/assets/confirm/barcode.svg" width="24" height="24" alt="" class="cf-meta-img" aria-hidden="true" />
              <span class="cf-tracking">${code}</span>
            </div>
          </div>
        </div>
        <div class="cf-voice-hint pro-hide">
          ${confirmThumbHint()}
          <p class="cf-voice-hint-text">${t('confirm.summary.hint')}</p>
        </div>
      </div>

      <div class="photo-capture-zone${isPhotoCap ? '' : ' cf-hidden'}" id="photo-capture-zone">
        <video id="photo-video" autoplay muted playsinline></video>
      </div>

      <div class="sign-zone${isSign ? '' : ' cf-hidden'}" id="sign-zone">
        <div class="sign-instruction">${t('confirm.sign.instruction')}</div>
        <div class="sign-canvas-wrap">
          <canvas class="sign-canvas" id="sign-canvas"></canvas>
          <div class="sign-canvas-hint" id="sign-canvas-hint">${t('confirm.sign.canvas_hint')}</div>
        </div>
        <p class="voice-hint pro-hide">${t('confirm.sign.hint')}</p>
      </div>

      <div class="rescan-zone${isRescan ? '' : ' cf-hidden'}" id="rescan-zone">
        <header class="cf-badge cf-badge--grid">
          <img src="/assets/confirm/barcode.svg" width="24" height="24" alt="" class="cf-badge-icon cf-rescan-badge-icon" aria-hidden="true" />
          <span class="cf-badge-label">${t('confirm.rescan.title')}</span>
        </header>
        <div class="load-scan-preview-block cf-rescan-preview-block">
          <div class="load-camera-frame${rescanVerified ? ' cf-hidden' : ''}" id="rescan-scanning-row">
            ${buildRescanCameraMarkup()}
            <div class="load-scan-beam-anim" id="rescan-beam" aria-hidden="true"></div>
          </div>
          <p class="rescan-status-label load-status-label${rescanVerified ? ' cf-hidden' : ''}">${t('rescan.status')}</p>
          <div class="cf-rescan-verified${rescanVerified ? '' : ' cf-hidden'}" id="rescan-result-row">
            <div class="cf-delivered-check" aria-hidden="true">
              <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" />
            </div>
            <div class="cf-rescan-verified-text">
              <span class="cf-rescan-verified-title">${t('rescan.result.title')}</span>
              <span class="cf-rescan-verified-code" id="rescan-result-code">${code}</span>
            </div>
          </div>
          <div class="load-voice-row pro-hide">
            ${loadVoiceMicPill()}
            <span class="load-voice-text">${t('confirm.rescan.hint')}</span>
          </div>
        </div>
      </div>
    </div>

    ${photoResultMarkup(!isPhotoRes)}

    ${deliveredMarkup(!isDelivered, address, code, pkgCount)}

    <div class="cta-layer${isSummary ? '' : ' cf-hidden'}" id="confirm-summary-cta">
      ${isSummary ? buildPrimaryCta(t('btn.bevestigen'), { id: 'btn-confirm-main' }) : ''}
    </div>

    <div class="cta-layer${!isDelivered && ((isRescan && rescanVerified) || isSign) ? '' : ' cf-hidden'}">
      ${(isRescan && rescanVerified) ? buildPrimaryCta(t('btn.delivery_confirm'), { id: 'btn-subflow-confirm' }) : ''}
      ${isSign ? buildPrimaryCta(t('btn.sign_confirm'), { id: 'btn-sign-ok' }) : ''}
    </div>
  </div>
</div>`;

    if (isPhotoRes) {
      const img = container.querySelector<HTMLImageElement>('#photo-result');
      const zone = container.querySelector('.photo-result-zone');
      if (img) img.src = pendingPhotoSrc || MOCK_PHOTO;
      pendingPhotoSrc = null;
      zone?.classList.remove('confirmed');
      clearPhotoConfirmTimer();
      setTimeout(() => zone?.classList.add('confirmed'), 160);
      photoConfirmTimer = setTimeout(
        () => confirmFromPhoto(),
        160 + PHOTO_CONFIRM_DWELL_MS,
      );
    }

    attachHandlers();
    if (isSign) {
      setTimeout(() => {
        signaturePad.init();
        signaturePad.clear();
      }, 80);
    }
    if (hasRendered) playPhaseEnter(container);
    hasRendered = true;
    focusScreen(container);
  }

  function attachHandlers(): void {
    container.querySelector('#btn-bevestigen-direct')?.addEventListener('click', () => showPhase('summary'));
    container.querySelector('#btn-foto')?.addEventListener('click', () => { void startPhotoCapture(); });
    container.querySelector('#btn-handtekening')?.addEventListener('click', () => showPhase('sign'));
    container.querySelector('#btn-scan-opnieuw')?.addEventListener('click', () => {
      showPhase('rescan');
      startRescanFlow();
    });
    container.querySelector('#btn-confirm-main')?.addEventListener('click', confirmFromSummary);
    container.querySelector('#btn-subflow-confirm')?.addEventListener('click', requestConfirm);
    container.querySelector('#btn-sign-ok')?.addEventListener('click', requestConfirm);
  }

  render();
  if (phase === 'photo-capture') void beginPhotoCamera();
  if (phase === 'rescan') startRescanFlow();
  if (phase === 'delivered') {
    deliveredTimer = setTimeout(finishAfterDeliveredDwell, DELIVERED_DWELL_MS);
  }
  return cleanup;
}

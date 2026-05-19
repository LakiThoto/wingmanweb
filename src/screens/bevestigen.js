// Screen: bevestigen — Bezorging bevestigen (multi-phase)
// Figma grid B 1:1674 · summary 1:1717 · photo 1:325 · sign 1:1751 · rescan 1:350 · delivered 1:584
import { focusScreen, buildDepotCtaRow, bindDepotCtaRow, buildConfirmDeliveryTile } from './_frame';
import { playPhaseEnter } from '@/core/screen-transition';
import { getActiveDelivery, getState, markActiveDelivered } from '@/core/state';
import { restartScanBeamAnim } from '@/core/scan-anim';
import { startCamera } from '@/input/camera';
import { completeDelivery } from '@/core/delivery-complete';
import { getTier } from '@/core/tier';
import { speakByTier } from '@/core/audio';
import { showCompliment } from '@/screens/compliment';
import { t } from '@/core/strings';
import { acquireCameraStream, bindCameraPreview, captureVideoFrame, stopCameraStream, } from '@/input/photo-capture';
import { iconImg, confirmThumbHint, loadVoiceMicPill } from '@/ui/icons';
import { createSignaturePad } from '@/ui/signature-pad';
const AUTO_CAPTURE_MS = 1500;
const DELIVERED_DWELL_MS = 3000;
const MOCK_PHOTO = '/assets/confirm/rescan-preview.png';
function photoResultMarkup(hidden) {
    return `
    <div class="screen-card cf-card cf-phase-card cf-photo-card${hidden ? ' cf-hidden' : ''}" id="confirm-photo-card">
      <div class="cf-card-body cf-branch-inner cf-photo-result-body">
        <header class="cf-badge cf-badge--grid">
          <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" class="cf-badge-icon" aria-hidden="true" />
          <span class="cf-badge-label">${t('bevestigen.title')}</span>
        </header>
        <div class="cf-photo-proof photo-result-zone" id="photo-result-zone">
          <img id="photo-result" src="" alt="Bewijsfoto" />
          <div class="cf-photo-proof-overlay photo-success-overlay">
            <div class="cf-delivered-check" aria-hidden="true">
              <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" />
            </div>
            <p class="cf-photo-proof-label">${t('confirm.photo.confirmed')}</p>
          </div>
        </div>
      </div>
    </div>`;
}
function deliveredMarkup(hidden, address, code, pkgCount) {
    return `
    <div class="screen-card cf-card cf-phase-card cf-delivered-card${hidden ? ' cf-hidden' : ''}" id="confirm-delivered-card">
      <div class="cf-card-body cf-branch-inner cf-delivered-body">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" class="cf-badge-icon" aria-hidden="true" />
          <span class="cf-badge-label">${t('bevestigen.title')}</span>
        </header>
        ${buildConfirmDeliveryTile({
        address,
        pkgCount,
        tracking: code,
        variant: 'delivered',
        statusLabel: t('bevestigen.success'),
        addressId: 'cf-delivered-address',
        pkgCountId: 'cf-delivered-pkg-count',
        trackingId: 'cf-delivered-tracking',
    })}
      </div>
    </div>
    ${buildDepotCtaRow(t('bevestigen.success'), {
        rowClass: 'cf-delivered-cta-layer',
        hidden,
        static: true,
        pillIcon: 'check',
        ariaLabel: t('bevestigen.success'),
    })}`;
}
function buildRescanCameraMarkup() {
    if (getState().mode === 'lab') {
        return `<video id="rescan-video" class="scan-video-in-frame" autoplay muted playsinline></video>`;
    }
    return `<img class="load-camera-img" src="/assets/confirm/rescan-preview.png" alt="" aria-hidden="true" />`;
}
export function mount(container) {
    let phase = 'grid';
    let hasRendered = false;
    let rescanTimer = null;
    let autoCaptureTimer = null;
    let deliveredTimer = null;
    let photoStream = null;
    let stopRescanCamera = null;
    let rescanVerified = false;
    let pendingPhotoSrc = null;
    const signaturePad = createSignaturePad();
    const bootPhase = new URLSearchParams(location.search).get('confirmPhase');
    if (bootPhase === 'summary' ||
        bootPhase === 'photo-capture' ||
        bootPhase === 'photo-result' ||
        bootPhase === 'sign' ||
        bootPhase === 'rescan' ||
        bootPhase === 'delivered') {
        phase = bootPhase;
    }
    function cleanup() {
        if (rescanTimer)
            clearTimeout(rescanTimer);
        if (autoCaptureTimer)
            clearTimeout(autoCaptureTimer);
        if (deliveredTimer)
            clearTimeout(deliveredTimer);
        stopCameraStream(photoStream);
        photoStream = null;
        stopRescanCamera?.();
        stopRescanCamera = null;
        signaturePad.destroy();
    }
    function clearDeliveredTimer() {
        if (deliveredTimer) {
            clearTimeout(deliveredTimer);
            deliveredTimer = null;
        }
    }
    function finishAfterDeliveredDwell() {
        clearDeliveredTimer();
        if (phase !== 'delivered')
            return;
        completeDelivery({ method: 'home', markDelivered: false, skipAcknowledgement: true });
    }
    /** Summary CTA — tile already matches delivered card (Figma 1:1717); skip 1:584 dwell. */
    function confirmFromSummary() {
        clearDeliveredTimer();
        stopCameraStream(photoStream);
        photoStream = null;
        completeDelivery({ method: 'home' });
    }
    /** Foto / handtekening / scan opnieuw — show delivered card (Figma 1:584) then advance. */
    function requestConfirm() {
        clearDeliveredTimer();
        stopCameraStream(photoStream);
        photoStream = null;
        markActiveDelivered();
        const tier = getTier();
        if (tier === 'beginner') {
            setTimeout(() => showCompliment('compliment.delivered'), 380);
        }
        else {
            setTimeout(() => speakByTier('feedback.delivery.ok'), 380);
        }
        phase = 'delivered';
        render();
        deliveredTimer = setTimeout(finishAfterDeliveredDwell, DELIVERED_DWELL_MS);
    }
    function showPhase(next) {
        phase = next;
        if (next === 'rescan')
            rescanVerified = false;
        render();
    }
    function meta() {
        const d = getActiveDelivery();
        return {
            address: d?.address ?? t('bevestigen.address'),
            code: d?.id ?? t('kenteken.package_code'),
            pkgCount: '1',
        };
    }
    async function startPhotoCapture() {
        phase = 'photo-capture';
        render();
        await beginPhotoCamera();
    }
    async function beginPhotoCamera() {
        const vid = container.querySelector('#photo-video');
        if (!vid)
            return;
        try {
            photoStream = await acquireCameraStream();
            await bindCameraPreview(vid, photoStream);
            autoCaptureTimer = setTimeout(() => capturePhoto(false), AUTO_CAPTURE_MS);
        }
        catch (err) {
            console.warn('[bevestigen] camera unavailable — simulated capture', err);
            autoCaptureTimer = setTimeout(() => capturePhoto(true), 600);
        }
    }
    function capturePhoto(simulated) {
        if (autoCaptureTimer) {
            clearTimeout(autoCaptureTimer);
            autoCaptureTimer = null;
        }
        const captureZone = container.querySelector('.photo-capture-zone');
        captureZone?.classList.add('shutter');
        setTimeout(() => captureZone?.classList.remove('shutter'), 120);
        let dataUrl = null;
        if (!simulated) {
            const vid = container.querySelector('#photo-video');
            if (vid)
                dataUrl = captureVideoFrame(vid);
        }
        stopCameraStream(photoStream);
        photoStream = null;
        showPhotoResult(dataUrl);
    }
    function showPhotoResult(dataUrl) {
        phase = 'photo-result';
        pendingPhotoSrc = dataUrl;
        render();
    }
    async function beginRescanCamera() {
        stopRescanCamera?.();
        stopRescanCamera = null;
        if (getState().mode !== 'lab')
            return;
        const vid = container.querySelector('#rescan-video');
        if (!vid)
            return;
        try {
            stopRescanCamera = await startCamera(vid);
        }
        catch (err) {
            console.warn('[bevestigen] rescan camera unavailable', err);
        }
    }
    function startRescanFlow() {
        if (rescanTimer)
            clearTimeout(rescanTimer);
        rescanVerified = false;
        render();
        void beginRescanCamera();
        const beam = container.querySelector('#rescan-beam');
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
    function render() {
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

    <div class="screen-card cf-card cf-work-card${isSummary ? ' cf-work-card--summary' : ''}${isPhotoCap ? ' cf-work-card--capture' : ''}${isRescan ? ' cf-work-card--rescan' : ''}${isWork ? '' : ' cf-hidden'}" id="confirm-work-card">
      <div class="cf-card-body cf-subflow${isSummary ? '' : ' cf-hidden'}" id="confirm-summary-body">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          <span class="cf-badge-label">${t('bevestigen.title')}</span>
        </header>
        ${buildConfirmDeliveryTile({
            address,
            pkgCount,
            tracking: code,
            variant: 'summary',
            addressId: 'cf-address',
        })}
        <p class="cf-voice-hint cf-voice-hint-text--figma pro-hide">
          ${confirmThumbHint()}
          <span class="cf-voice-dim">${t('confirm.summary.hint_lead')}</span><span class="cf-voice-em">${t('confirm.summary.hint_em')}</span>
        </p>
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

    ${buildDepotCtaRow(t('btn.bevestigen'), { id: 'btn-confirm-main', hidden: !isSummary, rowClass: 'cf-confirm-depot-cta' })}

    ${buildDepotCtaRow(
            isSign ? t('btn.sign_confirm') : isPhotoRes ? t('bevestigen.success') : t('btn.delivery_confirm'),
            {
            id: isSign ? 'btn-sign-ok' : 'btn-subflow-confirm',
            hidden: isDelivered || (!isPhotoRes && !(isRescan && rescanVerified) && !isSign),
            rowClass: 'cf-confirm-depot-cta',
            pillIcon: 'check',
        })}
  </div>
</div>`;
        if (isPhotoRes) {
            const img = container.querySelector('#photo-result');
            const zone = container.querySelector('.photo-result-zone');
            if (img)
                img.src = pendingPhotoSrc || MOCK_PHOTO;
            pendingPhotoSrc = null;
            zone?.classList.remove('confirmed');
            setTimeout(() => zone?.classList.add('confirmed'), 160);
        }
        attachHandlers();
        if (isSign) {
            setTimeout(() => {
                signaturePad.init();
                signaturePad.clear();
            }, 80);
        }
        if (hasRendered)
            playPhaseEnter(container);
        hasRendered = true;
        focusScreen(container);
    }
    function attachHandlers() {
        container.querySelector('#btn-bevestigen-direct')?.addEventListener('click', () => showPhase('summary'));
        container.querySelector('#btn-foto')?.addEventListener('click', () => { void startPhotoCapture(); });
        container.querySelector('#btn-handtekening')?.addEventListener('click', () => showPhase('sign'));
        container.querySelector('#btn-scan-opnieuw')?.addEventListener('click', () => {
            showPhase('rescan');
            startRescanFlow();
        });
        bindDepotCtaRow(container, confirmFromSummary, { mainSelector: '#btn-confirm-main' });
        const subflowSel = phase === 'sign' ? '#btn-sign-ok' : '#btn-subflow-confirm';
        bindDepotCtaRow(container, requestConfirm, { mainSelector: subflowSel });
    }
    render();
    if (phase === 'photo-capture')
        void beginPhotoCamera();
    if (phase === 'rescan')
        startRescanFlow();
    if (phase === 'delivered') {
        deliveredTimer = setTimeout(finishAfterDeliveredDwell, DELIVERED_DWELL_MS);
    }
    return cleanup;
}

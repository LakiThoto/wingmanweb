// Screen: punt — PostNL Punt (4-phase locker hand-in)
// Figma 1:490 · Copy #screen-locker
import { focusScreen, buildLoadVanPhase, buildPrimaryCta, buildAddressHero, buildVanDiagram, bindDepotCtaRow, } from './_frame';
import { confirmThumbHint } from '@/ui/icons';
import { playPhaseEnter } from '@/core/screen-transition';
import { iconImg } from '@/ui/icons';
import { getActiveDelivery, getState } from '@/core/state';
import { completeLockerHandoff } from '@/core/delivery-complete';
import { on } from '@/core/events';
import { t } from '@/core/strings';
const LOCKER_PRINT_DWELL_MS = 3000;
/** Find-in-van — same layout as laden (load-card + primary CTA). Figma zoek 1:1480 ≈ laden 1:804. */
function buildLockerFindScreen(delivery, state) {
    const row = delivery?.rowInVan ?? 'B';
    const pos = delivery?.positionInRow ?? 1;
    const queue = state.pendingLockerIdxs.length
        ? state.pendingLockerIdxs
        : [state.activeDeliveryIdx];
    const qIdx = queue.indexOf(state.activeDeliveryIdx);
    const counter = `${(qIdx === -1 ? 0 : qIdx) + 1} / ${queue.length}`;
    return `
<div class="screen-stack screen-stack--cta-gap locker-screen locker-screen--find-load">
  <div class="screen-card load-card">
    <div class="load-header-row">
      <header class="screen-chip">
        <img class="chip-icon" src="/assets/icons/barcode.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" />
        <span class="screen-chip-label">${t('zoek.title')}</span>
      </header>
      <span class="load-counter-chip">${counter}</span>
    </div>

    ${buildLoadVanPhase({
        address: delivery?.address ?? '',
        positionInRow: pos,
        rowInVan: row,
        packageId: delivery?.id ?? '',
        stopNumber: 1,
        slotRowFigma: state.activeDeliveryIdx === 1,
    }, {
        activeRow: row,
        activePos: pos,
        label: t('laden.row_label'),
        posLabel: `${pos} / 40 ${row}`,
    })}
  </div>

  <div class="cta-layer">
    ${buildPrimaryCta(t('locker.btn.pakket_meegenomen'), { id: 'btn-locker-advance' })}
  </div>
</div>`;
}
/** Place in locker — Figma 1:1800 outer card + 1:1801 inner tiles + scan CTA. */
function buildLockerPlaceScreen(delivery) {
    const row = delivery?.rowInVan ?? 'B';
    const pos = delivery?.positionInRow ?? 1;
    return `
<div class="screen-stack screen-stack--cta-gap locker-screen locker-screen--place-load">
  <div class="screen-card load-card locker-place-card">
    <div class="locker-place-chip-wrap">
      <header class="screen-chip locker-place-chip">
        <img class="chip-icon" src="/assets/icons/depot-title-icon.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" />
        <span class="screen-chip-label">${t('locker.place.chip')}</span>
      </header>
    </div>

    ${buildAddressHero({
        address: delivery?.address ?? '',
        packageId: delivery?.id ?? '',
        stopNumber: 1,
        showPosition: false,
    })}

    ${buildVanDiagram(row, pos, {
        label: t('locker.place.grid_title'),
        posLabel: t('locker.place.size'),
        loadMode: true,
        wrapped: true,
        showHeader: true,
    })}
  </div>

  <div class="cta-layer">
    <div class="depot-cta-row locker-place-depot-cta">
      <button type="button" class="focusable depot-cta-ai cta-ai-ready" id="btn-locker-scan-ai" tabindex="0" aria-hidden="true">
        <span class="ai-icon-shape">
          <img src="/assets/ai-icon.png" class="ai-triangle" alt="" width="52" height="52" decoding="async" />
        </span>
      </button>
      <button type="button" class="focusable btn-primary depot-start-btn locker-scan-depot-btn" id="btn-locker-scan" tabindex="0" aria-label="${t('locker.btn.scan')}">
        <div class="ai-text-pill depot-start-pill locker-scan-depot-pill">
          <img src="/assets/confirm/barcode.svg" width="24" height="24" alt="" class="cf-pill-scan-icon" aria-hidden="true" />
          <span class="ai-btn-text">${t('locker.btn.scan')}</span>
        </div>
      </button>
    </div>
  </div>

  <p id="locker-scan-status" class="locker-scan-status cf-hidden" role="status">${t('locker.scan.status')}</p>
</div>`;
}
/** Print / confirm — same layout as bevestigen summary (Figma 1:1717). */
function buildLockerPrintScreen(delivery) {
    const address = delivery?.address ?? '';
    const code = delivery?.id ?? '';
    const pkgCount = String(delivery?.parcelCount ?? 1);
    return `
<div class="screen-stack screen-stack--cta-gap locker-screen locker-screen--print-confirm">
  <div class="bevestigen-root" data-phase="summary">
    <div class="screen-stack cf-screen-stack">
      <div class="screen-card cf-card cf-work-card" id="locker-confirm-work-card">
        <div class="cf-card-body cf-subflow" id="locker-confirm-summary-body">
          <header class="screen-chip cf-badge cf-badge--grid">
            <span class="screen-chip-label">${t('bevestigen.title')}</span>
          </header>
          <div class="cf-summary-tile">
            <div class="cf-summary-top">
              <div class="cf-check-badge" aria-hidden="true">
                <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" class="cf-check-icon" />
              </div>
              <p class="cf-address">${address}</p>
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
      </div>
      <div class="cta-layer" id="locker-confirm-cta">
        ${buildPrimaryCta(t('btn.bevestigen'), { id: 'btn-locker-done' })}
      </div>
    </div>
  </div>
</div>`;
}
function lockerArriveCta(label, id, hidden, variant = 'check') {
    const pillClass = variant === 'scan' ? 'cf-confirm-pill cf-confirm-pill--scan' : 'cf-confirm-pill';
    const pillIcon = variant === 'scan'
        ? '<img src="/assets/confirm/barcode.svg" width="24" height="24" alt="" class="cf-pill-scan-icon" aria-hidden="true" />'
        : '<img src="/assets/confirm/pill-check.svg" width="24" height="24" alt="" class="cf-pill-check" aria-hidden="true" />';
    return `
<button type="button" class="focusable cf-confirm-btn locker-cta-btn${hidden ? ' cf-hidden' : ''}" id="${id}" tabindex="0">
  <span class="${pillClass}">
    ${pillIcon}
    <span class="cf-confirm-label">${label}</span>
  </span>
</button>`.trim();
}
export function mount(container) {
    let phase = 'navigate';
    let hasRendered = false;
    let scanTimer = null;
    let printConfirmTimer = null;
    function clearPrintConfirmTimer() {
        if (printConfirmTimer) {
            clearTimeout(printConfirmTimer);
            printConfirmTimer = null;
        }
    }
    function finishPrintConfirm() {
        clearPrintConfirmTimer();
        completeLockerHandoff();
    }
    function enterPhase(next) {
        phase = next;
        render();
    }
    function render() {
        clearPrintConfirmTimer();
        const delivery = getActiveDelivery();
        const isNav = phase === 'navigate';
        const isFind = phase === 'find_in_van';
        const isPlace = phase === 'place_in_locker';
        const isPrint = phase === 'print_ready';
        const navBlock = `
      <div class="locker-flow locker-flow--nav${isNav ? '' : ' cf-hidden'}" data-locker-phase="navigate">
        <header class="screen-chip cf-badge cf-badge--grid">
          ${iconImg('alt-locker', 'chip-icon', 20)}
          <span class="screen-chip-label">${t('punt.title')}</span>
        </header>
        <div class="locker-store-tile locker-store-tile--figma" aria-label="${t('punt.name')}">
          ${iconImg('alt-locker', 'locker-store-tile__icon', 32)}
          <div class="locker-store-tile__body">
            <p class="locker-store-tile__name">${t('punt.name')}</p>
            <p class="locker-store-tile__addr">${t('punt.address')}</p>
          </div>
        </div>
        <div class="cf-stats-row locker-stats" role="group" aria-label="${t('punt.title')}">
          <div class="cf-stat">
            <span class="cf-stat-val">${t('punt.distance')}</span>
            <span class="cf-stat-lbl">${t('punt.distance_label')}</span>
          </div>
          <div class="cf-stat-sep" aria-hidden="true"></div>
          <div class="cf-stat">
            <span class="cf-stat-val">${t('punt.closes')}</span>
            <span class="cf-stat-lbl">${t('punt.closes_label')}</span>
          </div>
          <div class="cf-stat-sep" aria-hidden="true"></div>
          <div class="cf-stat">
            <span class="cf-stat-val">${t('punt.drive')}</span>
            <span class="cf-stat-lbl">${t('punt.drive_label')}</span>
          </div>
        </div>
        <p class="locker-notice pro-hide">
          ${iconImg('alt-safeplace', 'locker-notice-icon', 14)}
          ${t('punt.notice')}
        </p>
      </div>`;
        const advanceLabel = isNav
            ? t('locker.btn.navigate')
            : t('locker.btn.to.find');
        const showAdvance = !isPlace;
        const showScan = isPlace;
        if (isPrint) {
            container.innerHTML = buildLockerPrintScreen(delivery);
        }
        else if (isFind) {
            container.innerHTML = buildLockerFindScreen(delivery, getState());
        }
        else if (isPlace) {
            container.innerHTML = buildLockerPlaceScreen(delivery);
        }
        else {
            container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap locker-screen cf-screen-stack cf-branch-stack cf-branch-figma">
  <div class="screen-card cf-card cf-branch-card locker-branch-card cf-branch-figma-card">
    <div class="cf-card-body cf-branch-inner locker-branch-inner cf-branch-figma-inner">
      ${navBlock}
    </div>
  </div>
  <div class="cf-cta-layer locker-cta-layer">
    <div class="depot-cta-row locker-arrive-cta">
      <div class="depot-cta-ai cta-ai-ready" aria-hidden="true">
        <span class="ai-icon-shape">
          <img src="/assets/ai-icon.png" class="ai-triangle" alt="" width="52" height="52" decoding="async" />
        </span>
      </div>
      ${lockerArriveCta(advanceLabel, 'btn-locker-advance', !showAdvance)}
      ${lockerArriveCta(t('locker.btn.scan'), 'btn-locker-scan', !showScan, 'scan')}
    </div>
  </div>
</div>`;
        }
        const onScan = () => {
            const status = container.querySelector('#locker-scan-status');
            status?.classList.remove('cf-hidden');
            if (scanTimer)
                clearTimeout(scanTimer);
            scanTimer = setTimeout(() => enterPhase('print_ready'), 900);
        };
        container.querySelector('#btn-locker-advance')?.addEventListener('click', () => {
            if (phase === 'navigate')
                enterPhase('find_in_van');
            else if (phase === 'find_in_van')
                enterPhase('place_in_locker');
        });
        if (isPlace) {
            bindDepotCtaRow(container, onScan, {
                mainSelector: '#btn-locker-scan',
                aiSelector: '#btn-locker-scan-ai',
            });
        }
        else {
            container.querySelector('#btn-locker-scan')?.addEventListener('click', onScan);
        }
        container.querySelector('#btn-locker-done')?.addEventListener('click', finishPrintConfirm);
        if (isPrint) {
            printConfirmTimer = setTimeout(finishPrintConfirm, LOCKER_PRINT_DWELL_MS);
        }
        if (hasRendered)
            playPhaseEnter(container);
        hasRendered = true;
        focusScreen(container);
    }
    render();
    const offLockerNext = on('locker_next_package', () => {
        phase = 'navigate';
        hasRendered = false;
        if (scanTimer) {
            clearTimeout(scanTimer);
            scanTimer = null;
        }
        clearPrintConfirmTimer();
        render();
    });
    return () => {
        offLockerNext();
        if (scanTimer)
            clearTimeout(scanTimer);
        clearPrintConfirmTimer();
    };
}

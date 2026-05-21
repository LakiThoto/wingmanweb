// Screen: zoek — Zoeken in de bus → Bevestigd confirm (Figma 62:301) → walk
import { focusScreen, buildPrimaryCta, buildDepotCtaRow, bindDepotCtaRow, buildLoadVanPhase } from './_frame';
import { transition, getActiveDelivery, getState } from '@/core/state';
import { showCompliment } from './compliment';
import { t } from '@/core/strings';
const FOUND_CONFIRM_MS = 3000;
let packageFoundHandler = null;
/** Voice / external trigger while on zoek. */
export function requestZoekPackageFound() {
    if (getState().screen !== 'zoek' || !packageFoundHandler)
        return false;
    packageFoundHandler();
    return true;
}
function buildZoekSearchMarkup(delivery, counter, activeDeliveryIdx) {
    const row = delivery?.rowInVan ?? 'B';
    const pos = delivery?.positionInRow ?? 1;
    return `
<div class="screen-stack screen-stack--cta-gap zoek-search-stack">
  <div class="screen-card load-card">
    <div class="load-header-row">
      <div class="screen-chip"><img class="chip-icon" src="/assets/icons/barcode.svg" alt="" /> ${t('zoek.title')}</div>
      <span class="load-counter-chip">${counter}</span>
    </div>

    ${buildLoadVanPhase({
        address: delivery?.address ?? t('zoek.address'),
        positionInRow: pos,
        rowInVan: row,
        packageId: delivery?.id ?? t('zoek.package_code'),
        stopNumber: 1,
        slotRowFigma: activeDeliveryIdx === 1,
    }, {
        activeRow: row,
        activePos: pos,
        label: t('zoek.row_label'),
        posLabel: `${pos} / 40 ${row}`,
    })}
  </div>

  <div class="cta-layer">
    ${buildPrimaryCta(t('btn.pkg_confirmed'), { id: 'btn-pkg-confirmed' })}
  </div>
</div>`;
}
function buildZoekFoundMarkup(delivery, counter) {
    const address = delivery?.address ?? t('zoek.address');
    const packageId = delivery?.id ?? t('zoek.package_code');
    const qty = delivery?.parcelCount ?? 1;
    return `
<div class="screen-stack screen-stack--cta-gap zoek-found-stack">
  <div class="screen-card zoek-found-card">
    <div class="load-header-row">
      <div class="screen-chip">
        <img class="chip-icon" src="/assets/zoek-found/chip-icon.svg" width="24" height="24" alt="" aria-hidden="true" />
        ${t('zoek.title')}
      </div>
      <span class="load-counter-chip">${counter}</span>
    </div>

    <div class="zoek-found-confirm" role="status" aria-live="polite" aria-label="${t('zoek.confirmed.aria')}">
      <div class="zoek-found-confirm-top">
        <div class="zoek-found-status">
          <span class="zoek-found-check-badge" aria-hidden="true">
            <img src="/assets/icons/action-check.svg" width="20" height="20" alt="" />
          </span>
          <p class="zoek-found-label">${t('zoek.confirmed.label')}</p>
        </div>
        <p class="zoek-found-address">${address}</p>
      </div>
      <div class="zoek-found-confirm-meta">
        <div class="zoek-found-qty">
          <img src="/assets/zoek-found/parcel-out.svg" width="24" height="24" alt="" aria-hidden="true" />
          <span class="zoek-found-qty-val">${qty}</span>
        </div>
        <div class="zoek-found-barcode-row">
          <img src="/assets/icons/barcode.svg" width="24" height="24" alt="" aria-hidden="true" />
          <p class="zoek-found-barcode-id">${packageId}</p>
        </div>
      </div>
    </div>
  </div>

  ${buildDepotCtaRow(t('btn.bevestigen'), { id: 'btn-zoek-found-confirm', rowClass: 'zoek-found-depot-cta' })}
</div>`;
}
export function mount(container) {
    const delivery = getActiveDelivery();
    const state = getState();
    const counter = `${state.activeDeliveryIdx + 1} / ${state.deliveries.length}`;
    let advanceTimer = null;
    const clearAdvance = () => {
        if (advanceTimer !== null) {
            clearTimeout(advanceTimer);
            advanceTimer = null;
        }
    };
    const goToWalk = () => {
        clearAdvance();
        if (getState().screen === 'zoek')
            transition('pkg_confirmed');
    };
    const showFoundConfirm = () => {
        clearAdvance();
        showCompliment('compliment.parcel.found');
        container.innerHTML = buildZoekFoundMarkup(delivery, counter);
        bindDepotCtaRow(container, goToWalk, { mainSelector: '#btn-zoek-found-confirm' });
        focusScreen(container);
        advanceTimer = setTimeout(goToWalk, FOUND_CONFIRM_MS);
    };
    container.innerHTML = buildZoekSearchMarkup(delivery, counter, state.activeDeliveryIdx);
    container.querySelector('#btn-pkg-confirmed')?.addEventListener('click', showFoundConfirm);
    packageFoundHandler = showFoundConfirm;
    focusScreen(container);
    return () => {
        packageFoundHandler = null;
        clearAdvance();
    };
}

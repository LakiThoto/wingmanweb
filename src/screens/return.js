// Screen: return — post-delivery feedforward (beginner tier)
// Figma 1:1350
import { focusScreen, buildPrimaryCta } from './_frame';
import { getState, transition } from '@/core/state';
import { t } from '@/core/strings';
import { continueFromReturn, returnAutoAdvanceMs, } from '@/core/delivery-complete';
function invanCount(deliveries) {
    return deliveries.filter(d => d.loaded && !d.delivered).length;
}
function nextParcelCount(deliveries, activeIdx) {
    const next = deliveries[activeIdx];
    return next?.parcelCount ?? (next ? 1 : 0);
}
export function mount(container) {
    const state = getState();
    const todo = state.deliveries.filter(d => !d.delivered).length;
    const inVan = invanCount(state.deliveries);
    const done = state.deliveries.filter(d => d.delivered).length;
    const nextParcels = nextParcelCount(state.deliveries, state.activeDeliveryIdx);
    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap return-screen-stack">
  <div class="screen-card screen-card--return">
    <div class="return-card-body">
      <header class="screen-chip">
        <img class="chip-icon" src="/assets/return/title-icon.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" />
        <span class="screen-chip-label">${t('return.title')}</span>
      </header>

      <div class="return-progress-block">
        <div class="route-tab-bar return-tab-bar" role="group" aria-label="${t('return.title')}">
          <div class="rtab" aria-hidden="true">
            <span class="rtab-count">${todo}</span>
            <span class="rtab-label">${t('route.tab_todo')}</span>
          </div>
          <div class="rtab" aria-hidden="true">
            <span class="rtab-count">${inVan}</span>
            <span class="rtab-label">${t('route.tab_invan')}</span>
          </div>
          <div class="rtab rtab-active" aria-hidden="true">
            <span class="rtab-count">${done}</span>
            <span class="rtab-label">${t('route.tab_done')}</span>
          </div>
        </div>

        <div class="return-stats" role="group" aria-label="${t('return.title')}">
          <div class="return-stat return-stat--walk">
            <img class="return-walk-icon" src="/assets/return/walk-turn.svg" width="87" height="28" alt="" aria-hidden="true" decoding="async" />
            <span class="return-stat-lbl">${t('return.stat.walk')}</span>
          </div>
          <div class="return-stat-sep" aria-hidden="true"></div>
          <div class="return-stat return-stat--drive">
            <span class="return-stat-val return-stat-val--emph">${t('return.stat.drive')}</span>
            <span class="return-stat-lbl">${t('return.stat.drive_label')}</span>
          </div>
          <div class="return-stat-sep" aria-hidden="true"></div>
          <div class="return-stat return-stat--next">
            <div class="return-stat-top">
              <img class="return-next-icon" src="/assets/return/next-parcel.svg" width="24" height="24" alt="" aria-hidden="true" decoding="async" />
              <span class="return-stat-val">${nextParcels}</span>
            </div>
            <span class="return-stat-lbl">${t('return.stat.next_label')}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="cta-layer">
    ${buildPrimaryCta(t('btn.return.to.van'), { id: 'btn-return-to-van' })}
  </div>
</div>`;
    const autoTimer = setTimeout(() => {
        if (getState().screen === 'return')
            continueFromReturn();
    }, returnAutoAdvanceMs());
    container.querySelector('#btn-return-to-van')?.addEventListener('click', () => {
        clearTimeout(autoTimer);
        transition('return_continue');
    });
    focusScreen(container);
    return () => clearTimeout(autoTimer);
}

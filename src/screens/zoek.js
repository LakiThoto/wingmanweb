// Screen: zoek — Zoeken in de bus
// Figma: B 1:1410 · E 1:3035 · P 1:4710
// §7.6: Bus diagram always shows rows A, B, C (matches laden screen).
import { focusScreen, buildPrimaryCta, buildLoadVanPhase } from './_frame';
import { transition, getActiveDelivery, getState } from '@/core/state';
import { showCompliment } from './compliment';
import { t } from '@/core/strings';
export function mount(container) {
    const delivery = getActiveDelivery();
    const state = getState();
    const counter = `${state.activeDeliveryIdx + 1} / ${state.deliveries.length}`;
    const row = delivery?.rowInVan ?? 'B';
    const pos = delivery?.positionInRow ?? 1;
    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
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
    container.querySelector('#btn-pkg-confirmed')?.addEventListener('click', () => {
        showCompliment('compliment.parcel.found');
        transition('pkg_confirmed');
    });
    focusScreen(container);
    return () => { };
}

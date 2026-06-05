// Screen: laden — placement in van
// Figma: B 1:804 · E 1:2407 · P 1:4119
// Pro keeps the minimal placed confirmation instead of auto-skipping the screen.

import { focusScreen, buildPrimaryCta, buildLoadVanPhase } from './_frame';
import { transition, getActiveDelivery, getState, markActiveLoaded, allLoaded } from '@/core/state';
import { showCompliment } from './compliment';
import { t } from '@/core/strings';

export function mount(container: HTMLElement): () => void {
  const delivery = getActiveDelivery();
  const state = getState();
  const loadedCount = state.deliveries.filter(d => d.loaded).length;
  const counter = `${loadedCount + 1} / ${state.deliveries.length}`;
  const row = delivery?.rowInVan ?? 'B';
  const pos = delivery?.positionInRow ?? 1;

  container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card load-card">
    <div class="load-header-row">
      <header class="screen-chip"><img class="chip-icon" src="/assets/icons/laden-placed-icon.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" /><span class="screen-chip-label">${t('laden.placed_label')}</span></header>
      <span class="load-counter-chip">${counter}</span>
    </div>

    ${buildLoadVanPhase(
      {
        address: delivery?.address ?? t('laden.address'),
        positionInRow: pos,
        rowInVan: row,
        packageId: delivery?.id ?? t('laden.package_code'),
        stopNumber: 1,
        slotRowFigma: state.activeDeliveryIdx === 1,
      },
      {
        activeRow: row,
        activePos: pos,
        label: t('laden.row_label'),
        posLabel: `${pos} / 40 ${row}`,
      },
    )}
  </div>

  <div class="cta-layer">
    ${buildPrimaryCta(t('btn.pkg_placed'), { id: 'btn-pkg-placed' })}
  </div>
</div>`;

  container.querySelector('#btn-pkg-placed')?.addEventListener('click', () => {
    markActiveLoaded();
    if (allLoaded()) {
      showCompliment('compliment.all.loaded');
      transition('all_loaded');
    } else {
      showCompliment('compliment.placed');
      transition('pkg_placed');
    }
  });

  focusScreen(container);
  return () => { /* no cleanup */ };
}

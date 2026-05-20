// Screen: buren — Afgeven bij de buren
// Figma 1:540

import { focusScreen, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { setNeighborChoice, getState } from '@/core/state';
import { completeDelivery } from '@/core/delivery-complete';
import { t } from '@/core/strings';
import { iconImg } from '@/ui/icons';

function buildNeighborChoice(id: string, num: string, dir: string): string {
  return `
      <button type="button" class="focusable nb-choice" id="${id}" tabindex="0">
        <span class="nb-choice-head">
          <span class="nb-choice-icon-wrap">${iconImg('icon-home', 'nb-choice-icon', 32)}</span>
          <span class="nb-choice-num">${num}</span>
        </span>
        <span class="nb-choice-dir pro-hide">${dir}</span>
      </button>`;
}

function confirmNeighbor(choice: 'left' | 'right'): void {
  setNeighborChoice(choice);
  completeDelivery({ method: 'neighbor' });
}

export function mount(container: HTMLElement): () => void {
  const state = getState();
  const delivery = state.deliveries[state.activeDeliveryIdx];
  const addr = delivery
    ? `${delivery.address} ${delivery.postcode} ${delivery.city}`.trim()
    : t('buren.address');

  container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card screen-card--buren">
    <div class="screen-chip">
      <img class="chip-icon" src="/assets/icons/badge-icon.svg" width="20" height="20" alt="" aria-hidden="true" />
      ${t('buren.title')}
    </div>
    <p class="nb-delivery-address">${addr}</p>
    <div class="nb-choices" data-focus-axis="horizontal">
      ${buildNeighborChoice('btn-left', t('buren.left_label'), t('buren.left_dir'))}
      ${buildNeighborChoice('btn-right', t('buren.right_label'), t('buren.right_dir'))}
    </div>
    <p class="buren-voice-hint pro-hide">
      <span class="bvn-voice-dim">Zeg </span><span class="bvn-voice-em">"Links"</span><span class="bvn-voice-dim"> of </span><span class="bvn-voice-em">"Rechts"</span><span class="bvn-voice-dim"> of </span><span class="bvn-voice-em">"Huisnummer"</span>
    </p>
  </div>
  ${buildDepotCtaRow(t('btn.neighbor.confirm'), { id: 'btn-buren-bevestigen', rowClass: 'buren-depot-cta' })}
</div>`;

  container.querySelector('#btn-left')?.addEventListener('click', () => confirmNeighbor('left'));
  container.querySelector('#btn-right')?.addEventListener('click', () => confirmNeighbor('right'));
  bindDepotCtaRow(container, () => {
    confirmNeighbor(state.neighborChoice ?? 'left');
  }, { mainSelector: '#btn-buren-bevestigen' });

  focusScreen(container);
  return () => {};
}

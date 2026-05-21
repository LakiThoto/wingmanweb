// Screen: walk — Figma Afstudeer 1319:12863 (map + HUD + CTA)

import { focusScreen, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { transition, getActiveDelivery, getState } from '@/core/state';
import { t } from '@/core/strings';
import {
  deliveryToDestination,
  startWalkNavigation,
  stopNavigation,
} from '@/core/stop-navigation';

const FALLBACK_DEST = { latitude: 52.631, longitude: 4.748, label: '' };

export function mount(container: HTMLElement): () => void {
  const delivery = getActiveDelivery();
  const address = delivery
    ? `${delivery.address} ${delivery.postcode} ${delivery.city}`.trim()
    : t('thuis.address');
  const deliverCount = delivery?.parcelCount ?? 1;
  const pickupCount = delivery?.pickupCount ?? 0;
  const floorLabel = t('walk.hud.floor_default');
  const dest = deliveryToDestination(delivery);

  container.innerHTML = `
<div class="walk-hud-root" role="region" aria-label="${t('walk.hud.chip')}">
  <div class="walk-hud-panel">
    <div class="walk-map-figma" role="img" aria-label="${t('walk.map.label')}">
      <img
        class="walk-map-scene"
        src="/assets/walk-hud/walk-map-group46.svg"
        width="385"
        height="253"
        alt=""
        decoding="async"
      />
    </div>

    <div class="screen-card walk-hud-card">
      <header class="walk-hud-chip">
        <img src="/assets/walk-hud/chip-icon.svg" width="24" height="24" alt="" class="walk-hud-chip-icon" aria-hidden="true" />
        <span class="walk-hud-chip-label">${t('walk.hud.chip')}</span>
      </header>

      <div class="walk-hud-addr-pill">
        <img src="/assets/walk-hud/pin.svg" width="22" height="24" alt="" class="walk-hud-addr-pin" aria-hidden="true" />
        <p class="walk-hud-address">${address}</p>
      </div>

      <div class="walk-hud-stats" role="group" aria-label="${t('walk.hud.stats_label')}">
        <div class="walk-hud-stat walk-hud-stat--dist">
          <div class="walk-hud-stat-top">
            <img src="/assets/walk-hud/turn.svg" width="87" height="28" alt="" class="walk-hud-turn-img" aria-hidden="true" />
          </div>
          <p class="walk-hud-stat-sub" id="walk-card-dist">120 m</p>
        </div>
        <div class="walk-hud-stat-divider" aria-hidden="true"></div>
        <div class="walk-hud-stat walk-hud-stat--hint">
          <div class="walk-hud-stat-top walk-hud-hint-row">
            <img src="/assets/walk-hud/floor.svg" width="19" height="15" alt="" class="walk-hud-floor-icon" aria-hidden="true" />
            <span class="walk-hud-hint-val">${floorLabel}</span>
          </div>
          <p class="walk-hud-stat-sub">${t('walk.hud.hint_label')}</p>
        </div>
        <div class="walk-hud-stat-divider" aria-hidden="true"></div>
        <div class="walk-hud-stat walk-hud-stat--amount">
          <div class="walk-hud-stat-top walk-hud-amount-row">
            <div class="walk-hud-amount-item">
              <img src="/assets/walk-hud/parcel-deliver.svg" width="24" height="24" alt="" aria-hidden="true" />
              <span class="walk-hud-amount-val">${deliverCount}</span>
            </div>
            <div class="walk-hud-amount-item">
              <img src="/assets/walk-hud/parcel-pickup.svg" width="24" height="24" alt="" aria-hidden="true" />
              <span class="walk-hud-amount-val">${pickupCount}</span>
            </div>
          </div>
          <p class="walk-hud-stat-sub">${t('walk.hud.amount_label')}</p>
        </div>
      </div>
    </div>
  </div>

  ${buildDepotCtaRow(t('btn.arrive.deliver'), { id: 'btn-arrive-deliver', rowClass: 'walk-depot-cta' })}
</div>`;

  const distEl = container.querySelector<HTMLElement>('#walk-card-dist');

  const goThuis = () => {
    if (getState().screen === 'walk') transition('walk_arrived');
  };

  const stopNav = startWalkNavigation({
    destination: dest ?? { ...FALLBACK_DEST, label: address },
    onDistance: (formatted: string) => {
      if (distEl) distEl.textContent = formatted;
    },
    onApproaching: () => {
      if (distEl) distEl.textContent = t('walk.hud.approaching');
    },
    onArrived: () => {
      if (distEl) {
        distEl.textContent = t('walk.hud.arrived');
        distEl.classList.add('walk-hud-stat-sub--arrived');
      }
    },
  });

  bindDepotCtaRow(container, goThuis, { mainSelector: '#btn-arrive-deliver' });
  focusScreen(container);

  return () => {
    stopNav();
    stopNavigation();
  };
}

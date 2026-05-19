// Screen: walk — minimap + delivery card at address (Wingman Copy S.WALK)
import { focusScreen, buildPrimaryCta } from './_frame';
import { transition, getActiveDelivery, getState } from '@/core/state';
import { speakTierPhrase } from '@/core/audio';
import { iconImg } from '@/ui/icons';
import { t } from '@/core/strings';
const APPROACH_MS = 2200;
const ARRIVAL_MS = 6500;
const AUTO_THUIS_MS = 8200;
export function mount(container) {
    const delivery = getActiveDelivery();
    const state = getState();
    const address = delivery
        ? `${delivery.address}, ${delivery.city}`.trim()
        : t('thuis.address');
    const stopN = state.activeDeliveryIdx + 1;
    const total = state.deliveries.length;
    container.innerHTML = `
<div class="walk-hud-root" role="region" aria-label="${t('walk.hud.chip')}">
  <div class="walk-hud-panel">
    <div class="walk-hud-map-wrap" aria-hidden="false">
      <div class="walk-minimap-mock">
        <div class="walk-minimap-route" aria-hidden="true"></div>
        <div class="minimap-position" aria-hidden="true">
          <div class="minimap-arrow-inner">
            <svg class="minimap-arrow-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4L20 18H4L12 4Z" fill="#ffffff"/>
            </svg>
          </div>
        </div>
        <div class="minimap-dist-pill" id="walk-dist-pill">120 m</div>
      </div>
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

      <div class="walk-hud-stats" role="group" aria-label="${t('walk.hud.chip')}">
        <div class="walk-hud-stat walk-hud-stat--nav">
          <div class="walk-hud-stat-top">
            <img src="/assets/walk-hud/turn.svg" width="87" height="28" alt="" class="walk-hud-turn-img" aria-hidden="true" />
          </div>
          <p class="walk-hud-stat-sub" id="walk-card-dist">120 m</p>
        </div>
        <div class="walk-hud-stat-divider" aria-hidden="true"></div>
        <div class="walk-hud-stat walk-hud-stat--count">
          <div class="walk-hud-stat-top walk-hud-stat-counts">
            <div class="walk-hud-count-item">
              ${iconImg('meta-arrow-right', 'walk-hud-parcel-ic', 24)}
              <span class="walk-hud-stat-val">1</span>
            </div>
          </div>
          <p class="walk-hud-stat-sub">${stopN} / ${total}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="walk-arrive-cta">
    <div class="walk-arrive-ai" aria-hidden="true">
      <img src="/assets/walk-hud/arrive-ai.svg" width="70" height="69" alt="" class="walk-arrive-ai-img" />
    </div>
    ${buildPrimaryCta(t('btn.arrive.deliver'), { id: 'btn-arrive-deliver' })}
  </div>
</div>`;
    const distEl = container.querySelector('#walk-card-dist');
    const distPill = container.querySelector('#walk-dist-pill');
    const approachTimer = setTimeout(() => {
        if (getState().screen !== 'walk')
            return;
        speakTierPhrase('walk.approaching');
        if (distEl)
            distEl.textContent = t('walk.hud.approaching');
        if (distPill)
            distPill.textContent = '45 m';
    }, APPROACH_MS);
    const arrivalTimer = setTimeout(() => {
        if (getState().screen !== 'walk')
            return;
        speakTierPhrase('walk.arrival');
        if (distEl) {
            distEl.textContent = t('walk.hud.arrived');
            distEl.classList.add('walk-hud-stat-sub--arrived');
        }
        if (distPill)
            distPill.textContent = t('walk.hud.arrived');
    }, ARRIVAL_MS);
    const autoTimer = setTimeout(() => {
        if (getState().screen === 'walk')
            transition('walk_arrived');
    }, AUTO_THUIS_MS);
    container.querySelector('#btn-arrive-deliver')?.addEventListener('click', () => {
        transition('walk_arrived');
    });
    focusScreen(container);
    return () => {
        clearTimeout(approachTimer);
        clearTimeout(arrivalTimer);
        clearTimeout(autoTimer);
    };
}

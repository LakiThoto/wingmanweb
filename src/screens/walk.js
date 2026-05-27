// Screen: walk — Figma Afstudeer 1319:12863 (map + HUD + CTA)
import { focusScreen, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { prefersReducedMotion } from '@/core/screen-transition';
import { transition, getActiveDelivery, getState } from '@/core/state';
import { t } from '@/core/strings';
import { deliveryToDestination, startWalkNavigation, stopNavigation, } from '@/core/stop-navigation';
const FALLBACK_DEST = { latitude: 52.631, longitude: 4.748, label: '' };
const NOTICE_VISIBLE_MS = 5000;
const NOTICE_EXIT_MS = 320;
export function mount(container) {
    const delivery = getActiveDelivery();
    const address = delivery
        ? `${delivery.address} ${delivery.postcode} ${delivery.city}`.trim()
        : t('thuis.address');
    const deliverCount = delivery?.parcelCount ?? 1;
    const pickupCount = delivery?.pickupCount ?? 0;
    const floorLabel = t('walk.hud.floor_default');
    const dest = deliveryToDestination(delivery);
    const addressNotice = delivery?.addressNotice ?? '';
    const noticeHtml = addressNotice
        ? `
    <div class="walk-hud-notice-slot">
      <div class="walk-hud-notice" role="status" aria-live="polite">
        <img
          src="/assets/walk-hud/notice-info.svg"
          width="24"
          height="24"
          alt=""
          class="walk-hud-notice-icon"
          aria-hidden="true"
        />
        <p class="walk-hud-notice-text">${addressNotice}</p>
      </div>
    </div>`
        : '';
    container.innerHTML = `
<div class="walk-hud-root" role="region" aria-label="${t('walk.hud.chip')}">
  <div class="walk-hud-panel">
    <div class="walk-map-figma" role="img" aria-label="${t('walk.map.label')}">
      <div class="walk-map-scene" aria-hidden="true">
        <img
          class="walk-map-layer walk-map-layer--roads"
          src="/assets/walk-hud/walk-map-roads-new.svg"
          alt=""
          decoding="async"
        />
        <div class="walk-map-overlay">
          <img
            class="walk-map-layer walk-map-layer--route"
            src="/assets/walk-hud/walk-map-route.svg"
            alt=""
            decoding="async"
          />
          <div class="walk-map-truck">
            <img
              class="walk-map-truck-part walk-map-truck-part--1"
              src="/assets/walk-hud/walk-map-truck-1.svg"
              alt=""
              decoding="async"
            />
            <img
              class="walk-map-truck-part walk-map-truck-part--2"
              src="/assets/walk-hud/walk-map-truck-2.svg"
              alt=""
              decoding="async"
            />
            <img
              class="walk-map-truck-part walk-map-truck-part--3"
              src="/assets/walk-hud/walk-map-truck-3.svg"
              alt=""
              decoding="async"
            />
            <img
              class="walk-map-truck-part walk-map-truck-part--4"
              src="/assets/walk-hud/walk-map-truck-4.svg"
              alt=""
              decoding="async"
            />
            <img
              class="walk-map-truck-part walk-map-truck-part--5"
              src="/assets/walk-hud/walk-map-truck-5.svg"
              alt=""
              decoding="async"
            />
          </div>
          <img
            class="walk-map-layer walk-map-layer--pin"
            src="/assets/walk-hud/walk-map-pin.svg"
            width="24"
            height="31"
            alt=""
            decoding="async"
          />
          <div class="walk-map-layer walk-map-layer--heading">
            <img src="/assets/walk-hud/walk-map-heading.svg" width="60" height="60" alt="" decoding="async" />
          </div>
        </div>
      </div>
    </div>

    <div class="walk-hud-cards">
      ${noticeHtml}
      <div class="screen-card walk-hud-card">
        <div class="walk-hud-card-inner">
          <div class="walk-hud-chip-wrap">
            <header class="screen-chip">
              <img src="/assets/walk-hud/chip-icon.svg" width="20" height="20" alt="" class="chip-icon" aria-hidden="true" decoding="async" />
              <span class="screen-chip-label">${t('walk.hud.chip')}</span>
            </header>
          </div>

          <div class="walk-hud-addr-pill">
            <img src="/assets/walk-hud/pin.svg" width="22" height="24" alt="" class="walk-hud-addr-pin" aria-hidden="true" />
            <p class="walk-hud-address">${address}</p>
          </div>

          <div class="walk-hud-stats" role="group" aria-label="${t('walk.hud.stats_label')}">
            <div class="walk-hud-stat walk-hud-stat--dist">
              <div class="walk-hud-stat-top">
                <img src="/assets/walk-hud/turn.svg" width="87" height="28" alt="" class="walk-hud-turn-img" aria-hidden="true" />
              </div>
              <p class="walk-hud-stat-sub walk-hud-stat-sub--dist" id="walk-card-dist">120 m</p>
            </div>
            <div class="walk-hud-stat-divider" aria-hidden="true"></div>
            <div class="walk-hud-stat walk-hud-stat--hint">
              <div class="walk-hud-stat-top walk-hud-hint-row">
                <img src="/assets/walk-hud/floor.svg" width="19" height="15" alt="" class="walk-hud-floor-icon" aria-hidden="true" />
                <span class="walk-hud-hint-val">${floorLabel}</span>
              </div>
              <p class="walk-hud-stat-sub walk-hud-stat-sub--label">${t('walk.hud.hint_label')}</p>
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
              <p class="walk-hud-stat-sub walk-hud-stat-sub--label">${t('walk.hud.amount_label')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  ${buildDepotCtaRow(t('btn.arrive.deliver'), { id: 'btn-arrive-deliver', rowClass: 'walk-depot-cta' })}
</div>`;
    const distEl = container.querySelector('#walk-card-dist');
    const goThuis = () => {
        if (getState().screen === 'walk')
            transition('walk_arrived');
    };
    const stopNav = startWalkNavigation({
        destination: dest ?? { ...FALLBACK_DEST, label: address },
        onDistance: (formatted) => {
            if (distEl)
                distEl.textContent = formatted;
        },
        onApproaching: () => {
            if (distEl)
                distEl.textContent = t('walk.hud.approaching');
        },
        onArrived: () => {
            if (distEl) {
                distEl.textContent = t('walk.hud.arrived');
                distEl.classList.add('walk-hud-stat-sub--arrived', 'walk-hud-stat-sub--dist');
            }
        },
    });
    bindDepotCtaRow(container, goThuis, { mainSelector: '#btn-arrive-deliver' });
    focusScreen(container);
    let noticeDismissTimer = null;
    let noticeExitTimer = null;
    if (addressNotice) {
        const notice = container.querySelector('.walk-hud-notice');
        const slot = container.querySelector('.walk-hud-notice-slot');
        if (notice && slot) {
            const removeNotice = () => {
                slot.remove();
            };
            let removed = false;
            const dismissNotice = () => {
                if (removed)
                    return;
                notice.classList.remove('walk-hud-notice--enter');
                notice.classList.add('walk-hud-notice--exit');
                slot.classList.add('walk-hud-notice-slot--exit');
                if (prefersReducedMotion()) {
                    removed = true;
                    removeNotice();
                    return;
                }
                const finishRemove = () => {
                    if (removed)
                        return;
                    removed = true;
                    removeNotice();
                };
                const onExitEnd = (e) => {
                    if (e.target !== notice || e.animationName !== 'walk-notice-exit')
                        return;
                    notice.removeEventListener('animationend', onExitEnd);
                    finishRemove();
                };
                notice.addEventListener('animationend', onExitEnd);
                noticeExitTimer = setTimeout(finishRemove, NOTICE_EXIT_MS + 120);
            };
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    slot.classList.add('walk-hud-notice-slot--open');
                    notice.classList.add('walk-hud-notice--enter');
                });
            });
            noticeDismissTimer = setTimeout(dismissNotice, NOTICE_VISIBLE_MS);
        }
    }
    return () => {
        if (noticeDismissTimer)
            clearTimeout(noticeDismissTimer);
        if (noticeExitTimer)
            clearTimeout(noticeExitTimer);
        stopNav();
        stopNavigation();
    };
}

// Screen: route — Route van vandaag
// Figma 1:701

import { focusScreen, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { iconImg } from '@/ui/icons';
import { transition, getState, allDelivered, setScreen } from '@/core/state';
import { ensureGeoReady } from '@/core/stop-navigation';
import { t } from '@/core/strings';
import type { Delivery } from '@/types';

function formatStopAddress(d: Delivery): string {
  return `${d.address} ${d.postcode} ${d.city}`.trim();
}

function invanCount(deliveries: Delivery[]): number {
  return deliveries.filter(d => d.loaded && !d.delivered).length;
}

export function mount(container: HTMLElement): () => void {
  if (allDelivered()) {
    setScreen('complete');
    return () => {};
  }

  const state = getState();
  let activeTab: 'todo' | 'invan' | 'done' = 'todo';

  function render(): void {
    const todo = state.deliveries.filter(d => !d.delivered);
    const done = state.deliveries.filter(d => d.delivered);
    const inVan = invanCount(state.deliveries);

    const listForTab = (): Delivery[] => {
      if (activeTab === 'todo') return todo;
      if (activeTab === 'done') return done;
      return state.deliveries.filter(d => d.loaded);
    };

    const stopItems = listForTab().map((d) => {
      const deliver = d.parcelCount ?? 1;
      const pickup = d.pickupCount ?? 0;
      return `
      <div class="stop-item-outer">
        <button
          type="button"
          class="focusable stop-item"
          tabindex="0"
          data-delivery-idx="${state.deliveries.indexOf(d)}"
          aria-label="${formatStopAddress(d)}"
        >
          <span class="stop-item-address">${formatStopAddress(d)}</span>
          <div class="stop-item-meta-row">
            <div class="stop-item-counts">
              <span class="stop-count">${iconImg('meta-arrow-right', 'meta-icon', 24)} ${deliver}</span>
              <span class="stop-count">${iconImg('meta-arrow-left', 'meta-icon', 24)} ${pickup}</span>
            </div>
            <div class="stop-item-window">
              ${iconImg('clock', 'meta-icon', 24)}
              <span>${d.window.from} – ${d.window.to}</span>
            </div>
          </div>
        </button>
      </div>`;
    }).join('') || `<p class="screen-empty-msg">Geen stops</p>`;

    const cta = allDelivered()
      ? `<p class="route-complete-msg">Route voltooid!</p>`
      : buildDepotCtaRow(t('btn.route_start'), { id: 'btn-route-start', rowClass: 'route-depot-cta' });

    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap route-screen-stack">
  <div class="screen-card route-card">
    <header class="screen-chip">
      <img class="chip-icon" src="/assets/icons/route-title.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" />
      <span class="screen-chip-label">${t('route.title')}</span>
    </header>

    <div class="route-tab-bar" data-focus-axis="horizontal">
      <button type="button" class="focusable rtab${activeTab === 'todo' ? ' rtab-active' : ''}" data-tab="todo" tabindex="0">
        <span class="rtab-count">${todo.length}</span>
        <span class="rtab-label">${t('route.tab_todo')}</span>
      </button>
      <button type="button" class="focusable rtab${activeTab === 'invan' ? ' rtab-active' : ''}" data-tab="invan" tabindex="0">
        <span class="rtab-count">${inVan}</span>
        <span class="rtab-label">${t('route.tab_invan')}</span>
      </button>
      <button type="button" class="focusable rtab${activeTab === 'done' ? ' rtab-active' : ''}" data-tab="done" tabindex="0">
        <span class="rtab-count">${done.length}</span>
        <span class="rtab-label">${t('route.tab_done')}</span>
      </button>
    </div>

    <div class="route-stop-list">
      ${stopItems}
    </div>

    <p class="route-voice-hint beginner-only">
      <img src="/assets/route/thumb-up.png" width="27" height="32" alt="" class="route-thumb" aria-hidden="true" />
      <span><span class="route-voice-dim">${t('route.voice_prefix')}</span><span class="route-voice-em">${t('route.voice_em')}</span></span>
    </p>
  </div>

  ${cta}
</div>`;

    attachHandlers();
    focusScreen(container);
  }

  function attachHandlers(): void {
    container.querySelectorAll<HTMLButtonElement>('.rtab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as 'todo' | 'invan' | 'done';
        if (tab) {
          activeTab = tab;
          render();
        }
      });
    });

    const startRoute = () => {
      void ensureGeoReady();
      transition('route_start');
    };

    container.querySelectorAll<HTMLButtonElement>('.stop-item').forEach(btn => {
      btn.addEventListener('click', startRoute);
    });

    bindDepotCtaRow(container, startRoute, { mainSelector: '#btn-route-start' });
  }

  render();
  return () => {};
}

// Screen: punt — PostNL Punt (4-phase locker hand-in)
// Figma 1:490 · Copy #screen-locker

import { focusScreen, buildBusDiagram } from './_frame';
import { playPhaseEnter } from '@/core/screen-transition';
import { iconImg } from '@/ui/icons';
import { getActiveDelivery } from '@/core/state';
import { completeLockerHandoff } from '@/core/delivery-complete';
import { t } from '@/core/strings';

type LockerPhase = 'navigate' | 'find_in_van' | 'place_in_locker' | 'print_ready';

function lockerArriveCta(
  label: string,
  id: string,
  hidden: boolean,
  variant: 'check' | 'scan' = 'check',
): string {
  const pillClass =
    variant === 'scan' ? 'cf-confirm-pill cf-confirm-pill--scan' : 'cf-confirm-pill';
  const pillIcon =
    variant === 'scan'
      ? '<img src="/assets/confirm/barcode.svg" width="24" height="24" alt="" class="cf-pill-scan-icon" aria-hidden="true" />'
      : '<img src="/assets/confirm/pill-check.svg" width="36" height="36" alt="" class="cf-pill-check" aria-hidden="true" />';

  return `
<button type="button" class="focusable cf-confirm-btn locker-cta-btn${hidden ? ' cf-hidden' : ''}" id="${id}" tabindex="0">
  <span class="${pillClass}">
    ${pillIcon}
    <span class="cf-confirm-label">${label}</span>
  </span>
</button>`.trim();
}

export function mount(container: HTMLElement): () => void {
  let phase: LockerPhase = 'navigate';
  let hasRendered = false;
  let scanTimer: ReturnType<typeof setTimeout> | null = null;
  const delivery = getActiveDelivery();

  function enterPhase(next: LockerPhase): void {
    phase = next;
    render();
  }

  function render(): void {
    const isNav = phase === 'navigate';
    const isFind = phase === 'find_in_van';
    const isPlace = phase === 'place_in_locker';
    const isPrint = phase === 'print_ready';

    const navBlock = `
      <div class="locker-flow locker-flow--nav${isNav ? '' : ' cf-hidden'}" data-locker-phase="navigate">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          ${iconImg('alt-locker', 'cf-badge-icon', 20)}
          <span class="cf-badge-label">${t('punt.title')}</span>
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

    const findBlock = `
      <div class="locker-flow locker-flow--find${isFind ? '' : ' cf-hidden'}" data-locker-phase="find_in_van">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          ${iconImg('barcode', 'cf-badge-icon', 20)}
          <span class="cf-badge-label">${t('locker.find.chip')}</span>
        </header>
        <p class="locker-find-hint">${t('locker.find.sub')}</p>
        <div class="locker-mini-van">
          ${buildBusDiagram(
            delivery?.rowInVan ?? 'B',
            delivery?.positionInRow ?? 1,
            3,
            t('zoek.row_label'),
            `${delivery?.positionInRow ?? 1} / 40 ${delivery?.rowInVan ?? 'B'}`,
          )}
        </div>
      </div>`;

    const placeBlock = `
      <div class="locker-flow locker-flow--place${isPlace ? '' : ' cf-hidden'}" data-locker-phase="place_in_locker">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          <span class="cf-badge-label">${t('locker.place.title')}</span>
        </header>
        <p class="locker-place-sub">${t('locker.place.sub')}</p>
        <div class="locker-compartment-grid" role="group" aria-label="Locker vakken">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n =>
            `<button type="button" class="focusable locker-cell${n === 5 ? ' locker-cell--pick' : ''}" data-cell="${n}">${n}</button>`,
          ).join('')}
        </div>
        <div id="locker-scan-status" class="locker-scan-status cf-hidden">${t('locker.scan.status')}</div>
      </div>`;

    const printBlock = isPrint
      ? `<div class="cf-card-body cf-locker-confirm-body" data-locker-phase="print_ready">
          <p class="locker-confirm-text">${t('punt.notice')}</p>
        </div>`
      : '';

    const advanceLabel = isNav
      ? t('locker.btn.navigate')
      : isFind
        ? t('locker.btn.pakket_meegenomen')
        : t('locker.btn.to.find');

    const showAdvance = !isPlace && !isPrint;
    const showScan = isPlace;
    const showDone = isPrint;

    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap locker-screen cf-screen-stack cf-branch-stack cf-branch-figma">
  <div class="screen-card cf-card cf-branch-card locker-branch-card cf-branch-figma-card">
    <div class="cf-card-body cf-branch-inner locker-branch-inner cf-branch-figma-inner">
      ${navBlock}
      ${findBlock}
      ${placeBlock}
      ${printBlock}
    </div>
  </div>
  <div class="cf-cta-layer locker-cta-layer">
    <div class="cf-arrive-cta locker-arrive-cta">
      <div class="cf-arrive-ai" aria-hidden="true">
        <img src="/assets/confirm/arrive-ai.svg" width="70" height="69" alt="" class="cf-arrive-ai-img" decoding="async" />
      </div>
      ${lockerArriveCta(advanceLabel, 'btn-locker-advance', !showAdvance)}
      ${lockerArriveCta(t('locker.btn.scan'), 'btn-locker-scan', !showScan, 'scan')}
      ${lockerArriveCta(t('btn.bevestigen'), 'btn-locker-done', !showDone)}
    </div>
  </div>
</div>`;

    container.querySelector('#btn-locker-advance')?.addEventListener('click', () => {
      if (phase === 'navigate') enterPhase('find_in_van');
      else if (phase === 'find_in_van') enterPhase('place_in_locker');
    });

    container.querySelector('#btn-locker-scan')?.addEventListener('click', () => {
      const status = container.querySelector('#locker-scan-status');
      status?.classList.remove('cf-hidden');
      if (scanTimer) clearTimeout(scanTimer);
      scanTimer = setTimeout(() => enterPhase('print_ready'), 900);
    });

    container.querySelector('#btn-locker-done')?.addEventListener('click', () => {
      completeLockerHandoff();
    });

    if (hasRendered) playPhaseEnter(container);
    hasRendered = true;
    focusScreen(container);
  }

  render();

  return () => {
    if (scanTimer) clearTimeout(scanTimer);
  };
}

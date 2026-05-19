// Screen: punt — PostNL Punt (4-phase locker hand-in)
// Figma navigate 1:490 · find-in-van 1:1481 · Copy #screen-locker
import { focusScreen, buildLoadVanPhase, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { playPhaseEnter } from '@/core/screen-transition';
import { iconImg } from '@/ui/icons';
import { getActiveDelivery } from '@/core/state';
import { completeLockerHandoff } from '@/core/delivery-complete';
import { t } from '@/core/strings';
export function mount(container) {
    let phase = 'navigate';
    let hasRendered = false;
    let scanTimer = null;
    const delivery = getActiveDelivery();
    function enterPhase(next) {
        phase = next;
        render();
    }
    function render() {
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
      <div class="locker-flow${isFind ? '' : ' cf-hidden'}" data-locker-phase="find_in_van">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          ${iconImg('barcode', 'cf-badge-icon', 20)}
          <span class="cf-badge-label">${t('locker.find.chip')}</span>
        </header>
        <p class="locker-find-hint">${t('zoek.title')}</p>
        <div class="load-header-row">
          <div class="screen-chip">
            <img class="chip-icon" src="/assets/icons/barcode.svg" alt="" />
            ${t('zoek.title')}
          </div>
        </div>
        ${buildLoadVanPhase({
            address: delivery?.address ?? t('zoek.address'),
            positionInRow: delivery?.positionInRow ?? 12,
            rowInVan: delivery?.rowInVan ?? 'B',
            packageId: delivery?.id ?? t('zoek.package_code'),
            stopNumber: 1,
        }, {
            activeRow: delivery?.rowInVan ?? 'B',
            activePos: delivery?.positionInRow ?? 12,
            label: t('zoek.chip'),
            posLabel: '',
        })}
      </div>`;
        const placeBlock = `
      <div class="locker-flow${isPlace ? '' : ' cf-hidden'}" data-locker-phase="place_in_locker">
        <header class="cf-badge cf-badge--grid cf-badge--figma">
          <span class="cf-badge-label">${t('locker.place.title')}</span>
        </header>
        <p class="locker-place-sub">${t('locker.place.sub')}</p>
        <div class="locker-compartment-grid" role="group" aria-label="Locker vakken">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<button type="button" class="focusable locker-cell${n === 5 ? ' locker-cell--pick' : ''}" data-cell="${n}">${n}</button>`).join('')}
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
                ? t('locker.btn.to.place')
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
  ${buildDepotCtaRow(advanceLabel, { id: 'btn-locker-advance', hidden: !showAdvance, rowClass: 'locker-depot-cta', pillIcon: 'check' })}
  ${buildDepotCtaRow(t('locker.btn.scan'), { id: 'btn-locker-scan', hidden: !showScan, rowClass: 'locker-depot-cta', pillIcon: 'scan' })}
  ${buildDepotCtaRow(t('btn.bevestigen'), { id: 'btn-locker-done', hidden: !showDone, rowClass: 'locker-depot-cta', pillIcon: 'check' })}
</div>`;
        bindDepotCtaRow(container, () => {
            if (phase === 'navigate')
                enterPhase('find_in_van');
            else if (phase === 'find_in_van')
                enterPhase('place_in_locker');
        }, { mainSelector: '#btn-locker-advance' });
        bindDepotCtaRow(container, () => {
            const status = container.querySelector('#locker-scan-status');
            status?.classList.remove('cf-hidden');
            if (scanTimer)
                clearTimeout(scanTimer);
            scanTimer = setTimeout(() => enterPhase('print_ready'), 900);
        }, { mainSelector: '#btn-locker-scan' });
        bindDepotCtaRow(container, () => {
            completeLockerHandoff();
        }, { mainSelector: '#btn-locker-done' });
        if (hasRendered)
            playPhaseEnter(container);
        hasRendered = true;
        focusScreen(container);
    }
    render();
    return () => {
        if (scanTimer)
            clearTimeout(scanTimer);
    };
}

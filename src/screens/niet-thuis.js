// Screen: niet-thuis — Niemand thuis, choice screen
// Figma 1:367
import { focusScreen } from './_frame';
import { transition } from '@/core/state';
import { chooseLockerHandoffFromNietThuis } from '@/core/delivery-complete';
import { t } from '@/core/strings';
function buildNthTile(id, iconSrc, label, sub) {
    return `
      <button type="button" class="focusable nth-tile" id="${id}" tabindex="0">
        <span class="nth-tile-head">
          <img class="nth-tile-icon" src="${iconSrc}" width="32" height="32" alt="" aria-hidden="true" decoding="async" />
          <span class="nth-tile-label">${label}</span>
        </span>
        <span class="nth-tile-sub pro-hide">${sub}</span>
      </button>`;
}
export function mount(container) {
    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card screen-card--niet-thuis">
    <div class="nth-card-body">
      <header class="screen-chip">
        <img class="chip-icon" src="/assets/niet-thuis/title-icon.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" />
        <span class="screen-chip-label">${t('niet_thuis.title')}</span>
      </header>

      <div class="nth-choices-block">
        <div class="nth-grid">
          ${buildNthTile('btn-buren', '/assets/niet-thuis/icon-buren.svg', t('niet_thuis.buren_label'), t('niet_thuis.buren_sub'))}
          ${buildNthTile('btn-veiligeplek', '/assets/niet-thuis/icon-veilig.svg', t('niet_thuis.veilig_label'), t('niet_thuis.veilig_sub'))}
          ${buildNthTile('btn-punt', '/assets/niet-thuis/icon-punt.svg', t('niet_thuis.punt_label'), t('niet_thuis.punt_sub'))}
          ${buildNthTile('btn-later', '/assets/niet-thuis/icon-later.svg', t('niet_thuis.later_label'), t('niet_thuis.later_sub'))}
        </div>
      </div>

      <p class="nth-voice-hint pro-hide">
        <span class="nth-voice-dim">${t('niet_thuis.voice_prefix')}</span><span class="nth-voice-em">${t('niet_thuis.voice_em')}</span>
      </p>
    </div>
  </div>
</div>`;
    container.querySelector('#btn-buren')?.addEventListener('click', () => transition('kies_buren'));
    container.querySelector('#btn-veiligeplek')?.addEventListener('click', () => transition('kies_veiligeplek'));
    container.querySelector('#btn-punt')?.addEventListener('click', () => chooseLockerHandoffFromNietThuis());
    container.querySelector('#btn-later')?.addEventListener('click', () => transition('kies_later'));
    focusScreen(container);
    return () => { };
}

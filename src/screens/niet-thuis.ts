// Screen: niet-thuis — Niemand thuis, choice screen
// Figma: B 1:366 · E 1:2198 · P 1:5191

import { focusScreen } from './_frame';
import { transition } from '@/core/state';
import { t } from '@/core/strings';
import { iconImg, loadVoiceMicPill } from '@/ui/icons';

export function mount(container: HTMLElement): () => void {
  container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="screen-chip"><img class="chip-icon" src="/assets/icons/badge-icon.svg" alt="" /> ${t('niet_thuis.title')}</div>

    <div class="alt-grid">
      <button class="focusable alt-tile" id="btn-buren" tabindex="0">
        ${iconImg('alt-neighbors', 'alt-tile-icon')}
        <span class="alt-tile-label">${t('niet_thuis.buren_label')}</span>
        <span class="alt-tile-sub pro-hide">${t('niet_thuis.buren_sub')}</span>
      </button>

      <button class="focusable alt-tile" id="btn-veiligeplek" tabindex="0">
        ${iconImg('alt-safeplace', 'alt-tile-icon')}
        <span class="alt-tile-label">${t('niet_thuis.veilig_label')}</span>
        <span class="alt-tile-sub pro-hide">${t('niet_thuis.veilig_sub')}</span>
      </button>

      <button class="focusable alt-tile" id="btn-punt" tabindex="0">
        ${iconImg('alt-locker', 'alt-tile-icon')}
        <span class="alt-tile-label">${t('niet_thuis.punt_label')}</span>
        <span class="alt-tile-sub pro-hide">${t('niet_thuis.punt_sub')}</span>
      </button>

      <button class="focusable alt-tile" id="btn-later" tabindex="0">
        ${iconImg('clock', 'alt-tile-icon')}
        <span class="alt-tile-label">${t('niet_thuis.later_label')}</span>
        <span class="alt-tile-sub pro-hide">${t('niet_thuis.later_sub')}</span>
      </button>
    </div>

    <div class="load-voice-row pro-hide">
      ${loadVoiceMicPill()}
      <span class="load-voice-text">${t('niet_thuis.voice_hint')}</span>
    </div>
  </div>
</div>`;

  container.querySelector('#btn-buren')?.addEventListener('click', () => transition('kies_buren'));
  container.querySelector('#btn-veiligeplek')?.addEventListener('click', () => transition('kies_veiligeplek'));
  container.querySelector('#btn-punt')?.addEventListener('click', () => transition('kies_punt'));
  container.querySelector('#btn-later')?.addEventListener('click', () => transition('kies_later'));

  focusScreen();
  return () => {};
}

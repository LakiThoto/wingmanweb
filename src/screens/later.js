// Screen: later — Later bezorgen
// Figma 1:281
import { focusScreen } from './_frame';
import { skipStopLaterToday, completeLaterTomorrow } from '@/core/delivery-complete';
import { t } from '@/core/strings';
function buildLaterTile(id, iconSrc, label, sub, headClass = '') {
    return `
      <button type="button" class="focusable later-tile" id="${id}" tabindex="0">
        <span class="later-tile-body">
          <span class="later-tile-head${headClass}">
            <img class="later-tile-icon" src="${iconSrc}" width="32" height="32" alt="" aria-hidden="true" decoding="async" />
            <span class="later-tile-label">${label}</span>
          </span>
          <span class="later-tile-sub pro-hide">${sub}</span>
        </span>
      </button>`;
}
export function mount(container) {
    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card screen-card--later">
    <div class="later-card-body">
      <header class="screen-chip">
        <img class="chip-icon" src="/assets/later/title-icon.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" />
        <span class="screen-chip-label">${t('later.title')}</span>
      </header>

      <div class="later-choices-block">
        ${buildLaterTile('btn-today', '/assets/later/icon-today.svg', t('later.today_label'), t('later.today_sub'))}
        ${buildLaterTile('btn-tomorrow', '/assets/later/icon-tomorrow.svg', t('later.tomorrow_label'), t('later.tomorrow_sub'), ' later-tile-head--tight')}
      </div>

      <p class="later-voice-hint pro-hide">
        <span class="later-voice-dim">${t('later.voice_prefix')}</span><span class="later-voice-em">${t('later.voice_em')}</span>
      </p>
    </div>
  </div>
</div>`;
    container.querySelector('#btn-today')?.addEventListener('click', () => skipStopLaterToday());
    container.querySelector('#btn-tomorrow')?.addEventListener('click', () => completeLaterTomorrow());
    focusScreen(container);
    return () => { };
}

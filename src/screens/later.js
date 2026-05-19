// Screen: later — Later bezorgen
// Figma: B 1:280 · E 1:2153 · P 1:5147
import { focusScreen, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { iconImg, loadVoiceMicPill } from '@/ui/icons';
import { getActiveDelivery } from '@/core/state';
import { skipStopLaterToday, completeLaterTomorrow } from '@/core/delivery-complete';
import { t } from '@/core/strings';
export function mount(container) {
    const delivery = getActiveDelivery();
    const name = delivery?.address ?? t('thuis.address');
    const addr = delivery
        ? `${delivery.postcode} ${delivery.city}`.trim()
        : '1821 BS Alkmaar';
    let selected = 'today';
    function render() {
        const todayCls = selected === 'today' ? ' later-choice-active selected' : '';
        const tomorrowCls = selected === 'tomorrow' ? ' later-choice-active selected' : '';
        container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="screen-chip"><img class="chip-icon" src="/assets/icons/clock.svg" alt="" /> ${t('later.title')}</div>

    <div class="later-context">
      <div class="later-context-name">${name}</div>
      <div class="later-context-addr">${addr}</div>
    </div>

    <div class="later-choices later-choices--two">
      <button type="button" class="focusable later-choice${todayCls}" id="btn-today" tabindex="0">
        ${iconImg('clock', 'later-choice-icon', 20)}
        <div>
          <div class="later-choice-label">${t('later.today_label')}</div>
          <div class="later-choice-sub pro-hide">${t('later.today_sub')}</div>
        </div>
      </button>
      <button type="button" class="focusable later-choice${tomorrowCls}" id="btn-tomorrow" tabindex="0">
        ${iconImg('clock', 'later-choice-icon', 20)}
        <div>
          <div class="later-choice-label">${t('later.tomorrow_label')}</div>
          <div class="later-choice-sub pro-hide">${t('later.tomorrow_sub')}</div>
        </div>
      </button>
    </div>

    <div class="voice-hint">
      ${loadVoiceMicPill()}
      ${t('later.voice_hint')}
    </div>
  </div>

  ${buildDepotCtaRow(t('btn.later_bevestigen'), { id: 'btn-later-bevestigen', rowClass: 'later-depot-cta pro-hide' })}
</div>`;
        container.querySelector('#btn-today')?.addEventListener('click', () => {
            selected = 'today';
            render();
        });
        container.querySelector('#btn-tomorrow')?.addEventListener('click', () => {
            selected = 'tomorrow';
            render();
        });
        bindDepotCtaRow(container, () => {
            if (selected === 'today')
                skipStopLaterToday();
            else
                completeLaterTomorrow();
        }, { mainSelector: '#btn-later-bevestigen' });
        focusScreen();
    }
    render();
    return () => { };
}

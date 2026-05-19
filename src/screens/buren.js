// Screen: buren — Afgeven bij de buren
// Figma: B 1:539 · E 1:2365 · P 1:5357
import { focusScreen, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { setNeighborChoice, getState } from '@/core/state';
import { completeDelivery } from '@/core/delivery-complete';
import { t } from '@/core/strings';
import { iconImg, loadVoiceMicPill } from '@/ui/icons';
export function mount(container) {
    const state = getState();
    const delivery = state.deliveries[state.activeDeliveryIdx];
    const addr = delivery
        ? `${delivery.address} ${delivery.postcode} ${delivery.city}`.trim()
        : t('buren.address');
    function render(selected) {
        const leftCls = selected === 'left' ? ' nb-choice-active selected' : '';
        const rightCls = selected === 'right' ? ' nb-choice-active selected' : '';
        container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="screen-chip"><img class="chip-icon" src="/assets/icons/badge-icon.svg" alt="" /> ${t('buren.title')}</div>
    <p class="nb-delivery-address">${addr}</p>
    <div class="nb-choices" data-focus-axis="horizontal">
      <button class="focusable nb-choice${leftCls}" id="btn-left" tabindex="0">
        <span class="nb-choice-icon-wrap">${iconImg('icon-home', 'nb-choice-icon', 20)}</span>
        <div>
          <div class="nb-choice-num">${t('buren.left_label')}</div>
          <div class="nb-choice-dir pro-hide">${t('buren.left_dir')}</div>
        </div>
      </button>
      <button class="focusable nb-choice${rightCls}" id="btn-right" tabindex="0">
        <span class="nb-choice-icon-wrap">${iconImg('icon-home', 'nb-choice-icon', 20)}</span>
        <div>
          <div class="nb-choice-num">${t('buren.right_label')}</div>
          <div class="nb-choice-dir pro-hide">${t('buren.right_dir')}</div>
        </div>
      </button>
    </div>
    <div class="voice-hint pro-hide">
      ${loadVoiceMicPill()}
      Zeg <strong>"Links"</strong> of <strong>"Rechts"</strong>
    </div>
  </div>
  ${buildDepotCtaRow(t('btn.neighbor.confirm'), { id: 'btn-buren-bevestigen', rowClass: 'buren-depot-cta' })}
</div>`;
        attachHandlers(selected);
        focusScreen();
    }
    function attachHandlers(selected) {
        container.querySelector('#btn-left')?.addEventListener('click', () => {
            setNeighborChoice('left');
            render('left');
        });
        container.querySelector('#btn-right')?.addEventListener('click', () => {
            setNeighborChoice('right');
            render('right');
        });
        bindDepotCtaRow(container, () => {
            setNeighborChoice(selected);
            completeDelivery({ method: 'neighbor' });
        }, { mainSelector: '#btn-buren-bevestigen' });
    }
    render('left');
    return () => { };
}

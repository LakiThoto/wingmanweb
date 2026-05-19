// Screen: return — post-delivery feedforward (beginner tier)
// Copy: #screen-return

import { focusScreen, buildPrimaryCta } from './_frame';
import { getState, transition } from '@/core/state';
import { t, substitute } from '@/core/strings';
import {
  continueFromReturn,
  returnAutoAdvanceMs,
} from '@/core/delivery-complete';

export function mount(container: HTMLElement): () => void {
  const state = getState();
  const completedCount = state.deliveries.filter(d => d.delivered).length;
  const next = state.deliveries[state.activeDeliveryIdx];
  const nextAddr = next
    ? `${next.address}, ${next.city}`.trim()
    : t('bevestigen.address');

  container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="screen-chip">${t('return.title')}</div>
    <div class="return-check-row">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="var(--green,#4caf50)" stroke-width="1.5"/>
        <path d="M5 8l2.5 2.5L11 5.5" stroke="var(--green,#4caf50)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="return-stop-done-text">${substitute('return.stop.done', { n: String(completedCount) })}</span>
    </div>
    <div class="return-section">
      <span class="return-section-label">${t('return.next.label')}</span>
      <span class="return-next-addr">${nextAddr}</span>
      <span class="return-eta">${t('return.eta.static')}</span>
    </div>
    <div class="return-hint-row cf-hidden pro-hide">
      <span class="return-hint-icon">🐕</span>
      <span class="return-hint-text">${t('return.hint.dog')}</span>
    </div>
  </div>
  <div class="cta-layer">
    ${buildPrimaryCta(t('btn.return.to.van'), { id: 'btn-return-to-van' })}
  </div>
</div>`;

  const autoTimer = setTimeout(() => {
    if (getState().screen === 'return') continueFromReturn();
  }, returnAutoAdvanceMs());

  container.querySelector('#btn-return-to-van')?.addEventListener('click', () => {
    clearTimeout(autoTimer);
    transition('return_continue');
  });

  focusScreen();
  return () => clearTimeout(autoTimer);
}

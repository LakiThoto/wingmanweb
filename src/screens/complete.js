// Screen: complete — route finished
// Figma 1:1868 · Copy: #screen-complete
import { focusScreen, buildPrimaryCta } from './_frame';
import { getState, transition, resetDeliveriesForDemo } from '@/core/state';
import { speakByTier } from '@/core/audio';
import { t } from '@/core/strings';
function formatWalkedKm(stopCount) {
    const km = Math.max(0.8, stopCount * 0.4);
    return `${km.toFixed(1).replace('.', ',')} km`;
}
function formatSuccessRate(delivered, total) {
    if (total <= 0)
        return '100%';
    return `${Math.round((delivered / total) * 100)}%`;
}
export function mount(container) {
    const { deliveries, mode } = getState();
    const deliveredCount = deliveries.filter(d => d.delivered).length;
    const total = deliveries.length;
    speakByTier('voice.route.complete');
    const stackGapClass = mode === 'lab' ? ' screen-stack--cta-gap' : '';
    container.innerHTML = `
<div class="screen-stack complete-stack${stackGapClass}">
  <div class="screen-card screen-card--complete">
    <div class="complete-card-body">
      <header class="screen-chip">${t('complete.title')}</header>
      <p class="complete-sub">${t('complete.sub')}</p>
      <div class="completion-stats" role="group" aria-label="${t('complete.title')}">
        <div class="complete-stat-tile">
          <span class="complete-stat-val" id="complete-stat-deliveries">${deliveredCount}</span>
          <span class="complete-stat-lbl">${t('complete.stat.deliveries')}</span>
        </div>
        <div class="complete-stat-tile">
          <span class="complete-stat-val" id="complete-stat-walked">${formatWalkedKm(total)}</span>
          <span class="complete-stat-lbl">${t('complete.stat.walked')}</span>
        </div>
        <div class="complete-stat-tile">
          <span class="complete-stat-val" id="complete-stat-success">${formatSuccessRate(deliveredCount, total)}</span>
          <span class="complete-stat-lbl">${t('complete.stat.success')}</span>
        </div>
      </div>
    </div>
  </div>
  ${mode === 'lab' ? `<div class="cta-layer">${buildPrimaryCta(t('btn.complete.restart'), { id: 'btn-complete-restart' })}</div>` : ''}
</div>`.trim();
    container.querySelector('#btn-complete-restart')?.addEventListener('click', () => {
        resetDeliveriesForDemo();
        transition('complete_restart');
    });
    focusScreen(container);
    return () => { };
}

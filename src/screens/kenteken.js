// Screen: kenteken — Bus laden
// Figma: B 1:608 · E 1:2061 · P 1:3821
// §7.2: Shows plate, dock, scan counter. P: button label "Start" vs "Start laden".
import { focusScreen, buildPrimaryCta } from './_frame';
import { loadVoiceMicPill } from '@/ui/icons';
import { transition, getState } from '@/core/state';
import { t } from '@/core/strings';
export function mount(container) {
    const state = getState();
    const plate = state.licensePlate || t('kenteken.plate');
    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <header class="screen-chip"><img class="chip-icon" src="/assets/icons/depot-title-icon.svg" width="20" height="20" alt="" aria-hidden="true" decoding="async" /><span class="screen-chip-label">${t('kenteken.title')}</span></header>

    <h1 class="card-title depot-headline">${t('kenteken.title')}</h1>

    <div class="plate-dock-pill">
      <span id="plate-display">${plate}</span>
      <span>${t('kenteken.dock')}</span>
    </div>

    <div class="voice-hint beginner-only">
      ${loadVoiceMicPill()}
      ${t('kenteken.voice_hint')}
    </div>
  </div>

  <div class="cta-layer">
    ${buildPrimaryCta(state.tier === 'pro' ? t('btn.start_laden_short') : t('btn.start_laden'), { id: 'btn-start-laden' })}
  </div>
</div>`;
    const btn = container.querySelector('#btn-start-laden');
    btn.addEventListener('click', () => transition('start_laden'));
    focusScreen();
    return () => { };
}

// Screen: drive — audio-only navigation to stop (Wingman Copy S.DRIVE)
import { buildPrimaryCta } from './_frame';
import { focusScreen } from './_frame';
import { transition, getActiveDelivery, getState } from '@/core/state';
import { speakTierPhrase } from '@/core/audio';
import { t } from '@/core/strings';
/** Match Wingman Copy DRIVE_PHASE_MS */
const DRIVE_PHASE_MS = 13000;
export function mount(container) {
    const delivery = getActiveDelivery();
    const state = getState();
    const stopN = state.activeDeliveryIdx + 1;
    const addr = delivery?.address ?? '';
    container.innerHTML = `
<div class="drive-phase-ui">
  <p class="drive-phase-hint beginner-only">${t('drive.hint')}</p>
  <div class="cta-layer drive-phase-cta">
    ${buildPrimaryCta(t('btn.continue'), { id: 'btn-drive-skip' })}
  </div>
</div>`;
    speakTierPhrase('audio.transition');
    speakTierPhrase('drive.start', { n: String(stopN), addr });
    const timer = setTimeout(() => {
        if (getState().screen === 'drive')
            transition('drive_complete');
    }, DRIVE_PHASE_MS);
    container.querySelector('#btn-drive-skip')?.addEventListener('click', () => {
        if (getState().screen === 'drive')
            transition('drive_complete');
    });
    focusScreen(container);
    return () => clearTimeout(timer);
}

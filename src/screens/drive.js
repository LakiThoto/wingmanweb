// Screen: drive — Figma 1357:14088 audio status bar only (no CTA)
import { focusScreen } from './_frame';
import { transition, getActiveDelivery, getState, isLockerRouteBreakDrive, startPendingLockerSession, } from '@/core/state';
import { speakTierPhrase } from '@/core/audio';
import { t } from '@/core/strings';
import { clearDeliveryAdvanceTimer, getLockerRouteBreakMs, } from '@/core/delivery-complete';
import { deliveryToDestination, startDriveNavigation, stopNavigation, } from '@/core/stop-navigation';
const FALLBACK_DEST = { latitude: 52.631, longitude: 4.748, label: '' };
function buildDriveAudioBar() {
    return `
<div class="drive-screen-stack drive-screen-stack--audio">
  <div class="drive-audio-bar" role="status" aria-live="polite" aria-label="${t('drive.audio.aria')}">
    <img
      class="drive-audio-icon"
      src="/assets/drive/audio-icon.svg"
      width="18"
      height="18"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
    <div class="drive-audio-text">
      <p class="drive-audio-title">${t('drive.audio.title')}</p>
      <p class="drive-audio-sub">${t('drive.audio.sub')}</p>
    </div>
  </div>
</div>`;
}
export function mount(container) {
    container.innerHTML = buildDriveAudioBar();
    if (isLockerRouteBreakDrive()) {
        const pending = getState().pendingLockerIdxs.length;
        const n = String(Math.max(pending, 1));
        clearDeliveryAdvanceTimer();
        speakTierPhrase('audio.transition.locker_route');
        speakTierPhrase('voice.locker.route_break', {
            n,
            name: t('punt.name'),
        });
        const breakTimer = setTimeout(() => {
            if (getState().screen === 'drive' && isLockerRouteBreakDrive()) {
                startPendingLockerSession();
            }
        }, getLockerRouteBreakMs());
        focusScreen(container);
        return () => clearTimeout(breakTimer);
    }
    const delivery = getActiveDelivery();
    const state = getState();
    const stopN = state.activeDeliveryIdx + 1;
    const addr = delivery?.address ?? '';
    const dest = deliveryToDestination(delivery);
    speakTierPhrase('audio.transition');
    speakTierPhrase('drive.start', { n: String(stopN), addr });
    const endDrive = () => {
        if (getState().screen === 'drive')
            transition('drive_complete');
    };
    const stopNav = startDriveNavigation({
        destination: dest ?? { ...FALLBACK_DEST, label: addr },
        onNearDestination: endDrive,
    });
    focusScreen(container);
    return () => {
        stopNav();
        stopNavigation();
    };
}

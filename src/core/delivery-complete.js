// Centralized post-delivery flow — port of WingmanCopy confirmDelivery +
// advanceAfterDelivery + completeLockerHandoff.
import { getTier } from './tier';
import { speakByTier, speakTierPhrase } from './audio';
import { getState, setScreen, markActiveDelivered, allDelivered, skipToNextUndelivered, } from './state';
import { showCompliment } from '@/screens/compliment';
const COMPLIMENT_BY_METHOD = {
    home: 'compliment.delivered',
    neighbor: 'compliment.neighbor',
    safeplace: 'compliment.safeplace',
    locker: 'compliment.locker',
    later_tomorrow: 'compliment.delivered',
};
const RETURN_TIMEOUT_MS = {
    beginner: 7000,
    experienced: 3800,
    pro: 2800,
};
let advanceTimer = null;
function clearAdvanceTimer() {
    if (advanceTimer) {
        clearTimeout(advanceTimer);
        advanceTimer = null;
    }
}
function scheduleAdvance(fn, ms = 1200) {
    clearAdvanceTimer();
    advanceTimer = setTimeout(fn, ms);
}
/** After a delivery is confirmed — compliment/feedback, then next stop or complete. */
export function completeDelivery(opts) {
    if (opts.markDelivered !== false)
        markActiveDelivered();
    const tier = getTier();
    const complimentKey = COMPLIMENT_BY_METHOD[opts.method];
    if (!opts.skipAcknowledgement) {
        if (tier === 'beginner') {
            setTimeout(() => showCompliment(complimentKey), 380);
        }
        else {
            setTimeout(() => speakByTier('feedback.delivery.ok'), 380);
        }
    }
    scheduleAdvance(() => advanceAfterNextStop({ showReturn: tier === 'beginner' }));
}
/** PostNL punt handoff — receipt TTS, no return screen for any tier. */
export function completeLockerHandoff() {
    markActiveDelivered();
    speakByTier('voice.locker.receipt');
    setTimeout(() => speakByTier('feedback.handoff.ok'), 420);
    scheduleAdvance(() => advanceAfterNextStop({ showReturn: false }));
}
/** Later “vandaag” — skip stop without marking delivered. */
export function skipStopLaterToday() {
    speakByTier('voice.later.today');
    skipToNextUndelivered();
    scheduleAdvance(() => advanceAfterNextStop({ showReturn: false }));
}
/** Later “morgen” — mark delivered and advance. */
export function completeLaterTomorrow() {
    completeDelivery({ method: 'later_tomorrow' });
}
export function advanceAfterNextStop(opts) {
    if (allDelivered()) {
        setScreen('complete');
        return;
    }
    const tier = getTier();
    const showReturn = opts?.showReturn ?? tier === 'beginner';
    const state = getState();
    const completedCount = state.deliveries.filter(d => d.delivered).length;
    const next = state.deliveries[state.activeDeliveryIdx];
    const addr = next?.address ?? '';
    if (showReturn) {
        speakTierPhrase('return.feedforward', {
            n: String(completedCount),
            addr,
        });
        setScreen('return');
    }
    else {
        speakByTier('feedback.next.stop');
        scheduleAdvance(() => setScreen('drive'), 1200);
    }
}
export function continueFromReturn() {
    clearAdvanceTimer();
    setScreen('drive');
}
export function returnAutoAdvanceMs() {
    const tier = getTier();
    return RETURN_TIMEOUT_MS[tier] ?? RETURN_TIMEOUT_MS.beginner;
}

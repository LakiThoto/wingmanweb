// Centralized post-delivery flow — port of WingmanCopy confirmDelivery +
// advanceAfterDelivery + completeLockerHandoff.
import { getEffectiveDensityTier } from './tier';
import { speakByTier, speakTierPhrase } from './audio';
import { getState, setScreen, markActiveDelivered, allDelivered, skipToNextUndelivered, applyLockerHandoffChoice, allRouteStopsHandled, hasPendingLockerHandoffs, startPendingLockerSession, completePendingLockerForActive, startNextPendingLocker, } from './state';
import { emit } from './events';
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
export const LOCKER_ROUTE_BREAK_MS = {
    beginner: 6200,
    experienced: 3600,
    pro: 2200,
};
export function getLockerRouteBreakMs() {
    const density = getEffectiveDensityTier();
    return LOCKER_ROUTE_BREAK_MS[density] ?? LOCKER_ROUTE_BREAK_MS.beginner;
}
export function clearDeliveryAdvanceTimer() {
    clearAdvanceTimer();
}
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
    const density = getEffectiveDensityTier();
    const complimentKey = COMPLIMENT_BY_METHOD[opts.method];
    if (!opts.skipAcknowledgement) {
        if (density === 'beginner') {
            setTimeout(() => showCompliment(complimentKey), 380);
        }
        else {
            setTimeout(() => speakByTier('feedback.delivery.ok'), 380);
        }
    }
    scheduleAdvance(() => advanceAfterNextStop({ showReturn: density === 'beginner' }));
}
/** Niet thuis → PostNL Punt: remember for locker after route, or start locker session now. */
export function chooseLockerHandoffFromNietThuis() {
    const result = applyLockerHandoffChoice();
    if (result === 'failed')
        return;
    if (result === 'deferred') {
        speakByTier('feedback.locker.scheduled');
        scheduleAdvance(() => advanceAfterNextStop({ showReturn: getEffectiveDensityTier() === 'beginner' }));
    }
    else if (result === 'started') {
        beginPendingLockerSession();
    }
}
export function beginPendingLockerSession() {
    clearAdvanceTimer();
    setScreen('drive');
}
/** PostNL punt handoff — receipt TTS, then next queued locker package or route end. */
export function completeLockerHandoff() {
    const hasMore = completePendingLockerForActive();
    speakByTier('voice.locker.receipt');
    setTimeout(() => speakByTier('feedback.handoff.ok'), 420);
    scheduleAdvance(() => {
        if (hasMore && startNextPendingLocker()) {
            emit('locker_next_package', { deliveryIdx: getState().activeDeliveryIdx });
            return;
        }
        advanceAfterNextStop({ showReturn: false });
    });
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
    if (allRouteStopsHandled() && hasPendingLockerHandoffs()) {
        beginPendingLockerSession();
        return;
    }
    const density = getEffectiveDensityTier();
    const showReturn = opts?.showReturn ?? density === 'beginner';
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
    const tier = getEffectiveDensityTier();
    return RETURN_TIMEOUT_MS[tier] ?? RETURN_TIMEOUT_MS.beginner;
}

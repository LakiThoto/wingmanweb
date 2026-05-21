import { emit } from './events';
// ── Transition table ───────────────────────────────────────────────────────
const TRANSITIONS = {
    start: {
        kenteken_submitted: 'kenteken',
    },
    kenteken: {
        start_laden: 'scan',
    },
    scan: {
        scan_ok: 'laden',
        scan_fail: 'scan-error',
    },
    'scan-error': {
        scan_retry: 'scan',
    },
    laden: {
        pkg_placed: 'scan',
        all_loaded: 'route',
    },
    route: {
        route_start: 'drive',
    },
    drive: {
        drive_complete: 'zoek',
    },
    zoek: {
        pkg_confirmed: 'walk',
    },
    walk: {
        walk_arrived: 'thuis',
    },
    thuis: {
        ja_thuis: 'bevestigen',
        niet_thuis: 'niet-thuis',
    },
    return: {
        return_continue: 'drive',
    },
    complete: {
        complete_restart: 'start',
    },
    'niet-thuis': {
        kies_buren: 'buren',
        kies_veiligeplek: 'veiligeplek',
        kies_punt: 'punt',
        kies_later: 'later',
    },
};
// ── Runtime state ──────────────────────────────────────────────────────────
let _state = {
    mode: 'lab',
    tier: 'beginner',
    screen: 'start',
    licensePlate: '',
    deliveries: [],
    activeDeliveryIdx: 0,
    pendingLockerIdxs: [],
    scanBuffer: '',
    neighborChoice: 'left',
    safeplaceChoice: 'Voordeur',
};
export function getState() {
    return _state;
}
export function initState(mode, tier, deliveries) {
    _state = {
        mode,
        tier,
        screen: 'start',
        licensePlate: '',
        deliveries,
        activeDeliveryIdx: 0,
        pendingLockerIdxs: [],
        scanBuffer: '',
        neighborChoice: 'left',
        safeplaceChoice: 'Voordeur',
    };
}
export function setLicensePlate(plate) {
    _state = { ..._state, licensePlate: plate };
}
/** Dev / glasses deep-link: jump to a screen without an FSM event. */
export function setScreen(screen) {
    if (_state.screen === screen)
        return;
    const from = _state.screen;
    _state = { ..._state, screen };
    emit('state_change', { from, to: screen });
}
export function setScanBuffer(code) {
    _state = { ..._state, scanBuffer: code };
}
export function setNeighborChoice(choice) {
    _state = { ..._state, neighborChoice: choice };
}
export function setSafeplaceChoice(place) {
    _state = { ..._state, safeplaceChoice: place };
}
export function markActiveLoaded() {
    const deliveries = _state.deliveries.map((d, i) => i === _state.activeDeliveryIdx ? { ...d, loaded: true } : d);
    const nextIdx = deliveries.findIndex(d => !d.loaded);
    _state = {
        ..._state,
        deliveries,
        activeDeliveryIdx: nextIdx === -1 ? _state.activeDeliveryIdx : nextIdx,
    };
}
export function markActiveDelivered() {
    const deliveries = _state.deliveries.map((d, i) => i === _state.activeDeliveryIdx ? { ...d, delivered: true } : d);
    const nextIdx = deliveries.findIndex(d => !d.delivered && !d.pendingLockerHandoff);
    _state = {
        ..._state,
        deliveries,
        activeDeliveryIdx: nextIdx === -1 ? _state.activeDeliveryIdx : nextIdx,
    };
}
export function hasPendingLockerHandoffs() {
    return _state.deliveries.some(d => d.pendingLockerHandoff && !d.delivered);
}
export function isLockerRouteBreakDrive() {
    return allRouteStopsHandled() && hasPendingLockerHandoffs();
}
export function allRouteStopsHandled() {
    return (_state.deliveries.length > 0 &&
        _state.deliveries.every(d => d.delivered || d.pendingLockerHandoff));
}
export function nextRouteDeliveryIdx() {
    return _state.deliveries.findIndex(d => !d.delivered && !d.pendingLockerHandoff);
}
export function startPendingLockerSession() {
    const idx = _state.pendingLockerIdxs.find(i => {
        const d = _state.deliveries[i];
        return d && d.pendingLockerHandoff && !d.delivered;
    }) ?? _state.deliveries.findIndex(d => d.pendingLockerHandoff && !d.delivered);
    if (idx === -1)
        return;
    const from = _state.screen;
    _state = { ..._state, activeDeliveryIdx: idx, screen: 'punt' };
    emit('state_change', { from, to: 'punt' });
}
export function completePendingLockerForActive() {
    const idx = _state.activeDeliveryIdx;
    const deliveries = _state.deliveries.map((d, i) => i === idx ? { ...d, delivered: true, pendingLockerHandoff: false } : d);
    const pendingLockerIdxs = _state.pendingLockerIdxs.filter(i => i !== idx);
    _state = { ..._state, deliveries, pendingLockerIdxs };
    return hasPendingLockerHandoffs();
}
export function startNextPendingLocker() {
    const idx = _state.pendingLockerIdxs.find(i => {
        const d = _state.deliveries[i];
        return d && d.pendingLockerHandoff && !d.delivered;
    }) ?? _state.deliveries.findIndex(d => d.pendingLockerHandoff && !d.delivered);
    if (idx === -1)
        return false;
    _state = { ..._state, activeDeliveryIdx: idx };
    return true;
}
export function applyLockerHandoffChoice() {
    if (_state.screen !== 'niet-thuis')
        return 'failed';
    const idx = _state.activeDeliveryIdx;
    const active = _state.deliveries[idx];
    if (!active || active.delivered || active.pendingLockerHandoff)
        return 'failed';
    const deliveries = _state.deliveries.map((d, i) => i === idx ? { ...d, pendingLockerHandoff: true } : d);
    const pendingLockerIdxs = _state.pendingLockerIdxs.includes(idx)
        ? _state.pendingLockerIdxs
        : [..._state.pendingLockerIdxs, idx];
    const nextRouteIdx = deliveries.findIndex(d => !d.delivered && !d.pendingLockerHandoff);
    _state = { ..._state, deliveries, pendingLockerIdxs };
    if (nextRouteIdx !== -1) {
        _state = { ..._state, activeDeliveryIdx: nextRouteIdx };
        return 'deferred';
    }
    const lockerIdx = pendingLockerIdxs.find(i => {
        const d = deliveries[i];
        return d && d.pendingLockerHandoff && !d.delivered;
    }) ?? idx;
    _state = { ..._state, activeDeliveryIdx: lockerIdx };
    return 'started';
}
export function transition(event) {
    if (event === 'kies_punt') {
        return applyLockerHandoffChoice() !== 'failed';
    }
    const map = TRANSITIONS[_state.screen];
    const next = map?.[event];
    if (!next)
        return false;
    // Loading is done — reset active to first un-delivered for the delivery phase.
    let activeDeliveryIdx = _state.activeDeliveryIdx;
    if (event === 'route_start') {
        const idx = nextRouteDeliveryIdx();
        if (idx !== -1)
            activeDeliveryIdx = idx;
    }
    const from = _state.screen;
    _state = { ..._state, screen: next, activeDeliveryIdx };
    emit('state_change', { from, to: next });
    return true;
}
export function getActiveDelivery() {
    return _state.deliveries[_state.activeDeliveryIdx];
}
export function allLoaded() {
    return _state.deliveries.length > 0 && _state.deliveries.every(d => d.loaded);
}
export function allDelivered() {
    return _state.deliveries.length > 0 && _state.deliveries.every(d => d.delivered);
}
export function setActiveDeliveryIdx(idx) {
    _state = { ..._state, activeDeliveryIdx: idx };
}
/** Advance to next undelivered stop without marking current delivered (later today). */
export function skipToNextUndelivered() {
    const nextIdx = _state.deliveries.findIndex((d, i) => i > _state.activeDeliveryIdx && !d.delivered && !d.pendingLockerHandoff);
    if (nextIdx !== -1)
        setActiveDeliveryIdx(nextIdx);
}
export function resetDeliveriesForDemo() {
    _state = {
        ..._state,
        deliveries: _state.deliveries.map(d => ({
            ...d,
            loaded: false,
            delivered: false,
            pendingLockerHandoff: false,
        })),
        activeDeliveryIdx: 0,
        pendingLockerIdxs: [],
        scanBuffer: '',
    };
}

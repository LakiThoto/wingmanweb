import type { ScreenId, FsmEvent, AppState, Mode, Tier, Delivery } from '@/types';
import { emit } from './events';

// ── Transition table ───────────────────────────────────────────────────────
const TRANSITIONS: Partial<Record<ScreenId, Partial<Record<FsmEvent, ScreenId>>>> = {
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
let _state: AppState = {
  mode: 'lab',
  tier: 'beginner',
  screen: 'start',
  licensePlate: '',
  deliveries: [],
  activeDeliveryIdx: 0,
  scanBuffer: '',
  neighborChoice: 'left',
  safeplaceChoice: 'Voordeur',
};

export function getState(): Readonly<AppState> {
  return _state;
}

export function initState(mode: Mode, tier: Tier, deliveries: Delivery[]): void {
  _state = {
    mode,
    tier,
    screen: 'start',
    licensePlate: '',
    deliveries,
    activeDeliveryIdx: 0,
    scanBuffer: '',
    neighborChoice: 'left',
    safeplaceChoice: 'Voordeur',
  };
}

export function setLicensePlate(plate: string): void {
  _state = { ..._state, licensePlate: plate };
}

/** Dev / glasses deep-link: jump to a screen without an FSM event. */
export function setScreen(screen: ScreenId): void {
  if (_state.screen === screen) return;
  const from = _state.screen;
  _state = { ..._state, screen };
  emit('state_change', { from, to: screen });
}

export function setScanBuffer(code: string): void {
  _state = { ..._state, scanBuffer: code };
}

export function setNeighborChoice(choice: 'left' | 'right'): void {
  _state = { ..._state, neighborChoice: choice };
}

export function setSafeplaceChoice(place: string): void {
  _state = { ..._state, safeplaceChoice: place };
}

export function markActiveLoaded(): void {
  const deliveries = _state.deliveries.map((d, i) =>
    i === _state.activeDeliveryIdx ? { ...d, loaded: true } : d,
  );
  const nextIdx = deliveries.findIndex(d => !d.loaded);
  _state = {
    ..._state,
    deliveries,
    activeDeliveryIdx: nextIdx === -1 ? _state.activeDeliveryIdx : nextIdx,
  };
}

export function markActiveDelivered(): void {
  const deliveries = _state.deliveries.map((d, i) =>
    i === _state.activeDeliveryIdx ? { ...d, delivered: true } : d,
  );
  const nextIdx = deliveries.findIndex(d => !d.delivered);
  _state = {
    ..._state,
    deliveries,
    activeDeliveryIdx: nextIdx === -1 ? _state.activeDeliveryIdx : nextIdx,
  };
}

export function transition(event: FsmEvent): boolean {
  const map = TRANSITIONS[_state.screen];
  const next = map?.[event];
  if (!next) return false;

  // Loading is done — reset active to first un-delivered for the delivery phase.
  let activeDeliveryIdx = _state.activeDeliveryIdx;
  if (event === 'route_start') {
    const idx = _state.deliveries.findIndex(d => !d.delivered);
    if (idx !== -1) activeDeliveryIdx = idx;
  }

  const from = _state.screen;
  _state = { ..._state, screen: next, activeDeliveryIdx };
  emit('state_change', { from, to: next });
  return true;
}

export function getActiveDelivery(): Delivery | undefined {
  return _state.deliveries[_state.activeDeliveryIdx];
}

export function allLoaded(): boolean {
  return _state.deliveries.length > 0 && _state.deliveries.every(d => d.loaded);
}

export function allDelivered(): boolean {
  return _state.deliveries.length > 0 && _state.deliveries.every(d => d.delivered);
}

export function setActiveDeliveryIdx(idx: number): void {
  _state = { ..._state, activeDeliveryIdx: idx };
}

/** Advance to next undelivered stop without marking current delivered (later today). */
export function skipToNextUndelivered(): void {
  const nextIdx = _state.deliveries.findIndex(
    (d, i) => i > _state.activeDeliveryIdx && !d.delivered,
  );
  if (nextIdx !== -1) setActiveDeliveryIdx(nextIdx);
}

export function resetDeliveriesForDemo(): void {
  _state = {
    ..._state,
    deliveries: _state.deliveries.map(d => ({
      ...d,
      loaded: false,
      delivered: false,
    })),
    activeDeliveryIdx: 0,
    scanBuffer: '',
  };
}

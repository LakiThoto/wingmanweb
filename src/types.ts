export type Tier = 'beginner' | 'experienced' | 'pro' | 'custom';
export type Mode = 'glasses' | 'lab';

export type ScreenId =
  | 'start'
  | 'kenteken'
  | 'scan'
  | 'scan-error'
  | 'laden'
  | 'route'
  | 'drive'
  | 'zoek'
  | 'walk'
  | 'thuis'
  | 'bevestigen'
  | 'niet-thuis'
  | 'buren'
  | 'veiligeplek'
  | 'punt'
  | 'later'
  | 'return'
  | 'complete';

export type FsmEvent =
  | 'kenteken_submitted'
  | 'start_laden'
  | 'scan_ok'
  | 'scan_fail'
  | 'scan_retry'
  | 'pkg_placed'
  | 'all_loaded'
  | 'route_start'
  | 'drive_complete'
  | 'pkg_confirmed'
  | 'walk_arrived'
  | 'ja_thuis'
  | 'niet_thuis'
  | 'kies_buren'
  | 'kies_veiligeplek'
  | 'kies_punt'
  | 'kies_later'
  | 'return_continue'
  | 'complete_restart';

export interface Delivery {
  id: string;
  address: string;
  postcode: string;
  city: string;
  rowInVan: string;
  positionInRow: number;
  window: { from: string; to: string };
  latitude?: number;
  longitude?: number;
  parcelCount?: number;
  pickupCount?: number;
  loaded?: boolean;
  delivered?: boolean;
  /** Optional alert above walk HUD card (Figma 1319:13022). */
  addressNotice?: string;
  /** Chosen at “niet thuis” → PostNL Punt; hand off at parcel locker after the route. */
  pendingLockerHandoff?: boolean;
}

export interface AppState {
  mode: Mode;
  tier: Tier;
  screen: ScreenId;
  licensePlate: string;
  deliveries: Delivery[];
  activeDeliveryIdx: number;
  /** Delivery indices queued for end-of-route parcel locker handoff. */
  pendingLockerIdxs: number[];
  scanBuffer: string;
  neighborChoice: 'left' | 'right';
  safeplaceChoice: string;
}

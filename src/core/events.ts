import type { ScreenId, Tier, FsmEvent } from '@/types';
import type { CustomSettings } from './custom-settings';

export interface EventMap {
  state_change: { from: ScreenId; to: ScreenId };
  fsm_event: { event: FsmEvent };
  voice: { transcript: string };
  scan: { code: string };
  tier_change: { tier: Tier };
  custom_settings_change: CustomSettings;
  custom_settings_saved: CustomSettings;
  locker_next_package: { deliveryIdx: number };
}

export type EventKey = keyof EventMap;
type Handler<K extends EventKey> = (data: EventMap[K]) => void;

const listeners = new Map<EventKey, Set<Handler<EventKey>>>();

export function on<K extends EventKey>(event: K, handler: Handler<K>): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  (listeners.get(event) as Set<Handler<K>>).add(handler);
  return () => {
    (listeners.get(event) as Set<Handler<K>> | undefined)?.delete(handler);
  };
}

export function emit<K extends EventKey>(event: K, data: EventMap[K]): void {
  listeners.get(event)?.forEach(h => (h as Handler<K>)(data));
}

// Compliment feedback — tier-adaptive voice only (no on-screen banner).

import { speakByTier } from '@/core/audio';

export function showCompliment(key: string): void {
  speakByTier(key);
}

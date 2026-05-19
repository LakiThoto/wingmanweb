import type { Tier } from '@/types';
import { emit } from './events';

export function setTier(tier: Tier): void {
  document.body.dataset.exp = tier;
  emit('tier_change', { tier });
}

export function getTier(): Tier {
  const val = document.body.dataset.exp;
  if (val === 'beginner' || val === 'experienced' || val === 'pro') return val;
  return 'beginner';
}

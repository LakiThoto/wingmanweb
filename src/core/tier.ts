import type { Tier } from '@/types';
import { emit } from './events';
import { setStateTier } from './state';
import {
  getCustomSettings,
  supportToDensityTier,
  syncCustomDataAttributes,
  type DensityTier,
} from './custom-settings';

export function setTier(tier: Tier): void {
  setStateTier(tier);
  document.body.dataset.exp = tier;
  if (tier === 'custom') {
    const { support } = getCustomSettings();
    document.body.dataset.expDensity = supportToDensityTier(support);
    syncCustomDataAttributes();
  } else {
    delete document.body.dataset.expDensity;
  }
  emit('tier_change', { tier });
}

export function getTier(): Tier {
  const val = document.body.dataset.exp;
  if (
    val === 'beginner' ||
    val === 'experienced' ||
    val === 'pro' ||
    val === 'custom'
  ) {
    return val;
  }
  return 'beginner';
}

/** Effective UI density (custom maps support % → beginner/ervaren/pro). */
export function getEffectiveDensityTier(): DensityTier {
  const tier = getTier();
  if (tier === 'beginner' || tier === 'experienced' || tier === 'pro') return tier;
  const density = document.body.dataset.expDensity;
  if (density === 'beginner' || density === 'experienced' || density === 'pro') {
    return density;
  }
  return supportToDensityTier(getCustomSettings().support);
}

import { emit } from './events';
import { getCustomSettings, supportToDensityTier, syncCustomDataAttributes, } from './custom-settings';
export function setTier(tier) {
    document.body.dataset.exp = tier;
    if (tier === 'custom') {
        const { support } = getCustomSettings();
        document.body.dataset.expDensity = supportToDensityTier(support);
        syncCustomDataAttributes();
    }
    else {
        delete document.body.dataset.expDensity;
    }
    emit('tier_change', { tier });
}
export function getTier() {
    const val = document.body.dataset.exp;
    if (val === 'beginner' ||
        val === 'experienced' ||
        val === 'pro' ||
        val === 'custom') {
        return val;
    }
    return 'beginner';
}
/** Effective UI density (custom maps support % → beginner/ervaren/pro). */
export function getEffectiveDensityTier() {
    const tier = getTier();
    if (tier === 'beginner' || tier === 'experienced' || tier === 'pro')
        return tier;
    const density = document.body.dataset.expDensity;
    if (density === 'beginner' || density === 'experienced' || density === 'pro') {
        return density;
    }
    return supportToDensityTier(getCustomSettings().support);
}

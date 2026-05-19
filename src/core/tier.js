import { emit } from './events';
export function setTier(tier) {
    document.body.dataset.exp = tier;
    emit('tier_change', { tier });
}
export function getTier() {
    const val = document.body.dataset.exp;
    if (val === 'beginner' || val === 'experienced' || val === 'pro')
        return val;
    return 'beginner';
}

// Custom tier sliders — audio / support / voice preset (Figma 1176:44110).
import { emit } from './events';
const STORAGE_KEY = 'wingman_custom_settings';
const DEFAULTS = {
    audio: 20,
    support: 20,
    voiceTier: 'beginner',
};
let draft = { ...DEFAULTS };
function clampPct(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}
function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return { ...DEFAULTS };
        const parsed = JSON.parse(raw);
        return {
            audio: clampPct(parsed.audio ?? DEFAULTS.audio),
            support: clampPct(parsed.support ?? DEFAULTS.support),
            voiceTier: parsed.voiceTier === 'experienced' || parsed.voiceTier === 'pro'
                ? parsed.voiceTier
                : 'beginner',
        };
    }
    catch {
        return { ...DEFAULTS };
    }
}
function persist(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
export function getCustomSettings() {
    return { ...load() };
}
export function resetCustomDraft() {
    draft = { ...load() };
}
export function getCustomDraft() {
    return draft;
}
export function setCustomDraftAudio(pct) {
    draft = { ...draft, audio: clampPct(pct) };
    syncCustomDataAttributes();
    emit('custom_settings_change', { ...draft });
}
export function setCustomDraftSupport(pct) {
    draft = { ...draft, support: clampPct(pct) };
    syncCustomDataAttributes();
    emit('custom_settings_change', { ...draft });
}
export function adjustCustomDraftSupport(delta) {
    const next = clampPct(draft.support + delta);
    setCustomDraftSupport(next);
    return next;
}
export function setCustomDraftVoiceTier(tier) {
    draft = { ...draft, voiceTier: tier };
    emit('custom_settings_change', { ...draft });
}
/** Persist draft, activate custom tier, apply support-derived UI density. */
export function saveCustomSettings() {
    draft = {
        audio: clampPct(draft.audio),
        support: clampPct(draft.support),
        voiceTier: draft.voiceTier,
    };
    persist(draft);
    syncCustomDataAttributes();
    emit('custom_settings_saved', { ...draft });
    return { ...draft };
}
/** Map support % to hint density while in custom mode. */
export function supportToDensityTier(support) {
    if (support <= 33)
        return 'pro';
    if (support <= 66)
        return 'experienced';
    return 'beginner';
}
export function syncCustomDataAttributes() {
    const s = draft;
    document.body.dataset.customAudio = String(s.audio);
    document.body.dataset.customSupport = String(s.support);
    document.body.dataset.customVoice = s.voiceTier;
}
resetCustomDraft();
syncCustomDataAttributes();

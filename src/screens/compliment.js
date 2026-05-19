// Compliment banner — visually beginner-only (tier.css hides non-beginner),
// but the spoken compliment adapts per tier via speakByTier(). Dwell time
// shortens as tier ramps up — beginners read the message, pros hear nothing
// and move on instantly.
import { STRINGS, t } from '@/core/strings';
import { speakByTier } from '@/core/audio';
import { getTier } from '@/core/tier';
const DWELL_MS = {
    beginner: 2400,
    experienced: 1200,
    pro: 0,
};
let bannerEl = null;
let hideTimer = null;
function ensureBanner() {
    if (bannerEl)
        return bannerEl;
    const el = document.createElement('div');
    el.className = 'compliment-banner';
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = [
        'position:fixed',
        'top:20px',
        'left:50%',
        'transform:translateX(-50%)',
        'background:rgba(34,197,94,.92)',
        'color:#fff',
        'padding:10px 20px',
        'border-radius:40px',
        'z-index:9999',
        'font-weight:600',
        'font-size:15px',
        'pointer-events:none',
        'display:none',
        'white-space:nowrap',
    ].join(';');
    document.body.appendChild(el);
    bannerEl = el;
    return el;
}
export function showCompliment(key) {
    const tier = getTier();
    // Speak the tier-specific variant (no-op for empty pro strings).
    speakByTier(key);
    // Pro tier: zero dwell — no banner shown. Speed beats encouragement.
    const dwell = DWELL_MS[tier];
    if (dwell <= 0)
        return;
    // Banner text prefers the longest variant we have for this tier, falling
    // back to the flat key. tier.css still hides the banner outright for
    // non-beginner tiers — so for experienced this is effectively a no-op
    // visually, but the spoken line is heard.
    const tieredText = STRINGS[`${key}.${tier}`];
    const el = ensureBanner();
    el.textContent = tieredText || t(key);
    el.style.display = 'block';
    el.classList.add('compliment-visible');
    if (hideTimer)
        clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        el.style.display = 'none';
        el.classList.remove('compliment-visible');
    }, dwell);
}

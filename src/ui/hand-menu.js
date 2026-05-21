// Assistant settings overlay — voice "menu", gesture wingman:hand_open, Figma 1:979.
import { setTier, getTier } from '@/core/tier';
import { on } from '@/core/events';
import { getState } from '@/core/state';
import { t } from '@/core/strings';
import { iconImg, settingsIcon } from '@/ui/icons';
import { runCtaEntranceAnimations } from '@/core/cta-animate';
import { resetCustomDraft, setCustomDraftAudio, setCustomDraftSupport, setCustomDraftVoiceTier, adjustCustomDraftSupport, saveCustomSettings, getCustomDraft, } from '@/core/custom-settings';
const LANG_KEY = 'wingman_lang';
let overlayEl = null;
let isOpen = false;
let isCustomView = false;
let appLang = 'nl';
let gesturePulseTimer = null;
function getScreenStage() {
    return document.querySelector('#app .screen-stage');
}
function attachHandMenuToStage() {
    if (!overlayEl)
        return;
    const stage = getScreenStage();
    if (!stage)
        return;
    if (overlayEl.parentElement !== stage)
        stage.appendChild(overlayEl);
}
function setStageMenuOpen(open) {
    getScreenStage()?.classList.toggle('is-menu-open', open);
}
/** Settings menu is only available on the start (kenteken) screen. */
export const MENU_SCREEN = 'start';
export function canOpenHandMenu() {
    return getState().screen === MENU_SCREEN;
}
export function isHandMenuCustomViewOpen() {
    return isOpen && isCustomView;
}
export function onHandMenuCustomSupportChange(delta) {
    adjustCustomDraftSupport(delta);
    syncCustomPanelUi();
    pulseSupportGesture();
}
function loadLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'nl' || stored === 'en' || stored === 'ar' || stored === 'pl')
        return stored;
    return 'nl';
}
function setLang(lang) {
    appLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.body.dataset.lang = lang;
    syncMenuSelection();
}
function circleTile(id, label, inner, active, opts = {}) {
    const dataTier = opts.tier ? ` data-tier="${opts.tier}"` : '';
    const dataLang = opts.lang ? ` data-lang="${opts.lang}"` : '';
    const dataVoice = opts.voiceTier ? ` data-voice-tier="${opts.voiceTier}"` : '';
    return `
<button type="button" class="focusable menu-circle-tile${active ? ' menu-circle-active' : ''}" id="${id}"${dataTier}${dataLang}${dataVoice} tabindex="0">
  <span class="menu-circle-btn">${inner}</span>
  <span class="menu-circle-label">${label}</span>
</button>`.trim();
}
function sliderSection(id, labelKey, valueId, extraClass = '') {
    return `
<section class="menu-slider-section${extraClass ? ` ${extraClass}` : ''}" aria-labelledby="${id}-label">
  <div class="menu-slider-head">
    <h2 class="menu-slider-label" id="${id}-label">${t(labelKey)}</h2>
    <p class="menu-slider-value" id="${valueId}">20%</p>
  </div>
  <div class="menu-slider-track" aria-hidden="true">
    <div class="menu-slider-fill" id="${id}-fill"></div>
  </div>
</section>`.trim();
}
function buildHTML() {
    appLang = loadLang();
    document.body.dataset.lang = appLang;
    resetCustomDraft();
    const tier = getTier();
    const draft = getCustomDraft();
    const expIconBeginner = iconImg('depot-title-icon', 'menu-circle-icon', 24);
    const expIconErvaren = iconImg('clock', 'menu-circle-icon', 24);
    const expIconPro = iconImg('pill-check', 'menu-circle-icon', 24);
    const expIconCustom = settingsIcon('menu-circle-icon', 24);
    return `
<div id="hand-menu" class="hand-menu" hidden aria-hidden="true">
  <div class="hand-menu-backdrop" data-hand-menu-dismiss></div>
  <div class="menu-stack screen-stack screen-stack--cta-gap">
    <div class="menu-panel menu-panel--main">
      <div class="screen-card menu-card">
        <header class="screen-chip">${t('start.settings_title')}</header>

        <section class="menu-section" aria-labelledby="menu-exp-label">
          <h2 class="menu-section-label" id="menu-exp-label">${t('menu.exp.section')}</h2>
          <div class="menu-circle-grid" data-focus-axis="horizontal">
            ${circleTile('menu-exp-beginner', 'Beginner', expIconBeginner, tier === 'beginner', { tier: 'beginner' })}
            ${circleTile('menu-exp-experienced', 'Ervaren', expIconErvaren, tier === 'experienced', { tier: 'experienced' })}
            ${circleTile('menu-exp-pro', 'Pro', expIconPro, tier === 'pro', { tier: 'pro' })}
            ${circleTile('menu-exp-custom', 'Custom', expIconCustom, tier === 'custom', { tier: 'custom' })}
          </div>
        </section>

        <section class="menu-section" aria-labelledby="menu-lang-label">
          <h2 class="menu-section-label" id="menu-lang-label">${t('start.lang_label')}</h2>
          <div class="menu-circle-grid menu-lang-grid" data-focus-axis="horizontal">
            ${circleTile('menu-lang-nl', 'Nederlands', '<span class="menu-circle-flag">🇳🇱</span>', appLang === 'nl', { lang: 'nl' })}
            ${circleTile('menu-lang-en', 'Engels', '<span class="menu-circle-flag">🇬🇧</span>', appLang === 'en', { lang: 'en' })}
            ${circleTile('menu-lang-ar', 'Arabisch', '<span class="menu-circle-flag">🇸🇦</span>', appLang === 'ar', { lang: 'ar' })}
            ${circleTile('menu-lang-pl', 'Pools', '<span class="menu-circle-flag">🇵🇱</span>', appLang === 'pl', { lang: 'pl' })}
          </div>
        </section>
      </div>
    </div>

    <div class="menu-panel menu-panel--custom" hidden>
      <div class="screen-card menu-card menu-custom-card">
        <header class="screen-chip">
          ${settingsIcon('chip-icon', 20)}
          <span class="screen-chip-label">${t('menu.custom.title')}</span>
        </header>

        ${sliderSection('menu-custom-audio', 'menu.custom.audio', 'menu-custom-audio-value')}

        ${sliderSection('menu-custom-support', 'menu.custom.support', 'menu-custom-support-value', 'menu-custom-support')}
        <p class="menu-gesture-hint pro-hide">${t('menu.custom.gesture_hint')}</p>

        <section class="menu-section menu-voice-section" aria-labelledby="menu-custom-voice-label">
          <h2 class="menu-section-label" id="menu-custom-voice-label">${t('menu.custom.voice')}</h2>
          <div class="menu-circle-grid menu-custom-voice-grid" data-focus-axis="horizontal">
            ${circleTile('menu-custom-voice-beginner', 'Beginner', expIconBeginner, draft.voiceTier === 'beginner', { voiceTier: 'beginner' })}
            ${circleTile('menu-custom-voice-experienced', 'Ervaren', expIconErvaren, draft.voiceTier === 'experienced', { voiceTier: 'experienced' })}
            ${circleTile('menu-custom-voice-pro', 'Pro', expIconPro, draft.voiceTier === 'pro', { voiceTier: 'pro' })}
            ${circleTile('menu-custom-voice-custom', 'Custom', expIconCustom, true, { voiceTier: 'beginner' })}
          </div>
        </section>
      </div>
    </div>

    <div class="cta-layer menu-cta-row menu-cta-main depot-cta-row">
      <div class="depot-cta-ai" aria-hidden="true">
        <div class="ai-icon-shape">
          <img src="/assets/ai-icon.png" class="ai-triangle" alt="" width="52" height="52" decoding="async" />
        </div>
      </div>
      <button type="button" class="focusable btn-primary btn-primary--menu-close depot-start-btn" id="btn-menu-close" tabindex="0" aria-label="${t('btn.menu.close')}">
        <div class="ai-text-pill depot-start-pill menu-close-pill">
          <span class="menu-close-x" aria-hidden="true">✕</span>
          <span class="ai-btn-text">${t('btn.menu.close')}</span>
        </div>
      </button>
    </div>

    <div class="cta-layer menu-cta-row menu-cta-custom depot-cta-row" hidden>
      <div class="depot-cta-ai" aria-hidden="true">
        <div class="ai-icon-shape">
          <img src="/assets/ai-icon.png" class="ai-triangle" alt="" width="52" height="52" decoding="async" />
        </div>
      </div>
      <button type="button" class="focusable btn-primary depot-start-btn" id="btn-custom-save" tabindex="0" aria-label="${t('menu.custom.save')}">
        <div class="ai-text-pill depot-start-pill menu-save-pill">
          <svg class="menu-save-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 21h14a1 1 0 0 0 1-1V8l-5-4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" stroke="currentColor" stroke-width="1.6"/>
            <path d="M9 17h6M12 3v9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span class="ai-btn-text">${t('menu.custom.save')}</span>
        </div>
      </button>
    </div>
  </div>
</div>`.trim();
}
function setSliderUi(valueId, fillId, pct) {
    const valueEl = overlayEl?.querySelector(`#${valueId}`);
    const fillEl = overlayEl?.querySelector(`#${fillId}`);
    if (valueEl)
        valueEl.textContent = `${pct}%`;
    if (fillEl)
        fillEl.style.width = `${pct}%`;
}
function syncCustomPanelUi() {
    if (!overlayEl)
        return;
    const draft = getCustomDraft();
    setSliderUi('menu-custom-audio-value', 'menu-custom-audio-fill', draft.audio);
    setSliderUi('menu-custom-support-value', 'menu-custom-support-fill', draft.support);
    overlayEl.querySelectorAll('[data-voice-tier]').forEach(btn => {
        const active = btn.dataset.voiceTier === draft.voiceTier;
        btn.classList.toggle('menu-circle-active', active);
    });
    const customTile = overlayEl.querySelector('#menu-custom-voice-custom');
    customTile?.classList.add('menu-circle-active');
}
function pulseSupportGesture() {
    const section = overlayEl?.querySelector('.menu-custom-support');
    if (!section)
        return;
    section.classList.add('is-gesture-active');
    if (gesturePulseTimer)
        clearTimeout(gesturePulseTimer);
    gesturePulseTimer = setTimeout(() => {
        section.classList.remove('is-gesture-active');
    }, 200);
}
function syncMenuSelection() {
    if (!overlayEl)
        return;
    const tier = getTier();
    overlayEl.querySelectorAll('[data-tier]').forEach(btn => {
        const active = btn.dataset.tier === tier;
        btn.classList.toggle('menu-circle-active', active);
    });
    overlayEl.querySelectorAll('[data-lang]').forEach(btn => {
        const active = btn.dataset.lang === appLang;
        btn.classList.toggle('menu-circle-active', active);
    });
}
function showMainMenuView() {
    if (!overlayEl)
        return;
    isCustomView = false;
    overlayEl.classList.remove('is-custom-view');
    overlayEl.querySelector('.menu-panel--main')?.removeAttribute('hidden');
    overlayEl.querySelector('.menu-panel--custom')?.setAttribute('hidden', '');
    overlayEl.querySelector('.menu-cta-main')?.removeAttribute('hidden');
    overlayEl.querySelector('.menu-cta-custom')?.setAttribute('hidden', '');
    syncMenuSelection();
}
function showCustomMenuView() {
    if (!overlayEl)
        return;
    isCustomView = true;
    resetCustomDraft();
    overlayEl.classList.add('is-custom-view');
    overlayEl.querySelector('.menu-panel--main')?.setAttribute('hidden', '');
    overlayEl.querySelector('.menu-panel--custom')?.removeAttribute('hidden');
    overlayEl.querySelector('.menu-cta-main')?.setAttribute('hidden', '');
    overlayEl.querySelector('.menu-cta-custom')?.removeAttribute('hidden');
    syncCustomPanelUi();
    requestAnimationFrame(() => {
        overlayEl?.querySelector('#btn-custom-save')?.focus();
        runCtaEntranceAnimations(overlayEl ?? document);
    });
}
function attachHandlers() {
    if (!overlayEl)
        return;
    overlayEl.querySelector('[data-hand-menu-dismiss]')?.addEventListener('click', () => {
        showMainMenuView();
        closeHandMenu();
    });
    overlayEl.querySelector('#btn-menu-close')?.addEventListener('click', closeHandMenu);
    overlayEl.querySelectorAll('[data-tier]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tier = btn.dataset.tier;
            if (tier === 'custom') {
                showCustomMenuView();
                return;
            }
            if (tier === 'beginner' || tier === 'experienced' || tier === 'pro') {
                setTier(tier);
                syncMenuSelection();
            }
        });
    });
    overlayEl.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === 'nl' || lang === 'en' || lang === 'ar' || lang === 'pl') {
                setLang(lang);
            }
        });
    });
    overlayEl.querySelector('#menu-custom-audio')?.addEventListener('click', () => {
        const draft = getCustomDraft();
        setCustomDraftAudio(draft.audio >= 100 ? 0 : draft.audio + 20);
        syncCustomPanelUi();
    });
    overlayEl.querySelector('#menu-custom-support')?.addEventListener('click', (e) => {
        const track = e.currentTarget.querySelector('.menu-slider-track');
        if (!track)
            return;
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setCustomDraftSupport(Math.round(ratio * 100));
        syncCustomPanelUi();
    });
    overlayEl.querySelectorAll('[data-voice-tier]').forEach(btn => {
        btn.addEventListener('click', () => {
            const vt = btn.dataset.voiceTier;
            if (vt === 'beginner' || vt === 'experienced' || vt === 'pro') {
                setCustomDraftVoiceTier(vt);
                syncCustomPanelUi();
            }
        });
    });
    overlayEl.querySelector('#btn-custom-save')?.addEventListener('click', () => {
        saveCustomSettings();
        setTier('custom');
        showMainMenuView();
        syncMenuSelection();
        runCtaEntranceAnimations(overlayEl ?? document);
    });
}
function emitMenuOpenChange() {
    document.dispatchEvent(new CustomEvent('wingman:hand_menu', { detail: { open: isOpen } }));
}
export function openHandMenu() {
    if (!overlayEl || !canOpenHandMenu())
        return;
    attachHandMenuToStage();
    showMainMenuView();
    isOpen = true;
    overlayEl.hidden = false;
    overlayEl.setAttribute('aria-hidden', 'false');
    setStageMenuOpen(true);
    emitMenuOpenChange();
    syncMenuSelection();
    requestAnimationFrame(() => {
        const first = overlayEl?.querySelector('.menu-panel--main .menu-circle-tile');
        first?.focus();
        const closeBtn = overlayEl?.querySelector('#btn-menu-close');
        if (closeBtn) {
            closeBtn.classList.remove('btn-ready');
            setTimeout(() => {
                closeBtn.classList.add('btn-ready');
                runCtaEntranceAnimations(overlayEl ?? document);
            }, 60);
        }
    });
}
export function closeHandMenu() {
    if (!overlayEl || !isOpen)
        return;
    showMainMenuView();
    isOpen = false;
    overlayEl.hidden = true;
    overlayEl.setAttribute('aria-hidden', 'true');
    setStageMenuOpen(false);
    emitMenuOpenChange();
}
export function toggleHandMenu() {
    if (isOpen)
        closeHandMenu();
    else if (canOpenHandMenu())
        openHandMenu();
}
export function isHandMenuOpen() {
    return isOpen;
}
export function initHandMenu() {
    const mountParent = getScreenStage() ?? document.body;
    mountParent.insertAdjacentHTML('beforeend', buildHTML());
    overlayEl = document.getElementById('hand-menu');
    if (!overlayEl)
        return;
    attachHandMenuToStage();
    attachHandlers();
    syncMenuSelection();
    on('tier_change', () => syncMenuSelection());
    document.addEventListener('wingman:dismiss', () => {
        if (isOpen)
            closeHandMenu();
    });
    document.addEventListener('wingman:hand_open', () => {
        if (canOpenHandMenu())
            openHandMenu();
    });
    on('state_change', ({ to }) => {
        attachHandMenuToStage();
        if (to !== MENU_SCREEN && isOpen)
            closeHandMenu();
    });
}

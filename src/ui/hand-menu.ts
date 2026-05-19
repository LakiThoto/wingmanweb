// Assistant settings overlay — voice "menu", gesture wingman:hand_open, Figma 1:979.

import { setTier, getTier } from '@/core/tier';
import { on } from '@/core/events';
import { t } from '@/core/strings';
import { iconImg } from '@/ui/icons';
import { runCtaEntranceAnimations } from '@/core/cta-animate';
import type { Tier } from '@/types';

const LANG_KEY = 'wingman_lang';
type AppLang = 'nl' | 'en' | 'ar' | 'pl';

let overlayEl: HTMLElement | null = null;
let isOpen = false;
let appLang: AppLang = 'nl';

function loadLang(): AppLang {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === 'nl' || stored === 'en' || stored === 'ar' || stored === 'pl') return stored;
  return 'nl';
}

function setLang(lang: AppLang): void {
  appLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.body.dataset.lang = lang;
  syncMenuSelection();
}

function circleTile(
  id: string,
  label: string,
  inner: string,
  active: boolean,
  opts: { tier?: Tier; lang?: AppLang; disabled?: boolean } = {},
): string {
  const dataTier = opts.tier ? ` data-tier="${opts.tier}"` : '';
  const dataLang = opts.lang ? ` data-lang="${opts.lang}"` : '';
  const disabled = opts.disabled ? ' disabled aria-disabled="true"' : '';
  return `
<button type="button" class="focusable menu-circle-tile${active ? ' menu-circle-active' : ''}" id="${id}"${dataTier}${dataLang}${disabled} tabindex="0">
  <span class="menu-circle-btn">${inner}</span>
  <span class="menu-circle-label">${label}</span>
</button>`.trim();
}

function buildHTML(): string {
  appLang = loadLang();
  document.body.dataset.lang = appLang;

  const tier = getTier();
  const expIconBeginner = iconImg('depot-title-icon', 'menu-circle-icon', 24);
  const expIconErvaren = iconImg('clock', 'menu-circle-icon', 24);
  const expIconPro = iconImg('pill-check', 'menu-circle-icon', 24);
  const expIconCustom = `<svg class="menu-circle-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.6"/><path d="M19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2-1.5a1 1 0 0 0 .2-1.3l-1.9-3.3a1 1 0 0 0-1.2-.5l-2.4 1a8 8 0 0 0-1.7-1l-.4-2.5A1 1 0 0 0 14 2h-4a1 1 0 0 0-1 .8l-.4 2.5a8 8 0 0 0-1.7 1l-2.4-1a1 1 0 0 0-1.2.5L2.3 8.2a1 1 0 0 0 .2 1.3L4.6 11a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2 1.5a1 1 0 0 0-.2 1.3l1.9 3.3a1 1 0 0 0 1.2.5l2.4-1a8 8 0 0 0 1.7 1l.4 2.5a1 1 0 0 0 1 .8h4a1 1 0 0 0 1-.8l.4-2.5a8 8 0 0 0 1.7-1l2.4 1a1 1 0 0 0 1.2-.5l1.9-3.3a1 1 0 0 0-.2-1.3l-2-1.5Z" stroke="currentColor" stroke-width="1.2"/></svg>`;

  return `
<div id="hand-menu" class="hand-menu" hidden aria-hidden="true">
  <div class="hand-menu-backdrop" data-hand-menu-dismiss></div>
  <div class="menu-stack">
    <div class="screen-card menu-card">
      <header class="screen-chip menu-title-chip">${t('start.settings_title')}</header>

      <section class="menu-section" aria-labelledby="menu-exp-label">
        <h2 class="menu-section-label" id="menu-exp-label">${t('menu.exp.section')}</h2>
        <div class="menu-circle-grid" data-focus-axis="horizontal">
          ${circleTile('menu-exp-beginner', 'Beginner', expIconBeginner, tier === 'beginner', { tier: 'beginner' })}
          ${circleTile('menu-exp-experienced', 'Ervaren', expIconErvaren, tier === 'experienced', { tier: 'experienced' })}
          ${circleTile('menu-exp-pro', 'Pro', expIconPro, tier === 'pro', { tier: 'pro' })}
          ${circleTile('menu-exp-custom', 'Custom', expIconCustom, false, { disabled: true })}
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

    <div class="cta-layer menu-cta-row depot-cta-row">
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
  </div>
</div>`.trim();
}

function syncMenuSelection(): void {
  if (!overlayEl) return;
  const tier = getTier();
  overlayEl.querySelectorAll<HTMLButtonElement>('[data-tier]').forEach(btn => {
    const active = btn.dataset.tier === tier;
    btn.classList.toggle('menu-circle-active', active);
  });
  overlayEl.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach(btn => {
    const active = btn.dataset.lang === appLang;
    btn.classList.toggle('menu-circle-active', active);
  });
}

function attachHandlers(): void {
  if (!overlayEl) return;

  overlayEl.querySelector('[data-hand-menu-dismiss]')?.addEventListener('click', closeHandMenu);
  overlayEl.querySelector('#btn-menu-close')?.addEventListener('click', closeHandMenu);

  overlayEl.querySelectorAll<HTMLButtonElement>('[data-tier]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.tier;
      if (tier === 'beginner' || tier === 'experienced' || tier === 'pro') {
        setTier(tier);
        syncMenuSelection();
      }
    });
  });

  overlayEl.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === 'nl' || lang === 'en' || lang === 'ar' || lang === 'pl') {
        setLang(lang);
      }
    });
  });
}

function emitMenuOpenChange(): void {
  document.dispatchEvent(
    new CustomEvent('wingman:hand_menu', { detail: { open: isOpen } }),
  );
}

export function openHandMenu(): void {
  if (!overlayEl) return;
  isOpen = true;
  overlayEl.hidden = false;
  overlayEl.setAttribute('aria-hidden', 'false');
  emitMenuOpenChange();
  syncMenuSelection();
  requestAnimationFrame(() => {
    const first = overlayEl?.querySelector<HTMLElement>('.menu-circle-tile:not([disabled])');
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

export function closeHandMenu(): void {
  if (!overlayEl || !isOpen) return;
  isOpen = false;
  overlayEl.hidden = true;
  overlayEl.setAttribute('aria-hidden', 'true');
  emitMenuOpenChange();
}

export function toggleHandMenu(): void {
  if (isOpen) closeHandMenu();
  else openHandMenu();
}

export function isHandMenuOpen(): boolean {
  return isOpen;
}

export function initHandMenu(): void {
  document.body.insertAdjacentHTML('beforeend', buildHTML());
  overlayEl = document.getElementById('hand-menu');
  if (!overlayEl) return;
  attachHandlers();
  syncMenuSelection();

  on('tier_change', () => syncMenuSelection());

  document.addEventListener('wingman:dismiss', () => {
    if (isOpen) closeHandMenu();
  });

  document.addEventListener('wingman:hand_open', () => openHandMenu());
}

// Screen: veiligeplek — Veilige plek (pick location → confirm)
// Figma pick 1:436 · confirm 1:584

import { focusScreen, buildDepotCtaRow, bindDepotCtaRow } from './_frame';
import { playPhaseEnter } from '@/core/screen-transition';
import { setSafeplaceChoice, getActiveDelivery } from '@/core/state';
import { completeDelivery } from '@/core/delivery-complete';
import { t } from '@/core/strings';
import { iconImg } from '@/ui/icons';

type SpPhase = 'pick' | 'place_confirm';

const PLACES = [
  { key: 'sp.voordeur', icon: 'sp-door', val: 'de voordeur' },
  { key: 'sp.achtertuin', icon: 'sp-garden', val: 'de achtertuin' },
  { key: 'sp.fietsenstalling', icon: 'sp-bike', val: 'de fietsenstalling' },
  { key: 'sp.anders', icon: 'sp-more', val: 'een door jou gekozen plek' },
];

function buildSpConfirmCard(address: string, pkgCount: string, tracking: string): string {
  return `
<div class="screen-card cf-card cf-delivered-card sp-confirm-card">
  <div class="cf-card-body cf-branch-inner cf-delivered-body">
    <header class="screen-chip cf-badge cf-badge--grid">
      <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" class="chip-icon" aria-hidden="true" decoding="async" />
      <span class="screen-chip-label">${t('bevestigen.title')}</span>
    </header>
    <div class="cf-delivered-tile">
      <div class="cf-delivered-tile-top">
        <div class="cf-delivered-status">
          <div class="cf-delivered-check" aria-hidden="true">
            <img src="/assets/confirm/tile-check.svg" width="20" height="20" alt="" />
          </div>
          <span class="cf-delivered-status-label">${t('bevestigen.success')}</span>
        </div>
        <p class="cf-delivered-address">${address}</p>
      </div>
      <div class="cf-meta-row">
        <div class="cf-meta-group">
          <img src="/assets/confirm/parcel-arrow.svg" width="24" height="24" alt="" class="cf-meta-img cf-meta-img--deliver" aria-hidden="true" />
          <span class="cf-pkg-count">${pkgCount}</span>
        </div>
        <div class="cf-meta-group cf-meta-group--code">
          <img src="/assets/confirm/barcode.svg" width="24" height="24" alt="" class="cf-meta-img" aria-hidden="true" />
          <span class="cf-tracking">${tracking}</span>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function buildSpPickCard(addr: string, selectedKey: string): string {
  return `
<div class="screen-card cf-card cf-branch-card sp-branch-card">
  <div class="cf-card-body cf-branch-inner cf-branch-figma-inner">
    <header class="screen-chip cf-badge cf-badge--grid">
      ${iconImg('alt-safeplace', 'chip-icon', 20)}
      <span class="screen-chip-label">${t('veiligeplek.title')}</span>
    </header>
    <p class="cf-branch-address cf-branch-address--figma sp-address">${addr}</p>
    <div class="sp-pick-block">
      <div class="sp-grid sp-tiles-figma" data-focus-axis="horizontal">
        ${PLACES.map(p => `
        <button type="button" class="focusable sp-tile cf-shortcut-tile${selectedKey === p.key ? ' sp-tile-active' : ''}" data-key="${p.key}" data-val="${p.val}" tabindex="0">
          ${iconImg(p.icon, 'sp-tile-icon cf-shortcut-tile__icon', 32)}
          <span class="sp-tile-label cf-shortcut-tile__label">${t(p.key)}</span>
        </button>
        `).join('')}
      </div>
      <p class="cf-voice-hint-text cf-voice-hint-text--figma sp-voice-hint">
        <span class="cf-voice-dim">${t('veiligeplek.voice_prefix')}</span><span class="cf-voice-em">${t('veiligeplek.voice_em')}</span>
      </p>
    </div>
  </div>
</div>`;
}

export function mount(container: HTMLElement): () => void {
  let phase: SpPhase = 'pick';
  let hasRendered = false;
  let selectedVal = PLACES[0].val;
  let selectedKey = PLACES[0].key;

  const delivery = getActiveDelivery();
  const addr = delivery
    ? `${delivery.address} ${delivery.postcode} ${delivery.city}`.trim()
    : t('veiligeplek.address');
  const shortAddr = delivery?.address ?? t('veiligeplek.address_short');
  const pkgCount = String(delivery?.parcelCount ?? 1);
  const tracking = delivery?.id ?? '—';

  function finish(): void {
    setSafeplaceChoice(selectedVal);
    completeDelivery({ method: 'safeplace' });
  }

  function render(): void {
    const isPick = phase === 'pick';
    const isConfirm = phase === 'place_confirm';

    const cardBlock = isConfirm
      ? buildSpConfirmCard(shortAddr, pkgCount, tracking)
      : buildSpPickCard(addr, selectedKey);

    const ctaLabel = isConfirm ? t('bevestigen.success') : t('btn.veiligeplek_confirm');
    const ctaId = isConfirm ? 'btn-sp-confirm' : 'btn-sp-to-confirm';

    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap sp-screen cf-screen-stack cf-branch-stack cf-branch-figma${isConfirm ? ' sp-screen--confirm' : ''}">
  ${cardBlock}
  ${buildDepotCtaRow(ctaLabel, { id: ctaId, rowClass: 'sp-depot-cta' })}
</div>`;

    container.querySelectorAll<HTMLButtonElement>('.sp-tile').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedKey = btn.dataset.key ?? selectedKey;
        selectedVal = btn.dataset.val ?? selectedVal;
        render();
      });
    });

    if (isPick) {
      bindDepotCtaRow(container, () => {
        phase = 'place_confirm';
        render();
      }, { mainSelector: '#btn-sp-to-confirm' });
    } else {
      bindDepotCtaRow(container, finish, { mainSelector: '#btn-sp-confirm' });
    }

    if (hasRendered) playPhaseEnter(container);
    hasRendered = true;
    focusScreen(container);
  }

  render();
  return () => {};
}

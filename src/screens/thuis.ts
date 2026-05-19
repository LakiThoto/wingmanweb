// Screen: thuis — recipient at door
// Figma: B 1:1640 · E 1:3195 · P 1:4778
// §7.7: YES/NO CTA (WingmanCopy #screen-recipient)

import { focusScreen } from './_frame';
import { transition, getActiveDelivery } from '@/core/state';
import { iconImg, loadVoiceMicPill } from '@/ui/icons';
import { t } from '@/core/strings';

export function mount(container: HTMLElement): () => void {
  const delivery = getActiveDelivery();
  const address = delivery?.address ?? t('thuis.address');
  const pkg = delivery?.id ?? t('thuis.package_code');

  container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap rc-screen-stack">
  <div class="screen-card rc-card">
    <div class="rc-card-body">
      <div class="screen-chip">
        <img class="chip-icon" src="/assets/icons/pin.svg" alt="" />
        Afleveren
      </div>

      <div class="rc-inner-tile">
        <p class="rc-drop-address">${address}</p>
        <div class="rc-meta-row">
          <div class="rc-meta-group">
            ${iconImg('meta-arrow-right', 'meta-icon', 24)}
            <span class="rc-pkg-count">1</span>
          </div>
          <div class="rc-meta-group">
            ${iconImg('barcode', 'meta-icon', 24)}
            <span class="rc-tracking">${pkg}</span>
          </div>
        </div>
      </div>

      <div class="load-voice-row pro-hide rc-voice-hint">
        ${loadVoiceMicPill()}
        <span class="load-voice-text">${t('thuis.voice_hint')}</span>
      </div>
    </div>
  </div>

  <div class="rc-cta-layer">
    <div class="rc-cta-row" data-focus-axis="horizontal">
      <button type="button" class="focusable rc-btn rc-btn-yes" id="btn-ja-thuis" tabindex="0">
        <img src="/assets/icons/icon-yes.svg" width="20" height="20" alt="" class="rc-btn-icon" aria-hidden="true" />
        <span class="rc-btn-label">${t('btn.ja_thuis')}</span>
      </button>
      <button type="button" class="focusable rc-btn rc-btn-no" id="btn-niet-thuis" tabindex="0">
        <img src="/assets/icons/icon-no.svg" width="20" height="20" alt="" class="rc-btn-icon" aria-hidden="true" />
        <span class="rc-btn-label">${t('btn.niet_thuis')}</span>
      </button>
    </div>
  </div>
</div>`;

  container.querySelector('#btn-ja-thuis')?.addEventListener('click', () => {
    transition('ja_thuis');
  });

  container.querySelector('#btn-niet-thuis')?.addEventListener('click', () => {
    transition('niet_thuis');
  });

  focusScreen();
  return () => { /* no cleanup */ };
}

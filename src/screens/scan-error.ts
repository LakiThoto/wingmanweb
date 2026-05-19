// Screen: scan-error — barcode scan failed
// Figma: B/E/P 1:668 / 1:2120 / 1:3874

import { focusScreen, buildPrimaryCta } from './_frame';
import { iconImg } from '@/ui/icons';
import { transition } from '@/core/state';
import { t } from '@/core/strings';

export function mount(container: HTMLElement): () => void {
  container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="screen-chip"><img class="chip-icon" src="/assets/icons/load-retry-icon.svg" alt="" /> Scannen</div>

    <div class="tile scan-error-tile">
      ${iconImg('scan-warning', 'scan-error-icon', 40)}
      <div class="scan-error-title">
        ${t('scan_error.message')}
      </div>
    </div>
  </div>

  <div class="cta-layer">
    ${buildPrimaryCta(t('btn.scan_retry'), { id: 'btn-scan-retry' })}
  </div>
</div>`;

  container.querySelector('#btn-scan-retry')?.addEventListener('click', () => {
    transition('scan_retry');
  });

  focusScreen();
  return () => { /* no cleanup */ };
}

// Settings control (lab + glasses) — pinned on .screen-stage, bottom-left of the 600×600 frame.

import { t } from '@/core/strings';
import { settingsIcon } from '@/ui/icons';
import { on } from '@/core/events';
import {
  openHandMenu,
  isHandMenuOpen,
  closeHandMenu,
  canOpenHandMenu,
} from '@/ui/hand-menu';

const SETTINGS_BTN_ID = 'companion-settings';

function getScreenStage(): HTMLElement | null {
  return document.querySelector('#app .screen-stage');
}

function attachToStage(btn: HTMLButtonElement): void {
  const stage = getScreenStage();
  if (!stage) return;
  if (btn.parentElement !== stage) stage.appendChild(btn);
}

function syncExpanded(btn: HTMLButtonElement): void {
  const open = isHandMenuOpen();
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  btn.classList.toggle('is-active', open);
}

function syncAvailability(btn: HTMLButtonElement): void {
  const allowed = canOpenHandMenu();
  btn.hidden = !allowed;
  btn.disabled = !allowed;
  btn.setAttribute('aria-disabled', allowed ? 'false' : 'true');
  btn.tabIndex = allowed ? 0 : -1;
  if (!allowed && isHandMenuOpen()) closeHandMenu();
  if (!allowed) syncExpanded(btn);
}

export function mountCompanion(): void {
  const btn = document.createElement('button');
  btn.id = SETTINGS_BTN_ID;
  btn.type = 'button';
  btn.className = 'companion-settings-btn screen-stage-settings-btn focusable';
  btn.tabIndex = 0;
  btn.setAttribute('aria-label', t('start.settings_title'));
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.innerHTML = settingsIcon('companion-settings-icon', 24);

  btn.addEventListener('click', () => {
    if (!canOpenHandMenu()) return;
    if (isHandMenuOpen()) closeHandMenu();
    else openHandMenu();
    syncExpanded(btn);
  });

  attachToStage(btn);
  syncAvailability(btn);

  on('state_change', () => {
    attachToStage(btn);
    syncAvailability(btn);
  });
  document.addEventListener('wingman:hand_menu', () => syncExpanded(btn));
  document.addEventListener('wingman:hand_open', () => syncExpanded(btn));
  document.addEventListener('wingman:dismiss', () => syncExpanded(btn));
}

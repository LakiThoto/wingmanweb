// Settings control (lab + glasses) — bottom-left button opens the assistant menu.
import { t } from '@/core/strings';
import { settingsIcon } from '@/ui/icons';
import { openHandMenu, isHandMenuOpen, closeHandMenu } from '@/ui/hand-menu';
const SETTINGS_BTN_ID = 'companion-settings';
function syncExpanded(btn) {
    const open = isHandMenuOpen();
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-active', open);
}
export function mountCompanion() {
    const btn = document.createElement('button');
    btn.id = SETTINGS_BTN_ID;
    btn.type = 'button';
    btn.className = 'companion-settings-btn focusable';
    btn.tabIndex = 0;
    btn.setAttribute('aria-label', t('start.settings_title'));
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML = settingsIcon('companion-settings-icon', 24);
    btn.addEventListener('click', () => {
        if (isHandMenuOpen()) {
            closeHandMenu();
        }
        else {
            openHandMenu();
        }
        syncExpanded(btn);
    });
    document.body.appendChild(btn);
    document.addEventListener('wingman:hand_menu', () => syncExpanded(btn));
    document.addEventListener('wingman:hand_open', () => syncExpanded(btn));
    document.addEventListener('wingman:dismiss', () => syncExpanded(btn));
}

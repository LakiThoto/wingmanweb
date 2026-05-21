// Global gestures — open-palm menu (dev + glasses simulation).

import { toggleHandMenu, canOpenHandMenu } from '@/ui/hand-menu';

export function initGestures(): void {
  window.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleHandMenu();
      return;
    }

    // Lab shortcut: open settings on start screen (same as companion button)
    if (e.key === 'i' || e.key === 'I') {
      if (!canOpenHandMenu()) return;
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('wingman:hand_open'));
      return;
    }

    // Simulate open-palm gesture (Wingman Copy)
    if (e.key === 'g' || e.key === 'G') {
      if (!canOpenHandMenu()) return;
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('wingman:hand_open'));
    }
  });
}

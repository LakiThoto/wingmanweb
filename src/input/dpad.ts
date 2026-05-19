// D-pad input model: keyboard Arrow keys + Enter/Escape → focus traversal.
// Identical behaviour on glasses (physical D-pad) and lab (keyboard).
//
// Focus groups: elements inside [data-focus-axis="horizontal"] cycle with ←/→.
// Vertical traversal (↑/↓) jumps between .focusable elements in DOM order.

function getFocusables(root: Element = document.body): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('.focusable[tabindex="0"]'));
}

function getFocused(): HTMLElement | null {
  const el = document.activeElement;
  return el instanceof HTMLElement ? el : null;
}

function focusAt(el: HTMLElement): void {
  el.focus({ preventScroll: false });
}

function focusFirst(): void {
  const all = getFocusables();
  if (all.length) focusAt(all[0]);
}

function moveFocus(direction: 'prev' | 'next', axis: 'vertical' | 'horizontal'): void {
  const focused = getFocused();

  // If inside a horizontal group, ←/→ cycle within it
  if (axis === 'horizontal' && focused) {
    const group = focused.closest<HTMLElement>('[data-focus-axis="horizontal"]');
    if (group) {
      const siblings = getFocusables(group);
      const idx = siblings.indexOf(focused);
      if (idx !== -1) {
        const next = direction === 'next'
          ? siblings[(idx + 1) % siblings.length]
          : siblings[(idx - 1 + siblings.length) % siblings.length];
        focusAt(next);
        return;
      }
    }
  }

  // Default: move through all focusables in DOM order
  const all = getFocusables();
  if (!all.length) return;

  const idx = focused ? all.indexOf(focused) : -1;
  if (idx === -1) {
    focusAt(direction === 'next' ? all[0] : all[all.length - 1]);
    return;
  }

  const next = direction === 'next'
    ? all[Math.min(idx + 1, all.length - 1)]
    : all[Math.max(idx - 1, 0)];
  focusAt(next);
}

function activate(el: HTMLElement | null): void {
  if (!el) return;
  if (el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement) {
    el.click();
  } else if (el instanceof HTMLInputElement) {
    el.focus();
  }
}

function dismissOverlay(): void {
  // Emit a generic 'dismiss' — screens can listen and act
  document.dispatchEvent(new CustomEvent('wingman:dismiss'));
}

export function initDpad(): void {
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveFocus('prev', 'horizontal');
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveFocus('next', 'horizontal');
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveFocus('prev', 'vertical');
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveFocus('next', 'vertical');
        break;
      case 'Enter':
        // Don't prevent default — let buttons handle click naturally
        activate(getFocused());
        break;
      case 'Escape':
        dismissOverlay();
        break;
    }
  });
}

export { focusFirst };

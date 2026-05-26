// D-pad input model: keyboard Arrow keys + Enter/Escape → focus traversal.
// Identical behaviour on glasses (physical D-pad) and lab (keyboard).
//
// Focus groups: elements inside [data-focus-axis="horizontal"] cycle with ←/→.
// Vertical traversal (↑/↓) jumps between .focusable elements in DOM order.
// Bottom bar: settings (bottom-left) ← → screen CTAs in left-to-right order.
const SETTINGS_BTN_ID = 'companion-settings';
const BOTTOM_CTA_LAYER_SEL = '.screen-mount .cta-layer, .screen-mount .rc-cta-layer, .screen-mount .cf-cta-layer, .screen-mount .locker-cta-layer';
function isFocusable(el) {
    if (!(el instanceof HTMLElement))
        return false;
    if (el.hidden || el.tabIndex < 0 || el.disabled)
        return false;
    if (el.closest('[hidden], .cf-hidden'))
        return false;
    return true;
}
function getFocusables(root = document.body) {
    return Array.from(root.querySelectorAll('.focusable[tabindex="0"]')).filter(isFocusable);
}
function getFocused() {
    const el = document.activeElement;
    return el instanceof HTMLElement ? el : null;
}
function focusAt(el) {
    el.focus({ preventScroll: false });
}
function focusFirst() {
    const all = getFocusables();
    if (all.length)
        focusAt(all[0]);
}
function getSettingsButton() {
    const el = document.getElementById(SETTINGS_BTN_ID);
    if (!(el instanceof HTMLElement))
        return null;
    if (el.hidden || el.tabIndex < 0)
        return null;
    return el;
}
function isVisibleFocusLayer(layer) {
    if (layer.hidden || layer.classList.contains('cf-hidden'))
        return false;
    return true;
}
/** Left-to-right strip: settings, then visible bottom CTAs (Figma bottom row). */
function getBottomBarFocusables() {
    const ring = [];
    const settings = getSettingsButton();
    if (settings)
        ring.push(settings);
    document.querySelectorAll(BOTTOM_CTA_LAYER_SEL).forEach(layer => {
        if (!isVisibleFocusLayer(layer))
            return;
        getFocusables(layer).forEach(el => {
            if (!ring.includes(el))
                ring.push(el);
        });
    });
    return ring;
}
function isBottomHorizontalGroup(group) {
    return !!group.closest(BOTTOM_CTA_LAYER_SEL);
}
function tryMoveBottomBar(direction) {
    const ring = getBottomBarFocusables();
    if (!ring.length)
        return false;
    const focused = getFocused();
    const settings = getSettingsButton();
    if (settings && focused?.id === 'plate-fill-btn' && direction === 'prev') {
        focusAt(settings);
        return true;
    }
    const idx = focused ? ring.indexOf(focused) : -1;
    if (idx !== -1) {
        const nextIdx = direction === 'next'
            ? (idx + 1) % ring.length
            : (idx - 1 + ring.length) % ring.length;
        focusAt(ring[nextIdx]);
        return true;
    }
    if (!settings || !focused)
        return false;
    if (direction === 'next' && focused === settings) {
        const firstCta = ring.find(el => el !== settings);
        if (firstCta) {
            focusAt(firstCta);
            return true;
        }
        const plate = document.getElementById('plate-fill-btn');
        if (plate instanceof HTMLElement && isFocusable(plate)) {
            focusAt(plate);
            return true;
        }
    }
    if (direction === 'prev') {
        const group = focused.closest('[data-focus-axis="horizontal"]');
        if (group && isBottomHorizontalGroup(group)) {
            const siblings = getFocusables(group);
            const sidx = siblings.indexOf(focused);
            if (sidx === 0) {
                focusAt(settings);
                return true;
            }
        }
        const screenCtAs = ring.filter(el => el !== settings);
        if (screenCtAs.includes(focused)) {
            const last = screenCtAs[screenCtAs.length - 1];
            if (focused === last) {
                focusAt(settings);
                return true;
            }
        }
        if (focused.matches('.depot-start-btn, .btn-primary, .cf-confirm-btn, .depot-cta-ai') &&
            focused.closest(BOTTOM_CTA_LAYER_SEL + ', .depot-cta-row')) {
            focusAt(settings);
            return true;
        }
    }
    return false;
}
function moveFocus(direction, axis) {
    const focused = getFocused();
    if (axis === 'horizontal') {
        if (tryMoveBottomBar(direction))
            return;
        // If inside a horizontal group, ←/→ cycle within it
        if (focused) {
            const group = focused.closest('[data-focus-axis="horizontal"]');
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
    }
    // Default: move through all focusables in DOM order
    const all = getFocusables();
    if (!all.length)
        return;
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
function activate(el) {
    if (!el)
        return;
    if (el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement) {
        el.click();
    }
    else if (el instanceof HTMLInputElement) {
        el.focus();
    }
}
function dismissOverlay() {
    // Emit a generic 'dismiss' — screens can listen and act
    document.dispatchEvent(new CustomEvent('wingman:dismiss'));
}
export function initDpad() {
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

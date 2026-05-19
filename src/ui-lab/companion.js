// Lab companion panel — dev-only helper for tier switching, mode toggle, state display.
// Mounted only when body[data-mode="lab"].
import { setTier, getTier } from '@/core/tier';
import { getState } from '@/core/state';
import { on } from '@/core/events';
import { toggleHandMenu } from '@/ui/hand-menu';
export function mountCompanion() {
    const panel = document.createElement('div');
    panel.id = 'companion';
    panel.setAttribute('aria-label', 'Dev companion panel');
    panel.innerHTML = buildHTML();
    document.body.appendChild(panel);
    attachHandlers(panel);
    on('state_change', ({ to }) => {
        const stateEl = panel.querySelector('.companion-state');
        if (stateEl)
            stateEl.textContent = to;
    });
    on('tier_change', ({ tier }) => {
        panel.querySelectorAll('[data-tier]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tier === tier);
        });
    });
}
function buildHTML() {
    const state = getState();
    const tier = getTier();
    return `
    <h4>Wingman dev</h4>

    <div class="companion-row">
      <span>Tier:</span>
      <button class="companion-btn${tier === 'beginner' ? ' active' : ''}" data-tier="beginner">B</button>
      <button class="companion-btn${tier === 'experienced' ? ' active' : ''}" data-tier="experienced">E</button>
      <button class="companion-btn${tier === 'pro' ? ' active' : ''}" data-tier="pro">P</button>
    </div>

    <div class="companion-row">
      <span>Screen:</span>
      <span class="companion-state">${state.screen}</span>
    </div>

    <div class="companion-row">
      <button type="button" class="companion-btn" data-action="menu">Menu</button>
      <button type="button" class="companion-btn" data-action="palm">Palm</button>
    </div>

    <div class="companion-row">
      <a class="mode-toggle" href="?mode=glasses" title="600×600 D-pad preview">Glasses →</a>
    </div>
  `;
}
function attachHandlers(panel) {
    panel.querySelector('[data-action="menu"]')?.addEventListener('click', () => toggleHandMenu());
    panel.querySelector('[data-action="palm"]')?.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('wingman:hand_open'));
    });
    panel.querySelectorAll('[data-tier]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tier = btn.dataset.tier;
            if (tier === 'beginner' || tier === 'experienced' || tier === 'pro') {
                setTier(tier);
            }
        });
    });
}

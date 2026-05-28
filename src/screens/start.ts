// Screen: start — license plate entry
// Figma: Beginner 1:953 · Experienced 1:2932 · Pro 1:4150
// Tap-to-fill plate (no keyboard) — works on Meta Ray-Ban Display.

import { focusScreen } from './_frame';
import { runCtaEntranceAnimations } from '@/core/cta-animate';
import { weatherBadge, loadVoiceMicPill, settingsIcon } from '@/ui/icons';
import { transition, setLicensePlate, getState } from '@/core/state';
import { DEMO_PLATE } from '@/core/glasses-preflight';
import { formatDutchPlate, parsePlateFromSpeech } from '@/core/plate';
import { on } from '@/core/events';
import { getTier } from '@/core/tier';
import { t } from '@/core/strings';
import { openHandMenu } from '@/ui/hand-menu';

function startButtonLabel(): string {
  return getTier() === 'pro' ? t('btn.start_short') : t('btn.start_bezorging');
}

function hasValidPlate(): boolean {
  return formatDutchPlate(getState().licensePlate) !== null;
}

function buildPlateFillButton(plate: string): string {
  const filled = formatDutchPlate(plate) !== null;
  const display = filled ? formatDutchPlate(plate)! : t('start.placeholder');
  return `
    <button
      type="button"
      class="focusable plate-dock-pill plate-fill-btn${filled ? ' is-filled' : ''}"
      id="plate-fill-btn"
      tabindex="0"
      aria-label="Kenteken"
    >
      <span id="plate-display">${display}</span>
    </button>`;
}

export function mount(container: HTMLElement): () => void {
  const isGlasses = getState().mode === 'glasses';
  const initialPlate = getState().licensePlate;
  const hasPlate = hasValidPlate();

  container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="greeting-row">
      <span class="greeting-text">Hi Thomas,</span>
      ${weatherBadge('17°')}
    </div>

    <p class="screen-lead pro-hide">${t('start.lead')}</p>

    ${buildPlateFillButton(initialPlate)}

    <p class="glasses-start-hint pro-hide">${isGlasses ? t('start.glasses_hint') : ''}</p>

    <div class="voice-hint pro-hide">
      ${loadVoiceMicPill()}
      <span>Zeg je kenteken of open je hand en zeg <strong>"Menu"</strong></span>
    </div>
  </div>

  <div class="cta-layer depot-cta-row">
    ${hasPlate ? '' : `
    <button
      type="button"
      class="focusable start-settings-btn"
      id="btn-start-settings"
      tabindex="0"
      aria-label="${t('start.settings_title').replace(/"/g, '&quot;')}"
    >
      ${settingsIcon('start-settings-icon', 24)}
    </button>`}
    <div class="depot-cta-ai" aria-hidden="true">
      <div class="ai-icon-shape">
        <img src="/assets/ai-icon.png" class="ai-triangle" alt="" width="52" height="52" decoding="async" />
      </div>
    </div>
    <button
      type="button"
      class="focusable btn-primary depot-start-btn"
      id="btn-start"
      tabindex="0"
      aria-label="${startButtonLabel().replace(/"/g, '&quot;')}"
      ${hasPlate ? '' : ' hidden'}
    >
      <div class="ai-text-pill depot-start-pill">
        <span class="ai-btn-text">${startButtonLabel()}</span>
      </div>
    </button>
  </div>
</div>`;

  const btnStart = container.querySelector<HTMLButtonElement>('#btn-start')!;
  const btnSettings = container.querySelector<HTMLButtonElement>('#btn-start-settings');
  const plateBtn = container.querySelector<HTMLButtonElement>('#plate-fill-btn')!;
  const plateDisplay = container.querySelector<HTMLElement>('#plate-display')!;

  function focusStartCta(): void {
    requestAnimationFrame(() => {
      const mount = container.closest('.screen-mount');
      if (mount instanceof HTMLElement) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        mount.scrollTo({ top: mount.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
      }
      btnStart.focus({ preventScroll: false });
    });
  }

  function revealStartCta(): void {
    btnSettings?.remove();
    btnStart.hidden = false;
    runCtaEntranceAnimations(container);
    focusStartCta();
  }

  function syncPlateUi(plate: string): void {
    const formatted = formatDutchPlate(plate);
    if (!formatted) return;
    setLicensePlate(formatted);
    plateDisplay.textContent = formatted;
    plateBtn.classList.add('is-filled');
    revealStartCta();
  }

  function fillDemoPlate(): void {
    syncPlateUi(getState().licensePlate || DEMO_PLATE);
  }

  function submit(): void {
    if (!hasValidPlate()) {
      fillDemoPlate();
    }
    if (!formatDutchPlate(getState().licensePlate)) return;
    transition('kenteken_submitted');
  }

  plateBtn.addEventListener('click', () => {
    if (!plateBtn.classList.contains('is-filled')) {
      fillDemoPlate();
    } else {
      focusStartCta();
    }
  });

  plateBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!plateBtn.classList.contains('is-filled')) {
        fillDemoPlate();
      } else {
        focusStartCta();
      }
    }
  });

  btnSettings?.addEventListener('click', openHandMenu);
  btnStart.addEventListener('click', submit);

  const offVoice = on('voice', ({ transcript }) => {
    if (getState().screen !== 'start') return;
    const plate = parsePlateFromSpeech(transcript);
    if (plate) {
      syncPlateUi(plate);
      return;
    }
    if (/^(start bezorging|start)$/.test(transcript) && hasValidPlate()) {
      submit();
    }
  });

  const offTier = on('tier_change', () => {
    const label = btnStart.querySelector('.ai-btn-text');
    if (label) label.textContent = startButtonLabel();
  });

  focusScreen(container);
  return () => {
    offVoice();
    offTier();
  };
}

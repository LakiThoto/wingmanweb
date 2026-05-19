// Screen: start — license plate entry
// Figma: Beginner 1:953 · Experienced 1:2932 · Pro 1:4150
// Tap-to-fill plate (no keyboard) — works on Meta Ray-Ban Display.
import { focusScreen } from './_frame';
import { runCtaEntranceAnimations } from '@/core/cta-animate';
import { weatherBadge, loadVoiceMicPill } from '@/ui/icons';
import { transition, setLicensePlate, getState } from '@/core/state';
import { DEMO_PLATE } from '@/core/glasses-preflight';
import { formatDutchPlate, parsePlateFromSpeech } from '@/core/plate';
import { on } from '@/core/events';
import { getTier } from '@/core/tier';
import { t } from '@/core/strings';
function startButtonLabel() {
    return getTier() === 'pro' ? t('btn.start_short') : t('btn.start_bezorging');
}
function hasValidPlate() {
    return formatDutchPlate(getState().licensePlate) !== null;
}
function buildPlateFillButton(plate) {
    const filled = formatDutchPlate(plate) !== null;
    const display = filled ? formatDutchPlate(plate) : t('start.placeholder');
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
export function mount(container) {
    const isGlasses = getState().mode === 'glasses';
    const initialPlate = getState().licensePlate;
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
      ${hasValidPlate() ? '' : ' hidden'}
    >
      <div class="ai-text-pill depot-start-pill">
        <span class="ai-btn-text">${startButtonLabel()}</span>
      </div>
    </button>
  </div>
</div>`;
    const btnStart = container.querySelector('#btn-start');
    const plateBtn = container.querySelector('#plate-fill-btn');
    const plateDisplay = container.querySelector('#plate-display');
    function revealStartCta() {
        btnStart.hidden = false;
        runCtaEntranceAnimations(container);
    }
    function syncPlateUi(plate) {
        const formatted = formatDutchPlate(plate);
        if (!formatted)
            return;
        setLicensePlate(formatted);
        plateDisplay.textContent = formatted;
        plateBtn.classList.add('is-filled');
        revealStartCta();
    }
    function fillDemoPlate() {
        syncPlateUi(getState().licensePlate || DEMO_PLATE);
    }
    function submit() {
        if (!hasValidPlate()) {
            fillDemoPlate();
        }
        if (!formatDutchPlate(getState().licensePlate))
            return;
        transition('kenteken_submitted');
    }
    plateBtn.addEventListener('click', () => {
        if (!plateBtn.classList.contains('is-filled')) {
            fillDemoPlate();
        }
    });
    plateBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!plateBtn.classList.contains('is-filled'))
                fillDemoPlate();
        }
    });
    btnStart.addEventListener('click', submit);
    const offVoice = on('voice', ({ transcript }) => {
        if (getState().screen !== 'start')
            return;
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
        if (label)
            label.textContent = startButtonLabel();
    });
    focusScreen(container);
    return () => {
        offVoice();
        offTier();
    };
}

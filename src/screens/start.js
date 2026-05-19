// Screen: start — license plate entry
// Figma: Beginner 1:953 · Experienced 1:2932 · Pro 1:4150
// Glasses: demo plate + single CTA (no keyboard input).
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
export function mount(container) {
    const isGlasses = getState().mode === 'glasses';
    const demoPlate = getState().licensePlate || DEMO_PLATE;
    const plateBlock = isGlasses
        ? `
    <div class="plate-dock-pill glasses-plate-dock" aria-label="Kenteken">
      <span id="plate-display">${demoPlate}</span>
    </div>
    <p class="glasses-start-hint pro-hide">${t('start.glasses_hint')}</p>`
        : `
    <input
      class="focusable plate-input"
      id="plate-input"
      type="text"
      placeholder="${t('start.placeholder')}"
      tabindex="0"
      autocomplete="off"
      spellcheck="false"
      aria-label="Kenteken"
    />

    <div class="voice-hint pro-hide">
      ${loadVoiceMicPill()}
      <span>Zeg je kenteken of open je hand en zeg <strong>"Menu"</strong></span>
    </div>`;
    container.innerHTML = `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    <div class="greeting-row">
      <span class="greeting-text">Hi Thomas,</span>
      ${weatherBadge('17°')}
    </div>

    <p class="screen-lead pro-hide">${t('start.lead')}</p>

    ${plateBlock}
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
      ${isGlasses ? '' : ' hidden'}
    >
      <div class="ai-text-pill depot-start-pill">
        <span class="ai-btn-text">${startButtonLabel()}</span>
      </div>
    </button>
  </div>
</div>`;
    const btnStart = container.querySelector('#btn-start');
    function submit() {
        if (isGlasses) {
            setLicensePlate(formatDutchPlate(demoPlate) ?? DEMO_PLATE);
            transition('kenteken_submitted');
            return;
        }
        const input = container.querySelector('#plate-input');
        const plate = formatDutchPlate(input.value);
        if (!plate) {
            input.focus();
            return;
        }
        setLicensePlate(plate);
        transition('kenteken_submitted');
    }
    btnStart.addEventListener('click', submit);
    let offVoice;
    let offTier;
    if (!isGlasses) {
        const input = container.querySelector('#plate-input');
        function revealStartCta() {
            btnStart.hidden = false;
            runCtaEntranceAnimations(container);
        }
        function syncStartButton() {
            const formatted = formatDutchPlate(input.value);
            if (formatted === null) {
                btnStart.hidden = true;
                btnStart.classList.remove('btn-ready');
                return;
            }
            input.value = formatted;
            setLicensePlate(formatted);
            revealStartCta();
        }
        function applyPlate(raw) {
            const formatted = formatDutchPlate(raw) ?? parsePlateFromSpeech(raw);
            if (!formatted)
                return;
            input.value = formatted;
            setLicensePlate(formatted);
            revealStartCta();
        }
        input.addEventListener('input', syncStartButton);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')
                submit();
        });
        offVoice = on('voice', ({ transcript }) => {
            if (getState().screen !== 'start')
                return;
            const plate = parsePlateFromSpeech(transcript);
            if (plate) {
                applyPlate(plate);
                return;
            }
            if (/^(start bezorging|start)$/.test(transcript) && formatDutchPlate(input.value)) {
                submit();
            }
        });
    }
    else {
        setLicensePlate(formatDutchPlate(demoPlate) ?? DEMO_PLATE);
    }
    offTier = on('tier_change', () => {
        const label = btnStart.querySelector('.ai-btn-text');
        if (label)
            label.textContent = startButtonLabel();
    });
    focusScreen(container);
    return () => {
        offVoice?.();
        offTier?.();
    };
}

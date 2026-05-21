// Wrist “volume” twist — adjusts custom support % (lab: keys / wheel; glasses: event).

import { isHandMenuCustomViewOpen, onHandMenuCustomSupportChange } from '@/ui/hand-menu';

const STEP_COARSE = 5;
const STEP_FINE = 1;

let teardown: (() => void) | null = null;

function applyDelta(delta: number): void {
  if (!isHandMenuCustomViewOpen()) return;
  onHandMenuCustomSupportChange(delta);
}

export function initVolumeGesture(): void {
  if (teardown) return;

  const onKey = (e: KeyboardEvent) => {
    if (!isHandMenuCustomViewOpen()) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    let delta = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === '+') delta = STEP_COARSE;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === '-') delta = -STEP_COARSE;
    else if (e.key === ']' || e.key === '}') delta = STEP_FINE;
    else if (e.key === '[' || e.key === '{') delta = -STEP_FINE;
    else return;

    e.preventDefault();
    applyDelta(delta);
  };

  const onWheel = (e: WheelEvent) => {
    if (!isHandMenuCustomViewOpen()) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('#hand-menu .menu-custom-support')) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? STEP_COARSE : -STEP_COARSE;
    applyDelta(delta);
  };

  const onTwist = (e: Event) => {
    const detail = (e as CustomEvent<{ delta?: number }>).detail;
    if (typeof detail?.delta === 'number') applyDelta(detail.delta);
  };

  window.addEventListener('keydown', onKey);
  window.addEventListener('wheel', onWheel, { passive: false });
  document.addEventListener('wingman:volume_twist', onTwist);

  teardown = () => {
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('wheel', onWheel);
    document.removeEventListener('wingman:volume_twist', onTwist);
    teardown = null;
  };
}

/** Lab: simulate wrist rotation with keyboard (documented in preflight). */
export function dispatchVolumeTwist(delta: number): void {
  document.dispatchEvent(
    new CustomEvent('wingman:volume_twist', { detail: { delta } }),
  );
}

// Screen mount transitions — matches Wingman Copy stack-enter / overlay scrim.

const EXIT_MS = 280;

let transitionGen = 0;
let exitTimer: ReturnType<typeof setTimeout> | null = null;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Persistent stage: scrim + mount point (like Copy .screen-overlay). */
export function ensureScreenStage(app: HTMLElement): HTMLElement {
  const existing = app.querySelector<HTMLElement>('.screen-mount');
  if (existing) return existing;

  app.innerHTML = `
    <div class="screen-stage is-visible">
      <div class="screen-scrim" aria-hidden="true"></div>
      <div class="screen-mount"></div>
    </div>
  `;
  return app.querySelector('.screen-mount')!;
}

export function playStackEnter(root: ParentNode): void {
  const stack = root.querySelector<HTMLElement>('.screen-stack');
  if (!stack || prefersReducedMotion()) return;
  stack.classList.remove('screen-exit', 'screen-enter');
  void stack.offsetWidth;
  stack.classList.add('screen-enter');
}

/** Inner card / phase swaps (Copy .load-phase-enter). */
export function playPhaseEnter(root: ParentNode): void {
  if (prefersReducedMotion()) return;
  root.querySelectorAll<HTMLElement>('.load-phase, .card-phase').forEach(el => {
    el.classList.remove('phase-enter');
    void el.offsetWidth;
    el.classList.add('phase-enter');
  });
}

/**
 * Run exit animation on the current stack, then mount the next screen.
 * `work` must tear down the previous screen and return the new unmount fn (or null).
 */
export function runScreenTransition(
  app: HTMLElement,
  work: (mountEl: HTMLElement) => (() => void) | null,
): void {
  const mountEl = ensureScreenStage(app);
  const myGen = ++transitionGen;

  if (exitTimer) {
    clearTimeout(exitTimer);
    exitTimer = null;
  }

  const execute = () => {
    if (myGen !== transitionGen) return;
    exitTimer = null;
    const unmount = work(mountEl);
    if (unmount !== null) {
      playStackEnter(mountEl);
      playPhaseEnter(mountEl);
    }
    app.querySelector('.screen-stage')?.classList.add('is-visible');
  };

  const stack = mountEl.querySelector<HTMLElement>('.screen-stack');
  const exiting = stack?.classList.contains('screen-exit');

  if (stack && !prefersReducedMotion() && !exiting) {
    stack.classList.remove('screen-enter');
    stack.classList.add('screen-exit');
    exitTimer = setTimeout(execute, EXIT_MS);
  } else {
    execute();
  }
}

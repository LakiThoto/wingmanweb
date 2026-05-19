// Primary CTA animations — WingmanCopy goTo() pill expand + depot AI glyph entrance.

const CTA_READY_MS = 50;

export function animatePrimaryButtons(root: ParentNode = document): void {
  const btns = root.querySelectorAll<HTMLElement>(
    '.btn-primary, .btn-yes, .btn-no, .rc-btn',
  );
  btns.forEach(b => b.classList.remove('btn-ready'));
  window.setTimeout(() => {
    btns.forEach(b => b.classList.add('btn-ready'));
  }, CTA_READY_MS);
}

/** Copy #screen-depot — larger triangle beside pill, scale-in on screen enter. */
export function animateDepotCtaAi(root: ParentNode = document): void {
  const ai = root.querySelector<HTMLElement>('.depot-cta-ai');
  if (!ai) return;
  ai.classList.remove('cta-ai-ready');
  window.setTimeout(() => ai.classList.add('cta-ai-ready'), CTA_READY_MS);
}

export function runCtaEntranceAnimations(root: ParentNode = document): void {
  animatePrimaryButtons(root);
  animateDepotCtaAi(root);
}

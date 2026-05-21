// Shared screen helpers: renderScreen(), buildPrimaryCta, bus diagram builder, focusScreen().
import { focusFirst } from '@/input/dpad';
import { runCtaEntranceAnimations } from '@/core/cta-animate';
import { playPhaseEnter } from '@/core/screen-transition';
import { iconImg } from '@/ui/icons';
/** Figma depot row — AI triangle + gradient pill, 12px gap. */
export function buildDepotCtaRow(label, opts = {}) {
    const { id = '', aiId = id ? `${id}-ai` : 'btn-depot-ai', hidden = false, pillClass = '', btnClass = '', rowClass = '', ariaLabel, } = opts;
    const idAttr = id ? ` id="${id}"` : '';
    const aiIdAttr = ` id="${aiId}"`;
    const hiddenAttr = hidden ? ' hidden' : '';
    const extraBtnClass = btnClass ? ` ${btnClass}` : '';
    const extraPillClass = pillClass ? ` ${pillClass}` : '';
    const extraRowClass = rowClass ? ` ${rowClass}` : '';
    const aria = (ariaLabel ?? label).replace(/"/g, '&quot;');
    return `
<div class="cta-layer depot-cta-row${extraRowClass}">
  <button type="button" class="focusable depot-cta-ai"${aiIdAttr} tabindex="0"${hiddenAttr} aria-label="${aria}">
    <span class="ai-icon-shape">
      <img src="/assets/ai-icon.png" class="ai-triangle" alt="" width="52" height="52" decoding="async" />
    </span>
  </button>
  <button type="button" class="focusable btn-primary depot-start-btn${extraBtnClass}"${idAttr} tabindex="0"${hiddenAttr} aria-label="${aria}">
    <div class="ai-text-pill depot-start-pill${extraPillClass}">
      <span class="ai-btn-text">${label}</span>
    </div>
  </button>
</div>`.trim();
}
/** Wire depot CTA row — whole row + triangle + pill share one action. */
export function bindDepotCtaRow(root, handler, opts) {
    const mainSel = opts?.mainSelector ?? '.depot-start-btn';
    const main = root.querySelector(mainSel);
    if (!main || main.disabled || main.classList.contains('cf-delivered-cta-static'))
        return;
    const row = main.closest('.depot-cta-row');
    if (!row)
        return;
    const fire = (ev) => {
        if (main.hidden || main.disabled || main.classList.contains('cf-delivered-cta-static'))
            return;
        handler(ev);
    };
    row.addEventListener('click', (ev) => {
        if (ev.target instanceof HTMLElement && ev.target.closest('button[disabled], .cf-delivered-cta-static'))
            return;
        fire(ev);
    });
    row.addEventListener('keydown', (ev) => {
        if (!(ev instanceof KeyboardEvent) || (ev.key !== 'Enter' && ev.key !== ' '))
            return;
        if (ev.target !== row && ev.target instanceof HTMLElement && ev.target.closest('button'))
            return;
        ev.preventDefault();
        fire(ev);
    });
}
/** WingmanCopy unified CTA: AI icon + expanding gradient pill inside one button. */
export function buildPrimaryCta(label, opts = {}) {
    const { id = '', hidden = false, className = '', type = 'button', ariaLabel, } = opts;
    const idAttr = id ? ` id="${id}"` : '';
    const hiddenAttr = hidden ? ' hidden' : '';
    const extraClass = className ? ` ${className}` : '';
    const aria = ariaLabel
        ? ` aria-label="${ariaLabel.replace(/"/g, '&quot;')}"`
        : ` aria-label="${label.replace(/"/g, '&quot;')}"`;
    return `
<button class="focusable btn-primary${extraClass}"${idAttr} type="${type}" tabindex="0"${hiddenAttr}${aria}>
  <div class="ai-icon-shape">
    <img src="/assets/ai-icon.png" class="ai-triangle" alt="" width="38" height="38" decoding="async" />
  </div>
  <div class="ai-text-pill"><span class="ai-btn-text">${label}</span></div>
</button>`.trim();
}
/** Icon-only CTA (bevestigen screen — no text pill). */
export function buildAiOnlyCta(ariaLabel = 'Wingman AI') {
    return buildPrimaryCta('', {
        className: 'btn-primary--icon-only',
        ariaLabel,
    });
}
export function renderScreen(opts) {
    const chipRow = opts.chipCounter
        ? `<div class="screen-chip-row">
         <div class="screen-chip">${opts.chip}</div>
         <span class="chip-counter">${opts.chipCounter}</span>
       </div>`
        : `<div class="screen-chip">${opts.chip}</div>`;
    return `
<div class="screen-stack screen-stack--cta-gap">
  <div class="screen-card">
    ${chipRow}
    ${opts.body}
  </div>
  <div class="cta-layer">
    ${opts.cta}
  </div>
</div>`.trim();
}
/** Wingman Copy van-map — 6 slots per row, green active slot in load mode. */
export function buildVanDiagram(activeRow, activePos, opts = {}) {
    const { label = 'Plaatsing in bus', posLabel = `${activePos} / 40 ${activeRow}`, slotsPerRow = 6, loadMode = true, wrapped = true, showHeader = !wrapped, } = opts;
    const rowsHtml = ['A', 'B', 'C']
        .map(row => {
        const isActiveRow = row === activeRow;
        const blocks = Array.from({ length: slotsPerRow }, (_, i) => {
            const isActive = isActiveRow && i + 1 === activePos;
            return `<div class="vr-blk${isActive ? ' vr-active' : ''}"></div>`;
        }).join('');
        return `
    <div class="van-shelf-row${isActiveRow ? ' row-active' : ''}">
      <span class="vr-lbl">${row}</span>
      <div class="vr-track">${blocks}</div>
    </div>`;
    })
        .join('');
    const header = showHeader
        ? `
    <div class="van-map-header">
      <span class="van-map-label">${label}</span>
      <span class="van-map-pos">${posLabel}</span>
    </div>`
        : '';
    const map = `
  <div class="van-map${loadMode ? ' load-mode' : ''}${showHeader ? '' : ' van-map--no-header'}">
    ${header}
    <div class="van-diagram">
      <div class="van-cargo">
        ${rowsHtml}
      </div>
    </div>
  </div>`.trim();
    if (!wrapped)
        return map;
    return `
<div class="load-vandiagram-tile">
  ${map}
</div>`.trim();
}
/** @deprecated Use buildVanDiagram — kept for locker mini-van. */
export function buildBusDiagram(activeRow, activePos, _rowCount = 3, label = 'Plaatsing in bus', posLabel = '') {
    return buildVanDiagram(activeRow, activePos, {
        label,
        posLabel: posLabel || `${activePos} / 40 ${activeRow}`,
        wrapped: false,
        loadMode: false,
    });
}
export function buildLoadVanPhase(address, van) {
    return `
<div class="load-phase load-phase-van card-phase">
  ${buildAddressHero(address)}
  ${buildVanDiagram(van.activeRow, van.activePos, {
        label: van.label,
        posLabel: van.posLabel,
        loadMode: true,
        wrapped: true,
    })}
</div>`.trim();
}
export function buildAddressHero(opts) {
    const pos = opts.showPosition !== false && opts.positionInRow && opts.rowInVan
        ? `<div class="lat-slot-row">
         <span class="lat-slot-pos">${opts.positionInRow} / 40</span>
         <span class="lat-shelf-badge${opts.slotRowFigma ? ' lat-shelf-badge--figma-52857' : ''}">${opts.rowInVan}</span>
       </div>`
        : '';
    const stopMeta = opts.stopNumber !== undefined
        ? `<div class="lat-meta-group">
         ${iconImg('meta-arrow-right', 'lat-meta-icon', 20)}
         <span class="lat-meta-value">${opts.stopNumber}</span>
       </div>`
        : '';
    const codeMeta = opts.packageId
        ? `<div class="lat-meta-group">
         ${iconImg('load-scan-barcode-icon', 'lat-meta-icon lat-meta-icon--barcode', 20)}
         <span class="lat-meta-value lat-code">${opts.packageId}</span>
       </div>`
        : '';
    const meta = stopMeta || codeMeta
        ? `<div class="lat-meta-row">${stopMeta}${codeMeta}</div>`
        : '';
    return `
<div class="load-address-tile">
  <div class="lat-address">${opts.address}</div>
  ${pos}
  ${meta}
</div>`.trim();
}
/** Figma 63:453 — scan camera frame barcode stripes (decorative). */
export function buildLoadCameraFrameDecor() {
    return `<div class="load-camera-frame-bars" aria-hidden="true">
    <p class="load-camera-frame-bars__track">▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌</p>
  </div>`;
}
export function focusScreen(root) {
    const scope = root ?? document;
    requestAnimationFrame(() => {
        focusFirst();
        requestAnimationFrame(() => {
            playPhaseEnter(scope);
            runCtaEntranceAnimations(scope);
        });
    });
}

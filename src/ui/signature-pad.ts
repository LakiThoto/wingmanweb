/** Canvas signature capture (ported from WingmanCopy main.js). */

export interface SignaturePad {
  init(canvasId?: string, hintId?: string): void;
  clear(): void;
  destroy(): void;
}

export function createSignaturePad(
  canvasId = 'sign-canvas',
  hintId = 'sign-canvas-hint',
): SignaturePad {
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let drawing = false;
  let hasStrokes = false;

  const onDown = (e: MouseEvent | TouchEvent) => {
    if (!canvas || !ctx) return;
    e.preventDefault();
    prepare();
    drawing = true;
    ctx.beginPath();
    const [x, y] = getPos(e);
    ctx.moveTo(x, y);
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!drawing || !ctx) return;
    e.preventDefault();
    const [x, y] = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.moveTo(x, y);
    if (!hasStrokes) {
      hasStrokes = true;
      hideHint();
    }
  };

  const onUp = () => {
    drawing = false;
  };

  function getPos(e: MouseEvent | TouchEvent): [number, number] {
    if (!canvas) return [0, 0];
    const r = canvas.getBoundingClientRect();
    const s = 'touches' in e ? e.touches[0]! : e;
    return [s.clientX - r.left, s.clientY - r.top];
  }

  function applyStyle(): void {
    if (!ctx) return;
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function hideHint(): void {
    document.getElementById(hintId)?.classList.add('hidden');
  }

  function prepare(): void {
    if (!canvas || !ctx) return;
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width || canvas.offsetWidth;
    canvas.height = r.height || canvas.offsetHeight;
    applyStyle();
  }

  return {
    init(id = canvasId) {
      canvas = document.getElementById(id) as HTMLCanvasElement | null;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      canvas.addEventListener('mousedown', onDown);
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseup', onUp);
      canvas.addEventListener('mouseleave', onUp);
      canvas.addEventListener('touchstart', onDown, { passive: false });
      canvas.addEventListener('touchmove', onMove, { passive: false });
      canvas.addEventListener('touchend', onUp);
    },

    clear() {
      if (!canvas || !ctx) return;
      prepare();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasStrokes = false;
      document.getElementById(hintId)?.classList.remove('hidden');
    },

    destroy() {
      if (!canvas) return;
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mouseleave', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
      canvas = null;
      ctx = null;
    },
  };
}

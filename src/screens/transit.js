// Screen: transit — silent pause between stops (no UI, no audio)
import { transition, getState } from '@/core/state';
/** Gap between stops with no visual or audio. */
export const INTER_STOP_PAUSE_MS = 10000;
export function mount(container) {
    container.innerHTML = '';
    const timer = setTimeout(() => {
        if (getState().screen === 'transit')
            transition('transit_complete');
    }, INTER_STOP_PAUSE_MS);
    return () => clearTimeout(timer);
}

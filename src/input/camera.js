// Camera barcode scan — lab mode only.
// Uses @zxing/browser to read barcodes from the #scan-video element.
// In glasses mode the scan screen renders a "Confirm scan" button instead.
import { emit } from '@/core/events';
let readerActive = false;
export async function startCamera(videoEl) {
    if (readerActive)
        return () => undefined;
    // Dynamic import — keeps the glasses bundle free of @zxing/browser
    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    const reader = new BrowserMultiFormatReader();
    readerActive = true;
    const controls = await reader.decodeFromVideoDevice(undefined, videoEl, (result, _err) => {
        if (result) {
            emit('scan', { code: result.getText() });
        }
    });
    return () => {
        readerActive = false;
        controls.stop();
    };
}

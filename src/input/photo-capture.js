/** Live camera for delivery proof photos (lab + Meta glasses browser). */
const VIDEO_CONSTRAINTS = [
    {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: 'environment' },
        },
        audio: false,
    },
    { video: { facingMode: 'environment' }, audio: false },
    { video: { facingMode: 'user' }, audio: false },
    { video: true, audio: false },
];
export async function acquireCameraStream() {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia unavailable');
    }
    let lastErr;
    for (const constraints of VIDEO_CONSTRAINTS) {
        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        }
        catch (err) {
            lastErr = err;
        }
    }
    throw lastErr ?? new Error('camera denied');
}
export async function bindCameraPreview(video, stream) {
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    await waitForVideoReady(video);
}
export async function waitForVideoReady(video, timeoutMs = 8000) {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        return;
    }
    await new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
            cleanup();
            reject(new Error('camera preview timeout'));
        }, timeoutMs);
        const onReady = () => {
            if (video.videoWidth > 0) {
                cleanup();
                resolve();
            }
        };
        const cleanup = () => {
            window.clearTimeout(timer);
            video.removeEventListener('loadeddata', onReady);
            video.removeEventListener('loadedmetadata', onReady);
        };
        video.addEventListener('loadeddata', onReady);
        video.addEventListener('loadedmetadata', onReady);
        onReady();
    });
}
export function captureVideoFrame(video, quality = 0.85) {
    if (!video.videoWidth || !video.videoHeight)
        return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', quality);
}
export function stopCameraStream(stream) {
    stream?.getTracks().forEach(track => track.stop());
}

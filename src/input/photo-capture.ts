/** Live camera for delivery proof photos (lab + Meta glasses browser). */

const VIDEO_CONSTRAINTS: MediaStreamConstraints[] = [
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

export async function acquireCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('getUserMedia unavailable');
  }
  let lastErr: unknown;
  for (const constraints of VIDEO_CONSTRAINTS) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error('camera denied');
}

export async function bindCameraPreview(
  video: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();
  await waitForVideoReady(video);
}

export async function waitForVideoReady(
  video: HTMLVideoElement,
  timeoutMs = 8000,
): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('camera preview timeout'));
    }, timeoutMs);

    const onReady = (): void => {
      if (video.videoWidth > 0) {
        cleanup();
        resolve();
      }
    };

    const cleanup = (): void => {
      window.clearTimeout(timer);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('loadedmetadata', onReady);
    };

    video.addEventListener('loadeddata', onReady);
    video.addEventListener('loadedmetadata', onReady);
    onReady();
  });
}

export function captureVideoFrame(
  video: HTMLVideoElement,
  quality = 0.85,
): string | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', quality);
}

export function stopCameraStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach(track => track.stop());
}

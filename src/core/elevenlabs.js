/**
 * Client for the local ElevenLabs TTS proxy (/api/tts).
 * Falls back silently when the proxy is unavailable.
 */
const TTS_ENDPOINT = import.meta.env.VITE_ELEVENLABS_PROXY ?? '/api/tts';
const STATUS_ENDPOINT = '/api/tts/status';
/** auto | elevenlabs | browser */
const TTS_PROVIDER = (import.meta.env.VITE_TTS_PROVIDER ?? 'auto').toLowerCase();
let availability = 'unknown';
let currentAudio = null;
let currentObjectUrl = null;
function releaseCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio = null;
    }
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
    }
}
export function cancelElevenLabsPlayback() {
    releaseCurrentAudio();
}
async function fetchElevenLabsStatus() {
    try {
        const res = await fetch(STATUS_ENDPOINT, { method: 'GET' });
        if (!res.ok)
            return false;
        const data = (await res.json());
        return Boolean(data.enabled);
    }
    catch {
        return false;
    }
}
/** Whether ElevenLabs should be attempted for this session. */
export async function shouldUseElevenLabs() {
    if (TTS_PROVIDER === 'browser')
        return false;
    if (TTS_PROVIDER === 'elevenlabs') {
        if (availability === 'no')
            return false;
        if (availability === 'yes')
            return true;
        availability = (await fetchElevenLabsStatus()) ? 'yes' : 'no';
        return availability === 'yes';
    }
    // auto
    if (availability === 'no')
        return false;
    if (availability === 'yes')
        return true;
    availability = (await fetchElevenLabsStatus()) ? 'yes' : 'no';
    return availability === 'yes';
}
export function resetElevenLabsAvailability() {
    availability = 'unknown';
}
/** Speak via ElevenLabs proxy. Returns true if audio played. */
export async function speakWithElevenLabs(text) {
    if (!text.trim())
        return false;
    if (!(await shouldUseElevenLabs()))
        return false;
    try {
        const res = await fetch(TTS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) {
            availability = 'no';
            return false;
        }
        const blob = await res.blob();
        releaseCurrentAudio();
        const url = URL.createObjectURL(blob);
        currentObjectUrl = url;
        const audio = new Audio(url);
        currentAudio = audio;
        await new Promise((resolve, reject) => {
            audio.addEventListener('ended', () => resolve(), { once: true });
            audio.addEventListener('error', () => reject(new Error('audio playback failed')), { once: true });
            void audio.play().catch(reject);
        });
        releaseCurrentAudio();
        availability = 'yes';
        return true;
    }
    catch {
        availability = 'no';
        releaseCurrentAudio();
        return false;
    }
}
export function getTtsProviderLabel() {
    if (TTS_PROVIDER === 'browser')
        return 'browser';
    if (TTS_PROVIDER === 'elevenlabs')
        return 'elevenlabs';
    return availability === 'yes' ? 'elevenlabs' : availability === 'no' ? 'browser' : 'auto';
}

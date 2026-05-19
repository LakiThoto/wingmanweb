/**
 * ElevenLabs TTS proxy — keeps API key off the client.
 * Used by Vite dev/preview middleware and optional standalone server.
 */
const DEFAULT_MODEL = 'eleven_multilingual_v2';
export function loadElevenLabsConfig(env = {}) {
    const apiKey = env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey)
        return null;
    return {
        apiKey,
        voiceId: env.ELEVENLABS_VOICE_ID?.trim() || 'pNInz6obpgDQGcFmaJgB',
        modelId: env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL,
    };
}
export function isElevenLabsConfigured(env = {}) {
    return loadElevenLabsConfig(env) !== null;
}
/** POST body → MPEG audio bytes, or throws with status + message. */
export async function synthesizeSpeech(body, config) {
    const text = body.text?.trim();
    if (!text)
        throw new TtsHttpError(400, 'Missing text');
    const voiceId = body.voiceId?.trim() || config.voiceId;
    const modelId = body.modelId?.trim() || config.modelId;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
                stability: 0.45,
                similarity_boost: 0.8,
                style: 0.1,
                use_speaker_boost: true,
            },
        }),
    });
    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new TtsHttpError(res.status, detail || res.statusText);
    }
    return res.arrayBuffer();
}
export class TtsHttpError extends Error {
    constructor(status, detail) {
        super(`TTS failed (${status}): ${detail}`);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
        Object.defineProperty(this, "detail", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: detail
        });
        this.name = 'TtsHttpError';
    }
}
export async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        if (typeof chunk === 'string') {
            chunks.push(new TextEncoder().encode(chunk));
        }
        else {
            chunks.push(chunk);
        }
    }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
        merged.set(c, offset);
        offset += c.length;
    }
    const raw = new TextDecoder().decode(merged);
    return JSON.parse(raw);
}

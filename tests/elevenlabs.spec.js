import { describe, expect, it } from 'vitest';
import { isElevenLabsConfigured, loadElevenLabsConfig, TtsHttpError, } from '../server/elevenlabs';
describe('elevenlabs config', () => {
    it('returns null without API key', () => {
        expect(loadElevenLabsConfig({})).toBeNull();
        expect(isElevenLabsConfigured({})).toBe(false);
    });
    it('loads defaults when API key is set', () => {
        const cfg = loadElevenLabsConfig({
            ELEVENLABS_API_KEY: 'test-key',
        });
        expect(cfg).toEqual({
            apiKey: 'test-key',
            voiceId: 'pNInz6obpgDQGcFmaJgB',
            modelId: 'eleven_multilingual_v2',
        });
        expect(isElevenLabsConfigured({ ELEVENLABS_API_KEY: 'x' })).toBe(true);
    });
    it('respects custom voice and model', () => {
        const cfg = loadElevenLabsConfig({
            ELEVENLABS_API_KEY: 'k',
            ELEVENLABS_VOICE_ID: 'custom-voice',
            ELEVENLABS_MODEL_ID: 'eleven_turbo_v2_5',
        });
        expect(cfg?.voiceId).toBe('custom-voice');
        expect(cfg?.modelId).toBe('eleven_turbo_v2_5');
    });
});
describe('TtsHttpError', () => {
    it('exposes status and detail', () => {
        const err = new TtsHttpError(401, 'Unauthorized');
        expect(err.status).toBe(401);
        expect(err.detail).toBe('Unauthorized');
        expect(err.message).toContain('401');
    });
});

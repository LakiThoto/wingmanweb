import { describe, it, expect } from 'vitest';
import { formatDutchPlate, parsePlateFromSpeech, isValidDutchPlate } from '@/core/plate';
describe('formatDutchPlate', () => {
    it('formats compact input', () => {
        expect(formatDutchPlate('ab123c')).toBe('AB-123-C');
    });
    it('formats dashed input', () => {
        expect(formatDutchPlate('AB-123-C')).toBe('AB-123-C');
    });
    it('rejects invalid plates', () => {
        expect(formatDutchPlate('ABC')).toBeNull();
        expect(formatDutchPlate('')).toBeNull();
    });
});
describe('parsePlateFromSpeech', () => {
    it('parses spaced speech', () => {
        expect(parsePlateFromSpeech('ab 123 c')).toBe('AB-123-C');
    });
    it('strips kenteken prefix', () => {
        expect(parsePlateFromSpeech('kenteken ab 123 c')).toBe('AB-123-C');
    });
    it('returns null for unrelated speech', () => {
        expect(parsePlateFromSpeech('start bezorging')).toBeNull();
    });
});
describe('isValidDutchPlate', () => {
    it('validates formatted plates', () => {
        expect(isValidDutchPlate('AB-123-C')).toBe(true);
        expect(isValidDutchPlate('menu')).toBe(false);
    });
});

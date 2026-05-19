import { describe, expect, it } from 'vitest';
import { distanceMeters, formatDistanceM } from '../src/core/geolocation';
describe('geolocation helpers', () => {
    it('computes distance between two Alkmaar points', () => {
        const a = { latitude: 52.6378, longitude: 4.7486 };
        const b = { latitude: 52.6312, longitude: 4.7415 };
        const m = distanceMeters(a, b);
        expect(m).toBeGreaterThan(700);
        expect(m).toBeLessThan(1200);
    });
    it('formats meters and kilometers', () => {
        expect(formatDistanceM(85)).toBe('85 m');
        expect(formatDistanceM(1500)).toBe('1.5 km');
    });
});

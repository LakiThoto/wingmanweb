// FSM transition tests — every legal path through the state machine.
// No DOM required; pure logic over src/core/state.ts.
import { describe, it, expect, beforeEach } from 'vitest';
import { initState, getState, transition, setScreen, setLicensePlate, markActiveLoaded, markActiveDelivered, allLoaded, allDelivered, } from '../src/core/state';
const MOCK_DELIVERIES = [
    {
        id: '3SCD80340225',
        address: 'Keesomstraat 10e',
        postcode: '1821 BS',
        city: 'Alkmaar',
        rowInVan: 'B',
        positionInRow: 1,
        window: { from: '10:00', to: '10:30' },
    },
];
const TWO_DELIVERIES = [
    ...MOCK_DELIVERIES,
    {
        id: '3SCD80340226',
        address: 'Langestraat 76',
        postcode: '1811 AL',
        city: 'Alkmaar',
        rowInVan: 'A',
        positionInRow: 3,
        window: { from: '10:45', to: '11:15' },
    },
];
beforeEach(() => {
    initState('lab', 'beginner', MOCK_DELIVERIES);
});
describe('FSM happy path', () => {
    it('start → kenteken on kenteken_submitted', () => {
        expect(getState().screen).toBe('start');
        const ok = transition('kenteken_submitted');
        expect(ok).toBe(true);
        expect(getState().screen).toBe('kenteken');
    });
    it('kenteken → scan on start_laden', () => {
        transition('kenteken_submitted');
        expect(transition('start_laden')).toBe(true);
        expect(getState().screen).toBe('scan');
    });
    it('scan → laden on scan_ok', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        expect(transition('scan_ok')).toBe(true);
        expect(getState().screen).toBe('laden');
    });
    it('laden → scan on pkg_placed', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        transition('scan_ok');
        expect(transition('pkg_placed')).toBe(true);
        expect(getState().screen).toBe('scan');
    });
    it('laden → route on all_loaded', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        transition('scan_ok');
        expect(transition('all_loaded')).toBe(true);
        expect(getState().screen).toBe('route');
    });
    it('route → drive on route_start', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        transition('scan_ok');
        transition('all_loaded');
        expect(transition('route_start')).toBe(true);
        expect(getState().screen).toBe('drive');
    });
    it('drive → zoek on drive_complete', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        transition('scan_ok');
        transition('all_loaded');
        transition('route_start');
        expect(transition('drive_complete')).toBe(true);
        expect(getState().screen).toBe('zoek');
    });
    it('zoek → walk on pkg_confirmed', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        transition('scan_ok');
        transition('all_loaded');
        transition('route_start');
        transition('drive_complete');
        expect(transition('pkg_confirmed')).toBe(true);
        expect(getState().screen).toBe('walk');
    });
    it('walk → thuis on walk_arrived', () => {
        advanceToThuis();
        expect(getState().screen).toBe('thuis');
    });
    it('thuis → bevestigen on ja_thuis', () => {
        advanceToThuis();
        expect(transition('ja_thuis')).toBe(true);
        expect(getState().screen).toBe('bevestigen');
    });
    it('return → drive on return_continue', () => {
        initState('lab', 'beginner', TWO_DELIVERIES);
        advanceToThuis();
        transition('ja_thuis');
        markActiveDelivered();
        setScreen('return');
        expect(transition('return_continue')).toBe(true);
        expect(getState().screen).toBe('drive');
    });
    it('complete → start on complete_restart', () => {
        setScreen('complete');
        expect(transition('complete_restart')).toBe(true);
        expect(getState().screen).toBe('start');
    });
});
describe('FSM niet-thuis sub-flows', () => {
    beforeEach(() => advanceToThuis());
    it('thuis → niet-thuis on niet_thuis', () => {
        expect(transition('niet_thuis')).toBe(true);
        expect(getState().screen).toBe('niet-thuis');
    });
    it('niet-thuis → buren', () => {
        transition('niet_thuis');
        expect(transition('kies_buren')).toBe(true);
        expect(getState().screen).toBe('buren');
    });
    it('niet-thuis → veiligeplek', () => {
        transition('niet_thuis');
        expect(transition('kies_veiligeplek')).toBe(true);
        expect(getState().screen).toBe('veiligeplek');
    });
    it('niet-thuis → punt', () => {
        transition('niet_thuis');
        expect(transition('kies_punt')).toBe(true);
        expect(getState().screen).toBe('punt');
    });
    it('niet-thuis → later', () => {
        transition('niet_thuis');
        expect(transition('kies_later')).toBe(true);
        expect(getState().screen).toBe('later');
    });
});
describe('FSM scan error path', () => {
    it('scan → scan-error on scan_fail', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        expect(transition('scan_fail')).toBe(true);
        expect(getState().screen).toBe('scan-error');
    });
    it('scan-error → scan on scan_retry', () => {
        transition('kenteken_submitted');
        transition('start_laden');
        transition('scan_fail');
        expect(transition('scan_retry')).toBe(true);
        expect(getState().screen).toBe('scan');
    });
});
describe('FSM guards', () => {
    it('returns false for illegal transitions', () => {
        expect(getState().screen).toBe('start');
        expect(transition('scan_ok')).toBe(false);
        expect(getState().screen).toBe('start');
    });
});
describe('delivery tracking', () => {
    it('setLicensePlate updates state', () => {
        setLicensePlate('AB-123-C');
        expect(getState().licensePlate).toBe('AB-123-C');
    });
    it('markActiveDelivered marks delivery done', () => {
        expect(allDelivered()).toBe(false);
        markActiveDelivered();
        expect(getState().deliveries[0].delivered).toBe(true);
        expect(allDelivered()).toBe(true);
    });
});
describe('loading phase', () => {
    beforeEach(() => {
        initState('lab', 'beginner', TWO_DELIVERIES);
    });
    it('markActiveLoaded advances activeDeliveryIdx to next un-loaded', () => {
        expect(allLoaded()).toBe(false);
        expect(getState().activeDeliveryIdx).toBe(0);
        markActiveLoaded();
        expect(getState().deliveries[0].loaded).toBe(true);
        expect(getState().activeDeliveryIdx).toBe(1);
        expect(allLoaded()).toBe(false);
        markActiveLoaded();
        expect(getState().deliveries[1].loaded).toBe(true);
        expect(allLoaded()).toBe(true);
    });
    it('loaded and delivered are independent flags', () => {
        markActiveLoaded();
        expect(getState().deliveries[0].loaded).toBe(true);
        expect(getState().deliveries[0].delivered).toBeFalsy();
    });
    it('route_start resets activeDeliveryIdx to first un-delivered', () => {
        // Load both packages
        markActiveLoaded();
        markActiveLoaded();
        expect(allLoaded()).toBe(true);
        // Walk the FSM to route, then route_start
        transition('kenteken_submitted');
        transition('start_laden');
        transition('scan_ok');
        transition('all_loaded');
        expect(getState().screen).toBe('route');
        transition('route_start');
        // After loading both, activeDeliveryIdx had moved past the array;
        // route_start must snap it back to the first un-delivered (index 0).
        expect(getState().activeDeliveryIdx).toBe(0);
    });
});
// ── Helpers ────────────────────────────────────────────────────────────────
function advanceToThuis() {
    transition('kenteken_submitted');
    transition('start_laden');
    transition('scan_ok');
    transition('all_loaded');
    transition('route_start');
    transition('drive_complete');
    transition('pkg_confirmed');
    transition('walk_arrived');
}

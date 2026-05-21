// MRBD glasses boot: demo plate, deep links, on-device test hints.

import type { Mode, ScreenId } from '@/types';
import { getState, setLicensePlate, setScreen } from './state';
export const DEMO_PLATE = 'AB-123-C';

const VALID_SCREENS = new Set<ScreenId>([
  'start', 'kenteken', 'scan', 'scan-error', 'laden', 'route', 'drive', 'zoek', 'walk',
  'thuis', 'bevestigen', 'niet-thuis', 'buren', 'veiligeplek', 'punt', 'later',
  'return', 'complete',
]);

/** Screens to walk through on Ray-Ban (happy path + branches). */
export const GLASSES_TEST_SCREENS: ScreenId[] = [
  'kenteken', 'scan', 'laden', 'route', 'drive', 'zoek', 'walk', 'thuis', 'bevestigen',
  'niet-thuis', 'buren', 'veiligeplek', 'punt', 'later', 'return', 'complete',
  'scan-error',
];

export interface GlassesBootOptions {
  initialScreen?: ScreenId;
}

export function applyBootParams(mode: Mode): GlassesBootOptions {
  const params = new URLSearchParams(location.search);
  let initialScreen: ScreenId | undefined;

  // Only pre-fill when deep-linking ?plate= — otherwise tap-to-fill on start (no keyboard on MRBD).
  if (mode === 'glasses') {
    const plateParam = params.get('plate');
    if (plateParam) setLicensePlate(plateParam);
  }

  const screenParam = params.get('screen');
  if (screenParam && VALID_SCREENS.has(screenParam as ScreenId)) {
    setScreen(screenParam as ScreenId);
    initialScreen = screenParam as ScreenId;
  }

  return initialScreen ? { initialScreen } : {};
}

/** @deprecated Use applyBootParams */
export const applyGlassesBoot = applyBootParams;

export function logGlassesPreflight(): void {
  const { licensePlate, screen } = getState();
  const lines = [
    '[Wingman MRBD] Glasses mode active (600×600, D-pad only).',
    `  Plate: ${licensePlate}  |  Screen: ${screen}`,
    '  D-pad: ←/→ in horizontal groups, ↑/↓ between controls, Enter = activate, Esc = close menu.',
    '  Menu (start screen only): gear in header, bottom-left button, voice "menu"/"instellingen", lab keys M/I/G.',
    '  Custom panel: ↑↓ or +/- adjusts Support; Save returns to menu.',
    '  Happy path: Start → kenteken → scan → laden → route → drive → zoek → walk → thuis → bevestigen.',
    '  Deep link: ?screen=zoek&plate=AB-123-C  |  Audio: TTS fallback if /audio/*.mp3 missing.',
    `  Test screens: ${GLASSES_TEST_SCREENS.join(', ')}`,
  ];
  console.info(lines.join('\n'));

  const w = window as Window & { wingmanGlassesTest?: unknown };
  w.wingmanGlassesTest = {
    screens: GLASSES_TEST_SCREENS,
    currentScreen: screen,
    plate: licensePlate,
    logIssue: (screen: string, note: string) => {
      console.warn(`[Wingman MRBD issue] ${screen}: ${note}`);
    },
  };
}

// Voice recognition — lab + glasses (menu / tier commands).
// webkitSpeechRecognition wrapper that emits normalised NL commands.

import { emit } from '@/core/events';
import { transition, getState } from '@/core/state';
import { skipStopLaterToday, completeLaterTomorrow } from '@/core/delivery-complete';
import { setTier } from '@/core/tier';
import { closeHandMenu, isHandMenuOpen, toggleHandMenu } from '@/ui/hand-menu';

// Map of NL transcript fragments → FSM events or side-effects
const VOICE_COMMANDS: Array<{
  match: RegExp;
  action: () => void;
}> = [
  {
    match: /^(start laden|start bezorging|start)$/,
    action: () => {
      const { screen } = getState();
      if (screen === 'start') return;
      transition('start_laden');
    },
  },
  { match: /^(scan|volgende pakket)$/,               action: () => transition('scan_ok') },
  { match: /^(volgende stop|route|plan)$/,           action: () => transition('route_start') },
  { match: /^(pakket gevonden|gevonden)$/,           action: () => transition('pkg_confirmed') },
  { match: /^(ja|ja thuis|thuis|aanwezig)$/,         action: () => transition('ja_thuis') },
  { match: /^(niet thuis|niemand|afwezig)$/,         action: () => transition('niet_thuis') },
  { match: /^buren$/,                                action: () => transition('kies_buren') },
  { match: /^(veilige plek|veilig)$/,                action: () => transition('kies_veiligeplek') },
  { match: /^(punt|postnl punt|locker)$/,            action: () => transition('kies_punt') },
  { match: /^later$/,                                action: () => transition('kies_later') },
  { match: /^(volgende stop|terug naar bus)$/,       action: () => transition('return_continue') },
  { match: /^(opnieuw|herstart)$/,                  action: () => transition('complete_restart') },
  { match: /^vandaag$/, action: () => {
    if (getState().screen === 'later') skipStopLaterToday();
  }},
  { match: /^morgen$/, action: () => {
    if (getState().screen === 'later') completeLaterTomorrow();
  }},
  { match: /^pakket geplaatst$/,                     action: () => transition('pkg_placed') },
  { match: /^\s*menu\s*$/i,                          action: () => toggleHandMenu() },
  { match: /sluit\s+menu|menu\s+sluiten|close\s+(the\s+)?menu/i, action: () => {
    if (isHandMenuOpen()) closeHandMenu();
  }},
  { match: /^(beginner)$/,                           action: () => setTier('beginner') },
  { match: /^(ervaren|experienced)$/,                action: () => setTier('experienced') },
  { match: /^pro$/,                                  action: () => setTier('pro') },
];

function normalizeTranscript(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[.!?,]/g, '')
    .trim();
}

function handleTranscript(raw: string): void {
  const text = normalizeTranscript(raw);
  emit('voice', { transcript: text });

  for (const cmd of VOICE_COMMANDS) {
    if (cmd.match.test(text)) {
      cmd.action();
      return;
    }
  }
}

export function initVoice(): void {
  // @ts-expect-error — webkitSpeechRecognition is not in standard TS lib
  const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition() as {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((e: { results: SpeechRecognitionResultList; resultIndex: number }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start: () => void;
  };

  recognition.lang = 'nl-NL';
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    const result = e.results[e.results.length - 1];
    if (result?.[0]) handleTranscript(result[0].transcript);
  };

  recognition.onerror = () => {
    // Restart on error after a brief pause
    setTimeout(() => recognition.start(), 1000);
  };

  recognition.onend = () => {
    // Keep recognition alive
    recognition.start();
  };

  recognition.start();
}

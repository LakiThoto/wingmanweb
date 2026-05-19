import { getState } from './state';
import { getTier } from './tier';
import { STRINGS, t } from './strings';

// Maps string keys to pre-recorded .mp3 filenames in public/audio/
const AUDIO_FILES: Record<string, string> = {
  'compliment.placed':       'compliment-placed.mp3',
  'compliment.all.loaded':   'compliment-all-loaded.mp3',
  'compliment.parcel.found': 'compliment-parcel-found.mp3',
  'compliment.delivered':    'compliment-delivered.mp3',
  'compliment.safeplace':    'compliment-safeplace.mp3',
  'compliment.neighbor':     'compliment-neighbor.mp3',
  'compliment.locker':       'compliment-locker.mp3',
};

// Tier-aware string lookup: prefers `key.{tier}` over flat `key`.
// Returns null when the resolved variant is intentionally empty (pro silence).
function resolveTierString(key: string): string | null {
  const tieredKey = `${key}.${getTier()}`;
  if (tieredKey in STRINGS) {
    const v = STRINGS[tieredKey];
    return v === '' ? null : v;
  }
  return STRINGS[key] ?? key;
}

// While the assistant is speaking, glow the AI mark — matches the Wingman copy
// `.ai-triangle.ai-speaking` state. Idempotent: scheduling a new speech clears
// the previous timer first.
let speakingTimer: ReturnType<typeof setTimeout> | null = null;
function setAiSpeaking(durationMs: number): void {
  const btn = document.querySelector<HTMLElement>('.btn-primary');
  if (!btn) return;
  btn.classList.add('ai-speaking');
  if (speakingTimer) clearTimeout(speakingTimer);
  speakingTimer = setTimeout(() => {
    btn.classList.remove('ai-speaking');
    speakingTimer = null;
  }, durationMs);
}

/** Brief green confirmation flash on the AI mark — voice command understood. */
export function flashAiConfirmed(): void {
  const btn = document.querySelector<HTMLElement>('.btn-primary');
  if (!btn) return;
  btn.classList.add('ai-confirmed');
  setTimeout(() => btn.classList.remove('ai-confirmed'), 600);
}

let ttsQueue: string[] = [];
let ttsBusy = false;

function flushTts(): void {
  if (ttsBusy || !ttsQueue.length) return;
  const text = ttsQueue.shift()!;
  ttsBusy = true;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'nl-NL';
  u.rate = 0.92;
  u.pitch = 1.0;

  // Prefer a Dutch voice if available
  const voices = speechSynthesis.getVoices();
  const nlVoice = voices.find(v => /^nl-nl\b/i.test(v.lang)) ??
                  voices.find(v => /^nl\b/i.test(v.lang)) ??
                  null;
  if (nlVoice) u.voice = nlVoice;

  u.onend = () => { ttsBusy = false; flushTts(); };
  u.onerror = () => { ttsBusy = false; flushTts(); };
  speechSynthesis.speak(u);
}

function speakTtsText(text: string): void {
  if (!('speechSynthesis' in window)) return;
  ttsQueue.push(text);
  if (speechSynthesis.getVoices().length > 0) {
    flushTts();
  } else {
    speechSynthesis.onvoiceschanged = () => { flushTts(); };
  }
}

/** Glasses: play MP3 when present; otherwise fall back to TTS (MRBD has no mic). */
function playAudioFile(filename: string, fallbackText?: string): void {
  const audio = new Audio(`/audio/${filename}`);
  const useFallback = () => {
    if (fallbackText) speakTtsText(fallbackText);
  };
  audio.addEventListener('error', useFallback, { once: true });
  audio.play().catch(useFallback);
}

/** Speak a string key (from STRINGS) or raw text. */
export function speak(keyOrText: string): void {
  const { mode } = getState();

  if (mode === 'glasses') {
    const filename = AUDIO_FILES[keyOrText];
    const text = t(keyOrText) ?? keyOrText;
    if (filename) playAudioFile(filename, text);
    else if (text) speakTtsText(text);
    return;
  }

  // Lab mode: use Web Speech TTS
  if (!('speechSynthesis' in window)) return;
  const text = t(keyOrText) ?? keyOrText;
  ttsQueue.push(text);
  // Voices may not be loaded yet — defer slightly
  if (speechSynthesis.getVoices().length > 0) {
    flushTts();
  } else {
    speechSynthesis.onvoiceschanged = () => { flushTts(); };
  }
}

/**
 * Tier-aware speak. Looks up `key.{currentTier}` first (e.g.
 * `compliment.placed.beginner`); falls back to flat `key`. Empty variant means
 * "stay silent" — pro tier uses this to preserve speed. Also drives the
 * AI-button speaking glow.
 */
function substituteVars(text: string, vars?: Record<string, string>): string {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
    text,
  );
}

function speakResolvedText(variant: string): void {
  const dur = Math.max(600, Math.min(4000, variant.length * 60));
  setAiSpeaking(dur);

  const { mode } = getState();
  if (mode === 'glasses') {
    speakTtsText(variant);
    return;
  }
  if (!('speechSynthesis' in window)) return;
  ttsQueue.push(variant);
  if (speechSynthesis.getVoices().length > 0) {
    flushTts();
  } else {
    speechSynthesis.onvoiceschanged = () => { flushTts(); };
  }
}

/** Tier-aware speak with {n} / {addr} placeholder substitution. */
export function speakTierPhrase(key: string, vars?: Record<string, string>): void {
  const variant = resolveTierString(key);
  if (variant == null) return;
  speakResolvedText(substituteVars(variant, vars));
}

export function speakByTier(key: string): void {
  const variant = resolveTierString(key);
  if (variant == null) return;

  const { mode } = getState();
  if (mode === 'glasses') {
    const dur = Math.max(600, Math.min(4000, variant.length * 60));
    setAiSpeaking(dur);
    const filename = AUDIO_FILES[`${key}.${getTier()}`] ?? AUDIO_FILES[key];
    if (filename) playAudioFile(filename, variant);
    else speakTtsText(variant);
    return;
  }
  speakResolvedText(variant);
}

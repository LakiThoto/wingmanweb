/** Consistent SVG icon markup (WingmanCopy style — no emojis). */

export function iconImg(
  name: string,
  className = 'ui-icon',
  size = 22,
): string {
  return `<img class="${className}" src="/assets/icons/${name}.svg" alt="" width="${size}" height="${size}" aria-hidden="true" decoding="async" />`;
}

/** Settings gear — lab companion button, menu custom tier tile. */
export function settingsIcon(className = 'settings-icon', size = 24): string {
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/** Mic in glass pill — scan / load voice rows (Wingman Copy .load-voice-mic). */
export function loadVoiceMicPill(): string {
  return `<span class="load-voice-mic" aria-hidden="true">
    <svg width="12" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="1" width="5" height="7" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3 8a5 5 0 0 0 10 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8 13v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </span>`;
}

/** Thumb-up in mic pill — recipient yes/no (thuis). */
export function voiceHintThumb(): string {
  return `<span class="load-voice-mic rc-thumb-wrap" aria-hidden="true"><img class="rc-thumb-img voice-hint-thumb" src="/assets/thumb-up.png" width="20" height="24" alt="" decoding="async" /></span>`;
}

/** Thumb-only hint — bevestigen / branch choice grids (Figma 1:1674). */
export function confirmThumbHint(): string {
  return `<div class="cf-thumb-wrap" aria-hidden="true"><img class="cf-thumb-img" src="/assets/thumb-up.png" width="27" height="32" alt="" decoding="async" /></div>`;
}

/** @deprecated Use loadVoiceMicPill() */
export function voiceHintMic(): string {
  return loadVoiceMicPill();
}

/** Start screen weather (sun + cloud). */
export function weatherBadge(temp = '17°'): string {
  return `<div class="weather-badge" aria-hidden="true">
    <span class="weather-icons">
      <img class="weather-sun" src="/assets/weather-sun.svg" alt="" width="29" height="29" />
      <img class="weather-cloud" src="/assets/weather-cloud.svg" alt="" width="60" height="38" />
    </span>
    <span class="weather-temp">${temp}</span>
  </div>`;
}

/** Consistent SVG icon markup (WingmanCopy style — no emojis). */
export function iconImg(name, className = 'ui-icon', size = 22) {
    return `<img class="${className}" src="/assets/icons/${name}.svg" alt="" width="${size}" height="${size}" aria-hidden="true" decoding="async" />`;
}
/** Mic in glass pill — scan / load voice rows (Wingman Copy .load-voice-mic). */
export function loadVoiceMicPill() {
    return `<span class="load-voice-mic" aria-hidden="true">
    <svg width="12" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="1" width="5" height="7" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3 8a5 5 0 0 0 10 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8 13v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </span>`;
}
/** Thumb-up in mic pill — recipient yes/no (thuis). */
export function voiceHintThumb() {
    return `<span class="load-voice-mic rc-thumb-wrap" aria-hidden="true"><img class="rc-thumb-img voice-hint-thumb" src="/assets/thumb-up.png" width="20" height="24" alt="" decoding="async" /></span>`;
}
/** Thumb-only hint — bevestigen / branch choice grids (Figma 1:1674). */
export function confirmThumbHint() {
    return `<div class="cf-thumb-wrap" aria-hidden="true"><img class="cf-thumb-img" src="/assets/thumb-up.png" width="27" height="32" alt="" decoding="async" /></div>`;
}
/** @deprecated Use loadVoiceMicPill() */
export function voiceHintMic() {
    return loadVoiceMicPill();
}
/** Start screen weather (sun + cloud). */
export function weatherBadge(temp = '17°') {
    return `<div class="weather-badge" aria-hidden="true">
    <span class="weather-icons">
      <img class="weather-sun" src="/assets/weather-sun.svg" alt="" width="29" height="29" />
      <img class="weather-cloud" src="/assets/weather-cloud.svg" alt="" width="60" height="38" />
    </span>
    <span class="weather-temp">${temp}</span>
  </div>`;
}

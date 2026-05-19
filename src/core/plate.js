// Dutch license plate parsing (e.g. AB-123-C) from typed or spoken input.
const PLATE_BODY = /^([A-Z]{2})(\d{2,3})([A-Z]{1,2})$/;
/** Normalise to AB-123-C, or null if not a valid plate body. */
export function formatDutchPlate(raw) {
    const body = raw.replace(/[\s-]/g, '').toUpperCase();
    const m = body.match(PLATE_BODY);
    if (!m)
        return null;
    return `${m[1]}-${m[2]}-${m[3]}`;
}
/** Extract a plate from a voice transcript (may include filler words). */
export function parsePlateFromSpeech(transcript) {
    let text = transcript.toUpperCase();
    text = text
        .replace(/\bKENTEKEN(\s+NUMMER)?\b/g, ' ')
        .replace(/\bNUMMER\b/g, ' ')
        .replace(/\bIS\b/g, ' ')
        .trim();
    const withGaps = text.match(/\b([A-Z]{2})[\s,-]+(\d{2,3})[\s,-]+([A-Z]{1,2})\b/);
    if (withGaps)
        return formatDutchPlate(`${withGaps[1]}${withGaps[2]}${withGaps[3]}`);
    const compact = text.replace(/[^A-Z0-9]/g, '');
    const compactMatch = compact.match(/([A-Z]{2}\d{2,3}[A-Z]{1,2})/);
    if (compactMatch)
        return formatDutchPlate(compactMatch[1]);
    return formatDutchPlate(compact);
}
export function isValidDutchPlate(raw) {
    return formatDutchPlate(raw) !== null;
}

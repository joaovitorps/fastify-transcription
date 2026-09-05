export function joinTranscriptSegments(
  segments: Array<{ text: string }>,
): string {
  return segments.map((segment) => segment.text).join(" ");
}

export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

export function formatTranscriptSegments(
  segments: Array<{ text: string; offset: number }>,
): string {
  return segments
    .map((segment) => `[${formatTimestamp(segment.offset)}] ${segment.text}`)
    .join("\n");
}

/**
 * Deterministic gradient generator for posts without a cover image.
 * Given the same slug, always produces the same gradient.
 */

// Violet palette — darker shades ensure contrast with white title text
const PALETTE = [
  '#7c3aed', // violet-600
  '#6d28d9', // violet-700
  '#5b21b6', // violet-800
  '#4c1d95', // violet-900
  '#2e1065', // violet-950
] as const;

/** Simple string → 32-bit integer hash (djb2) */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateCoverGradient(slug: string): string {
  const h = hash(slug);

  const colorA = PALETTE[h % PALETTE.length];
  const colorB = PALETTE[Math.floor(h / PALETTE.length) % PALETTE.length];
  // Ensure two distinct colors — if they collide, pick the next one
  const finalB = colorA === colorB ? PALETTE[(h + 1) % PALETTE.length] : colorB;
  // Diagonal angles in 45° steps (0, 45, 90, 135, 180, 225, 270, 315)
  const angle = (Math.floor(h / (PALETTE.length * PALETTE.length)) % 8) * 45;

  return `linear-gradient(${angle}deg, ${colorA}, ${finalB})`;
}

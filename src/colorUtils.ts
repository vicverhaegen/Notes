/**
 * Color utilities for list theming, alpha calculation, and luminance contrast.
 */

export function hexToRgba(hexOrColor: string, opacityPercent: number = 70): string {
  if (!hexOrColor) return `rgba(255, 255, 255, ${opacityPercent / 100})`;

  const cleanHex = hexOrColor.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, opacityPercent)) / 100})`;
  } else if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, opacityPercent)) / 100})`;
  }

  // Fallback to CSS color-mix
  return `color-mix(in srgb, ${hexOrColor} ${opacityPercent}%, transparent)`;
}

export function isDarkColor(hexOrColor: string, opacityPercent: number = 70): boolean {
  if (!hexOrColor) return false;
  const cleanHex = hexOrColor.replace('#', '').trim();
  let r = 255,
    g = 255,
    b = 255;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return false;
  }

  // Standard relative perceived luminance (ITU-R BT.601)
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  // If the color is dark (luma < 145) and opacity is enough to show the darkness (> 35%)
  return luma < 145 && opacityPercent > 35;
}

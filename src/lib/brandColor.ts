export interface BrandColorTokens {
  primary: string;
  hover: string;
  light: string;
  text: string;
}

export const DEFAULT_PRIMARY_COLOR = '#315B46';
export const DEFAULT_PRIMARY_HOVER = '#254636';
export const DEFAULT_PRIMARY_LIGHT = '#EEF3F0';
export const DEFAULT_PRIMARY_TEXT = '#FFFFFF';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Converts an sRGB color component (0-255) to linear light value for WCAG luminance calculations.
 */
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Calculates WCAG 2.1 relative luminance for an RGB color.
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/**
 * Parses a 6-digit hex string into { r, g, b } components.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Formats RGB values as an uppercase 6-digit hex code with leading '#'.
 */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Derives brand color tokens (primary, hover, light, and readable text color).
 * Validates with /^#[0-9a-fA-F]{6}$/ for security against CSS injection.
 * If invalid or null, falls back to Velmora green defaults (#315B46).
 */
export function deriveBrandColors(inputHex?: string | null): BrandColorTokens {
  const trimmed = typeof inputHex === 'string' ? inputHex.trim() : '';

  if (!HEX_COLOR_REGEX.test(trimmed)) {
    return {
      primary: DEFAULT_PRIMARY_COLOR,
      hover: DEFAULT_PRIMARY_HOVER,
      light: DEFAULT_PRIMARY_LIGHT,
      text: DEFAULT_PRIMARY_TEXT,
    };
  }

  const { r, g, b } = hexToRgb(trimmed);

  // 1. Hover color: ~20% darker (multiply by 0.8)
  const hover = rgbToHex(r * 0.8, g * 0.8, b * 0.8);

  // 2. Light tint: ~92% white + 8% primary color
  const light = rgbToHex(r * 0.08 + 255 * 0.92, g * 0.08 + 255 * 0.92, b * 0.08 + 255 * 0.92);

  // 3. Contrast text: WCAG relative luminance check against pure white
  const lum = getRelativeLuminance(r, g, b);
  // White luminance is 1.0. Contrast ratio = (1.0 + 0.05) / (lum + 0.05)
  const contrastWithWhite = 1.05 / (lum + 0.05);

  const text = contrastWithWhite >= 4.5 ? '#FFFFFF' : '#111827';

  return {
    primary: trimmed.toUpperCase(),
    hover,
    light,
    text,
  };
}

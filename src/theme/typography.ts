import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as useGoogleFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
/**
 * Font family names, keyed by weight. These map 1:1 to the fonts loaded via
 * `useAppFonts` below — always load fonts before rendering any text that
 * references these.
 */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/** Type scale, in px. Line heights are unitless multipliers applied by consumers. */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 32,
} as const;

/**
 * Text style for monetary values.
 *
 * Tabular figures are applied via web CSS (`font-variant-numeric`) in
 * `WebScrollbarStyles` — RN Web's `fontVariant: ['tabular-nums']` maps to
 * invalid CSS (`font-variant`) and paints a tight box around every amount.
 */
export const moneyTextStyle: { fontFamily: string } = {
  fontFamily: fontFamily.semibold,
};

/** Loads all Plus Jakarta Sans weights used by the app. Call once, near the app root. */
export function useAppFonts() {
  return useGoogleFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
}

export default fontFamily;

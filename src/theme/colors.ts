/**
 * Paisa color palette.
 *
 * Ported 1:1 from the product design mockup. Do not tweak these values
 * without checking the mockup first — screens are built assuming these
 * exact hexes.
 */
export const colors = {
  bg: '#F4F2EF',
  surface: '#FCFAF7',
  surfaceSubtle: '#FBF9F6',
  border: '#E9E4DC',
  textPrimary: '#14120F',
  textMuted: '#6B6459',
  accent: '#5B54D6',
  accentHover: '#4740C4',
  success: '#2F7D5D',
  danger: '#C2543D',
  warning: '#D8A441',
} as const;

export type ColorName = keyof typeof colors;

export default colors;

/**
 * Spacing & radius scale for Paisa.
 *
 * Keep usage of raw numbers in screens/components to a minimum — reach for
 * these tokens so future design tweaks stay a one-file change.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  /** Standard card corner radius. */
  card: 20,
  /** Larger card corner radius (hero/feature cards). */
  cardLarge: 24,
  /** Centered modal / bottom sheet corner radius (mockup `sheetRadius`). */
  modal: 26,
  /** Primary modal CTA (Save transaction, etc.). */
  cta: 15,
  /** Filter chip inner radius. */
  filterChip: 10,
  /** Recessed nested sub-tile (inside a hero/card), e.g. forecast mini-stats. */
  tileSmall: 14,
  /** Icon chip / squircle avatar corner radius. */
  chip: 13,
  /** Text input corner radius. */
  input: 13,
  /** Fully-rounded pill shape (buttons, chips, badges). */
  pill: 99,
} as const;

export type SpacingName = keyof typeof spacing;
export type RadiusName = keyof typeof radius;

export default spacing;

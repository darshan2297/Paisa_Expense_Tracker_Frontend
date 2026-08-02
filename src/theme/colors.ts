/**
 * Paisa color palette.
 *
 * Ported 1:1 from the product design mockup (extracted directly from its
 * source, not approximated - see the design project linked in
 * docs/ARCHITECTURE.md). Do not tweak these values without checking the
 * mockup first — screens are built assuming these exact hexes.
 */
export const colors = {
  bg: '#F4F2EF',
  surface: '#FCFAF7',
  surfaceSubtle: '#FBF9F6',
  /** Border for the recessed `surfaceSubtle` variant (nested sub-tiles). */
  borderSubtle: '#EFEBE5',
  /** Divider between list rows (recent activity, preference rows, etc). */
  divider: '#F1EDE7',
  border: '#E9E4DC',
  textPrimary: '#14120F',
  textMuted: '#6B6459',
  /** Stat/field label ink (e.g. "Total balance", "Name") — distinct from `textMuted`. */
  textLabel: '#8B857C',
  /** Sub-copy/caption ink — the lightest tier, used for secondary lines under a label/value. */
  textCaption: '#A39C92',
  accent: '#5B54D6',
  accentHover: '#4740C4',
  accentTint: '#EDE9FE',
  /** Icon/value tone for success states (income, security, positive deltas). */
  success: '#2F7D5D',
  /** Deeper green used specifically for positive money VALUES (vs. `success` icon tone). */
  successValue: '#23694E',
  successTint: '#E2F0E9',
  /** Icon/value tone for danger states (expense, destructive actions). */
  danger: '#C2543D',
  /** Deeper red used specifically for negative money VALUES (vs. `danger` icon tone). */
  dangerValue: '#B04A34',
  /** Muted red for sub-copy inside a danger-tinted card. */
  dangerSubtext: '#A9634D',
  dangerTint: '#F9EBE5',
  dangerTintBorder: '#F1DCD3',
  warning: '#D8A441',

  // --- Dark hero card (net worth, profile header, forecast) ---
  heroGradientStart: '#2A2620',
  heroGradientEnd: '#15120F',
  heroText: '#FCFAF7',
  heroTextMuted: 'rgba(252,250,247,.6)',
  heroTextFaint: 'rgba(252,250,247,.42)',
  heroGlow: 'rgba(124,116,255,.4)',
  heroSurfaceSubtle: 'rgba(252,250,247,.07)',
  heroBorderSubtle: 'rgba(252,250,247,.18)',
  heroFillSubtle: 'rgba(252,250,247,.08)',

  // --- Brand gradient (logo mark, avatar/initials chips) ---
  brandGradientStart: '#7C74FF',
  brandGradientEnd: '#4B43C9',
} as const;

export type ColorName = keyof typeof colors;

export default colors;

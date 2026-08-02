# Frontend — Component Guide

## Design Tokens (`src/theme/`)

Ported directly from the product's UI/UX design mockup, not invented generically —
see the workspace's approved architecture plan for the source. Always reference these
rather than hardcoding a hex value or a spacing number in a component.

Colors were re-extracted directly from the mockup's source (not approximated) during
F1 after the first pass turned out to only reuse the palette while inventing generic
layouts — see `colors.ts`'s own comments for the full token list, but the key
distinctions worth knowing before styling anything new:

- **`accent` (`#5B54D6`) is a text-link color, never a solid button fill.** The
  mockup's one true primary CTA is a near-black (`#14120F`) pill — see `Button.tsx`.
- **Icon tone vs. value tone are different shades.** `success`/`danger` are the
  lighter tones used for icon chips; `successValue`/`dangerValue` are the deeper
  tones used for colored money text (stat tile values, transaction amounts). Mixing
  these up is an easy way to subtly drift from the mockup.
- **Three tiers of muted text**: `textMuted` (general secondary text), `textLabel`
  (stat/field labels, e.g. "Total balance"), `textCaption` (the lightest tier, sub-copy
  under a label/value). The mockup uses all three deliberately, not interchangeably.
- `typography.ts` — 'Plus Jakarta Sans' (via `@expo-google-fonts/plus-jakarta-sans`,
  loaded with `expo-font`'s `useFonts` in the root layout), weights 400–800,
  tabular-nums for money values so columns of amounts align.
- `spacing.ts` — card radius 20 (`radius.card`) / 24 (`radius.cardLarge`), icon-chip
  and input radius 13 (`radius.chip` / `radius.input`), recessed nested-tile radius 14
  (`radius.tileSmall`), pill radius 99, spacing scale 4/8/12/16/20/24.

## Shared Components (`src/components/`)

- `Button.tsx` — primary (near-black CTA), secondary (bordered), danger variants.
- `Card.tsx` — the canonical bordered/rounded surface every panel is built from.
- `StatTile.tsx` — label → large tabular-nums value → muted subtext, with a `tone`
  prop for success/danger value coloring.
- `Input.tsx` — labeled text field, pixel-matched to the mockup's exact field style
  (46px height, 13px radius). Forwards its ref for React Hook Form.
- `SettingRow.tsx` — label/sublabel + `ToggleSwitch` row for preference lists.
- `ToggleSwitch.tsx` — custom 44×24 track / 20×20 thumb toggle. Deliberately NOT the
  native `Switch` — that renders each OS's own control and can't be sized/styled to
  match a specific design; this one looks identical everywhere.
- `HeroCard.tsx` — the dark gradient card (net worth, profile header, forecasts) with
  the mockup's signature violet glow blob in the top-right corner. Uses
  `expo-linear-gradient` — plain `backgroundColor` can't reproduce this.
- `IconChip.tsx` — small colored squircle behind a Feather icon (`@expo/vector-icons`),
  used for quick-link cards, category dots, and KPI-tile icons. The mockup's icons are
  Feather/Lucide-style outlines — don't reach for emoji as a placeholder; it reads as
  a completely different design language (this happened once already — the tab bar
  originally used ⌂/☺ before being corrected to real icons).
- Add a new shared component here only when a UI pattern repeats across **two or
  more** features — a one-off screen-specific element belongs in that feature's own
  `components/` folder instead.

**Before building any new screen**: go back to the actual mockup source for that
screen's structure (hero layout, card composition, exact spacing) rather than
free-styling with the right colors. Reusing the palette is necessary but not
sufficient for matching the design — the component hierarchy and measurements matter
just as much. If a stat/section needs real data that doesn't exist yet (no
Transactions/Accounts before F2/F3), prefer an honest empty state over fabricated
numbers — see `app/(tabs)/index.tsx`'s "Recent" card for the pattern.

## Money & Date Formatting (`src/utils/`)

- `currency.ts` — `formatINR()` (standard `Intl.NumberFormat('en-IN')` currency
  format) and `compactINR()` (the mockup's lakh/crore compact form: `≥1,00,000` →
  `"₹X.Y L"`, `≥1,00,00,000` → `"₹X Cr"`). Always use these rather than formatting a
  rupee amount inline — the lakh/crore convention is easy to get subtly wrong by hand.
- `date.ts` — `en-IN` date formatting helpers.

## When to Add a New Theme Token vs. a One-Off Style

If a value is used in more than one component, it belongs in `src/theme/`, not
copy-pasted. If it's genuinely specific to one screen's one-off layout, an inline
style is fine — don't add theme tokens speculatively for values that don't repeat yet.

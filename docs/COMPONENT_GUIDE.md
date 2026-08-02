# Frontend — Component Guide

## Design Tokens (`src/theme/`)

Ported directly from the product's UI/UX design mockup, not invented generically —
see the workspace's approved architecture plan for the source. Always reference these
rather than hardcoding a hex value or a spacing number in a component.

- `colors.ts` — background `#F4F2EF`, surface `#FCFAF7`, border `#E9E4DC`, text
  primary `#14120F`, muted `#6B6459`, accent `#5B54D6` (hover `#4740C4`), success
  `#2F7D5D`, danger `#C2543D`, warning `#D8A441`.
- `typography.ts` — 'Plus Jakarta Sans' (via `@expo-google-fonts/plus-jakarta-sans`,
  loaded with `expo-font`'s `useFonts` in the root layout), weights 400–800,
  tabular-nums for money values so columns of amounts align.
- `spacing.ts` — card radius 20–24, pill radius 99 (fully rounded chips/badges),
  spacing scale 4/8/12/16/20/24.

## Shared Components (`src/components/`)

- `Button.tsx`, `Card.tsx`, `StatTile.tsx` exist as of Phase 0 — the recurring
  patterns from the design mockup (a card is a bordered, rounded surface; a stat tile
  is label → large tabular-nums value → muted subtext).
- Add a new shared component here only when a UI pattern repeats across **two or
  more** features — a one-off screen-specific element belongs in that feature's own
  `components/` folder instead.

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

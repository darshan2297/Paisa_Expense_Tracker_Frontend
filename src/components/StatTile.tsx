import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize, moneyTextStyle } from '@/theme/typography';

export type StatTileProps = {
  /** Small caption above the value, e.g. "Total balance". */
  label: string;
  /** The headline value, e.g. a formatted currency amount. */
  value: string;
  /** Optional secondary line below the value, e.g. "+12% vs last month". */
  sub?: string;
  /** Tint applied to `sub` — useful for positive/negative deltas. */
  subTone?: 'muted' | 'success' | 'danger';
};

/**
 * Label / value / sub layout used for dashboard KPIs (balance, income,
 * expenses, etc). Purely presentational — data wiring happens per-feature.
 */
export function StatTile({ label, value, sub, subTone = 'muted' }: StatTileProps) {
  return (
    <Card>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, moneyTextStyle]}>{value}</Text>
      {sub ? <Text style={[styles.sub, subToneStyles[subTone]]}>{sub}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});

const subToneStyles = StyleSheet.create({
  muted: { color: colors.textMuted },
  success: { color: colors.success },
  danger: { color: colors.danger },
});

export default StatTile;

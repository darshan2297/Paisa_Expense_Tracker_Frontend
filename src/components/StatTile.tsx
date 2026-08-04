import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';

export type StatTileProps = {
  /** Small caption above the value, e.g. "Total balance". */
  label: string;
  /** The headline value, e.g. a formatted currency amount. */
  value: string;
  /** Optional secondary line below the value, e.g. "+12% vs last month". */
  sub?: string;
  /** Tint applied to `value` only (the mockup keeps `sub` neutral regardless of sign). */
  tone?: 'neutral' | 'success' | 'danger';
};

/**
 * Label / value / sub layout used for dashboard KPIs (balance, income,
 * expenses, etc), pixel-matched to the mockup's canonical stat-tile:
 * label `11.5px/700/#8B857C`, value `22px/800/letter-spacing -.04em`
 * (`#23694E`/`#B04A34` for success/danger — the deeper "value" tones, not
 * the lighter icon tones), sub `11.5px/500/#A39C92`.
 */
export function StatTile({ label, value, sub, tone = 'neutral' }: StatTileProps) {
  return (
    <Card>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, moneyTextStyle, valueToneStyles[tone]]}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textLabel,
  },
  value: {
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 6,
  },
  sub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
    marginTop: 4,
  },
});

const valueToneStyles = StyleSheet.create({
  neutral: {},
  success: { color: colors.successValue },
  danger: { color: colors.dangerValue },
});

export default StatTile;

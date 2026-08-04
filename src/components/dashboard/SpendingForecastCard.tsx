import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import type { LifeDashboardData } from '@/features/dashboard/types';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { formatYearMonthLabel } from '@/utils/date';

type SpendingForecastCardProps = {
  month: string;
  forecast: LifeDashboardData['forecast'];
};

export function SpendingForecastCard({ month, forecast }: SpendingForecastCardProps) {
  const { gridColumns } = useResponsiveLayout();
  const miniCols = gridColumns(2, 2, 1);
  const miniWidth = `${100 / miniCols}%` as `${number}%`;
  const barColor = forecast.overBudget ? '#EF6B4E' : colors.brandGradientStart;

  return (
    <Card size="large" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending forecast</Text>
        <Text style={styles.month}>{formatYearMonthLabel(month)}</Text>
      </View>

      <View style={styles.predictRow}>
        <Text style={[styles.predicted, moneyTextStyle]}>{forecast.predicted}</Text>
        <Text style={styles.predictNote}>predicted by month end</Text>
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barPredicted,
            { width: `${forecast.predictedWidthPct}%`, backgroundColor: barColor },
          ]}
        />
        <View
          style={[
            styles.barSpent,
            { width: `${forecast.spentWidthPct}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <View style={styles.barLabels}>
        <Text style={styles.barLabel}>Spent {forecast.spent}</Text>
        <Text style={styles.barLabel}>Budget {forecast.budget}</Text>
      </View>

      <View style={styles.miniGrid}>
        <View style={[styles.miniCell, { width: miniWidth }]}>
          <View style={styles.miniTile}>
            <Text style={styles.miniLabel}>Safe daily limit</Text>
            <Text style={[styles.miniValue, moneyTextStyle]}>{forecast.safeDaily}</Text>
          </View>
        </View>
        <View style={[styles.miniCell, { width: miniWidth }]}>
          <View style={styles.miniTile}>
            <Text style={styles.miniLabel}>Expected savings</Text>
            <Text style={[styles.miniValue, moneyTextStyle]}>{forecast.expectedSavings}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.note, forecast.overBudget ? styles.noteDanger : styles.noteInfo]}>
        <Text
          style={[
            styles.noteText,
            { color: forecast.overBudget ? colors.dangerValue : colors.accent },
          ]}
        >
          {forecast.note}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 22,
    paddingHorizontal: 24,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  month: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textCaption,
  },
  predictRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  predicted: {
    fontFamily: fontFamily.extrabold,
    fontSize: 30,
    color: colors.textPrimary,
    letterSpacing: -1.35,
  },
  predictNote: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  barTrack: {
    position: 'relative',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  barPredicted: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: radius.pill,
  },
  barSpent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    marginHorizontal: -5,
  },
  miniCell: {
    paddingHorizontal: 5,
    minWidth: 0,
  },
  miniTile: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.tileSmall,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minWidth: 0,
  },
  miniLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textCaption,
  },
  miniValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 17,
    color: colors.textPrimary,
    marginTop: 3,
    letterSpacing: -0.6,
  },
  note: {
    marginTop: 'auto',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
  },
  noteDanger: {
    backgroundColor: colors.dangerTint,
  },
  noteInfo: {
    backgroundColor: colors.accentTint,
  },
  noteText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
  },
});

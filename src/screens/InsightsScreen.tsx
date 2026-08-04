import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { useTrends } from '@/features/insights/hooks';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';
import { formatINR } from '@/utils/currency';

/** Design HTML `isInsights` — spending patterns and trends. */
export default function InsightsScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data: trends } = useTrends(6);

  const chartMonths = useMemo(() => {
    const months = trends?.months ?? [];
    const maxVal = Math.max(1, ...months.flatMap((m) => [Number(m.income), Number(m.expense)]));
    return months.map((m) => ({
      label: m.label,
      incomeH: Math.round((Number(m.income) / maxVal) * 130),
      expenseH: Math.round((Number(m.expense) / maxVal) * 130),
    }));
  }, [trends?.months]);

  const latestMonth = trends?.months?.[trends.months.length - 1];
  const avgDailySpend = latestMonth ? formatINR(Number(latestMonth.expense) / 30) : '—';
  const savingsInsight = trends?.insights.find((i) => i.label === 'Savings trend');
  const momInsight = trends?.insights.find((i) => i.label === 'Month over month');

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <Card size="large" style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <DesignSectionHeader title="Last 6 months" />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6C63FF' }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E7A08C' }]} />
              <Text style={styles.legendText}>Spent</Text>
            </View>
          </View>
        </View>
        {chartMonths.length === 0 ? (
          <Text style={styles.emptyHint}>No trend data yet.</Text>
        ) : (
          <View style={styles.barChart}>
            {chartMonths.map((m) => (
              <View key={m.label} style={styles.barGroup}>
                <View style={styles.barPair}>
                  <View style={[styles.bar, styles.barIncome, { height: m.incomeH }]} />
                  <View style={[styles.bar, styles.barExpense, { height: m.expenseH }]} />
                </View>
                <Text style={styles.barLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignKpiCard
          label="Average daily spend"
          value={avgDailySpend}
          sub={formatYearMonthLabel(month)}
        />
        <DesignKpiCard
          label="Latest month expense"
          value={latestMonth ? formatINR(Number(latestMonth.expense)) : '—'}
          sub={latestMonth?.label ?? 'No data'}
          valueColor={colors.dangerValue}
        />
        <DesignKpiCard
          label="Savings rate"
          value={savingsInsight?.value ?? '—'}
          sub={savingsInsight?.sub ?? 'This month'}
          valueColor={colors.successValue}
        />
      </DesignGrid>

      {(trends?.insights.length ?? 0) > 0 ? (
        <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
          {trends!.insights.map((i) => (
            <DesignKpiCard
              key={i.label}
              label={i.label}
              value={i.value}
              sub={i.sub}
              valueColor={
                i.label === 'Month over month' && i.value.startsWith('+')
                  ? colors.dangerValue
                  : colors.textPrimary
              }
            />
          ))}
        </DesignGrid>
      ) : null}

      {momInsight ? (
        <Card size="large" style={styles.trendCard}>
          <DesignSectionHeader title="Spending trend" />
          <View style={styles.trendRow}>
            <View style={[styles.catDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.trendName}>Month over month</Text>
            <Text style={styles.trendPrev}>{momInsight.sub}</Text>
            <Feather name="arrow-right" size={14} color="#CFC8BE" />
            <Text style={[styles.trendNow, moneyTextStyle]}>{momInsight.value}</Text>
          </View>
        </Card>
      ) : null}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  chartCard: { padding: 24, gap: 22 },
  chartHeader: { gap: 16 },
  legendRow: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 3 },
  legendText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textLabel },
  emptyHint: {
    paddingVertical: 40,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
    height: 200,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  barGroup: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '32%',
    maxWidth: 30,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  barIncome: { backgroundColor: '#5B54D6' },
  barExpense: { backgroundColor: '#E08A70' },
  barLabel: {
    position: 'absolute',
    bottom: -25,
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: '#948E85',
  },
  trendCard: { padding: 22, gap: 12 },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EC',
    flexWrap: 'wrap',
  },
  catDot: { width: 9, height: 9, borderRadius: 3 },
  trendName: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  trendPrev: { fontFamily: fontFamily.medium, fontSize: 12.5, color: colors.textCaption },
  trendNow: { fontFamily: fontFamily.extrabold, fontSize: 13.5, color: colors.textPrimary },
});

import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

const MONTHS6 = [
  { label: 'Mar', incomeH: 110, expenseH: 96 },
  { label: 'Apr', incomeH: 116, expenseH: 104 },
  { label: 'May', incomeH: 120, expenseH: 100 },
  { label: 'Jun', incomeH: 114, expenseH: 108 },
  { label: 'Jul', incomeH: 124, expenseH: 112 },
  { label: 'Aug', incomeH: 130, expenseH: 126 },
];

const INSIGHT_CARDS = [
  {
    label: 'Highest spending week',
    value: '₹28,400',
    sub: 'Week 3 of Aug',
    color: colors.danger,
  },
  {
    label: 'Highest spending day',
    value: '₹18,650',
    sub: 'Fridays, added up',
    color: '#96702C',
  },
  {
    label: 'Largest transaction',
    value: '₹36,000',
    sub: 'Rent · 1 Aug 2026',
    color: colors.accent,
  },
  {
    label: 'Month over month',
    value: '+12%',
    sub: 'Spending vs July',
    color: colors.dangerValue,
  },
  {
    label: 'Savings trend',
    value: '3%',
    sub: '6-month average 8%',
    color: colors.success,
  },
  {
    label: 'Investment growth',
    value: '+₹1.2 L',
    sub: 'On ₹10.6 L invested',
    color: '#2F7D6E',
  },
];

const TRENDS = [
  {
    name: 'Rent',
    prev: '₹36,000',
    now: '₹36,000',
    delta: '0%',
    color: '#A2701F',
    deltaColor: colors.textCaption,
  },
  {
    name: 'Groceries',
    prev: '₹4,200',
    now: '₹6,850',
    delta: '+63%',
    color: '#2F7D6E',
    deltaColor: colors.dangerValue,
  },
  {
    name: 'Food & Dining',
    prev: '₹3,100',
    now: '₹5,420',
    delta: '+75%',
    color: colors.danger,
    deltaColor: colors.dangerValue,
  },
  {
    name: 'Transport',
    prev: '₹2,800',
    now: '₹3,650',
    delta: '+30%',
    color: colors.accent,
    deltaColor: colors.dangerValue,
  },
  {
    name: 'Shopping',
    prev: '₹6,200',
    now: '₹4,100',
    delta: '−34%',
    color: '#A84A7C',
    deltaColor: colors.successValue,
  },
];

/** Design HTML `isInsights` — spending patterns and trends. */
export default function InsightsScreen() {
  const [month, setMonth] = useState(currentYearMonth());

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
        <View style={styles.barChart}>
          {MONTHS6.map((m) => (
            <View key={m.label} style={styles.barGroup}>
              <View style={styles.barPair}>
                <View style={[styles.bar, styles.barIncome, { height: m.incomeH }]} />
                <View style={[styles.bar, styles.barExpense, { height: m.expenseH }]} />
              </View>
              <Text style={styles.barLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignKpiCard
          label="Average daily spend"
          value="₹2,766"
          sub={formatYearMonthLabel(month)}
        />
        <DesignKpiCard
          label="Biggest expense"
          value="₹36,000"
          sub="Rent · monthly"
          valueColor={colors.dangerValue}
        />
        <DesignKpiCard
          label="Savings rate"
          value="3%"
          sub="₹2,601 saved this month"
          valueColor={colors.successValue}
        />
      </DesignGrid>

      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        {INSIGHT_CARDS.map((i) => (
          <DesignKpiCard
            key={i.label}
            label={i.label}
            value={i.value}
            sub={i.sub}
            valueColor={i.color}
          />
        ))}
      </DesignGrid>

      <Card size="large" style={styles.trendCard}>
        <DesignSectionHeader title="Category trend vs last month" />
        {TRENDS.map((t) => (
          <View key={t.name} style={styles.trendRow}>
            <View style={[styles.catDot, { backgroundColor: t.color }]} />
            <Text style={styles.trendName}>{t.name}</Text>
            <Text style={styles.trendPrev}>{t.prev}</Text>
            <Feather name="arrow-right" size={14} color="#CFC8BE" />
            <Text style={[styles.trendNow, moneyTextStyle]}>{t.now}</Text>
            <Text style={[styles.trendDelta, { color: t.deltaColor }]}>{t.delta}</Text>
          </View>
        ))}
      </Card>
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
  trendDelta: { fontFamily: fontFamily.extrabold, fontSize: 12, width: 60, textAlign: 'right' },
});

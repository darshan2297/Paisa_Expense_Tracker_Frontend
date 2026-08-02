import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { MOCK_PROFILE } from '@/mock/seed/profile';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

const REVIEW_ROWS = [
  {
    label: 'Income',
    value: '₹88,350',
    delta: '+3% vs last month',
    deltaColor: colors.successValue,
  },
  {
    label: 'Expenses',
    value: '₹85,749',
    delta: '+12% vs last month',
    deltaColor: colors.dangerValue,
  },
  { label: 'Saved', value: '+₹2,601', delta: '', deltaColor: colors.textCaption },
  { label: 'Net worth change', value: '+₹45,489', delta: '', deltaColor: colors.textCaption },
  { label: 'Loan & EMI payments', value: '₹34,450', delta: '', deltaColor: colors.textCaption },
  { label: 'Fixed commitments', value: '₹18,400', delta: '', deltaColor: colors.textCaption },
  { label: 'Investment growth', value: '+₹1.2 L', delta: '', deltaColor: colors.textCaption },
  { label: 'Goal contributions', value: '₹47,000', delta: '', deltaColor: colors.textCaption },
];

const HIGHLIGHTS = [
  { label: 'Biggest expense', value: '₹36,000', sub: 'Rent · monthly' },
  { label: 'Highest category', value: '₹36,000', sub: 'Rent' },
  { label: 'Lowest category', value: '₹649', sub: 'Entertainment' },
  { label: 'Budget performance', value: '156% used', sub: '₹30,749 over budget' },
];

const CAT_BARS = [
  { name: 'Rent', amount: '₹36,000', pct: '42%', width: '42%', color: '#A2701F' },
  { name: 'Groceries', amount: '₹6,850', pct: '8%', width: '8%', color: '#2F7D6E' },
  { name: 'Food & Dining', amount: '₹5,420', pct: '6%', width: '6%', color: colors.danger },
  { name: 'Transport', amount: '₹3,650', pct: '4%', width: '4%', color: colors.accent },
  { name: 'Shopping', amount: '₹4,100', pct: '5%', width: '5%', color: '#A84A7C' },
  { name: 'Health', amount: '₹2,800', pct: '3%', width: '3%', color: colors.success },
];

/** Design HTML `isReview` — monthly financial review letter. */
export default function ReviewScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const title = `${formatYearMonthLabel(month)} review`;
  const verdict = 'A tight month. Most of the income went back out — worth trimming one category.';

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <Card size="large" style={styles.mainCard}>
        <View style={styles.titleRow}>
          <Text style={styles.reviewTitle}>{title}</Text>
          <Text style={styles.reviewMeta}>Paisa · {MOCK_PROFILE.name}</Text>
        </View>
        <Text style={styles.verdict}>{verdict}</Text>

        {REVIEW_ROWS.map((r) => (
          <View key={r.label} style={styles.reviewRow}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            {r.delta ? (
              <Text style={[styles.rowDelta, { color: r.deltaColor }]}>{r.delta}</Text>
            ) : null}
            <Text style={[styles.rowValue, moneyTextStyle]}>{r.value}</Text>
          </View>
        ))}
      </Card>

      <DesignGrid cols={4} tabletCols={2} narrowCols={1}>
        {HIGHLIGHTS.map((h) => (
          <DesignKpiCard key={h.label} label={h.label} value={h.value} sub={h.sub} />
        ))}
      </DesignGrid>

      <Card size="large" style={styles.catCard}>
        <DesignSectionHeader title="Where the money went" />
        {CAT_BARS.map((c) => (
          <View key={c.name} style={styles.catRow}>
            <View style={styles.catHeader}>
              <View style={[styles.catDot, { backgroundColor: c.color }]} />
              <Text style={styles.catName}>{c.name}</Text>
              <Text style={[styles.catAmount, moneyTextStyle]}>{c.amount}</Text>
              <Text style={styles.catPct}>{c.pct}</Text>
            </View>
            <View style={styles.catTrack}>
              <View
                style={[
                  styles.catFill,
                  { width: c.width as `${number}%`, backgroundColor: c.color },
                ]}
              />
            </View>
          </View>
        ))}
      </Card>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  mainCard: { paddingVertical: 30, paddingHorizontal: 32, gap: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.textPrimary,
  },
  reviewTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    letterSpacing: -0.96,
    color: colors.textPrimary,
  },
  reviewMeta: {
    marginLeft: 'auto',
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textCaption,
  },
  verdict: {
    marginTop: 20,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 24,
    color: '#4A443C',
    maxWidth: 720,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    flexWrap: 'wrap',
  },
  rowLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    minWidth: 170,
    color: colors.textPrimary,
  },
  rowDelta: { fontFamily: fontFamily.semibold, fontSize: 12.5 },
  rowValue: {
    marginLeft: 'auto',
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.63,
    color: colors.textPrimary,
  },
  catCard: { padding: 22, gap: 14 },
  catRow: { gap: 7 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 9, height: 9, borderRadius: 3 },
  catName: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  catAmount: { fontSize: 13, color: colors.textPrimary },
  catPct: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textCaption,
    width: 38,
    textAlign: 'right',
  },
  catTrack: { height: 8, borderRadius: 99, backgroundColor: colors.divider, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 99 },
});

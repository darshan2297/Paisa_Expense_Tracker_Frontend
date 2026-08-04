import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { useReview } from '@/features/insights/hooks';
import { useProfile } from '@/features/profile/hooks';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';
import { formatINR } from '@/utils/currency';

const CAT_COLORS = [
  '#A2701F',
  '#2F7D6E',
  colors.danger,
  colors.accent,
  '#A84A7C',
  colors.success,
  '#96702C',
  '#3E6E9E',
];

function deltaColor(delta: string): string {
  if (!delta) return colors.textCaption;
  if (delta.startsWith('+')) return colors.dangerValue;
  if (delta.startsWith('−') || delta.startsWith('-')) return colors.successValue;
  return colors.textCaption;
}

/** Design HTML `isReview` — monthly financial review letter. */
export default function ReviewScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data: review } = useReview(month);
  const { data: profile } = useProfile();

  const title = `${formatYearMonthLabel(month)} review`;
  const verdict = review?.narrative ?? 'Loading your monthly review…';
  const userName = profile?.name ?? 'You';

  const catBars = useMemo(
    () =>
      (review?.category_bars ?? []).map((c, i) => ({
        name: c.name,
        amount: formatINR(Number(c.amount)),
        pct: `${c.pct}%`,
        width: `${Math.max(3, c.pct)}%` as `${number}%`,
        color: CAT_COLORS[i % CAT_COLORS.length],
      })),
    [review?.category_bars],
  );

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <Card size="large" style={styles.mainCard}>
        <View style={styles.titleRow}>
          <Text style={styles.reviewTitle}>{title}</Text>
          <Text style={styles.reviewMeta}>Paisa · {userName}</Text>
        </View>
        <Text style={styles.verdict}>{verdict}</Text>

        {(review?.rows ?? []).length === 0 ? (
          <Text style={styles.emptyHint}>No review data for this month yet.</Text>
        ) : (
          review!.rows.map((r) => (
            <View key={r.label} style={styles.reviewRow}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              {r.delta ? (
                <Text style={[styles.rowDelta, { color: deltaColor(r.delta) }]}>{r.delta}</Text>
              ) : null}
              <Text style={[styles.rowValue, moneyTextStyle]}>{r.value}</Text>
            </View>
          ))
        )}
      </Card>

      {(review?.highlights ?? []).length > 0 ? (
        <DesignGrid cols={4} tabletCols={2} narrowCols={1}>
          {review!.highlights.map((h) => (
            <DesignKpiCard key={h.label} label={h.label} value={h.value} sub={h.sub} />
          ))}
        </DesignGrid>
      ) : null}

      <Card size="large" style={styles.catCard}>
        <DesignSectionHeader title="Where the money went" />
        {catBars.length === 0 ? (
          <Text style={styles.emptyHint}>No category breakdown for this month.</Text>
        ) : (
          catBars.map((c) => (
            <View key={c.name} style={styles.catRow}>
              <View style={styles.catHeader}>
                <View style={[styles.catDot, { backgroundColor: c.color }]} />
                <Text style={styles.catName}>{c.name}</Text>
                <Text style={[styles.catAmount, moneyTextStyle]}>{c.amount}</Text>
                <Text style={styles.catPct}>{c.pct}</Text>
              </View>
              <View style={styles.catTrack}>
                <View style={[styles.catFill, { width: c.width, backgroundColor: c.color }]} />
              </View>
            </View>
          ))
        )}
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
  emptyHint: {
    paddingVertical: 26,
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    textAlign: 'center',
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

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatShortDate } from '@/utils/date';

const HM_LEGEND = [{ bg: '#CFE6D5' }, { bg: '#F3DFAC' }, { bg: '#EFB3A0' }];

const DAY_DETAIL = [
  {
    initial: 'G',
    title: 'Groceries',
    sub: 'BigBasket order',
    amount: '−₹1,450',
    amountColor: colors.textPrimary,
    bg: '#E5EEF8',
    fg: '#3E6E9E',
  },
  {
    initial: 'E',
    title: 'Entertainment',
    sub: 'Netflix subscription',
    amount: '−₹649',
    amountColor: colors.textPrimary,
    bg: '#FAEED8',
    fg: '#96702C',
  },
];

/** Generate 26 weeks × 7 days heatmap cells (mock spend intensity). */
function buildHeatmapWeeks() {
  const levels = ['#F1EDE7', '#CFE6D5', '#F3DFAC', '#EFB3A0'];
  const weeks = [];
  for (let w = 0; w < 26; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const seed = (w * 7 + d) % 11;
      const lvl = seed === 0 ? 0 : seed < 4 ? 1 : seed < 8 ? 2 : 3;
      const key = `2026-w${w}-d${d}`;
      days.push({ key, bg: levels[lvl], title: key });
    }
    weeks.push({ days });
  }
  return weeks;
}

/** Design HTML `isHeatmap` — spending intensity over 26 weeks. */
export default function HeatmapScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const weeks = useMemo(() => buildHeatmapWeeks(), []);

  const selLabel = selectedKey ? formatShortDate('2026-08-05') : 'Pick a day';
  const noSpend = selectedKey === 'no-spend';

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={4} tabletCols={2} narrowCols={1}>
        <DesignKpiCard label="Spent this month" value="₹85,749" valueColor={colors.dangerValue} />
        <DesignKpiCard label="Average day" value="₹2,766" />
        <DesignKpiCard label="Biggest day" value="₹36,486" sub="1 Aug 2026" />
        <DesignKpiCard
          label="No-spend days"
          value="14 no-spend days"
          valueColor={colors.successValue}
          backgroundColor="#E7F1EC"
          borderColor="#D8E8E0"
          labelColor="#4C7F68"
        />
      </DesignGrid>

      <Card size="large" style={styles.heatCard}>
        <View style={styles.heatHeader}>
          <DesignSectionHeader title="Last 26 weeks" />
          <View style={styles.legend}>
            <Text style={styles.legendText}>Less</Text>
            <View style={[styles.legendSwatch, { backgroundColor: '#F1EDE7' }]} />
            {HM_LEGEND.map((l, i) => (
              <View key={i} style={[styles.legendSwatch, { backgroundColor: l.bg }]} />
            ))}
            <Text style={styles.legendText}>More</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.heatGrid}>
            {weeks.map((w, wi) => (
              <View key={wi} style={styles.heatCol}>
                {w.days.map((d) => (
                  <Pressable
                    key={d.key}
                    onPress={() =>
                      setSelectedKey(
                        selectedKey === d.key ? null : d.key.endsWith('d2') ? 'no-spend' : d.key,
                      )
                    }
                    style={[
                      styles.heatCell,
                      { backgroundColor: d.bg },
                      selectedKey === d.key && styles.heatCellSelected,
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>

      <Card size="large" style={styles.detailCard}>
        <Text style={styles.detailTitle}>{selLabel}</Text>
        {!selectedKey ? (
          <Text style={styles.emptyHint}>Click a square to see that day&apos;s transactions.</Text>
        ) : noSpend ? (
          <Text style={styles.emptyHint}>A no-spend day. Nice.</Text>
        ) : (
          DAY_DETAIL.map((t) => (
            <View key={t.title} style={styles.listRow}>
              <View style={[styles.avatar, { backgroundColor: t.bg }]}>
                <Text style={[styles.avatarText, { color: t.fg }]}>{t.initial}</Text>
              </View>
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{t.title}</Text>
                <Text style={styles.listSub}>{t.sub}</Text>
              </View>
              <Text style={[styles.listAmount, moneyTextStyle, { color: t.amountColor }]}>
                {t.amount}
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  heatCard: { padding: 24, gap: 18, overflow: 'hidden' },
  heatHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14 },
  legend: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 9 },
  legendText: { fontFamily: fontFamily.semibold, fontSize: 11.5, color: colors.textCaption },
  legendSwatch: { width: 13, height: 13, borderRadius: 4 },
  heatGrid: { flexDirection: 'row', gap: 5, minWidth: 620 },
  heatCol: { flex: 1, gap: 5 },
  heatCell: { aspectRatio: 1, borderRadius: 4, minWidth: 14, minHeight: 14 },
  heatCellSelected: { borderWidth: 2, borderColor: colors.textPrimary },
  detailCard: { padding: 20, gap: 4 },
  detailTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyHint: {
    paddingVertical: 22,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  listCopy: { flex: 1, gap: 2 },
  listTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  listSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  listAmount: { fontSize: 13.5, letterSpacing: -0.34 },
});

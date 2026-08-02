import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

type HealthCard = {
  label: string;
  value: string;
  trend: string;
  status: string;
  statusBg: string;
  statusFg: string;
  color: string;
  spark: number[];
};

const HEALTH_CARDS: HealthCard[] = [
  {
    label: 'Savings rate',
    value: '3%',
    trend: 'Below the 20% mark',
    status: 'Needs work',
    statusBg: '#F9E7E1',
    statusFg: '#B04A34',
    color: '#5B54D6',
    spark: [8, 12, 10, 6, 4, 3],
  },
  {
    label: 'Investment rate',
    value: '25.5%',
    trend: '₹22,500 invested monthly',
    status: 'Healthy',
    statusBg: '#E2F0E9',
    statusFg: '#2F7D5D',
    color: '#2F7D6E',
    spark: [22, 23, 24, 25, 25, 26],
  },
  {
    label: 'Budget utilisation',
    value: '156%',
    trend: '₹85,749 of ₹55,000',
    status: 'Needs work',
    statusBg: '#F9E7E1',
    statusFg: '#B04A34',
    color: '#D8A441',
    spark: [90, 110, 130, 145, 150, 156],
  },
  {
    label: 'Emergency fund',
    value: '2.2 mo',
    trend: 'Target 6 months of expenses',
    status: 'Needs work',
    statusBg: '#F9E7E1',
    statusFg: '#B04A34',
    color: '#3E6E9E',
    spark: [1.2, 1.5, 1.7, 1.9, 2.0, 2.2],
  },
  {
    label: 'Debt ratio',
    value: '39%',
    trend: 'EMIs against monthly income',
    status: 'Watch',
    statusBg: '#FAEED8',
    statusFg: '#96702C',
    color: '#C2543D',
    spark: [38, 38, 39, 39, 39, 39],
  },
  {
    label: 'Monthly cash flow',
    value: '+₹2,601',
    trend: 'Income minus everything spent',
    status: 'Healthy',
    statusBg: '#E2F0E9',
    statusFg: '#2F7D5D',
    color: '#2F7D5D',
    spark: [12000, 8000, 5000, 4000, 3500, 2601],
  },
  {
    label: 'Goal progress',
    value: '49%',
    trend: '4 goals being funded',
    status: 'Watch',
    statusBg: '#FAEED8',
    statusFg: '#96702C',
    color: '#A84A7C',
    spark: [35, 38, 42, 45, 47, 49],
  },
  {
    label: 'Net worth growth',
    value: '+0.6%',
    trend: 'Compared with last month',
    status: 'Watch',
    statusBg: '#FAEED8',
    statusFg: '#96702C',
    color: '#5B54D6',
    spark: [0.2, 0.3, 0.4, 0.5, 0.55, 0.6],
  },
];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  return (
    <View style={sparkStyles.row}>
      {values.map((v, i) => (
        <View
          key={i}
          style={[
            sparkStyles.bar,
            {
              height: 6 + ((v - min) / span) * 22,
              backgroundColor: color,
              opacity: i === values.length - 1 ? 1 : 0.45,
            },
          ]}
        />
      ))}
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 34 },
  bar: { flex: 1, borderRadius: 2, minHeight: 4 },
});

/** Design HTML `isHealth` — composite financial health score. */
export default function HealthScreen() {
  const [month, setMonth] = useState(currentYearMonth());

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <HeroCard style={styles.hero}>
        <View style={styles.heroMain}>
          <Text style={styles.heroEyebrow}>Overall health score</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, moneyTextStyle]}>58</Text>
            <Text style={styles.scoreOf}>/ 100</Text>
          </View>
          <Text style={styles.heroNote}>
            Composite of savings, investing, budget discipline, emergency cover, debt load and
            goals.
          </Text>
        </View>
        <View style={styles.heroStats}>
          <View>
            <Text style={styles.statLabel}>Net worth</Text>
            <Text style={[styles.statValue, moneyTextStyle]}>₹72.9 L</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Monthly saved</Text>
            <Text style={[styles.statValue, moneyTextStyle]}>+₹2,601</Text>
          </View>
        </View>
      </HeroCard>

      <DesignGrid cols={4} tabletCols={2} narrowCols={1}>
        {HEALTH_CARDS.map((h) => (
          <Card key={h.label} style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Text style={styles.healthLabel}>{h.label}</Text>
              <Text style={[styles.statusChip, { backgroundColor: h.statusBg, color: h.statusFg }]}>
                {h.status}
              </Text>
            </View>
            <Text style={[styles.healthValue, moneyTextStyle]}>{h.value}</Text>
            <Sparkline values={h.spark} color={h.color} />
            <Text style={styles.healthTrend}>{h.trend}</Text>
          </Card>
        ))}
      </DesignGrid>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 22,
    paddingVertical: 26,
    paddingHorizontal: 28,
  },
  heroMain: { flex: 1, minWidth: 200 },
  heroEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: colors.heroTextEyebrow,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  scoreValue: { fontSize: 46, color: colors.heroText, letterSpacing: -2.3 },
  scoreOf: { fontFamily: fontFamily.bold, fontSize: 17, color: 'rgba(252,250,247,.45)' },
  heroNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.heroTextMuted,
    marginTop: 6,
    maxWidth: 460,
  },
  heroStats: { flexDirection: 'row', gap: 22, flexWrap: 'wrap', marginLeft: 'auto' },
  statLabel: { fontFamily: fontFamily.semibold, fontSize: 11.5, color: 'rgba(252,250,247,.5)' },
  statValue: { fontSize: 22, color: colors.heroText, marginTop: 3, letterSpacing: -0.88 },
  healthCard: { paddingVertical: 20, paddingHorizontal: 22, gap: 10 },
  healthHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthLabel: { flex: 1, fontFamily: fontFamily.bold, fontSize: 12, color: colors.textLabel },
  statusChip: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  healthValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 25,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  healthTrend: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
});

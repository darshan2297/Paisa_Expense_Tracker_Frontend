import { createElement, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { useLifeDashboard } from '@/features/dashboard/hooks';
import { emptyLifeDashboard } from '@/features/dashboard/mapLifeDashboard';
import { useHealthScore } from '@/features/insights/hooks';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { formatINR } from '@/utils/currency';
import { currentYearMonth } from '@/utils/date';

const METRIC_COLORS = [
  '#5B54D6',
  '#2F7D6E',
  '#D8A441',
  '#3E6E9E',
  '#C2543D',
  '#2F7D5D',
  '#A84A7C',
  '#5B54D6',
];

function statusStyle(status: string): { statusBg: string; statusFg: string } {
  if (status === 'Healthy') return { statusBg: '#E2F0E9', statusFg: '#2F7D5D' };
  if (status === 'Watch') return { statusBg: '#FAEED8', statusFg: '#96702C' };
  return { statusBg: '#F9E7E1', statusFg: '#B04A34' };
}

/** True for 0%, ₹0, Flat, +0.0%, etc. — spark must stay a flat line. */
function isZeroMetricValue(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v || v === 'flat' || v === '—' || v === '-') return true;
  const numeric = Number(v.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) && numeric === 0;
}

function sparkSeries(value: string, score: number): number[] {
  if (isZeroMetricValue(value)) {
    return [0, 0, 0, 0, 0, 0];
  }
  return [
    Math.round(score * 0.75),
    Math.round(score * 0.82),
    Math.round(score * 0.88),
    Math.round(score * 0.93),
    Math.round(score * 0.97),
    score,
  ];
}

/** Mockup SVG polyline spark — `spark(points)` over viewBox 0 0 100 30. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max === min;
  const span = Math.max(1, max - min);
  // Flat / zero series → horizontal line through the middle of the chart.
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 100;
      const y = flat ? 15 : 28 - ((v - min) / span) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  if (Platform.OS === 'web') {
    return createElement(
      'svg',
      {
        viewBox: '0 0 100 30',
        preserveAspectRatio: 'none',
        style: { width: '100%', height: 34, display: 'block' },
      },
      createElement('polyline', {
        points,
        fill: 'none',
        stroke: color,
        strokeWidth: 2.4,
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
        vectorEffect: 'non-scaling-stroke',
      }),
    );
  }

  return (
    <View style={sparkStyles.row}>
      {values.map((_, i) => (
        <View
          key={i}
          style={[
            sparkStyles.bar,
            {
              height: flat ? 3 : 6 + ((values[i] - min) / span) * 22,
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
  const { data: health } = useHealthScore(month);

  const cards = useMemo(() => {
    return (health?.metrics ?? []).map((m, i) => {
      const { statusBg, statusFg } = statusStyle(m.status);
      return {
        label: m.label,
        value: m.value,
        trend: m.trend,
        status: m.status,
        statusBg,
        statusFg,
        color: METRIC_COLORS[i % METRIC_COLORS.length],
        spark: sparkSeries(m.value, m.score),
      };
    });
  }, [health?.metrics]);

  const compositeScore = health?.composite_score ?? 0;
  const { data: dashboardData } = useLifeDashboard(month);
  const life = dashboardData ?? emptyLifeDashboard(month);
  const savedTile = life.lifeTiles.find((t) => t.label === 'Saved this month');
  const monthlySaved = savedTile?.value ?? formatINR(0);

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <HeroCard style={styles.hero}>
        <View style={styles.heroMain}>
          <Text style={styles.heroEyebrow}>Overall health score</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, moneyTextStyle]}>{compositeScore}</Text>
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
            <Text style={[styles.statValue, moneyTextStyle]}>{life.netWorth}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Monthly saved</Text>
            <Text style={[styles.statValue, moneyTextStyle]}>{monthlySaved}</Text>
          </View>
        </View>
      </HeroCard>

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No health metrics yet</Text>
          <Text style={styles.emptySub}>
            Add transactions and goals to build your health score.
          </Text>
        </View>
      ) : (
        <DesignGrid cols={4} tabletCols={2} narrowCols={1}>
          {cards.map((h) => (
            <Card key={h.label} style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <Text style={styles.healthLabel}>{h.label}</Text>
                <Text
                  style={[styles.statusChip, { backgroundColor: h.statusBg, color: h.statusFg }]}
                >
                  {h.status}
                </Text>
              </View>
              <Text style={[styles.healthValue, moneyTextStyle]}>{h.value}</Text>
              <Sparkline values={h.spark} color={h.color} />
              <Text style={styles.healthTrend}>{h.trend}</Text>
            </Card>
          ))}
        </DesignGrid>
      )}
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
  healthCard: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 22,
    gap: 10,
    borderRadius: 22,
  },
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
  healthTrend: { fontFamily: fontFamily.medium, fontSize: 11.5, color: '#A39C92' },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DFD9D0',
  },
  emptyTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: '#5C564D' },
  emptySub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
    textAlign: 'center',
  },
});

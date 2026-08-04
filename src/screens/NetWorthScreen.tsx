import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { useNetWorthCurrent, useNetWorthHistory } from '@/features/netWorth/hooks';
import { compact, pctWidth } from '@/mock/format';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatMonthYear } from '@/utils/date';

const RANGES = [
  { months: 3, label: '3M' },
  { months: 6, label: '6M' },
  { months: 12, label: '1Y' },
  { months: 60, label: '5Y' },
  { months: 61, label: 'All' },
] as const;

const PART_COLORS: Record<string, string> = {
  Portfolio: '#5B54D6',
  Assets: '#3E6E9E',
  'Cash & goals': '#2F7D5D',
  Receivables: '#96702C',
  Liabilities: '#C2543D',
};

/** Design HTML `isNet` — net worth hero with chart bars, KPIs, breakdown. */
export default function NetWorthScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [range, setRange] = useState<number>(12);
  const historyMonths = range === 61 ? 120 : range;
  const { data: current } = useNetWorthCurrent();
  const { data: history } = useNetWorthHistory(historyMonths);

  const data = useMemo(() => {
    const nwNow = Number(current?.net_worth ?? 0);
    const liabilities = Number(current?.total_liabilities ?? 0);
    const monthChange = Number(current?.delta_month ?? 0);

    const points = history?.points ?? [];
    const series =
      points.length > 0
        ? points.map((p) => ({ key: p.date.slice(0, 7), net: Number(p.net_worth) }))
        : [{ key: month, net: nwNow }];

    const view = series.slice(Math.max(0, series.length - (range === 61 ? series.length : range)));
    const vals = view.map((p) => p.net);
    const lo = Math.min(...vals, nwNow);
    const hi = Math.max(...vals, nwNow);
    const span = Math.max(1, hi - lo);

    const nwPrev = vals[vals.length - 2] ?? nwNow;
    const yearAgo = series[Math.max(0, series.length - 13)]?.net ?? vals[0] ?? nwNow;
    const peak = Math.max(nwNow, ...series.map((s) => s.net));
    const yearChange = nwNow - yearAgo;

    const bars = view.map((p, i) => ({
      key: p.key,
      height: `${Math.max(8, ((p.net - lo) / span) * 100)}%`,
      label:
        i % Math.max(1, Math.ceil(view.length / 6)) === 0 || i === view.length - 1
          ? formatMonthYear(`${p.key}-01`)
          : '',
    }));

    const parts = current?.parts ?? [];
    const netWorth = nwNow + liabilities;
    const nwParts = parts.map((p) => {
      const value = Number(p.value);
      const negative = p.label === 'Liabilities';
      return {
        label: p.label,
        value,
        color: PART_COLORS[p.label] ?? '#5B54D6',
        negative,
        display: negative ? `−${compact(value)}` : compact(value),
        width: pctWidth(value, netWorth),
      };
    });

    return {
      nwNow,
      monthChange: current?.delta_month != null ? monthChange : nwNow - nwPrev,
      yearChange,
      yearPct: yearAgo ? ((yearChange / Math.abs(yearAgo)) * 100).toFixed(1) : '0',
      peak,
      liabilities,
      bars,
      nwParts,
    };
  }, [current, history, month, range]);

  const changePositive = data.monthChange >= 0;
  const yearPositive = data.yearChange >= 0;

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <HeroCard style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Net worth today</Text>
            <Text style={[styles.heroValue, moneyTextStyle]}>{compact(data.nwNow)}</Text>
          </View>
          <View style={styles.chipRow}>
            {RANGES.map((r) => {
              const on = range === r.months;
              return (
                <Pressable
                  key={r.label}
                  onPress={() => setRange(r.months)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: on ? colors.textPrimary : '#FBF9F6',
                      borderColor: on ? colors.textPrimary : '#FBF9F6',
                    },
                  ]}
                >
                  <Text style={[styles.chipLabel, { color: on ? colors.heroText : '#6B6459' }]}>
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.chartArea}>
          <View style={styles.barsRow}>
            {data.bars.map((b) => (
              <View key={b.key} style={styles.barCol}>
                <View style={[styles.bar, { height: b.height as `${number}%` }]} />
                {b.label ? <Text style={styles.barAxis}>{b.label}</Text> : null}
              </View>
            ))}
          </View>
        </View>
      </HeroCard>

      <DesignGrid cols={4} tabletCols={2} narrowCols={1}>
        <DesignKpiCard
          label="This month"
          value={`${changePositive ? '+' : '−'}${compact(Math.abs(data.monthChange))}`}
          valueColor={changePositive ? colors.successValue : colors.dangerValue}
        />
        <DesignKpiCard
          label="Annual growth"
          value={`${yearPositive ? '+' : '−'}${compact(Math.abs(data.yearChange))}`}
          sub={`${data.yearPct}% in 12 months`}
          valueColor={colors.successValue}
        />
        <DesignKpiCard label="Highest ever" value={compact(data.peak)} />
        <DesignKpiCard
          label="Liabilities"
          value={compact(data.liabilities)}
          valueColor={colors.dangerValue}
          backgroundColor="#F1EFFE"
          borderColor="#E4E1F6"
          labelColor="#7A73B8"
        />
      </DesignGrid>

      <Card size="large" style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>What makes it up</Text>
        {data.nwParts.map((p) => (
          <View key={p.label} style={styles.partRow}>
            <View style={styles.partHeader}>
              <View style={[styles.partDot, { backgroundColor: p.color }]} />
              <Text style={styles.partLabel}>{p.label}</Text>
              <Text style={[styles.partValue, moneyTextStyle]}>{p.display}</Text>
            </View>
            <View style={styles.partTrack}>
              <View
                style={[
                  styles.partFill,
                  { width: p.width as `${number}%`, backgroundColor: p.color },
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
  hero: { paddingVertical: 24, paddingHorizontal: 26, paddingBottom: 20 },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
  },
  heroCopy: { flex: 1, minWidth: 0 },
  heroEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: colors.heroTextEyebrow,
  },
  heroValue: {
    fontSize: 42,
    color: colors.heroText,
    marginTop: 6,
    letterSpacing: -2.1,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontFamily: fontFamily.bold, fontSize: 12.5 },
  chartArea: { height: 260, marginTop: 14 },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.heroBorderSubtle,
  },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: {
    width: '70%',
    minHeight: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#8079FF',
  },
  barAxis: {
    position: 'absolute',
    bottom: -22,
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.heroTextFaint,
  },
  breakdownCard: { paddingVertical: 22, paddingHorizontal: 24, gap: 15 },
  breakdownTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  partRow: { gap: 7 },
  partHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  partDot: { width: 9, height: 9, borderRadius: 3 },
  partLabel: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  partValue: { fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.textPrimary },
  partTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  partFill: { height: '100%', borderRadius: 99 },
});

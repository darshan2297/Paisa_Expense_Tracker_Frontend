import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { compact, pctWidth } from '@/mock/format';
import { MOCK_ASSETS, MOCK_GOALS, MOCK_INVESTMENTS, MOCK_LOANS } from '@/mock/seed/wealth';
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

function emiOf(principal: number, rate: number, tenure: number): number {
  const r = rate / 1200;
  if (!r) return principal / tenure;
  const f = Math.pow(1 + r, tenure);
  return (principal * r * f) / (f - 1);
}

function loanOutstanding(l: (typeof MOCK_LOANS)[0], today: string): number {
  const r = l.rate / 1200;
  let bal = l.principal;
  const start = new Date(`${l.start}T00:00:00`);
  const end = new Date(`${today}T00:00:00`);
  const paidMonths = Math.min(
    l.tenure,
    Math.max(
      0,
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
    ),
  );
  for (let i = 0; i < paidMonths; i++) {
    const ip = bal * r;
    const pp = Math.min(bal, emiOf(l.principal, l.rate, l.tenure) - ip);
    bal = Math.max(0, bal - pp);
  }
  return paidMonths >= l.tenure ? 0 : bal;
}

function buildNetWorthSeries(endMonth: string, count: number) {
  const portfolio = MOCK_INVESTMENTS.reduce((a, v) => a + v.current, 0);
  const goalsSaved = MOCK_GOALS.reduce((a, g) => a + g.saved, 0);
  const assetsTotal = MOCK_ASSETS.reduce((a, x) => a + x.current, 0);
  const cashTotal = MOCK_ASSETS.filter((a) => a.kind === 'CASH' || a.kind === 'BANK').reduce(
    (a, x) => a + x.current,
    0,
  );
  const liabilities = MOCK_LOANS.reduce((a, l) => a + loanOutstanding(l, '2026-08-02'), 0);

  const [y, m] = endMonth.split('-').map(Number);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return keys.map((key, idx) => {
    const back = keys.length - 1 - idx;
    const wob = 1 + Math.sin(idx * 1.1) * 0.012;
    const pf = (portfolio / Math.pow(1.0115, back)) * wob;
    const as = (assetsTotal - cashTotal) / Math.pow(1.0045, back);
    const cs = ((cashTotal + goalsSaved) / Math.pow(1.009, back)) * wob;
    const li = liabilities * (1 + back * 0.0055);
    return {
      key,
      net: pf + as + cs - (back === 0 ? liabilities : li),
    };
  });
}

/** Design HTML `isNet` — net worth hero with chart bars, KPIs, breakdown. */
export default function NetWorthScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [range, setRange] = useState<number>(12);

  const data = useMemo(() => {
    const portfolio = MOCK_INVESTMENTS.reduce((a, v) => a + v.current, 0);
    const goalsSaved = MOCK_GOALS.reduce((a, g) => a + g.saved, 0);
    const assetsTotal = MOCK_ASSETS.reduce((a, x) => a + x.current, 0);
    const cashTotal = MOCK_ASSETS.filter((a) => a.kind === 'CASH' || a.kind === 'BANK').reduce(
      (a, x) => a + x.current,
      0,
    );
    const liabilities = MOCK_LOANS.reduce((a, l) => a + loanOutstanding(l, '2026-08-02'), 0);
    const netWorth = assetsTotal + portfolio + goalsSaved - liabilities;

    const series = buildNetWorthSeries(month, 61);
    const view = series.slice(Math.max(0, series.length - range));
    const vals = view.map((p) => p.net);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const span = Math.max(1, hi - lo);

    const nwNow = vals[vals.length - 1] ?? 0;
    const nwPrev = vals[vals.length - 2] ?? nwNow;
    const yearAgo = series[series.length - 13]?.net ?? vals[0] ?? nwNow;
    const peak = Math.max(...series.map((s) => s.net));
    const monthChange = nwNow - nwPrev;
    const yearChange = nwNow - yearAgo;

    const bars = view.map((p, i) => ({
      key: p.key,
      height: `${Math.max(8, ((p.net - lo) / span) * 100)}%`,
      label:
        i % Math.max(1, Math.ceil(view.length / 6)) === 0 || i === view.length - 1
          ? formatMonthYear(`${p.key}-01`)
          : '',
    }));

    const nwParts = [
      { label: 'Portfolio', value: portfolio, color: '#5B54D6' },
      { label: 'Assets', value: assetsTotal - cashTotal, color: '#3E6E9E' },
      { label: 'Cash & goals', value: cashTotal + goalsSaved, color: '#2F7D5D' },
      { label: 'Liabilities', value: liabilities, color: '#C2543D', negative: true },
    ].map((p) => ({
      ...p,
      display: p.negative ? `−${compact(p.value)}` : compact(p.value),
      width: pctWidth(p.value, netWorth + liabilities),
    }));

    return {
      nwNow,
      monthChange,
      yearChange,
      yearPct: yearAgo ? ((yearChange / Math.abs(yearAgo)) * 100).toFixed(1) : '0',
      peak,
      liabilities,
      bars,
      nwParts,
    };
  }, [month, range]);

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
                      backgroundColor: on ? colors.textPrimary : 'rgba(252,250,247,.08)',
                      borderColor: on ? colors.textPrimary : 'rgba(252,250,247,.16)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: on ? colors.heroText : colors.heroTextMuted },
                    ]}
                  >
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

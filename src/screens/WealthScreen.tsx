import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { compact, fmt, initials, pctWidth } from '@/mock/format';
import { MOCK_GOALS, MOCK_INVESTMENTS } from '@/mock/seed/wealth';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

const AVATARS: [string, string][] = [
  ['#EDE9FE', '#5B54D6'],
  ['#E2F0E9', '#2F7D5D'],
  ['#F9E7E1', '#C2543D'],
  ['#E5EEF8', '#3E6E9E'],
  ['#FAEED8', '#96702C'],
  ['#FAE5F0', '#A84A7C'],
];

const INV_LABELS: Record<string, string> = {
  SIP: 'Mutual fund SIP',
  STK: 'Stocks',
  PPF: 'PPF / EPF',
  FD: 'Fixed deposit',
  GOLD: 'Gold',
};

/** Design HTML `isWealth` — portfolio hero, goals grid, investments list. */
export default function WealthScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const today = '2026-08-02';

  const stats = useMemo(() => {
    const portfolio = MOCK_INVESTMENTS.reduce((a, v) => a + v.current, 0);
    const invested = MOCK_INVESTMENTS.reduce((a, v) => a + v.invested, 0);
    const gain = portfolio - invested;
    const gainPct = invested ? ((gain / invested) * 100).toFixed(1) : '0.0';
    const goalsSaved = MOCK_GOALS.reduce((a, g) => a + g.saved, 0);
    const goalsToGo = MOCK_GOALS.reduce((a, g) => a + Math.max(0, g.target - g.saved), 0);
    const sipTotal = MOCK_INVESTMENTS.reduce((a, v) => a + (v.monthly || 0), 0);
    return { portfolio, invested, gain, gainPct, goalsSaved, goalsToGo, sipTotal };
  }, []);

  const goals = useMemo(
    () =>
      MOCK_GOALS.map((g, i) => {
        const [bg, fg] = AVATARS[i % AVATARS.length];
        const pctv = g.target ? Math.min(100, (g.saved / g.target) * 100) : 0;
        const rem = Math.max(0, g.target - g.saved);
        const mo = g.monthly || 0;
        const monthsLeft = mo ? Math.ceil(rem / mo) : null;
        const eta = new Date(`${today}T00:00:00`);
        if (monthsLeft !== null) eta.setMonth(eta.getMonth() + monthsLeft);
        return {
          ...g,
          bg,
          fg,
          initial: initials(g.name).slice(0, 1),
          pct: `${Math.round(pctv)}%`,
          width: pctWidth(pctv, 100),
          saved: compact(g.saved),
          target: compact(g.target),
          remaining: compact(rem),
          monthly: mo ? `${fmt(mo)}/mo` : 'not funded',
          eta:
            monthsLeft === null
              ? 'Add a monthly amount'
              : rem === 0
                ? 'Completed'
                : eta.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          months: monthsLeft === null ? '—' : `${monthsLeft} months left`,
          sub: pctv >= 100 ? 'Goal reached' : `${compact(rem)} to go`,
          milestones: [25, 50, 75, 100].map((m) => ({
            label: `${m}%`,
            bg: pctv >= m ? fg : '#EDE8E1',
            fg: pctv >= m ? '#FCFAF7' : '#A39C92',
          })),
        };
      }),
    [],
  );

  const investments = useMemo(
    () =>
      MOCK_INVESTMENTS.map((v) => {
        const g = v.current - v.invested;
        const p = v.invested ? ((g / v.invested) * 100).toFixed(1) : '0.0';
        const label = INV_LABELS[v.kind] ?? v.kind;
        return {
          ...v,
          sub: `${label} · invested ${compact(v.invested)}${v.monthly ? ` · ${fmt(v.monthly)}/mo` : ''}`,
          current: compact(v.current),
          gain: `${g >= 0 ? '+' : '−'}${compact(Math.abs(g))} (${g >= 0 ? '+' : ''}${p}%)`,
          gainColor: g >= 0 ? colors.successValue : colors.dangerValue,
        };
      }),
    [],
  );

  const gainPositive = stats.gain >= 0;

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <LinearGradient
          colors={['#123F35', '#0B2A24']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.portfolioHero}
        >
          <Text style={styles.portfolioEyebrow}>Portfolio value</Text>
          <Text style={[styles.portfolioValue, moneyTextStyle]}>{compact(stats.portfolio)}</Text>
          <Text style={[styles.portfolioGain, { color: gainPositive ? '#8FE0BE' : '#F3A48E' }]}>
            {gainPositive ? '▲ +' : '▼ −'}
            {compact(Math.abs(stats.gain))} ({gainPositive ? '+' : '−'}
            {Math.abs(Number(stats.gainPct))}%)
          </Text>
        </LinearGradient>

        <DesignKpiCard
          label="Saved in goals"
          value={compact(stats.goalsSaved)}
          sub={`${MOCK_GOALS.length} goals · ${compact(stats.goalsToGo)} to go`}
        />
        <DesignKpiCard
          label="Monthly SIP"
          value={fmt(stats.sipTotal)}
          sub="auto-invested every month"
          valueColor="#2F7D6E"
        />
      </DesignGrid>

      <Card size="large" style={styles.goalsCard}>
        <DesignSectionHeader
          title="Savings goals"
          subtitle="Put money aside with a purpose."
          actionLabel="New goal"
          onAction={() => {}}
        />
        <DesignGrid cols={2} tabletCols={1} narrowCols={1} style={styles.goalsGrid}>
          {goals.map((g) => (
            <View key={g.id} style={styles.goalTile}>
              <View style={styles.goalTop}>
                <View style={[styles.goalAvatar, { backgroundColor: g.bg }]}>
                  <Text style={[styles.goalInitial, { color: g.fg }]}>{g.initial}</Text>
                </View>
                <View style={styles.goalCopy}>
                  <Text style={styles.goalName} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <Text style={styles.goalSub}>{g.sub}</Text>
                </View>
                <Text style={[styles.goalPct, { color: g.fg }]}>{g.pct}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: g.width as `${number}%`, backgroundColor: g.fg },
                  ]}
                />
              </View>
              <View style={styles.milestoneRow}>
                {g.milestones.map((ms) => (
                  <View key={ms.label} style={[styles.milestone, { backgroundColor: ms.bg }]}>
                    <Text style={[styles.milestoneLabel, { color: ms.fg }]}>{ms.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMeta}>
                  <Text style={styles.goalMetaLabel}>Contributing</Text>
                  <Text style={styles.goalMetaValue}>{g.monthly}</Text>
                </View>
                <View style={styles.goalMeta}>
                  <Text style={styles.goalMetaLabel}>Done by</Text>
                  <Text style={styles.goalMetaValue}>{g.eta}</Text>
                </View>
              </View>
              <View style={styles.goalFooter}>
                <Text style={styles.goalSaved}>{g.saved}</Text>
                <Text style={styles.goalOf}>
                  of {g.target} · {g.months}
                </Text>
                <Pressable style={styles.addMoneyBtn}>
                  <Text style={styles.addMoneyLabel}>Add money</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </DesignGrid>
      </Card>

      <Card size="large" style={styles.investCard}>
        <DesignSectionHeader
          title="Investments"
          subtitle="SIPs, stocks, PPF, FDs and gold in one place."
          actionLabel="Add investment"
          onAction={() => {}}
        />
        <View style={styles.investBanner}>
          <Text style={styles.investBannerLeft}>Invested {compact(stats.invested)}</Text>
          <Text
            style={[
              styles.investBannerRight,
              { color: gainPositive ? colors.successValue : colors.dangerValue },
            ]}
          >
            {gainPositive ? '+' : '−'}
            {compact(Math.abs(stats.gain))} ({gainPositive ? '+' : '−'}
            {Math.abs(Number(stats.gainPct))}%)
          </Text>
        </View>
        {investments.map((v) => (
          <View key={v.id} style={styles.investRow}>
            <View style={[styles.investTag, { backgroundColor: v.bg }]}>
              <Text style={[styles.investTagText, { color: v.fg }]}>{v.tag}</Text>
            </View>
            <View style={styles.investCopy}>
              <Text style={styles.investName}>{v.name}</Text>
              <Text style={styles.investSub}>{v.sub}</Text>
            </View>
            <View style={styles.investAmounts}>
              <Text style={[styles.investCurrent, moneyTextStyle]}>{v.current}</Text>
              <Text style={[styles.investGain, { color: v.gainColor }]}>{v.gain}</Text>
            </View>
            <Pressable hitSlop={8} style={styles.deleteBtn}>
              <Feather name="trash-2" size={15} color="#C0B9AF" />
            </Pressable>
          </View>
        ))}
      </Card>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  portfolioHero: {
    borderRadius: radius.cardLarge,
    paddingVertical: 22,
    paddingHorizontal: 24,
    flex: 1,
    minWidth: 0,
    shadowColor: 'rgba(11,42,36,.9)',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.35,
    shadowRadius: 44,
    elevation: 8,
  },
  portfolioEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: 'rgba(242,251,247,.5)',
  },
  portfolioValue: {
    fontSize: 32,
    color: '#F2FBF7',
    marginTop: 8,
    letterSpacing: -1.44,
  },
  portfolioGain: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    marginTop: 6,
  },
  goalsCard: { paddingVertical: 22, paddingHorizontal: 24, gap: 18 },
  goalsGrid: { marginTop: 4 },
  goalTile: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceSubtle,
    gap: 12,
  },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  goalAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInitial: { fontFamily: fontFamily.extrabold, fontSize: 13 },
  goalCopy: { flex: 1, minWidth: 0, gap: 2 },
  goalName: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  goalSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  goalPct: { fontFamily: fontFamily.extrabold, fontSize: 13 },
  barTrack: {
    height: 9,
    borderRadius: 99,
    backgroundColor: '#EDE8E1',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 99 },
  milestoneRow: { flexDirection: 'row', gap: 6 },
  milestone: {
    flex: 1,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneLabel: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  goalMetaRow: { flexDirection: 'row', gap: 8 },
  goalMeta: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  goalMetaLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    color: colors.textCaption,
  },
  goalMetaValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  goalFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  goalSaved: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    letterSpacing: -0.42,
    color: colors.textPrimary,
  },
  goalOf: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textCaption, flex: 1 },
  addMoneyBtn: {
    marginLeft: 'auto',
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.surface,
  },
  investCard: { padding: 0, overflow: 'hidden' },
  investBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: '#F8F5F1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },
  investBannerLeft: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#948E85',
  },
  investBannerRight: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  investRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EC',
  },
  investTag: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investTagText: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  investCopy: { flex: 1, minWidth: 0, gap: 3 },
  investName: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  investSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  investAmounts: { alignItems: 'flex-end' },
  investCurrent: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
  },
  investGain: { fontFamily: fontFamily.bold, fontSize: 11.5, marginTop: 2 },
  deleteBtn: { padding: 4 },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PillarCard } from '@/components/PillarCard';
import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import {
  DesignDarkHero,
  DesignIconStat,
  DesignSectionHeader,
} from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { useGoalsSummary } from '@/features/goals/hooks';
import { useInvestmentsSummary } from '@/features/investments/hooks';
import { useLedgerPeople } from '@/features/ledger/hooks';
import { usePoliciesSummary } from '@/features/policies/hooks';
import { useTransactionsSummary } from '@/features/transactions/hooks';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { compactINR, formatINR } from '@/utils/currency';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';
import { safeNumber } from '@/utils/numbers';

/** Design HTML `isOverview` — This Month screen. */
export default function OverviewScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const summary = useTransactionsSummary(month);
  const investments = useInvestmentsSummary();
  const goalsSummary = useGoalsSummary();
  const policiesSummary = usePoliciesSummary();
  const { data: peopleBalances = [] } = useLedgerPeople();

  const data = summary.data;
  const income = safeNumber(data?.income_total);
  const expense = safeNumber(data?.expense_total);
  const balance = safeNumber(data?.net_balance);

  const pillars = useMemo(() => {
    const portfolio = safeNumber(investments.data?.portfolio_total);
    const gain = safeNumber(investments.data?.total_gain);
    const goalsSaved = safeNumber(goalsSummary.data?.total_saved);
    const activeGoals = goalsSummary.data?.active_count ?? 0;
    const cover = safeNumber(policiesSummary.data?.total_cover);
    const policyCount = policiesSummary.data?.policy_count ?? 0;

    const owedToMe = peopleBalances
      .filter((p) => safeNumber(p.net_balance) > 0)
      .reduce((s, p) => s + safeNumber(p.net_balance), 0);
    const iOwe = peopleBalances
      .filter((p) => safeNumber(p.net_balance) < 0)
      .reduce((s, p) => s - safeNumber(p.net_balance), 0);
    const netLoan = owedToMe - iOwe;

    return {
      portfolio: {
        value: compactINR(portfolio),
        sub: `${gain >= 0 ? '+' : '−'}${compactINR(Math.abs(gain))} overall`,
      },
      goals: {
        value: compactINR(goalsSaved),
        sub: `${activeGoals} active goal${activeGoals === 1 ? '' : 's'}`,
      },
      cover: {
        value: compactINR(cover),
        sub: `${policyCount} polic${policyCount === 1 ? 'y' : 'ies'} active`,
      },
      loan: {
        value: compactINR(netLoan),
        sub: `${formatINR(owedToMe)} in · ${formatINR(iOwe)} out`,
        valueColor:
          Math.abs(netLoan) < 1
            ? colors.textPrimary
            : netLoan >= 0
              ? colors.successValue
              : colors.dangerValue,
      },
    };
  }, [investments.data, goalsSummary.data, policiesSummary.data, peopleBalances]);

  const categoryBreakdown = data?.category_breakdown ?? [];
  const recent = data?.recent ?? [];

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignDarkHero
          eyebrow="Net balance"
          value={formatINR(balance)}
          note={
            balance >= 0
              ? `Saved ${formatINR(balance)} so far this month`
              : 'Spending exceeds income this month'
          }
        />
        <DesignIconStat
          label="Income"
          value={formatINR(income)}
          note="credits this month"
          valueColor={colors.successValue}
          icon="arrow-up"
          iconBg={colors.successTint}
          iconColor={colors.success}
        />
        <DesignIconStat
          label="Spent"
          value={formatINR(expense)}
          note="debits this month"
          valueColor={colors.dangerValue}
          icon="arrow-down"
          iconBg={colors.dangerTint}
          iconColor={colors.danger}
        />
      </DesignGrid>

      <View style={styles.pillars}>
        <PillarCard
          label="Portfolio"
          value={pillars.portfolio.value}
          sub={pillars.portfolio.sub}
          icon="bar-chart-2"
          background="#E7F0EF"
          foreground="#2F7D6E"
          onPress={() => router.push('/(tabs)/wealth')}
        />
        <PillarCard
          label="Goals saved"
          value={pillars.goals.value}
          sub={pillars.goals.sub}
          icon="star"
          background="#EDE9FE"
          foreground="#5B54D6"
          onPress={() => router.push('/(tabs)/wealth')}
        />
        <PillarCard
          label="Life cover"
          value={pillars.cover.value}
          sub={pillars.cover.sub}
          icon="shield"
          background="#E5EEF8"
          foreground="#3E6E9E"
          onPress={() => router.push('/(tabs)/policy')}
        />
        <PillarCard
          label="On loan"
          value={pillars.loan.value}
          sub={pillars.loan.sub}
          icon="users"
          background="#FAEED8"
          foreground="#96702C"
          valueColor={pillars.loan.valueColor}
          onPress={() => router.push('/(tabs)/people')}
        />
      </View>

      <DesignGridLead
        lead={
          <Card size="large" style={styles.catCard}>
            <View style={styles.catHeader}>
              <Text style={styles.cardTitle}>Where it went</Text>
              <Text style={styles.monthLabel}>{formatYearMonthLabel(month)}</Text>
            </View>
            {categoryBreakdown.length === 0 ? (
              <Text style={styles.emptyHint}>No spending recorded for this month yet.</Text>
            ) : (
              categoryBreakdown.map((item) => (
                <View key={item.category_id} style={styles.catRow}>
                  <View style={styles.catHeaderRow}>
                    <View style={[styles.catDot, { backgroundColor: item.color }]} />
                    <Text style={styles.catName}>{item.name}</Text>
                    <Text style={[styles.catAmount, moneyTextStyle]}>
                      {formatINR(safeNumber(item.amount))}
                    </Text>
                    <Text style={styles.catPct}>{item.pct.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.catBarTrack}>
                    <View
                      style={[
                        styles.catBarFill,
                        { width: `${item.pct}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>
        }
        side={
          <Card size="large" style={styles.recentCard}>
            <DesignSectionHeader
              title="Recent"
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/transactions')}
            />
            {recent.length === 0 ? (
              <Text style={styles.emptyHint}>No transactions yet this month.</Text>
            ) : (
              recent.map((t) => (
                <View key={t.id} style={styles.recentRow}>
                  <View
                    style={[
                      styles.recentAvatar,
                      { backgroundColor: t.type === 'income' ? '#E2F0E9' : '#F3EFE9' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recentInitial,
                        { color: t.type === 'income' ? '#2F7D5D' : t.category.color },
                      ]}
                    >
                      {t.category.name[0]}
                    </Text>
                  </View>
                  <View style={styles.recentCopy}>
                    <Text style={styles.recentTitle}>{t.category.name}</Text>
                    <Text style={styles.recentSub}>{t.note ?? t.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.recentAmount,
                      moneyTextStyle,
                      { color: t.type === 'income' ? colors.successValue : colors.textPrimary },
                    ]}
                  >
                    {t.type === 'income' ? '+' : '−'}
                    {formatINR(safeNumber(t.amount))}
                  </Text>
                </View>
              ))
            )}
          </Card>
        }
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  pillars: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  catCard: { padding: 22, gap: 14 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  monthLabel: { fontFamily: fontFamily.semibold, fontSize: 12, color: colors.textCaption },
  emptyHint: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    paddingVertical: 12,
  },
  catRow: { gap: 7 },
  catHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  catBarTrack: { height: 8, borderRadius: 99, backgroundColor: colors.divider, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 99 },
  recentCard: { padding: 20, gap: 4 },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  recentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInitial: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  recentCopy: { flex: 1, gap: 2 },
  recentTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  recentSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  recentAmount: { fontSize: 13.5, letterSpacing: -0.34 },
});

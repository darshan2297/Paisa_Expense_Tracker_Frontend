import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { PillarCard } from '@/components/PillarCard';
import { QueryBoundary } from '@/components/QueryBoundary';
import { TransactionRow } from '@/components/TransactionRow';
import { useCardsSummary } from '@/features/cards/hooks';
import { useTransactionsSummary } from '@/features/transactions/hooks';
import type { TransactionsSummary } from '@/features/transactions/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { compactINR, formatINR } from '@/utils/currency';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

const EMPTY_SUMMARY: TransactionsSummary = {
  income_total: '0',
  expense_total: '0',
  net_balance: '0',
  category_breakdown: [],
  recent: [],
};

/**
 * Overview (`isOverview` in the design HTML): net-balance hero, income/spent
 * tiles, 4-up pillars row, category breakdown, recent transactions.
 */
export default function DashboardScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const summary = useTransactionsSummary(month);
  const cardsSummary = useCardsSummary();

  const data = summary.data ?? EMPTY_SUMMARY;
  const netBalance = Number(data.net_balance);
  const incomeTotal = Number(data.income_total);
  const expenseTotal = Number(data.expense_total);
  const portfolioOutstanding = cardsSummary.data ? Number(cardsSummary.data.total_outstanding) : 0;
  const cardCount = cardsSummary.data?.cards.length ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <QueryBoundary
        isLoading={summary.isLoading}
        isError={summary.isError}
        onRetry={() => summary.refetch()}
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <MonthSwitcher month={month} onChange={setMonth} />

          <HeroCard style={styles.hero}>
            <Text style={styles.heroEyebrow}>Net balance</Text>
            <Text style={[styles.heroValue, moneyTextStyle]}>{compactINR(netBalance)}</Text>
            <Text style={styles.heroNote}>Income minus spending this month</Text>
          </HeroCard>

          <View style={styles.tileGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: colors.successTint }]}>
                  <Feather name="arrow-up" size={15} color={colors.success} />
                </View>
                <Text style={styles.statLabel}>Income</Text>
              </View>
              <Text style={[styles.statValue, moneyTextStyle, { color: colors.successValue }]}>
                {compactINR(incomeTotal)}
              </Text>
              <Text style={styles.statNote}>This month</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: colors.dangerTint }]}>
                  <Feather name="arrow-down" size={15} color={colors.danger} />
                </View>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
              <Text style={[styles.statValue, moneyTextStyle, { color: colors.dangerValue }]}>
                {compactINR(expenseTotal)}
              </Text>
              <Text style={styles.statNote}>This month</Text>
            </View>
          </View>

          <View style={styles.pillarsGrid}>
            <PillarCard
              label="Portfolio"
              value={cardCount > 0 ? compactINR(portfolioOutstanding) : '—'}
              sub={
                cardCount > 0
                  ? `${cardCount} card${cardCount === 1 ? '' : 's'} tracked`
                  : 'Add cards in Wealth'
              }
              icon="bar-chart-2"
              background="#E7F0EF"
              foreground="#2F7D6E"
              onPress={() => router.push('/(tabs)/wealth')}
            />
            <PillarCard
              label="Goals saved"
              value="—"
              sub="Coming in F7"
              icon="star"
              background="#EDE9FE"
              foreground="#5B54D6"
              disabled
            />
            <PillarCard
              label="Life cover"
              value="—"
              sub="Coming in F13"
              icon="shield"
              background="#E5EEF8"
              foreground="#3E6E9E"
              disabled
            />
            <PillarCard
              label="On loan"
              value="—"
              sub="Coming in F11"
              icon="users"
              background="#FAEED8"
              foreground="#96702C"
              disabled
            />
          </View>

          <Card size="large" style={styles.catCard}>
            <View style={styles.catCardHeader}>
              <Text style={styles.cardTitle}>Where it went</Text>
              <Text style={styles.monthLabel}>{formatYearMonthLabel(month)}</Text>
            </View>
            {data.category_breakdown.length > 0 ? (
              <View style={styles.catList}>
                {data.category_breakdown.map((item) => (
                  <View key={item.category_id} style={styles.catRow}>
                    <View style={styles.catHeaderRow}>
                      <View style={[styles.catDot, { backgroundColor: item.color }]} />
                      <Text style={styles.catName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.catAmount, moneyTextStyle]}>
                        {formatINR(Number(item.amount))}
                      </Text>
                      <Text style={styles.catPct}>{item.pct.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.catBarTrack}>
                      <View
                        style={[
                          styles.catBarFill,
                          {
                            width: `${Math.max(0, Math.min(100, item.pct))}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No spending recorded this month.</Text>
              </View>
            )}
          </Card>

          <Card size="large" style={styles.recentCard}>
            <View style={styles.recentHeader}>
              <Text style={styles.cardTitle}>Recent</Text>
              <Pressable onPress={() => router.push('/(tabs)/transactions')} hitSlop={8}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            {data.recent.length > 0 ? (
              data.recent.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} size="sm" />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nothing here yet.</Text>
                <Pressable onPress={() => router.push('/(tabs)/transactions')} hitSlop={8}>
                  <Text style={styles.seeAll}>Add a transaction</Text>
                </Pressable>
              </View>
            )}
          </Card>
        </ScrollView>
      </QueryBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.xl,
    gap: 14,
    paddingBottom: spacing.xxl,
  },
  hero: {
    paddingVertical: 24,
    paddingHorizontal: 26,
  },
  heroEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.heroTextEyebrow,
  },
  heroValue: {
    fontSize: 38,
    color: colors.heroText,
    marginTop: spacing.sm,
  },
  heroNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.heroTextMuted,
    marginTop: spacing.xs + 2,
  },
  tileGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textLabel,
  },
  statValue: {
    fontSize: 26,
    marginTop: 14,
  },
  statNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textCaption,
    marginTop: 4,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  catCard: {
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 26,
  },
  catCardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  monthLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textCaption,
  },
  catList: {
    gap: 14,
  },
  catRow: {
    gap: 7,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catDot: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
  catName: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  catAmount: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  catPct: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textCaption,
    width: 38,
    textAlign: 'right',
  },
  catBarTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 99,
  },
  recentCard: {
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  seeAll: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.accent,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyStateText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textCaption,
  },
});

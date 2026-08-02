import { router } from 'expo-router';
import { useState } from 'react';
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
import { useTransactionsSummary } from '@/features/transactions/hooks';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { compactINR, formatINR } from '@/utils/currency';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

/** Design HTML `isOverview` — This Month screen. */
export default function OverviewScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const summary = useTransactionsSummary(month);
  const data = summary.data;
  const income = Number(data?.income_total ?? 0);
  const expense = Number(data?.expense_total ?? 0);
  const balance = Number(data?.net_balance ?? 0);

  return (
    <ScreenScaffold
      month={month}
      onMonthChange={setMonth}
      onAddTransaction={() => router.push('/(tabs)/transactions')}
    >
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignDarkHero
          eyebrow="Net balance"
          value={compactINR(balance)}
          note={
            balance >= 0
              ? `Saved ${formatINR(balance)} so far this month`
              : 'Spending exceeds income this month'
          }
        />
        <DesignIconStat
          label="Income"
          value={compactINR(income)}
          note="credits this month"
          valueColor={colors.successValue}
          icon="arrow-up"
          iconBg={colors.successTint}
          iconColor={colors.success}
        />
        <DesignIconStat
          label="Spent"
          value={compactINR(expense)}
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
          value="₹12.7 L"
          sub="+₹1.2 L overall"
          icon="bar-chart-2"
          background="#E7F0EF"
          foreground="#2F7D6E"
          onPress={() => router.push('/(tabs)/wealth')}
        />
        <PillarCard
          label="Goals saved"
          value="₹7.63 L"
          sub="4 active goals"
          icon="star"
          background="#EDE9FE"
          foreground="#5B54D6"
          onPress={() => router.push('/(tabs)/wealth')}
        />
        <PillarCard
          label="Life cover"
          value="₹1.17 Cr"
          sub="4 policies active"
          icon="shield"
          background="#E5EEF8"
          foreground="#3E6E9E"
          onPress={() => router.push('/(tabs)/policy')}
        />
        <PillarCard
          label="On loan"
          value="₹3.2 L"
          sub="₹10,000 in · ₹8,000 out"
          icon="users"
          background="#FAEED8"
          foreground="#96702C"
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
            {(data?.category_breakdown ?? []).map((item) => (
              <View key={item.category_id} style={styles.catRow}>
                <View style={styles.catHeaderRow}>
                  <View style={[styles.catDot, { backgroundColor: item.color }]} />
                  <Text style={styles.catName}>{item.name}</Text>
                  <Text style={[styles.catAmount, moneyTextStyle]}>
                    {formatINR(Number(item.amount))}
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
            ))}
          </Card>
        }
        side={
          <Card size="large" style={styles.recentCard}>
            <DesignSectionHeader
              title="Recent"
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/transactions')}
            />
            {(data?.recent ?? []).map((t) => (
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
                  {formatINR(Number(t.amount))}
                </Text>
              </View>
            ))}
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

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { Card } from '@/components/Card';
import type { ActivityItem, GoalProgress, UpcomingItem } from '@/mock/dashboard';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';

export function RecentActivityCard({ items }: { items: ActivityItem[] }) {
  return (
    <Card size="large" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent activity</Text>
        <Pressable onPress={() => router.push('/(tabs)/transactions')} hitSlop={8}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: item.bg }]}>
            <Text style={[styles.initial, { color: item.fg }]}>{item.initial}</Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.rowSub} numberOfLines={1}>
              {item.sub}
            </Text>
          </View>
          <Text style={[styles.amount, moneyTextStyle, { color: item.amountColor }]}>
            {item.amount}
          </Text>
        </View>
      ))}
    </Card>
  );
}

export function ComingUpCard({
  items,
  windowLabel,
}: {
  items: UpcomingItem[];
  windowLabel: string;
}) {
  return (
    <Card size="large" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Coming up</Text>
        <Text style={styles.window}>{windowLabel}</Text>
      </View>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.upcomingDot} />
          <View style={styles.copy}>
            <Text style={styles.rowTitle}>{item.label}</Text>
            <Text style={styles.rowSub}>{item.sub}</Text>
          </View>
          <Text style={[styles.amount, moneyTextStyle]}>{item.amount}</Text>
        </View>
      ))}
    </Card>
  );
}

export function GoalProgressCard({ goals }: { goals: GoalProgress[] }) {
  return (
    <Card size="large" style={styles.card}>
      <Text style={[styles.title, styles.goalTitle]}>Goal progress</Text>
      <View style={styles.goalList}>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalRow}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={[styles.goalPct, { color: goal.color }]}>{goal.pct}</Text>
            </View>
            <View style={styles.goalTrack}>
              <View
                style={[
                  styles.goalFill,
                  { width: goal.width as DimensionValue, backgroundColor: goal.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  goalTitle: {
    marginBottom: 14,
  },
  link: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.accent,
  },
  window: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textCaption,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.tileSmall - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fontFamily.extrabold,
    fontSize: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    letterSpacing: -0.13,
    color: colors.textPrimary,
  },
  rowSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  amount: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13.5,
    color: colors.textPrimary,
    letterSpacing: -0.34,
  },
  upcomingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  goalList: {
    gap: 13,
  },
  goalRow: {
    gap: 6,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  goalName: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  goalPct: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  goalTrack: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});

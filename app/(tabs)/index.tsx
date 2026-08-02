import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { StatTile } from '@/components/StatTile';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize, moneyTextStyle } from '@/theme/typography';
import { compactINR } from '@/utils/currency';

/**
 * "This Month" overview — the mockup's `isOverview` screen. The hero
 * balance and Income/Spent tiles use placeholder numbers (there's no
 * Accounts/Transactions data yet - F2/F3); the "Recent" card shows the
 * mockup's actual empty-state copy rather than fabricated transaction rows,
 * since none exist.
 */
export default function DashboardScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <HeroCard>
        <Text style={styles.heroEyebrow}>Net balance</Text>
        <Text style={[styles.heroValue, moneyTextStyle]}>{compactINR(184320)}</Text>
        <Text style={styles.heroNote}>Across all accounts</Text>
      </HeroCard>

      <View style={styles.tileGrid}>
        <StatTile label="Income" value={compactINR(62000)} sub="This month" tone="success" />
        <StatTile label="Spent" value={compactINR(42150)} sub="+8% vs last month" tone="danger" />
      </View>

      <Card size="large">
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Nothing here yet.</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.xl,
    gap: 14,
  },
  heroEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.heroTextMuted,
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
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textCaption,
  },
});

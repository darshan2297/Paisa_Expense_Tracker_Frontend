import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatTile } from '@/components/StatTile';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';
import { compactINR } from '@/utils/currency';

/**
 * Placeholder dashboard/welcome screen.
 *
 * Static, hard-coded numbers only — this exists to prove out the app shell
 * (navigation, theme, shared components) end to end. Real balances,
 * transactions, etc. arrive with the relevant feature phases.
 */
export default function DashboardScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Welcome to</Text>
        <Text style={styles.title}>Paisa</Text>
        <Text style={styles.subtitle}>Your finances, at a glance.</Text>
      </View>

      <View style={styles.tileGrid}>
        <StatTile label="Total balance" value={compactINR(184320)} sub="Across 3 accounts" />
        <StatTile
          label="This month's spend"
          value={compactINR(42150)}
          sub="+8% vs last month"
          subTone="danger"
        />
      </View>
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
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.display,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  tileGrid: {
    gap: spacing.lg,
  },
});

import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatTile } from '@/components/StatTile';
import { useProfile } from '@/features/profile/hooks';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';
import { compactINR } from '@/utils/currency';

/**
 * Dashboard/welcome screen. The greeting is real (fetched from the
 * authenticated /profile endpoint) - the balance/spend tiles below are still
 * static placeholders, since Accounts/Transactions (F2/F3) don't exist yet.
 */
export default function DashboardScreen() {
  const profile = useProfile();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Welcome back</Text>
        {profile.isLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.nameLoading} />
        ) : (
          <Text style={styles.title}>{profile.data?.name ?? 'there'}</Text>
        )}
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
  nameLoading: {
    alignSelf: 'flex-start',
    marginVertical: spacing.sm,
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

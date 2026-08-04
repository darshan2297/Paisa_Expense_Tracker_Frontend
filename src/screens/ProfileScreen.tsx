import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { useLogout } from '@/features/auth/hooks';
import { useLifeDashboard } from '@/features/dashboard/hooks';
import { emptyLifeDashboard } from '@/features/dashboard/mapLifeDashboard';
import { useGoalsSummary } from '@/features/goals/hooks';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks';
import { useTransactionsSummary } from '@/features/transactions/hooks';
import { useAppLockStore } from '@/stores/appLockStore';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';
import { compactINR, formatINR } from '@/utils/currency';
import { currentYearMonth } from '@/utils/date';

/** Design HTML `isProfile` — Profile & Settings. */
export default function ProfileScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const setLocked = useAppLockStore((s) => s.setLocked);
  const dashboard = useLifeDashboard(month);
  const summary = useTransactionsSummary(month);
  const goalsSummary = useGoalsSummary();

  const dash = dashboard.data ?? emptyLifeDashboard(month);
  const savedThisMonth = Number(summary.data?.net_balance ?? 0);
  const monthlyBudget = dash.budget > 0 ? formatINR(dash.budget) : '—';
  const activeGoals = goalsSummary.data?.active_count ?? dash.goals.length;

  const p = profile.data;
  const name = p?.name ?? 'Darshan';
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth} showMonthControls={false}>
      <LinearGradient
        colors={[colors.heroGradientStart, colors.heroGradientEnd]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <LinearGradient
          colors={[colors.brandGradientStart, colors.brandGradientEnd]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <View style={styles.heroCopy}>
          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroEmail}>{p?.email ?? '—'}</Text>
          <Text style={styles.heroSince}>
            {p?.created_at
              ? `Member since ${new Date(p.created_at).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}`
              : 'Member since —'}
          </Text>
        </View>
        <Pressable onPress={() => logout.mutate()} style={styles.logoutBtn}>
          <Feather name="log-out" size={15} color={colors.heroText} />
          <Text style={styles.logoutLabel}>Log out</Text>
        </Pressable>
      </LinearGradient>

      <DesignGrid cols={4} tabletCols={2}>
        <DesignKpiCard label="Net worth" value={dash.netWorth} />
        <DesignKpiCard
          label="This month saved"
          value={savedThisMonth > 0 ? compactINR(savedThisMonth) : formatINR(0)}
        />
        <DesignKpiCard label="Monthly budget" value={monthlyBudget} />
        <DesignKpiCard label="Active goals" value={String(activeGoals)} />
      </DesignGrid>

      <DesignGridLead
        lead={
          <Card size="large" style={styles.panel}>
            <Text style={styles.panelTitle}>Your details</Text>
            <Text style={styles.panelSub}>Edits save as you type.</Text>
            <View style={styles.fields}>
              {(
                [
                  ['Name', 'name', p?.name ?? ''],
                  ['Phone', 'phone', p?.phone ?? ''],
                  ['City', 'city', p?.city ?? ''],
                  ['Occupation', 'occupation', p?.occupation ?? ''],
                ] as const
              ).map(([label, key, value]) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    defaultValue={value}
                    onEndEditing={(e) =>
                      updateProfile.mutate({ [key]: e.nativeEvent.text || null })
                    }
                  />
                </View>
              ))}
            </View>
          </Card>
        }
        side={
          <Card size="large" style={styles.panel}>
            <Text style={styles.panelTitle}>Preferences</Text>
            {(
              [
                [
                  'Week starts Monday',
                  'Start weeks on Monday for reports',
                  p?.week_start_monday ?? true,
                ],
                [
                  'Round-up savings',
                  'Round expenses up to the nearest ₹10',
                  p?.round_up_savings ?? false,
                ],
                ['Weekly digest', 'Email summary every Sunday', p?.digest_enabled ?? true],
                ['Sound effects', 'Subtle sounds for actions', p?.sound_enabled ?? true],
              ] as const
            ).map(([label, sub, on]) => (
              <View key={label} style={styles.prefRow}>
                <View style={styles.prefCopy}>
                  <Text style={styles.prefLabel}>{label}</Text>
                  <Text style={styles.prefSub}>{sub}</Text>
                </View>
                <ToggleSwitch
                  value={on}
                  onValueChange={(v) =>
                    updateProfile.mutate({
                      week_start_monday: label.includes('Monday') ? v : undefined,
                      round_up_savings: label.includes('Round') ? v : undefined,
                      digest_enabled: label.includes('digest') ? v : undefined,
                      sound_enabled: label.includes('Sound') ? v : undefined,
                    })
                  }
                />
              </View>
            ))}
          </Card>
        }
      />

      <Card size="large" style={styles.panel}>
        <DesignSectionHeader title="Sign-in & security" subtitle={p?.email} />
        <View style={styles.pinRow}>
          <View style={styles.pinIcon}>
            <Feather name="lock" size={17} color={colors.accent} />
          </View>
          <View style={styles.prefCopy}>
            <Text style={styles.prefLabel}>App PIN</Text>
            <Text style={styles.prefSub}>6 digits · required to open Paisa</Text>
          </View>
          <Pressable style={styles.pinBtn} onPress={() => router.push('/lock-setup')}>
            <Text style={styles.pinBtnLabel}>Change PIN</Text>
          </Pressable>
        </View>
      </Card>

      <DesignGrid cols={3} tabletCols={1}>
        <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/security')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E2F0E9' }]}>
            <Feather name="shield" size={17} color={colors.success} />
          </View>
          <Text style={styles.actionTitle}>Security & privacy</Text>
          <Text style={styles.actionSub}>PIN, biometrics, backups</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => setLocked(true)}>
          <View style={[styles.actionIcon, { backgroundColor: colors.accentTint }]}>
            <Feather name="lock" size={17} color={colors.accent} />
          </View>
          <Text style={styles.actionTitle}>Lock the app</Text>
          <Text style={styles.actionSub}>Require auth to come back</Text>
        </Pressable>
        <Pressable style={[styles.actionCard, styles.actionDanger]} onPress={() => logout.mutate()}>
          <View style={[styles.actionIcon, { backgroundColor: '#F4DCD3' }]}>
            <Feather name="log-out" size={17} color={colors.dangerValue} />
          </View>
          <Text style={[styles.actionTitle, { color: colors.dangerValue }]}>Log out</Text>
          <Text style={[styles.actionSub, { color: colors.dangerSubtext }]}>
            End this session on all tabs
          </Text>
        </Pressable>
      </DesignGrid>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.cardLarge,
    paddingVertical: 26,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -60,
    top: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.heroGlow,
    opacity: 0.34,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.extrabold, fontSize: 26, color: colors.heroText },
  heroCopy: { flex: 1, minWidth: 0, gap: 4 },
  heroName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    color: colors.heroText,
    letterSpacing: -0.96,
  },
  heroEmail: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.heroTextMuted },
  heroSince: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.heroTextFaint },
  logoutBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.heroBorderSubtle,
    backgroundColor: colors.heroSurfaceSubtle,
  },
  logoutLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.heroText },
  panel: { padding: 22, gap: 12 },
  panelTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  panelSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginBottom: 6,
  },
  fields: { gap: 12 },
  field: { gap: 7 },
  fieldLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textLabel },
  fieldInput: {
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSubtle,
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  prefCopy: { flex: 1, gap: 3 },
  prefLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  prefSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderRadius: 17,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 8,
  },
  pinIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBtn: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  pinBtnLabel: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.heroText },
  actionCard: {
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    minWidth: 0,
  },
  actionDanger: { backgroundColor: colors.dangerTint, borderColor: colors.dangerTintBorder },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontFamily: fontFamily.bold, fontSize: 13.5, color: colors.textPrimary },
  actionSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
});

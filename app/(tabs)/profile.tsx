import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { IconChip } from '@/components/IconChip';
import { Input } from '@/components/Input';
import { SettingRow } from '@/components/SettingRow';
import { useLogout } from '@/features/auth/hooks';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks';
import type { Profile, ProfileUpdatePayload } from '@/features/profile/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

type ProfileFormValues = Pick<Profile, 'name' | 'phone' | 'city' | 'occupation'>;

function memberSinceText(createdAt: string): string {
  const date = new Date(createdAt);
  return `Member since ${date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || '?';
}

export default function ProfileScreen() {
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: { name: '', phone: '', city: '', occupation: '' },
  });

  // Repopulate the form once the profile has loaded (or changes elsewhere,
  // e.g. after a successful save) - `reset` replaces the form's values
  // without marking it as user-dirty.
  useEffect(() => {
    if (profile.data) {
      reset({
        name: profile.data.name,
        phone: profile.data.phone ?? '',
        city: profile.data.city ?? '',
        occupation: profile.data.occupation ?? '',
      });
    }
  }, [profile.data, reset]);

  const onSave = handleSubmit((values) => {
    updateProfile.mutate({
      name: values.name,
      phone: values.phone || null,
      city: values.city || null,
      occupation: values.occupation || null,
    });
  });

  function togglePreference(field: keyof ProfileUpdatePayload, value: boolean) {
    updateProfile.mutate({ [field]: value });
  }

  if (profile.isLoading || !profile.data) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <HeroCard style={styles.hero}>
        <LinearGradient
          colors={[colors.brandGradientStart, colors.brandGradientEnd]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initialsFor(profile.data.name)}</Text>
        </LinearGradient>
        <View style={styles.heroTextGroup}>
          <Text style={styles.heroName}>{profile.data.name}</Text>
          <Text style={styles.heroEmail}>{profile.data.email}</Text>
          <Text style={styles.heroSince}>{memberSinceText(profile.data.created_at)}</Text>
        </View>
        <Pressable
          onPress={() => logout.mutate()}
          style={({ pressed }) => [styles.heroLogout, pressed && styles.heroLogoutPressed]}
        >
          <Feather name="log-out" size={15} color={colors.heroText} />
          <Text style={styles.heroLogoutText}>Log out</Text>
        </Pressable>
      </HeroCard>

      <Card size="large" style={styles.section}>
        <Text style={styles.sectionTitle}>Your details</Text>
        <Text style={styles.sectionSubtitle}>Edits save as you type.</Text>

        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required.' }}
          render={({ field, fieldState }) => (
            <Input
              label="Name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="Phone"
              keyboardType="phone-pad"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <Input
              label="City"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="occupation"
          render={({ field }) => (
            <Input
              label="Occupation"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Button label="Save changes" onPress={onSave} loading={updateProfile.isPending} />
      </Card>

      <Card size="large" style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View>
          <SettingRow
            label="Dark mode"
            value={profile.data.dark_mode}
            onValueChange={(value) => togglePreference('dark_mode', value)}
          />
          <SettingRow
            label="Week starts Monday"
            value={profile.data.week_start_monday}
            onValueChange={(value) => togglePreference('week_start_monday', value)}
          />
          <SettingRow
            label="Round-up savings"
            sub="Round each expense up to the nearest ₹10 into savings"
            value={profile.data.round_up_savings}
            onValueChange={(value) => togglePreference('round_up_savings', value)}
          />
          <SettingRow
            label="Digest notifications"
            value={profile.data.digest_enabled}
            onValueChange={(value) => togglePreference('digest_enabled', value)}
          />
          <SettingRow
            label="Sound effects"
            value={profile.data.sound_enabled}
            onValueChange={(value) => togglePreference('sound_enabled', value)}
            showDivider={false}
          />
        </View>
      </Card>

      <View style={styles.quickLinks}>
        {/* Security & privacy has no onPress yet - the full Security
            screen (sessions, backup) is F20 and doesn't exist yet.
            Rendered now for layout fidelity to the mockup; wired once built. */}
        <View style={styles.quickLinkCard}>
          <IconChip name="shield" background={colors.successTint} color={colors.success} />
          <View style={styles.quickLinkText}>
            <Text style={styles.quickLinkTitle}>Security &amp; privacy</Text>
            <Text style={styles.quickLinkSub}>PIN, biometrics, backups</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/lock-setup')}
          style={({ pressed }) => [styles.quickLinkCard, pressed && styles.quickLinkPressed]}
        >
          <IconChip name="lock" background={colors.accentTint} color={colors.accent} />
          <View style={styles.quickLinkText}>
            <Text style={styles.quickLinkTitle}>Lock the app</Text>
            <Text style={styles.quickLinkSub}>Require auth to come back</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => logout.mutate()}
          style={({ pressed }) => [
            styles.quickLinkCard,
            styles.quickLinkDanger,
            pressed && styles.quickLinkDangerPressed,
          ]}
        >
          <IconChip name="log-out" background={colors.dangerTint} color={colors.dangerValue} />
          <View style={styles.quickLinkText}>
            <Text style={[styles.quickLinkTitle, { color: colors.dangerValue }]}>Log out</Text>
            <Text style={[styles.quickLinkSub, { color: colors.dangerSubtext }]}>
              End this session on all tabs
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.xl,
    gap: 14,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    color: colors.heroText,
  },
  heroTextGroup: {
    gap: 4,
    minWidth: 0,
  },
  heroName: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xxl,
    color: colors.heroText,
  },
  heroEmail: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.heroTextMuted,
  },
  heroSince: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.heroTextFaint,
  },
  heroLogout: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 42,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.heroBorderSubtle,
    backgroundColor: colors.heroFillSubtle,
  },
  heroLogoutPressed: {
    backgroundColor: 'rgba(252,250,247,.16)',
  },
  heroLogoutText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.heroText,
  },
  section: {
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: -spacing.md,
  },
  quickLinks: {
    gap: spacing.md,
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLinkPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  quickLinkDanger: {
    backgroundColor: colors.dangerTint,
    borderColor: colors.dangerTintBorder,
  },
  quickLinkDangerPressed: {
    backgroundColor: '#F6E2DA',
  },
  quickLinkText: {
    gap: 2,
    minWidth: 0,
  },
  quickLinkTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  quickLinkSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
});

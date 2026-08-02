import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { SettingRow } from '@/components/SettingRow';
import { useLogout } from '@/features/auth/hooks';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks';
import type { Profile, ProfileUpdatePayload } from '@/features/profile/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

type ProfileFormValues = Pick<Profile, 'name' | 'phone' | 'city' | 'occupation'>;

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
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>{profile.data.email}</Text>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Your details</Text>

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

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
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
        />
      </Card>

      <Button
        label="Log out"
        variant="danger"
        onPress={() => logout.mutate()}
        loading={logout.isPending}
      />
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
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
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
  section: {
    gap: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
});

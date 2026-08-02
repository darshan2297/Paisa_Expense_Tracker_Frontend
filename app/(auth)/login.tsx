import { isAxiosError } from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useLogin } from '@/features/auth/hooks';
import type { LoginPayload } from '@/features/auth/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const login = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({ defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Paisa</Text>
        <Text style={styles.subtitle}>Log in to your account.</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required.',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email.' },
          }}
          render={({ field }) => (
            <Input
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password is required.' }}
          render={({ field }) => (
            <Input
              label="Password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
            />
          )}
        />

        {login.isError ? (
          <Text style={styles.formError}>{loginErrorMessage(login.error)}</Text>
        ) : null}

        <Button label="Log in" onPress={onSubmit} loading={login.isPending} />
      </View>
    </View>
  );
}

function loginErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 401) {
    return 'Incorrect email or password.';
  }
  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
    backgroundColor: colors.bg,
    padding: spacing.xl,
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
  form: {
    gap: spacing.lg,
  },
  formError: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});

import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { AuthField } from '@/features/auth/components/AuthField';
import { AuthModeToggle, type AuthMode } from '@/features/auth/components/AuthModeToggle';
import { useLogin, useRegister } from '@/features/auth/hooks';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const ROUTE_FOR_MODE: Record<AuthMode, '/(auth)/register' | '/(auth)/login'> = {
  register: '/(auth)/register',
  signin: '/(auth)/login',
};

type AccountFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AccountStepFormProps = {
  mode: AuthMode;
  /** Called after a successful register/login — advances the flow in-place. */
  onAuthenticated: () => void;
};

/** Account-step body only (no page chrome) — used inside OnboardingFlow. */
export function AccountStepForm({ mode, onAuthenticated }: AccountStepFormProps) {
  const isRegister = mode === 'register';
  const register = useRegister({ onAuthenticated });
  const login = useLogin({ onAuthenticated });
  const submission = isRegister ? register : login;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormValues>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit((values) => {
    if (isRegister) {
      register.mutate({ name: values.name, email: values.email, password: values.password });
      return;
    }
    login.mutate({ email: values.email, password: values.password });
  });

  return (
    <View style={styles.body}>
      <AuthModeToggle mode={mode} onChange={(next) => router.replace(ROUTE_FOR_MODE[next])} />

      <View style={styles.form}>
        {isRegister ? (
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required.' }}
            render={({ field }) => (
              <AuthField
                label="Full name"
                placeholder="Aarav Sharma"
                autoComplete="name"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.name?.message}
              />
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required.',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email.' },
          }}
          render={({ field }) => (
            <AuthField
              label="Email address"
              placeholder="you@example.com"
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
          rules={{
            required: 'Password is required.',
            ...(isRegister && {
              minLength: {
                value: MIN_PASSWORD_LENGTH,
                message: `At least ${MIN_PASSWORD_LENGTH} characters.`,
              },
            }),
          }}
          render={({ field }) => (
            <AuthField
              label="Password"
              placeholder={
                isRegister ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Your password'
              }
              secureTextEntry
              autoCapitalize="none"
              autoComplete={isRegister ? 'new-password' : 'password'}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
            />
          )}
        />

        {isRegister ? (
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Confirm your password.',
              validate: (value, formValues) =>
                value === formValues.password || 'Passwords do not match.',
            }}
            render={({ field }) => (
              <AuthField
                label="Confirm password"
                placeholder="Repeat your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        ) : null}

        {submission.isError ? (
          <Text style={styles.formError}>{submissionErrorMessage(mode, submission.error)}</Text>
        ) : null}

        <Button
          variant="onDark"
          size="lg"
          label={isRegister ? 'Continue to PIN setup' : 'Sign in'}
          onPress={onSubmit}
          loading={submission.isPending}
        />
      </View>
    </View>
  );
}

function submissionErrorMessage(mode: AuthMode, error: unknown): string {
  if (isAxiosError(error)) {
    if (mode === 'register' && error.response?.status === 409) {
      return 'An account already exists on this server. Sign in instead.';
    }
    if (mode === 'signin' && error.response?.status === 401) {
      return 'Incorrect email or password.';
    }
  }
  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  formError: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.heroDanger,
  },
});

export default AccountStepForm;

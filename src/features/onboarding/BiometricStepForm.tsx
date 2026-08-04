import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { authenticateWithBiometrics, isBiometricAvailable } from '@/features/appLock/biometrics';
import { setBiometricEnabled } from '@/features/appLock/biometricPreference';
import { useAppLockStore } from '@/stores/appLockStore';
import { useOnboardingFlowStore } from '@/stores/onboardingFlowStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

type BiometricOptionProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sub: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

function BiometricOption({
  icon,
  label,
  sub,
  value,
  disabled = false,
  onValueChange,
}: BiometricOptionProps) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={({ pressed }) => [styles.option, pressed && !disabled && styles.optionPressed]}
    >
      <View style={styles.optionIcon}>
        <Feather name={icon} size={18} color={colors.heroText} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionSub}>{sub}</Text>
      </View>
      <ToggleSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        variant="onDark"
      />
    </Pressable>
  );
}

export type BiometricStepFormProps = {
  onFinished?: () => void;
};

/** Biometrics-step body only — used inside OnboardingFlow. */
export function BiometricStepForm({ onFinished }: BiometricStepFormProps) {
  const setStoreBiometricEnabled = useAppLockStore((state) => state.setBiometricEnabled);
  const setInProgress = useOnboardingFlowStore((state) => state.setInProgress);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricSupported);
  }, []);

  async function toggleOption(next: boolean, setter: (value: boolean) => void): Promise<void> {
    setError(null);
    if (!next) {
      setter(false);
      return;
    }
    if (!biometricSupported) {
      return;
    }
    const ok = await authenticateWithBiometrics('Enable biometric unlock for Paisa');
    if (!ok) {
      setError("Couldn't verify — you can try again or skip for now.");
      return;
    }
    setter(true);
  }

  async function onFinish() {
    const enabled = fingerprintEnabled || faceIdEnabled;
    await setBiometricEnabled(enabled);
    setStoreBiometricEnabled(enabled);
    setInProgress(false);
    if (onFinished) {
      onFinished();
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={styles.body}>
      <View style={styles.options}>
        <BiometricOption
          icon="smartphone"
          label="Fingerprint unlock"
          sub="Touch the sensor to open Paisa"
          value={fingerprintEnabled}
          disabled={!biometricSupported}
          onValueChange={(next) => toggleOption(next, setFingerprintEnabled)}
        />
        <BiometricOption
          icon="eye"
          label="Face ID"
          sub="Glance at the camera to open Paisa"
          value={faceIdEnabled}
          disabled={!biometricSupported}
          onValueChange={(next) => toggleOption(next, setFaceIdEnabled)}
        />
      </View>

      <Text style={styles.note}>
        Optional — you can turn these on any time from Profile → Sign-in & security.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!biometricSupported && Platform.OS === 'web' ? (
        <Text style={styles.note}>
          Biometrics are not available in the browser — skip to continue.
        </Text>
      ) : null}

      <Button variant="onDark" size="lg" label="Skip for now — finish setup" onPress={onFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.tileSmall,
    backgroundColor: colors.heroSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.heroBorderSubtle,
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.heroFillSubtle,
  },
  optionText: {
    flex: 1,
    gap: 3,
  },
  optionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.heroText,
  },
  optionSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.heroTextMuted,
  },
  note: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.heroTextFaint,
    textAlign: 'center',
  },
  error: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.heroDanger,
    textAlign: 'center',
  },
});

export default BiometricStepForm;

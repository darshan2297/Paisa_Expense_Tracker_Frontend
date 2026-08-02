import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Keypad } from '@/components/Keypad';
import { PinDots } from '@/components/PinDots';
import { setPin } from '@/features/appLock/pin';
import { useAppLockStore } from '@/stores/appLockStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

const PIN_LENGTH = 6;

/**
 * Two-step PIN setup: enter a new PIN, then confirm it. Pushed from
 * Profile's "Lock the app" quick-link (app/(tabs)/profile.tsx). Dark
 * background to match the app-lock screen this PIN is used for — `Keypad`
 * is styled for that dark theme, not a general-purpose light-background
 * component.
 */
export default function LockSetupScreen() {
  const setHasPinConfigured = useAppLockStore((state) => state.setHasPinConfigured);
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onDigit(digit: string) {
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPinInput(next);
    if (next.length !== PIN_LENGTH) {
      return;
    }

    if (step === 'create') {
      setFirstPin(next);
      setPinInput('');
      setStep('confirm');
      return;
    }

    if (next === firstPin) {
      setPin(next).then(() => {
        setHasPinConfigured(true);
        router.back();
      });
    } else {
      setError('PINs did not match. Start again.');
      setFirstPin('');
      setPinInput('');
      setStep('create');
    }
  }

  function onBackspace() {
    setPinInput((current) => current.slice(0, -1));
  }

  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientEnd]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.screen}
    >
      <Text style={styles.title}>
        {step === 'create' ? 'Choose a 6-digit PIN' : 'Confirm your PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'create'
          ? "You'll use this to unlock Paisa on this device."
          : 'Enter it once more to confirm.'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.pinContent}>
        <PinDots length={PIN_LENGTH} filled={pin.length} />
        <Keypad onDigit={onDigit} onBackspace={onBackspace} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xl,
    color: colors.heroText,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.heroTextMuted,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
  error: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: '#F0B49F',
  },
  pinContent: {
    alignItems: 'center',
    gap: 32,
  },
});

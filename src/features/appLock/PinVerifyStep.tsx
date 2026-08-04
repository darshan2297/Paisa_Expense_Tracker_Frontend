import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Keypad } from '@/components/Keypad';
import { PinDots } from '@/components/PinDots';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

import { verifyPin } from './pin';

const PIN_LENGTH = 6;

export type PinVerifyStepProps = {
  /** Called once the entered PIN matches (local cache or account). */
  onVerified: (pin: string) => void;
  /** Called if the user backs out instead of completing verification. */
  onCancel: () => void;
  title?: string;
  subtitle?: string;
};

/**
 * A current-PIN confirmation gate — shared by "Change PIN" (lock-setup,
 * verify before allowing a new PIN) and "Disable App Lock" (Security screen,
 * verify before wiping the PIN). Deliberately PIN-only, no biometric/password
 * tabs: those flows are reached from inside an already-unlocked app, so a
 * lighter re-confirmation is enough — unlike `AppLockScreen`, which gates the
 * whole app and needs every fallback.
 *
 * Text/keypad colors match `PinSetupFlow` (`heroText`/`heroFillSubtle`, etc.)
 * because `Keypad`'s keys are styled for the dark app-lock gradient only —
 * callers must render this on that same dark gradient background rather than
 * a plain light screen (see `lock-setup.tsx`'s `LinearGradient` wrapper).
 */
export function PinVerifyStep({ onVerified, onCancel, title, subtitle }: PinVerifyStepProps) {
  const [pin, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleComplete(candidate: string) {
    setSubmitting(true);
    const ok = await verifyPin(candidate);
    setSubmitting(false);
    if (ok) {
      onVerified(candidate);
      return;
    }
    setError('Wrong PIN. Try again.');
    setPinInput('');
  }

  function onDigit(digit: string) {
    if (submitting) {
      return;
    }
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPinInput(next);
    if (next.length === PIN_LENGTH) {
      handleComplete(next);
    }
  }

  function onBackspace() {
    setPinInput((current) => current.slice(0, -1));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title ?? 'Confirm your PIN'}</Text>
      <Text style={styles.subtitle}>
        {subtitle ?? 'Enter your current 6-digit PIN to continue.'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.pinContent}>
        <PinDots length={PIN_LENGTH} filled={pin.length} />
        <Keypad onDigit={onDigit} onBackspace={onBackspace} />
      </View>
      <Pressable onPress={onCancel} style={styles.cancelBtn}>
        <Text style={styles.cancelLabel}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
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
    marginTop: -12,
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
  cancelBtn: {
    marginTop: 8,
  },
  cancelLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.heroTextMuted,
  },
});

export default PinVerifyStep;

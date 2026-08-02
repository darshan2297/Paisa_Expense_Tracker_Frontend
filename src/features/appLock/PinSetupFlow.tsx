import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Keypad } from '@/components/Keypad';
import { PinDots } from '@/components/PinDots';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

import { setPin } from './pin';

const PIN_LENGTH = 6;

export type PinSetupFlowProps = {
  /** Called after the PIN is chosen, confirmed, and persisted. */
  onComplete: () => void;
};

/**
 * Two-step PIN setup: enter a new PIN, then confirm it. Shared between the
 * mandatory onboarding flow (app/onboarding/pin.tsx, right after
 * register/login) and the settings-triggered change flow (Profile's "Lock
 * the app" -> app/lock-setup.tsx) - only what happens on success differs
 * between them, hence the `onComplete` callback rather than each screen
 * duplicating this logic.
 */
export function PinSetupFlow({ onComplete }: PinSetupFlowProps) {
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
      setPin(next).then(onComplete);
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
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 'create' ? 'Set your app PIN' : 'Confirm your PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'create'
          ? "Six digits. You'll need this every time you open Paisa."
          : 'Type the same six digits once more.'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.pinContent}>
        <PinDots length={PIN_LENGTH} filled={pin.length} />
        <Keypad onDigit={onDigit} onBackspace={onBackspace} />
      </View>
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
});

export default PinSetupFlow;

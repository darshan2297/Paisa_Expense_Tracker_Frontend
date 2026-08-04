import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Keypad } from '@/components/Keypad';
import { PinDots } from '@/components/PinDots';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';
import { getApiErrorMessage } from '@/utils/errors';

import { savePin } from './pin';

const PIN_LENGTH = 6;

export type PinSetupFlowProps = {
  /** Called after the PIN is chosen, confirmed, and persisted (account + device). */
  onComplete: () => void;
  /**
   * `create` — first-time account PIN.
   * `change` — replace after verifying current PIN (`currentPin` required).
   * `reset` — Forgot PIN after password re-auth (no current PIN needed).
   */
  mode?: 'create' | 'change' | 'reset';
  /** Required when `mode` is `change` — the PIN the user just verified. */
  currentPin?: string;
};

/**
 * Two-step PIN setup: enter a new PIN, then confirm it. Shared between the
 * mandatory onboarding flow, Profile → Change PIN / lock-setup, and Forgot PIN.
 */
export function PinSetupFlow({ onComplete, mode = 'create', currentPin }: PinSetupFlowProps) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const changing = mode === 'change';
  const resetting = mode === 'reset';

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
      savePin(next, {
        mode: changing ? 'change' : resetting ? 'reset' : 'create',
        currentPin: changing ? currentPin : undefined,
      })
        .then(onComplete)
        .catch((err: unknown) => {
          setError(getApiErrorMessage(err, "Couldn't save your PIN. Please try again."));
          setFirstPin('');
          setPinInput('');
          setStep('create');
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
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 'create'
          ? changing || resetting
            ? 'Choose a new PIN'
            : 'Set your app PIN'
          : 'Confirm your PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'create'
          ? changing || resetting
            ? 'Six digits. This updates your Paisa PIN on every device.'
            : "Six digits. You'll use this when you lock Paisa — same PIN on every device."
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

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Keypad } from '@/components/Keypad';
import { PinDots } from '@/components/PinDots';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

const PIN_LENGTH = 6;

export type PinEntryFormProps = {
  onComplete: (pin: string) => void;
  error?: string | null;
};

/** Six-digit PIN entry with dots + keypad — used on the setup and confirm screens. */
export function PinEntryForm({ onComplete, error }: PinEntryFormProps) {
  const [pin, setPin] = useState('');

  function onDigit(digit: string) {
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPin(next);
    if (next.length === PIN_LENGTH) {
      onComplete(next);
    }
  }

  function onBackspace() {
    setPin((current) => current.slice(0, -1));
  }

  return (
    <View style={styles.container}>
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
    gap: 16,
  },
  error: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.heroDanger,
    textAlign: 'center',
  },
  pinContent: {
    alignItems: 'center',
    gap: 32,
  },
});

export default PinEntryForm;

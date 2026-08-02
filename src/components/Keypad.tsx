import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export type KeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

/** 3×4 numeric keypad for PIN entry — dark circular keys on the app-lock screen. */
export function Keypad({ onDigit, onBackspace }: KeypadProps) {
  return (
    <View style={styles.grid}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((digit) => (
            <Key key={digit} label={digit} onPress={() => onDigit(digit)} />
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <View style={styles.keySpacer} />
        <Key label="0" onPress={() => onDigit('0')} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Backspace"
          onPress={onBackspace}
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
        >
          <Feather name="delete" size={20} color={colors.heroText} />
        </Pressable>
      </View>
    </View>
  );
}

function Key({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
    >
      <Text style={styles.keyLabel}>{label}</Text>
    </Pressable>
  );
}

const KEY_SIZE = 64;

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.heroFillSubtle,
    borderWidth: 1,
    borderColor: colors.heroBorderSubtle,
  },
  keyPressed: {
    backgroundColor: 'rgba(252,250,247,.16)',
  },
  keySpacer: {
    width: KEY_SIZE,
    height: KEY_SIZE,
  },
  keyLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    color: colors.heroText,
  },
});

export default Keypad;

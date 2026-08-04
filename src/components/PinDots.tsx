import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

export type PinDotsProps = {
  length: number;
  filled: number;
};

/** Row of small circles showing PIN entry progress — filled vs. outline. */
export function PinDots({ length, filled }: PinDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length }, (_, index) => (
        <View key={index} style={[styles.dot, index < filled && styles.dotFilled]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.heroBorderSubtle,
  },
  dotFilled: {
    backgroundColor: colors.heroText,
    borderColor: colors.heroText,
  },
});

export default PinDots;

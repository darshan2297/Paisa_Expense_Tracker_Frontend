import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';
import { formatYearMonthLabel, shiftYearMonth } from '@/utils/date';

export type MonthSwitcherProps = {
  /** "YYYY-MM" */
  month: string;
  onChange: (month: string) => void;
};

/**
 * Prev/next month pill, matching the mockup's header month nav - shared by
 * the Overview, Transactions, and Planned screens, all of which scope
 * their data to a single selected month.
 */
export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange(shiftYearMonth(month, -1))}
        hitSlop={8}
        accessibilityLabel="Previous month"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Feather name="chevron-left" size={16} color={colors.textMuted} />
      </Pressable>
      <Text style={styles.label}>{formatYearMonthLabel(month)}</Text>
      <Pressable
        onPress={() => onChange(shiftYearMonth(month, 1))}
        hitSlop={8}
        accessibilityLabel="Next month"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Feather name="chevron-right" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.chip,
    alignSelf: 'flex-start',
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.filterChip,
  },
  buttonPressed: {
    backgroundColor: colors.divider,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    letterSpacing: -0.195,
    color: colors.textPrimary,
    minWidth: 108,
    textAlign: 'center',
  },
});

export default MonthSwitcher;

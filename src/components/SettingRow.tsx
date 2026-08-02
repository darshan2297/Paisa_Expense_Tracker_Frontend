import { StyleSheet, Switch, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

export type SettingRowProps = {
  label: string;
  sub?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

/**
 * Label + sublabel + toggle row, used for preference lists (Profile
 * screen's dark mode / week-start / round-up / digest / sound toggles).
 */
export function SettingRow({ label, sub, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  textGroup: {
    flex: 1,
    marginRight: spacing.md,
    gap: 2,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});

export default SettingRow;

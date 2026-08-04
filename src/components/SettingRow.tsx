import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ToggleSwitch } from '@/components/ToggleSwitch';
import { colors } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

export type SettingRowProps = {
  label: string;
  sub?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Set false for the last row in a list — the mockup has no trailing divider. */
  showDivider?: boolean;
};

/**
 * Label + sublabel + toggle row, pixel-matched to the mockup's Preferences
 * list: full-width row, `13px 0` vertical padding, a `1px` divider between
 * rows.
 */
export function SettingRow({
  label,
  sub,
  value,
  onValueChange,
  showDivider = true,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.divider,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <ToggleSwitch value={value} onValueChange={onValueChange} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressed: {
    opacity: 0.85,
  },
  textGroup: {
    flex: 1,
    marginRight: 12,
    gap: 3,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
});

export default SettingRow;

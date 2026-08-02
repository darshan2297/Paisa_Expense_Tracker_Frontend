import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';

export type PillarCardProps = {
  label: string;
  value: string;
  sub: string;
  icon: keyof typeof Feather.glyphMap;
  background: string;
  foreground: string;
  valueColor?: string;
  onPress?: () => void;
  disabled?: boolean;
};

/** Overview KPI tile — pixel-matched to the mockup's 4-up `pillars` row. */
export function PillarCard({
  label,
  value,
  sub,
  icon,
  background,
  foreground,
  valueColor = colors.textPrimary,
  onPress,
  disabled,
}: PillarCardProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && !disabled && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={styles.labelRow}>
        <View style={[styles.iconChip, { backgroundColor: background }]}>
          <Feather name={icon} size={14} color={foreground} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, moneyTextStyle, { color: valueColor }]}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 9,
  },
  cardPressed: {
    transform: [{ translateY: -1 }],
  },
  cardDisabled: {
    opacity: 0.55,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  iconChip: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textLabel,
  },
  value: {
    fontSize: 22,
    letterSpacing: -0.04 * 22,
  },
  sub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
});

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared pill-shaped button primitive. Business screens should compose this
 * rather than styling `Pressable` ad hoc, so the tap target, disabled state
 * and loading state stay consistent app-wide.
 */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColorFor(variant)} />
      ) : (
        <Text style={[styles.label, { color: textColorFor(variant) }]}>{label}</Text>
      )}
    </Pressable>
  );
}

function textColorFor(variant: ButtonVariant) {
  return variant === 'secondary' ? colors.textPrimary : colors.surface;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
});

export default Button;

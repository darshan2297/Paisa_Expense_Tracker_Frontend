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
import { radius } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared button primitive, pixel-matched to the mockup's one true primary
 * CTA style: a near-black (`#14120F`) pill, NOT the purple accent color —
 * `colors.accent` is reserved for text links ("See all", etc.) in this
 * design system, never a solid button fill. See docs/COMPONENT_GUIDE.md.
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
        pressed && !isDisabled && pressedStyles[variant],
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
  if (variant === 'secondary') {
    return colors.textPrimary;
  }
  return colors.surface;
}

const styles = StyleSheet.create({
  base: {
    height: 42,
    borderRadius: radius.chip,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.textPrimary,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.dangerValue,
  },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: '#2C2822' },
  secondary: { backgroundColor: colors.surfaceSubtle },
  danger: { opacity: 0.9 },
});

export default Button;

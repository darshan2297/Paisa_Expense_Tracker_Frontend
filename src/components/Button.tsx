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

/** `onDark` is `primary` inverted — a cream pill for the dark onboarding/auth
 *  backdrop, where a near-black CTA would disappear into the background. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'onDark';

/** `lg` is the full-width CTA that anchors an entire screen (the onboarding
 *  steps); `md` is the in-card default. */
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  size = 'md',
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
        sizeStyles[size],
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
        <Text style={[styles.label, labelSizeStyles[size], { color: textColorFor(variant) }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function textColorFor(variant: ButtonVariant) {
  if (variant === 'secondary' || variant === 'onDark') {
    return colors.textPrimary;
  }
  return colors.surface;
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles = StyleSheet.create({
  md: {
    height: 42,
    borderRadius: radius.chip,
  },
  lg: {
    height: 48,
    borderRadius: radius.tileSmall,
  },
});

const labelSizeStyles = StyleSheet.create({
  md: { fontSize: 13 },
  lg: { fontSize: 14 },
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
  onDark: {
    backgroundColor: colors.heroText,
  },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: '#2C2822' },
  secondary: { backgroundColor: colors.surfaceSubtle },
  danger: { opacity: 0.9 },
  onDark: { backgroundColor: colors.surfaceSubtle },
});

export default Button;

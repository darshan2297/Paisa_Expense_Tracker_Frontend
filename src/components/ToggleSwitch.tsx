import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 20;
const TRACK_PADDING = 2;
const TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE; // 20px, matches the mockup exactly

export type ToggleSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  /** Use on auth/onboarding dark cards — light track + violet active state. */
  variant?: 'default' | 'onDark';
};

/**
 * Custom toggle switch, pixel-matched to the mockup's `44×24` track /
 * `20×20` thumb (native `Switch` renders each OS's own control and can't be
 * sized/styled to match a specific design). Used for every on/off
 * preference row (dark mode, week-start, round-up, digest, sound).
 */
function trackColor(value: boolean, variant: 'default' | 'onDark', disabled: boolean): string {
  if (variant === 'onDark') {
    if (disabled) return value ? 'rgba(124,116,255,.35)' : 'rgba(252,250,247,.14)';
    return value ? colors.brandGradientStart : 'rgba(252,250,247,.2)';
  }
  return value ? colors.accent : colors.border;
}

function thumbColor(variant: 'default' | 'onDark', disabled: boolean): string {
  if (variant === 'onDark' && disabled) return 'rgba(252,250,247,.55)';
  return colors.heroText;
}

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
  variant = 'default',
}: ToggleSwitchProps) {
  // Lazy-initialized so the Animated.Value instance is created exactly once
  // (a plain useRef(...).current access during render trips the React
  // Compiler's "don't touch ref values while rendering" rule).
  const [translateX] = useState(() => new Animated.Value(value ? TRAVEL : 0));

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? TRAVEL : 0,
      duration: 180,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        { backgroundColor: trackColor(value, variant, disabled) },
        disabled && variant === 'default' && styles.disabled,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          { backgroundColor: thumbColor(variant, disabled) },
          { transform: [{ translateX }] },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: TRACK_PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ToggleSwitch;

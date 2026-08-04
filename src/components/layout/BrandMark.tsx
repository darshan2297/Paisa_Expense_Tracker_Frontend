import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

/** Paisa logo mark — violet gradient squircle with chart icon. */
export function BrandMark({ size = 38 }: { size?: number }) {
  const iconSize = Math.round(size * 0.5);
  const radius = Math.round(size * 0.34);

  return (
    <LinearGradient
      colors={[colors.brandGradientStart, colors.brandGradientEnd]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.mark, { width: size, height: size, borderRadius: radius }]}
    >
      <Feather name="trending-up" size={iconSize} color={colors.heroText} />
    </LinearGradient>
  );
}

export function BrandWordmark() {
  return (
    <View style={styles.wordmark}>
      <Text style={styles.title}>Paisa</Text>
      <Text style={styles.tagline}>money, handled</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  wordmark: {
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    letterSpacing: -0.48,
    color: colors.textPrimary,
  },
  tagline: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textCaption,
  },
});

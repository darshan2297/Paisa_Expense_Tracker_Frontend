import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';

export type HeroCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * The dark gradient hero card used for the app's headline numbers (net
 * worth, net balance, profile header, spending forecast). Ported exactly
 * from the mockup: `linear-gradient(150deg, #2A2620 0%, #15120F 62%)` plus
 * a violet radial "glow" blob bleeding off the top-right corner.
 *
 * `LinearGradient` doesn't support radial gradients, so the glow is
 * approximated with three stacked concentric circles of decreasing size and
 * increasing opacity — a stepped falloff that reads as a soft radial glow
 * instead of the hard-edged disc a single solid circle produces.
 */
export function HeroCard({ children, style }: HeroCardProps) {
  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientEnd]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.hero, style]}
    >
      <View pointerEvents="none" style={styles.glowWrap}>
        <View style={[styles.glowRing, styles.glowOuter]} />
        <View style={[styles.glowRing, styles.glowMid]} />
        <View style={[styles.glowRing, styles.glowInner]} />
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.cardLarge,
    padding: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  glowWrap: {
    position: 'absolute',
    right: -60,
    top: -70,
    width: 230,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: colors.heroGlow,
  },
  glowOuter: {
    width: 230,
    height: 230,
    borderRadius: 115,
    opacity: 0.14,
  },
  glowMid: {
    width: 170,
    height: 170,
    borderRadius: 85,
    opacity: 0.2,
  },
  glowInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.28,
  },
});

export default HeroCard;

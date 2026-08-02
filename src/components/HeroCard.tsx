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
 * approximated with a large circular view using a solid, low-opacity
 * violet fill — visually equivalent at the sizes this renders at, even
 * though it isn't a true radial falloff.
 */
export function HeroCard({ children, style }: HeroCardProps) {
  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientEnd]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.hero, style]}
    >
      <View pointerEvents="none" style={styles.glow} />
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
  glow: {
    position: 'absolute',
    right: -60,
    top: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.heroGlow,
    opacity: 0.5,
  },
});

export default HeroCard;

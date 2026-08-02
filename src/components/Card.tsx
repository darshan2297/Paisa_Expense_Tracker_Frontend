import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

export type CardProps = ViewProps & {
  /** Use the larger radius for hero/feature cards. Defaults to the standard card radius. */
  size?: 'default' | 'large';
};

/**
 * Base surface container used across the app — dashboard tiles, list rows,
 * form sections, etc. Keep this dumb (no business logic); it only owns
 * layout/visual styling from the design language.
 */
export function Card({ size = 'default', style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.base, size === 'large' ? styles.large : styles.default, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  default: {
    borderRadius: radius.card,
  },
  large: {
    borderRadius: radius.cardLarge,
  },
});

export default Card;

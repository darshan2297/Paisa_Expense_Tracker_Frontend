import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { radius } from '@/theme/spacing';

export type IconChipProps = {
  /** Feather icon name — the mockup uses Feather/Lucide-style outline icons throughout. */
  name: keyof typeof Feather.glyphMap;
  /** Chip background tint, e.g. `colors.successTint`. */
  background: string;
  /** Icon stroke color, e.g. `colors.success`. */
  color: string;
  /** Chip is a square of this size (width = height). Defaults to 38, the size used everywhere in the mockup. */
  size?: number;
};

/**
 * Small colored square ("chip") behind an outline icon — used for quick-link
 * cards (Security & privacy, Lock the app), category dots, and KPI-tile
 * icons throughout the mockup. Always a squircle (`radius.chip`), never a
 * true circle.
 */
export function IconChip({ name, background, color, size = 38 }: IconChipProps) {
  return (
    <View
      style={[
        styles.chip,
        { width: size, height: size, backgroundColor: background, borderRadius: radius.chip },
      ]}
    >
      <Feather name={name} size={Math.round(size * 0.47)} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconChip;

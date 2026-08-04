import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Category } from '@/features/categories/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

export type CategoryPickerVariant = 'dot' | 'solid';

export type CategoryPickerProps = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
  /** `solid` matches the mockup Add Transaction chips (filled color when selected). */
  variant?: CategoryPickerVariant;
};

/**
 * Wrapping grid of category chips (dot + name), used by the Add
 * Transaction/Commitment forms - the mockup's category picker, adapted to a
 * tap-to-select grid since mobile has no hover state to lean on.
 */
export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  variant = 'dot',
}: CategoryPickerProps) {
  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const selected = category.id === selectedId;
        const solid = variant === 'solid';
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category)}
            style={[
              solid ? styles.solidChip : styles.chip,
              solid
                ? {
                    borderColor: selected ? category.color : colors.border,
                    backgroundColor: selected ? category.color : colors.surfaceSubtle,
                  }
                : {
                    borderColor: selected ? category.color : colors.border,
                    backgroundColor: selected ? `${category.color}1F` : colors.surfaceSubtle,
                  },
            ]}
          >
            {!solid ? <View style={[styles.dot, { backgroundColor: category.color }]} /> : null}
            <Text
              style={[
                solid ? styles.solidLabel : styles.label,
                solid && selected && styles.solidLabelSelected,
              ]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 36,
    paddingHorizontal: 13,
    borderRadius: radius.tileSmall,
    borderWidth: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  solidChip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  solidLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  solidLabelSelected: {
    color: colors.surface,
  },
});

export default CategoryPicker;

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Category } from '@/features/categories/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

export type CategoryPickerProps = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
};

/**
 * Wrapping grid of category chips (dot + name), used by the Add
 * Transaction/Commitment forms - the mockup's category picker, adapted to a
 * tap-to-select grid since mobile has no hover state to lean on.
 */
export function CategoryPicker({ categories, selectedId, onSelect }: CategoryPickerProps) {
  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category)}
            style={[
              styles.chip,
              { borderColor: selected ? category.color : colors.border },
              selected && { backgroundColor: `${category.color}1F` },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: category.color }]} />
            <Text style={styles.label} numberOfLines={1}>
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
    gap: spacing.sm,
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
});

export default CategoryPicker;

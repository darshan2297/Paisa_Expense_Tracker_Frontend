import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import type { LifeMetric } from '@/mock/dashboard';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';

type LifeMetricsGridProps = {
  tiles: LifeMetric[];
};

export function LifeMetricsGrid({ tiles }: LifeMetricsGridProps) {
  const { gridColumns } = useResponsiveLayout();
  const cols = gridColumns(4, 2, 2);

  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <View
          key={tile.label}
          style={[styles.cell, cols === 4 && styles.cellQuarter, cols === 2 && styles.cellHalf]}
        >
          <Card style={styles.tile}>
            <Text style={styles.label}>{tile.label}</Text>
            <Text style={[styles.value, moneyTextStyle, { color: tile.color }]}>{tile.value}</Text>
            <Text style={styles.sub}>{tile.sub}</Text>
          </Card>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cell: {
    minWidth: 0,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  cellQuarter: {
    width: '25%',
  },
  cellHalf: {
    width: '50%',
  },
  tile: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 6,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textLabel,
  },
  value: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    letterSpacing: -0.88,
  },
  sub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
    marginTop: spacing.xs,
  },
});

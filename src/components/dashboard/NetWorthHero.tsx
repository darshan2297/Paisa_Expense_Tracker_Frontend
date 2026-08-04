import { StyleSheet, Text, View } from 'react-native';

import { HeroCard } from '@/components/HeroCard';
import type { NetWorthPart } from '@/features/dashboard/types';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';

type NetWorthHeroProps = {
  netWorth: string;
  delta: string;
  deltaPositive: boolean;
  parts: NetWorthPart[];
};

export function NetWorthHero({ netWorth, delta, deltaPositive, parts }: NetWorthHeroProps) {
  const { gridColumns } = useResponsiveLayout();
  const partCols = gridColumns(2, 2, 2);
  const partWidth = `${100 / partCols}%` as `${number}%`;

  return (
    <HeroCard style={styles.hero}>
      <Text style={styles.eyebrow}>Total net worth</Text>
      <Text style={[styles.value, moneyTextStyle]}>{netWorth}</Text>
      <Text style={[styles.delta, { color: deltaPositive ? '#8FE0BE' : colors.heroDanger }]}>
        {deltaPositive ? '▲ ' : '▼ '}
        {delta}
      </Text>

      <View style={styles.partsGrid}>
        {parts.map((part) => (
          <View key={part.label} style={[styles.partCell, { width: partWidth }]}>
            <View style={styles.partTile}>
              <View style={styles.partHeader}>
                <View style={[styles.dot, { backgroundColor: part.color }]} />
                <Text style={styles.partLabel}>{part.label}</Text>
              </View>
              <Text style={[styles.partValue, moneyTextStyle]}>{part.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: 26,
    paddingHorizontal: 26,
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: colors.heroTextEyebrow,
  },
  value: {
    fontFamily: fontFamily.extrabold,
    fontSize: 44,
    color: colors.heroText,
    marginTop: spacing.sm,
    letterSpacing: -2.2,
  },
  delta: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    marginTop: 6,
  },
  partsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 11,
    marginHorizontal: -5.5,
    marginTop: spacing.xxl,
  },
  partCell: {
    paddingHorizontal: 5.5,
    minWidth: 0,
  },
  partTile: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.tileSmall,
    backgroundColor: colors.heroSurfaceSubtle,
    minWidth: 0,
  },
  partHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 3,
  },
  partLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: 'rgba(252,250,247,.55)',
  },
  partValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 17,
    color: colors.heroText,
    marginTop: 4,
    letterSpacing: -0.6,
  },
});

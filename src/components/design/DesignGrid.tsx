import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

type DesignGridProps = PropsWithChildren<{
  /** Desktop column count. */
  cols: number;
  /** Tablet/mobile column count (defaults to min(cols, 2)). */
  tabletCols?: number;
  /** Narrow column count (defaults to 1). */
  narrowCols?: number;
  style?: ViewStyle;
}>;

/** Responsive CSS-grid equivalent from the design HTML (`grid3`, `grid4`, etc.). */
export function DesignGrid({ cols, tabletCols, narrowCols = 1, style, children }: DesignGridProps) {
  const { gridColumns } = useResponsiveLayout();
  const active = gridColumns(cols, tabletCols ?? Math.min(cols, 2), narrowCols);
  const width = `${100 / active}%` as `${number}%`;

  return (
    <View style={[styles.grid, style]}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <View key={i} style={[styles.cell, { width }]}>
              {child}
            </View>
          ))
        : children}
    </View>
  );
}

/** Two-column layout with 1.3:1 ratio on desktop (`grid2Lead`). */
export function DesignGridLead({
  lead,
  side,
  stackOnMobile = true,
}: {
  lead: React.ReactNode;
  side: React.ReactNode;
  stackOnMobile?: boolean;
}) {
  const { isMobile } = useResponsiveLayout();
  const stack = stackOnMobile && isMobile;

  return (
    <View style={[styles.leadRow, stack && styles.leadStack]}>
      <View style={[styles.leadMain, stack && styles.leadFull]}>{lead}</View>
      <View style={[styles.leadSide, stack && styles.leadFull]}>{side}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -7,
  },
  cell: {
    paddingHorizontal: 7,
    marginBottom: 14,
    minWidth: 0,
  },
  leadRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  leadStack: {
    flexDirection: 'column',
  },
  leadMain: {
    flex: 1.3,
    minWidth: 0,
  },
  leadSide: {
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  leadFull: {
    flex: undefined,
    width: '100%',
  },
});

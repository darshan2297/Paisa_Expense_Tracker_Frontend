import { Platform, useWindowDimensions } from 'react-native';

/** Breakpoints ported from the design HTML (`mob = width < 900`, `narrow = width < 620`). */
const MOBILE_BREAKPOINT = 900;
const NARROW_BREAKPOINT = 620;

export type ResponsiveLayout = {
  width: number;
  /** True when viewport is below 900px (mobile layout). */
  isMobile: boolean;
  /** True when viewport is below 620px (single-column stacks). */
  isNarrow: boolean;
  /** Desktop web: sidebar shell, hidden bottom tabs. */
  isDesktopWeb: boolean;
  /** Native iOS/Android — always use bottom tab navigation. */
  isNative: boolean;
  gridColumns: (desktop: number, tablet?: number, phone?: number) => number;
};

export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const isNarrow = width < NARROW_BREAKPOINT;
  const isNative = Platform.OS !== 'web';
  const isDesktopWeb = Platform.OS === 'web' && !isMobile;

  const gridColumns = (desktop: number, tablet = 2, phone = 1) => {
    if (isNarrow) return phone;
    if (isMobile) return tablet;
    return desktop;
  };

  return {
    width,
    isMobile,
    isNarrow,
    isDesktopWeb,
    isNative,
    gridColumns,
  };
}

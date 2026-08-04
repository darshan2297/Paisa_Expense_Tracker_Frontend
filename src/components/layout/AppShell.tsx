import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Sidebar } from '@/components/layout/Sidebar';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';

/**
 * Responsive app chrome.
 *
 * - Desktop web (≥900px): left sidebar + main content (design HTML layout).
 * - Mobile web + native: main content only; bottom tabs handle navigation.
 */
export function AppShell({ children }: PropsWithChildren) {
  const { isDesktopWeb } = useResponsiveLayout();

  if (!isDesktopWeb) {
    return <View style={styles.mobileRoot}>{children}</View>;
  }

  return (
    <View style={styles.desktopRoot}>
      <Sidebar />
      <View style={styles.main}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg,
    // Bound the shell to the viewport so the sidebar nav can scroll
    // (mockup: sticky sidebar at height 100vh with overflow-y: auto).
    height: '100%',
    maxHeight: '100%',
    minHeight: '100%',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    backgroundColor: colors.bg,
  },
});

export default AppShell;

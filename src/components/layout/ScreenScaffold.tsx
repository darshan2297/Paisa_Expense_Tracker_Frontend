import type { PropsWithChildren, ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MobileNavPills } from '@/components/layout/MobileNavPills';
import { PageHeader } from '@/components/layout/PageHeader';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';

type ScreenScaffoldProps = PropsWithChildren<{
  month: string;
  onMonthChange: (month: string) => void;
  onAddTransaction?: () => void;
  /** Optional content above the scroll area (e.g. budget alert). */
  headerExtra?: ReactNode;
  showMonthControls?: boolean;
}>;

function defaultAddTransaction() {
  router.push({ pathname: '/(tabs)/transactions', params: { openAdd: '1' } });
}

/**
 * Shared page chrome from the design HTML: header, optional mobile nav pills,
 * responsive padding. Every routed screen uses this wrapper.
 */
export function ScreenScaffold({
  month,
  onMonthChange,
  onAddTransaction,
  headerExtra,
  showMonthControls = true,
  children,
}: ScreenScaffoldProps) {
  const { isDesktopWeb, isMobile } = useResponsiveLayout();
  const pad = isDesktopWeb
    ? { paddingHorizontal: 32, paddingTop: 26, paddingBottom: 60 }
    : { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 48 };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, pad]}
        showsVerticalScrollIndicator
        showsHorizontalScrollIndicator
        {...(Platform.OS === 'web' ? ({ className: 'paisa-thin-scroll' } as object) : null)}
      >
        {showMonthControls ? (
          <PageHeader
            month={month}
            onMonthChange={onMonthChange}
            onAddTransaction={onAddTransaction ?? defaultAddTransaction}
          />
        ) : null}
        {isMobile ? <MobileNavPills /> : null}
        {headerExtra}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    gap: 18,
  },
  body: {
    gap: 14,
  },
});

export default ScreenScaffold;

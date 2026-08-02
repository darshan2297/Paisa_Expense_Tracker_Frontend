import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

type QueryBoundaryProps = {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
};

/**
 * Wraps TanStack Query screens so a failed API call shows a retry panel
 * instead of an infinite spinner (`!data` alone is not a loading signal).
 */
export function QueryBoundary({
  isLoading,
  isError,
  errorMessage,
  onRetry,
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load data</Text>
        <Text style={styles.errorBody}>
          {errorMessage ??
            'Check that the backend is running on port 8001 and EXPO_PUBLIC_API_URL is set correctly.'}
        </Text>
        {onRetry ? <Button label="Try again" onPress={onRetry} style={styles.retryButton} /> : null}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorBody: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.sm,
    minWidth: 160,
  },
});

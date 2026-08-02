import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

/**
 * Placeholder screen. Real login form (React Hook Form + API call) is
 * wired in a later phase — this only exists so the (auth) route group and
 * navigation shell are in place.
 */
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.note}>Wired in a later phase.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    padding: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
});

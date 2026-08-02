import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
    gap: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  link: {
    paddingVertical: spacing.md,
  },
  linkText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
});

import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

import { OnboardingSteps, type OnboardingStep } from './OnboardingSteps';

const CONTENT_MAX_WIDTH = 360;

export type OnboardingScreenProps = {
  title: string;
  subtitle: string;
  step?: OnboardingStep;
  children: ReactNode;
};

/**
 * Shared chrome for the Account → PIN → Biometrics flow: violet-to-black
 * backdrop, brand mark, headline, optional step rail, then screen body.
 */
export function OnboardingScreen({ title, subtitle, step, children }: OnboardingScreenProps) {
  return (
    <LinearGradient
      colors={[colors.authGradientStart, colors.authGradientMid, colors.authGradientEnd]}
      locations={[0, 0.42, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.screen}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.safeArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.column}>
              <View style={styles.header}>
                <LinearGradient
                  colors={[colors.brandGradientStart, colors.brandGradientEnd]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.logo}
                >
                  <Feather name="trending-up" size={20} color={colors.heroText} />
                </LinearGradient>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              {step ? <OnboardingSteps current={step} /> : null}

              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  column: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.authGlow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.lg,
    color: colors.heroText,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.heroTextMuted,
    textAlign: 'center',
  },
});

export default OnboardingScreen;

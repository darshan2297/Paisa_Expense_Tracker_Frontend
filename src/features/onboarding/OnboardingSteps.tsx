import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ONBOARDING_STEPS = ['account', 'pin', 'biometrics'] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

const STEP_LABELS: Record<OnboardingStep, string> = {
  account: 'Account',
  pin: 'PIN',
  biometrics: 'Biometrics',
};

export type OnboardingStepsProps = {
  current: OnboardingStep;
};

/**
 * The three-segment rail above the onboarding forms: a thin track per step
 * with an uppercase caption underneath, the current one lit violet.
 */
export function OnboardingSteps({ current }: OnboardingStepsProps) {
  const currentIndex = ONBOARDING_STEPS.indexOf(current);

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentIndex + 1} of ${ONBOARDING_STEPS.length}: ${STEP_LABELS[current]}`}
    >
      {ONBOARDING_STEPS.map((step) => {
        const isCurrent = step === current;
        return (
          <View key={step} style={styles.step}>
            <View style={[styles.track, isCurrent && styles.trackCurrent]} />
            <Text style={[styles.label, isCurrent && styles.labelCurrent]}>
              {STEP_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  step: {
    flex: 1,
    gap: 9,
  },
  track: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.authStepTrack,
  },
  trackCurrent: {
    backgroundColor: colors.authStepActive,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.heroTextFaint,
  },
  labelCurrent: {
    color: colors.heroText,
  },
});

export default OnboardingSteps;

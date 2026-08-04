import type { ReactNode } from 'react';

import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import type { OnboardingStep } from '@/features/onboarding/OnboardingSteps';

export type AuthScreenProps = {
  title: string;
  subtitle: string;
  /** Shown on the register screen only — login omits the step rail. */
  step?: OnboardingStep;
  children: ReactNode;
};

/** Auth screens reuse the onboarding chrome (dark gradient + brand mark). */
export function AuthScreen({ title, subtitle, step, children }: AuthScreenProps) {
  return (
    <OnboardingScreen title={title} subtitle={subtitle} step={step}>
      {children}
    </OnboardingScreen>
  );
}

export default AuthScreen;

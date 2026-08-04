import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

/** Resume PIN setup when the user returns mid-onboarding (e.g. after closing the app). */
export default function OnboardingScreen() {
  return <OnboardingFlow initialStep="pin-create" authMode="signin" />;
}

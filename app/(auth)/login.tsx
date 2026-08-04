import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

/** Sign-in — enters the app when a device PIN already exists; otherwise PIN setup. */
export default function LoginScreen() {
  return <OnboardingFlow authMode="signin" initialStep="account" />;
}

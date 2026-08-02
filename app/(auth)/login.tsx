import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

/** Sign-in — after login, PIN + biometrics continue on the same screen. */
export default function LoginScreen() {
  return <OnboardingFlow authMode="signin" initialStep="account" />;
}

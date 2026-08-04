import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';

/** One-time bootstrap registration — full Account → PIN → Biometrics on one screen. */
export default function RegisterScreen() {
  return <OnboardingFlow authMode="register" initialStep="account" />;
}

import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { setPin } from '@/features/appLock/pin';
import type { AuthMode } from '@/features/auth/components/AuthModeToggle';
import { AccountStepForm } from '@/features/onboarding/AccountStepForm';
import { BiometricStepForm } from '@/features/onboarding/BiometricStepForm';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import type { OnboardingStep } from '@/features/onboarding/OnboardingSteps';
import { PinEntryForm } from '@/features/onboarding/PinEntryForm';
import { useAppLockStore } from '@/stores/appLockStore';
import { useOnboardingFlowStore } from '@/stores/onboardingFlowStore';

type FlowStep = 'account' | 'pin-create' | 'pin-confirm' | 'biometrics';

type StepMeta = {
  title: string;
  subtitle: string;
  rail: OnboardingStep;
};

const STEP_META: Record<FlowStep, StepMeta> = {
  account: {
    title: 'Create your Paisa account',
    subtitle: 'Your email and password recover the account.\nEverything else stays on this device.',
    rail: 'account',
  },
  'pin-create': {
    title: 'Set your app PIN',
    subtitle: "Six digits. You'll need this every time you open Paisa.",
    rail: 'pin',
  },
  'pin-confirm': {
    title: 'Confirm your PIN',
    subtitle: 'Type the same six digits once more.',
    rail: 'pin',
  },
  biometrics: {
    title: 'Add a faster unlock',
    subtitle: 'Fingerprint and Face ID are optional — the PIN always works.',
    rail: 'biometrics',
  },
};

const LOGIN_ACCOUNT_META: StepMeta = {
  title: 'Welcome back to Paisa',
  subtitle: 'Sign in to restore access on this device.\nYour data stays where you left it.',
  rail: 'account',
};

export type OnboardingFlowProps = {
  /** Which form to show first. Use `pin-create` when resuming after login. */
  initialStep?: FlowStep;
  /** Only used when `initialStep` is `account`. */
  authMode?: AuthMode;
};

/**
 * Single-screen onboarding: Account → PIN → Confirm PIN → Biometrics.
 * Only the form body swaps — the gradient backdrop, logo, headline and
 * step rail stay put, matching the mockup.
 */
export function OnboardingFlow({
  initialStep = 'account',
  authMode = 'register',
}: OnboardingFlowProps) {
  const [step, setStep] = useState<FlowStep>(initialStep);
  const [pendingPin, setPendingPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinFormKey, setPinFormKey] = useState(0);
  const setHasPinConfigured = useAppLockStore((state) => state.setHasPinConfigured);
  const setInProgress = useOnboardingFlowStore((state) => state.setInProgress);

  useEffect(() => {
    if (step !== 'account') {
      setInProgress(true);
    }
  }, [step, setInProgress]);

  useEffect(() => {
    if (initialStep !== 'account') {
      setInProgress(true);
    }
  }, [initialStep, setInProgress]);

  function goToPinCreate() {
    setStep('pin-create');
    setInProgress(true);
  }

  function onPinCreated(pin: string) {
    setPendingPin(pin);
    setPinError(null);
    setPinFormKey((key) => key + 1);
    setStep('pin-confirm');
  }

  async function onPinConfirmed(pin: string) {
    if (!pendingPin) {
      setStep('pin-create');
      return;
    }

    if (pin !== pendingPin) {
      setPinError('PINs did not match. Start again.');
      setPendingPin(null);
      setPinFormKey((key) => key + 1);
      setTimeout(() => {
        setPinError(null);
        setStep('pin-create');
      }, 1200);
      return;
    }

    await setPin(pin);
    setPendingPin(null);
    setHasPinConfigured(true);
    setPinFormKey((key) => key + 1);
    setStep('biometrics');
  }

  const meta = step === 'account' && authMode === 'signin' ? LOGIN_ACCOUNT_META : STEP_META[step];
  const showStepRail = step !== 'account' || authMode === 'register';

  return (
    <OnboardingScreen
      step={showStepRail ? meta.rail : undefined}
      title={meta.title}
      subtitle={meta.subtitle}
    >
      {step === 'account' ? (
        <AccountStepForm mode={authMode} onAuthenticated={goToPinCreate} />
      ) : null}

      {step === 'pin-create' ? (
        <PinEntryForm key={`create-${pinFormKey}`} onComplete={onPinCreated} error={pinError} />
      ) : null}

      {step === 'pin-confirm' ? (
        <PinEntryForm key={`confirm-${pinFormKey}`} onComplete={onPinConfirmed} error={pinError} />
      ) : null}

      {step === 'biometrics' ? (
        <BiometricStepForm onFinished={() => router.replace('/(tabs)')} />
      ) : null}
    </OnboardingScreen>
  );
}

export default OnboardingFlow;

import { create } from 'zustand';

/**
 * Tracks whether the user is mid Account → PIN → Biometrics on a single
 * screen. The auth guard uses this so it doesn't redirect to /(tabs) the
 * moment a PIN is saved but before the optional biometric step finishes.
 */
export type OnboardingFlowStore = {
  inProgress: boolean;
  setInProgress: (inProgress: boolean) => void;
};

export const useOnboardingFlowStore = create<OnboardingFlowStore>((set) => ({
  inProgress: false,
  setInProgress: (inProgress) => set({ inProgress }),
}));

export default useOnboardingFlowStore;

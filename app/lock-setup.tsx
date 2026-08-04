import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { PinSetupFlow } from '@/features/appLock/PinSetupFlow';
import { PinVerifyStep } from '@/features/appLock/PinVerifyStep';
import { markAppUnlocked } from '@/features/appLock/unlockSession';
import { useAppLockStore } from '@/stores/appLockStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/**
 * Pushed from Profile's "Change PIN" / Security lock setup. Dark background
 * to match the app-lock screen. Changing an existing PIN requires proving
 * the current one first; the new PIN is written to the account and this device.
 */
export default function LockSetupScreen() {
  const hasPinConfigured = useAppLockStore((state) => state.hasPinConfigured);
  const setHasPinConfigured = useAppLockStore((state) => state.setHasPinConfigured);
  const [verifiedCurrentPin, setVerifiedCurrentPin] = useState<string | null>(null);
  const needsVerify = hasPinConfigured && verifiedCurrentPin === null;

  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientEnd]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.screen}
    >
      {!needsVerify ? (
        <PinSetupFlow
          mode={hasPinConfigured || verifiedCurrentPin ? 'change' : 'create'}
          currentPin={verifiedCurrentPin ?? undefined}
          onComplete={() => {
            setHasPinConfigured(true);
            markAppUnlocked();
            router.back();
          }}
        />
      ) : (
        <PinVerifyStep
          title="Confirm your current PIN"
          subtitle="Enter it once more before choosing a new one."
          onVerified={(pin) => setVerifiedCurrentPin(pin)}
          onCancel={() => router.back()}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});

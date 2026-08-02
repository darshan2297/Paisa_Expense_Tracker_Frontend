import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { PinSetupFlow } from '@/features/appLock/PinSetupFlow';
import { useAppLockStore } from '@/stores/appLockStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/**
 * Pushed from Profile's "Lock the app" quick-link (app/(tabs)/profile.tsx)
 * to set up or change the PIN. Dark background to match the app-lock
 * screen this PIN is used for. See app/onboarding/pin.tsx for the
 * mandatory first-run version of this same flow.
 */
export default function LockSetupScreen() {
  const setHasPinConfigured = useAppLockStore((state) => state.setHasPinConfigured);

  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientEnd]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.screen}
    >
      <PinSetupFlow
        onComplete={() => {
          setHasPinConfigured(true);
          router.back();
        }}
      />
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

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/**
 * Whether this device has biometric hardware AND at least one biometric
 * enrolled. `expo-local-authentication` has no web implementation, so this
 * always resolves false there — the Fingerprint/Face ID tabs disable
 * themselves on web rather than throwing (see AppLockScreen).
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    disableDeviceFallback: true, // the app's own Password tab is the fallback, not the OS passcode screen
  });
  return result.success;
}

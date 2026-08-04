import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { clearPin, hasPinConfigured } from './pin';

/**
 * iOS Keychain (what `expo-secure-store` wraps on native) survives app
 * deletion by default — unlike Android's Keystore-backed storage, which is
 * cleared on uninstall. That means a fresh iOS install can find a PIN hash
 * left over from a *previous* install of the app, which would silently gate
 * the new install behind a PIN the current user never set and may not know.
 *
 * `AsyncStorage` on iOS is backed by a file under the app's sandboxed
 * container, which genuinely is removed on uninstall — so it doubles as a
 * "has this specific install run before" marker. If SecureStore has a PIN
 * but this marker is missing, that PIN is stale Keychain data from a prior
 * install and must be cleared before the app treats the device as locked.
 *
 * No-op on Android/web: Android's SecureStore backing is already cleared on
 * uninstall, and web has no SecureStore/Keychain concept at all.
 */
const INSTALL_MARKER_KEY = 'paisa.appLock.installMarker';

export async function clearStaleKeychainFromPriorInstall(): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }
  try {
    const markerPresent = (await AsyncStorage.getItem(INSTALL_MARKER_KEY)) !== null;
    if (!markerPresent) {
      if (await hasPinConfigured()) {
        await clearPin();
      }
      await AsyncStorage.setItem(INSTALL_MARKER_KEY, '1');
    }
  } catch {
    // Best-effort: if AsyncStorage itself is unavailable, leave SecureStore
    // untouched rather than risk wiping a legitimate PIN on a false positive.
  }
}

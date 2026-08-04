import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Cross-platform key/value storage for small sensitive values (auth
 * tokens). `expo-secure-store` wraps the OS keychain on iOS/Android but has
 * no web implementation (calling it on web throws - there is no OS-level
 * secure storage in a browser to wrap). Falls back to AsyncStorage on web,
 * which is the standard, documented pattern for Expo apps that target web
 * alongside native - see docs/COMPONENT_GUIDE.md.
 *
 * This is not a substitute for real secrecy on web (browser storage is
 * inherently less protected than a native keychain) - it's the least-bad
 * option available in a browser, same tradeoff every web app storing a
 * bearer token makes.
 */
async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const secureStorage = { getItem, setItem, deleteItem };

export default secureStorage;

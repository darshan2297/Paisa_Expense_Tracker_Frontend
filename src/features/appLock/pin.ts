import * as Crypto from 'expo-crypto';

import { secureStorage } from '@/utils/secureStorage';

const PIN_HASH_KEY = 'paisa.appLock.pinHash';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function hasPinConfigured(): Promise<boolean> {
  return (await secureStorage.getItem(PIN_HASH_KEY)) !== null;
}

export async function setPin(pin: string): Promise<void> {
  await secureStorage.setItem(PIN_HASH_KEY, await hashPin(pin));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = await secureStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) {
    return false;
  }
  return (await hashPin(pin)) === storedHash;
}

export async function clearPin(): Promise<void> {
  await secureStorage.deleteItem(PIN_HASH_KEY);
}

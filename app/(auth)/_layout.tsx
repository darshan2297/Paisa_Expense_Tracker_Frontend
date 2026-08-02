import { Stack } from 'expo-router';

/**
 * Auth stack (login/register). Exists as its own layout so the root layout's
 * `<Stack.Screen name="(auth)" />` resolves to a real route group instead of
 * two orphaned leaf routes — without this file, Expo Router hoists
 * `(auth)/login` and `(auth)/register` to the top level and warns that no
 * route named "(auth)" exists.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

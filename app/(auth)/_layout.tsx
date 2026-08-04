import { Stack } from 'expo-router';

/**
 * Auth stack (login/register). Explicit screens so Expo Router on web always
 * mounts the active auth route instead of rendering a blank stack.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
    </Stack>
  );
}

import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/theme/colors';

/**
 * Bottom tab navigator. Only "Home" exists for now — more tabs (e.g.
 * Transactions, Budgets, Profile) are added as their features land.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⌂</Text>,
        }}
      />
    </Tabs>
  );
}

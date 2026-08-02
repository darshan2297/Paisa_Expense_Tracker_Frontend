import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/theme/colors';

/**
 * Bottom tab navigator. Only "Home" and "Profile" exist for now — more tabs
 * (Transactions, Budgets, ...) are added as their features land.
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
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>☺</Text>,
        }}
      />
    </Tabs>
  );
}

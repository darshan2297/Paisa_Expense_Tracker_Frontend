import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

/**
 * Bottom tab navigator — icons are Feather outline strokes to match the mockup.
 */
export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
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
            tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color, size }) => <Feather name="list" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="planned"
          options={{
            title: 'Planned',
            tabBarIcon: ({ color, size }) => <Feather name="target" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="wealth"
          options={{
            title: 'Wealth',
            tabBarIcon: ({ color, size }) => (
              <Feather name="credit-card" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

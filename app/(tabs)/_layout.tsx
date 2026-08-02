import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppShell } from '@/components/layout/AppShell';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';

const HIDDEN_SCREENS = [
  'overview',
  'bills',
  'calendar',
  'people',
  'shared',
  'cards',
  'emergency',
  'policy',
  'networth',
  'assets',
  'loans',
  'health',
  'insights',
  'heatmap',
  'review',
  'timeline',
  'reports',
] as const;

/**
 * Tab navigator — bottom tabs for 5 primary mobile routes; AppShell adds
 * desktop sidebar. Daily + Plan module hidden routes registered through branch 4.
 */
export default function TabsLayout() {
  const { isDesktopWeb } = useResponsiveLayout();

  return (
    <AppShell>
      <SafeAreaView style={styles.safe} edges={isDesktopWeb ? [] : ['bottom']}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: isDesktopWeb
              ? { display: 'none' }
              : {
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
          {HIDDEN_SCREENS.map((name) => (
            <Tabs.Screen key={name} name={name} options={{ href: null }} />
          ))}
        </Tabs>
      </SafeAreaView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});

import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { FLAT_NAV, type NavItemId } from '@/navigation/navConfig';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

/** Horizontal scroll nav pills — design HTML `mobileNavDisplay`. */
export function MobileNavPills() {
  const pathname = usePathname();

  const activeId = (): NavItemId => {
    if (pathname.includes('overview')) return 'overview';
    if (pathname.includes('transactions')) return 'transactions';
    if (pathname.includes('bills')) return 'bills';
    if (pathname.includes('calendar')) return 'calendar';
    if (pathname.includes('people')) return 'people';
    if (pathname.includes('shared')) return 'shared';
    if (pathname.includes('cards')) return 'cards';
    if (pathname.includes('planned')) return 'planned';
    if (pathname.includes('wealth')) return 'wealth';
    if (pathname.includes('emergency')) return 'emergency';
    if (pathname.includes('policy')) return 'policy';
    if (pathname.includes('networth')) return 'networth';
    if (pathname.includes('assets')) return 'assets';
    if (pathname.includes('loans')) return 'loans';
    if (pathname.includes('health')) return 'health';
    if (pathname.includes('insights')) return 'insights';
    if (pathname.includes('heatmap')) return 'heatmap';
    if (pathname.includes('review')) return 'review';
    if (pathname.includes('timeline')) return 'timeline';
    if (pathname.includes('reports')) return 'reports';
    if (pathname.includes('scanner')) return 'scanner';
    if (pathname.includes('import')) return 'import';
    if (pathname.includes('security')) return 'security';
    if (pathname.includes('profile')) return 'profile';
    return 'life';
  };

  const current = activeId();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {FLAT_NAV.map((item) => {
        const on = item.id === current;
        return (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.href as never)}
            style={[
              styles.pill,
              {
                backgroundColor: on ? colors.textPrimary : colors.surface,
                borderColor: on ? colors.textPrimary : colors.border,
              },
            ]}
          >
            <Feather name={item.icon} size={15} color={on ? colors.heroText : colors.textMuted} />
            <Text style={[styles.pillLabel, { color: on ? colors.heroText : colors.textMuted }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -14,
  },
  row: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 99,
    borderWidth: 1,
  },
  pillLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
  },
});

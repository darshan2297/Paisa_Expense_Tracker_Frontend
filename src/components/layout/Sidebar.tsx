import { Feather } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandMark, BrandWordmark } from '@/components/layout/BrandMark';
import { useLifeDashboard } from '@/features/dashboard/hooks';
import { activeNavIdFromSegment, NAV_GROUPS, type NavItem } from '@/navigation/navConfig';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { compactINR } from '@/utils/currency';

type SidebarProps = {
  onNavigate?: () => void;
};

function NavButton({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        active && styles.navItemActive,
        pressed && styles.navItemPressed,
      ]}
    >
      <Feather name={item.icon} size={17} color={active ? colors.accentHover : colors.textMuted} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
        {item.label}
      </Text>
      {item.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const segments = useSegments();
  const tabSegment = segments[1] as string | undefined;
  const activeId = activeNavIdFromSegment(tabSegment);
  const { data } = useLifeDashboard();

  const budgetBarColor = data.budgetOver
    ? '#EF6B4E'
    : data.budgetUsedPct > 80
      ? colors.warning
      : colors.brandGradientStart;

  const go = (item: NavItem) => {
    router.push(item.href as never);
    onNavigate?.();
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <BrandMark />
        <BrandWordmark />
      </View>

      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        {NAV_GROUPS.map((group) => (
          <View key={group.title} style={styles.navGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={activeId === item.id}
                onPress={() => go(item)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <BudgetWidget
          budgetLeft={data.budgetLeft}
          budgetNote={data.budgetNote}
          budgetUsedPct={Math.min(100, data.budgetUsedPct)}
          barColor={budgetBarColor}
          onEdit={() => router.push('/(tabs)/planned')}
        />

        <View style={styles.profileRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => [styles.profileButton, pressed && styles.navItemPressed]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.userInitials}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName} numberOfLines={1}>
                {data.userName}
              </Text>
              <Text style={styles.profileSub}>Net worth {data.netWorth}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
            accessibilityLabel="Log out"
          >
            <Feather name="log-out" size={15} color={colors.textLabel} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function BudgetWidget({
  budgetLeft,
  budgetNote,
  budgetUsedPct,
  barColor,
  onEdit,
}: {
  budgetLeft: number;
  budgetNote: string;
  budgetUsedPct: number;
  barColor: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetEyebrow}>Budget left</Text>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={styles.budgetEdit}>edit</Text>
        </Pressable>
      </View>
      <Text style={[styles.budgetValue, moneyTextStyle, budgetLeft < 0 && styles.budgetOver]}>
        {budgetLeft < 0 ? '−' : ''}
        {compactINR(Math.abs(budgetLeft))}
      </Text>
      <View style={styles.budgetTrack}>
        <View
          style={[styles.budgetFill, { width: `${budgetUsedPct}%`, backgroundColor: barColor }]}
        />
      </View>
      <Text style={styles.budgetNote}>{budgetNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 246,
    flexShrink: 0,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: 26,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: spacing.sm,
  },
  navScroll: {
    flex: 1,
  },
  navGroup: {
    gap: 3,
    marginBottom: spacing.lg,
  },
  groupTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: '#B5AEA4',
    paddingHorizontal: spacing.md,
    paddingBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.tileSmall - 2,
  },
  navItemActive: {
    backgroundColor: '#F0EEFC',
  },
  navItemPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  navLabel: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    letterSpacing: -0.14,
    color: colors.textMuted,
  },
  navLabelActive: {
    color: colors.accentHover,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: '#EF6B4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    color: colors.heroText,
  },
  footer: {
    gap: spacing.md,
  },
  budgetCard: {
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: '#F1EFFE',
    borderWidth: 1,
    borderColor: '#E4E1F6',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
    color: '#7A73B8',
  },
  budgetEdit: {
    marginLeft: 'auto',
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#9791BE',
  },
  budgetValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    letterSpacing: -0.77,
    color: colors.textPrimary,
    marginTop: 6,
  },
  budgetOver: {
    color: colors.dangerValue,
  },
  budgetTrack: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(91,84,214,.14)',
    marginTop: 11,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  budgetNote: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: '#8B85A8',
    marginTop: spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.chip,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#EDE7DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 12,
    color: colors.textMuted,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  profileName: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: '#3D382F',
  },
  profileSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textCaption,
  },
  logout: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutPressed: {
    backgroundColor: colors.dangerTint,
    borderColor: colors.dangerTintBorder,
  },
});

export default Sidebar;

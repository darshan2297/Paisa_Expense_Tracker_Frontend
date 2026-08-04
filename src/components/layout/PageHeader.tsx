import { Feather } from '@expo/vector-icons';
import { useSegments } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/layout/BrandMark';
import { NotificationsPanel } from '@/components/layout/NotificationsPanel';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { useLifeDashboard } from '@/features/dashboard/hooks';
import { emptyLifeDashboard } from '@/features/dashboard/mapLifeDashboard';
import { useNotifications } from '@/features/notifications/hooks';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { pageMetaForSegment } from '@/navigation/navConfig';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

type PageHeaderProps = {
  month: string;
  onMonthChange: (month: string) => void;
  onAddTransaction?: () => void;
};

export function PageHeader({ month, onMonthChange, onAddTransaction }: PageHeaderProps) {
  const segments = useSegments();
  const tabSegment = segments[1] as string | undefined;
  const meta = pageMetaForSegment(tabSegment);
  const { isMobile, isDesktopWeb } = useResponsiveLayout();
  const { data: dashboardData } = useLifeDashboard(month);
  const { data: notifications } = useNotifications();
  const data = dashboardData ?? emptyLifeDashboard(month);
  const unreadNotifications = (notifications ?? []).filter((n) => !n.read_at).length;
  const badgeCount = unreadNotifications > 0 ? unreadNotifications : data.reminderCount;
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <View style={styles.header}>
      <View style={[styles.titleBlock, isMobile && styles.titleBlockMobile]}>
        {!isDesktopWeb ? <BrandMark size={36} /> : null}
        <View style={styles.titleCopy}>
          <Text style={[styles.title, isMobile && styles.titleMobile]}>{meta.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {meta.subtitle}
          </Text>
        </View>
        {isMobile ? (
          <Pressable
            style={styles.bellButton}
            accessibilityLabel="Reminders"
            onPress={() => setNotifOpen(true)}
          >
            <Feather name="bell" size={17} color="#5C564D" />
            {badgeCount > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{badgeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.actions, isMobile && styles.actionsMobile]}>
        <MonthSwitcher month={month} onChange={onMonthChange} />

        {isDesktopWeb ? (
          <Pressable
            style={styles.bellButton}
            accessibilityLabel="Reminders"
            onPress={() => setNotifOpen(true)}
          >
            <Feather name="bell" size={17} color="#5C564D" />
            {badgeCount > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{badgeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}

        <Pressable
          onPress={onAddTransaction}
          style={({ pressed }) => [
            styles.addButton,
            isMobile && styles.addButtonMobile,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Feather name="plus" size={15} color={colors.heroText} />
          <Text style={styles.addLabel}>Add transaction</Text>
        </Pressable>
      </View>

      <NotificationsPanel visible={notifOpen} onClose={() => setNotifOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  titleBlockMobile: {
    width: '100%',
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 25,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  titleMobile: {
    fontSize: 19,
    letterSpacing: -0.76,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: '#98928A',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginLeft: 'auto',
  },
  actionsMobile: {
    marginLeft: 0,
    width: '100%',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: '#EF6B4E',
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    color: colors.heroText,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: radius.chip,
    backgroundColor: colors.textPrimary,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  addButtonMobile: {
    flex: 1,
  },
  addButtonPressed: {
    backgroundColor: '#2C2822',
  },
  addLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.heroText,
  },
});

export default PageHeader;

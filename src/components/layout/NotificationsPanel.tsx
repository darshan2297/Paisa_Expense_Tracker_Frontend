import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { useLifeDashboard } from '@/features/dashboard/hooks';
import { emptyLifeDashboard } from '@/features/dashboard/mapLifeDashboard';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/hooks';
import type { Notification } from '@/features/notifications/types';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { currentYearMonth, formatRelativeDateTime } from '@/utils/date';

export type NotificationsPanelProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Notification center: backend inbox (`GET /notifications`) plus upcoming
 * reminders from the life dashboard when the inbox is empty — so the bell
 * badge count always matches visible content.
 */
export function NotificationsPanel({ visible, onClose }: NotificationsPanelProps) {
  const { data: notifications = [] } = useNotifications();
  const { data: dashboardData } = useLifeDashboard(currentYearMonth());
  const upcoming = (dashboardData ?? emptyLifeDashboard(currentYearMonth())).upcoming;
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const showReminders = notifications.length === 0 && upcoming.length > 0;

  function onPressNotification(n: Notification) {
    if (!n.read_at) {
      markRead.mutate(n.id);
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} variant="center">
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <Pressable onPress={() => markAllRead.mutate()} hitSlop={8} style={styles.markAll}>
            <Text style={styles.markAllLabel}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      {notifications.length === 0 && !showReminders ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : null}

      {notifications.length > 0 ? (
        <View style={styles.list}>
          {notifications.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => onPressNotification(n)}
              style={[styles.row, !n.read_at && styles.rowUnread]}
            >
              <View style={[styles.dot, !n.read_at && styles.dotUnread]} />
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{n.title}</Text>
                <Text style={styles.rowBody}>{n.body}</Text>
                <Text style={styles.rowWhen}>{formatRelativeDateTime(n.created_at)}</Text>
              </View>
              {!n.read_at ? <Feather name="circle" size={8} color={colors.accent} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {showReminders ? (
        <View style={styles.list}>
          <Text style={styles.sectionLabel}>Upcoming reminders</Text>
          {upcoming.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={[styles.dot, styles.dotUnread]} />
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{item.label}</Text>
                <Text style={styles.rowBody}>{item.sub}</Text>
              </View>
              <Text style={styles.reminderAmount}>{item.amount}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  title: {
    flexShrink: 1,
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.45,
    color: colors.textPrimary,
  },
  markAll: {
    flexShrink: 0,
    marginLeft: 'auto',
  },
  markAllLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.accent,
  },
  empty: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textCaption,
    paddingVertical: 24,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textCaption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  list: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowUnread: {
    backgroundColor: colors.surfaceSubtle,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: 'transparent',
  },
  dotUnread: {
    backgroundColor: colors.accent,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  rowBody: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textCaption,
  },
  rowWhen: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.textCaption,
    marginTop: 2,
  },
  reminderAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textPrimary,
    marginTop: 2,
  },
});

export default NotificationsPanel;

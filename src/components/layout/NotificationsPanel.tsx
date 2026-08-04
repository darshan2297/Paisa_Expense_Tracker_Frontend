import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/hooks';
import type { Notification } from '@/features/notifications/types';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { formatRelativeDateTime } from '@/utils/date';

export type NotificationsPanelProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * The bell used to just navigate to the Bills tab, which has no
 * notification content at all - a placeholder destination, not a real
 * notification center. This is that real surface: the backend already had
 * full read/read-all support (`GET/PATCH /notifications`) that nothing in
 * the app used yet.
 */
export function NotificationsPanel({ visible, onClose }: NotificationsPanelProps) {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

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
          <Pressable onPress={() => markAllRead.mutate()} hitSlop={8}>
            <Text style={styles.markAllLabel}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
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
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.45,
    color: colors.textPrimary,
  },
  markAllLabel: {
    marginLeft: 'auto',
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
});

export default NotificationsPanel;

import { Alert, Platform } from 'react-native';

/**
 * Cross-platform destructive confirm.
 *
 * `Alert.alert` is a no-op on react-native-web, so delete flows that only
 * call Alert never run their `onPress` on the browser. Use this helper
 * everywhere a delete (or other destructive action) needs confirmation.
 */
export function confirmDestructive(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Delete',
): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Sheet } from '@/components/Sheet';
import { useConfirmStore } from '@/stores/confirmStore';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

/**
 * App-wide destructive confirm modal. Opened via `confirmDestructive()` —
 * never use browser `window.confirm` or RN `Alert.alert` for deletes.
 */
export function ConfirmDialogHost() {
  const request = useConfirmStore((s) => s.request);
  const close = useConfirmStore((s) => s.close);
  const visible = request !== null;

  function onCancel() {
    close();
  }

  function onConfirm() {
    const action = request?.onConfirm;
    close();
    action?.();
  }

  return (
    <Sheet visible={visible} onClose={onCancel} variant="center">
      <View style={styles.body}>
        <View style={[styles.iconWrap, request?.confirmLabel === 'Pay now' && styles.iconWrapPay]}>
          <Feather
            name={
              request?.confirmLabel === 'Sign out'
                ? 'log-out'
                : request?.confirmLabel === 'Pay now'
                  ? 'credit-card'
                  : 'trash-2'
            }
            size={22}
            color={request?.confirmLabel === 'Pay now' ? colors.accent : colors.dangerValue}
          />
        </View>
        <Text style={styles.title}>{request?.title ?? 'Delete?'}</Text>
        <Text style={styles.message}>{request?.message ?? 'This cannot be undone.'}</Text>
        <View style={styles.actions}>
          <Button label="Cancel" variant="secondary" onPress={onCancel} style={styles.actionBtn} />
          <Button
            label={request?.confirmLabel ?? 'Delete'}
            variant={request?.confirmLabel === 'Pay now' ? 'primary' : 'danger'}
            onPress={onConfirm}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
    paddingBottom: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.dangerTint,
    borderWidth: 1,
    borderColor: colors.dangerTintBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconWrapPay: {
    backgroundColor: colors.accentTint,
    borderColor: '#E4E1F6',
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.45,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textCaption,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
  },
});

export default ConfirmDialogHost;

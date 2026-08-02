import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Bottom sheet modal shared by the Add Transaction and Add Commitment
 * forms - tapping the dimmed backdrop closes it, matching the mockup's
 * modal dismiss behavior (adapted to a bottom sheet rather than a
 * centered dialog, since that's the native mobile convention).
 */
export function Sheet({ visible, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20,18,15,0.38)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.cardLarge,
    borderTopRightRadius: radius.cardLarge,
    padding: spacing.xl,
    gap: spacing.lg,
  },
});

export default Sheet;

import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, type ViewStyle } from 'react-native';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

export type SheetVariant = 'bottom' | 'center';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Bottom sheet on mobile-style flows; centered dialog matches the mockup modals on desktop. */
  variant?: SheetVariant;
};

/**
 * Modal sheet shared by Add Transaction and other forms — tapping the dimmed
 * backdrop closes it. `center` matches the mockup's centered dialog on desktop
 * and becomes a bottom sheet on narrow viewports (`sheetRadius` / `sheetAlign`).
 */
export function Sheet({ visible, onClose, children, variant = 'bottom' }: SheetProps) {
  const { isNarrow } = useResponsiveLayout();
  const centered = variant === 'center';
  const bottomSheet = !centered || isNarrow;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, centered && !bottomSheet && styles.backdropCenter]}
        onPress={onClose}
      >
        <Pressable
          style={[styles.sheet, bottomSheet ? styles.sheetBottom : styles.sheetCenter]}
          onPress={(event) => event.stopPropagation()}
        >
          {centered ? (
            <ScrollView
              contentContainerStyle={styles.sheetScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sheetShadow: ViewStyle = {
  shadowColor: '#14120F',
  shadowOpacity: 0.55,
  shadowRadius: 40,
  shadowOffset: { width: 0, height: 30 },
  elevation: 12,
};

/** Mockup scrim blurs the page behind the modal (`backdrop-filter: blur(4px)`) — web only. */
const backdropBlur =
  Platform.OS === 'web' ? ({ backdropFilter: 'blur(4px)' } as unknown as ViewStyle) : null;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20,18,15,0.38)',
    ...backdropBlur,
  },
  backdropCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
  },
  sheetBottom: {
    width: '100%',
    maxHeight: '92%',
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    gap: spacing.lg,
    ...sheetShadow,
  },
  sheetCenter: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '92%',
    borderRadius: radius.modal,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    ...sheetShadow,
  },
  // No gap here — the mockup's modal manages its own vertical rhythm
  // (header 18px below, form column 15px gaps) via the ModalForm kit.
  sheetScroll: {},
});

export default Sheet;

import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import type { KindOption } from '@/components/modal/kinds';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';

/**
 * Shared modal form kit — a 1:1 port of the design mockup's single modal
 * template (the one every "Add …" dialog in the original HTML is built
 * from). Every measurement here traces back to that template:
 *
 * - header: 18px/800 title + 32px × button on `#F1EDE7`, 18px below
 * - amount field: 56px tall, 16px radius, ₹ 22px `#B7B0A6`, value 24px/800
 * - text fields: 46px tall, 13px radius, `#FBF9F6` fill
 * - chips: 38px tall, 12px radius; selected = solid kind color, cream text
 * - form column: 15px gap; save button 50px/15px radius (Button size="lg")
 */

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
        <Text style={styles.closeBtnText}>×</Text>
      </Pressable>
    </View>
  );
}

/** Segmented mode tabs (Expense/Income, ledger directions). */
export function ModalModeTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.modeTrack}>
      {tabs.map((tab) => {
        const on = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.modeTab, on && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabLabel, on && styles.modeTabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The 15px-gap column every field lives in (incl. error + save button). */
export function ModalBody({ children }: PropsWithChildren) {
  return <View style={styles.body}>{children}</View>;
}

export function ModalField({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

/** The big ₹ amount field. */
export function ModalAmountField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <ModalField label={label}>
      <View style={styles.amountBox}>
        <Text style={styles.amountSymbol}>₹</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.textCaption}
          keyboardType="decimal-pad"
          inputMode="decimal"
          style={[styles.amountInput, moneyTextStyle]}
        />
      </View>
    </ModalField>
  );
}

/** Standard 46px labeled input (text or numeric). */
export function ModalTextField({
  label,
  value,
  onChangeText,
  placeholder,
  numeric = false,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  numeric?: boolean;
  secureTextEntry?: boolean;
}) {
  const keyboardType: KeyboardTypeOptions | undefined = numeric ? 'numeric' : undefined;
  // Always show a placeholder — mockup inputs never look empty/blank.
  const resolvedPlaceholder = placeholder ?? (numeric ? '0' : 'Optional');
  return (
    <ModalField label={label}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={colors.textCaption}
        keyboardType={keyboardType}
        inputMode={numeric ? 'numeric' : undefined}
        secureTextEntry={secureTextEntry}
        style={[styles.input, numeric ? styles.inputNumeric : styles.inputText]}
      />
    </ModalField>
  );
}

/** Wrapping chip selector — kind/category/frequency pickers. */
export function ModalChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: KindOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.chipsField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipsWrap}>
        {options.map((option) => {
          const on = option.id === value;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              style={[
                styles.chip,
                on ? { backgroundColor: option.color, borderColor: option.color } : styles.chipIdle,
              ]}
            >
              <Text style={[styles.chipLabel, on && styles.chipLabelActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** The Auto-repeat style toggle row (title + sub + 44×24 switch). */
export function ModalToggleRow({
  title,
  sub,
  value,
  onToggle,
}: {
  title: string;
  sub: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <View style={[styles.toggleTrack, { backgroundColor: value ? '#5B54D6' : '#DDD7CE' }]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
      </View>
    </Pressable>
  );
}

/** Date + Note side-by-side row. */
export function ModalDateNoteRow({
  dateLabel = 'Date',
  date,
  onDate,
  note,
  onNote,
}: {
  dateLabel?: string;
  date: string;
  onDate: (value: string) => void;
  note: string;
  onNote: (value: string) => void;
}) {
  return (
    <View style={styles.dateNoteRow}>
      <View style={[styles.field, styles.dateNoteCol]}>
        <Text style={styles.fieldLabel}>{dateLabel}</Text>
        <DateField value={date} onChange={onDate} accessibilityLabel={dateLabel} />
      </View>
      <View style={[styles.field, styles.dateNoteCol]}>
        <Text style={styles.fieldLabel}>Note</Text>
        <TextInput
          value={note}
          onChangeText={onNote}
          placeholder="Optional"
          placeholderTextColor={colors.textCaption}
          style={[styles.input, styles.inputNote]}
        />
      </View>
    </View>
  );
}

/** Violet info note (card spend/pay explanations). */
export function ModalInfoNote({ text }: { text: string }) {
  return (
    <View style={styles.infoNote}>
      <Text style={styles.infoNoteText}>{text}</Text>
    </View>
  );
}

export function ModalError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function ModalSave({
  label,
  onPress,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return <Button label={label} size="lg" onPress={onPress} loading={loading} style={styles.save} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.63,
    color: colors.textPrimary,
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 17,
    lineHeight: 17,
    color: colors.textMuted,
  },
  modeTrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    padding: 4,
    backgroundColor: colors.divider,
    borderRadius: 13,
    marginBottom: 18,
  },
  modeTab: {
    flex: 1,
    minWidth: 96,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#14120F',
    shadowOpacity: 0.14,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  modeTabLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textLabel,
  },
  modeTabLabelActive: {
    color: colors.textPrimary,
  },
  body: {
    gap: 15,
  },
  field: {
    gap: 7,
  },
  chipsField: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textLabel,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    minWidth: 0,
  },
  amountSymbol: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: '#B7B0A6',
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    letterSpacing: -0.84,
    color: colors.textPrimary,
  },
  input: {
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surfaceSubtle,
    color: colors.textPrimary,
  },
  inputText: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
  },
  inputNumeric: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
  },
  inputNote: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIdle: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  chipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  chipLabelActive: {
    color: colors.heroText,
  },
  toggleRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  toggleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  toggleTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  toggleSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 99,
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  toggleKnobOn: {
    transform: [{ translateX: 20 }],
  },
  dateNoteRow: {
    flexDirection: 'row',
    gap: 11,
  },
  dateNoteCol: {
    flex: 1,
    minWidth: 0,
  },
  infoNote: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: '#F1EFFE',
    borderWidth: 1,
    borderColor: '#E4E1F6',
  },
  infoNoteText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.accent,
  },
  errorBox: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.dangerTint,
  },
  errorText: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.dangerValue,
  },
  save: {
    marginTop: 2,
    width: '100%',
  },
});

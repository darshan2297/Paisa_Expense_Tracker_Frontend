import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { createElement, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { formatShortDate } from '@/utils/date';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseIsoDate(value: string): Date {
  if (ISO_DATE.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date();
}

export type DateFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  /** Optional style for the outer field chrome (height/border). */
  style?: StyleProp<ViewStyle>;
  /** Accessibility label; defaults to "Date". */
  accessibilityLabel?: string;
  /** Minimum selectable date (YYYY-MM-DD). */
  minimumDate?: string;
  /** Maximum selectable date (YYYY-MM-DD). */
  maximumDate?: string;
};

/**
 * System-wide date field. Value is always `YYYY-MM-DD`.
 *
 * - Web: native `<input type="date">` so the browser calendar opens.
 * - iOS/Android: pressable field + `@react-native-community/datetimepicker`.
 */
export function DateField({
  value,
  onChange,
  style,
  accessibilityLabel = 'Date',
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const parsed = useMemo(() => parseIsoDate(value || toIsoDate(new Date())), [value]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.chrome, style]}>
        {createElement('input', {
          type: 'date',
          value: ISO_DATE.test(value) ? value : '',
          min: minimumDate,
          max: maximumDate,
          'aria-label': accessibilityLabel,
          className: 'paisa-date-input',
          onChange: (event: { target: { value: string } }) => {
            if (event.target.value) {
              onChange(event.target.value);
            }
          },
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: colors.textPrimary,
            fontFamily: fontFamily.semibold,
            fontSize: 13,
            paddingLeft: 14,
            paddingRight: 14,
            boxSizing: 'border-box',
            colorScheme: 'light',
          } as object,
        })}
      </View>
    );
  }

  const onNativeChange = (event: DateTimePickerEvent, selected?: Date) => {
    // Android fires "dismissed" when cancelled; iOS spinner stays open until we close.
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (selected) {
      onChange(toIsoDate(selected));
    }
  };

  return (
    <View style={style}>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.chrome, pressed && styles.chromePressed]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.nativeValue}>
          {ISO_DATE.test(value) ? formatShortDate(`${value}T00:00:00`) : 'Pick a date'}
        </Text>
        <Feather name="calendar" size={15} color={colors.textLabel} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={parsed}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onNativeChange}
          minimumDate={minimumDate ? parseIsoDate(minimumDate) : undefined}
          maximumDate={maximumDate ? parseIsoDate(maximumDate) : undefined}
        />
      ) : null}
      {Platform.OS === 'ios' && open ? (
        <Pressable onPress={() => setOpen(false)} style={styles.iosDone}>
          <Text style={styles.iosDoneLabel}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chrome: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS !== 'web'
      ? {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          paddingHorizontal: 14,
          gap: 8,
        }
      : null),
  },
  chromePressed: {
    backgroundColor: colors.divider,
  },
  nativeValue: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  iosDone: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  iosDoneLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.accent,
  },
});

export default DateField;

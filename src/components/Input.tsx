import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

export type InputProps = TextInputProps & {
  label: string;
  /** Shown below the field in the danger color, and switches the border red. */
  error?: string;
};

/**
 * Shared labeled text input, pixel-matched to the mockup's field style
 * (`height: 46px`, `border-radius: 13px`, `background: #FBF9F6`,
 * `font-size: 13.5px / 600`). Business screens should compose this rather
 * than styling `TextInput` ad hoc. Forwards its ref so it works as a React
 * Hook Form registered field.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, style, ...rest },
  ref,
) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textCaption}
        style={[styles.input, Boolean(error) && styles.inputError, style]}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textLabel,
  },
  input: {
    height: 46,
    width: '100%',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSubtle,
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
  },
});

export default Input;

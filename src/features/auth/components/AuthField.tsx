import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

export type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

/**
 * Text field for the dark onboarding backdrop: translucent cream fill with an
 * uppercase caption label, per the mockup's account screen.
 *
 * Deliberately not a `tone` prop on the shared `Input` — beyond the palette
 * these differ in label case, tracking and metrics, so a variant would be two
 * components wearing one name. Kept feature-local until a second feature
 * needs a field on a dark surface.
 */
export const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField(
  { label, error, style, ...rest },
  ref,
) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.heroTextFaint}
        selectionColor={colors.authStepActive}
        style={[styles.input, Boolean(error) && styles.inputError, style]}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.heroTextMuted,
  },
  input: {
    height: 46,
    width: '100%',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.heroBorderSubtle,
    borderRadius: radius.tileSmall,
    backgroundColor: colors.heroSurfaceSubtle,
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.heroText,
  },
  inputError: {
    borderColor: colors.heroDanger,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.heroDanger,
  },
});

export default AuthField;

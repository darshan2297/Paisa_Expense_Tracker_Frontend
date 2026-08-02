import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

export type AuthMode = 'register' | 'signin';

const MODE_LABELS: Record<AuthMode, string> = {
  register: 'Create account',
  signin: 'Sign in',
};

export type AuthModeToggleProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

const MODES: AuthMode[] = ['register', 'signin'];

/**
 * Segmented Create account / Sign in switch sitting above the account form.
 *
 * Shown in both modes even while bootstrap registration is still open (no
 * account exists yet, so signing in can only fail) — that's what the mockup
 * specifies, and hiding half the control depending on invisible server state
 * would leave a returning user on a re-installed app with no visible way back
 * to their account.
 */
export function AuthModeToggle({ mode, onChange }: AuthModeToggleProps) {
  return (
    <View style={styles.container}>
      {MODES.map((candidate) => {
        const isSelected = candidate === mode;
        return (
          <Pressable
            key={candidate}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(candidate)}
            style={[styles.segment, isSelected && styles.segmentSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {MODE_LABELS[candidate]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.tileSmall,
    backgroundColor: colors.heroSurfaceSubtle,
  },
  segment: {
    flex: 1,
    // The mockup's segments are shorter than this; 38 is the floor that keeps
    // the whole control at a 44pt tap target once padding is counted.
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.heroText,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.heroTextMuted,
  },
  labelSelected: {
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
});

export default AuthModeToggle;

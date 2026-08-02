import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/Input';
import { Keypad } from '@/components/Keypad';
import { PinDots } from '@/components/PinDots';
import { login as loginApi } from '@/features/auth/api';
import { useProfile } from '@/features/profile/hooks';
import { useAppLockStore } from '@/stores/appLockStore';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

import { authenticateWithBiometrics, isBiometricAvailable } from './biometrics';
import { verifyPin } from './pin';

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 5;

type Tab = 'pin' | 'fingerprint' | 'face' | 'password';

const TABS: { key: Tab; label: string }[] = [
  { key: 'pin', label: 'PIN' },
  { key: 'fingerprint', label: 'Fingerprint' },
  { key: 'face', label: 'Face ID' },
  { key: 'password', label: 'Password' },
];

/**
 * Global full-screen app-lock overlay, rendered from the root layout in
 * place of the rest of the app whenever `appLockStore.isLocked` is true.
 * Matches the mockup's App Lock screen: dark background, brand icon,
 * "Welcome back, {name}", a PIN/Fingerprint/Face ID/Password tab switcher.
 *
 * This gates access to an already-authenticated session - it is a
 * device-level convenience layer, not a replacement for the real backend
 * login. See docs/DEVELOPER_PHILOSOPHY.md §8.6.
 */
export function AppLockScreen() {
  const profile = useProfile();
  const setLocked = useAppLockStore((state) => state.setLocked);
  const biometricEnabled = useAppLockStore((state) => state.biometricEnabled);

  const [tab, setTab] = useState<Tab>('pin');
  const [pin, setPinInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Device capability AND user opt-in both have to be true - a supported
  // device with biometrics turned off (skipped during onboarding, or
  // disabled later in Profile) should not offer Fingerprint/Face ID here.
  const biometricAvailable = biometricSupported && biometricEnabled;

  useEffect(() => {
    isBiometricAvailable().then(setBiometricSupported);
  }, []);

  const unlock = () => {
    setError(null);
    setLocked(false);
  };

  const registerFailedAttempt = (message: string) => {
    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);
    setPinInput('');
    setError(
      remaining > 0
        ? `${message} ${remaining} attempt${remaining === 1 ? '' : 's'} left.`
        : 'Too many attempts. Try again in a moment, or use Password.',
    );
  };

  async function handlePinComplete(candidate: string) {
    setSubmitting(true);
    const ok = await verifyPin(candidate);
    setSubmitting(false);
    if (ok) {
      unlock();
    } else {
      registerFailedAttempt('Wrong PIN.');
    }
  }

  function onDigit(digit: string) {
    if (submitting || attemptsLeft <= 0) {
      return;
    }
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPinInput(next);
    if (next.length === PIN_LENGTH) {
      handlePinComplete(next);
    }
  }

  function onBackspace() {
    setPinInput((current) => current.slice(0, -1));
  }

  async function onBiometricPress(kind: 'Fingerprint' | 'Face ID') {
    setError(null);
    const ok = await authenticateWithBiometrics(`Unlock Paisa with ${kind}`);
    if (ok) {
      unlock();
    } else {
      setError(`${kind} unlock failed or was cancelled.`);
    }
  }

  async function onPasswordSubmit() {
    if (!profile.data?.email || !password) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await loginApi({ email: profile.data.email, password });
      unlock();
    } catch {
      setError('Incorrect password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LinearGradient
      colors={[colors.heroGradientStart, colors.heroGradientEnd]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.screen}
    >
      <View pointerEvents="none" style={styles.glow} />

      <View style={styles.header}>
        <LinearGradient
          colors={[colors.brandGradientStart, colors.brandGradientEnd]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.icon}
        >
          <Feather name="trending-up" size={26} color={colors.heroText} />
        </LinearGradient>
        <Text style={styles.title}>Welcome back{profile.data ? `, ${profile.data.name}` : ''}</Text>
        <Text style={styles.subtitle}>Paisa is locked · unlock to continue</Text>
      </View>

      <View style={styles.tabTrack}>
        {TABS.map((t) => {
          const disabled = (t.key === 'fingerprint' || t.key === 'face') && !biometricAvailable;
          return (
            <Pressable
              key={t.key}
              disabled={disabled}
              onPress={() => {
                setError(null);
                setTab(t.key);
              }}
              style={[
                styles.tab,
                tab === t.key && styles.tabActive,
                disabled && styles.tabDisabled,
              ]}
            >
              <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.content}>
        {tab === 'pin' ? (
          <View style={styles.pinContent}>
            <PinDots length={PIN_LENGTH} filled={pin.length} />
            <Keypad onDigit={onDigit} onBackspace={onBackspace} />
          </View>
        ) : null}

        {(tab === 'fingerprint' || tab === 'face') && (
          <Pressable
            disabled={!biometricAvailable}
            onPress={() => onBiometricPress(tab === 'fingerprint' ? 'Fingerprint' : 'Face ID')}
            style={[styles.biometricButton, !biometricAvailable && styles.tabDisabled]}
          >
            <Feather
              name={tab === 'fingerprint' ? 'smartphone' : 'eye'}
              size={32}
              color={colors.heroText}
            />
            <Text style={styles.biometricLabel}>
              {biometricAvailable
                ? `Use ${tab === 'fingerprint' ? 'Fingerprint' : 'Face ID'}`
                : 'Not available on this device'}
            </Text>
          </Pressable>
        )}

        {tab === 'password' ? (
          <View style={styles.passwordContent}>
            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <Pressable
              onPress={onPasswordSubmit}
              disabled={submitting || !password}
              style={[styles.unlockButton, (submitting || !password) && styles.tabDisabled]}
            >
              <Text style={styles.unlockButtonLabel}>Unlock</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.heroGlow,
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 20,
    color: colors.heroText,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.heroTextMuted,
  },
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: colors.heroFillSubtle,
    borderRadius: 99,
    padding: 4,
    gap: 2,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 99,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabDisabled: {
    opacity: 0.4,
  },
  tabLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.heroTextMuted,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  error: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: '#F0B49F',
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'center',
  },
  pinContent: {
    alignItems: 'center',
    gap: 32,
  },
  biometricButton: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  biometricLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.heroTextMuted,
  },
  passwordContent: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  passwordInput: {
    backgroundColor: colors.heroFillSubtle,
    borderColor: colors.heroBorderSubtle,
    color: colors.heroText,
  },
  unlockButton: {
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.heroText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButtonLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});

export default AppLockScreen;

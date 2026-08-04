import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DateField } from '@/components/DateField';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import {
  ModalBody,
  ModalError,
  ModalHeader,
  ModalSave,
  ModalTextField,
} from '@/components/modal/ModalForm';
import { Sheet } from '@/components/Sheet';
import { setBiometricEnabled as persistBiometricPreference } from '@/features/appLock/biometricPreference';
import { clearAccountAndDevicePin } from '@/features/appLock/pin';
import { PinVerifyStep } from '@/features/appLock/PinVerifyStep';

import { useChangePassword } from '@/features/auth/hooks';
import {
  useExportBackup,
  useImportBackup,
  useLockVault,
  useLoginHistory,
  useProfileConfig,
  useRevokeSession,
  useSecurityOverview,
  useUpdateSecuritySettings,
} from '@/features/security/hooks';
import type {
  SecurityEvent,
  SecuritySettings,
  SecuritySettingsUpdatePayload,
} from '@/features/security/types';
import { useAppLockStore } from '@/stores/appLockStore';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { currentYearMonth, formatBytes, formatRelativeDateTime } from '@/utils/date';

const LOGIN_HISTORY_PAGE_SIZE = 8;

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<{
    name: string;
    createWritable: () => Promise<{
      write: (data: string | Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

/** Fallback when the browser has no Save As picker — silent download to Downloads. */
function downloadBackupFile(filename: string, content: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pickBackupFile(): Promise<string> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.reject(new Error('File restore is available on web for now.'));
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      file.text().then(resolve).catch(reject);
    };
    input.click();
  });
}

type ToggleItem = {
  key: string;
  field: keyof SecuritySettingsUpdatePayload;
  label: string;
  sub: string;
  on: boolean;
};
type SecSection = { title: string; items: ToggleItem[] };

const EVENT_LABELS: Record<string, string> = {
  sign_in: 'Successful sign-in',
  backup_completed: 'Backup completed',
  password_changed: 'Password changed',
  vault_locked: 'Vault locked',
  pin_failed: 'Failed PIN attempt',
};

const EVENT_COLORS: Record<string, string> = {
  sign_in: colors.success,
  backup_completed: colors.accent,
  password_changed: '#96702C',
  vault_locked: colors.textMuted,
  pin_failed: colors.dangerValue,
};

function buildSections(settings: SecuritySettings): SecSection[] {
  return [
    {
      title: 'Authentication',
      items: [
        {
          key: 'pin',
          field: 'pin_lock_enabled',
          label: 'PIN lock',
          sub: '6-digit PIN on every launch',
          on: settings.pin_lock_enabled,
        },
        {
          key: 'bio',
          field: 'fingerprint_login_enabled',
          label: 'Fingerprint login',
          sub: 'Unlock with your fingerprint',
          on: settings.fingerprint_login_enabled,
        },
        {
          key: 'face',
          field: 'face_id_enabled',
          label: 'Face ID',
          sub: 'Unlock by looking at the screen',
          on: settings.face_id_enabled,
        },
        {
          key: 'pw',
          field: 'password_protection_enabled',
          label: 'Password protection',
          sub: 'Fallback password for new devices',
          on: settings.password_protection_enabled,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          key: 'hide',
          field: 'hide_sensitive_amounts',
          label: 'Hide sensitive amounts',
          sub: 'Blur balances until you tap them',
          on: settings.hide_sensitive_amounts,
        },
        {
          key: 'privacy',
          field: 'privacy_mode_enabled',
          label: 'Privacy mode',
          sub: 'Hide all values when the app loses focus',
          on: settings.privacy_mode_enabled,
        },
        {
          key: 'autolock',
          field: 'auto_lock_enabled',
          label: 'Auto lock',
          sub: 'Lock after the session timeout below',
          on: settings.auto_lock_enabled,
        },
      ],
    },
    {
      title: 'Backup & encryption',
      items: [
        {
          key: 'cloud',
          field: 'cloud_backup_enabled',
          label: 'Cloud backup',
          sub: 'Encrypted nightly to your drive',
          on: settings.cloud_backup_enabled,
        },
        {
          key: 'local',
          field: 'local_backup_enabled',
          label: 'Local backup',
          sub: 'Keep a copy on this device',
          on: settings.local_backup_enabled,
        },
        {
          key: 'e2e',
          field: 'e2e_encryption_enabled',
          label: 'End-to-end encryption',
          sub: 'Only you hold the decryption key',
          on: settings.e2e_encryption_enabled,
        },
        {
          key: 'twofa',
          field: 'two_factor_enabled',
          label: 'Two-factor authentication',
          sub: 'One-time code on new sign-ins',
          on: settings.two_factor_enabled,
        },
      ],
    },
  ];
}

function ToggleRow({ item, onToggle }: { item: ToggleItem; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{item.label}</Text>
        <Text style={styles.toggleSub}>{item.sub}</Text>
      </View>
      <View style={[styles.toggleTrack, { backgroundColor: item.on ? colors.accent : '#DDD7CE' }]}>
        <View style={[styles.toggleKnob, item.on && styles.toggleKnobOn]} />
      </View>
    </Pressable>
  );
}

function LoginHistoryCard() {
  const today = todayIsoDate();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      size: LOGIN_HISTORY_PAGE_SIZE,
      from_date: fromDate,
      to_date: toDate,
    }),
    [page, fromDate, toDate],
  );

  const { data, isLoading, isFetching } = useLoginHistory(filters);
  const events: SecurityEvent[] = data?.data ?? [];
  const totalPages = data?.pages ?? 0;
  const total = data?.total ?? 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  function setRange(nextFrom: string, nextTo: string) {
    setFromDate(nextFrom);
    setToDate(nextTo);
    setPage(1);
  }

  return (
    <Card size="large" style={styles.secCard}>
      <DesignSectionHeader title="Login history" />

      <View style={styles.historyFilters}>
        <View style={styles.historyFilterField}>
          <Text style={styles.historyFilterLabel}>From</Text>
          <DateField
            value={fromDate}
            onChange={(value) => setRange(value, value > toDate ? value : toDate)}
            accessibilityLabel="Login history from date"
            maximumDate={toDate}
            style={styles.historyDateField}
          />
        </View>
        <View style={styles.historyFilterField}>
          <Text style={styles.historyFilterLabel}>To</Text>
          <DateField
            value={toDate}
            onChange={(value) => setRange(value < fromDate ? value : fromDate, value)}
            accessibilityLabel="Login history to date"
            minimumDate={fromDate}
            maximumDate={today}
            style={styles.historyDateField}
          />
        </View>
        <Pressable
          style={styles.todayChip}
          onPress={() => setRange(today, today)}
          accessibilityLabel="Show today's login history"
        >
          <Text style={styles.todayChipText}>Today</Text>
        </Pressable>
      </View>

      {isLoading && !data ? (
        <View style={styles.historyEmpty}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : events.length === 0 ? (
        <Text style={styles.historyEmptyText}>No login activity in this date range.</Text>
      ) : (
        events.map((l) => (
          <View key={l.id} style={styles.historyRow}>
            <View
              style={[
                styles.historyDot,
                { backgroundColor: EVENT_COLORS[l.event_type] ?? colors.textMuted },
              ]}
            />
            <View style={styles.sessionCopy}>
              <Text style={styles.sessionDevice}>{EVENT_LABELS[l.event_type] ?? l.event_type}</Text>
              <Text style={styles.sessionMeta}>{l.detail ?? l.device_label}</Text>
            </View>
            <Text style={styles.historyWhen}>{formatRelativeDateTime(l.created_at)}</Text>
          </View>
        ))
      )}

      {total > 0 ? (
        <View style={styles.historyPager}>
          <Pressable
            onPress={() => canPrev && setPage((p) => p - 1)}
            disabled={!canPrev || isFetching}
            style={[styles.pagerBtn, (!canPrev || isFetching) && styles.pagerBtnDisabled]}
            accessibilityLabel="Previous page"
          >
            <Feather
              name="chevron-left"
              size={16}
              color={canPrev ? colors.textPrimary : colors.textCaption}
            />
            <Text style={[styles.pagerBtnText, !canPrev && styles.pagerBtnTextDisabled]}>Prev</Text>
          </Pressable>
          <Text style={styles.pagerMeta}>
            Page {page} of {Math.max(totalPages, 1)} · {total} event{total === 1 ? '' : 's'}
          </Text>
          <Pressable
            onPress={() => canNext && setPage((p) => p + 1)}
            disabled={!canNext || isFetching}
            style={[styles.pagerBtn, (!canNext || isFetching) && styles.pagerBtnDisabled]}
            accessibilityLabel="Next page"
          >
            <Text style={[styles.pagerBtnText, !canNext && styles.pagerBtnTextDisabled]}>Next</Text>
            <Feather
              name="chevron-right"
              size={16}
              color={canNext ? colors.textPrimary : colors.textCaption}
            />
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

/** Design HTML `isSecurity` — vault, backup, and privacy controls. */
export default function SecurityScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [backupMessage, setBackupMessage] = useState('');
  const [disablePinOpen, setDisablePinOpen] = useState(false);

  const { data, isLoading } = useSecurityOverview();
  const { data: config } = useProfileConfig();
  const updateSettings = useUpdateSecuritySettings();
  const lockVault = useLockVault();
  const revokeSession = useRevokeSession();
  const changePassword = useChangePassword();
  const exportBackup = useExportBackup();
  const importBackup = useImportBackup();

  const hasPinConfigured = useAppLockStore((state) => state.hasPinConfigured);
  const setHasPinConfigured = useAppLockStore((state) => state.setHasPinConfigured);
  const setDeviceBiometricEnabled = useAppLockStore((state) => state.setBiometricEnabled);
  const setLocked = useAppLockStore((state) => state.setLocked);

  const sections = useMemo(() => (data ? buildSections(data.settings) : []), [data]);
  const lockOptions = config?.auto_logout_minutes_options ?? [1, 5, 15, 30];

  /**
   * These three fields are cosmetic-looking backend settings that must also
   * drive the real, device-local App Lock mechanism (`pin.ts` /
   * `biometricPreference.ts` / `appLockStore`) — toggling them here used to
   * only patch the backend flag, leaving the actual lock screen unaffected.
   * `fingerprint_login_enabled` and `face_id_enabled` are two labels over one
   * on-device biometric preference (see `AppLockScreen`'s single
   * `biometricEnabled` flag) — toggling either sets that one preference
   * directly.
   */
  const toggle = (field: keyof SecuritySettingsUpdatePayload, current: boolean) => {
    if (field === 'pin_lock_enabled') {
      if (current) {
        // Turning OFF requires proving you know the current PIN first.
        setDisablePinOpen(true);
        return;
      }
      if (!hasPinConfigured) {
        router.push('/lock-setup');
        return;
      }
      updateSettings.mutate({ pin_lock_enabled: true });
      return;
    }

    if (field === 'fingerprint_login_enabled' || field === 'face_id_enabled') {
      const next = !current;
      setDeviceBiometricEnabled(next);
      persistBiometricPreference(next);
      updateSettings.mutate({ [field]: next });
      return;
    }

    updateSettings.mutate({ [field]: !current });
  };

  function closeDisablePin() {
    setDisablePinOpen(false);
  }

  async function confirmDisablePin(pin: string) {
    try {
      await clearAccountAndDevicePin(pin);
    } catch {
      // If the network call fails, still clear local so the toggle isn't stuck.
      // Account PIN may remain — next hydrate/login will re-sync status.
    }
    setHasPinConfigured(false);
    setDisablePinOpen(false);
    updateSettings.mutate({ pin_lock_enabled: false });
  }

  function closePassword() {
    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  }

  function submitPassword() {
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          closePassword();
          Alert.alert('Password updated', 'Your account password has been changed.');
        },
        onError: () => setPasswordError('Could not change password. Check your current password.'),
      },
    );
  }

  async function runBackup() {
    setBackupMessage('');
    // Open Save As immediately while the click still counts as a user gesture.
    // (If we wait until after the API returns, Chrome often skips the dialog.)
    let pendingHandle: Awaited<
      ReturnType<NonNullable<SaveFilePickerWindow['showSaveFilePicker']>>
    > | null = null;
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const win = window as SaveFilePickerWindow;
        if (typeof win.showSaveFilePicker === 'function') {
          pendingHandle = await win.showSaveFilePicker({
            suggestedName: `paisa-backup-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.json`,
            types: [
              {
                description: 'Paisa backup',
                accept: { 'application/json': ['.json'] },
              },
            ],
          });
        }
      }
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'AbortError') {
        setBackupMessage('Backup cancelled.');
        return;
      }
      // Picker unavailable / denied — continue with silent download fallback.
    }

    try {
      const result = await exportBackup.mutateAsync();
      if (!result.content) {
        setBackupMessage('Backup created, but no file content was returned.');
        return;
      }
      if (pendingHandle) {
        const writable = await pendingHandle.createWritable();
        await writable.write(result.content);
        await writable.close();
        setBackupMessage(`Backup saved · ${pendingHandle.name || result.filename}`);
        return;
      }
      // Firefox / Safari: no Save As API — download straight to Downloads.
      downloadBackupFile(result.filename, result.content);
      setBackupMessage(`Downloaded · ${result.filename} (check your Downloads folder)`);
    } catch {
      setBackupMessage('Backup failed. Try again.');
    }
  }

  function runRestore() {
    setBackupMessage('');
    pickBackupFile()
      .then((content) =>
        importBackup.mutateAsync(content).then((result) => {
          setBackupMessage(result.message || 'Backup restored.');
        }),
      )
      .catch((err: Error) => {
        if (err.message !== 'No file selected') {
          setBackupMessage(err.message || 'Restore failed.');
        }
      });
  }

  if (isLoading || !data) {
    return (
      <ScreenScaffold month={month} onMonthChange={setMonth} showMonthControls={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </ScreenScaffold>
    );
  }

  const { settings, backup, sessions } = data;
  // While you're on this screen the session is unlocked. "Encrypted & locked"
  // from the backend vault flag was misleading next to a Lock now button that
  // only patched that flag and never showed the PIN screen.
  const vaultTitle = hasPinConfigured ? 'Encrypted & unlocked' : 'App lock not set up';
  const vaultSub = hasPinConfigured
    ? 'Only this device holds your key.'
    : 'Set a PIN first, then you can lock Paisa anytime.';

  function lockNow() {
    if (!hasPinConfigured) {
      router.push('/lock-setup');
      return;
    }
    // Show the PIN gate immediately (same as Profile → Lock the app).
    setLocked(true);
    // Keep the backend vault flag in sync for audit/history.
    lockVault.mutate();
  }

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth} showMonthControls={false}>
      <DesignGrid cols={3} tabletCols={1} narrowCols={1}>
        <LinearGradient
          colors={['#123F35', '#0B2A24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vaultCard}
        >
          <View style={styles.vaultHeader}>
            <View style={styles.pulseDot} />
            <Text style={styles.vaultEyebrow}>Vault status</Text>
          </View>
          <Text style={styles.vaultTitle}>{vaultTitle}</Text>
          <Text style={styles.vaultSub}>{vaultSub}</Text>
          <Pressable
            style={styles.lockBtn}
            onPress={lockNow}
            disabled={lockVault.isPending}
            accessibilityLabel={hasPinConfigured ? 'Lock now' : 'Set up PIN'}
          >
            <Feather name="lock" size={14} color="#F2FBF7" />
            <Text style={styles.lockBtnText}>{hasPinConfigured ? 'Lock now' : 'Set up PIN'}</Text>
          </Pressable>
        </LinearGradient>

        <Card style={styles.infoCard}>
          <Text style={styles.infoLabel}>Last backup</Text>
          <Text style={styles.infoValue}>
            {backup.last_backup_at
              ? formatRelativeDateTime(backup.last_backup_at)
              : 'No backup yet'}
          </Text>
          <Text style={styles.infoSub}>
            {backup.last_backup_size_bytes
              ? `${formatBytes(backup.last_backup_size_bytes)} encrypted`
              : 'Run a backup to protect your data'}
          </Text>
          <View style={styles.btnRow}>
            <Pressable
              style={styles.outlineBtn}
              onPress={runBackup}
              disabled={exportBackup.isPending}
            >
              <Text style={styles.outlineBtnText}>
                {exportBackup.isPending ? 'Backing up…' : 'Backup now'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.outlineBtn}
              onPress={runRestore}
              disabled={importBackup.isPending}
            >
              <Text style={styles.outlineBtnText}>
                {importBackup.isPending ? 'Restoring…' : 'Restore backup'}
              </Text>
            </Pressable>
          </View>
          {backupMessage ? <Text style={styles.backupMsg}>{backupMessage}</Text> : null}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoLabel}>Auto-logout after</Text>
          <View style={styles.lockRow}>
            {lockOptions.map((v) => {
              const active = settings.auto_logout_minutes === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => updateSettings.mutate({ auto_logout_minutes: v })}
                  style={[
                    styles.lockChip,
                    active && styles.lockChipActive,
                    { borderColor: active ? colors.textPrimary : colors.border },
                  ]}
                >
                  <Text style={[styles.lockChipText, active && styles.lockChipTextActive]}>
                    {v} min
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={[styles.outlineBtn, styles.passwordBtn]}
            onPress={() => setPasswordOpen(true)}
          >
            <Text style={styles.outlineBtnText}>Change password</Text>
          </Pressable>
        </Card>
      </DesignGrid>

      <DesignGrid cols={3} tabletCols={1} narrowCols={1}>
        {sections.map((s) => (
          <Card key={s.title} size="large" style={styles.secCard}>
            <DesignSectionHeader title={s.title} />
            {s.items.map((i) => (
              <ToggleRow key={i.key} item={i} onToggle={() => toggle(i.field, i.on)} />
            ))}
          </Card>
        ))}
      </DesignGrid>

      <DesignGrid cols={2} tabletCols={1} narrowCols={1}>
        <Card size="large" style={styles.secCard}>
          <DesignSectionHeader title="Trusted devices & sessions" />
          {sessions.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <View style={styles.deviceIcon}>
                <Feather name="monitor" size={15} color={colors.textMuted} />
              </View>
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionDevice}>{s.device_label}</Text>
                <Text style={styles.sessionMeta}>
                  {[
                    s.location && s.location !== 'Unknown' ? s.location : null,
                    s.is_current ? 'Active now' : formatRelativeDateTime(s.last_active_at),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
              {s.is_current ? (
                <Text
                  style={[
                    styles.sessionChip,
                    { backgroundColor: '#E2F0E9', color: colors.success, borderColor: '#D8E8E0' },
                  ]}
                >
                  This device
                </Text>
              ) : (
                <Pressable onPress={() => revokeSession.mutate(s.id)}>
                  <Text
                    style={[
                      styles.sessionChip,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        color: colors.textMuted,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    Sign out
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </Card>

        <LoginHistoryCard />
      </DesignGrid>

      <Sheet visible={passwordOpen} onClose={closePassword} variant="center">
        <ModalHeader title="Change password" onClose={closePassword} />
        <ModalBody>
          <ModalTextField
            label="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry
          />
          <ModalTextField
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="At least 8 characters"
            secureTextEntry
          />
          <ModalTextField
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat new password"
            secureTextEntry
          />
          <ModalError message={passwordError} />
          <ModalSave
            label="Update password"
            onPress={submitPassword}
            loading={changePassword.isPending}
          />
        </ModalBody>
      </Sheet>

      <Sheet visible={disablePinOpen} onClose={closeDisablePin} variant="center">
        <LinearGradient
          colors={[colors.heroGradientStart, colors.heroGradientEnd]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.disablePinSheet}
        >
          <PinVerifyStep
            title="Turn off PIN lock"
            subtitle="Enter your PIN to disable App Lock on this account."
            onVerified={confirmDisablePin}
            onCancel={closeDisablePin}
          />
        </LinearGradient>
      </Sheet>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  loading: { padding: 40, alignItems: 'center' },
  disablePinSheet: {
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
  },
  vaultCard: {
    borderRadius: 22,
    padding: 22,
    minHeight: 160,
    shadowColor: '#0B2A24',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 6,
  },
  vaultHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8FE0BE' },
  vaultEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: 'rgba(242,251,247,.5)',
  },
  vaultTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    letterSpacing: -1.04,
    color: '#F2FBF7',
    marginTop: 10,
  },
  vaultSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: 'rgba(242,251,247,.6)',
    marginTop: 6,
  },
  lockBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(242,251,247,.18)',
    backgroundColor: 'rgba(242,251,247,.08)',
  },
  lockBtnText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#F2FBF7' },
  infoCard: { padding: 22, gap: 4 },
  infoLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textLabel },
  infoValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 20,
    letterSpacing: -0.7,
    color: colors.textPrimary,
    marginTop: 8,
  },
  infoSub: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textCaption, marginTop: 4 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  outlineBtn: {
    alignSelf: 'flex-start',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  outlineBtnText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  backupMsg: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
    marginTop: 8,
  },
  passwordBtn: { marginTop: 14 },
  lockRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  lockChip: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 11,
    borderWidth: 1,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  lockChipActive: { backgroundColor: colors.textPrimary },
  lockChipText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.textMuted },
  lockChipTextActive: { color: colors.heroText },
  secCard: { padding: 22, gap: 0 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  toggleCopy: { flex: 1, gap: 3 },
  toggleLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  toggleSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 99,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  toggleKnobOn: { alignSelf: 'flex-end' },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  deviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCopy: { flex: 1, gap: 2 },
  sessionDevice: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  sessionMeta: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  sessionChip: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    textAlignVertical: 'center',
    lineHeight: 30,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  historyDot: { width: 7, height: 7, borderRadius: 4 },
  historyWhen: { fontFamily: fontFamily.semibold, fontSize: 11.5, color: colors.textCaption },
  historyFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  historyFilterField: { flexGrow: 1, flexBasis: 140, gap: 5, minWidth: 120 },
  historyFilterLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textLabel,
    letterSpacing: 0.2,
  },
  historyDateField: { height: 40, borderRadius: 11 },
  todayChip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  todayChipText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  historyEmpty: { paddingVertical: 24, alignItems: 'center' },
  historyEmptyText: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    paddingVertical: 18,
  },
  historyPager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  pagerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  pagerBtnDisabled: { opacity: 0.45 },
  pagerBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textPrimary },
  pagerBtnTextDisabled: { color: colors.textCaption },
  pagerMeta: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
});

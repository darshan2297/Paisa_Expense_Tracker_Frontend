import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

type ToggleItem = { key: string; label: string; sub: string; on: boolean };
type SecSection = { title: string; items: ToggleItem[] };

const SEC_SECTIONS: SecSection[] = [
  {
    title: 'Authentication',
    items: [
      { key: 'pin', label: 'PIN lock', sub: '6-digit PIN on every launch', on: true },
      { key: 'bio', label: 'Fingerprint login', sub: 'Unlock with your fingerprint', on: true },
      { key: 'face', label: 'Face ID', sub: 'Unlock by looking at the screen', on: false },
      {
        key: 'pw',
        label: 'Password protection',
        sub: 'Fallback password for new devices',
        on: true,
      },
    ],
  },
  {
    title: 'Privacy',
    items: [
      {
        key: 'hide',
        label: 'Hide sensitive amounts',
        sub: 'Blur balances until you tap them',
        on: false,
      },
      {
        key: 'privacy',
        label: 'Privacy mode',
        sub: 'Hide all values when the app loses focus',
        on: false,
      },
      {
        key: 'autolock',
        label: 'Auto lock',
        sub: 'Lock after the session timeout below',
        on: true,
      },
    ],
  },
  {
    title: 'Backup & encryption',
    items: [
      { key: 'cloud', label: 'Cloud backup', sub: 'Encrypted nightly to your drive', on: true },
      { key: 'local', label: 'Local backup', sub: 'Keep a copy on this device', on: false },
      {
        key: 'e2e',
        label: 'End-to-end encryption',
        sub: 'Only you hold the decryption key',
        on: true,
      },
      {
        key: 'twofa',
        label: 'Two-factor authentication',
        sub: 'One-time code on new sign-ins',
        on: true,
      },
    ],
  },
];

const SESSIONS = [
  {
    device: 'MacBook Pro · Chrome',
    place: 'Ahmedabad, IN',
    when: 'Active now',
    chip: 'This device',
    chipBg: '#E2F0E9',
    chipFg: colors.success,
    chipBorder: '#D8E8E0',
  },
  {
    device: 'iPhone 15 · Paisa app',
    place: 'Ahmedabad, IN',
    when: '2 hours ago',
    chip: 'Sign out',
    chipBg: colors.surfaceSubtle,
    chipFg: colors.textMuted,
    chipBorder: colors.border,
  },
  {
    device: 'iPad Air · Safari',
    place: 'Mumbai, IN',
    when: 'Yesterday, 9:14 PM',
    chip: 'Sign out',
    chipBg: colors.surfaceSubtle,
    chipFg: colors.textMuted,
    chipBorder: colors.border,
  },
];

const LOGIN_HISTORY = [
  {
    label: 'Successful sign-in',
    device: 'MacBook Pro · Chrome',
    when: 'Today, 9:02 AM',
    color: colors.success,
  },
  {
    label: 'Successful sign-in',
    device: 'iPhone 15 · Paisa app',
    when: 'Today, 7:41 AM',
    color: colors.success,
  },
  {
    label: 'Backup completed',
    device: 'Cloud · encrypted',
    when: 'Today, 3:00 AM',
    color: colors.accent,
  },
  {
    label: 'Failed PIN attempt',
    device: 'iPad Air · Safari',
    when: 'Yesterday, 11:26 PM',
    color: colors.dangerValue,
  },
  {
    label: 'Password changed',
    device: 'MacBook Pro · Chrome',
    when: '14 Jul 2026',
    color: '#96702C',
  },
];

const LOCK_OPTIONS = [1, 5, 15, 30];

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

/** Design HTML `isSecurity` — vault, backup, and privacy controls. */
export default function SecurityScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [lockMins, setLockMins] = useState(5);
  const [sections, setSections] = useState(SEC_SECTIONS);

  const toggle = (sectionIdx: number, key: string) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIdx
          ? {
              ...s,
              items: s.items.map((i) => (i.key === key ? { ...i, on: !i.on } : i)),
            }
          : s,
      ),
    );
  };

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
          <Text style={styles.vaultTitle}>Encrypted & locked</Text>
          <Text style={styles.vaultSub}>Only this device holds your key.</Text>
          <Pressable style={styles.lockBtn}>
            <Feather name="lock" size={14} color="#F2FBF7" />
            <Text style={styles.lockBtnText}>Lock now</Text>
          </Pressable>
        </LinearGradient>

        <Card style={styles.infoCard}>
          <Text style={styles.infoLabel}>Last backup</Text>
          <Text style={styles.infoValue}>Today, 3:00 AM</Text>
          <Text style={styles.infoSub}>4.2 MB encrypted</Text>
          <Pressable style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Restore backup</Text>
          </Pressable>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoLabel}>Auto-logout after</Text>
          <View style={styles.lockRow}>
            {LOCK_OPTIONS.map((v) => {
              const active = lockMins === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setLockMins(v)}
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
          <Pressable style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Change password</Text>
          </Pressable>
        </Card>
      </DesignGrid>

      <DesignGrid cols={3} tabletCols={1} narrowCols={1}>
        {sections.map((s, si) => (
          <Card key={s.title} size="large" style={styles.secCard}>
            <DesignSectionHeader title={s.title} />
            {s.items.map((i) => (
              <ToggleRow key={i.key} item={i} onToggle={() => toggle(si, i.key)} />
            ))}
          </Card>
        ))}
      </DesignGrid>

      <DesignGrid cols={2} tabletCols={1} narrowCols={1}>
        <Card size="large" style={styles.secCard}>
          <DesignSectionHeader title="Trusted devices & sessions" />
          {SESSIONS.map((s) => (
            <View key={s.device} style={styles.sessionRow}>
              <View style={styles.deviceIcon}>
                <Feather name="monitor" size={15} color={colors.textMuted} />
              </View>
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionDevice}>{s.device}</Text>
                <Text style={styles.sessionMeta}>
                  {s.place} · {s.when}
                </Text>
              </View>
              <Text
                style={[
                  styles.sessionChip,
                  {
                    backgroundColor: s.chipBg,
                    color: s.chipFg,
                    borderColor: s.chipBorder,
                  },
                ]}
              >
                {s.chip}
              </Text>
            </View>
          ))}
        </Card>

        <Card size="large" style={styles.secCard}>
          <DesignSectionHeader title="Login history" />
          {LOGIN_HISTORY.map((l) => (
            <View key={`${l.label}-${l.when}`} style={styles.historyRow}>
              <View style={[styles.historyDot, { backgroundColor: l.color }]} />
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionDevice}>{l.label}</Text>
                <Text style={styles.sessionMeta}>{l.device}</Text>
              </View>
              <Text style={styles.historyWhen}>{l.when}</Text>
            </View>
          ))}
        </Card>
      </DesignGrid>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
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
  outlineBtn: {
    marginTop: 14,
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
});

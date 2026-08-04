import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { POLICY_KINDS } from '@/components/modal/kinds';
import {
  ModalAmountField,
  ModalBody,
  ModalChips,
  ModalDateNoteRow,
  ModalError,
  ModalHeader,
  ModalSave,
  ModalTextField,
} from '@/components/modal/ModalForm';
import { Sheet } from '@/components/Sheet';
import {
  useCreatePolicy,
  useDeletePolicy,
  usePolicies,
  usePoliciesSummary,
  useTogglePolicyPremiumPaid,
} from '@/features/policies/hooks';
import { getApiErrorMessage } from '@/utils/errors';
import { compact, fmt } from '@/mock/format';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatShortDate } from '@/utils/date';

const LEAD_DAYS = 15;

const POLICY_COLORS: Record<string, [string, string]> = {
  TERM: ['#EDE9FE', '#5B54D6'],
  HLTH: ['#E2F0E9', '#2F7D5D'],
  MOTOR: ['#E5EEF8', '#3E6E9E'],
  ACC: ['#FAEED8', '#96702C'],
  HOME: ['#F9E7E1', '#C2543D'],
};

const POLICY_TAGS: Record<string, string> = {
  TERM: 'TERM',
  HLTH: 'HLTH',
  MOTOR: 'MTR',
  ACC: 'ACC',
  HOME: 'HSG',
};

function dayDiff(a: string, b: string): number {
  return Math.round(
    (new Date(`${a}T00:00:00`).getTime() - new Date(`${b}T00:00:00`).getTime()) / 86400000,
  );
}

function formatFrequency(freq: string): string {
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

/** Design HTML `isPolicy` — cover hero, premiums, policy cards. */
export default function PolicyScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data: policiesData } = usePolicies();
  const { data: summary } = usePoliciesSummary();
  const [addOpen, setAddOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const deletePolicy = useDeletePolicy();
  const togglePremiumPaid = useTogglePolicyPremiumPaid();

  function confirmDeletePolicy(policyId: string) {
    Alert.alert('Delete this policy?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePolicy.mutate(policyId) },
    ]);
  }

  const policiesList = policiesData ?? summary?.policies ?? [];

  const stats = useMemo(() => {
    const cover = summary
      ? Number(summary.total_cover)
      : policiesList.reduce((a, p) => a + Number(p.cover_amount), 0);
    const premiumYear = summary
      ? Number(summary.annual_premium)
      : policiesList.reduce((a, p) => a + Number(p.premium), 0);
    const sorted = [...policiesList].sort((a, b) => a.renewal_date.localeCompare(b.renewal_date));
    const nextPol = summary?.next_renewal ?? sorted[0] ?? null;
    return { cover, premiumYear, nextPol, count: summary?.policy_count ?? policiesList.length };
  }, [policiesList, summary]);

  const policies = useMemo(
    () =>
      [...policiesList]
        .sort((a, b) => a.renewal_date.localeCompare(b.renewal_date))
        .map((p) => {
          const dd = dayDiff(p.renewal_date, today);
          const [bg, fg] = POLICY_COLORS[p.kind] ?? ['#EDE9FE', '#5B54D6'];
          return {
            id: p.id,
            name: p.name,
            provider: p.provider,
            tag: POLICY_TAGS[p.kind] ?? p.kind,
            bg,
            fg,
            cover: compact(Number(p.cover_amount)),
            premium: fmt(Number(p.premium)),
            freq: formatFrequency(p.frequency),
            dueDate: formatShortDate(p.renewal_date),
            dueChip:
              dd < 0
                ? `${Math.abs(dd)}d overdue`
                : dd === 0
                  ? 'Due today'
                  : dd <= LEAD_DAYS
                    ? `in ${dd} days`
                    : 'Active',
            dueBg: dd < 0 ? '#F9E7E1' : dd <= LEAD_DAYS ? '#FAEED8' : '#E2F0E9',
            dueFg: dd < 0 ? colors.dangerValue : dd <= LEAD_DAYS ? '#96702C' : colors.success,
            premiumPaid: p.premium_paid,
          };
        }),
    [policiesList, today],
  );

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <LinearGradient
          colors={['#2B2758', '#191637']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.coverHero}
        >
          <Text style={styles.coverEyebrow}>Total life & health cover</Text>
          <Text style={[styles.coverValue, moneyTextStyle]}>{compact(stats.cover)}</Text>
          <Text style={styles.coverNote}>{stats.count} policies · life, health and accident</Text>
        </LinearGradient>

        <DesignKpiCard
          label="Premiums per year"
          value={fmt(stats.premiumYear)}
          sub={`≈ ${fmt(Math.round(stats.premiumYear / 12))} a month set aside`}
        />
        <DesignKpiCard
          label="Next renewal"
          value={stats.nextPol ? formatShortDate(stats.nextPol.renewal_date) : '—'}
          sub={stats.nextPol ? stats.nextPol.name : 'Add a policy to track renewals'}
        />
      </DesignGrid>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Your policies</Text>
        <Pressable style={styles.darkBtn} onPress={() => setAddOpen(true)}>
          <Feather name="plus" size={14} color={colors.surface} />
          <Text style={styles.darkBtnLabel}>Add policy</Text>
        </Pressable>
      </View>

      <DesignGrid cols={2} tabletCols={1} narrowCols={1}>
        {policies.map((p) => (
          <Card key={p.id} size="large" style={styles.policyCard}>
            <View style={styles.policyTop}>
              <View style={[styles.policyTag, { backgroundColor: p.bg }]}>
                <Text style={[styles.policyTagText, { color: p.fg }]}>{p.tag}</Text>
              </View>
              <View style={styles.policyCopy}>
                <Text style={styles.policyName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.policyProvider}>{p.provider}</Text>
              </View>
              <View style={[styles.dueChip, { backgroundColor: p.dueBg }]}>
                <Text style={[styles.dueChipText, { color: p.dueFg }]}>{p.dueChip}</Text>
              </View>
            </View>
            <View style={styles.policyStats}>
              <View style={styles.policyStat}>
                <Text style={styles.policyStatLabel}>Sum assured</Text>
                <Text style={[styles.policyStatValue, moneyTextStyle]}>{p.cover}</Text>
              </View>
              <View style={styles.policyStat}>
                <Text style={styles.policyStatLabel}>Premium · {p.freq}</Text>
                <Text style={[styles.policyStatValue, moneyTextStyle]}>{p.premium}</Text>
              </View>
            </View>
            <View style={styles.policyFooter}>
              <Text style={styles.dueDate}>Due {p.dueDate}</Text>
              <Pressable
                style={[styles.payBtn, p.premiumPaid && styles.payBtnPaid]}
                disabled={togglePremiumPaid.isPending}
                onPress={() => togglePremiumPaid.mutate(p.id)}
              >
                <Text style={[styles.payBtnLabel, p.premiumPaid && styles.payBtnLabelPaid]}>
                  {p.premiumPaid ? 'Paid' : 'Mark premium paid'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Delete policy"
                hitSlop={8}
                onPress={() => confirmDeletePolicy(p.id)}
              >
                <Feather name="trash-2" size={15} color={colors.textCaption} />
              </Pressable>
            </View>
          </Card>
        ))}
      </DesignGrid>

      <AddPolicySheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </ScreenScaffold>
  );
}

/** Mockup `policy` modal — "Add policy". */
function AddPolicySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const createPolicy = useCreatePolicy();
  const [premium, setPremium] = useState('');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [kind, setKind] = useState('TERM');
  const [cover, setCover] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function close() {
    setPremium('');
    setName('');
    setProvider('');
    setKind('TERM');
    setCover('');
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setError('');
    onClose();
  }

  function submit() {
    if (!premium || Number(premium) <= 0) {
      setError('Enter the premium amount.');
      return;
    }
    if (!name.trim() || !provider.trim()) {
      setError('Add the policy name and insurer.');
      return;
    }
    if (!cover || Number(cover) <= 0) {
      setError('Enter the sum assured.');
      return;
    }
    createPolicy.mutate(
      {
        name: name.trim(),
        provider: provider.trim(),
        kind,
        cover_amount: cover.trim(),
        premium: premium.trim(),
        frequency: 'yearly',
        renewal_date: date,
        note: note.trim() || undefined,
      },
      {
        onSuccess: close,
        onError: (error) =>
          setError(getApiErrorMessage(error, 'Could not save that policy. Try again.')),
      },
    );
  }

  return (
    <Sheet visible={visible} onClose={close} variant="center">
      <ModalHeader title="Add policy" onClose={close} />
      <ModalBody>
        <ModalAmountField label="Premium amount" value={premium} onChangeText={setPremium} />
        <ModalTextField
          label="Policy name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Term plan"
        />
        <ModalTextField
          label="Insurer"
          value={provider}
          onChangeText={setProvider}
          placeholder="e.g. HDFC Life"
        />
        <ModalChips label="Policy type" options={POLICY_KINDS} value={kind} onChange={setKind} />
        <ModalTextField
          label="Sum assured"
          value={cover}
          onChangeText={setCover}
          placeholder="0"
          numeric
        />
        <ModalDateNoteRow
          dateLabel="Next renewal date"
          date={date}
          onDate={setDate}
          note={note}
          onNote={setNote}
        />
        <ModalError message={error} />
        <ModalSave label="Save" onPress={submit} loading={createPolicy.isPending} />
      </ModalBody>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  coverHero: {
    borderRadius: radius.cardLarge,
    paddingVertical: 22,
    paddingHorizontal: 24,
    flex: 1,
    minWidth: 0,
    shadowColor: 'rgba(25,22,55,.9)',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.35,
    shadowRadius: 44,
    elevation: 8,
  },
  coverEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: 'rgba(244,243,255,.5)',
  },
  coverValue: {
    fontSize: 32,
    color: '#F4F3FF',
    marginTop: 8,
    letterSpacing: -1.44,
  },
  coverNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: 'rgba(244,243,255,.62)',
    marginTop: 6,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  darkBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
  },
  darkBtnLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.surface,
  },
  policyCard: { gap: 14 },
  policyTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  policyTag: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTagText: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  policyCopy: { flex: 1, minWidth: 0, gap: 2 },
  policyName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    letterSpacing: -0.28,
    color: colors.textPrimary,
  },
  policyProvider: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  dueChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 },
  dueChipText: { fontFamily: fontFamily.extrabold, fontSize: 11 },
  policyStats: { flexDirection: 'row', gap: 10 },
  policyStat: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  policyStatLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textCaption,
  },
  policyStatValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    letterSpacing: -0.48,
    color: colors.textPrimary,
    marginTop: 3,
  },
  policyFooter: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' },
  dueDate: { fontFamily: fontFamily.semibold, fontSize: 12, color: colors.textCaption },
  payBtn: {
    marginLeft: 'auto',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.surface,
  },
  payBtnPaid: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payBtnLabelPaid: {
    color: colors.success,
  },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sheetForm: { gap: 12 },
  sheetInput: {
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surfaceSubtle,
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  saveBtn: { width: '100%', height: 50, borderRadius: 15 },
});

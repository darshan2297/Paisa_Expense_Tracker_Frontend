import { Feather } from '@expo/vector-icons';
import { createElement, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card } from '@/components/Card';
import { DesignGridLead } from '@/components/design/DesignGrid';
import { HeroCard } from '@/components/HeroCard';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import {
  ModalAmountField,
  ModalBody,
  ModalChips,
  ModalError,
  ModalHeader,
  ModalSave,
  ModalTextField,
} from '@/components/modal/ModalForm';
import { FIXED_KINDS } from '@/components/modal/kinds';
import { Sheet } from '@/components/Sheet';
import { useCategories } from '@/features/categories/hooks';
import {
  useBudgetSettings,
  useBudgetSummary,
  useCreateFixedCommitment,
  useDeleteFixedCommitment,
  useFixedCommitments,
  useToggleFixedCommitmentPaid,
  useUpdateBudgetSettings,
  useUpdateFixedCommitment,
} from '@/features/budget/hooks';
import type { FixedCommitment, FixedCommitmentKind } from '@/features/budget/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { formatINR } from '@/utils/currency';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

/** Mockup `budgetPresets` / `leadOptions`. */
const AMOUNT_PRESETS = [30000, 45000, 55000, 75000, 100000];
const ALERT_PCT_PRESETS = [10, 15, 20, 25, 30, 40];
const LEAD_DAY_PRESETS = [3, 5, 7, 10, 15, 30];

/** Mockup `FIXED_TYPES` default category names when a kind chip is picked. */
const KIND_DEFAULT_CATEGORY: Record<FixedCommitmentKind, string> = {
  emi: 'Other',
  home_loan: 'Rent',
  personal_loan: 'Other',
  subscription: 'Entertainment',
  bill: 'Utilities',
};

const KIND_LABELS: Record<FixedCommitmentKind, string> = {
  emi: 'EMI',
  home_loan: 'Home loan',
  personal_loan: 'Personal loan',
  subscription: 'Subscription',
  bill: 'Bill',
};

/** Whole-rupee string — API may return `"0.00"`. */
function normalizeAmount(raw: string): string {
  const digits = String(raw ?? '').replace(/[^0-9]/g, '');
  if (!digits) return '0';
  return String(parseInt(digits, 10));
}

function thresholdNote(
  budget: number,
  alertPct: number,
  triggered: boolean,
): {
  text: string;
  danger: boolean;
} {
  const triggerAt = budget * (1 - alertPct / 100);
  const leftAtTrigger = budget * (alertPct / 100);
  return {
    text: `You will be alerted once spending crosses ${formatINR(triggerAt)} — ${formatINR(leftAtTrigger)} left.`,
    danger: triggered,
  };
}

/** Mockup `<input type="range" min=5 max=60 step=5>` — web range, native chips. */
function AlertPctControl({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'range',
      min: 5,
      max: 60,
      step: 5,
      value,
      onChange: (e: { target: { value: string } }) => onChange(parseInt(e.target.value, 10) || 10),
      style: {
        width: '100%',
        marginTop: 14,
        accentColor: '#5B54D6',
        cursor: 'pointer',
      },
    });
  }
  return (
    <View style={styles.presetRow}>
      {ALERT_PCT_PRESETS.map((preset) => (
        <PresetChip
          key={preset}
          label={`${preset}%`}
          active={value === preset}
          onPress={() => onChange(preset)}
        />
      ))}
    </View>
  );
}

type BudgetFormValues = {
  monthly_amount: string;
  alert_pct: number;
  reminder_lead_days: number;
};

/** The mockup's `isPlanned` screen: budget settings + fixed monthly
 * commitments, reinterpreted as a single scrolling column instead of the
 * desktop's two-column layout.
 */
export default function PlannedScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [addCommitmentOpen, setAddCommitmentOpen] = useState(false);
  const [editCommitment, setEditCommitment] = useState<FixedCommitment | null>(null);

  const budgetSettings = useBudgetSettings();
  const budgetSummary = useBudgetSummary(month);
  const updateBudgetSettings = useUpdateBudgetSettings();
  const fixedCommitments = useFixedCommitments(month);
  const toggleFixedCommitmentPaid = useToggleFixedCommitmentPaid(month);
  const deleteFixedCommitment = useDeleteFixedCommitment(month);

  function confirmDeleteFixedCommitment(commitmentId: string) {
    Alert.alert('Delete this commitment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteFixedCommitment.mutate(commitmentId),
      },
    ]);
  }

  const { watch, setValue, reset } = useForm<BudgetFormValues>({
    defaultValues: { monthly_amount: '0', alert_pct: 20, reminder_lead_days: 15 },
  });

  // Seed once from server — avoid clobbering in-flight edits after autosave.
  const [budgetSeeded, setBudgetSeeded] = useState(false);
  useEffect(() => {
    if (!budgetSettings.data || budgetSeeded) return;
    reset({
      monthly_amount: normalizeAmount(budgetSettings.data.monthly_amount),
      alert_pct: budgetSettings.data.alert_pct,
      reminder_lead_days: budgetSettings.data.reminder_lead_days,
    });
    setBudgetSeeded(true);
  }, [budgetSettings.data, budgetSeeded, reset]);

  const amount = watch('monthly_amount');
  const alertPct = watch('alert_pct');
  const leadDays = watch('reminder_lead_days');

  // Mockup has no Save button — persists on every change via `put(...)`.
  useEffect(() => {
    if (!budgetSeeded || !budgetSettings.data) return;
    const nextAmount = normalizeAmount(amount || '0');
    const serverAmount = normalizeAmount(budgetSettings.data.monthly_amount);
    const dirty =
      nextAmount !== serverAmount ||
      alertPct !== budgetSettings.data.alert_pct ||
      leadDays !== budgetSettings.data.reminder_lead_days;
    if (!dirty) return;
    const timer = setTimeout(() => {
      updateBudgetSettings.mutate({
        monthly_amount: nextAmount,
        alert_pct: alertPct,
        reminder_lead_days: leadDays,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [amount, alertPct, leadDays, budgetSeeded, budgetSettings.data, updateBudgetSettings.mutate]);

  const note = thresholdNote(
    Number(normalizeAmount(amount || '0')) ||
      Number(normalizeAmount(budgetSummary.data?.monthly_amount ?? '0')) ||
      0,
    alertPct,
    Boolean(budgetSummary.data?.alert_triggered),
  );

  const fixedList = fixedCommitments.data ?? [];
  const fixedTotal = useMemo(
    () => fixedList.reduce((sum, c) => sum + Number(c.amount), 0),
    [fixedList],
  );
  const fixedPaidCount = fixedList.filter((c) => c.paid_this_month).length;
  const fixedDueTotal = useMemo(
    () => fixedList.filter((c) => !c.paid_this_month).reduce((sum, c) => sum + Number(c.amount), 0),
    [fixedList],
  );

  const budgetHero = budgetSummary.data ? (
    <HeroCard style={styles.hero}>
      <Text style={styles.heroEyebrow}>Remaining · {formatYearMonthLabel(month)}</Text>
      <Text style={[styles.heroValue, moneyTextStyle]}>
        {formatINR(Number(budgetSummary.data.remaining))}
      </Text>
      <View style={styles.heroBarTrack}>
        <View
          style={[
            styles.heroBarFill,
            {
              width: `${Math.max(0, Math.min(100, budgetSummary.data.pct_remaining))}%`,
              backgroundColor:
                budgetSummary.data.pct_remaining <= alertPct ? colors.heroDanger : '#8079FF',
            },
          ]}
        />
      </View>
      <Text style={styles.heroNote}>
        {formatINR(Number(budgetSummary.data.spent))} spent ·{' '}
        {budgetSummary.data.days_remaining_in_month} days left
      </Text>
      <View style={styles.heroStats}>
        <View style={styles.heroStat}>
          <Text style={styles.heroStatLabel}>Left per day</Text>
          <Text style={[styles.heroStatValue, moneyTextStyle]}>
            {formatINR(Number(budgetSummary.data.per_day_left))}
          </Text>
        </View>
        <View style={styles.heroStat}>
          <Text style={styles.heroStatLabel}>Fixed committed</Text>
          <Text style={[styles.heroStatValue, moneyTextStyle]}>{formatINR(fixedTotal)}</Text>
        </View>
      </View>
    </HeroCard>
  ) : null;

  const budgetPanel = (
    <Card size="large" style={styles.budgetCard}>
      <Text style={styles.cardTitle}>Monthly spending budget</Text>
      <Text style={styles.cardSubtitle}>Applies to every month unless you change it.</Text>

      <View style={styles.amountField}>
        <Text style={styles.amountSymbol}>₹</Text>
        <TextInput
          value={amount}
          onChangeText={(value) =>
            setValue('monthly_amount', normalizeAmount(value || '0'), { shouldDirty: true })
          }
          keyboardType="numeric"
          inputMode="numeric"
          placeholder="0"
          placeholderTextColor={colors.textCaption}
          style={[styles.amountInput, moneyTextStyle]}
        />
      </View>
      <View style={styles.presetRow}>
        {AMOUNT_PRESETS.map((preset) => (
          <PresetChip
            key={preset}
            label={formatINR(preset)}
            active={normalizeAmount(amount || '0') === String(preset)}
            onPress={() => setValue('monthly_amount', String(preset), { shouldDirty: true })}
          />
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>Warn me when</Text>
        <Text style={styles.sectionLabelAccent}>{alertPct}%</Text>
        <Text style={styles.sectionLabelMuted}>of the budget is left</Text>
      </View>
      <AlertPctControl
        value={alertPct}
        onChange={(next) => setValue('alert_pct', next, { shouldDirty: true })}
      />
      <View style={[styles.noteBox, note.danger ? styles.noteBoxDanger : styles.noteBoxNeutral]}>
        <Text style={[styles.noteText, note.danger ? styles.noteTextDanger : styles.noteTextInfo]}>
          {note.text}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>Remind me</Text>
        <Text style={styles.sectionLabelAccent}>{leadDays} days</Text>
        <Text style={styles.sectionLabelMuted}>before any EMI or premium is due</Text>
      </View>
      <View style={styles.presetRow}>
        {LEAD_DAY_PRESETS.map((preset) => (
          <PresetChip
            key={preset}
            label={`${preset} days`}
            active={leadDays === preset}
            onPress={() => setValue('reminder_lead_days', preset, { shouldDirty: true })}
          />
        ))}
      </View>
    </Card>
  );

  return (
    <>
      <ScreenScaffold month={month} onMonthChange={setMonth}>
        <DesignGridLead lead={budgetPanel} side={budgetHero ?? <View />} />

        <View style={styles.commitmentsCard}>
          <View style={styles.commitmentsHeader}>
            <View style={styles.commitmentsHeaderText}>
              <Text style={styles.cardTitle}>Fixed monthly commitments</Text>
              <Text style={[styles.cardSubtitle, styles.commitmentsSubtitle]}>
                EMIs, loans and subscriptions that repeat every month.
              </Text>
            </View>
            <Pressable
              onPress={() => setAddCommitmentOpen(true)}
              style={({ pressed }) => [
                styles.addCommitmentButton,
                pressed && styles.addCommitmentButtonPressed,
              ]}
            >
              <Feather name="plus" size={14} color="#453F37" />
              <Text style={styles.addCommitmentButtonLabel}>Add commitment</Text>
            </Pressable>
          </View>

          <View style={styles.commitmentsSubHeader}>
            <Text style={styles.commitmentsSubLabel}>
              {fixedPaidCount} of {fixedList.length} paid this month
            </Text>
            <Text style={styles.commitmentsSubDue}>{formatINR(fixedDueTotal)} due</Text>
          </View>

          {fixedCommitments.isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loading} />
          ) : fixedList.length > 0 ? (
            fixedList.map((commitment) => (
              <View key={commitment.id} style={styles.commitmentRow}>
                <Pressable
                  onPress={() => setEditCommitment(commitment)}
                  style={styles.commitmentMain}
                >
                  <View
                    style={[
                      styles.commitmentTag,
                      { backgroundColor: `${commitment.category.color}26` },
                    ]}
                  >
                    <Text style={[styles.commitmentTagText, { color: commitment.category.color }]}>
                      {KIND_LABELS[commitment.kind].slice(0, 3).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commitmentText}>
                    <Text style={styles.commitmentName} numberOfLines={1}>
                      {commitment.name}
                    </Text>
                    <Text style={styles.commitmentSub}>
                      {KIND_LABELS[commitment.kind]} · due {commitment.due_day}
                      {commitment.due_day === 1
                        ? 'st'
                        : commitment.due_day === 2
                          ? 'nd'
                          : commitment.due_day === 3
                            ? 'rd'
                            : 'th'}
                    </Text>
                  </View>
                </Pressable>
                <View
                  style={[
                    styles.commitmentStatus,
                    commitment.paid_this_month
                      ? styles.commitmentStatusPaid
                      : styles.commitmentStatusDue,
                  ]}
                >
                  <Text
                    style={[
                      styles.commitmentStatusLabel,
                      commitment.paid_this_month && styles.commitmentStatusLabelPaid,
                    ]}
                  >
                    {commitment.paid_this_month ? 'Paid' : 'Due'}
                  </Text>
                </View>
                <Text style={[styles.commitmentAmount, moneyTextStyle]}>
                  {formatINR(Number(commitment.amount))}
                </Text>
                <Pressable
                  onPress={() => toggleFixedCommitmentPaid.mutate(commitment.id)}
                  style={[
                    styles.commitmentAction,
                    commitment.paid_this_month
                      ? styles.commitmentActionPaid
                      : styles.commitmentActionUnpaid,
                  ]}
                >
                  <Text
                    style={[
                      styles.commitmentActionLabel,
                      commitment.paid_this_month && styles.commitmentActionLabelPaid,
                    ]}
                  >
                    {commitment.paid_this_month ? 'Paid' : 'Mark paid'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmDeleteFixedCommitment(commitment.id)}
                  hitSlop={8}
                  style={styles.deleteButton}
                >
                  <Feather name="trash-2" size={15} color={colors.textCaption} />
                </Pressable>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No fixed commitments yet</Text>
              <Text style={styles.emptyStateSub}>
                Add your home loan, personal loan or EMI once — it repeats every month.
              </Text>
            </View>
          )}
        </View>
      </ScreenScaffold>

      <AddCommitmentSheet
        visible={addCommitmentOpen}
        onClose={() => setAddCommitmentOpen(false)}
        month={month}
      />
      <EditCommitmentSheet
        visible={editCommitment !== null}
        commitment={editCommitment}
        month={month}
        onClose={() => setEditCommitment(null)}
      />
    </>
  );
}

type PresetChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function PresetChip({ label, active, onPress }: PresetChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.presetChip, active && styles.presetChipActive]}>
      <Text style={[styles.presetChipLabel, active && styles.presetChipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

type AddCommitmentSheetProps = {
  visible: boolean;
  month: string;
  onClose: () => void;
};

function AddCommitmentSheet({ visible, month, onClose }: AddCommitmentSheetProps) {
  const categories = useCategories();
  const createCommitment = useCreateFixedCommitment(month);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [kind, setKind] = useState<FixedCommitmentKind>('emi');
  const [error, setError] = useState('');

  const expenseCategories = (categories.data ?? []).filter((c) => c.kind === 'expense');
  const categoryOptions = expenseCategories.map((c) => ({
    id: c.id,
    label: c.name,
    color: c.color,
  }));

  // Prefer mockup defaults (EMI → Other) once categories arrive. Adjusting
  // state during render, guarded by comparing against the previous
  // open/categories-ready signal, avoids an effect for what's really just
  // "the sheet just became usable" - see React's "Adjusting state when a
  // prop changes". `reset()` clears `categoryId` on close, so reopening
  // re-triggers this the same way the effect version did.
  const autoPickSignal = visible && expenseCategories.length > 0 ? 'ready' : null;
  const [prevAutoPickSignal, setPrevAutoPickSignal] = useState(autoPickSignal);
  if (autoPickSignal !== prevAutoPickSignal) {
    setPrevAutoPickSignal(autoPickSignal);
    if (autoPickSignal && !categoryId) {
      const preferred =
        expenseCategories.find(
          (c) => c.name.toLowerCase() === KIND_DEFAULT_CATEGORY.emi.toLowerCase(),
        ) ?? expenseCategories[0];
      setCategoryId(preferred.id);
    }
  }

  function reset() {
    setName('');
    setCategoryId('');
    setAmount('');
    setDueDay('5');
    setKind('emi');
    setError('');
  }

  function close() {
    reset();
    onClose();
  }

  function selectKind(next: string) {
    const nextKind = next as FixedCommitmentKind;
    setKind(nextKind);
    const preferredName = KIND_DEFAULT_CATEGORY[nextKind];
    const match = expenseCategories.find(
      (c) => c.name.toLowerCase() === preferredName.toLowerCase(),
    );
    if (match) setCategoryId(match.id);
  }

  function submit() {
    const numericAmount = Number(amount);
    const numericDueDay = Math.min(28, Math.max(1, parseInt(dueDay, 10) || 1));
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!name.trim()) {
      setError('Give this commitment a name.');
      return;
    }
    if (!categoryId) {
      setError('Choose a category.');
      return;
    }

    createCommitment.mutate(
      {
        name: name.trim(),
        category_id: categoryId,
        amount: normalizeAmount(amount),
        due_day: numericDueDay,
        kind,
      },
      {
        onSuccess: close,
        onError: () => setError('Could not save that commitment. Try again.'),
      },
    );
  }

  return (
    <Sheet visible={visible} onClose={close} variant="center">
      <ModalHeader title="Add fixed commitment" onClose={close} />
      <ModalBody>
        <ModalAmountField label="Amount" value={amount} onChangeText={setAmount} />
        <ModalTextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Home loan EMI"
        />
        <ModalChips label="Type" options={FIXED_KINDS} value={kind} onChange={selectKind} />
        {categoryOptions.length > 0 ? (
          <ModalChips
            label="Category"
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
          />
        ) : null}
        <ModalTextField
          label="Due day of month"
          value={dueDay}
          onChangeText={setDueDay}
          placeholder="5"
          numeric
        />
        <ModalError message={error} />
        <ModalSave label="Save" onPress={submit} loading={createCommitment.isPending} />
      </ModalBody>
    </Sheet>
  );
}

function EditCommitmentSheet({
  visible,
  commitment,
  month,
  onClose,
}: {
  visible: boolean;
  commitment: FixedCommitment | null;
  month: string;
  onClose: () => void;
}) {
  if (!commitment) return null;

  return (
    <Sheet visible={visible} onClose={onClose} variant="center">
      <EditCommitmentForm
        key={commitment.id}
        commitment={commitment}
        month={month}
        onClose={onClose}
      />
    </Sheet>
  );
}

function EditCommitmentForm({
  commitment,
  month,
  onClose,
}: {
  commitment: FixedCommitment;
  month: string;
  onClose: () => void;
}) {
  const categories = useCategories();
  const updateCommitment = useUpdateFixedCommitment(month);
  const [name, setName] = useState(commitment.name);
  const [amount, setAmount] = useState(normalizeAmount(commitment.amount));
  const [dueDay, setDueDay] = useState(String(commitment.due_day));
  const [kind, setKind] = useState<FixedCommitmentKind>(commitment.kind);
  const [categoryId, setCategoryId] = useState(commitment.category.id);
  const [error, setError] = useState('');

  const expenseCategories = (categories.data ?? []).filter((c) => c.kind === 'expense');
  const categoryOptions = expenseCategories.map((c) => ({
    id: c.id,
    label: c.name,
    color: c.color,
  }));

  function submit() {
    const numericAmount = Number(amount);
    const numericDueDay = Math.min(28, Math.max(1, parseInt(dueDay, 10) || 1));
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!name.trim()) {
      setError('Give this commitment a name.');
      return;
    }
    updateCommitment.mutate(
      {
        commitmentId: commitment.id,
        payload: {
          name: name.trim(),
          amount: normalizeAmount(amount),
          due_day: numericDueDay,
          kind,
          category_id: categoryId,
        },
      },
      {
        onSuccess: onClose,
        onError: () => setError('Could not save changes. Try again.'),
      },
    );
  }

  return (
    <>
      <ModalHeader title="Edit fixed commitment" onClose={onClose} />
      <ModalBody>
        <ModalAmountField label="Amount" value={amount} onChangeText={setAmount} />
        <ModalTextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Home loan EMI"
        />
        <ModalChips
          label="Type"
          options={FIXED_KINDS}
          value={kind}
          onChange={(id) => setKind(id as FixedCommitmentKind)}
        />
        {categoryOptions.length > 0 ? (
          <ModalChips
            label="Category"
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
          />
        ) : null}
        <ModalTextField
          label="Due day of month"
          value={dueDay}
          onChangeText={setDueDay}
          placeholder="5"
          numeric
        />
        <ModalError message={error} />
        <ModalSave label="Save" onPress={submit} loading={updateCommitment.isPending} />
      </ModalBody>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: 24,
    paddingHorizontal: 26,
  },
  heroEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.heroTextEyebrow,
  },
  heroValue: {
    fontSize: 38,
    color: colors.heroText,
    marginTop: spacing.sm,
  },
  heroBarTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.heroFillSubtle,
    marginTop: 18,
    marginBottom: 10,
    overflow: 'hidden',
  },
  heroBarFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  heroNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.heroTextMuted,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 20,
  },
  heroStat: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: 'rgba(252,250,247,.07)',
  },
  heroStatLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: 'rgba(252,250,247,.5)',
  },
  heroStatValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    color: colors.heroText,
    marginTop: 4,
  },
  budgetCard: {
    paddingTop: 24,
    paddingBottom: 26,
    paddingHorizontal: 26,
  },
  cardTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 3,
    marginBottom: 18,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 56,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
  },
  amountSymbol: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: '#B7B0A6',
  },
  amountInput: {
    flex: 1,
    fontFamily: fontFamily.extrabold,
    fontSize: 25,
    color: colors.textPrimary,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  presetChip: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  presetChipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  presetChipLabelActive: {
    color: colors.heroText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 22,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 9,
  },
  sectionLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  sectionLabelAccent: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: colors.accent,
  },
  sectionLabelMuted: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  noteBox: {
    marginTop: 14,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 14,
  },
  commitmentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 160,
  },
  noteBoxNeutral: {
    backgroundColor: '#F1EFFE',
  },
  noteBoxDanger: {
    backgroundColor: colors.dangerTint,
  },
  noteText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
  },
  noteTextInfo: {
    color: colors.accent,
  },
  noteTextDanger: {
    color: colors.dangerValue,
  },
  commitmentsCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  commitmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 16,
    flexWrap: 'wrap',
  },
  commitmentsHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  commitmentsSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: '#F8F5F1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },
  commitmentsSubLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: '#948E85',
  },
  commitmentsSubDue: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#948E85',
  },
  commitmentsSubtitle: {
    marginBottom: 0,
  },
  addCommitmentButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  addCommitmentButtonPressed: {
    backgroundColor: colors.divider,
  },
  addCommitmentButtonLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: '#453F37',
  },
  loading: {
    marginVertical: spacing.xxl,
  },
  commitmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexWrap: 'wrap',
  },
  commitmentTag: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitmentTagText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
  },
  commitmentText: {
    flex: 1,
    minWidth: 100,
    gap: 3,
  },
  commitmentName: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  commitmentSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  commitmentStatus: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
  },
  commitmentStatusPaid: {
    backgroundColor: colors.successTint,
  },
  commitmentStatusDue: {
    backgroundColor: colors.dangerTint,
  },
  commitmentStatusLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11.5,
    color: colors.dangerValue,
  },
  commitmentStatusLabelPaid: {
    color: colors.success,
  },
  commitmentAmount: {
    fontSize: 14.5,
    color: colors.textPrimary,
  },
  commitmentAction: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  commitmentActionUnpaid: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  commitmentActionPaid: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  commitmentActionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.surface,
  },
  commitmentActionLabelPaid: {
    color: colors.textMuted,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  editButton: {
    padding: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  emptyState: {
    paddingVertical: 44,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyStateSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
    textAlign: 'center',
    maxWidth: 320,
    paddingHorizontal: 22,
  },
});

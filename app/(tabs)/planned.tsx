import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CategoryPicker } from '@/components/CategoryPicker';
import { DesignGridLead } from '@/components/design/DesignGrid';
import { HeroCard } from '@/components/HeroCard';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Sheet } from '@/components/Sheet';
import { useCategories } from '@/features/categories/hooks';
import type { Category } from '@/features/categories/types';
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
import { fontFamily, fontSize, moneyTextStyle } from '@/theme/typography';
import { formatINR } from '@/utils/currency';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

const AMOUNT_PRESETS = [20000, 30000, 40000, 55000, 75000, 100000];
const ALERT_PCT_PRESETS = [10, 15, 20, 25, 30, 40];
const LEAD_DAY_PRESETS = [3, 7, 15, 30];

const KIND_LABELS: Record<FixedCommitmentKind, string> = {
  emi: 'EMI',
  home_loan: 'Home loan',
  personal_loan: 'Personal loan',
  subscription: 'Subscription',
  bill: 'Bill',
};

function thresholdNote(pctRemaining: number, alertPct: number): { text: string; danger: boolean } {
  if (pctRemaining <= alertPct) {
    return {
      text: `Only ${pctRemaining.toFixed(0)}% of your budget is left this month.`,
      danger: true,
    };
  }
  return {
    text: `${pctRemaining.toFixed(0)}% of your budget is still left — you're on track.`,
    danger: false,
  };
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

  const { watch, setValue, reset, handleSubmit } = useForm<BudgetFormValues>({
    defaultValues: { monthly_amount: '', alert_pct: 20, reminder_lead_days: 15 },
  });

  // Repopulate the form once settings have loaded (or change elsewhere,
  // e.g. after a successful save) - `reset` replaces the form's values
  // without marking it as user-dirty. Mirrors profile.tsx's pattern.
  useEffect(() => {
    if (budgetSettings.data) {
      reset({
        monthly_amount: budgetSettings.data.monthly_amount,
        alert_pct: budgetSettings.data.alert_pct,
        reminder_lead_days: budgetSettings.data.reminder_lead_days,
      });
    }
  }, [budgetSettings.data, reset]);

  const amount = watch('monthly_amount');
  const alertPct = watch('alert_pct');
  const leadDays = watch('reminder_lead_days');

  const saveBudget = handleSubmit((values) => {
    const numericAmount = Number(values.monthly_amount);
    if (!values.monthly_amount || Number.isNaN(numericAmount) || numericAmount < 0) {
      return;
    }
    updateBudgetSettings.mutate(values);
  });

  const note = budgetSummary.data
    ? thresholdNote(budgetSummary.data.pct_remaining, alertPct)
    : null;

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
          onChangeText={(value) => setValue('monthly_amount', value)}
          keyboardType="numeric"
          style={styles.amountInput}
        />
      </View>
      <View style={styles.presetRow}>
        {AMOUNT_PRESETS.map((preset) => (
          <PresetChip
            key={preset}
            label={formatINR(preset)}
            active={amount === String(preset)}
            onPress={() => setValue('monthly_amount', String(preset))}
          />
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>
        Warn me when <Text style={styles.sectionLabelAccent}>{alertPct}%</Text> of the budget is
        left
      </Text>
      <View style={styles.presetRow}>
        {ALERT_PCT_PRESETS.map((preset) => (
          <PresetChip
            key={preset}
            label={`${preset}%`}
            active={alertPct === preset}
            onPress={() => setValue('alert_pct', preset)}
          />
        ))}
      </View>
      {note ? (
        <View style={[styles.noteBox, note.danger ? styles.noteBoxDanger : styles.noteBoxNeutral]}>
          <Text style={[styles.noteText, note.danger && styles.noteTextDanger]}>{note.text}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>
        Remind me <Text style={styles.sectionLabelAccent}>{leadDays} days</Text> before any EMI or
        premium is due
      </Text>
      <View style={styles.presetRow}>
        {LEAD_DAY_PRESETS.map((preset) => (
          <PresetChip
            key={preset}
            label={`${preset}d`}
            active={leadDays === preset}
            onPress={() => setValue('reminder_lead_days', preset)}
          />
        ))}
      </View>

      <Button label="Save budget" onPress={saveBudget} loading={updateBudgetSettings.isPending} />
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
                  onPress={() => deleteFixedCommitment.mutate(commitment.id)}
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

const KIND_OPTIONS: FixedCommitmentKind[] = [
  'emi',
  'home_loan',
  'personal_loan',
  'subscription',
  'bill',
];

function AddCommitmentSheet({ visible, month, onClose }: AddCommitmentSheetProps) {
  const categories = useCategories();
  const createCommitment = useCreateFixedCommitment(month);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [kind, setKind] = useState<FixedCommitmentKind>('emi');
  const [error, setError] = useState('');

  const expenseCategories = (categories.data ?? []).filter((c) => c.kind === 'expense');

  function reset() {
    setName('');
    setCategory(null);
    setAmount('');
    setDueDay('5');
    setKind('emi');
    setError('');
  }

  function submit() {
    const numericAmount = Number(amount);
    const numericDueDay = Number(dueDay);
    if (!name.trim()) {
      setError('Give this commitment a name.');
      return;
    }
    if (!category) {
      setError('Choose a category.');
      return;
    }
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!Number.isInteger(numericDueDay) || numericDueDay < 1 || numericDueDay > 28) {
      setError('Due day must be between 1 and 28.');
      return;
    }

    createCommitment.mutate(
      { name: name.trim(), category_id: category.id, amount, due_day: numericDueDay, kind },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: () => setError('Could not save that commitment. Try again.'),
      },
    );
  }

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <Text style={styles.sheetTitle}>Add commitment</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name (e.g. Home loan EMI)"
        placeholderTextColor={colors.textCaption}
        style={styles.noteInput}
      />

      <View style={styles.presetRow}>
        {KIND_OPTIONS.map((option) => (
          <PresetChip
            key={option}
            label={KIND_LABELS[option]}
            active={kind === option}
            onPress={() => setKind(option)}
          />
        ))}
      </View>

      <View style={styles.amountField}>
        <Text style={styles.amountSymbol}>₹</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={colors.textCaption}
          keyboardType="numeric"
          style={styles.amountInput}
        />
      </View>

      <TextInput
        value={dueDay}
        onChangeText={setDueDay}
        placeholder="Due day of month (1-28)"
        placeholderTextColor={colors.textCaption}
        keyboardType="numeric"
        style={styles.noteInput}
      />

      <CategoryPicker
        categories={expenseCategories}
        selectedId={category?.id ?? null}
        onSelect={setCategory}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button label="Save commitment" onPress={submit} loading={createCommitment.isPending} />
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
    <Sheet visible={visible} onClose={onClose}>
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
  const updateCommitment = useUpdateFixedCommitment(month);
  const [amount, setAmount] = useState(commitment.amount);
  const [dueDay, setDueDay] = useState(String(commitment.due_day));

  return (
    <>
      <Text style={styles.sheetTitle}>Edit commitment</Text>
      <Text style={styles.commitmentName}>{commitment.name}</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.noteInput}
      />
      <TextInput
        value={dueDay}
        onChangeText={setDueDay}
        keyboardType="numeric"
        style={styles.noteInput}
      />
      <Button
        label="Save changes"
        loading={updateCommitment.isPending}
        onPress={() =>
          updateCommitment.mutate(
            { commitmentId: commitment.id, payload: { amount, due_day: Number(dueDay) } },
            { onSuccess: onClose },
          )
        }
      />
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
    paddingVertical: 24,
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
    backgroundColor: colors.accentTint,
    borderColor: colors.accent,
  },
  presetChipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  presetChipLabelActive: {
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 22,
  },
  sectionLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  sectionLabelAccent: {
    color: colors.accent,
  },
  noteBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.tileSmall,
  },
  noteBoxNeutral: {
    backgroundColor: colors.successTint,
  },
  noteBoxDanger: {
    backgroundColor: colors.dangerTint,
  },
  noteText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.success,
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
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  emptyStateSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
    textAlign: 'center',
  },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  noteInput: {
    height: 46,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSubtle,
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
  },
});

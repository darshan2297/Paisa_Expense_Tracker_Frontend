import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { INVEST_KINDS } from '@/components/modal/kinds';
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
import { confirmDestructive } from '@/utils/confirm';
import { getApiErrorMessage } from '@/utils/errors';
import type { Goal } from '@/features/goals/types';
import {
  useContributeToGoal,
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from '@/features/goals/hooks';
import type { Investment } from '@/features/investments/api';
import {
  useCreateInvestment,
  useDeleteInvestment,
  useInvestments,
  useInvestmentsSummary,
  useUpdateInvestment,
} from '@/features/investments/hooks';
import { compact, fmt, initials, pctWidth } from '@/mock/format';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';
import { safeNumber } from '@/utils/numbers';

const AVATARS: [string, string][] = [
  ['#EDE9FE', '#5B54D6'],
  ['#E2F0E9', '#2F7D5D'],
  ['#F9E7E1', '#C2543D'],
  ['#E5EEF8', '#3E6E9E'],
  ['#FAEED8', '#96702C'],
  ['#FAE5F0', '#A84A7C'],
];

const INV_COLORS: Record<string, [string, string]> = {
  SIP: ['#EDE9FE', '#5B54D6'],
  STK: ['#E5EEF8', '#3E6E9E'],
  PPF: ['#E2F0E9', '#2F7D5D'],
  FD: ['#FAEED8', '#96702C'],
  GOLD: ['#FBE9D2', '#A2701F'],
  NPS: ['#E7F0EF', '#2F7D6E'],
};

const INV_LABELS: Record<string, string> = {
  SIP: 'Mutual fund SIP',
  STK: 'Stocks',
  PPF: 'PPF / EPF',
  FD: 'Fixed deposit',
  GOLD: 'Gold',
  NPS: 'NPS',
};

const INV_TAGS: Record<string, string> = {
  SIP: 'SIP',
  STK: 'STK',
  PPF: 'PPF',
  FD: 'FD',
  GOLD: 'GOLD',
  NPS: 'NPS',
};

/** Design HTML `isWealth` — portfolio hero, goals grid, investments list. */
export default function WealthScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [investSheetOpen, setInvestSheetOpen] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editInvestment, setEditInvestment] = useState<Investment | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalSaved, setGoalSaved] = useState('0');
  const [goalError, setGoalError] = useState('');
  const [investName, setInvestName] = useState('');
  const [investKind, setInvestKind] = useState('SIP');
  const [investAmount, setInvestAmount] = useState('');
  const [investCurrent, setInvestCurrent] = useState('');
  const [investError, setInvestError] = useState('');
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeDate, setContributeDate] = useState(new Date().toISOString().slice(0, 10));
  const [contributeNote, setContributeNote] = useState('');
  const [contributeError, setContributeError] = useState('');

  const { data: goalsData } = useGoals();
  const { data: investmentsData } = useInvestments();
  const { data: investmentsSummary } = useInvestmentsSummary();
  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();
  const createInvestment = useCreateInvestment();
  const deleteInvestment = useDeleteInvestment();
  const contributeToGoal = useContributeToGoal();

  function confirmDeleteGoal(goalId: string) {
    confirmDestructive('Delete this goal?', 'This cannot be undone.', () =>
      deleteGoal.mutate(goalId),
    );
  }

  function confirmDeleteInvestment(investmentId: string) {
    confirmDestructive('Delete this investment?', 'This cannot be undone.', () =>
      deleteInvestment.mutate(investmentId),
    );
  }

  const goalsList = goalsData ?? [];
  const investmentsList = investmentsData ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const portfolio = investmentsSummary
      ? safeNumber(investmentsSummary.portfolio_total)
      : investmentsList.reduce((a, v) => a + safeNumber(v.current_value), 0);
    const invested = investmentsSummary
      ? safeNumber(investmentsSummary.total_invested)
      : investmentsList.reduce((a, v) => a + safeNumber(v.invested_amount), 0);
    const gain = investmentsSummary
      ? safeNumber(investmentsSummary.total_gain)
      : portfolio - invested;
    const gainPct = investmentsSummary
      ? String(investmentsSummary.gain_pct ?? 0)
      : invested
        ? ((gain / invested) * 100).toFixed(1)
        : '0.0';
    const goalsSaved = goalsList.reduce((a, g) => a + safeNumber(g.saved_amount), 0);
    const goalsToGo = goalsList.reduce((a, g) => a + safeNumber(g.remaining), 0);
    const sipTotal = investmentsSummary
      ? safeNumber(investmentsSummary.monthly_sip_total)
      : investmentsList.reduce((a, v) => a + safeNumber(v.monthly_sip), 0);
    return { portfolio, invested, gain, gainPct, goalsSaved, goalsToGo, sipTotal };
  }, [goalsList, investmentsList, investmentsSummary]);

  const goals = useMemo(
    () =>
      goalsList.map((g, i) => {
        const [bg, fg] = AVATARS[i % AVATARS.length];
        const target = safeNumber(g.target_amount);
        const saved = safeNumber(g.saved_amount);
        const pctv = g.pct_complete ?? (target ? Math.min(100, (saved / target) * 100) : 0);
        const rem = safeNumber(g.remaining) || Math.max(0, target - saved);
        const mo = safeNumber(g.monthly_contribution);
        const monthsLeft = mo ? Math.ceil(rem / mo) : null;
        const eta = new Date(`${today}T00:00:00`);
        if (monthsLeft !== null) eta.setMonth(eta.getMonth() + monthsLeft);
        return {
          id: g.id,
          name: g.name,
          bg,
          fg,
          initial: initials(g.name).slice(0, 1),
          pct: `${Math.round(pctv)}%`,
          width: pctWidth(pctv, 100),
          saved: compact(saved),
          target: compact(target),
          remaining: compact(rem),
          monthly: mo ? `${fmt(mo)}/mo` : 'not funded',
          eta:
            monthsLeft === null
              ? 'Add a monthly amount'
              : rem === 0
                ? 'Completed'
                : eta.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          months: monthsLeft === null ? '—' : `${monthsLeft} months left`,
          sub: pctv >= 100 ? 'Goal reached' : `${compact(rem)} to go`,
          milestones: [25, 50, 75, 100].map((m) => ({
            label: `${m}%`,
            bg: pctv >= m ? fg : '#EDE8E1',
            fg: pctv >= m ? '#FCFAF7' : '#A39C92',
          })),
        };
      }),
    [goalsList, today],
  );

  const investments = useMemo(
    () =>
      investmentsList.map((v) => {
        const invested = safeNumber(v.invested_amount);
        const current = safeNumber(v.current_value);
        const g = safeNumber(v.gain, current - invested);
        const p = v.gain_pct?.toFixed(1) ?? (invested ? ((g / invested) * 100).toFixed(1) : '0.0');
        const monthly = safeNumber(v.monthly_sip);
        const label = INV_LABELS[v.kind] ?? v.kind;
        const [bg, fg] = INV_COLORS[v.kind] ?? AVATARS[0];
        return {
          id: v.id,
          name: v.name,
          kind: v.kind,
          tag: INV_TAGS[v.kind] ?? v.kind,
          bg,
          fg,
          sub: `${label} · invested ${compact(invested)}${monthly ? ` · ${fmt(monthly)}/mo` : ''}`,
          current: compact(current),
          gain: `${g >= 0 ? '+' : '−'}${compact(Math.abs(g))} (${g >= 0 ? '+' : ''}${p}%)`,
          gainColor: g >= 0 ? colors.successValue : colors.dangerValue,
        };
      }),
    [investmentsList],
  );

  const gainPositive = stats.gain >= 0;

  function closeGoal() {
    setGoalSheetOpen(false);
    setGoalName('');
    setGoalTarget('');
    setGoalSaved('0');
    setGoalError('');
  }

  function closeInvest() {
    setInvestSheetOpen(false);
    setInvestName('');
    setInvestKind('SIP');
    setInvestAmount('');
    setInvestCurrent('');
    setInvestError('');
  }

  function closeContribute() {
    setContributeGoalId(null);
    setContributeAmount('');
    setContributeDate(new Date().toISOString().slice(0, 10));
    setContributeNote('');
    setContributeError('');
  }

  function handleCreateGoal() {
    const target = safeNumber(goalTarget);
    if (target <= 0) {
      setGoalError('Enter a target amount greater than zero.');
      return;
    }
    if (!goalName.trim()) {
      setGoalError('Give this goal a name.');
      return;
    }
    createGoal.mutate(
      {
        name: goalName.trim(),
        target_amount: String(target),
        monthly_contribution: '0',
        saved_amount: String(Math.max(0, safeNumber(goalSaved))),
      },
      {
        onSuccess: closeGoal,
        onError: (error) =>
          setGoalError(getApiErrorMessage(error, 'Could not create that goal. Try again.')),
      },
    );
  }

  function handleCreateInvestment() {
    const amount = safeNumber(investAmount);
    if (amount <= 0) {
      setInvestError('Enter the amount invested.');
      return;
    }
    if (!investName.trim()) {
      setInvestError('Give this investment a name.');
      return;
    }
    const current = safeNumber(investCurrent) || amount;
    createInvestment.mutate(
      {
        name: investName.trim(),
        kind: investKind,
        invested_amount: String(amount),
        current_value: String(current),
        monthly_sip: '0',
      },
      {
        onSuccess: closeInvest,
        onError: (error) =>
          setInvestError(getApiErrorMessage(error, 'Could not save that investment. Try again.')),
      },
    );
  }

  function handleContribute() {
    if (!contributeGoalId) return;
    const amount = safeNumber(contributeAmount);
    if (amount <= 0) {
      setContributeError('Enter an amount greater than zero.');
      return;
    }
    contributeToGoal.mutate(
      {
        goalId: contributeGoalId,
        payload: { amount: String(amount) },
      },
      {
        onSuccess: closeContribute,
        onError: (error) =>
          setContributeError(getApiErrorMessage(error, 'Could not add that money. Try again.')),
      },
    );
  }

  return (
    <>
      <ScreenScaffold month={month} onMonthChange={setMonth}>
        <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
          <LinearGradient
            colors={['#123F35', '#0B2A24']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.portfolioHero}
          >
            <Text style={styles.portfolioEyebrow}>Portfolio value</Text>
            <Text style={[styles.portfolioValue, moneyTextStyle]}>{compact(stats.portfolio)}</Text>
            <Text style={[styles.portfolioGain, { color: gainPositive ? '#8FE0BE' : '#F3A48E' }]}>
              {gainPositive ? '▲ +' : '▼ −'}
              {compact(Math.abs(stats.gain))} ({gainPositive ? '+' : '−'}
              {Math.abs(Number(stats.gainPct))}%)
            </Text>
          </LinearGradient>

          <DesignKpiCard
            label="Saved in goals"
            value={compact(stats.goalsSaved)}
            sub={`${goalsList.length} goals · ${compact(stats.goalsToGo)} to go`}
          />
          <DesignKpiCard
            label="Monthly SIP"
            value={fmt(stats.sipTotal)}
            sub="auto-invested every month"
            valueColor="#2F7D6E"
          />
        </DesignGrid>

        <Card size="large" style={styles.goalsCard}>
          <DesignSectionHeader
            title="Savings goals"
            subtitle="Put money aside with a purpose."
            actionLabel="New goal"
            onAction={() => setGoalSheetOpen(true)}
          />
          {goals.length === 0 ? (
            <View style={styles.emptyGoals}>
              <Text style={styles.emptyTitle}>No savings goals yet</Text>
              <Text style={styles.emptyHint}>Emergency fund, a trip, a new phone — start one.</Text>
            </View>
          ) : null}
          <DesignGrid cols={2} tabletCols={1} narrowCols={1} style={styles.goalsGrid}>
            {goals.map((g) => (
              <View key={g.id} style={styles.goalTile}>
                <View style={styles.goalTop}>
                  <View style={[styles.goalAvatar, { backgroundColor: g.bg }]}>
                    <Text style={[styles.goalInitial, { color: g.fg }]}>{g.initial}</Text>
                  </View>
                  <View style={styles.goalCopy}>
                    <Text style={styles.goalName} numberOfLines={1}>
                      {g.name}
                    </Text>
                    <Text style={styles.goalSub}>{g.sub}</Text>
                  </View>
                  <Text style={[styles.goalPct, { color: g.fg }]}>{g.pct}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: g.width as `${number}%`, backgroundColor: g.fg },
                    ]}
                  />
                </View>
                <View style={styles.milestoneRow}>
                  {g.milestones.map((ms) => (
                    <View key={ms.label} style={[styles.milestone, { backgroundColor: ms.bg }]}>
                      <Text style={[styles.milestoneLabel, { color: ms.fg }]}>{ms.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.goalMetaRow}>
                  <View style={styles.goalMeta}>
                    <Text style={styles.goalMetaLabel}>Contributing</Text>
                    <Text style={styles.goalMetaValue}>{g.monthly}</Text>
                  </View>
                  <View style={styles.goalMeta}>
                    <Text style={styles.goalMetaLabel}>Done by</Text>
                    <Text style={styles.goalMetaValue}>{g.eta}</Text>
                  </View>
                </View>
                <View style={styles.goalFooter}>
                  <Text style={styles.goalSaved}>{g.saved}</Text>
                  <Text style={styles.goalOf}>
                    of {g.target} · {g.months}
                  </Text>
                  <Pressable style={styles.addMoneyBtn} onPress={() => setContributeGoalId(g.id)}>
                    <Text style={styles.addMoneyLabel}>Add money</Text>
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    style={styles.iconBtn}
                    onPress={() => {
                      const raw = goalsList.find((x) => x.id === g.id);
                      if (raw) setEditGoal(raw);
                    }}
                    accessibilityLabel="Edit goal"
                  >
                    <Feather name="edit-2" size={15} color={colors.textCaption} />
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    style={styles.goalRemoveBtn}
                    onPress={() => confirmDeleteGoal(g.id)}
                    accessibilityLabel="Remove goal"
                  >
                    <Text style={styles.goalRemoveLabel}>×</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </DesignGrid>
        </Card>

        <Card size="large" style={styles.investCard}>
          <View style={styles.investHeader}>
            <DesignSectionHeader
              title="Investments"
              subtitle="SIPs, stocks, PPF, FDs and gold in one place."
              actionLabel="Add investment"
              onAction={() => setInvestSheetOpen(true)}
            />
          </View>
          <View style={styles.investBanner}>
            <Text style={styles.investBannerLeft}>Invested {compact(stats.invested)}</Text>
            <Text
              style={[
                styles.investBannerRight,
                { color: gainPositive ? colors.successValue : colors.dangerValue },
              ]}
            >
              {gainPositive ? '+' : '−'}
              {compact(Math.abs(stats.gain))} ({gainPositive ? '+' : '−'}
              {Math.abs(Number(stats.gainPct))}%)
            </Text>
          </View>
          {investments.length === 0 ? (
            <View style={styles.emptyInvest}>
              <Text style={styles.emptyTitle}>No investments tracked</Text>
              <Text style={styles.emptyHint}>Add a SIP, FD or stock holding to watch it grow.</Text>
            </View>
          ) : (
            investments.map((v) => (
              <View key={v.id} style={styles.investRow}>
                <View style={[styles.investTag, { backgroundColor: v.bg }]}>
                  <Text style={[styles.investTagText, { color: v.fg }]}>{v.tag}</Text>
                </View>
                <View style={styles.investCopy}>
                  <Text style={styles.investName}>{v.name}</Text>
                  <Text style={styles.investSub}>{v.sub}</Text>
                </View>
                <View style={styles.investAmounts}>
                  <Text style={[styles.investCurrent, moneyTextStyle]}>{v.current}</Text>
                  <Text style={[styles.investGain, { color: v.gainColor }]}>{v.gain}</Text>
                </View>
                <Pressable
                  hitSlop={8}
                  style={styles.iconBtn}
                  onPress={() => {
                    const raw = investmentsList.find((x) => x.id === v.id);
                    if (raw) setEditInvestment(raw);
                  }}
                  accessibilityLabel="Edit investment"
                >
                  <Feather name="edit-2" size={15} color={colors.textCaption} />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  style={styles.deleteBtn}
                  onPress={() => confirmDeleteInvestment(v.id)}
                  accessibilityLabel="Delete investment"
                >
                  <Feather name="trash-2" size={15} color="#C0B9AF" />
                </Pressable>
              </View>
            ))
          )}
        </Card>
      </ScreenScaffold>

      <Sheet visible={goalSheetOpen} onClose={closeGoal} variant="center">
        <ModalHeader title="New savings goal" onClose={closeGoal} />
        <ModalBody>
          <ModalAmountField label="Target amount" value={goalTarget} onChangeText={setGoalTarget} />
          <ModalTextField
            label="Goal name"
            value={goalName}
            onChangeText={setGoalName}
            placeholder="e.g. Emergency fund"
          />
          <ModalTextField
            label="Already saved"
            value={goalSaved}
            onChangeText={setGoalSaved}
            placeholder="0"
            numeric
          />
          <ModalError message={goalError} />
          <ModalSave label="Save" onPress={handleCreateGoal} loading={createGoal.isPending} />
        </ModalBody>
      </Sheet>

      <Sheet visible={investSheetOpen} onClose={closeInvest} variant="center">
        <ModalHeader title="Add investment" onClose={closeInvest} />
        <ModalBody>
          <ModalAmountField
            label="Amount invested"
            value={investAmount}
            onChangeText={setInvestAmount}
          />
          <ModalTextField
            label="Investment name"
            value={investName}
            onChangeText={setInvestName}
            placeholder="e.g. Nifty 50 Index Fund"
          />
          <ModalChips
            label="Instrument"
            options={INVEST_KINDS}
            value={investKind}
            onChange={setInvestKind}
          />
          <ModalTextField
            label="Current value"
            value={investCurrent}
            onChangeText={setInvestCurrent}
            placeholder="0"
            numeric
          />
          <ModalError message={investError} />
          <ModalSave
            label="Save"
            onPress={handleCreateInvestment}
            loading={createInvestment.isPending}
          />
        </ModalBody>
      </Sheet>

      <Sheet visible={!!contributeGoalId} onClose={closeContribute} variant="center">
        <ModalHeader title="Add to goal" onClose={closeContribute} />
        <ModalBody>
          <ModalAmountField
            label="Amount to add"
            value={contributeAmount}
            onChangeText={setContributeAmount}
          />
          <ModalDateNoteRow
            date={contributeDate}
            onDate={setContributeDate}
            note={contributeNote}
            onNote={setContributeNote}
          />
          <ModalError message={contributeError} />
          <ModalSave
            label="Add money"
            onPress={handleContribute}
            loading={contributeToGoal.isPending}
          />
        </ModalBody>
      </Sheet>

      <EditGoalSheet goal={editGoal} onClose={() => setEditGoal(null)} />
      <EditInvestmentSheet investment={editInvestment} onClose={() => setEditInvestment(null)} />
    </>
  );
}

function rupeeField(raw: string | number): string {
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, ''));
  if (!Number.isFinite(n)) return '';
  return String(n);
}

function EditGoalSheet({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  return (
    <Sheet visible={!!goal} onClose={onClose} variant="center">
      {goal ? <EditGoalForm key={goal.id} goal={goal} onClose={onClose} /> : null}
    </Sheet>
  );
}

function EditGoalForm({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const updateGoal = useUpdateGoal();
  const [name, setName] = useState(goal.name);
  const [target, setTarget] = useState(rupeeField(goal.target_amount));
  const [monthly, setMonthly] = useState(rupeeField(goal.monthly_contribution));
  const [error, setError] = useState('');

  function submit() {
    const targetAmount = safeNumber(target);
    if (!name.trim()) {
      setError('Give this goal a name.');
      return;
    }
    if (targetAmount <= 0) {
      setError('Enter a target amount greater than zero.');
      return;
    }
    if (targetAmount < safeNumber(goal.saved_amount)) {
      setError('Target cannot be less than the amount already saved.');
      return;
    }
    updateGoal.mutate(
      {
        goalId: goal.id,
        payload: {
          name: name.trim(),
          target_amount: String(targetAmount),
          monthly_contribution: String(Math.max(0, safeNumber(monthly))),
        },
      },
      {
        onSuccess: onClose,
        onError: (err) => setError(getApiErrorMessage(err, 'Could not save changes. Try again.')),
      },
    );
  }

  return (
    <>
      <ModalHeader title="Edit savings goal" onClose={onClose} />
      <ModalBody>
        <ModalAmountField label="Target amount" value={target} onChangeText={setTarget} />
        <ModalTextField
          label="Goal name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Emergency fund"
        />
        <ModalTextField
          label="Monthly contribution"
          value={monthly}
          onChangeText={setMonthly}
          placeholder="0"
          numeric
        />
        <ModalError message={error} />
        <ModalSave label="Save changes" onPress={submit} loading={updateGoal.isPending} />
      </ModalBody>
    </>
  );
}

function EditInvestmentSheet({
  investment,
  onClose,
}: {
  investment: Investment | null;
  onClose: () => void;
}) {
  return (
    <Sheet visible={!!investment} onClose={onClose} variant="center">
      {investment ? (
        <EditInvestmentForm key={investment.id} investment={investment} onClose={onClose} />
      ) : null}
    </Sheet>
  );
}

function EditInvestmentForm({
  investment,
  onClose,
}: {
  investment: Investment;
  onClose: () => void;
}) {
  const updateInvestment = useUpdateInvestment();
  const [name, setName] = useState(investment.name);
  const [kind, setKind] = useState(investment.kind);
  const [amount, setAmount] = useState(rupeeField(investment.invested_amount));
  const [current, setCurrent] = useState(rupeeField(investment.current_value));
  const [monthlySip, setMonthlySip] = useState(rupeeField(investment.monthly_sip));
  const [error, setError] = useState('');

  function submit() {
    const invested = safeNumber(amount);
    if (!name.trim()) {
      setError('Give this investment a name.');
      return;
    }
    if (invested <= 0) {
      setError('Enter the amount invested.');
      return;
    }
    const currentValue = safeNumber(current) || invested;
    updateInvestment.mutate(
      {
        investmentId: investment.id,
        payload: {
          name: name.trim(),
          kind,
          invested_amount: String(invested),
          current_value: String(currentValue),
          monthly_sip: String(Math.max(0, safeNumber(monthlySip))),
        },
      },
      {
        onSuccess: onClose,
        onError: (err) => setError(getApiErrorMessage(err, 'Could not save changes. Try again.')),
      },
    );
  }

  return (
    <>
      <ModalHeader title="Edit investment" onClose={onClose} />
      <ModalBody>
        <ModalAmountField label="Amount invested" value={amount} onChangeText={setAmount} />
        <ModalTextField
          label="Investment name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Nifty 50 Index Fund"
        />
        <ModalChips label="Instrument" options={INVEST_KINDS} value={kind} onChange={setKind} />
        <ModalTextField
          label="Current value"
          value={current}
          onChangeText={setCurrent}
          placeholder="0"
          numeric
        />
        <ModalTextField
          label="Monthly SIP"
          value={monthlySip}
          onChangeText={setMonthlySip}
          placeholder="0"
          numeric
        />
        <ModalError message={error} />
        <ModalSave label="Save changes" onPress={submit} loading={updateInvestment.isPending} />
      </ModalBody>
    </>
  );
}

const styles = StyleSheet.create({
  portfolioHero: {
    borderRadius: radius.cardLarge,
    paddingVertical: 22,
    paddingHorizontal: 24,
    flex: 1,
    minWidth: 0,
    shadowColor: 'rgba(11,42,36,.9)',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.35,
    shadowRadius: 44,
    elevation: 8,
  },
  portfolioEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: 'rgba(242,251,247,.5)',
  },
  portfolioValue: {
    fontSize: 32,
    color: '#F2FBF7',
    marginTop: 8,
    letterSpacing: -1.44,
  },
  portfolioGain: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    marginTop: 6,
  },
  goalsCard: { paddingVertical: 22, paddingHorizontal: 24, gap: 18 },
  goalsGrid: { marginTop: 4 },
  goalTile: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceSubtle,
    gap: 12,
  },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  goalAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInitial: { fontFamily: fontFamily.extrabold, fontSize: 13 },
  goalCopy: { flex: 1, minWidth: 0, gap: 2 },
  goalName: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  goalSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  goalPct: { fontFamily: fontFamily.extrabold, fontSize: 13 },
  barTrack: {
    height: 9,
    borderRadius: 99,
    backgroundColor: '#EDE8E1',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 99 },
  milestoneRow: { flexDirection: 'row', gap: 6 },
  milestone: {
    flex: 1,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneLabel: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  goalMetaRow: { flexDirection: 'row', gap: 8 },
  goalMeta: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  goalMetaLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    color: colors.textCaption,
  },
  goalMetaValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  goalFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  goalSaved: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    letterSpacing: -0.42,
    color: colors.textPrimary,
  },
  goalOf: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textCaption, flex: 1 },
  addMoneyBtn: {
    marginLeft: 'auto',
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.surface,
  },
  investCard: { padding: 0, overflow: 'hidden' },
  investHeader: {
    paddingTop: 22,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  emptyGoals: {
    marginTop: 8,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyInvest: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textEmpty,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
    textAlign: 'center',
  },
  sheetForm: { gap: 12, paddingBottom: 8 },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 17,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  investBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#F8F5F1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
  },
  investBannerLeft: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#948E85',
  },
  investBannerRight: { fontFamily: fontFamily.extrabold, fontSize: 12.5 },
  investRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EC',
  },
  investTag: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investTagText: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  investCopy: { flex: 1, minWidth: 0, gap: 3 },
  investName: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  investSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  investAmounts: { alignItems: 'flex-end' },
  investCurrent: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
  },
  investGain: { fontFamily: fontFamily.bold, fontSize: 11.5, marginTop: 2 },
  iconBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  goalRemoveBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRemoveLabel: {
    fontSize: 18,
    lineHeight: 20,
    color: '#C0B9AF',
  },
});

import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import {
  DesignDarkHero,
  DesignKpiCard,
  DesignSectionHeader,
} from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { GROUP_KINDS as GROUP_KIND_OPTIONS } from '@/components/modal/kinds';
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
import { Card } from '@/components/Card';
import { Sheet } from '@/components/Sheet';
import {
  useAddGroupExpense,
  useAddGroupSettlement,
  useCreateGroup,
  useDeleteGroup,
  useDeleteGroupExpense,
  useDeleteGroupSettlement,
  useGroups,
} from '@/features/groups/hooks';
import type { Group } from '@/features/groups/types';
import { initials } from '@/mock/format';
import { confirmDestructive } from '@/utils/confirm';
import { getApiErrorMessage } from '@/utils/errors';
import { formatINR } from '@/utils/currency';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatShortDate } from '@/utils/date';

const SPLIT_TYPE_OPTIONS = [
  { id: 'equal', label: 'Equal', color: '#2F7D5D' },
  { id: 'custom', label: 'Custom', color: '#5B54D6' },
];

/**
 * Splits `amount` across `members` so the shares sum EXACTLY to `amount` -
 * mirrors the backend's `_equal_shares` (see
 * `backend/app/api/v1/groups/service.py`). Naive `amount / members.length`
 * drops a remainder whenever it doesn't divide evenly (₹100 / 3 = ₹33.33...
 * -> ₹33+₹33+₹33 = ₹99, ₹1 vanishes and balances never sum to zero). Working
 * in integer paise and handing the leftover paise to the first N members (in
 * group-member order) guarantees an exact, deterministic split - the same
 * order the backend uses, so a legacy row without stored splits recomputes
 * identically on both sides.
 */
function equalShares(amount: number, members: string[]): Record<string, number> {
  const n = members.length;
  if (n === 0) return {};
  const totalPaise = Math.round(amount * 100);
  const basePaise = Math.floor(totalPaise / n);
  const remainderPaise = totalPaise - basePaise * n;
  const shares: Record<string, number> = {};
  members.forEach((member, i) => {
    const paise = basePaise + (i < remainderPaise ? 1 : 0);
    shares[member] = paise / 100;
  });
  return shares;
}

/** Per-member net contribution across every expense in a group, using each
 * expense's own payer + splits (falling back to a recomputed equal split for
 * older rows that predate server-side split storage) - NOT one blanket
 * group-total-divided-by-member-count figure, which would be wrong the
 * moment two different members pay for different expenses. */
function computeNetByMember(g: Group): Record<string, number> {
  const net: Record<string, number> = {};
  g.members.forEach((m) => {
    net[m] = 0;
  });
  g.expenses.forEach((e) => {
    const amount = Number(e.amount);
    net[e.payer] = (net[e.payer] ?? 0) + amount;
    let splits = e.splits as { member?: string; amount?: string | number }[];
    if ((!splits || splits.length === 0) && e.split_type === 'equal' && g.members.length) {
      const shares = equalShares(amount, g.members);
      splits = g.members.map((m) => ({ member: m, amount: shares[m] }));
    }
    (splits || []).forEach((s) => {
      const member = String(s.member ?? '');
      const share = Number(s.amount ?? 0);
      net[member] = (net[member] ?? 0) - share;
    });
  });
  g.settlements.forEach((s) => {
    net[s.from_member] = (net[s.from_member] ?? 0) + Number(s.amount);
    net[s.to_member] = (net[s.to_member] ?? 0) - Number(s.amount);
  });
  return net;
}

/** Each member's total share of every expense (what they're responsible for
 * across the group) - used for the "Share ₹X" line, distinct from `net`. */
function computeShareByMember(g: Group): Record<string, number> {
  const owed: Record<string, number> = {};
  g.members.forEach((m) => {
    owed[m] = 0;
  });
  g.expenses.forEach((e) => {
    const amount = Number(e.amount);
    let splits = e.splits as { member?: string; amount?: string | number }[];
    if ((!splits || splits.length === 0) && e.split_type === 'equal' && g.members.length) {
      const shares = equalShares(amount, g.members);
      splits = g.members.map((m) => ({ member: m, amount: shares[m] }));
    }
    (splits || []).forEach((s) => {
      const member = String(s.member ?? '');
      owed[member] = (owed[member] ?? 0) + Number(s.amount ?? 0);
    });
  });
  return owed;
}

const AVATARS = [
  { bg: '#E2F0E9', fg: '#2F7D5D' },
  { bg: '#EDE9FE', fg: '#5B54D6' },
  { bg: '#E5EEF8', fg: '#3E6E9E' },
  { bg: '#FAEED8', fg: '#96702C' },
];

const GROUP_KIND_STYLE: Record<string, { tag: string; bg: string; fg: string }> = {
  FLAT: { tag: 'FLT', bg: '#E2F0E9', fg: '#2F7D5D' },
  TRIP: { tag: 'TRP', bg: '#FAEED8', fg: '#96702C' },
  EVENT: { tag: 'EVT', bg: '#EDE9FE', fg: '#5B54D6' },
  OTHER: { tag: 'GRP', bg: '#E5EEF8', fg: '#3E6E9E' },
};

function groupStyle(kind: string) {
  return (
    GROUP_KIND_STYLE[kind.toUpperCase()] ?? {
      tag: kind.slice(0, 3).toUpperCase(),
      bg: '#F1EDE7',
      fg: '#7C766D',
    }
  );
}

function groupTotal(g: Group): number {
  return g.expenses.reduce((a, e) => a + Number(e.amount), 0);
}

function buildBalances(g: Group) {
  const netByMember = computeNetByMember(g);
  const shareByMember = computeShareByMember(g);
  const paidBy: Record<string, number> = {};
  g.members.forEach((m) => {
    paidBy[m] = 0;
  });
  g.expenses.forEach((e) => {
    paidBy[e.payer] = (paidBy[e.payer] || 0) + Number(e.amount);
  });

  return g.members.map((name, i) => {
    const net = netByMember[name] ?? 0;
    const av = AVATARS[i % AVATARS.length];
    // Rounding-safe "settled" check: balances are exact to the paisa now
    // (see equalShares), so a leftover 1-2 paise from float arithmetic
    // should still read as settled rather than "Owes ₹0.01".
    const settled = Math.abs(net) < 0.01;
    return {
      name,
      initials: initials(name),
      bg: av.bg,
      fg: av.fg,
      paid: formatINR(paidBy[name] || 0),
      owed: formatINR(shareByMember[name] ?? 0),
      received: formatINR(
        g.settlements.filter((s) => s.to_member === name).reduce((a, s) => a + Number(s.amount), 0),
      ),
      net: settled ? 'Settled' : (net > 0 ? '+' : '−') + formatINR(Math.abs(net)),
      netColor: settled ? colors.textCaption : net > 0 ? colors.successValue : colors.dangerValue,
      state: settled ? 'Settled up' : net > 0 ? 'Gets back' : 'Owes',
      stateBg: settled ? '#E2F0E9' : net > 0 ? '#E7F1EC' : colors.dangerTint,
      stateFg: settled ? colors.success : net > 0 ? colors.successValue : colors.dangerValue,
      canSettle: !settled && name !== 'You',
    };
  });
}

/** Design HTML `isShared` — split expenses across groups. */
export default function SharedScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data: groups = [] } = useGroups();
  const [openId, setOpenId] = useState<string | null>(null);

  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();
  const addExpense = useAddGroupExpense();
  const deleteExpense = useDeleteGroupExpense();
  const addSettlement = useAddGroupSettlement();
  const deleteSettlement = useDeleteGroupSettlement();

  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupKind, setGroupKind] = useState('FLAT');
  const [groupMembers, setGroupMembers] = useState('You, Alex, Priya');
  const [groupWallet, setGroupWallet] = useState('0');
  const [groupError, setGroupError] = useState('');

  const [expenseGroupId, setExpenseGroupId] = useState<string | null>(null);
  const [expenseLabel, setExpenseLabel] = useState('');
  const [expensePayer, setExpensePayer] = useState('You');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [expenseSplitType, setExpenseSplitType] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const [settleGroupId, setSettleGroupId] = useState<string | null>(null);
  const [settleFrom, setSettleFrom] = useState('');
  const [settleTo, setSettleTo] = useState('You');
  const [settleAmount, setSettleAmount] = useState('');
  const [settleDate, setSettleDate] = useState(new Date().toISOString().slice(0, 10));
  const [settleNote, setSettleNote] = useState('');
  const [settleError, setSettleError] = useState('');

  const expenseGroup = groups.find((g) => g.id === expenseGroupId);
  const settleGroup = groups.find((g) => g.id === settleGroupId);

  const sharedTotal = useMemo(() => groups.reduce((a, g) => a + groupTotal(g), 0), [groups]);

  const cards = useMemo(
    () =>
      groups.map((g) => {
        const total = groupTotal(g);
        const balances = buildBalances(g);
        const you = balances.find((b) => b.name === 'You');
        const youNet = you
          ? parseFloat(you.net.replace(/[^0-9.]/g, '')) *
            (you.net.startsWith('−') ? -1 : you.net.startsWith('+') ? 1 : 0)
          : 0;
        const style = groupStyle(g.kind);
        return {
          group: g,
          style,
          total,
          balances,
          youNetText:
            Math.abs(youNet) < 1
              ? 'All settled'
              : `${youNet > 0 ? 'You are owed ' : 'You owe '}${formatINR(Math.abs(youNet))}`,
          youNetColor:
            Math.abs(youNet) < 1
              ? colors.textCaption
              : youNet > 0
                ? colors.successValue
                : colors.dangerValue,
        };
      }),
    [groups],
  );

  const othersOweYou = useMemo(
    () =>
      cards.reduce((sum, { balances }) => {
        const you = balances.find((b) => b.name === 'You');
        if (!you || you.net === 'Settled') return sum;
        const val = parseFloat(you.net.replace(/[^0-9.]/g, ''));
        return you.net.startsWith('+') ? sum + val : sum;
      }, 0),
    [cards],
  );

  const youOwe = useMemo(
    () =>
      cards.reduce((sum, { balances }) => {
        const you = balances.find((b) => b.name === 'You');
        if (!you || you.net === 'Settled') return sum;
        const val = parseFloat(you.net.replace(/[^0-9.]/g, ''));
        return you.net.startsWith('−') ? sum + val : sum;
      }, 0),
    [cards],
  );

  const closeGroup = () => {
    setGroupSheetOpen(false);
    setGroupName('');
    setGroupMembers('You, Alex, Priya');
    setGroupKind('FLAT');
    setGroupWallet('0');
    setGroupError('');
  };

  const handleCreateGroup = () => {
    const name = groupName.trim();
    const members = groupMembers
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    if (!name) {
      setGroupError('Give this group a name.');
      return;
    }
    if (members.length < 2) {
      setGroupError('Add at least two members (comma-separated).');
      return;
    }
    createGroup.mutate(
      { name, kind: groupKind, members },
      {
        onSuccess: closeGroup,
        onError: (error) =>
          setGroupError(getApiErrorMessage(error, 'Could not create that group. Try again.')),
      },
    );
  };

  const openExpenseSheet = (groupId: string, members: string[]) => {
    setExpenseGroupId(groupId);
    setExpenseLabel('');
    setExpensePayer(members.includes('You') ? 'You' : (members[0] ?? 'You'));
    setExpenseAmount('');
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setExpenseNote('');
    setExpenseError('');
    setExpenseSplitType('equal');
    setCustomSplits(Object.fromEntries(members.map((m) => [m, ''])));
  };

  const closeExpense = () => {
    setExpenseGroupId(null);
    setExpenseError('');
  };

  const customSplitTotal = Object.values(customSplits).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0,
  );

  const handleAddExpense = () => {
    if (!expenseGroupId) return;
    const label = expenseLabel.trim();
    const amount = expenseAmount.trim();
    if (!amount || Number(amount) <= 0) {
      setExpenseError('Enter an expense amount greater than zero.');
      return;
    }
    if (!label) {
      setExpenseError('What was this for?');
      return;
    }
    if (expenseSplitType === 'custom') {
      // Compare in paise, not rupees - float addition of ₹33.33 + ₹33.33 +
      // ₹33.34 can land a hair off ₹100 (e.g. 99.99999999999999).
      const totalPaise = Math.round(Number(amount) * 100);
      const splitPaise = Math.round(customSplitTotal * 100);
      if (splitPaise !== totalPaise) {
        setExpenseError(
          `Custom splits (${formatINR(customSplitTotal)}) must add up to the expense amount (${formatINR(Number(amount))}).`,
        );
        return;
      }
    }
    addExpense.mutate(
      {
        groupId: expenseGroupId,
        payload: {
          label,
          payer: expensePayer,
          amount,
          date: expenseDate,
          split_type: expenseSplitType,
          ...(expenseSplitType === 'custom'
            ? {
                splits: Object.entries(customSplits).map(([member, value]) => ({
                  member,
                  amount: (Number(value) || 0).toFixed(2),
                })),
              }
            : {}),
        },
      },
      {
        onSuccess: closeExpense,
        onError: (error) =>
          setExpenseError(getApiErrorMessage(error, 'Could not add that expense. Try again.')),
      },
    );
  };

  function confirmDeleteGroup(groupId: string) {
    confirmDestructive(
      'Delete this group?',
      'All its expenses and settlements will be removed too. This cannot be undone.',
      () => deleteGroup.mutate(groupId),
    );
  }

  function confirmDeleteExpense(groupId: string, expenseId: string) {
    confirmDestructive('Delete this expense?', 'This cannot be undone.', () =>
      deleteExpense.mutate({ groupId, expenseId }),
    );
  }

  function confirmDeleteSettlement(groupId: string, settlementId: string) {
    confirmDestructive('Delete this settlement record?', 'This cannot be undone.', () =>
      deleteSettlement.mutate({ groupId, settlementId }),
    );
  }

  const openSettleSheet = (groupId: string, fromMember: string, amount: number) => {
    setSettleGroupId(groupId);
    setSettleFrom(fromMember);
    setSettleTo('You');
    setSettleAmount(String(Math.round(amount)));
    setSettleDate(new Date().toISOString().slice(0, 10));
    setSettleNote('');
    setSettleError('');
  };

  const closeSettle = () => {
    setSettleGroupId(null);
    setSettleError('');
  };

  const handleAddSettlement = () => {
    if (!settleGroupId) return;
    const amount = settleAmount.trim();
    if (!amount || Number(amount) <= 0) {
      setSettleError('Enter a settlement amount.');
      return;
    }
    if (!settleFrom || !settleTo) {
      setSettleError('Pick who paid whom.');
      return;
    }
    addSettlement.mutate(
      {
        groupId: settleGroupId,
        payload: {
          from_member: settleFrom,
          to_member: settleTo,
          amount,
          date: settleDate,
        },
      },
      {
        onSuccess: closeSettle,
        onError: (error) =>
          setSettleError(getApiErrorMessage(error, 'Could not record that settlement. Try again.')),
      },
    );
  };

  const payerOptions = (expenseGroup?.members ?? ['You']).map((member) => ({
    id: member,
    label: member,
    color: '#5B54D6',
  }));
  const settleToOptions = (settleGroup?.members ?? ['You'])
    .filter((m) => m !== settleFrom)
    .map((member) => ({
      id: member,
      label: member,
      color: '#2F7D5D',
    }));

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignDarkHero
          eyebrow="Shared wallet"
          value={formatINR(sharedTotal)}
          note="total spent across all groups"
        />
        <DesignKpiCard
          label="Others owe you"
          value={formatINR(othersOweYou)}
          valueColor={colors.successValue}
          backgroundColor="#E7F1EC"
          borderColor="#D8E8E0"
          labelColor="#4C7F68"
        />
        <DesignKpiCard
          label="You owe"
          value={formatINR(youOwe)}
          valueColor={colors.dangerValue}
          backgroundColor={colors.dangerTint}
          borderColor={colors.dangerTintBorder}
          labelColor={colors.dangerSubtext}
        />
      </DesignGrid>

      <View style={styles.header}>
        <DesignSectionHeader title="Your groups" />
        <Pressable style={styles.addBtn} onPress={() => setGroupSheetOpen(true)}>
          <Feather name="plus" size={14} color={colors.heroText} />
          <Text style={styles.addBtnText}>New group</Text>
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No shared groups yet</Text>
          <Text style={styles.emptySub}>Create a group to split expenses with others.</Text>
        </View>
      ) : (
        cards.map(({ group: g, style, total, balances, youNetText, youNetColor }) => {
          const open = openId === g.id;
          return (
            <Card key={g.id} style={styles.groupCard}>
              <Pressable onPress={() => setOpenId(open ? null : g.id)} style={styles.groupHeader}>
                <View style={[styles.groupIcon, { backgroundColor: style.bg }]}>
                  <Feather name="users" size={18} color={style.fg} />
                </View>
                <View style={styles.groupCopy}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <Text style={styles.groupSub} numberOfLines={1}>
                    {style.tag} · {g.members.join(' · ')}
                  </Text>
                </View>
                <View style={styles.groupStats}>
                  <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Group total</Text>
                    <Text style={[styles.statValue, moneyTextStyle]}>{formatINR(total)}</Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Your position</Text>
                    <Text style={[styles.youNet, { color: youNetColor }]}>{youNetText}</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.addExpBtn}
                  onPress={() => openExpenseSheet(g.id, g.members)}
                >
                  <Text style={styles.addExpText}>Add expense</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Delete group"
                  hitSlop={8}
                  style={styles.groupDeleteBtn}
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmDeleteGroup(g.id);
                  }}
                >
                  <Feather name="trash-2" size={15} color={colors.textCaption} />
                </Pressable>
                <Feather
                  name="chevron-down"
                  size={16}
                  color="#B7B0A6"
                  style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                />
              </Pressable>

              {open ? (
                <View style={styles.groupBody}>
                  <DesignGrid cols={3} tabletCols={1} narrowCols={1}>
                    {balances.map((b) => (
                      <Card key={b.name} style={styles.balanceCard}>
                        <View style={styles.balanceHeader}>
                          <View style={[styles.avatar, { backgroundColor: b.bg }]}>
                            <Text style={[styles.avatarText, { color: b.fg }]}>{b.initials}</Text>
                          </View>
                          <Text style={styles.balanceName}>{b.name}</Text>
                          <Text
                            style={[
                              styles.stateChip,
                              { backgroundColor: b.stateBg, color: b.stateFg },
                            ]}
                          >
                            {b.state}
                          </Text>
                        </View>
                        <Text style={styles.balanceMeta}>
                          Paid {b.paid} · Share {b.owed} · Received {b.received}
                        </Text>
                        <View style={styles.balanceFooter}>
                          <Text style={[styles.balanceNet, moneyTextStyle, { color: b.netColor }]}>
                            {b.net}
                          </Text>
                          {b.canSettle ? (
                            <Pressable
                              style={styles.settleBtn}
                              onPress={() => {
                                const val = parseFloat(b.net.replace(/[^0-9.]/g, ''));
                                if (val <= 0 || b.net === 'Settled') return;
                                if (b.net.startsWith('−') || b.net.startsWith('-')) {
                                  openSettleSheet(g.id, b.name, val);
                                } else {
                                  setSettleGroupId(g.id);
                                  setSettleFrom('You');
                                  setSettleTo(b.name);
                                  setSettleAmount(String(Math.round(val)));
                                  setSettleDate(new Date().toISOString().slice(0, 10));
                                }
                              }}
                            >
                              <Text style={styles.settleText}>Settle</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </Card>
                    ))}
                  </DesignGrid>

                  <View style={styles.splitCols}>
                    <View style={styles.splitCol}>
                      <Text style={styles.splitHeading}>Expenses</Text>
                      {g.expenses.length === 0 ? (
                        <Text style={styles.noSettle}>No expenses recorded yet.</Text>
                      ) : (
                        g.expenses.map((e) => (
                          <View key={e.id} style={styles.expRow}>
                            <View style={styles.expCopy}>
                              <Text style={styles.expLabel}>{e.label}</Text>
                              <Text style={styles.expSub}>{e.payer}</Text>
                            </View>
                            <Text style={styles.expDate}>{formatShortDate(e.date)}</Text>
                            <Text style={[styles.expAmount, moneyTextStyle]}>
                              {formatINR(Number(e.amount))}
                            </Text>
                            <Pressable
                              accessibilityLabel="Delete expense"
                              hitSlop={8}
                              onPress={() => confirmDeleteExpense(g.id, e.id)}
                            >
                              <Feather name="trash-2" size={14} color={colors.textCaption} />
                            </Pressable>
                          </View>
                        ))
                      )}
                    </View>
                    <View style={styles.splitCol}>
                      <Text style={styles.splitHeading}>Settlement history</Text>
                      {g.settlements.length === 0 ? (
                        <Text style={styles.noSettle}>Nothing settled yet in this group.</Text>
                      ) : (
                        g.settlements.map((s) => (
                          <View key={s.id} style={styles.settleRow}>
                            <View style={styles.settleDot} />
                            <Text style={styles.settleLabel}>
                              {s.from_member} → {s.to_member}
                            </Text>
                            <Text style={styles.expDate}>{formatShortDate(s.date)}</Text>
                            <Text
                              style={[
                                styles.settleAmount,
                                moneyTextStyle,
                                { color: colors.successValue },
                              ]}
                            >
                              {formatINR(Number(s.amount))}
                            </Text>
                            <Pressable
                              accessibilityLabel="Delete settlement"
                              hitSlop={8}
                              onPress={() => confirmDeleteSettlement(g.id, s.id)}
                            >
                              <Feather name="trash-2" size={14} color={colors.textCaption} />
                            </Pressable>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                </View>
              ) : null}
            </Card>
          );
        })
      )}

      <Sheet visible={groupSheetOpen} onClose={closeGroup} variant="center">
        <ModalHeader title="New group" onClose={closeGroup} />
        <ModalBody>
          <ModalAmountField
            label="Starting shared wallet"
            value={groupWallet}
            onChangeText={setGroupWallet}
          />
          <ModalTextField
            label="Group name"
            value={groupName}
            onChangeText={setGroupName}
            placeholder="e.g. Goa trip"
          />
          <ModalChips
            label="Type"
            options={GROUP_KIND_OPTIONS}
            value={groupKind}
            onChange={setGroupKind}
          />
          <ModalTextField
            label="Members"
            value={groupMembers}
            onChangeText={setGroupMembers}
            placeholder="You, Alex, Priya"
          />
          <ModalError message={groupError} />
          <ModalSave label="Save" onPress={handleCreateGroup} loading={createGroup.isPending} />
        </ModalBody>
      </Sheet>

      <Sheet visible={!!expenseGroupId} onClose={closeExpense} variant="center">
        <ModalHeader title="Add shared expense" onClose={closeExpense} />
        <ModalBody>
          <ModalAmountField
            label="Expense amount"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
          />
          <ModalTextField
            label="What was this for"
            value={expenseLabel}
            onChangeText={setExpenseLabel}
            placeholder="e.g. Dinner"
          />
          <ModalChips
            label="Paid by"
            options={payerOptions}
            value={expensePayer}
            onChange={setExpensePayer}
          />
          <ModalChips
            label="Split"
            options={SPLIT_TYPE_OPTIONS}
            value={expenseSplitType}
            onChange={(value) => setExpenseSplitType(value as 'equal' | 'custom')}
          />
          {expenseSplitType === 'custom'
            ? (expenseGroup?.members ?? []).map((member) => (
                <ModalAmountField
                  key={member}
                  label={`${member}'s share`}
                  value={customSplits[member] ?? ''}
                  onChangeText={(value) =>
                    setCustomSplits((current) => ({ ...current, [member]: value }))
                  }
                />
              ))
            : null}
          {expenseSplitType === 'custom' ? (
            <Text style={styles.customSplitTotal}>
              {formatINR(customSplitTotal)} of {formatINR(Number(expenseAmount) || 0)} allocated
            </Text>
          ) : null}
          <ModalDateNoteRow
            date={expenseDate}
            onDate={setExpenseDate}
            note={expenseNote}
            onNote={setExpenseNote}
          />
          <ModalError message={expenseError} />
          <ModalSave label="Save" onPress={handleAddExpense} loading={addExpense.isPending} />
        </ModalBody>
      </Sheet>

      <Sheet visible={!!settleGroupId} onClose={closeSettle} variant="center">
        <ModalHeader title="Record settlement" onClose={closeSettle} />
        <ModalBody>
          <ModalAmountField
            label="Payment amount"
            value={settleAmount}
            onChangeText={setSettleAmount}
          />
          <ModalTextField label="From" value={settleFrom} onChangeText={setSettleFrom} />
          <ModalChips
            label="To"
            options={settleToOptions}
            value={settleTo}
            onChange={setSettleTo}
          />
          <ModalDateNoteRow
            date={settleDate}
            onDate={setSettleDate}
            note={settleNote}
            onNote={setSettleNote}
          />
          <ModalError message={settleError} />
          <ModalSave label="Save" onPress={handleAddSettlement} loading={addSettlement.isPending} />
        </ModalBody>
      </Sheet>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  addBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
  },
  addBtnText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.heroText },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DFD9D0',
  },
  emptyTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: '#5C564D' },
  emptySub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
    textAlign: 'center',
  },
  groupCard: { padding: 0, overflow: 'hidden' },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 17,
    flexWrap: 'wrap',
  },
  groupIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCopy: { flex: 1, minWidth: 120, gap: 3 },
  groupName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
  },
  groupSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  groupStats: { flexDirection: 'row', gap: 14 },
  statBlock: { alignItems: 'flex-end' },
  statLabel: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textCaption },
  statValue: { fontFamily: fontFamily.extrabold, fontSize: 17, letterSpacing: -0.6 },
  youNet: { fontFamily: fontFamily.extrabold, fontSize: 13.5, letterSpacing: -0.27 },
  addExpBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  addExpText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  groupDeleteBtn: {
    padding: 6,
  },
  customSplitTotal: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textCaption,
    marginTop: -4,
  },
  groupBody: {
    padding: 18,
    gap: 18,
    backgroundColor: colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  balanceCard: { padding: 15, gap: 11 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  balanceName: {
    flex: 1,
    fontFamily: fontFamily.extrabold,
    fontSize: 13.5,
    letterSpacing: -0.27,
    color: colors.textPrimary,
  },
  stateChip: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  balanceMeta: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textCaption },
  balanceFooter: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  balanceNet: { fontFamily: fontFamily.extrabold, fontSize: 17, letterSpacing: -0.6 },
  settleBtn: {
    marginLeft: 'auto',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  settleText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.heroText },
  splitCols: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  splitCol: { flex: 1, minWidth: 200 },
  splitHeading: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#948E85',
    marginBottom: 6,
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  expCopy: { flex: 1, gap: 2 },
  expLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  expSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  expDate: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  expAmount: { fontFamily: fontFamily.extrabold, fontSize: 13.5 },
  noSettle: {
    paddingVertical: 18,
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  settleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7FA87C' },
  settleLabel: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  settleAmount: { fontFamily: fontFamily.extrabold, fontSize: 13.5 },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.45,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sheetForm: { gap: 12 },
  input: {
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
  fieldLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textLabel },
  kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  kindChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  kindChipSelected: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  kindChipText: { fontFamily: fontFamily.bold, fontSize: 11.5, color: colors.textMuted },
  kindChipTextSelected: { color: colors.accent },
});

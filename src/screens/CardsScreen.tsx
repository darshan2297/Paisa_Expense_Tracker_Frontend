import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import type { KindOption } from '@/components/modal/kinds';
import {
  ModalAmountField,
  ModalBody,
  ModalChips,
  ModalDateNoteRow,
  ModalError,
  ModalHeader,
  ModalInfoNote,
  ModalSave,
  ModalTextField,
} from '@/components/modal/ModalForm';
import { Sheet } from '@/components/Sheet';
import {
  useCardPayments,
  useCards,
  useCardsSummary,
  useCreateCard,
  useDeleteCard,
  usePayCard,
  useSpendOnCard,
} from '@/features/cards/hooks';
import type { CreditCard } from '@/features/cards/types';
import { useCategories } from '@/features/categories/hooks';
import { useTransactionsSummary } from '@/features/transactions/hooks';
import { compact, fmt, pctWidth } from '@/mock/format';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { confirmDestructive } from '@/utils/confirm';
import { formatINR } from '@/utils/currency';
import { currentYearMonth } from '@/utils/date';

const CARD_THEMES: [string, string, string][] = [
  ['#2E2A63', '#171533', '#C9C4FF'],
  ['#14342B', '#0A1F19', '#8FE0BE'],
  ['#3A2320', '#1F1412', '#F3A48E'],
  ['#2A2620', '#15120F', '#E4D7B4'],
];

function dateShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function dayDiff(dueIso: string, todayIso: string): number {
  const due = new Date(`${dueIso}T00:00:00`).getTime();
  const today = new Date(`${todayIso}T00:00:00`).getTime();
  return Math.round((due - today) / 86400000);
}

/**
 * Statement → due cycle. When statement_day > due_day (e.g. 20 → 7), the
 * statement falls in the *previous* month: 20 Jul → 7 Aug, not 20 Aug → 7 Aug.
 */
function billingCycleDates(
  month: string,
  statementDay: number,
  dueDay: number,
): { stmtDate: string; dueDate: string } {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const mon = Number(monthStr);
  const dueDate = `${month}-${String(Math.min(28, dueDay)).padStart(2, '0')}`;
  let stmtYear = year;
  let stmtMonth = mon;
  if (statementDay > dueDay) {
    stmtMonth = mon - 1;
    if (stmtMonth < 1) {
      stmtMonth = 12;
      stmtYear = year - 1;
    }
  }
  const stmtDate = `${stmtYear}-${String(stmtMonth).padStart(2, '0')}-${String(Math.min(28, statementDay)).padStart(2, '0')}`;
  return { stmtDate, dueDate };
}

function utilStyle(pct: number) {
  if (pct > 70) {
    return {
      color: '#EF6B4E',
      status: 'High utilisation',
      bg: '#F9E7E1',
      fg: colors.dangerValue,
    };
  }
  if (pct > 40) {
    return {
      color: colors.warning,
      status: 'Moderate',
      bg: '#FAEED8',
      fg: '#96702C',
    };
  }
  return {
    color: '#8FE0BE',
    status: 'Healthy',
    bg: colors.successTint,
    fg: colors.success,
  };
}

function cardDueChip(dueDay: number, month: string): { label: string; bg: string; fg: string } {
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = `${month}-${String(Math.min(28, dueDay)).padStart(2, '0')}`;
  const dd = dayDiff(dueDate, today);
  if (dd < 0) {
    return {
      label: `${Math.abs(dd)}d overdue`,
      bg: colors.dangerTint,
      fg: colors.dangerValue,
    };
  }
  if (dd === 0) return { label: 'Due today', bg: '#FAEED8', fg: '#96702C' };
  if (dd <= 7) return { label: `in ${dd} days`, bg: '#FAEED8', fg: '#96702C' };
  return { label: 'Not due yet', bg: colors.successTint, fg: colors.success };
}

/** Design HTML `isCards` — KPIs, card visuals, utilization, category spend, payment history. */
export default function CardsScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data: apiCards } = useCards();
  const { data: apiSummary } = useCardsSummary();
  const { data: apiPayments } = useCardPayments();
  const deleteCard = useDeleteCard();
  const payCard = usePayCard();
  const [addOpen, setAddOpen] = useState(false);
  const [spendCard, setSpendCard] = useState<CreditCard | null>(null);
  const [payEmiCard, setPayEmiCard] = useState<CreditCard | null>(null);
  const cards = apiCards ?? [];
  // card_only=true: this panel is titled "Category spending on cards" - it
  // must reflect only card-linked transactions, not the whole month's
  // expense breakdown (which is what the plain month-scoped summary gives
  // every other screen).
  const summary = useTransactionsSummary(month, true);

  const totals = useMemo(() => {
    if (apiSummary) {
      return {
        total_limit: apiSummary.total_limit,
        total_outstanding: apiSummary.total_outstanding,
        utilization_pct: apiSummary.utilization_pct,
      };
    }
    const totalLimit = cards.reduce((s, c) => s + Number(c.credit_limit), 0);
    const totalOutstanding = cards.reduce((s, c) => s + Number(c.outstanding), 0);
    return {
      total_limit: String(totalLimit),
      total_outstanding: String(totalOutstanding),
      utilization_pct: totalLimit ? (totalOutstanding / totalLimit) * 100 : 0,
    };
  }, [apiSummary, cards]);
  const totalLimit = Number(totals.total_limit);
  const totalOut = Number(totals.total_outstanding);
  const totalAvail = Math.max(0, totalLimit - totalOut);
  const totalUtil = totals.utilization_pct;
  const totalUtilStyle = utilStyle(totalUtil);

  const cardRows = useMemo(() => {
    return cards.map((card, index) => {
      const theme = CARD_THEMES[index % CARD_THEMES.length];
      const limit = Number(card.credit_limit);
      const outstanding = Number(card.outstanding);
      const emiAmount = Number(card.emi_amount ?? 0);
      const avail = Math.max(0, limit - outstanding);
      const util = limit ? (outstanding / limit) * 100 : 0;
      const u = utilStyle(util);
      const due = cardDueChip(card.due_day, month);
      const { stmtDate, dueDate } = billingCycleDates(month, card.statement_day, card.due_day);
      return {
        card,
        theme,
        limit,
        outstanding,
        emiAmount,
        avail,
        util,
        u,
        due,
        stmtDate,
        dueDate,
      };
    });
  }, [cards, month]);

  function confirmPay(card: CreditCard, amount: number, kind: 'full' | 'minimum' | 'emi') {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const labels = {
      full: 'Pay full amount?',
      minimum: 'Pay minimum due?',
      emi: 'Pay EMI?',
    } as const;
    confirmDestructive(
      labels[kind],
      `Confirm payment of ${formatINR(amount)} toward ${card.bank} ${card.name}.`,
      () =>
        payCard.mutate({
          cardId: card.id,
          payload: {
            amount: String(amount),
            note:
              kind === 'emi'
                ? `${card.bank} ${card.name} EMI payment`
                : kind === 'minimum'
                  ? `${card.bank} ${card.name} minimum payment`
                  : `${card.bank} ${card.name} payment`,
          },
        }),
      'Pay now',
    );
  }

  const cardHistory = useMemo(
    () =>
      (apiPayments ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        sub: row.sub,
        amount: formatINR(Number(row.amount)),
      })),
    [apiPayments],
  );

  const cardCats = useMemo(() => {
    const breakdown = summary.data?.category_breakdown ?? [];
    const top = breakdown.slice(0, 5);
    const max = top.length ? Number(top[0].amount) : 1;
    return top.map((c) => ({
      name: c.name,
      amount: fmt(Number(c.amount)),
      color: c.color,
      width: pctWidth(Number(c.amount), max),
    }));
  }, [summary.data]);

  function removeCard(id: string) {
    confirmDestructive('Delete this card?', 'This cannot be undone.', () => deleteCard.mutate(id));
  }

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={4} tabletCols={2} narrowCols={2}>
        <DesignKpiCard label="Total limit" value={compact(totalLimit)} />
        <DesignKpiCard
          label="Outstanding"
          value={compact(totalOut)}
          backgroundColor={colors.dangerTint}
          borderColor={colors.dangerTintBorder}
          labelColor={colors.dangerSubtext}
          valueColor={colors.dangerValue}
        />
        <DesignKpiCard
          label="Available"
          value={compact(totalAvail)}
          backgroundColor="#E7F1EC"
          borderColor="#D8E8E0"
          labelColor="#4C7F68"
          valueColor={colors.successValue}
        />
        <Card style={styles.utilKpi}>
          <Text style={styles.utilKpiLabel}>Credit utilisation</Text>
          <Text style={[styles.utilKpiValue, moneyTextStyle]}>{Math.round(totalUtil)}%</Text>
          <View style={styles.utilTrack}>
            <View
              style={[
                styles.utilFill,
                {
                  width: `${Math.max(2, Math.min(100, totalUtil))}%`,
                  backgroundColor: totalUtilStyle.color,
                },
              ]}
            />
          </View>
        </Card>
      </DesignGrid>

      <DesignSectionHeader
        title="Your cards"
        actionLabel="+ Add card"
        darkAction
        onAction={() => setAddOpen(true)}
      />

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No cards added</Text>
          <Text style={styles.emptySub}>Add a credit card to track limits and due dates.</Text>
        </View>
      ) : (
        <DesignGrid cols={2} tabletCols={1} narrowCols={1}>
          {cardRows.map(
            ({
              card,
              theme,
              limit,
              outstanding,
              emiAmount,
              avail,
              util,
              u,
              due,
              stmtDate,
              dueDate,
            }) => (
              <View key={card.id} style={styles.cardColumn}>
                <LinearGradient
                  colors={[theme[0], theme[1]]}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={styles.cardVisual}
                >
                  <View pointerEvents="none" style={styles.cardGlow} />
                  <View style={styles.cardVisualTop}>
                    <View style={styles.cardVisualCopy}>
                      <Text style={styles.cardBank}>{card.bank.toUpperCase()}</Text>
                      <Text style={styles.cardName}>{card.name}</Text>
                    </View>
                    <View style={[styles.dueChip, { backgroundColor: 'rgba(252,250,247,.12)' }]}>
                      <Text style={[styles.dueChipText, { color: theme[2] }]}>{due.label}</Text>
                    </View>
                  </View>
                  <View style={styles.cardVisualBottom}>
                    <View>
                      <Text style={styles.outLabel}>Outstanding</Text>
                      <Text style={[styles.outValue, moneyTextStyle]}>{compact(outstanding)}</Text>
                    </View>
                    <View style={styles.cardLast4Block}>
                      <Text style={styles.cardLast4}>•••• {card.last4}</Text>
                      <Text style={styles.cardNetwork}>{card.network}</Text>
                    </View>
                  </View>
                  <View style={styles.cardUtilTrack}>
                    <View
                      style={[
                        styles.cardUtilFill,
                        {
                          width: `${Math.max(2, Math.min(100, util))}%`,
                          backgroundColor: u.color,
                        },
                      ]}
                    />
                  </View>
                </LinearGradient>

                <Card style={styles.cardDetail}>
                  <View style={styles.detailHeader}>
                    <View style={[styles.utilBadge, { backgroundColor: u.bg }]}>
                      <Text style={[styles.utilBadgeText, { color: u.fg }]}>
                        {Math.round(util)}% used · {u.status}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeCard(card.id)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnText}>×</Text>
                    </Pressable>
                  </View>

                  <View style={styles.detailGrid}>
                    <DetailStat label="Limit" value={compact(limit)} />
                    <DetailStat label="Available" value={compact(avail)} />
                    <DetailStat label="Minimum due" value={fmt(Number(card.minimum_due))} />
                    <DetailStat label="Outstanding" value={fmt(outstanding)} />
                  </View>

                  {emiAmount > 0 ? (
                    <Text style={styles.cycleText}>Monthly EMI {fmt(emiAmount)}</Text>
                  ) : null}

                  <Text style={styles.cycleText}>
                    Cycle {dateShort(stmtDate)} → {dateShort(dueDate)}
                  </Text>

                  <Pressable style={styles.addSpendBtn} onPress={() => setSpendCard(card)}>
                    <Feather name="plus" size={14} color="#453F37" />
                    <Text style={styles.addSpendText}>Add spend on this card</Text>
                  </Pressable>

                  <View style={styles.payRow}>
                    <Pressable
                      style={styles.payFullBtn}
                      onPress={() => confirmPay(card, outstanding, 'full')}
                    >
                      <Text style={styles.payFullText}>Pay full</Text>
                    </Pressable>
                    <Pressable
                      style={styles.payMinBtn}
                      onPress={() => confirmPay(card, Number(card.minimum_due), 'minimum')}
                    >
                      <Text style={styles.payMinText}>Pay minimum</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={styles.payEmiBtn}
                    onPress={() => {
                      if (emiAmount > 0) {
                        confirmPay(card, Math.min(emiAmount, outstanding), 'emi');
                      } else {
                        setPayEmiCard(card);
                      }
                    }}
                  >
                    <Text style={styles.payEmiText}>
                      {emiAmount > 0
                        ? `Pay EMI · ${fmt(Math.min(emiAmount, outstanding))}`
                        : 'Pay EMI'}
                    </Text>
                  </Pressable>
                </Card>
              </View>
            ),
          )}
        </DesignGrid>
      )}

      <DesignGridLead
        lead={
          <Card size="large" style={styles.panel}>
            <Text style={styles.panelTitle}>Category spending on cards</Text>
            <View style={styles.catList}>
              {cardCats.length === 0 ? (
                <Text style={styles.noHistory}>
                  No card-linked spending breakdown yet — overall month categories shown when
                  expenses exist.
                </Text>
              ) : (
                cardCats.map((cat) => (
                  <View key={cat.name} style={styles.catRow}>
                    <View style={styles.catHeader}>
                      <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.catName}>{cat.name}</Text>
                      <Text style={[styles.catAmount, moneyTextStyle]}>{cat.amount}</Text>
                    </View>
                    <View style={styles.catTrack}>
                      <View
                        style={[
                          styles.catFill,
                          { width: cat.width as `${number}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>
          </Card>
        }
        side={
          <Card size="large" style={styles.panel}>
            <Text style={styles.panelTitle}>Payment history</Text>
            {cardHistory.length === 0 ? (
              <Text style={styles.noHistory}>No payments recorded yet.</Text>
            ) : (
              cardHistory.map((row) => (
                <View key={row.id} style={styles.historyRow}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyLabel}>{row.label}</Text>
                    <Text style={styles.historySub}>{row.sub}</Text>
                  </View>
                  <Text style={[styles.historyAmount, moneyTextStyle]}>{row.amount}</Text>
                </View>
              ))
            )}
          </Card>
        }
      />

      <AddCardSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <SpendOnCardSheet card={spendCard} onClose={() => setSpendCard(null)} />
      <PayEmiSheet
        card={payEmiCard}
        onClose={() => setPayEmiCard(null)}
        onConfirm={(card, amount) => {
          setPayEmiCard(null);
          confirmPay(card, amount, 'emi');
        }}
      />
    </ScreenScaffold>
  );
}

/** Mockup `card` modal — "Add credit card". */
function AddCardSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const createCard = useCreateCard();
  const [limit, setLimit] = useState('');
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [outstanding, setOutstanding] = useState('0');
  const [emiAmount, setEmiAmount] = useState('0');
  const [dueDay, setDueDay] = useState('10');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function close() {
    setLimit('');
    setName('');
    setBank('');
    setOutstanding('0');
    setEmiAmount('0');
    setDueDay('10');
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setError('');
    onClose();
  }

  function submit() {
    if (!limit || Number(limit) <= 0) {
      setError('Enter a credit limit greater than zero.');
      return;
    }
    if (!name.trim() || !bank.trim()) {
      setError('Add the card name and issuer.');
      return;
    }
    const due = Math.min(28, Math.max(1, parseInt(dueDay, 10) || 10));
    createCard.mutate(
      {
        name: name.trim(),
        bank: bank.trim(),
        // The design form doesn't collect these — sensible defaults keep the
        // form identical to the mockup while satisfying the API.
        last4: '0000',
        credit_limit: limit.trim(),
        outstanding: String(Math.max(0, Number(outstanding) || 0)),
        emi_amount: String(Math.max(0, Number(emiAmount) || 0)),
        statement_day: due > 15 ? due - 15 : due + 13,
        due_day: due,
        opened_on: date || null,
      },
      {
        onSuccess: close,
        onError: () => setError('Could not save that card. Try again.'),
      },
    );
  }

  return (
    <Sheet visible={visible} onClose={close} variant="center">
      <ModalHeader title="Add credit card" onClose={close} />
      <ModalBody>
        <ModalAmountField label="Credit limit" value={limit} onChangeText={setLimit} />
        <ModalTextField
          label="Card name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Millennia"
        />
        <ModalTextField label="Bank" value={bank} onChangeText={setBank} placeholder="e.g. HDFC" />
        <ModalTextField
          label="Current outstanding"
          value={outstanding}
          onChangeText={setOutstanding}
          placeholder="0"
          numeric
        />
        <ModalTextField
          label="Monthly EMI (optional)"
          value={emiAmount}
          onChangeText={setEmiAmount}
          placeholder="0"
          numeric
        />
        <ModalTextField
          label="Payment due day of month"
          value={dueDay}
          onChangeText={setDueDay}
          placeholder="10"
          numeric
        />
        <ModalDateNoteRow date={date} onDate={setDate} note={note} onNote={setNote} />
        <ModalError message={error} />
        <ModalSave label="Save" onPress={submit} loading={createCard.isPending} />
      </ModalBody>
    </Sheet>
  );
}

/** Mockup `cardspend` modal — "Spend on card" with category chips + info note. */
function SpendOnCardSheet({ card, onClose }: { card: CreditCard | null; onClose: () => void }) {
  const spendOnCard = useSpendOnCard();
  const { data: categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const options: KindOption[] = useMemo(
    () =>
      (categories ?? [])
        .filter((c) => c.kind === 'expense')
        .map((c) => ({ id: c.id, label: c.name, color: c.color })),
    [categories],
  );
  const selected = categoryId ?? options[0]?.id ?? '';

  function close() {
    setAmount('');
    setCategoryId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setError('');
    onClose();
  }

  function submit() {
    if (!card) return;
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    spendOnCard.mutate(
      {
        cardId: card.id,
        payload: {
          amount: amount.trim(),
          note: note.trim() || null,
          category_id: selected || null,
        },
      },
      {
        onSuccess: close,
        onError: () => setError('Could not record that spend. Try again.'),
      },
    );
  }

  return (
    <Sheet visible={!!card} onClose={close} variant="center">
      <ModalHeader title="Spend on card" onClose={close} />
      <ModalBody>
        <ModalAmountField label="Spend amount" value={amount} onChangeText={setAmount} />
        <ModalChips label="Category" options={options} value={selected} onChange={setCategoryId} />
        <ModalDateNoteRow date={date} onDate={setDate} note={note} onNote={setNote} />
        {card ? (
          <ModalInfoNote
            text={`Charges ${card.bank} ${card.name} — unpaid. Outstanding goes up; cash is not deducted until you pay.`}
          />
        ) : null}
        <ModalError message={error} />
        <ModalSave label="Add to card" onPress={submit} loading={spendOnCard.isPending} />
      </ModalBody>
    </Sheet>
  );
}

/** Enter EMI amount when the card has no saved monthly EMI. */
function PayEmiSheet({
  card,
  onClose,
  onConfirm,
}: {
  card: CreditCard | null;
  onClose: () => void;
  onConfirm: (card: CreditCard, amount: number) => void;
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  function close() {
    setAmount('');
    setError('');
    onClose();
  }

  function submit() {
    if (!card) return;
    const value = Number(amount);
    const outstanding = Number(card.outstanding);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an EMI amount greater than zero.');
      return;
    }
    if (value > outstanding) {
      setError(`EMI cannot exceed outstanding (${formatINR(outstanding)}).`);
      return;
    }
    onConfirm(card, value);
    setAmount('');
    setError('');
  }

  return (
    <Sheet visible={!!card} onClose={close} variant="center">
      <ModalHeader title="Pay EMI" onClose={close} />
      <ModalBody>
        <ModalAmountField label="EMI amount" value={amount} onChangeText={setAmount} />
        {card ? (
          <ModalInfoNote
            text={`Pays this EMI toward ${card.bank} ${card.name}. Outstanding reduces by that amount only — not the full spend.`}
          />
        ) : null}
        <ModalError message={error} />
        <ModalSave label="Continue" onPress={submit} />
      </ModalBody>
    </Sheet>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailStat}>
      <Text style={styles.detailStatLabel}>{label}</Text>
      <Text style={[styles.detailStatValue, moneyTextStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  utilKpi: { paddingVertical: 20, paddingHorizontal: 22, gap: 7 },
  utilKpiLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textLabel },
  utilKpiValue: { fontFamily: fontFamily.extrabold, fontSize: 23, letterSpacing: -0.92 },
  utilTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.divider,
    overflow: 'hidden',
    marginTop: 2,
  },
  utilFill: { height: '100%', borderRadius: 99 },
  cardColumn: { gap: 12 },
  cardVisual: {
    minHeight: 216,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    right: -40,
    bottom: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(252,250,247,.06)',
  },
  cardVisualTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardVisualCopy: { flex: 1, minWidth: 0 },
  cardBank: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    color: 'rgba(252,250,247,.5)',
  },
  cardName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.54,
    color: colors.heroText,
    marginTop: 3,
  },
  dueChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 },
  dueChipText: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  cardVisualBottom: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 24,
  },
  outLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: 'rgba(252,250,247,.5)',
  },
  outValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    letterSpacing: -1.04,
    color: colors.heroText,
    marginTop: 2,
  },
  cardLast4Block: { marginLeft: 'auto', alignItems: 'flex-end' },
  cardLast4: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    letterSpacing: 2.2,
    color: colors.heroText,
  },
  cardNetwork: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    color: 'rgba(252,250,247,.5)',
    marginTop: 3,
  },
  cardUtilTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(252,250,247,.14)',
    overflow: 'hidden',
    marginTop: 14,
  },
  cardUtilFill: { height: '100%', borderRadius: 99 },
  cardDetail: { paddingVertical: 16, paddingHorizontal: 18, gap: 12 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  utilBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 },
  utilBadgeText: { fontFamily: fontFamily.extrabold, fontSize: 11.5 },
  removeBtn: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 18, color: colors.textCaption, lineHeight: 20 },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  detailStat: {
    width: '47%',
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  detailStatLabel: { fontFamily: fontFamily.bold, fontSize: 10.5, color: colors.textCaption },
  detailStatValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  cycleText: { fontFamily: fontFamily.semibold, fontSize: 11.5, color: colors.textCaption },
  addSpendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDD7CE',
    backgroundColor: colors.surfaceSubtle,
  },
  addSpendText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  payRow: { flexDirection: 'row', gap: 7 },
  payFullBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payFullText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.heroText },
  payMinBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payMinText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  payEmiBtn: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payEmiText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.accent },
  panel: { paddingVertical: 22, paddingHorizontal: 24, gap: 14 },
  panelTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  catList: { gap: 14 },
  catRow: { gap: 7 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 9, height: 9, borderRadius: 3 },
  catName: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  catAmount: { fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.textPrimary },
  catTrack: { height: 8, borderRadius: 99, backgroundColor: colors.divider, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 99 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  historyDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: '#7FA87C',
  },
  historyCopy: { flex: 1, gap: 2 },
  historyLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  historySub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  historyAmount: { fontFamily: fontFamily.extrabold, fontSize: 13.5, color: colors.successValue },
  noHistory: {
    paddingVertical: 22,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
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
});

import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid } from '@/components/design/DesignGrid';
import {
  DesignDarkHero,
  DesignKpiCard,
  DesignSectionHeader,
} from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { BILL_FREQS, BILL_KINDS } from '@/components/modal/kinds';
import {
  ModalAmountField,
  ModalBody,
  ModalChips,
  ModalDateNoteRow,
  ModalError,
  ModalHeader,
  ModalSave,
  ModalTextField,
  ModalToggleRow,
} from '@/components/modal/ModalForm';
import { Sheet } from '@/components/Sheet';
import {
  useBills,
  useCreateBill,
  useDeleteBill,
  usePayBill,
  useToggleBillAuto,
  useUnpayBill,
} from '@/features/bills/hooks';
import type { Bill, BillKind } from '@/features/bills/types';
import { compact, fmt } from '@/mock/format';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { confirmDestructive } from '@/utils/confirm';
import { currentYearMonth } from '@/utils/date';

type BillMeta = { code: string; tag: string; bg: string; fg: string };

const BILL_KIND_META: Record<BillKind, BillMeta> = {
  electricity: { code: 'ELEC', tag: 'Electricity', bg: '#FAEED8', fg: '#96702C' },
  internet: { code: 'NET', tag: 'Internet', bg: '#EDE9FE', fg: '#5B54D6' },
  mobile: { code: 'MOB', tag: 'Mobile recharge', bg: '#FAE5F0', fg: '#A84A7C' },
  credit_card: { code: 'CC', tag: 'Credit card', bg: '#F3EFE9', fg: '#8A7F6E' },
  gas: { code: 'GAS', tag: 'Gas', bg: '#F9E7E1', fg: '#C2543D' },
  other: { code: 'CUST', tag: 'Custom bill', bg: '#F1EDE7', fg: '#7C766D' },
};

function billMeta(bill: Bill): BillMeta {
  const name = bill.name.toLowerCase();
  if (name.includes('rent')) return { code: 'RENT', tag: 'Rent', bg: '#FBE9D2', fg: '#A2701F' };
  if (name.includes('water')) return { code: 'WATER', tag: 'Water', bg: '#E5EEF8', fg: '#3E6E9E' };
  if (name.includes('sip'))
    return { code: 'SIP', tag: 'SIP investment', bg: '#E7F0EF', fg: '#2F7D6E' };
  if (name.includes('premium') || name.includes('insurance') || name.includes('term plan')) {
    return { code: 'INS', tag: 'Insurance premium', bg: '#E2F0E9', fg: '#2F7D5D' };
  }
  return BILL_KIND_META[bill.kind];
}

function freqLabel(freq: Bill['frequency']): string {
  return freq.charAt(0).toUpperCase() + freq.slice(1);
}

function dateShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

/** Maps the mockup's 13 visual bill types onto the backend's kind enum. */
const BILL_KIND_TO_API: Record<string, BillKind> = {
  ELEC: 'electricity',
  WATER: 'other',
  GAS: 'gas',
  NET: 'internet',
  MOB: 'mobile',
  CC: 'credit_card',
  HL: 'other',
  CL: 'other',
  PL: 'other',
  INS: 'other',
  SIP: 'other',
  RENT: 'other',
  CUST: 'other',
};

/** Design HTML `isBills` — bills view with hero, stats, buckets, and full list. */
export default function BillsScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data, isError, isFetching, refetch } = useBills(month);
  const payBill = usePayBill(month);
  const unpayBill = useUnpayBill(month);
  const toggleBillAuto = useToggleBillAuto(month);
  const deleteBill = useDeleteBill(month);
  const [addOpen, setAddOpen] = useState(false);
  const bills = data ?? [];

  const rows = useMemo(() => {
    return bills
      .map((b) => {
        const meta = billMeta(b);
        const paid = !!b.paid_on;
        const days = b.days_until_due;
        const amountRaw = Number(b.amount);
        return {
          bill: b,
          meta,
          paid,
          days,
          amountRaw,
          sub: `${meta.tag} · ${freqLabel(b.frequency)}${b.note ? ` · ${b.note}` : ''}`,
          dueText: dateShort(b.due_date),
          due: paid
            ? `Paid ${dateShort(b.paid_on!)}`
            : days < 0
              ? `${Math.abs(days)}d overdue`
              : days === 0
                ? 'Due today'
                : `in ${days} days`,
          dueBg: paid ? '#E2F0E9' : days < 0 ? '#F9E7E1' : days <= 3 ? '#FAEED8' : '#F1EDE7',
          dueFg: paid ? '#2F7D5D' : days < 0 ? '#B04A34' : days <= 3 ? '#96702C' : '#7C766D',
          rowBg: !paid && days < 0 ? '#FDF6F3' : 'transparent',
        };
      })
      .sort((a, b) => Number(a.paid) - Number(b.paid) || a.days - b.days);
  }, [bills]);

  const unpaid = rows.filter((r) => !r.paid);
  const paidRows = rows.filter((r) => r.paid);
  const upcomingTotal = unpaid.reduce((s, r) => s + r.amountRaw, 0);
  const paidTotal = paidRows.reduce((s, r) => s + r.amountRaw, 0);
  const autoCount = bills.filter((b) => b.auto_pay).length;

  const buckets = [
    {
      label: 'Overdue',
      items: unpaid.filter((r) => r.days < 0),
      bg: '#F9EBE5',
      border: '#F1DCD3',
      fg: '#B04A34',
    },
    {
      label: 'Due today',
      items: unpaid.filter((r) => r.days === 0),
      bg: '#FAEED8',
      border: '#EFE1C4',
      fg: '#96702C',
    },
    {
      label: 'Due this week',
      items: unpaid.filter((r) => r.days > 0 && r.days <= 7),
      bg: colors.surface,
      border: colors.border,
      fg: '#5C564D',
    },
    {
      label: 'Later this month',
      items: unpaid.filter((r) => r.days > 7 && r.days <= 31),
      bg: colors.surface,
      border: colors.border,
      fg: '#5C564D',
    },
  ];

  function togglePaid(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    if (bill.paid_on) {
      unpayBill.mutate(id);
    } else {
      payBill.mutate(id);
    }
  }

  function toggleAuto(id: string) {
    toggleBillAuto.mutate(id);
  }

  function removeBill(id: string) {
    confirmDestructive('Delete this bill?', 'This cannot be undone.', () => deleteBill.mutate(id));
  }

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignDarkHero
          eyebrow="Total upcoming"
          value={compact(upcomingTotal)}
          note={`${unpaid.length} unpaid bills`}
          style={styles.hero}
        />
        <DesignKpiCard
          label="Paid this cycle"
          value={fmt(paidTotal)}
          sub="settled and out of the way"
          valueColor={colors.successValue}
        />
        <DesignKpiCard
          label="On auto-repeat"
          value={`${autoCount} of ${bills.length}`}
          sub="roll forward automatically"
        />
      </DesignGrid>

      <DesignGrid cols={4} tabletCols={2} narrowCols={2}>
        {buckets.map((bucket) => (
          <Card
            key={bucket.label}
            style={[styles.bucket, { backgroundColor: bucket.bg, borderColor: bucket.border }]}
          >
            <Text style={[styles.bucketLabel, { color: bucket.fg }]}>{bucket.label}</Text>
            <View style={styles.bucketCountRow}>
              <Text style={[styles.bucketCount, moneyTextStyle]}>{bucket.items.length}</Text>
              <Text style={styles.bucketUnit}>bills</Text>
            </View>
            <Text style={[styles.bucketTotal, moneyTextStyle, { color: bucket.fg }]}>
              {fmt(bucket.items.reduce((s, r) => s + r.amountRaw, 0))}
            </Text>
          </Card>
        ))}
      </DesignGrid>

      <DesignSectionHeader
        title="All bills"
        actionLabel="+ Add bill"
        darkAction
        onAction={() => setAddOpen(true)}
      />

      <Card size="large" style={styles.listCard}>
        {isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Could not load bills</Text>
            <Text style={styles.emptySub}>Check your connection and try again.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn} disabled={isFetching}>
              <Text style={styles.retryLabel}>{isFetching ? 'Retrying…' : 'Retry'}</Text>
            </Pressable>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No bills yet</Text>
            <Text style={styles.emptySub}>
              Add electricity, rent, EMIs or any recurring payment.
            </Text>
          </View>
        ) : (
          rows.map((row) => (
            <View key={row.bill.id} style={[styles.billRow, { backgroundColor: row.rowBg }]}>
              <View style={[styles.billCode, { backgroundColor: row.meta.bg }]}>
                <Text style={[styles.billCodeText, { color: row.meta.fg }]}>{row.meta.code}</Text>
              </View>
              <View style={styles.billCopy}>
                <Text style={styles.billName}>{row.bill.name}</Text>
                <Text style={styles.billSub} numberOfLines={1}>
                  {row.sub}
                </Text>
              </View>
              <Pressable
                onPress={() => toggleAuto(row.bill.id)}
                style={[
                  styles.autoChip,
                  {
                    backgroundColor: row.bill.auto_pay ? colors.accentTint : colors.divider,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.autoChipText,
                    { color: row.bill.auto_pay ? colors.accent : colors.textLabel },
                  ]}
                >
                  {row.bill.auto_pay ? 'Auto-repeat on' : 'One-time'}
                </Text>
              </Pressable>
              <Text style={styles.leadText}>remind {row.bill.lead_days}d before</Text>
              <View style={[styles.dueChip, { backgroundColor: row.dueBg }]}>
                <Text style={[styles.dueChipText, { color: row.dueFg }]}>{row.due}</Text>
              </View>
              <Text style={styles.dueDate}>{row.dueText}</Text>
              <Text style={[styles.billAmount, moneyTextStyle]}>{fmt(row.amountRaw)}</Text>
              <View style={styles.billActions}>
                <Pressable
                  onPress={() => togglePaid(row.bill.id)}
                  style={[
                    styles.actionBtn,
                    row.paid ? styles.actionBtnUndo : styles.actionBtnPrimary,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      row.paid ? styles.actionBtnTextUndo : styles.actionBtnTextPrimary,
                    ]}
                  >
                    {row.paid ? 'Undo' : 'Mark paid'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => removeBill(row.bill.id)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={15} color={colors.textCaption} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </Card>

      <AddBillSheet month={month} visible={addOpen} onClose={() => setAddOpen(false)} />
    </ScreenScaffold>
  );
}

/** Mockup `bill` modal — "Add bill or reminder". */
function AddBillSheet({
  month,
  visible,
  onClose,
}: {
  month: string;
  visible: boolean;
  onClose: () => void;
}) {
  const createBill = useCreateBill(month);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState('ELEC');
  const [leadDays, setLeadDays] = useState('3');
  const [freq, setFreq] = useState('monthly');
  const [auto, setAuto] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function reset() {
    setAmount('');
    setName('');
    setKind('ELEC');
    setLeadDays('3');
    setFreq('monthly');
    setAuto(true);
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setError('');
  }

  function close() {
    reset();
    onClose();
  }

  function submit() {
    const numericAmount = Number(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!name.trim()) {
      setError('Give this bill a name.');
      return;
    }
    createBill.mutate(
      {
        name: name.trim(),
        kind: BILL_KIND_TO_API[kind] ?? 'other',
        amount: amount.trim(),
        due_date: date,
        frequency: freq as Bill['frequency'],
        auto_pay: auto,
        lead_days: Math.min(30, Math.max(0, parseInt(leadDays, 10) || 3)),
        note: note.trim() || undefined,
      },
      {
        onSuccess: close,
        onError: () => setError('Could not save that bill. Try again.'),
      },
    );
  }

  return (
    <Sheet visible={visible} onClose={close} variant="center">
      <ModalHeader title="Add bill or reminder" onClose={close} />
      <ModalBody>
        <ModalAmountField label="Bill amount" value={amount} onChangeText={setAmount} />
        <ModalTextField
          label="Bill name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Electricity bill"
        />
        <ModalChips label="Type" options={BILL_KINDS} value={kind} onChange={setKind} />
        <ModalTextField
          label="Remind me this many days before"
          value={leadDays}
          onChangeText={setLeadDays}
          placeholder="0"
          numeric
        />
        <View style={styles.freqBlock}>
          <ModalChips label="Repeats" options={BILL_FREQS} value={freq} onChange={setFreq} />
          <ModalToggleRow
            title="Auto-repeat"
            sub="Roll the due date forward each time it is paid"
            value={auto}
            onToggle={() => setAuto((v) => !v)}
          />
        </View>
        <ModalDateNoteRow
          dateLabel="Next due date"
          date={date}
          onDate={setDate}
          note={note}
          onNote={setNote}
        />
        <ModalError message={error} />
        <ModalSave label="Save" onPress={submit} loading={createBill.isPending} />
      </ModalBody>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { paddingVertical: 24, paddingHorizontal: 26 },
  bucket: { paddingVertical: 18, paddingHorizontal: 20, gap: 8 },
  bucketLabel: { fontFamily: fontFamily.bold, fontSize: 12 },
  bucketCountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bucketCount: { fontFamily: fontFamily.extrabold, fontSize: 26, letterSpacing: -1.17 },
  bucketUnit: { fontFamily: fontFamily.semibold, fontSize: 12.5, color: colors.textCaption },
  bucketTotal: { fontFamily: fontFamily.bold, fontSize: 12.5 },
  listCard: { padding: 0, overflow: 'hidden' },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EC',
  },
  billCode: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billCodeText: { fontFamily: fontFamily.extrabold, fontSize: 10 },
  billCopy: { minWidth: 120, flex: 1, gap: 3 },
  billName: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  billSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  autoChip: { height: 26, paddingHorizontal: 10, borderRadius: 99, justifyContent: 'center' },
  autoChipText: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  leadText: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  dueChip: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 99 },
  dueChipText: { fontFamily: fontFamily.extrabold, fontSize: 11.5 },
  dueDate: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textCaption,
    minWidth: 56,
    textAlign: 'right',
  },
  billAmount: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
    minWidth: 72,
    textAlign: 'right',
  },
  billActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnPrimary: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  actionBtnUndo: { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
  actionBtnText: { fontFamily: fontFamily.bold, fontSize: 12.5 },
  actionBtnTextPrimary: { color: colors.heroText },
  actionBtnTextUndo: { color: colors.textMuted },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { paddingVertical: 54, paddingHorizontal: 20, alignItems: 'center' },
  emptyTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: '#5C564D' },
  emptySub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 14,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  retryLabel: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.heroText },
  freqBlock: { gap: 8 },
});

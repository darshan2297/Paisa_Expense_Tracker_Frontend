import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { LOAN_KINDS } from '@/components/modal/kinds';
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
import type { Loan } from '@/features/loans/types';
import { useCreateLoan, useDeleteLoan, useLoans, useLoansSummary } from '@/features/loans/hooks';
import { compact, fmt, pctWidth } from '@/mock/format';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

const LOAN_LABELS: Record<string, string> = {
  HL: 'Home loan',
  VL: 'Vehicle loan',
  PL: 'Personal loan',
  OTHER: 'Other loan',
};

const LOAN_COLORS: Record<string, [string, string]> = {
  HL: ['#E5EEF8', '#3E6E9E'],
  VL: ['#E7F0EF', '#2F7D6E'],
  PL: ['#F9E7E1', '#C2543D'],
  OTHER: ['#F3EFE9', '#8A7F6E'],
};

function loanState(l: Loan) {
  const principal = Number(l.principal);
  const rate = Number(l.rate_pct);
  const tenure = l.tenure_months;
  const emi = Number(l.emi);
  const start = new Date(`${l.start_date}T00:00:00`);
  const end = new Date();
  const paidMonths = Math.min(
    tenure,
    Math.max(
      0,
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
    ),
  );
  const r = rate / 1200;
  let bal = principal;
  let prin = 0;
  let int = 0;
  const schedule: { ip: number; pp: number }[] = [];
  for (let i = 0; i < tenure; i++) {
    const ip = bal * r;
    const pp = Math.min(bal, emi - ip);
    schedule.push({ ip, pp });
    if (i < paidMonths) {
      prin += pp;
      int += ip;
    }
    bal = Math.max(0, bal - pp);
  }
  const outstanding = paidMonths >= tenure ? 0 : Number(l.outstanding);
  const remaining = Math.max(0, tenure - paidMonths);
  const endD = new Date(`${l.start_date}T00:00:00`);
  endD.setMonth(endD.getMonth() + tenure);
  return {
    emi,
    paidMonths,
    principalPaid: prin,
    interestPaid: int,
    outstanding,
    schedule,
    remaining,
    endD,
  };
}

/** Design HTML `isLoans` — outstanding hero, loan cards, amortization detail. */
export default function LoansScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data: loansData } = useLoans();
  const { data: summary } = useLoansSummary(month);
  const [openLoanId, setOpenLoanId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const loansList = loansData ?? summary?.loans ?? [];
  const activeLoanId = openLoanId ?? loansList[0]?.id ?? null;
  const [prepayExtra, setPrepayExtra] = useState('');
  const deleteLoan = useDeleteLoan();

  function confirmDeleteLoan(loanId: string) {
    Alert.alert('Delete this loan?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLoan.mutate(loanId) },
    ]);
  }

  const loanStates = useMemo(
    () =>
      loansList.map((l) => {
        const st = loanState(l);
        const done = (st.paidMonths / l.tenure_months) * 100;
        const [bg, fg] = LOAN_COLORS[l.kind] ?? ['#E5EEF8', '#3E6E9E'];
        return {
          l: { ...l, bg, fg },
          ...st,
          tag: LOAN_LABELS[l.kind] ?? l.kind,
          outstandingText: compact(st.outstanding),
          emiText: fmt(st.emi),
          principalPaidText: compact(st.principalPaid),
          interestPaidText: compact(st.interestPaid),
          remainingText: `${st.remaining} months`,
          pct: `${Math.round(done)}%`,
          width: pctWidth(done, 100),
          ends: st.endD.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        };
      }),
    [loansList],
  );

  const totals = useMemo(() => {
    const outstanding = summary
      ? Number(summary.total_outstanding)
      : loanStates.reduce((a, x) => a + x.outstanding, 0);
    const emi = summary ? Number(summary.total_emi) : loanStates.reduce((a, x) => a + x.emi, 0);
    const interest = loanStates.reduce((a, x) => a + x.interestPaid, 0);
    return { outstanding, emi, interest };
  }, [loanStates, summary]);

  const selected = loanStates.find((x) => x.l.id === activeLoanId) ?? loanStates[0];

  const prepay = useMemo(() => {
    if (!selected) return null;
    const extra = parseFloat(prepayExtra) || 0;
    const r = Number(selected.l.rate_pct) / 1200;
    let bal = selected.outstanding;
    let months = 0;
    let interest = 0;
    while (bal > 1 && months < 600) {
      const ip = bal * r;
      interest += ip;
      bal = bal - (selected.emi + extra - ip);
      months++;
    }
    let bal2 = selected.outstanding;
    let m2 = 0;
    let int2 = 0;
    while (bal2 > 1 && m2 < 600) {
      const ip = bal2 * r;
      int2 += ip;
      bal2 = bal2 - (selected.emi - ip);
      m2++;
    }
    const step = Math.max(1, Math.ceil(selected.l.tenure_months / 24));
    const maxPay = Math.max(...selected.schedule.map((s) => s.ip + s.pp), 1);
    const amort = [];
    for (let i = 0; i < selected.l.tenure_months; i += step) {
      const s = selected.schedule[i];
      if (!s) continue;
      amort.push({
        intH: `${((s.ip / maxPay) * 100).toFixed(1)}%`,
        prinH: `${((s.pp / maxPay) * 100).toFixed(1)}%`,
        paid: i < selected.paidMonths,
      });
    }
    return {
      monthsSaved: `${Math.max(0, m2 - months)} months`,
      interestSaved: compact(Math.max(0, int2 - interest)),
      newTenure: `${months} months`,
      newInterest: compact(interest),
      amort,
      presets: [2000, 5000, 10000, 25000],
    };
  }, [selected, prepayExtra]);

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <LinearGradient
          colors={['#3A2320', '#1F1412']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.loanHero}
        >
          <Text style={styles.loanEyebrow}>Total outstanding</Text>
          <Text style={[styles.loanValue, moneyTextStyle]}>{compact(totals.outstanding)}</Text>
          <Text style={styles.loanNote}>across all active loans</Text>
        </LinearGradient>
        <DesignKpiCard label="Monthly EMI" value={fmt(totals.emi)} />
        <DesignKpiCard
          label="Interest paid so far"
          value={compact(totals.interest)}
          valueColor={colors.dangerValue}
        />
      </DesignGrid>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Your loans</Text>
        <Pressable style={styles.darkBtn} onPress={() => setAddOpen(true)}>
          <Feather name="plus" size={14} color={colors.surface} />
          <Text style={styles.darkBtnLabel}>Add loan</Text>
        </Pressable>
      </View>

      <View style={styles.loanList}>
        {loanStates.map((x) => (
          <Pressable key={x.l.id} onPress={() => setOpenLoanId(x.l.id)} style={styles.loanCard}>
            <View style={styles.loanTop}>
              <View style={[styles.loanIcon, { backgroundColor: x.l.bg }]}>
                <Feather name="credit-card" size={17} color={x.l.fg} />
              </View>
              <View style={styles.loanCopy}>
                <Text style={styles.loanName}>{x.l.name}</Text>
                <Text style={styles.loanSub}>
                  {x.tag} · {x.l.rate_pct}% p.a. · ends {x.ends}
                </Text>
              </View>
              <View style={styles.loanOutstanding}>
                <Text style={styles.loanOutLabel}>Outstanding</Text>
                <Text style={[styles.loanOutValue, moneyTextStyle]}>{x.outstandingText}</Text>
              </View>
              <Pressable
                accessibilityLabel="Delete loan"
                hitSlop={8}
                style={styles.loanDeleteBtn}
                onPress={(event) => {
                  event.stopPropagation();
                  confirmDeleteLoan(x.l.id);
                }}
              >
                <Feather name="trash-2" size={15} color={colors.textCaption} />
              </Pressable>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: x.width as `${number}%`, backgroundColor: x.l.fg },
                ]}
              />
            </View>
            <View style={styles.loanMeta}>
              <Text style={styles.loanMetaText}>{x.pct} repaid</Text>
              <Text style={styles.loanMetaText}>Principal {x.principalPaidText}</Text>
              <Text style={styles.loanMetaText}>Interest {x.interestPaidText}</Text>
              <Text style={styles.loanMetaText}>EMI {x.emiText}</Text>
              <Text style={[styles.loanMetaText, styles.loanMetaRight]}>
                {x.remainingText} left
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {selected && prepay ? (
        <DesignGridLead
          lead={
            <Card size="large" style={styles.amortCard}>
              <View style={styles.amortHeader}>
                <Text style={styles.amortTitle}>Amortization · {selected.l.name}</Text>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                  <Text style={styles.legendLabel}>Interest</Text>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                  <Text style={styles.legendLabel}>Principal</Text>
                </View>
              </View>
              <View style={styles.amortBars}>
                {prepay.amort.map((a, i) => (
                  <View key={i} style={[styles.amortCol, { opacity: a.paid ? 1 : 0.45 }]}>
                    <View style={[styles.amortInt, { height: a.intH as `${number}%` }]} />
                    <View style={[styles.amortPrin, { height: a.prinH as `${number}%` }]} />
                  </View>
                ))}
              </View>
              <View style={styles.amortAxis}>
                <Text style={styles.amortAxisLabel}>Start</Text>
                <Text style={styles.amortAxisLabel}>Payoff</Text>
              </View>
            </Card>
          }
          side={
            <Card size="large" style={styles.prepayCard}>
              <Text style={styles.prepayTitle}>Prepayment calculator</Text>
              <Text style={styles.prepaySub}>
                Pay a little extra each month and see what it saves.
              </Text>
              <View style={styles.prepayField}>
                <Text style={styles.prepaySymbol}>₹</Text>
                <TextInput
                  value={prepayExtra}
                  onChangeText={(v) => setPrepayExtra(v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textCaption}
                  style={styles.prepayInput}
                />
                <Text style={styles.prepaySuffix}>extra / month</Text>
              </View>
              <View style={styles.presetRow}>
                {prepay.presets.map((v) => {
                  const on = prepayExtra === String(v);
                  return (
                    <Pressable
                      key={v}
                      onPress={() => setPrepayExtra(String(v))}
                      style={[
                        styles.preset,
                        {
                          backgroundColor: on ? colors.textPrimary : colors.surfaceSubtle,
                          borderColor: on ? colors.textPrimary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetLabel,
                          { color: on ? colors.surface : colors.textMuted },
                        ]}
                      >
                        +{fmt(v)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <DesignGrid cols={2} tabletCols={2} narrowCols={1} style={styles.prepayGrid}>
                <View style={styles.prepayResultGreen}>
                  <Text style={styles.prepayResultLabelGreen}>Time saved</Text>
                  <Text style={[styles.prepayResultValueGreen, moneyTextStyle]}>
                    {prepay.monthsSaved}
                  </Text>
                </View>
                <View style={styles.prepayResultGreen}>
                  <Text style={styles.prepayResultLabelGreen}>Interest saved</Text>
                  <Text style={[styles.prepayResultValueGreen, moneyTextStyle]}>
                    {prepay.interestSaved}
                  </Text>
                </View>
                <View style={styles.prepayResult}>
                  <Text style={styles.prepayResultLabel}>New tenure</Text>
                  <Text style={[styles.prepayResultValue, moneyTextStyle]}>{prepay.newTenure}</Text>
                </View>
                <View style={styles.prepayResult}>
                  <Text style={styles.prepayResultLabel}>Interest left</Text>
                  <Text style={[styles.prepayResultValue, moneyTextStyle]}>
                    {prepay.newInterest}
                  </Text>
                </View>
              </DesignGrid>
            </Card>
          }
        />
      ) : null}

      <AddLoanSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </ScreenScaffold>
  );
}

/** Mockup `loan` modal — "Add loan". */
function AddLoanSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const createLoan = useCreateLoan();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState('HL');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('60');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function close() {
    setAmount('');
    setName('');
    setKind('HL');
    setRate('');
    setTenure('60');
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setError('');
    onClose();
  }

  function submit() {
    if (!amount || Number(amount) <= 0) {
      setError('Enter a loan amount greater than zero.');
      return;
    }
    if (!name.trim()) {
      setError('Give this loan a name.');
      return;
    }
    const months = parseInt(tenure, 10);
    if (!months || months < 1) {
      setError('Enter the tenure in months.');
      return;
    }
    createLoan.mutate(
      {
        name: name.trim(),
        // The API loan kinds don't include education loans, so EDU maps to OTHER.
        kind: kind === 'EDU' ? 'OTHER' : kind,
        principal: amount.trim(),
        rate_pct: rate.trim() || '0',
        tenure_months: months,
        start_date: date,
      },
      {
        onSuccess: close,
        onError: () => setError('Could not save that loan. Try again.'),
      },
    );
  }

  return (
    <Sheet visible={visible} onClose={close} variant="center">
      <ModalHeader title="Add loan" onClose={close} />
      <ModalBody>
        <ModalAmountField label="Loan amount" value={amount} onChangeText={setAmount} />
        <ModalTextField
          label="Loan name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Home loan"
        />
        <ModalChips label="Type" options={LOAN_KINDS} value={kind} onChange={setKind} />
        <ModalTextField
          label="Interest rate % p.a."
          value={rate}
          onChangeText={setRate}
          placeholder="0"
          numeric
        />
        <ModalTextField
          label="Tenure in months"
          value={tenure}
          onChangeText={setTenure}
          placeholder="60"
          numeric
        />
        <ModalDateNoteRow
          dateLabel="Loan start date"
          date={date}
          onDate={setDate}
          note={note}
          onNote={setNote}
        />
        <ModalError message={error} />
        <ModalSave label="Save" onPress={submit} loading={createLoan.isPending} />
      </ModalBody>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  loanHero: {
    borderRadius: radius.cardLarge,
    paddingVertical: 22,
    paddingHorizontal: 24,
    flex: 1,
    minWidth: 0,
    shadowColor: 'rgba(31,20,18,.9)',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.35,
    shadowRadius: 44,
    elevation: 8,
  },
  loanEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: 'rgba(253,243,240,.5)',
  },
  loanValue: {
    fontSize: 32,
    color: '#FDF3F0',
    marginTop: 8,
    letterSpacing: -1.44,
  },
  loanNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: 'rgba(253,243,240,.6)',
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
  loanList: { gap: 11 },
  loanCard: {
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderRadius: radius.cardLarge,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  loanTop: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  loanIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loanCopy: { flex: 1, minWidth: 0, gap: 2 },
  loanName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
  },
  loanSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  loanOutstanding: { alignItems: 'flex-end' },
  loanOutLabel: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textCaption },
  loanOutValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 19,
    letterSpacing: -0.67,
    color: colors.dangerValue,
  },
  loanDeleteBtn: {
    padding: 6,
  },
  barTrack: {
    height: 9,
    borderRadius: 99,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 99 },
  loanMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  loanMetaText: { fontFamily: fontFamily.semibold, fontSize: 11.5, color: colors.textCaption },
  loanMetaRight: { marginLeft: 'auto' },
  amortCard: { gap: 10 },
  amortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  amortTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 3 },
  legendLabel: { fontFamily: fontFamily.bold, fontSize: 11.5, color: colors.textLabel },
  amortBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 180,
  },
  amortCol: { flex: 1, height: '100%', justifyContent: 'flex-end', gap: 2 },
  amortInt: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: colors.danger,
    minHeight: 2,
  },
  amortPrin: { backgroundColor: colors.accent, minHeight: 2 },
  amortAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  amortAxisLabel: { fontFamily: fontFamily.semibold, fontSize: 11.5, color: colors.textCaption },
  prepayCard: { gap: 12 },
  prepayTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  prepaySub: { fontFamily: fontFamily.medium, fontSize: 12.5, color: colors.textCaption },
  prepayField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surfaceSubtle,
  },
  prepaySymbol: { fontFamily: fontFamily.bold, fontSize: 20, color: '#B7B0A6' },
  prepayInput: {
    flex: 1,
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    letterSpacing: -0.77,
    color: colors.textPrimary,
  },
  prepaySuffix: { fontFamily: fontFamily.semibold, fontSize: 12, color: colors.textCaption },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  preset: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: { fontFamily: fontFamily.bold, fontSize: 12.5 },
  prepayGrid: { marginTop: 6 },
  prepayResultGreen: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: '#E7F1EC',
    borderWidth: 1,
    borderColor: '#D8E8E0',
    gap: 4,
  },
  prepayResultLabelGreen: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: '#4C7F68',
  },
  prepayResultValueGreen: {
    fontFamily: fontFamily.extrabold,
    fontSize: 20,
    letterSpacing: -0.7,
    color: colors.successValue,
  },
  prepayResult: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  prepayResultLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  prepayResultValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 20,
    letterSpacing: -0.7,
    color: colors.textPrimary,
  },
});

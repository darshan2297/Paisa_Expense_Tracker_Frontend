import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

const STEPS = ['Upload file', 'Preview rows', 'Review categories', 'Check duplicates', 'Confirm'];

type ImportRow = {
  date: string;
  merchant: string;
  amount: string;
  category: string;
  color: string;
  state: 'Ready' | 'Duplicate' | 'Ignored';
  stateBg: string;
  stateFg: string;
  actionLabel: string;
};

const IMPORT_ROWS: ImportRow[] = [
  {
    date: '02 Aug',
    merchant: 'SWIGGY BANGALORE',
    amount: '₹486',
    category: 'Food & Dining',
    color: colors.danger,
    state: 'Ready',
    stateBg: '#E2F0E9',
    stateFg: colors.success,
    actionLabel: 'Ignore',
  },
  {
    date: '02 Aug',
    merchant: 'UPI/ELECTRICITY/TORRENT',
    amount: '₹2,380',
    category: 'Utilities',
    color: '#96702C',
    state: 'Ready',
    stateBg: '#E2F0E9',
    stateFg: colors.success,
    actionLabel: 'Ignore',
  },
  {
    date: '03 Aug',
    merchant: 'AMAZON RETAIL IN',
    amount: '₹3,299',
    category: 'Shopping',
    color: '#A84A7C',
    state: 'Ready',
    stateBg: '#E2F0E9',
    stateFg: colors.success,
    actionLabel: 'Ignore',
  },
  {
    date: '03 Aug',
    merchant: 'AMAZON RETAIL IN',
    amount: '₹3,299',
    category: 'Shopping',
    color: '#A84A7C',
    state: 'Duplicate',
    stateBg: '#FAEED8',
    stateFg: '#96702C',
    actionLabel: 'Merge',
  },
  {
    date: '04 Aug',
    merchant: 'IRCTC RAIL TICKET',
    amount: '₹1,245',
    category: 'Transport',
    color: colors.accent,
    state: 'Ready',
    stateBg: '#E2F0E9',
    stateFg: colors.success,
    actionLabel: 'Ignore',
  },
  {
    date: '05 Aug',
    merchant: 'SIP/NIFTY50/INDEX',
    amount: '₹10,000',
    category: 'Savings',
    color: colors.success,
    state: 'Ready',
    stateBg: '#E2F0E9',
    stateFg: colors.success,
    actionLabel: 'Ignore',
  },
  {
    date: '05 Aug',
    merchant: 'ATM WDL SELF',
    amount: '₹5,000',
    category: 'Other',
    color: '#8A7F6E',
    state: 'Ignored',
    stateBg: '#F1EDE7',
    stateFg: colors.textLabel,
    actionLabel: 'Include',
  },
  {
    date: '06 Aug',
    merchant: 'BIGBASKET GROCERY',
    amount: '₹1,450',
    category: 'Groceries',
    color: '#2F7D6E',
    state: 'Ready',
    stateBg: '#E2F0E9',
    stateFg: colors.success,
    actionLabel: 'Ignore',
  },
  {
    date: '07 Aug',
    merchant: 'NETFLIX SUBSCRIPTION',
    amount: '₹649',
    category: 'Entertainment',
    color: '#96702C',
    state: 'Ready',
    stateBg: '#E2F0E9',
    stateFg: colors.success,
    actionLabel: 'Ignore',
  },
];

/** Design HTML `isImport` — bank statement import wizard. */
export default function ImportScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [step, setStep] = useState(1);
  const [showTable, setShowTable] = useState(false);

  const ready = IMPORT_ROWS.filter((r) => r.state === 'Ready').length;
  const dup = IMPORT_ROWS.filter((r) => r.state === 'Duplicate').length;
  const ign = IMPORT_ROWS.filter((r) => r.state === 'Ignored').length;

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <Card size="large" style={styles.stepsCard}>
        <View style={styles.stepsRow}>
          {STEPS.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <View key={label} style={styles.stepCell}>
                <View style={styles.stepRail}>
                  <View
                    style={[
                      styles.stepLine,
                      { backgroundColor: done ? colors.success : colors.borderSubtle },
                    ]}
                  />
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: done
                          ? colors.success
                          : active
                            ? colors.textPrimary
                            : '#F1EDE7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        { color: active || done ? colors.heroText : colors.textCaption },
                      ]}
                    >
                      {num}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.stepLine,
                      { backgroundColor: done ? colors.success : colors.borderSubtle },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: active ? colors.textPrimary : colors.textCaption },
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {!showTable ? (
        <Pressable
          onPress={() => {
            setShowTable(true);
            setStep(2);
          }}
          style={styles.uploadZone}
        >
          <View style={styles.uploadIcon}>
            <Feather name="file-text" size={26} color="#3E6E9E" />
          </View>
          <Text style={styles.uploadTitle}>Drop your bank statement</Text>
          <Text style={styles.uploadSub}>PDF, CSV or Excel · we never upload it anywhere</Text>
          <View style={styles.chooseBtn}>
            <Text style={styles.chooseText}>Choose file</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.tableSection}>
          <DesignGrid cols={4} tabletCols={2} narrowCols={1}>
            <DesignKpiCard
              label="Ready to import"
              value={String(ready)}
              valueColor={colors.successValue}
              backgroundColor="#E7F1EC"
              borderColor="#D8E8E0"
              labelColor="#4C7F68"
            />
            <DesignKpiCard
              label="Duplicates"
              value={String(dup)}
              valueColor="#96702C"
              backgroundColor="#FAEED8"
              borderColor="#EFE1C4"
              labelColor="#96702C"
            />
            <DesignKpiCard label="Ignored" value={String(ign)} />
            <DesignKpiCard label="Errors" value="0" />
          </DesignGrid>

          <Card style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colDate]}>Date</Text>
              <Text style={[styles.th, styles.colMerchant]}>Merchant</Text>
              <Text style={[styles.th, styles.colCategory]}>Category</Text>
              <Text style={[styles.th, styles.colAmount]}>Amount</Text>
              <Text style={[styles.th, styles.colStatus]}>Status</Text>
            </View>
            {IMPORT_ROWS.map((r) => (
              <View
                key={`${r.date}-${r.merchant}`}
                style={[styles.tableRow, r.state === 'Ignored' && styles.rowMuted]}
              >
                <Text style={[styles.td, styles.colDate]}>{r.date}</Text>
                <Text style={[styles.td, styles.colMerchant, styles.tdBold]} numberOfLines={1}>
                  {r.merchant}
                </Text>
                <View style={[styles.colCategory, styles.catCell]}>
                  <View style={[styles.catDot, { backgroundColor: r.color }]} />
                  <Text style={styles.catName} numberOfLines={1}>
                    {r.category}
                  </Text>
                </View>
                <Text style={[styles.td, styles.colAmount, moneyTextStyle]}>{r.amount}</Text>
                <View style={styles.colStatus}>
                  <Text
                    style={[styles.stateChip, { backgroundColor: r.stateBg, color: r.stateFg }]}
                  >
                    {r.state}
                  </Text>
                </View>
                <Pressable style={styles.rowAction}>
                  <Text style={styles.rowActionText}>{r.actionLabel}</Text>
                </Pressable>
              </View>
            ))}
          </Card>

          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                setShowTable(false);
                setStep(1);
              }}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setStep((s) => Math.min(5, s + 1))} style={styles.nextBtn}>
              <Text style={styles.nextText}>
                {step >= 5 ? 'Import 7 transactions' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  stepsCard: { padding: 22 },
  stepsRow: { flexDirection: 'row' },
  stepCell: { flex: 1, alignItems: 'center', gap: 9 },
  stepRail: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  stepLine: { flex: 1, height: 2 },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontFamily: fontFamily.extrabold, fontSize: 12.5 },
  stepLabel: { fontFamily: fontFamily.bold, fontSize: 12, textAlign: 'center' },
  uploadZone: {
    minHeight: 300,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DDD7CE',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  uploadIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#E5EEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  uploadSub: { fontFamily: fontFamily.medium, fontSize: 12.5, color: colors.textCaption },
  chooseBtn: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  chooseText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.heroText },
  tableSection: { gap: 14 },
  tableCard: { padding: 0, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    backgroundColor: '#F8F5F1',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  th: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#948E85',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EC',
  },
  rowMuted: { opacity: 0.5 },
  td: { fontSize: 12.5, color: colors.textPrimary },
  tdBold: { fontFamily: fontFamily.bold, fontSize: 13 },
  colDate: { width: 62 },
  colMerchant: { flex: 1, minWidth: 0 },
  colCategory: { width: 120 },
  colAmount: { width: 90, textAlign: 'right' },
  colStatus: { width: 92, alignItems: 'center' },
  catCell: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  catDot: { width: 8, height: 8, borderRadius: 3 },
  catName: { fontFamily: fontFamily.semibold, fontSize: 12.5, flex: 1 },
  stateChip: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    overflow: 'hidden',
  },
  rowAction: {
    width: 84,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowActionText: { fontFamily: fontFamily.bold, fontSize: 12, color: '#453F37' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  backText: { fontFamily: fontFamily.bold, fontSize: 13.5, color: '#453F37' },
  nextBtn: {
    marginLeft: 'auto',
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  nextText: { fontFamily: fontFamily.extrabold, fontSize: 13.5, color: colors.heroText },
});

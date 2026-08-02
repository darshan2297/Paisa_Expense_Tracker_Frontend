import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

const REPORT_TABS = [
  { id: 'monthly', label: 'Monthly report' },
  { id: 'yearly', label: 'Yearly report' },
  { id: 'income', label: 'Income report' },
  { id: 'expense', label: 'Expense report' },
  { id: 'budget', label: 'Budget report' },
  { id: 'investment', label: 'Investment report' },
  { id: 'loan', label: 'Loan report' },
  { id: 'networth', label: 'Net worth report' },
  { id: 'goal', label: 'Goal progress report' },
  { id: 'tax', label: 'Tax summary' },
];

const REP_SUMMARY = [
  { label: 'Total spent', value: '₹85,749' },
  { label: 'Categories', value: '10' },
  { label: 'Transactions', value: '42' },
  { label: 'Daily average', value: '₹2,766' },
];

const REP_CHART = [
  { label: 'Rent', height: 154, color: '#A2701F' },
  { label: 'Groce', height: 29, color: '#2F7D6E' },
  { label: 'Food', height: 23, color: colors.danger },
  { label: 'Trans', height: 15, color: colors.accent },
  { label: 'Shop', height: 17, color: '#A84A7C' },
  { label: 'Util', height: 14, color: '#96702C' },
  { label: 'Insur', height: 12, color: '#3E6E9E' },
  { label: 'Other', height: 9, color: '#8A7F6E' },
];

const REP_ROWS = [
  { cells: ['Rent', '1', '₹36,000', '42%'] },
  { cells: ['Groceries', '8', '₹6,850', '8%'] },
  { cells: ['Food & Dining', '12', '₹5,420', '6%'] },
  { cells: ['Transport', '6', '₹3,650', '4%'] },
  { cells: ['Shopping', '4', '₹4,100', '5%'] },
  { cells: ['Utilities', '3', '₹7,680', '9%'] },
  { cells: ['Insurance', '2', '₹6,800', '8%'] },
  { cells: ['Health', '3', '₹2,800', '3%'] },
];

const REP_HEADS = ['Category', 'Count', 'Amount', 'Share'];

/** Design HTML `isReports` — exportable financial reports. */
export default function ReportsScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [activeTab, setActiveTab] = useState('monthly');

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <Card style={styles.tabsCard}>
        <Text style={styles.tabsEyebrow}>Choose a report</Text>
        <View style={styles.tabsRow}>
          {REPORT_TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[
                  styles.tab,
                  active && styles.tabActive,
                  { borderColor: active ? colors.textPrimary : colors.border },
                ]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card size="large" style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportCopy}>
            <Text style={styles.reportTitle}>Monthly report</Text>
            <Text style={styles.reportSub}>
              Income, spending and savings for one month · {formatYearMonthLabel(month)}
            </Text>
          </View>
          <View style={styles.exportRow}>
            {['CSV', 'PDF', 'Excel'].map((label) => (
              <Pressable key={label} style={styles.exportBtn}>
                <Feather name="download" size={13} color="#453F37" />
                <Text style={styles.exportText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <DesignGrid cols={4} tabletCols={2} narrowCols={1} style={styles.summaryGrid}>
          {REP_SUMMARY.map((s) => (
            <View key={s.label} style={styles.summaryTile}>
              <Text style={styles.summaryLabel}>{s.label}</Text>
              <Text style={[styles.summaryValue, moneyTextStyle]}>{s.value}</Text>
            </View>
          ))}
        </DesignGrid>

        <View style={styles.chartArea}>
          {REP_CHART.map((b) => (
            <View key={b.label} style={styles.chartCol}>
              <View style={[styles.chartBar, { height: b.height, backgroundColor: b.color }]} />
              <Text style={styles.chartLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tableHead}>
          {REP_HEADS.map((h) => (
            <Text key={h} style={styles.th}>
              {h}
            </Text>
          ))}
        </View>
        {REP_ROWS.map((r, i) => (
          <View key={i} style={styles.tableRow}>
            {r.cells.map((c, ci) => (
              <Text
                key={ci}
                style={[styles.td, ci === 0 && styles.tdBold, ci >= 2 && moneyTextStyle]}
              >
                {c}
              </Text>
            ))}
          </View>
        ))}
      </Card>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  tabsCard: { padding: 18, gap: 13 },
  tabsEyebrow: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#948E85',
  },
  tabsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tab: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: colors.textPrimary },
  tabText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.textMuted },
  tabTextActive: { color: colors.heroText },
  reportCard: { paddingVertical: 30, paddingHorizontal: 32 },
  reportHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.textPrimary,
  },
  reportCopy: { flex: 1, minWidth: 200 },
  reportTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    letterSpacing: -0.96,
    color: colors.textPrimary,
  },
  reportSub: {
    marginTop: 5,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textCaption,
  },
  exportRow: { flexDirection: 'row', gap: 7, marginLeft: 'auto' },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  exportText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  summaryGrid: { marginTop: 22 },
  summaryTile: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 5,
  },
  summaryLabel: { fontFamily: fontFamily.bold, fontSize: 11.5, color: colors.textCaption },
  summaryValue: { fontFamily: fontFamily.extrabold, fontSize: 21, letterSpacing: -0.84 },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    height: 180,
    marginTop: 26,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  chartCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  chartBar: {
    width: '100%',
    maxWidth: 44,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  chartLabel: {
    position: 'absolute',
    bottom: -22,
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#948E85',
  },
  tableHead: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  th: {
    flex: 1,
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#948E85',
  },
  tableRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EC',
  },
  td: { flex: 1, fontSize: 13, color: colors.textPrimary },
  tdBold: { fontFamily: fontFamily.bold },
});

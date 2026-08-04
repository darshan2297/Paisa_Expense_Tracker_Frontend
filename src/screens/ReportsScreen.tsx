import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { exportReport } from '@/features/reports/api';
import { useReport } from '@/features/reports/hooks';
import type { ReportType } from '@/features/reports/types';
import { downloadBlob } from '@/utils/filePicker';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatYearMonthLabel } from '@/utils/date';

const REPORT_TABS: { id: ReportType; label: string }[] = [
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

const REP_HEADS = ['Category', 'Count', 'Amount', 'Share'];

/** Design HTML `isReports` — exportable financial reports. */
export default function ReportsScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [activeTab, setActiveTab] = useState<ReportType>('monthly');
  const [exporting, setExporting] = useState<string | null>(null);
  const { data: report } = useReport(activeTab, month);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not supported', 'Report download is available on web only for now.');
      return;
    }
    setExporting(format);
    try {
      const blob = await exportReport(activeTab, month, format);
      downloadBlob(blob, `${activeTab}-${month}.${format}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      Alert.alert('Export failed', message);
    } finally {
      setExporting(null);
    }
  };

  const activeLabel = REPORT_TABS.find((t) => t.id === activeTab)?.label ?? 'Report';
  const summary = report?.summary ?? [];
  const chart = report?.chart ?? [];
  const rows = report?.rows ?? [];

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
            <Text style={styles.reportTitle}>{activeLabel}</Text>
            <Text style={styles.reportSub}>
              {activeTab === 'monthly'
                ? `Income, spending and savings for one month · ${formatYearMonthLabel(month)}`
                : `Report for ${formatYearMonthLabel(month)}`}
            </Text>
          </View>
          <View style={styles.exportRow}>
            {(['CSV', 'PDF'] as const).map((label) => {
              const format = label.toLowerCase() as 'csv' | 'pdf';
              const busy = exporting === format;
              return (
                <Pressable
                  key={label}
                  disabled={!!exporting}
                  onPress={() => handleExport(format)}
                  style={[styles.exportBtn, busy && styles.exportBtnBusy]}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#453F37" />
                  ) : (
                    <Feather name="download" size={13} color="#453F37" />
                  )}
                  <Text style={styles.exportText}>{label}</Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.exportBtn, styles.exportBtnDisabled]}
              onPress={() =>
                Alert.alert('Coming soon', 'Excel export is not supported by the API yet.')
              }
            >
              <Feather name="download" size={13} color="#B7B0A6" />
              <Text style={[styles.exportText, styles.exportTextDisabled]}>Excel</Text>
            </Pressable>
          </View>
        </View>

        {summary.length === 0 && chart.length === 0 && rows.length === 0 ? (
          <Text style={styles.emptyHint}>No report data for this period.</Text>
        ) : (
          <>
            {summary.length > 0 ? (
              <DesignGrid cols={4} tabletCols={2} narrowCols={1} style={styles.summaryGrid}>
                {summary.map((s) => (
                  <View key={s.label} style={styles.summaryTile}>
                    <Text style={styles.summaryLabel}>{s.label}</Text>
                    <Text style={[styles.summaryValue, moneyTextStyle]}>{s.value}</Text>
                  </View>
                ))}
              </DesignGrid>
            ) : null}

            {chart.length > 0 ? (
              <View style={styles.chartArea}>
                {chart.map((b) => {
                  const barHeight = Math.max(8, Math.min(140, Number(b.height) || 0));
                  return (
                    <View key={b.label} style={styles.chartCol}>
                      <View style={styles.chartTrack}>
                        <View
                          style={[styles.chartBar, { height: barHeight, backgroundColor: b.color }]}
                        />
                      </View>
                      <Text style={styles.chartLabel} numberOfLines={1}>
                        {b.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {rows.length > 0 ? (
              <>
                <View style={styles.tableHead}>
                  {REP_HEADS.map((h) => (
                    <Text key={h} style={styles.th}>
                      {h}
                    </Text>
                  ))}
                </View>
                {rows.map((r, i) => (
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
              </>
            ) : null}
          </>
        )}
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
  exportBtnBusy: { opacity: 0.7 },
  exportBtnDisabled: { borderColor: colors.borderSubtle, backgroundColor: colors.surfaceSubtle },
  exportTextDisabled: { color: '#B7B0A6' },
  emptyHint: {
    paddingVertical: 40,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  summaryGrid: { marginTop: 22, marginBottom: 8 },
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
    alignItems: 'stretch',
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
    paddingTop: 8,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  chartCol: {
    flex: 1,
    maxWidth: 72,
    alignItems: 'center',
    gap: 8,
  },
  chartTrack: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    maxWidth: 44,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  chartLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#948E85',
    textAlign: 'center',
    width: '100%',
  },
  tableHead: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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

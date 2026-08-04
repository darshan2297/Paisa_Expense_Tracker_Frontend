import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';

import { BudgetAlertBanner } from '@/components/dashboard/BudgetAlertBanner';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { useHeatmap } from '@/features/calendar/hooks';
import { useLifeDashboard } from '@/features/dashboard/hooks';
import * as transactionsApi from '@/features/transactions/api';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { formatINR } from '@/utils/currency';
import { currentYearMonth, formatShortDate } from '@/utils/date';

/** Mockup legend: Less + empty + Low/Med/High + More (intensity 0–3). */
const HM_LEGEND = ['#CFE6D5', '#F3DFAC', '#EFB3A0'] as const;
const INTENSITY_COLORS = ['#F1EDE7', '#CFE6D5', '#F3DFAC', '#EFB3A0'] as const;
const WEEK_COUNT = 26;
const DAY_COUNT = 7;
const CELL_GAP = 5;
/** Design HTML `min-width: 620px` on the week track. */
const TRACK_MIN_WIDTH = 620;

function intensityColor(intensity: number): string {
  return INTENSITY_COLORS[Math.min(3, Math.max(0, intensity))] ?? INTENSITY_COLORS[0];
}

function daysInMonth(yearMonth: string): number {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

function localDateLabel(isoDate: string): string {
  return formatShortDate(`${isoDate}T00:00:00`);
}

function HeatmapKpi({
  label,
  value,
  sub,
  valueColor,
  labelColor,
  backgroundColor,
  borderColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  labelColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}) {
  return (
    <View
      style={[
        styles.kpi,
        backgroundColor ? { backgroundColor } : null,
        borderColor ? { borderColor } : null,
      ]}
    >
      <Text style={[styles.kpiLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
      <Text style={[styles.kpiValue, moneyTextStyle, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </View>
  );
}

/** Design HTML `isHeatmap` — spending intensity over 26 weeks. */
export default function HeatmapScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [alertDismissedMonth, setAlertDismissedMonth] = useState<string | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const { isMobile, isNarrow } = useResponsiveLayout();

  const { data: heatmap } = useHeatmap(26);
  const { data: life } = useLifeDashboard(month);
  const showAlert = Boolean(life?.showBudgetAlert) && alertDismissedMonth !== month;

  const cells = heatmap?.cells ?? [];

  const weeks = useMemo(() => {
    const cols: { key: string; bg: string; date: string; amount: number }[][] = [];
    for (let i = 0; i < cells.length; i += DAY_COUNT) {
      cols.push(
        cells.slice(i, i + DAY_COUNT).map((c) => ({
          key: c.date,
          bg: intensityColor(c.intensity),
          date: c.date,
          amount: Number(c.amount),
        })),
      );
    }
    return cols;
  }, [cells]);

  const monthStats = useMemo(() => {
    const monthCells = cells.filter((c) => c.date.startsWith(month));
    const spent = monthCells.reduce((a, c) => a + Number(c.amount), 0);
    const totalDaysInMonth = daysInMonth(month);
    // Divide by every calendar day in the month, not just the days that had
    // any spend - otherwise a month with many no-spend days (see `noSpend`
    // below, computed the same way) inflates the "average" by shrinking the
    // denominator right alongside it.
    const avg = totalDaysInMonth ? spent / totalDaysInMonth : 0;
    const withSpend = monthCells
      .filter((c) => Number(c.amount) > 0)
      .sort((a, b) => Number(b.amount) - Number(a.amount));
    const top = withSpend[0];
    // Mockup: `dim - hmDays.length` (calendar days in month without any spend).
    const noSpend = Math.max(0, totalDaysInMonth - withSpend.length);
    return {
      spent,
      avg,
      topAmount: top ? Number(top.amount) : null,
      topDate: top?.date ?? null,
      noSpend,
    };
  }, [cells, month]);

  const dayMonth = selectedKey?.slice(0, 7) ?? '';
  const { data: dayTxPage } = useQuery({
    queryKey: ['transactions', 'heatmap-day', selectedKey],
    queryFn: () => transactionsApi.getTransactions({ month: dayMonth, size: 100, page: 1 }),
    enabled: Boolean(selectedKey),
  });
  const dayItems = useMemo(
    () => (dayTxPage?.data ?? []).filter((t) => t.date === selectedKey),
    [dayTxPage?.data, selectedKey],
  );

  const selLabel = selectedKey ? localDateLabel(selectedKey) : 'Pick a day';

  // Explicit square size — RN Web breaks aspect-ratio inside nested flex/ScrollView.
  const usableWidth = Math.max(trackWidth, TRACK_MIN_WIDTH);
  const cellSize = Math.max(
    14,
    Math.floor((usableWidth - CELL_GAP * (WEEK_COUNT - 1)) / WEEK_COUNT),
  );
  const trackInnerWidth = cellSize * WEEK_COUNT + CELL_GAP * (WEEK_COUNT - 1);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next > 0 && next !== trackWidth) setTrackWidth(next);
  };

  const kpiCols = isNarrow ? 1 : isMobile ? 2 : 4;
  const kpiGridStyle =
    Platform.OS === 'web'
      ? ({
          display: 'grid',
          gap: 14,
          gridTemplateColumns: `repeat(${kpiCols}, minmax(0, 1fr))`,
        } as object)
      : styles.kpiGridNative;
  const kpiItemStyle =
    Platform.OS === 'web'
      ? null
      : ({
          flexBasis: kpiCols === 1 ? '100%' : kpiCols === 2 ? '47%' : '23%',
          flexGrow: 1,
        } as const);

  return (
    <ScreenScaffold
      month={month}
      onMonthChange={setMonth}
      headerExtra={
        showAlert && life ? (
          <BudgetAlertBanner
            title={life.alertTitle}
            body={life.alertBody}
            onAdjust={() => router.push('/(tabs)/planned')}
            onDismiss={() => setAlertDismissedMonth(month)}
          />
        ) : null
      }
    >
      <View style={kpiGridStyle}>
        <View style={kpiItemStyle}>
          <HeatmapKpi
            label="Spent this month"
            value={formatINR(monthStats.spent)}
            valueColor="#B04A34"
          />
        </View>
        <View style={kpiItemStyle}>
          <HeatmapKpi label="Average day" value={formatINR(monthStats.avg)} />
        </View>
        <View style={kpiItemStyle}>
          <HeatmapKpi
            label="Heaviest day"
            value={monthStats.topAmount != null ? formatINR(monthStats.topAmount) : '—'}
            sub={monthStats.topDate ? localDateLabel(monthStats.topDate) : 'no spending yet'}
          />
        </View>
        <View style={kpiItemStyle}>
          <HeatmapKpi
            label="No-spend days"
            value={`${monthStats.noSpend} no-spend days`}
            valueColor="#23694E"
            backgroundColor="#E7F1EC"
            borderColor="#D8E8E0"
            labelColor="#4C7F68"
          />
        </View>
      </View>

      <View style={styles.heatCard}>
        <View style={styles.heatHeader}>
          <Text style={styles.heatTitle}>Last 26 weeks</Text>
          <View style={styles.legend}>
            <Text style={styles.legendText}>Less</Text>
            <View style={[styles.legendSwatch, { backgroundColor: '#F1EDE7' }]} />
            {HM_LEGEND.map((bg) => (
              <View key={bg} style={[styles.legendSwatch, { backgroundColor: bg }]} />
            ))}
            <Text style={styles.legendText}>More</Text>
          </View>
        </View>
        {cells.length === 0 ? (
          <Text style={styles.emptyHint}>No spending data yet.</Text>
        ) : (
          <View onLayout={onTrackLayout} style={styles.heatTrackWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={windowWidth < TRACK_MIN_WIDTH + 80}
              contentContainerStyle={{ minWidth: '100%' as unknown as number }}
            >
              <View style={[styles.heatGrid, { width: Math.max(trackInnerWidth, trackWidth) }]}>
                {weeks.map((w, wi) => (
                  <View key={wi} style={[styles.heatCol, { width: cellSize, gap: CELL_GAP }]}>
                    {w.map((d) => {
                      const selected = selectedKey === d.key;
                      return (
                        <Pressable
                          key={d.key}
                          accessibilityLabel={`${localDateLabel(d.date)} · ${
                            d.amount ? formatINR(d.amount) : 'no spend'
                          }`}
                          onPress={() => {
                            if (selectedKey === d.key) {
                              setSelectedKey(null);
                              return;
                            }
                            setSelectedKey(d.key);
                            setMonth(d.key.slice(0, 7));
                          }}
                          style={[
                            styles.heatCell,
                            {
                              width: cellSize,
                              height: cellSize,
                              backgroundColor: d.bg,
                            },
                            selected && styles.heatCellSelected,
                            selected &&
                              Platform.OS === 'web' &&
                              ({ boxShadow: '0 0 0 2px #14120F' } as object),
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>{selLabel}</Text>
        {!selectedKey ? (
          <Text style={styles.emptyHint}>Click a square to see that day&apos;s transactions.</Text>
        ) : dayItems.length === 0 ? (
          <Text style={styles.emptyHint}>A no-spend day. Nice.</Text>
        ) : (
          dayItems.map((t) => {
            const income = t.type === 'income';
            const title = t.category.name;
            const noteDate = new Date(`${t.date}T00:00:00`).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            });
            return (
              <View key={t.id} style={styles.listRow}>
                <View style={[styles.avatar, { backgroundColor: income ? '#E2F0E9' : '#F3EFE9' }]}>
                  <Text
                    style={[styles.avatarText, { color: income ? '#2F7D5D' : t.category.color }]}
                  >
                    {title.slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{title}</Text>
                  <Text style={styles.listSub}>
                    {t.note?.trim() ? `${t.note.trim()} · ` : ''}
                    {noteDate}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.listAmount,
                    moneyTextStyle,
                    { color: income ? '#23694E' : '#332F29' },
                  ]}
                >
                  {income ? '+' : '−'}
                  {formatINR(Number(t.amount))}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  kpiGridNative: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  // Design HTML heatmap KPI: padding 20/22, radius 20, label 12, value 23.
  kpi: {
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 0,
  },
  kpiLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#8B857C',
  },
  kpiValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 23,
    letterSpacing: -0.92,
    marginTop: 7,
    color: colors.textPrimary,
  },
  kpiSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: '#A39C92',
    marginTop: 3,
  },
  heatCard: {
    paddingVertical: 24,
    paddingHorizontal: 26,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  heatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 18,
  },
  heatTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  legend: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 9 },
  legendText: { fontFamily: fontFamily.semibold, fontSize: 11.5, color: '#A39C92' },
  legendSwatch: { width: 13, height: 13, borderRadius: 4 },
  heatTrackWrap: { width: '100%', overflow: 'hidden' },
  heatGrid: {
    flexDirection: 'row',
    gap: CELL_GAP,
    alignItems: 'flex-start',
  },
  heatCol: {
    flexDirection: 'column',
  },
  heatCell: {
    borderRadius: 4,
  },
  heatCellSelected: {
    borderWidth: Platform.OS === 'web' ? 0 : 2,
    borderColor: colors.textPrimary,
  },
  detailCard: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyHint: {
    paddingVertical: 22,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: '#A39C92',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EDE7',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  listCopy: { flex: 1, gap: 2, minWidth: 0 },
  listTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  listSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: '#A39C92' },
  listAmount: { fontSize: 13.5, letterSpacing: -0.34 },
});

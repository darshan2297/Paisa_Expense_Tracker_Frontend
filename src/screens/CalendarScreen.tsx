import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { useCalendar } from '@/features/calendar/hooks';
import type { CalendarDay } from '@/features/calendar/types';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { compactINR, formatINR } from '@/utils/currency';
import { currentYearMonth, formatShortDate } from '@/utils/date';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type DayCell = {
  key: string;
  num: string;
  inText: string;
  outText: string;
  bg: string;
  borderColor: string;
  numColor: string;
  showDot: boolean;
  selected: boolean;
  isToday: boolean;
  blank?: boolean;
};

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function defaultSelectedDayForMonth(yearMonth: string): string | null {
  const today = todayKey();
  return today.startsWith(`${yearMonth}-`) ? today : null;
}

/** Design HTML `isCalendar` — cash-flow calendar with day drill-down. */
export default function CalendarScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(() =>
    defaultSelectedDayForMonth(currentYearMonth()),
  );
  const { data: calendar } = useCalendar(month);

  const handleMonthChange = (nextMonth: string) => {
    setMonth(nextMonth);
    setSelectedDay(defaultSelectedDayForMonth(nextMonth));
  };

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    for (const day of calendar?.days ?? []) {
      map.set(day.date, day);
    }
    return map;
  }, [calendar?.days]);

  const moneyIn = useMemo(
    () => (calendar?.days ?? []).reduce((sum, d) => sum + Number(d.inflow), 0),
    [calendar?.days],
  );
  const moneyOut = Number(calendar?.actual_total ?? 0);
  const netFlow = Number(calendar?.net_flow ?? 0);

  const weeks = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const dim = new Date(y, m, 0).getDate();
    const firstDow = new Date(y, m - 1, 1).getDay();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);

    const maxOut = Math.max(1, ...(calendar?.days ?? []).map((d) => Number(d.outflow)));
    const today = todayKey();

    const rows: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(
        cells.slice(i, i + 7).map((d, j) => {
          if (!d) {
            return {
              key: `b-${i}-${j}`,
              num: '',
              inText: '',
              outText: '',
              bg: 'transparent',
              borderColor: 'transparent',
              numColor: 'transparent',
              showDot: false,
              selected: false,
              isToday: false,
              blank: true,
            };
          }
          const key = `${month}-${String(d).padStart(2, '0')}`;
          const data = dayMap.get(key);
          const inc = Number(data?.inflow ?? 0);
          const out = Number(data?.outflow ?? 0);
          const heat = out / maxOut;
          const isToday = key === today;
          const selected = selectedDay === key;
          return {
            key,
            num: String(d),
            inText: inc ? `+${compactINR(inc)}` : '',
            outText: out ? `−${compactINR(out)}` : '',
            bg: selected
              ? '#F0EEFC'
              : out
                ? heat > 0.66
                  ? '#F9E7E1'
                  : heat > 0.33
                    ? '#FAEED8'
                    : '#EFF4EE'
                : colors.surfaceSubtle,
            borderColor: selected
              ? colors.accent
              : isToday
                ? colors.textPrimary
                : colors.borderSubtle,
            numColor: isToday ? colors.textPrimary : '#7C766D',
            showDot: (data?.planned.length ?? 0) > 0,
            selected,
            isToday,
          };
        }),
      );
    }
    return rows;
  }, [month, selectedDay, dayMap, calendar?.days]);

  const selectedData = selectedDay ? dayMap.get(selectedDay) : undefined;
  const selLabel = selectedDay ? formatShortDate(selectedDay) : 'Pick a day';
  const hasSel = !!selectedDay;
  const selEmpty = hasSel && !selectedData?.actual.length && !selectedData?.planned.length;

  const upcomingPay = useMemo(() => {
    const today = todayKey();
    const items: { label: string; sub: string; amount: string }[] = [];
    for (const day of calendar?.days ?? []) {
      if (day.date <= today) continue;
      for (const p of day.planned) {
        // Fixed = Planned commitments (home loan EMI, etc.). Loan-table EMIs
        // are no longer injected by the calendar API.
        if (
          p.kind !== 'Goal' &&
          p.kind !== 'Bill' &&
          p.kind !== 'Insurance' &&
          p.kind !== 'Fixed'
        ) {
          continue;
        }
        items.push({
          label: p.label,
          sub: `${p.kind} · ${formatShortDate(day.date)}`,
          amount: formatINR(Number(p.amount)),
        });
      }
    }
    return items.slice(0, 6);
  }, [calendar?.days]);

  const upcomingIn = useMemo(() => {
    const today = todayKey();
    const items: { label: string; sub: string; amount: string }[] = [];
    for (const day of calendar?.days ?? []) {
      if (day.date <= today) continue;
      for (const a of day.actual) {
        if (a.type !== 'income') continue;
        items.push({
          label: a.title,
          sub: `Expected · ${formatShortDate(day.date)}`,
          amount: formatINR(Number(a.amount)),
        });
      }
    }
    for (const day of calendar?.days ?? []) {
      if (day.date < today) continue;
      const inflow = Number(day.inflow);
      if (inflow > 0 && !day.actual.some((a) => a.type === 'income')) {
        items.push({
          label: 'Expected income',
          sub: formatShortDate(day.date),
          amount: formatINR(inflow),
        });
      }
    }
    return items.slice(0, 6);
  }, [calendar?.days]);

  return (
    <ScreenScaffold month={month} onMonthChange={handleMonthChange}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignKpiCard
          label="Money in"
          value={formatINR(moneyIn)}
          valueColor={colors.successValue}
          backgroundColor="#E7F1EC"
          borderColor="#D8E8E0"
          labelColor="#4C7F68"
        />
        <DesignKpiCard
          label="Money out"
          value={formatINR(moneyOut)}
          valueColor={colors.dangerValue}
          backgroundColor={colors.dangerTint}
          borderColor={colors.dangerTintBorder}
          labelColor={colors.dangerSubtext}
        />
        <DesignKpiCard
          label="Net cash flow"
          value={(netFlow >= 0 ? '+' : '−') + compactINR(Math.abs(netFlow))}
        />
      </DesignGrid>

      <DesignGridLead
        lead={
          <Card size="large" style={styles.calCard}>
            <View style={styles.dowRow}>
              {DOW.map((d, i) => (
                <Text key={i} style={styles.dowLabel}>
                  {d}
                </Text>
              ))}
            </View>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((day) =>
                  day.blank ? (
                    <View key={day.key} style={styles.dayBlank} />
                  ) : (
                    <Pressable
                      key={day.key}
                      onPress={() => setSelectedDay(selectedDay === day.key ? null : day.key)}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: day.bg,
                          borderColor: day.borderColor,
                          borderWidth: day.selected || day.isToday ? 1 : 1,
                        },
                        day.selected && styles.daySelected,
                      ]}
                    >
                      <Text style={[styles.dayNum, { color: day.numColor }]}>{day.num}</Text>
                      {day.inText ? (
                        <Text style={styles.dayIn} numberOfLines={1}>
                          {day.inText}
                        </Text>
                      ) : null}
                      {day.outText ? (
                        <Text style={styles.dayOut} numberOfLines={1}>
                          {day.outText}
                        </Text>
                      ) : null}
                      {day.showDot ? <View style={styles.dayDot} /> : null}
                    </Pressable>
                  ),
                )}
              </View>
            ))}
          </Card>
        }
        side={
          <View style={styles.sideStack}>
            <Card size="large" style={styles.sideCard}>
              <Text style={styles.sideTitle}>{selLabel}</Text>
              {!hasSel ? (
                <Text style={styles.emptyHint}>Tap any day to see what moved.</Text>
              ) : selEmpty ? (
                <Text style={styles.emptyHint}>No money moved on this day.</Text>
              ) : (
                <>
                  {selectedData?.actual.map((t) => (
                    <View key={t.id} style={styles.listRow}>
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: t.type === 'income' ? '#E7F1EC' : '#E5EEF8',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            { color: t.type === 'income' ? '#2F7D5D' : '#3E6E9E' },
                          ]}
                        >
                          {t.title.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.listCopy}>
                        <Text style={styles.listTitle}>{t.title}</Text>
                        <Text style={styles.listSub}>{t.type}</Text>
                      </View>
                      <Text
                        style={[
                          styles.listAmount,
                          moneyTextStyle,
                          {
                            color: t.type === 'income' ? colors.successValue : colors.textPrimary,
                          },
                        ]}
                      >
                        {(t.type === 'income' ? '+' : '−') + formatINR(Number(t.amount))}
                      </Text>
                    </View>
                  ))}
                  {selectedData?.planned.map((p) => (
                    <View key={p.label} style={styles.plannedRow}>
                      <View style={styles.plannedDot} />
                      <View style={styles.listCopy}>
                        <Text style={styles.listTitle}>{p.label}</Text>
                        <Text style={styles.listSub}>{p.kind} · scheduled</Text>
                      </View>
                      <Text style={[styles.plannedAmount, moneyTextStyle]}>
                        −{formatINR(Number(p.amount))}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </Card>

            <Card size="large" style={styles.sideCard}>
              <DesignSectionHeader title="Upcoming payments" />
              {upcomingPay.length === 0 ? (
                <Text style={styles.emptyHint}>No upcoming payments this month.</Text>
              ) : (
                upcomingPay.map((u) => (
                  <View key={`${u.label}-${u.sub}`} style={styles.listRow}>
                    <View style={[styles.plannedDot, { backgroundColor: '#E08A70' }]} />
                    <View style={styles.listCopy}>
                      <Text style={styles.listTitle}>{u.label}</Text>
                      <Text style={styles.listSub}>{u.sub}</Text>
                    </View>
                    <Text style={[styles.listAmount, moneyTextStyle]}>{u.amount}</Text>
                  </View>
                ))
              )}
            </Card>

            <Card size="large" style={styles.sideCard}>
              <DesignSectionHeader title="Upcoming income" />
              {upcomingIn.length === 0 ? (
                <Text style={styles.emptyHint}>No upcoming income this month.</Text>
              ) : (
                upcomingIn.map((u) => (
                  <View key={`${u.label}-${u.sub}`} style={styles.listRow}>
                    <View style={[styles.plannedDot, { backgroundColor: '#7FA87C' }]} />
                    <View style={styles.listCopy}>
                      <Text style={styles.listTitle}>{u.label}</Text>
                      <Text style={styles.listSub}>{u.sub}</Text>
                    </View>
                    <Text
                      style={[styles.listAmount, moneyTextStyle, { color: colors.successValue }]}
                    >
                      {u.amount}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </View>
        }
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  calCard: { padding: 20, gap: 6 },
  dowRow: { flexDirection: 'row', marginBottom: 8 },
  dowLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    letterSpacing: 1.32,
    color: '#B5AEA4',
  },
  weekRow: { flexDirection: 'row', gap: 6 },
  dayBlank: { flex: 1, height: 74 },
  dayCell: {
    flex: 1,
    height: 74,
    padding: 7,
    borderRadius: 14,
    gap: 2,
  },
  daySelected: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2,
  },
  dayNum: { fontFamily: fontFamily.extrabold, fontSize: 11.5 },
  dayIn: { fontFamily: fontFamily.bold, fontSize: 10.5, color: colors.successValue },
  dayOut: { fontFamily: fontFamily.bold, fontSize: 10.5, color: colors.dangerValue },
  dayDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
  },
  sideStack: { gap: 14 },
  sideCard: { padding: 20, gap: 4 },
  sideTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyHint: {
    paddingVertical: 26,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  plannedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  listCopy: { flex: 1, gap: 2 },
  listTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  listSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  listAmount: { fontSize: 13.5, letterSpacing: -0.34 },
  plannedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.warning },
  plannedAmount: { fontSize: 13, color: '#96702C' },
});

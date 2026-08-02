import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
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

const DAY_SPEND: Record<string, { in?: number; out?: number; planned?: boolean }> = {
  '2026-08-01': { in: 86000 },
  '2026-08-02': { out: 486 },
  '2026-08-03': { out: 5684 },
  '2026-08-05': { out: 1450, planned: true },
  '2026-08-06': { out: 3400 },
  '2026-08-07': { out: 649 },
  '2026-08-12': { out: 1400 },
  '2026-08-22': { out: 1400 },
  '2026-08-25': { out: 1600 },
};

const SEL_ITEMS = [
  {
    initial: 'G',
    title: 'Groceries',
    sub: 'Weekend run',
    amount: '−₹1,450',
    amountColor: colors.textPrimary,
    bg: '#E5EEF8',
    fg: '#3E6E9E',
  },
];

const SEL_PLANNED = [{ label: 'Emergency fund contribution', kind: 'Goal', amount: '−₹12,000' }];

const UPCOMING_PAY = [
  { label: 'Emergency fund contribution', sub: 'Goal · in 3 days', amount: '₹12,000' },
  { label: 'Japan trip 2027 contribution', sub: 'Goal · in 5 days', amount: '₹9,000' },
  { label: 'Term plan premium', sub: 'Insurance · in 8 days', amount: '₹14,200' },
  { label: 'Home loan EMI', sub: 'Planned EMI · in 12 days', amount: '₹18,400' },
];

const UPCOMING_IN = [
  { label: 'Salary', sub: 'Expected · 1 Aug 2026', amount: '₹86,000' },
  { label: 'Freelance retainer', sub: 'Freelance · 15 Aug 2026', amount: '₹2,350' },
];

function shortAmt(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

/** Design HTML `isCalendar` — cash-flow calendar with day drill-down. */
export default function CalendarScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const weeks = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const dim = new Date(y, m, 0).getDate();
    const firstDow = new Date(y, m - 1, 1).getDay();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);

    const maxOut = Math.max(1, ...Object.values(DAY_SPEND).map((d) => d.out ?? 0));

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
          const data = DAY_SPEND[key];
          const inc = data?.in ?? 0;
          const out = data?.out ?? 0;
          const heat = out / maxOut;
          const isToday = key === '2026-08-02';
          const selected = selectedDay === key;
          return {
            key,
            num: String(d),
            inText: inc ? `+${shortAmt(inc)}` : '',
            outText: out ? `−${shortAmt(out)}` : '',
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
            showDot: !!data?.planned,
            selected,
            isToday,
          };
        }),
      );
    }
    return rows;
  }, [month, selectedDay]);

  const selLabel = selectedDay ? formatShortDate(selectedDay) : 'Pick a day';
  const hasSel = !!selectedDay;
  const selEmpty = hasSel && selectedDay !== '2026-08-05';

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignKpiCard
          label="Money in"
          value="₹88,350"
          valueColor={colors.successValue}
          backgroundColor="#E7F1EC"
          borderColor="#D8E8E0"
          labelColor="#4C7F68"
        />
        <DesignKpiCard
          label="Money out"
          value="₹85,749"
          valueColor={colors.dangerValue}
          backgroundColor={colors.dangerTint}
          borderColor={colors.dangerTintBorder}
          labelColor={colors.dangerSubtext}
        />
        <DesignKpiCard label="Net cash flow" value="+₹2,601" />
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
                  {SEL_ITEMS.map((t) => (
                    <View key={t.title} style={styles.listRow}>
                      <View style={[styles.avatar, { backgroundColor: t.bg }]}>
                        <Text style={[styles.avatarText, { color: t.fg }]}>{t.initial}</Text>
                      </View>
                      <View style={styles.listCopy}>
                        <Text style={styles.listTitle}>{t.title}</Text>
                        <Text style={styles.listSub}>{t.sub}</Text>
                      </View>
                      <Text style={[styles.listAmount, moneyTextStyle, { color: t.amountColor }]}>
                        {t.amount}
                      </Text>
                    </View>
                  ))}
                  {SEL_PLANNED.map((p) => (
                    <View key={p.label} style={styles.plannedRow}>
                      <View style={styles.plannedDot} />
                      <View style={styles.listCopy}>
                        <Text style={styles.listTitle}>{p.label}</Text>
                        <Text style={styles.listSub}>{p.kind} · scheduled</Text>
                      </View>
                      <Text style={[styles.plannedAmount, moneyTextStyle]}>{p.amount}</Text>
                    </View>
                  ))}
                </>
              )}
            </Card>

            <Card size="large" style={styles.sideCard}>
              <DesignSectionHeader title="Upcoming payments" />
              {UPCOMING_PAY.map((u) => (
                <View key={u.label} style={styles.listRow}>
                  <View style={[styles.plannedDot, { backgroundColor: '#E08A70' }]} />
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{u.label}</Text>
                    <Text style={styles.listSub}>{u.sub}</Text>
                  </View>
                  <Text style={[styles.listAmount, moneyTextStyle]}>{u.amount}</Text>
                </View>
              ))}
            </Card>

            <Card size="large" style={styles.sideCard}>
              <DesignSectionHeader title="Upcoming income" />
              {UPCOMING_IN.map((u) => (
                <View key={u.label} style={styles.listRow}>
                  <View style={[styles.plannedDot, { backgroundColor: '#7FA87C' }]} />
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{u.label}</Text>
                    <Text style={styles.listSub}>{u.sub}</Text>
                  </View>
                  <Text style={[styles.listAmount, moneyTextStyle, { color: colors.successValue }]}>
                    {u.amount}
                  </Text>
                </View>
              ))}
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

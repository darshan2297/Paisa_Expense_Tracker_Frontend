import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { useTransactionsSummary } from '@/features/transactions/hooks';
import { compact, fmt, pctWidth } from '@/mock/format';
import { MOCK_CARDS, cardsSummaryFrom } from '@/mock/seed/cards';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

const CARD_THEMES: [string, string, string][] = [
  ['#2E2A63', '#171533', '#C9C4FF'],
  ['#14342B', '#0A1F19', '#8FE0BE'],
  ['#3A2320', '#1F1412', '#F3A48E'],
  ['#2A2620', '#15120F', '#E4D7B4'],
];

const MOCK_CARD_PAYMENTS = [
  { id: 'cp1', cardId: 'c1', amount: 21400, date: '2026-07-08' },
  { id: 'cp2', cardId: 'c2', amount: 38900, date: '2026-07-05' },
  { id: 'cp3', cardId: 'c3', amount: 74100, date: '2026-07-12' },
  { id: 'cp4', cardId: 'c1', amount: 16800, date: '2026-06-08' },
  { id: 'cp5', cardId: 'c3', amount: 58200, date: '2026-06-12' },
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
  const [cards, setCards] = useState(MOCK_CARDS);
  const summary = useTransactionsSummary(month);

  const totals = useMemo(() => cardsSummaryFrom(cards), [cards]);
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
      const avail = Math.max(0, limit - outstanding);
      const util = limit ? (outstanding / limit) * 100 : 0;
      const u = utilStyle(util);
      const due = cardDueChip(card.due_day, month);
      const stmtDate = `${month}-${String(Math.min(28, card.statement_day)).padStart(2, '0')}`;
      const dueDate = `${month}-${String(Math.min(28, card.due_day)).padStart(2, '0')}`;
      return { card, theme, limit, outstanding, avail, util, u, due, stmtDate, dueDate };
    });
  }, [cards, month]);

  const cardHistory = useMemo(() => {
    return MOCK_CARD_PAYMENTS.slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map((p) => {
        const cd = cards.find((c) => c.id === p.cardId);
        return {
          id: p.id,
          label: cd ? `${cd.bank} ${cd.name}` : 'Card payment',
          sub: dateShort(p.date),
          amount: fmt(p.amount),
        };
      });
  }, [cards]);

  const cardCats = useMemo(() => {
    const breakdown = summary.data?.category_breakdown ?? [];
    const top = breakdown.slice(0, 5);
    const max = top.length ? Number(top[0].amount) : 1;
    return top.map((c) => ({
      name: c.name,
      amount: fmt(Number(c.amount) * 0.45),
      color: c.color,
      width: pctWidth(Number(c.amount), max),
    }));
  }, [summary.data]);

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
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
        onAction={() => router.push('/(tabs)/wealth')}
      />

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No cards added</Text>
          <Text style={styles.emptySub}>Add a credit card to track limits and due dates.</Text>
        </View>
      ) : (
        <DesignGrid cols={2} tabletCols={1} narrowCols={1}>
          {cardRows.map(
            ({ card, theme, limit, outstanding, avail, util, u, due, stmtDate, dueDate }) => (
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
                    <DetailStat label="Total due" value={fmt(outstanding)} />
                  </View>

                  <Text style={styles.cycleText}>
                    Cycle {dateShort(stmtDate)} → {dateShort(dueDate)}
                  </Text>

                  <Pressable style={styles.addSpendBtn}>
                    <Feather name="plus" size={14} color="#453F37" />
                    <Text style={styles.addSpendText}>Add spend on this card</Text>
                  </Pressable>

                  <View style={styles.payRow}>
                    <Pressable style={styles.payFullBtn}>
                      <Text style={styles.payFullText}>Pay full</Text>
                    </Pressable>
                    <Pressable style={styles.payMinBtn}>
                      <Text style={styles.payMinText}>Pay minimum</Text>
                    </Pressable>
                  </View>
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
              {cardCats.map((cat) => (
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
              ))}
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
    </ScreenScaffold>
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
    fontVariant: ['tabular-nums'],
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

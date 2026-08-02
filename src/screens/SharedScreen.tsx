import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import {
  DesignDarkHero,
  DesignKpiCard,
  DesignSectionHeader,
} from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { initials } from '@/mock/format';
import { MOCK_GROUPS, type MockGroup } from '@/mock/seed/wealth';
import { formatINR } from '@/utils/currency';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatShortDate } from '@/utils/date';

const AVATARS = [
  { bg: '#E2F0E9', fg: '#2F7D5D' },
  { bg: '#EDE9FE', fg: '#5B54D6' },
  { bg: '#E5EEF8', fg: '#3E6E9E' },
  { bg: '#FAEED8', fg: '#96702C' },
];

function groupTotal(g: MockGroup): number {
  return g.expenses.reduce((a, e) => a + e.amount, 0);
}

function buildBalances(g: MockGroup) {
  const total = groupTotal(g);
  const share = total / Math.max(1, g.members.length);
  const paidBy: Record<string, number> = {};
  g.members.forEach((m) => {
    paidBy[m] = 0;
  });
  g.expenses.forEach((e) => {
    paidBy[e.payer] = (paidBy[e.payer] || 0) + e.amount;
  });
  const settledNet: Record<string, number> = {};
  g.members.forEach((m) => {
    settledNet[m] = 0;
  });
  g.settlements.forEach((s) => {
    settledNet[s.from] = (settledNet[s.from] || 0) + s.amount;
    settledNet[s.to] = (settledNet[s.to] || 0) - s.amount;
  });

  return g.members.map((name, i) => {
    const net = (paidBy[name] || 0) - share + (settledNet[name] || 0);
    const av = AVATARS[i % AVATARS.length];
    const settled = Math.abs(net) < 1;
    return {
      name,
      initials: initials(name),
      bg: av.bg,
      fg: av.fg,
      paid: formatINR(paidBy[name] || 0),
      owed: formatINR(share),
      received: formatINR(
        g.settlements.filter((s) => s.to === name).reduce((a, s) => a + s.amount, 0),
      ),
      net: settled ? 'Settled' : (net > 0 ? '+' : '−') + formatINR(Math.abs(net)),
      netColor: settled ? colors.textCaption : net > 0 ? colors.successValue : colors.dangerValue,
      state: settled ? 'Settled up' : net > 0 ? 'Gets back' : 'Owes',
      stateBg: settled ? '#E2F0E9' : net > 0 ? '#E7F1EC' : colors.dangerTint,
      stateFg: settled ? colors.success : net > 0 ? colors.successValue : colors.dangerValue,
      canSettle: !settled && name !== 'You',
    };
  });
}

/** Design HTML `isShared` — split expenses across groups. */
export default function SharedScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [openId, setOpenId] = useState<string | null>(MOCK_GROUPS[0]?.id ?? null);

  const sharedTotal = useMemo(() => MOCK_GROUPS.reduce((a, g) => a + groupTotal(g), 0), []);

  const cards = useMemo(
    () =>
      MOCK_GROUPS.map((g) => {
        const total = groupTotal(g);
        const share = total / Math.max(1, g.members.length);
        const balances = buildBalances(g);
        const you = balances.find((b) => b.name === 'You');
        const youNet = you
          ? parseFloat(you.net.replace(/[^0-9.]/g, '')) *
            (you.net.startsWith('−') ? -1 : you.net.startsWith('+') ? 1 : 0)
          : 0;
        return {
          group: g,
          total,
          share,
          balances,
          youNetText:
            Math.abs(youNet) < 1
              ? 'All settled'
              : `${youNet > 0 ? 'You are owed ' : 'You owe '}${formatINR(Math.abs(youNet))}`,
          youNetColor:
            Math.abs(youNet) < 1
              ? colors.textCaption
              : youNet > 0
                ? colors.successValue
                : colors.dangerValue,
        };
      }),
    [],
  );

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignDarkHero
          eyebrow="Shared wallet"
          value={formatINR(sharedTotal)}
          note="total spent across all groups"
        />
        <DesignKpiCard
          label="Others owe you"
          value="₹19,000"
          valueColor={colors.successValue}
          backgroundColor="#E7F1EC"
          borderColor="#D8E8E0"
          labelColor="#4C7F68"
        />
        <DesignKpiCard
          label="You owe"
          value="₹11,000"
          valueColor={colors.dangerValue}
          backgroundColor={colors.dangerTint}
          borderColor={colors.dangerTintBorder}
          labelColor={colors.dangerSubtext}
        />
      </DesignGrid>

      <View style={styles.header}>
        <DesignSectionHeader title="Your groups" />
        <Pressable style={styles.addBtn}>
          <Feather name="plus" size={14} color={colors.heroText} />
          <Text style={styles.addBtnText}>New group</Text>
        </Pressable>
      </View>

      {cards.map(({ group: g, total, balances, youNetText, youNetColor }) => {
        const open = openId === g.id;
        return (
          <Card key={g.id} style={styles.groupCard}>
            <Pressable onPress={() => setOpenId(open ? null : g.id)} style={styles.groupHeader}>
              <View style={[styles.groupIcon, { backgroundColor: g.bg }]}>
                <Feather name="users" size={18} color={g.fg} />
              </View>
              <View style={styles.groupCopy}>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupSub} numberOfLines={1}>
                  {g.tag} · {g.members.join(' · ')}
                </Text>
              </View>
              <View style={styles.groupStats}>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Group total</Text>
                  <Text style={[styles.statValue, moneyTextStyle]}>{formatINR(total)}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Your position</Text>
                  <Text style={[styles.youNet, { color: youNetColor }]}>{youNetText}</Text>
                </View>
              </View>
              <Pressable style={styles.addExpBtn}>
                <Text style={styles.addExpText}>Add expense</Text>
              </Pressable>
              <Feather
                name="chevron-down"
                size={16}
                color="#B7B0A6"
                style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
              />
            </Pressable>

            {open ? (
              <View style={styles.groupBody}>
                <DesignGrid cols={3} tabletCols={1} narrowCols={1}>
                  {balances.map((b) => (
                    <Card key={b.name} style={styles.balanceCard}>
                      <View style={styles.balanceHeader}>
                        <View style={[styles.avatar, { backgroundColor: b.bg }]}>
                          <Text style={[styles.avatarText, { color: b.fg }]}>{b.initials}</Text>
                        </View>
                        <Text style={styles.balanceName}>{b.name}</Text>
                        <Text
                          style={[
                            styles.stateChip,
                            { backgroundColor: b.stateBg, color: b.stateFg },
                          ]}
                        >
                          {b.state}
                        </Text>
                      </View>
                      <Text style={styles.balanceMeta}>
                        Paid {b.paid} · Share {b.owed} · Received {b.received}
                      </Text>
                      <View style={styles.balanceFooter}>
                        <Text style={[styles.balanceNet, moneyTextStyle, { color: b.netColor }]}>
                          {b.net}
                        </Text>
                        {b.canSettle ? (
                          <Pressable style={styles.settleBtn}>
                            <Text style={styles.settleText}>Settle</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </Card>
                  ))}
                </DesignGrid>

                <View style={styles.splitCols}>
                  <View style={styles.splitCol}>
                    <Text style={styles.splitHeading}>Expenses</Text>
                    {g.expenses.map((e) => (
                      <View key={e.id} style={styles.expRow}>
                        <View style={styles.expCopy}>
                          <Text style={styles.expLabel}>{e.label}</Text>
                          <Text style={styles.expSub}>{e.payer}</Text>
                        </View>
                        <Text style={styles.expDate}>{formatShortDate(e.date)}</Text>
                        <Text style={[styles.expAmount, moneyTextStyle]}>
                          {formatINR(e.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.splitCol}>
                    <Text style={styles.splitHeading}>Settlement history</Text>
                    {g.settlements.length === 0 ? (
                      <Text style={styles.noSettle}>Nothing settled yet in this group.</Text>
                    ) : (
                      g.settlements.map((s) => (
                        <View key={s.id} style={styles.settleRow}>
                          <View style={styles.settleDot} />
                          <Text style={styles.settleLabel}>
                            {s.from} → {s.to}
                          </Text>
                          <Text style={styles.expDate}>{formatShortDate(s.date)}</Text>
                          <Text
                            style={[
                              styles.settleAmount,
                              moneyTextStyle,
                              { color: colors.successValue },
                            ]}
                          >
                            {formatINR(s.amount)}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </View>
            ) : null}
          </Card>
        );
      })}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  addBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
  },
  addBtnText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.heroText },
  groupCard: { padding: 0, overflow: 'hidden' },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 17,
    flexWrap: 'wrap',
  },
  groupIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCopy: { flex: 1, minWidth: 120, gap: 3 },
  groupName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
  },
  groupSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  groupStats: { flexDirection: 'row', gap: 14 },
  statBlock: { alignItems: 'flex-end' },
  statLabel: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textCaption },
  statValue: { fontFamily: fontFamily.extrabold, fontSize: 17, letterSpacing: -0.6 },
  youNet: { fontFamily: fontFamily.extrabold, fontSize: 13.5, letterSpacing: -0.27 },
  addExpBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  addExpText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  groupBody: {
    padding: 18,
    gap: 18,
    backgroundColor: colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  balanceCard: { padding: 15, gap: 11 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  balanceName: {
    flex: 1,
    fontFamily: fontFamily.extrabold,
    fontSize: 13.5,
    letterSpacing: -0.27,
    color: colors.textPrimary,
  },
  stateChip: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  balanceMeta: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textCaption },
  balanceFooter: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  balanceNet: { fontFamily: fontFamily.extrabold, fontSize: 17, letterSpacing: -0.6 },
  settleBtn: {
    marginLeft: 'auto',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  settleText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.heroText },
  splitCols: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  splitCol: { flex: 1, minWidth: 200 },
  splitHeading: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: '#948E85',
    marginBottom: 6,
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  expCopy: { flex: 1, gap: 2 },
  expLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  expSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  expDate: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  expAmount: { fontFamily: fontFamily.extrabold, fontSize: 13.5 },
  noSettle: {
    paddingVertical: 18,
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  settleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7FA87C' },
  settleLabel: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  settleAmount: { fontFamily: fontFamily.extrabold, fontSize: 13.5 },
});

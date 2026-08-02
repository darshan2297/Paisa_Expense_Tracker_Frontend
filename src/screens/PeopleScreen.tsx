import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard, DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { fmt, initials } from '@/mock/format';
import { MOCK_LEDGER, type MockLedgerEntry } from '@/mock/seed/wealth';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

const DIRS: Record<
  MockLedgerEntry['dir'],
  { label: string; sign: 1 | -1; dot: string; amountColor: string }
> = {
  lent: { label: 'I gave money', sign: 1, dot: '#7FA87C', amountColor: colors.successValue },
  received: { label: 'They returned', sign: -1, dot: '#7FA87C', amountColor: colors.successValue },
  borrowed: { label: 'I took money', sign: -1, dot: '#E08A70', amountColor: colors.dangerValue },
  repaid: { label: 'I returned', sign: 1, dot: '#7FA87C', amountColor: colors.successValue },
};

const AVATARS: [string, string][] = [
  ['#EDE9FE', '#5B54D6'],
  ['#E2F0E9', '#2F7D5D'],
  ['#F9E7E1', '#C2543D'],
  ['#E5EEF8', '#3E6E9E'],
  ['#FAEED8', '#96702C'],
  ['#FAE5F0', '#A84A7C'],
];

function entryDateShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}

function peopleFromLedger(ledger: MockLedgerEntry[]) {
  const map = new Map<string, MockLedgerEntry[]>();
  for (const entry of ledger) {
    const list = map.get(entry.person) ?? [];
    list.push(entry);
    map.set(entry.person, list);
  }
  return Array.from(map.entries())
    .map(([name, entries]) => {
      const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
      const net = sorted.reduce((sum, e) => sum + e.amount * DIRS[e.dir].sign, 0);
      return { name, entries: sorted, net };
    })
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

/** Design HTML `isPeople` — receivable/payable/net summary and people cards. */
export default function PeopleScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [ledger, setLedger] = useState(MOCK_LEDGER);
  const [openPerson, setOpenPerson] = useState<string | null>(null);

  const people = useMemo(() => peopleFromLedger(ledger), [ledger]);

  const owedToMe = people.filter((p) => p.net > 0).reduce((s, p) => s + p.net, 0);
  const iOwe = people.filter((p) => p.net < 0).reduce((s, p) => s - p.net, 0);
  const netLoan = owedToMe - iOwe;
  const netLoanColor =
    Math.abs(netLoan) < 1
      ? colors.textCaption
      : netLoan > 0
        ? colors.successValue
        : colors.dangerValue;

  function removeEntry(id: string) {
    setLedger((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <DesignKpiCard
          label="Total receivable"
          value={fmt(owedToMe)}
          backgroundColor="#E7F1EC"
          borderColor="#D8E8E0"
          labelColor="#4C7F68"
          valueColor={colors.successValue}
        />
        <DesignKpiCard
          label="Total payable"
          value={fmt(iOwe)}
          backgroundColor={colors.dangerTint}
          borderColor={colors.dangerTintBorder}
          labelColor={colors.dangerSubtext}
          valueColor={colors.dangerValue}
        />
        <DesignKpiCard label="Net position" value={fmt(netLoan)} valueColor={netLoanColor} />
      </DesignGrid>

      <DesignSectionHeader
        title="Everyone you have money with"
        actionLabel="+ Add record"
        darkAction
        onAction={() => router.push('/(tabs)/transactions')}
      />

      <View style={styles.list}>
        {people.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No lending records</Text>
            <Text style={styles.emptySub}>Track money you give to or take from people.</Text>
          </View>
        ) : (
          people.map((person, index) => {
            const av = AVATARS[index % AVATARS.length];
            const settled = Math.abs(person.net) < 1;
            const open = openPerson === person.name;
            const lastDate = entryDateShort(person.entries[0].date);
            return (
              <Card key={person.name} size="large" style={styles.personCard}>
                <Pressable
                  onPress={() => setOpenPerson(open ? null : person.name)}
                  style={({ pressed }) => [
                    styles.personHeader,
                    pressed && styles.personHeaderPressed,
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: av[0] }]}>
                    <Text style={[styles.avatarText, { color: av[1] }]}>
                      {initials(person.name)}
                    </Text>
                  </View>
                  <View style={styles.personCopy}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personSub}>
                      {person.entries.length} entr{person.entries.length === 1 ? 'y' : 'ies'} · last{' '}
                      {lastDate}
                    </Text>
                  </View>
                  <View style={styles.personRight}>
                    <View style={styles.netBlock}>
                      <Text style={styles.netLabel}>
                        {settled ? 'settled up' : person.net > 0 ? 'owes you' : 'you owe'}
                      </Text>
                      <Text
                        style={[
                          styles.netValue,
                          moneyTextStyle,
                          {
                            color: settled
                              ? colors.textCaption
                              : person.net > 0
                                ? colors.successValue
                                : colors.dangerValue,
                          },
                        ]}
                      >
                        {settled ? '—' : fmt(person.net)}
                      </Text>
                    </View>
                    <Pressable style={styles.settleBtn}>
                      <Text style={styles.settleBtnText}>Settle</Text>
                    </Pressable>
                    <Feather
                      name="chevron-down"
                      size={16}
                      color="#B7B0A6"
                      style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                    />
                  </View>
                </Pressable>

                {open ? (
                  <View style={styles.entries}>
                    {person.entries.map((entry) => {
                      const dir = DIRS[entry.dir];
                      const credit = dir.sign > 0;
                      return (
                        <View key={entry.id} style={styles.entryRow}>
                          <View style={[styles.entryDot, { backgroundColor: dir.dot }]} />
                          <Text style={styles.entryLabel}>{dir.label}</Text>
                          <Text style={styles.entryNote}>{entry.note}</Text>
                          <Text style={styles.entryDate}>{entryDateShort(entry.date)}</Text>
                          <Text
                            style={[
                              styles.entryAmount,
                              moneyTextStyle,
                              { color: credit ? colors.successValue : colors.dangerValue },
                            ]}
                          >
                            {(credit ? '+' : '−') + fmt(entry.amount)}
                          </Text>
                          <Pressable
                            onPress={() => removeEntry(entry.id)}
                            style={styles.entryRemove}
                          >
                            <Text style={styles.entryRemoveText}>×</Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  list: { gap: 11 },
  personCard: { padding: 0, overflow: 'hidden' },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  personHeaderPressed: { backgroundColor: colors.surfaceSubtle },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.extrabold, fontSize: 14 },
  personCopy: { flex: 1, minWidth: 120, gap: 3 },
  personName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
  },
  personSub: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textCaption },
  personRight: { flexDirection: 'row', alignItems: 'center', gap: 13, marginLeft: 'auto' },
  netBlock: { alignItems: 'flex-end' },
  netLabel: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textCaption },
  netValue: { fontFamily: fontFamily.extrabold, fontSize: 17, letterSpacing: -0.6 },
  settleBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  settleBtnText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  entries: {
    paddingTop: 4,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  entryDot: { width: 7, height: 7, borderRadius: 99 },
  entryLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.textPrimary },
  entryNote: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textCaption },
  entryDate: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textCaption,
    marginLeft: 'auto',
  },
  entryAmount: { fontFamily: fontFamily.extrabold, fontSize: 13.5 },
  entryRemove: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryRemoveText: { fontSize: 18, color: colors.textCaption, lineHeight: 20 },
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

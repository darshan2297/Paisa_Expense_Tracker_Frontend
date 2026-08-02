import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { QueryBoundary } from '@/components/QueryBoundary';
import { Sheet } from '@/components/Sheet';
import { useCardsSummary, useCreateCard, usePayCard } from '@/features/cards/hooks';
import type { CreditCard } from '@/features/cards/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { formatINR } from '@/utils/currency';

/** Wealth tab — credit cards (F6), pixel-matched to design wealth hub cards section. */
export default function WealthScreen() {
  const summary = useCardsSummary();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <QueryBoundary
        isLoading={summary.isLoading}
        isError={summary.isError}
        onRetry={() => summary.refetch()}
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <HeroCard style={styles.hero}>
            <Text style={styles.heroEyebrow}>Total outstanding</Text>
            <Text style={[styles.heroValue, moneyTextStyle]}>
              {formatINR(Number(summary.data?.total_outstanding ?? 0))}
            </Text>
            <Text style={styles.heroNote}>
              {(summary.data?.utilization_pct ?? 0).toFixed(0)}% utilization · limit{' '}
              {formatINR(Number(summary.data?.total_limit ?? 0))}
            </Text>
          </HeroCard>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Credit cards</Text>
            <Pressable onPress={() => setAddOpen(true)} style={styles.addButton}>
              <Feather name="plus" size={14} color="#453F37" />
              <Text style={styles.addButtonLabel}>Add card</Text>
            </Pressable>
          </View>

          {(summary.data?.cards.length ?? 0) === 0 ? (
            <Card size="large">
              <Text style={styles.emptyTitle}>No cards yet</Text>
              <Text style={styles.emptySub}>Track utilization, minimum due, and payments.</Text>
            </Card>
          ) : (
            summary.data!.cards.map((card) => <CardRow key={card.id} card={card} />)
          )}

          <AddCardSheet visible={addOpen} onClose={() => setAddOpen(false)} />
        </ScrollView>
      </QueryBoundary>
    </SafeAreaView>
  );
}

function CardRow({ card }: { card: CreditCard }) {
  const payCard = usePayCard();
  const utilizationTone = card.utilization_pct > 70 ? colors.dangerValue : colors.successValue;

  return (
    <Card size="large" style={styles.cardRow}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.cardName}>{card.name}</Text>
          <Text style={styles.cardBank}>
            {card.bank} · {card.network} ···{card.last4}
          </Text>
        </View>
        <Text style={[styles.utilization, { color: utilizationTone }]}>
          {card.utilization_pct}%
        </Text>
      </View>
      <View style={styles.cardStats}>
        <View>
          <Text style={styles.statLabel}>Outstanding</Text>
          <Text style={[styles.statValue, moneyTextStyle]}>
            {formatINR(Number(card.outstanding))}
          </Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Min due</Text>
          <Text style={[styles.statValue, moneyTextStyle]}>
            {formatINR(Number(card.minimum_due))}
          </Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Due day</Text>
          <Text style={styles.statValue}>{card.due_day}</Text>
        </View>
      </View>
      <Button
        label="Pay minimum"
        size="lg"
        loading={payCard.isPending}
        onPress={() => payCard.mutate({ cardId: card.id, payload: { amount: card.minimum_due } })}
      />
    </Card>
  );
}

function AddCardSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const createCard = useCreateCard();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [last4, setLast4] = useState('');
  const [limit, setLimit] = useState('');
  const [outstanding, setOutstanding] = useState('0');
  const [statementDay, setStatementDay] = useState('26');
  const [dueDay, setDueDay] = useState('8');

  function submit() {
    createCard.mutate(
      {
        name: name.trim(),
        bank: bank.trim(),
        last4,
        credit_limit: limit,
        outstanding,
        statement_day: Number(statementDay),
        due_day: Number(dueDay),
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>Add credit card</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Card name" style={styles.input} />
      <TextInput value={bank} onChangeText={setBank} placeholder="Bank" style={styles.input} />
      <TextInput
        value={last4}
        onChangeText={setLast4}
        placeholder="Last 4 digits"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={limit}
        onChangeText={setLimit}
        placeholder="Credit limit"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={outstanding}
        onChangeText={setOutstanding}
        placeholder="Outstanding"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={statementDay}
        onChangeText={setStatementDay}
        placeholder="Statement day (1-28)"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={dueDay}
        onChangeText={setDueDay}
        placeholder="Due day (1-28)"
        keyboardType="numeric"
        style={styles.input}
      />
      <Button label="Save card" onPress={submit} loading={createCard.isPending} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: 14 },
  hero: { paddingVertical: 24, paddingHorizontal: 26 },
  heroEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.heroTextEyebrow,
  },
  heroValue: { fontSize: 34, color: colors.heroText, marginTop: spacing.sm },
  heroNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.heroTextMuted,
    marginTop: spacing.xs,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fontFamily.extrabold, fontSize: 18, color: colors.textPrimary },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonLabel: { fontFamily: fontFamily.semibold, fontSize: 12.5, color: '#453F37' },
  cardRow: { gap: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.textPrimary },
  cardBank: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  utilization: { fontFamily: fontFamily.extrabold, fontSize: 15 },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.textLabel },
  statValue: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textPrimary, marginTop: 2 },
  emptyTitle: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.textPrimary },
  emptySub: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.textMuted, marginTop: 4 },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
});

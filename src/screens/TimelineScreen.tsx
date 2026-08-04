import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import {
  ModalAmountField,
  ModalBody,
  ModalDateNoteRow,
  ModalError,
  ModalHeader,
  ModalSave,
  ModalTextField,
} from '@/components/modal/ModalForm';
import { Sheet } from '@/components/Sheet';
import { Card } from '@/components/Card';
import { useCreateMilestone, useMilestones } from '@/features/milestones/hooks';
import { compactINR } from '@/utils/currency';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

const DOT_COLORS = [
  { dot: '#2F7D5D', dotBg: '#E2F0E9' },
  { dot: '#A2701F', dotBg: '#FBE9D2' },
  { dot: '#2F7D6E', dotBg: '#E7F0EF' },
  { dot: '#5B54D6', dotBg: '#EDE9FE' },
  { dot: '#3E6E9E', dotBg: '#E5EEF8' },
];

function formatMilestoneDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

/** Design HTML `isTimeline` — wealth milestones timeline. */
export default function TimelineScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const { data: milestones = [] } = useMilestones();
  const createMilestone = useCreateMilestone();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  const timeline = useMemo(
    () => [...milestones].sort((a, b) => b.date.localeCompare(a.date)),
    [milestones],
  );

  function closeAdd() {
    setAddOpen(false);
    setTitle('');
    setNote('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setError('');
  }

  function submitMilestone() {
    if (!title.trim()) {
      setError('What happened?');
      return;
    }
    createMilestone.mutate(
      {
        title: title.trim(),
        note: note.trim() || null,
        amount: amount.trim() || '0',
        date,
      },
      {
        onSuccess: closeAdd,
        onError: () => setError('Could not save that milestone. Try again.'),
      },
    );
  }

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <View style={styles.header}>
        <DesignSectionHeader title="Milestones so far" />
        <Pressable style={styles.addBtn} onPress={() => setAddOpen(true)}>
          <Feather name="plus" size={14} color={colors.heroText} />
          <Text style={styles.addBtnText}>Add milestone</Text>
        </Pressable>
      </View>

      {timeline.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No milestones yet</Text>
          <Text style={styles.emptySub}>Record key moments in your financial journey.</Text>
        </View>
      ) : (
        <Card size="large" style={styles.timelineCard}>
          {timeline.map((m, i) => {
            const palette = DOT_COLORS[i % DOT_COLORS.length];
            const isLast = i === timeline.length - 1;
            const amount = Number(m.amount);
            return (
              <View key={m.id} style={styles.entry}>
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.dot,
                      { borderColor: palette.dot, backgroundColor: palette.dotBg },
                    ]}
                  />
                  {!isLast ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.entryBody}>
                  <Text style={styles.entryDate}>{formatMilestoneDate(m.date)}</Text>
                  <Text style={styles.entryTitle}>{m.title}</Text>
                  {m.note ? <Text style={styles.entryNote}>{m.note}</Text> : null}
                  <View style={styles.entryFooter}>
                    {amount > 0 ? (
                      <Text style={[styles.entryAmount, moneyTextStyle]}>{compactINR(amount)}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      <Sheet visible={addOpen} onClose={closeAdd} variant="center">
        <ModalHeader title="Add milestone" onClose={closeAdd} />
        <ModalBody>
          <ModalAmountField
            label="Amount involved (optional)"
            value={amount}
            onChangeText={setAmount}
          />
          <ModalTextField
            label="What happened"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Bought the apartment"
          />
          <ModalDateNoteRow date={date} onDate={setDate} note={note} onNote={setNote} />
          <ModalError message={error} />
          <ModalSave label="Save" onPress={submitMilestone} loading={createMilestone.isPending} />
        </ModalBody>
      </Sheet>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
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
  addBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.heroText,
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
  timelineCard: { paddingVertical: 28, paddingHorizontal: 30 },
  entry: { flexDirection: 'row', gap: 18 },
  rail: { alignItems: 'center', width: 40 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
  },
  line: { flex: 1, width: 2, backgroundColor: colors.borderSubtle, marginVertical: 4 },
  entryBody: { flex: 1, paddingBottom: 26, gap: 3 },
  entryDate: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: colors.textCaption,
  },
  entryTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
    marginTop: 2,
  },
  entryNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textLabel,
  },
  entryFooter: { marginTop: 4, alignItems: 'flex-end' },
  entryAmount: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.45,
    color: colors.textPrimary,
  },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sheetForm: { gap: 12 },
  sheetInput: {
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surfaceSubtle,
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  saveBtn: { width: '100%', height: 50, borderRadius: 15 },
});

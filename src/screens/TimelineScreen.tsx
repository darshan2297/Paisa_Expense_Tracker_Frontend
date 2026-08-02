import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { MOCK_MILESTONES } from '@/mock/seed/wealth';
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
  const timeline = [...MOCK_MILESTONES].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <View style={styles.header}>
        <DesignSectionHeader title="Milestones so far" />
        <Pressable style={styles.addBtn}>
          <Feather name="plus" size={14} color={colors.heroText} />
          <Text style={styles.addBtnText}>Add milestone</Text>
        </Pressable>
      </View>

      <Card size="large" style={styles.timelineCard}>
        {timeline.map((m, i) => {
          const palette = DOT_COLORS[i % DOT_COLORS.length];
          const isLast = i === timeline.length - 1;
          return (
            <View key={m.id} style={styles.entry}>
              <View style={styles.rail}>
                <View
                  style={[styles.dot, { borderColor: palette.dot, backgroundColor: palette.dotBg }]}
                />
                {!isLast ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.entryBody}>
                <Text style={styles.entryDate}>{formatMilestoneDate(m.date)}</Text>
                <Text style={styles.entryTitle}>{m.title}</Text>
                <Text style={styles.entryNote}>{m.note}</Text>
                <View style={styles.entryFooter}>
                  {m.amount > 0 ? (
                    <Text style={[styles.entryAmount, moneyTextStyle]}>{compactINR(m.amount)}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </Card>
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
});

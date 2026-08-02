import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { compact, fmt } from '@/mock/format';
import { MOCK_POLICIES } from '@/mock/seed/wealth';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatShortDate } from '@/utils/date';

const TODAY = '2026-08-02';
const LEAD_DAYS = 15;

function dayDiff(a: string, b: string): number {
  return Math.round(
    (new Date(`${a}T00:00:00`).getTime() - new Date(`${b}T00:00:00`).getTime()) / 86400000,
  );
}

/** Design HTML `isPolicy` — cover hero, premiums, policy cards. */
export default function PolicyScreen() {
  const [month, setMonth] = useState(currentYearMonth());

  const stats = useMemo(() => {
    const cover = MOCK_POLICIES.filter((p) => ['TERM', 'HLTH', 'ACC'].includes(p.kind)).reduce(
      (a, p) => a + p.cover,
      0,
    );
    const premiumYear = MOCK_POLICIES.reduce((a, p) => a + p.premium, 0);
    const sorted = [...MOCK_POLICIES].sort((a, b) => a.due.localeCompare(b.due));
    const nextPol = sorted[0];
    return { cover, premiumYear, nextPol };
  }, []);

  const policies = useMemo(
    () =>
      [...MOCK_POLICIES]
        .sort((a, b) => a.due.localeCompare(b.due))
        .map((p) => {
          const dd = dayDiff(p.due, TODAY);
          return {
            ...p,
            cover: compact(p.cover),
            premium: fmt(p.premium),
            dueDate: formatShortDate(p.due),
            dueChip:
              dd < 0
                ? `${Math.abs(dd)}d overdue`
                : dd === 0
                  ? 'Due today'
                  : dd <= LEAD_DAYS
                    ? `in ${dd} days`
                    : 'Active',
            dueBg: dd < 0 ? '#F9E7E1' : dd <= LEAD_DAYS ? '#FAEED8' : '#E2F0E9',
            dueFg: dd < 0 ? colors.dangerValue : dd <= LEAD_DAYS ? '#96702C' : colors.success,
          };
        }),
    [],
  );

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={3} tabletCols={2} narrowCols={1}>
        <LinearGradient
          colors={['#2B2758', '#191637']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.coverHero}
        >
          <Text style={styles.coverEyebrow}>Total life & health cover</Text>
          <Text style={[styles.coverValue, moneyTextStyle]}>{compact(stats.cover)}</Text>
          <Text style={styles.coverNote}>
            {MOCK_POLICIES.length} policies · life, health and accident
          </Text>
        </LinearGradient>

        <DesignKpiCard
          label="Premiums per year"
          value={fmt(stats.premiumYear)}
          sub={`≈ ${fmt(Math.round(stats.premiumYear / 12))} a month set aside`}
        />
        <DesignKpiCard
          label="Next renewal"
          value={stats.nextPol ? formatShortDate(stats.nextPol.due) : '—'}
          sub={stats.nextPol ? stats.nextPol.name : 'Add a policy to track renewals'}
        />
      </DesignGrid>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Your policies</Text>
        <Pressable style={styles.darkBtn}>
          <Feather name="plus" size={14} color={colors.surface} />
          <Text style={styles.darkBtnLabel}>Add policy</Text>
        </Pressable>
      </View>

      <DesignGrid cols={2} tabletCols={1} narrowCols={1}>
        {policies.map((p) => (
          <Card key={p.id} size="large" style={styles.policyCard}>
            <View style={styles.policyTop}>
              <View style={[styles.policyTag, { backgroundColor: p.bg }]}>
                <Text style={[styles.policyTagText, { color: p.fg }]}>{p.tag}</Text>
              </View>
              <View style={styles.policyCopy}>
                <Text style={styles.policyName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.policyProvider}>{p.provider}</Text>
              </View>
              <View style={[styles.dueChip, { backgroundColor: p.dueBg }]}>
                <Text style={[styles.dueChipText, { color: p.dueFg }]}>{p.dueChip}</Text>
              </View>
            </View>
            <View style={styles.policyStats}>
              <View style={styles.policyStat}>
                <Text style={styles.policyStatLabel}>Sum assured</Text>
                <Text style={[styles.policyStatValue, moneyTextStyle]}>{p.cover}</Text>
              </View>
              <View style={styles.policyStat}>
                <Text style={styles.policyStatLabel}>Premium · {p.freq}</Text>
                <Text style={[styles.policyStatValue, moneyTextStyle]}>{p.premium}</Text>
              </View>
            </View>
            <View style={styles.policyFooter}>
              <Text style={styles.dueDate}>Due {p.dueDate}</Text>
              <Pressable style={styles.payBtn}>
                <Text style={styles.payBtnLabel}>Mark premium paid</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </DesignGrid>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  coverHero: {
    borderRadius: radius.cardLarge,
    paddingVertical: 22,
    paddingHorizontal: 24,
    flex: 1,
    minWidth: 0,
    shadowColor: 'rgba(25,22,55,.9)',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.35,
    shadowRadius: 44,
    elevation: 8,
  },
  coverEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: 'rgba(244,243,255,.5)',
  },
  coverValue: {
    fontSize: 32,
    color: '#F4F3FF',
    marginTop: 8,
    letterSpacing: -1.44,
  },
  coverNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: 'rgba(244,243,255,.62)',
    marginTop: 6,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  darkBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
  },
  darkBtnLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.surface,
  },
  policyCard: { gap: 14 },
  policyTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  policyTag: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTagText: { fontFamily: fontFamily.extrabold, fontSize: 10.5 },
  policyCopy: { flex: 1, minWidth: 0, gap: 2 },
  policyName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    letterSpacing: -0.28,
    color: colors.textPrimary,
  },
  policyProvider: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  dueChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 },
  dueChipText: { fontFamily: fontFamily.extrabold, fontSize: 11 },
  policyStats: { flexDirection: 'row', gap: 10 },
  policyStat: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  policyStatLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textCaption,
  },
  policyStatValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    letterSpacing: -0.48,
    color: colors.textPrimary,
    marginTop: 3,
  },
  policyFooter: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' },
  dueDate: { fontFamily: fontFamily.semibold, fontSize: 12, color: colors.textCaption },
  payBtn: {
    marginLeft: 'auto',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.surface,
  },
});

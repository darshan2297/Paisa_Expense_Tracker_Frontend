import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { compact, fmt } from '@/mock/format';
import { MOCK_GOALS } from '@/mock/seed/wealth';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatLongDate } from '@/utils/date';

const TODAY = '2026-08-02';
const MONTHLY_EXPENSE = 85749;

function ProgressRing({
  size,
  stroke,
  progress,
  color,
  children,
}: {
  size: number;
  stroke: number;
  progress: number;
  color: string;
  children: React.ReactNode;
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  const angle = (clamped / 100) * 360;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: colors.divider,
        }}
      />
      <View style={{ position: 'absolute', width: size, height: size }}>
        <View
          style={{
            position: 'absolute',
            left: size / 2,
            width: size / 2,
            height: size,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: -size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: color,
              transform: [{ rotate: `${Math.min(180, angle)}deg` }],
            }}
          />
        </View>
        {angle > 180 ? (
          <View
            style={{
              position: 'absolute',
              left: 0,
              width: size / 2,
              height: size,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 0,
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: stroke,
                borderColor: color,
                transform: [{ rotate: `${angle - 180}deg` }],
              }}
            />
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** Design HTML `isEmergency` — ring progress, month bars, KPI tiles. */
export default function EmergencyScreen() {
  const [month, setMonth] = useState(currentYearMonth());

  const data = useMemo(() => {
    const ef = MOCK_GOALS.find((g) => g.emergency) ?? MOCK_GOALS[0];
    const efPct = Math.min(100, (ef.saved / Math.max(1, ef.target)) * 100);
    const efRem = Math.max(0, ef.target - ef.saved);
    const efMonths = ef.saved / MONTHLY_EXPENSE;
    const efMonthsLeft = ef.monthly ? Math.ceil(efRem / ef.monthly) : null;
    const efEta = new Date(`${TODAY}T00:00:00`);
    if (efMonthsLeft) efEta.setMonth(efEta.getMonth() + efMonthsLeft);

    const status =
      efMonths >= 6
        ? { label: 'Fully covered', bg: colors.successTint, fg: colors.success }
        : efMonths >= 3
          ? { label: 'Partly covered', bg: '#FAEED8', fg: '#96702C' }
          : { label: 'Under-funded', bg: colors.dangerTint, fg: colors.dangerValue };

    const ringColor = efMonths >= 6 ? colors.success : efMonths >= 3 ? colors.warning : '#EF6B4E';

    return {
      ef,
      efPct,
      efRem,
      efMonths,
      efMonthsLeft,
      efEta,
      status,
      ringColor,
      bars: [1, 2, 3, 4, 5, 6].map((m) => ({
        label: `${m}m`,
        bg: efMonths >= m ? (efMonths >= 6 ? colors.success : colors.warning) : '#EDE8E1',
        fg: efMonths >= m ? colors.surface : colors.textCaption,
      })),
    };
  }, []);

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGridLead
        lead={
          <Card size="large" style={styles.ringCard}>
            <ProgressRing size={180} stroke={16} progress={data.efPct} color={data.ringColor}>
              <View style={styles.ringCenter}>
                <Text style={[styles.ringPct, moneyTextStyle]}>{Math.round(data.efPct)}%</Text>
                <Text style={styles.ringLabel}>funded</Text>
              </View>
            </ProgressRing>
            <View style={styles.ringCopy}>
              <View style={styles.titleRow}>
                <Text style={styles.efName}>{data.ef.name}</Text>
                <View style={[styles.statusChip, { backgroundColor: data.status.bg }]}>
                  <Text style={[styles.statusText, { color: data.status.fg }]}>
                    {data.status.label}
                  </Text>
                </View>
              </View>
              <View style={styles.savedRow}>
                <Text style={[styles.savedValue, moneyTextStyle]}>{compact(data.ef.saved)}</Text>
                <Text style={styles.savedOf}>of {compact(data.ef.target)}</Text>
              </View>
              <View style={styles.barRow}>
                {data.bars.map((b) => (
                  <View key={b.label} style={[styles.monthBar, { backgroundColor: b.bg }]}>
                    <Text style={[styles.monthBarLabel, { color: b.fg }]}>{b.label}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.addBtn}>
                <Text style={styles.addBtnLabel}>Add to emergency fund</Text>
              </Pressable>
            </View>
          </Card>
        }
        side={
          <DesignGrid cols={2} tabletCols={2} narrowCols={1}>
            <DesignKpiCard
              label="Months covered"
              value={data.efMonths.toFixed(1)}
              sub="target is 6 months"
            />
            <DesignKpiCard
              label="Monthly expenses"
              value={fmt(MONTHLY_EXPENSE)}
              sub="what one month costs you"
            />
            <DesignKpiCard
              label="Still needed"
              value={compact(data.efRem)}
              sub={`saving ${data.ef.monthly ? `${fmt(data.ef.monthly)}/mo` : 'not funded'}`}
              valueColor={colors.dangerValue}
            />
            <DesignKpiCard
              label="Fully funded by"
              value={data.efMonthsLeft ? formatLongDate(data.efEta) : 'Add a monthly amount'}
              backgroundColor="#F1EFFE"
              borderColor="#E4E1F6"
              labelColor="#7A73B8"
            />
          </DesignGrid>
        }
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  ringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
    flexWrap: 'wrap',
    paddingVertical: 26,
    paddingHorizontal: 28,
  },
  ringCenter: { alignItems: 'center', gap: 2 },
  ringPct: {
    fontFamily: fontFamily.extrabold,
    fontSize: 30,
    letterSpacing: -1.35,
    color: colors.textPrimary,
  },
  ringLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  ringCopy: { flex: 1, minWidth: 180, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  efName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 17,
    letterSpacing: -0.51,
    color: colors.textPrimary,
  },
  statusChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 },
  statusText: { fontFamily: fontFamily.extrabold, fontSize: 11 },
  savedRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  savedValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 30,
    letterSpacing: -1.35,
    color: colors.textPrimary,
  },
  savedOf: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textCaption,
  },
  barRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  monthBar: {
    height: 32,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBarLabel: { fontFamily: fontFamily.extrabold, fontSize: 12 },
  addBtn: {
    alignSelf: 'flex-start',
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(20,18,15,.85)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 6,
  },
  addBtnLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.surface,
  },
});

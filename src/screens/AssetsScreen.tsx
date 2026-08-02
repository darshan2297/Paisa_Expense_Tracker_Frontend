import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DesignGrid, DesignGridLead } from '@/components/design/DesignGrid';
import { DesignDarkHero, DesignKpiCard } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { compact, pctWidth } from '@/mock/format';
import { MOCK_ASSETS } from '@/mock/seed/wealth';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth, formatShortDate } from '@/utils/date';

const ASSET_LABELS: Record<string, string> = {
  HOUSE: 'House / Property',
  CAR: 'Car',
  BIKE: 'Bike',
  GOLD: 'Gold',
  JEWEL: 'Jewellery',
  TECH: 'Electronics',
  BANK: 'Bank account',
  CASH: 'Cash in hand',
};

const ALLOC_COLORS = ['#5B54D6', '#3E6E9E', '#A2701F', '#2F7D5D', '#2F7D6E', '#8A7F6E'];
const TODAY = '2026-08-02';

function monthsBetween(a: string, b: string): number {
  const d1 = new Date(`${a}T00:00:00`);
  const d2 = new Date(`${b}T00:00:00`);
  return Math.max(0, (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
}

/** Design HTML `isAssets` — total hero, allocation, asset rows. */
export default function AssetsScreen() {
  const [month, setMonth] = useState(currentYearMonth());

  const data = useMemo(() => {
    const assetsTotal = MOCK_ASSETS.reduce((a, x) => a + x.current, 0);
    const purchaseTotal = MOCK_ASSETS.reduce((a, x) => a + x.purchase, 0);
    const gain = assetsTotal - purchaseTotal;

    const cashTotal = MOCK_ASSETS.filter((a) => a.kind === 'CASH' || a.kind === 'BANK').reduce(
      (a, x) => a + x.current,
      0,
    );
    const portfolio = 1269900;

    const allocBase: [string, number][] = [
      [
        'Property',
        MOCK_ASSETS.filter((a) => a.kind === 'HOUSE').reduce((s, a) => s + a.current, 0),
      ],
      [
        'Vehicles',
        MOCK_ASSETS.filter((a) => a.kind === 'CAR' || a.kind === 'BIKE').reduce(
          (s, a) => s + a.current,
          0,
        ),
      ],
      [
        'Gold & jewellery',
        MOCK_ASSETS.filter((a) => a.kind === 'GOLD' || a.kind === 'JEWEL').reduce(
          (s, a) => s + a.current,
          0,
        ),
      ],
      ['Cash & bank', cashTotal],
      ['Investments', portfolio],
      [
        'Other',
        MOCK_ASSETS.filter((a) => a.kind === 'TECH' || a.kind === 'OTHER').reduce(
          (s, a) => s + a.current,
          0,
        ),
      ],
    ];
    const allocTotal = allocBase.reduce((a, [, v]) => a + v, 0) || 1;
    const alloc = allocBase
      .filter(([, v]) => v > 0)
      .map(([label, val], i) => ({
        label,
        amount: compact(val),
        pct: `${Math.round((val / allocTotal) * 100)}%`,
        width: pctWidth(val, allocTotal),
        color: ALLOC_COLORS[i % ALLOC_COLORS.length],
      }));

    const rows = [...MOCK_ASSETS]
      .sort((a, b) => b.current - a.current)
      .map((a) => {
        const g = a.current - a.purchase;
        const pctv = a.purchase ? (g / a.purchase) * 100 : 0;
        const yrs = Math.max(0.1, monthsBetween(a.date, TODAY) / 12);
        return {
          ...a,
          tag: ASSET_LABELS[a.kind] ?? a.kind,
          purchase: compact(a.purchase),
          current: compact(a.current),
          date: formatShortDate(a.date),
          gain: `${g >= 0 ? '+' : '−'}${compact(Math.abs(g))}`,
          gainColor: g >= 0 ? colors.successValue : colors.dangerValue,
          rate: `${g >= 0 ? '▲ ' : '▼ '}${Math.abs(pctv / yrs).toFixed(1)}% / yr`,
          share: `${Math.round((a.current / Math.max(1, assetsTotal)) * 100)}%`,
          width: pctWidth(a.current, assetsTotal),
        };
      });

    return {
      assetsTotal,
      gain,
      alloc,
      rows,
    };
  }, []);

  const gainPositive = data.gain >= 0;

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGridLead
        lead={
          <DesignDarkHero
            eyebrow="Total asset value"
            value={compact(data.assetsTotal)}
            note={`${gainPositive ? '+' : '−'}${compact(Math.abs(data.gain))} vs purchase value`}
          />
        }
        side={
          <Card size="large" style={styles.allocCard}>
            <Text style={styles.allocTitle}>Asset allocation</Text>
            <View style={styles.allocStack}>
              {data.alloc.map((a) => (
                <View key={a.label} style={styles.allocRow}>
                  <View style={[styles.allocDot, { backgroundColor: a.color }]} />
                  <Text style={styles.allocLabel}>{a.label}</Text>
                  <Text style={[styles.allocAmount, moneyTextStyle]}>{a.amount}</Text>
                  <Text style={styles.allocPct}>{a.pct}</Text>
                </View>
              ))}
            </View>
            <View style={styles.allocBarTrack}>
              {data.alloc.map((a) => (
                <View
                  key={`${a.label}-bar`}
                  style={[
                    styles.allocBarSeg,
                    { width: a.width as `${number}%`, backgroundColor: a.color },
                  ]}
                />
              ))}
            </View>
          </Card>
        }
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Everything you own</Text>
        <Pressable style={styles.darkBtn}>
          <Feather name="plus" size={14} color={colors.surface} />
          <Text style={styles.darkBtnLabel}>Add asset</Text>
        </Pressable>
      </View>

      <Card size="large" style={styles.listCard}>
        {data.rows.map((a) => (
          <View key={a.id} style={styles.assetRow}>
            <View style={[styles.assetIcon, { backgroundColor: a.bg }]}>
              <Feather name="home" size={17} color={a.fg} />
            </View>
            <View style={styles.assetCopy}>
              <Text style={styles.assetName}>{a.name}</Text>
              <Text style={styles.assetSub}>
                {a.tag} · {a.date}
              </Text>
            </View>
            <View style={styles.assetBarCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: a.width as `${number}%`, backgroundColor: a.fg },
                  ]}
                />
              </View>
              <Text style={styles.assetShare}>
                {a.share} of assets · bought at {a.purchase}
              </Text>
            </View>
            <View style={styles.assetAmounts}>
              <Text style={[styles.assetCurrent, moneyTextStyle]}>{a.current}</Text>
              <Text style={[styles.assetGain, { color: a.gainColor }]}>
                {a.gain} · {a.rate}
              </Text>
            </View>
            <Pressable hitSlop={8} style={styles.deleteBtn}>
              <Feather name="trash-2" size={15} color="#C0B9AF" />
            </Pressable>
          </View>
        ))}
      </Card>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  allocCard: { gap: 16 },
  allocTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  allocStack: { gap: 9 },
  allocRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  allocDot: { width: 9, height: 9, borderRadius: 3 },
  allocLabel: { flex: 1, fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.textPrimary },
  allocAmount: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.textPrimary },
  allocPct: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.textCaption,
    width: 36,
    textAlign: 'right',
  },
  allocBarTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: colors.divider,
  },
  allocBarSeg: { height: '100%' },
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
  listCard: { padding: 0, overflow: 'hidden' },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EC',
    flexWrap: 'wrap',
  },
  assetIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetCopy: { width: 190, minWidth: 120, gap: 3 },
  assetName: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  assetSub: { fontFamily: fontFamily.medium, fontSize: 11.5, color: colors.textCaption },
  assetBarCol: { flex: 1, minWidth: 120, gap: 5 },
  barTrack: {
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 99 },
  assetShare: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.textCaption },
  assetAmounts: { width: 120, alignItems: 'flex-end' },
  assetCurrent: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14.5,
    letterSpacing: -0.36,
    color: colors.textPrimary,
  },
  assetGain: { fontFamily: fontFamily.bold, fontSize: 11.5, marginTop: 2 },
  deleteBtn: { padding: 4 },
});

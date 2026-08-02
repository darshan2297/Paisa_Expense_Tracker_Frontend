import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components/Card';
import { HeroCard } from '@/components/HeroCard';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';

/** Dark hero KPI — design HTML net-balance / total-upcoming cards. */
export function DesignDarkHero({
  eyebrow,
  value,
  note,
  noteColor,
  style,
}: {
  eyebrow: string;
  value: string;
  note?: string;
  noteColor?: string;
  style?: ViewStyle;
}) {
  return (
    <HeroCard style={[styles.darkHero, style]}>
      <Text style={styles.darkEyebrow}>{eyebrow}</Text>
      <Text style={[styles.darkValue, moneyTextStyle]}>{value}</Text>
      {note ? (
        <Text style={[styles.darkNote, noteColor ? { color: noteColor } : null]}>{note}</Text>
      ) : null}
    </HeroCard>
  );
}

/** Income/spent style stat tile from overview grid. */
export function DesignIconStat({
  label,
  value,
  note,
  valueColor,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  note?: string;
  valueColor?: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card size="large" style={styles.iconStat}>
      <View style={styles.iconStatHeader}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={15} color={iconColor} />
        </View>
        <Text style={styles.iconStatLabel}>{label}</Text>
      </View>
      <Text
        style={[styles.iconStatValue, moneyTextStyle, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
      {note ? <Text style={styles.iconStatNote}>{note}</Text> : null}
    </Card>
  );
}

/** Simple label/value KPI card. */
export function DesignKpiCard({
  label,
  value,
  sub,
  valueColor,
  backgroundColor,
  borderColor,
  labelColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
}) {
  return (
    <Card
      style={[
        styles.kpi,
        backgroundColor ? { backgroundColor } : null,
        borderColor ? { borderColor } : null,
      ]}
    >
      <Text style={[styles.kpiLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
      <Text style={[styles.kpiValue, moneyTextStyle, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </Card>
  );
}

/** Section title row with optional CTA — matches design h2 + button rows. */
export function DesignSectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  darkAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  darkAction?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Text
          onPress={onAction}
          style={[styles.sectionAction, darkAction && styles.sectionActionDark]}
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  darkHero: {
    paddingVertical: 24,
    paddingHorizontal: 26,
    flex: 1,
    minWidth: 0,
  },
  darkEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: colors.heroTextEyebrow,
  },
  darkValue: {
    fontSize: 38,
    color: colors.heroText,
    marginTop: 8,
    letterSpacing: -1.71,
  },
  darkNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.heroTextMuted,
    marginTop: 6,
  },
  iconStat: {
    paddingVertical: 22,
    paddingHorizontal: 24,
    flex: 1,
    minWidth: 0,
  },
  iconStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStatLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textLabel,
  },
  iconStatValue: {
    fontSize: 26,
    marginTop: 14,
    letterSpacing: -1.04,
  },
  iconStatNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textCaption,
    marginTop: 4,
  },
  kpi: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  kpiLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: colors.textLabel,
  },
  kpiValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    letterSpacing: -0.88,
    color: colors.textPrimary,
  },
  kpiSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  sectionTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  sectionSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
  },
  sectionAction: {
    marginLeft: 'auto',
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: '#453F37',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
  },
  sectionActionDark: {
    color: colors.heroText,
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
});

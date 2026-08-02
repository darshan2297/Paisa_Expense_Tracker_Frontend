import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';

type BudgetAlertBannerProps = {
  title: string;
  body: string;
  onAdjust?: () => void;
  onDismiss?: () => void;
};

export function BudgetAlertBanner({ title, body, onAdjust, onDismiss }: BudgetAlertBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <Feather name="alert-triangle" size={17} color={colors.dangerValue} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onAdjust}
          style={({ pressed }) => [styles.adjust, pressed && styles.adjustPressed]}
        >
          <Text style={styles.adjustLabel}>Adjust budget</Text>
        </Pressable>
        <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismiss}>
          <Text style={styles.dismissLabel}>×</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: colors.dangerTint,
    borderWidth: 1,
    borderColor: colors.dangerTintBorder,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.tileSmall - 2,
    backgroundColor: '#F4DCD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 200,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: colors.dangerValue,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  adjust: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(20,18,15,.1)',
    backgroundColor: 'rgba(255,255,255,.7)',
    justifyContent: 'center',
  },
  adjustPressed: {
    backgroundColor: colors.surface,
  },
  adjustLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: '#453F37',
  },
  dismiss: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.textLabel,
    lineHeight: 18,
  },
});

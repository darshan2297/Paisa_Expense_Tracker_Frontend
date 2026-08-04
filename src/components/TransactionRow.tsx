import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '@/features/transactions/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { formatINR } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

export type TransactionRowProps = {
  transaction: Transaction;
  /** Omit to hide the delete affordance (used for the Overview "Recent" card). */
  onDelete?: () => void;
  /**
   * The mockup uses two distinct row sizes for this exact layout: the
   * Overview "Recent" card's row (34px/12px chip, 13px title) vs. the
   * Transactions list's row (38px/13px chip, 13.5px title). Defaults to
   * "sm" (Recent's size).
   */
  size?: 'sm' | 'md';
};

/**
 * A single ledger row: category-colored initial chip, title/sub, signed
 * amount - shared between the Overview "Recent" card and the Transactions
 * list, pixel-matched to the mockup's two row-size variants.
 */
export function TransactionRow({ transaction, onDelete, size = 'sm' }: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const title = transaction.note?.trim() || transaction.category.name;
  const sub = transaction.note?.trim()
    ? `${transaction.category.name} · ${formatShortDate(`${transaction.date}T00:00:00`)}`
    : formatShortDate(`${transaction.date}T00:00:00`);
  const dims = size === 'md' ? mdDims : smDims;

  return (
    <View style={[styles.row, dims.row]}>
      <View
        style={[
          styles.chip,
          { width: dims.chip, height: dims.chip, borderRadius: dims.chipRadius },
          { backgroundColor: `${transaction.category.color}26` },
        ]}
      >
        <Text
          style={[styles.chipText, { fontSize: dims.chipFont, color: transaction.category.color }]}
        >
          {title.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.textGroup}>
        <Text style={[styles.title, { fontSize: dims.titleFont }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      {transaction.has_receipt ? (
        <Feather
          name="paperclip"
          size={13}
          color={colors.textCaption}
          accessibilityLabel="Has receipt"
        />
      ) : null}
      <Text
        style={[
          styles.amount,
          moneyTextStyle,
          { fontSize: dims.amountFont },
          isIncome ? styles.amountIncome : styles.amountExpense,
        ]}
      >
        {isIncome ? '+' : '−'}
        {formatINR(Math.abs(Number(transaction.amount)))}
      </Text>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityLabel="Delete transaction"
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={15} color={colors.textCaption} />
        </Pressable>
      ) : null}
    </View>
  );
}

const smDims = {
  row: { paddingVertical: 11 },
  chip: 34,
  chipRadius: 12,
  chipFont: 12,
  titleFont: 13,
  amountFont: 13.5,
};
const mdDims = {
  row: { paddingVertical: 13 },
  chip: 38,
  chipRadius: 13,
  chipFont: 13,
  titleFont: 13.5,
  amountFont: 14.5,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: fontFamily.extrabold,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.textCaption,
  },
  amount: {
    letterSpacing: -0.4,
  },
  amountIncome: {
    color: colors.successValue,
  },
  amountExpense: {
    color: colors.dangerValue,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});

export default TransactionRow;

import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { Sheet } from '@/components/Sheet';
import { TransactionRow } from '@/components/TransactionRow';
import { useCategories } from '@/features/categories/hooks';
import type { Category } from '@/features/categories/types';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
} from '@/features/transactions/hooks';
import type { Transaction, TransactionType } from '@/features/transactions/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';
import { formatINR } from '@/utils/currency';
import { currentYearMonth } from '@/utils/date';

type Filter = 'all' | TransactionType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
];

type TransactionGroup = {
  date: string;
  items: Transaction[];
  total: number;
};

/** The list is already sorted by date desc server-side, so a simple
 * run-length grouping (rather than a full `groupBy` + re-sort) is enough.
 */
function groupByDate(items: Transaction[]): TransactionGroup[] {
  const groups: TransactionGroup[] = [];
  for (const item of items) {
    const signedAmount = (item.type === 'income' ? 1 : -1) * Number(item.amount);
    const last = groups[groups.length - 1];
    if (last && last.date === item.date) {
      last.items.push(item);
      last.total += signedAmount;
    } else {
      groups.push({ date: item.date, items: [item], total: signedAmount });
    }
  }
  return groups;
}

function dateLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** The mockup's `isTx` screen, reinterpreted for mobile: a single scrolling
 * column (filters -> search -> grouped list) instead of the desktop's
 * side-by-side filter/search/stat-tiles row. Sizes/colors/radii below are
 * pixel-matched to the mockup's `isTx` section and its persistent header
 * ("Add transaction" button).
 */
export default function TransactionsScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const transactions = useTransactions({
    month,
    type: filter === 'all' ? undefined : filter,
    q: query.trim() || undefined,
    size: 100,
  });
  const deleteTransaction = useDeleteTransaction();

  const groups = useMemo(() => groupByDate(transactions.data?.data ?? []), [transactions.data]);
  const shownCount = transactions.data?.total ?? 0;
  const shownNet = useMemo(
    () =>
      (transactions.data?.data ?? []).reduce(
        (sum, t) => sum + (t.type === 'income' ? 1 : -1) * Number(t.amount),
        0,
      ),
    [transactions.data],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <MonthSwitcher month={month} onChange={setMonth} />
        <Pressable
          onPress={() => setAddOpen(true)}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        >
          <Feather name="plus" size={15} color={colors.surface} />
          <Text style={styles.addButtonLabel}>Add transaction</Text>
        </Pressable>
      </View>

      <View style={styles.toolRow}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipLabel, active && styles.filterChipLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchRow}>
          <Feather name="search" size={15} color={colors.textCaption} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.textCaption}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statBlockLabel}>Shown</Text>
            <Text style={styles.statBlockValue}>{shownCount}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statBlockLabel}>Net</Text>
            <Text style={styles.statBlockValue}>{formatINR(shownNet)}</Text>
          </View>
        </View>
      </View>

      {transactions.isLoading ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(group) => group.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Nothing here yet</Text>
              <Text style={styles.emptyStateSub}>Add a transaction or change the month.</Text>
            </View>
          }
          renderItem={({ item: group }) => (
            <View>
              <View style={styles.groupHeader}>
                <Text style={styles.groupLabel}>{dateLabel(group.date)}</Text>
                <Text style={styles.groupTotal}>{formatINR(group.total)}</Text>
              </View>
              {group.items.map((transaction) => (
                <View style={styles.row} key={transaction.id}>
                  <TransactionRow
                    transaction={transaction}
                    onDelete={() => deleteTransaction.mutate(transaction.id)}
                    size="md"
                  />
                </View>
              ))}
            </View>
          )}
        />
      )}

      <AddTransactionSheet visible={addOpen} month={month} onClose={() => setAddOpen(false)} />
    </View>
  );
}

type AddTransactionSheetProps = {
  visible: boolean;
  month: string;
  onClose: () => void;
};

function AddTransactionSheet({ visible, month, onClose }: AddTransactionSheetProps) {
  const categories = useCategories();
  const createTransaction = useCreateTransaction();
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const options = (categories.data ?? []).filter((c) => c.kind === type);

  function reset() {
    setType('expense');
    setCategory(null);
    setAmount('');
    setNote('');
    setError('');
  }

  function submit() {
    const numericAmount = Number(amount);
    if (!category) {
      setError('Choose a category.');
      return;
    }
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    // No date picker in this slice (no date-picker dependency installed
    // yet) - default to today for the current month, or the 1st for a
    // past/future month being viewed.
    const date =
      month === currentYearMonth() ? new Date().toISOString().slice(0, 10) : `${month}-01`;

    createTransaction.mutate(
      { type, category_id: category.id, amount, date, note: note.trim() || null },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: () => setError('Could not save that transaction. Try again.'),
      },
    );
  }

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <Text style={styles.sheetTitle}>Add transaction</Text>

      <View style={styles.typeToggle}>
        {(['expense', 'income'] as const).map((t) => {
          const active = t === type;
          return (
            <Pressable
              key={t}
              onPress={() => {
                setType(t);
                setCategory(null);
              }}
              style={[styles.typeButton, active && styles.typeButtonActive]}
            >
              <Text style={[styles.typeButtonLabel, active && styles.typeButtonLabelActive]}>
                {t === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.amountField}>
        <Text style={styles.amountSymbol}>₹</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={colors.textCaption}
          keyboardType="numeric"
          style={styles.amountInput}
        />
      </View>

      <CategoryPicker
        categories={options}
        selectedId={category?.id ?? null}
        onSelect={setCategory}
      />

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Note (optional)"
        placeholderTextColor={colors.textCaption}
        style={styles.noteInput}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button label="Save transaction" onPress={submit} loading={createTransaction.isPending} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  addButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: radius.chip,
    backgroundColor: colors.textPrimary,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  addButtonPressed: {
    backgroundColor: '#2C2822',
  },
  addButtonLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.surface,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.chip,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterChipActive: {
    backgroundColor: colors.textPrimary,
  },
  filterChipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  filterChipLabelActive: {
    color: colors.surface,
  },
  searchRow: {
    flex: 1,
    minWidth: 180,
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 42,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.chip,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  statsRow: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 20,
  },
  statBlock: {
    alignItems: 'flex-end',
  },
  statBlockLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textCaption,
  },
  statBlockValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 2,
  },
  loading: {
    marginTop: spacing.xxl,
  },
  listContent: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexGrow: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 20,
    backgroundColor: '#F8F5F1',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  groupLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: '#948E85',
  },
  groupTotal: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#948E85',
  },
  row: {
    paddingHorizontal: 20,
  },
  emptyState: {
    paddingVertical: 56,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  emptyStateSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
  },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  typeButtonActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  typeButtonLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  typeButtonLabelActive: {
    color: colors.surface,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 56,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
  },
  amountSymbol: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: '#B7B0A6',
  },
  amountInput: {
    flex: 1,
    fontFamily: fontFamily.extrabold,
    fontSize: 25,
    color: colors.textPrimary,
  },
  noteInput: {
    height: 46,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSubtle,
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
  },
});

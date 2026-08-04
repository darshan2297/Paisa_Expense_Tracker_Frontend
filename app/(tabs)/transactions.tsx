import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { DateField } from '@/components/DateField';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
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
import {
  pickReceiptFromCamera,
  pickReceiptFromLibrary,
  type PickedReceipt,
} from '@/utils/receiptPicker';

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
  const { openAdd } = useLocalSearchParams<{ openAdd?: string }>();
  const [month, setMonth] = useState(currentYearMonth());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  // Open the Add Transaction sheet in response to a `?openAdd=1` navigation
  // param (e.g. a deep link or the Overview screen's quick-add button).
  // Adjusting state during render, guarded by comparing against the previous
  // param value, reacts to every param change (even without a remount) while
  // avoiding an effect - see React's "Adjusting state when a prop changes".
  const [prevOpenAdd, setPrevOpenAdd] = useState(openAdd);
  if (openAdd !== prevOpenAdd) {
    setPrevOpenAdd(openAdd);
    if (openAdd === '1') setAddOpen(true);
  }

  const transactions = useTransactions({
    month,
    type: filter === 'all' ? undefined : filter,
    q: query.trim() || undefined,
    size: 100,
  });
  const deleteTransaction = useDeleteTransaction();

  function confirmDeleteTransaction(transactionId: string) {
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTransaction.mutate(transactionId),
      },
    ]);
  }

  const groups = useMemo(() => groupByDate(transactions.data?.data ?? []), [transactions.data]);
  // Count of rows actually rendered, not the API's `total` (server-side
  // filter/pagination count) - those diverge the moment a month's filtered
  // transactions exceed the `size: 100` fetch cap below.
  const shownCount = transactions.data?.data.length ?? 0;
  const shownNet = useMemo(
    () =>
      (transactions.data?.data ?? []).reduce(
        (sum, t) => sum + (t.type === 'income' ? 1 : -1) * Number(t.amount),
        0,
      ),
    [transactions.data],
  );

  return (
    <>
      <ScreenScaffold
        month={month}
        onMonthChange={setMonth}
        onAddTransaction={() => setAddOpen(true)}
      >
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
        ) : groups.length === 0 ? (
          <View style={[styles.listContent, styles.emptyState]}>
            <Text style={styles.emptyStateTitle}>Nothing here yet</Text>
            <Text style={styles.emptyStateSub}>Add a transaction or change the month.</Text>
          </View>
        ) : (
          <View style={styles.listContent}>
            {groups.map((group) => (
              <View key={group.date}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupLabel}>{dateLabel(group.date)}</Text>
                  <Text style={styles.groupTotal}>{formatINR(group.total)}</Text>
                </View>
                {group.items.map((transaction) => (
                  <View style={styles.row} key={transaction.id}>
                    <TransactionRow
                      transaction={transaction}
                      onDelete={() => confirmDeleteTransaction(transaction.id)}
                      size="md"
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScreenScaffold>

      <AddTransactionSheet visible={addOpen} month={month} onClose={() => setAddOpen(false)} />
    </>
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
  const [date, setDate] = useState(() =>
    month === currentYearMonth() ? new Date().toISOString().slice(0, 10) : `${month}-01`,
  );
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState<PickedReceipt | null>(null);
  const [error, setError] = useState('');

  const options = (categories.data ?? []).filter((c) => c.kind === type);
  const resolvedCategory = category ?? options[0] ?? null;

  const pickCategory = (nextType: TransactionType, prev: Category | null) => {
    const opts = (categories.data ?? []).filter((c) => c.kind === nextType);
    if (opts.length === 0) return null;
    if (prev && opts.some((c) => c.id === prev.id)) return prev;
    return opts[0];
  };

  function reset() {
    setType('expense');
    setCategory(null);
    setAmount('');
    setNote('');
    setReceipt(null);
    setError('');
    setDate(month === currentYearMonth() ? new Date().toISOString().slice(0, 10) : `${month}-01`);
  }

  function close() {
    reset();
    onClose();
  }

  async function attachFromCamera() {
    const picked = await pickReceiptFromCamera();
    if (picked) setReceipt(picked);
  }

  async function attachFromGallery() {
    const picked = await pickReceiptFromLibrary();
    if (picked) setReceipt(picked);
  }

  function submit() {
    const numericAmount = Number(amount);
    if (!resolvedCategory) {
      setError('Choose a category.');
      return;
    }
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!date.trim()) {
      setError('Choose a date.');
      return;
    }

    createTransaction.mutate(
      {
        payload: {
          type,
          category_id: resolvedCategory.id,
          amount,
          date: date.trim(),
          note: note.trim() || null,
        },
        receipt,
      },
      {
        onSuccess: (result) => {
          reset();
          onClose();
          if (result.receiptUploadFailed) {
            Alert.alert(
              'Receipt not saved',
              'Transaction was saved, but the receipt could not be uploaded.',
            );
          }
        },
        onError: () => setError('Could not save that transaction. Try again.'),
      },
    );
  }

  return (
    <Sheet visible={visible} onClose={close} variant="center">
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Add transaction</Text>
        <Pressable onPress={close} style={styles.closeBtn} accessibilityLabel="Close">
          <Text style={styles.closeBtnText}>×</Text>
        </Pressable>
      </View>

      <View style={styles.typeToggle}>
        {(['expense', 'income'] as const).map((t) => {
          const active = t === type;
          return (
            <Pressable
              key={t}
              onPress={() => {
                setType(t);
                setCategory((prev) => pickCategory(t, prev));
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

      <View style={styles.formFields}>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Amount</Text>
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
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Category</Text>
          <CategoryPicker
            categories={options}
            selectedId={resolvedCategory?.id ?? null}
            onSelect={setCategory}
            variant="solid"
          />
        </View>

        <View style={styles.dateNoteRow}>
          <View style={[styles.fieldBlock, styles.dateNoteCol]}>
            <Text style={styles.fieldLabel}>Date</Text>
            <DateField value={date} onChange={setDate} />
          </View>
          <View style={[styles.fieldBlock, styles.dateNoteCol]}>
            <Text style={styles.fieldLabel}>Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional"
              placeholderTextColor={colors.textCaption}
              style={styles.noteInput}
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Receipt / slip</Text>
          {receipt ? (
            <View style={styles.receiptPreviewRow}>
              <Image source={{ uri: receipt.uri }} style={styles.receiptThumb} contentFit="cover" />
              <View style={styles.receiptMeta}>
                <Text style={styles.receiptName} numberOfLines={1}>
                  {receipt.name}
                </Text>
                <Pressable onPress={() => setReceipt(null)} hitSlop={8}>
                  <Text style={styles.receiptRemove}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.receiptActions}>
              <Pressable
                onPress={() => void attachFromCamera()}
                style={styles.receiptActionBtn}
                accessibilityLabel="Take receipt photo"
              >
                <Feather name="camera" size={15} color={colors.textPrimary} />
                <Text style={styles.receiptActionLabel}>Camera</Text>
              </Pressable>
              <Pressable
                onPress={() => void attachFromGallery()}
                style={styles.receiptActionBtn}
                accessibilityLabel="Upload receipt from gallery"
              >
                <Feather name="image" size={15} color={colors.textPrimary} />
                <Text style={styles.receiptActionLabel}>Upload</Text>
              </Pressable>
            </View>
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          label="Save transaction"
          onPress={submit}
          loading={createTransaction.isPending}
          size="lg"
          style={styles.saveBtn}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: radius.filterChip,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.textPrimary,
  },
  filterChipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.textSoft,
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
    color: colors.textEmpty,
  },
  emptyStateSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.textCaption,
    marginTop: 5,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    letterSpacing: -0.63,
    color: colors.textPrimary,
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: radius.filterChip,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 17,
    lineHeight: 17,
    color: colors.textMuted,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    backgroundColor: colors.divider,
    borderRadius: radius.chip,
    marginBottom: 18,
  },
  typeButton: {
    flex: 1,
    minWidth: 96,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#14120F',
    shadowOpacity: 0.14,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  typeButtonLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textLabel,
  },
  typeButtonLabelActive: {
    color: colors.textPrimary,
  },
  formFields: {
    gap: 15,
  },
  fieldBlock: {
    gap: 7,
  },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textLabel,
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
    fontSize: 24,
    letterSpacing: -0.84,
    color: colors.textPrimary,
  },
  dateNoteRow: {
    flexDirection: 'row',
    gap: 11,
  },
  dateNoteCol: {
    flex: 1,
    minWidth: 0,
  },
  dateInput: {
    height: 46,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSubtle,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
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
  receiptActions: {
    flexDirection: 'row',
    gap: 10,
  },
  receiptActionBtn: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSubtle,
  },
  receiptActionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  receiptPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSubtle,
  },
  receiptThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.divider,
  },
  receiptMeta: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  receiptName: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  receiptRemove: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.dangerValue,
  },
  errorText: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.dangerValue,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.dangerTint,
    overflow: 'hidden',
  },
  saveBtn: {
    marginTop: 2,
    width: '100%',
  },
});

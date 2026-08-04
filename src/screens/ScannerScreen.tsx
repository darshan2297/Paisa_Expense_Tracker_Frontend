import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { useCategories } from '@/features/categories/hooks';
import { useConfirmScan, useScanReceipt } from '@/features/scanner/hooks';
import type { ScanLineItem } from '@/features/scanner/types';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { formatINR } from '@/utils/currency';
import { currentYearMonth } from '@/utils/date';
import { fileToFormData, pickFile } from '@/utils/filePicker';

const FIELD_DEFS = [
  { key: 'merchant' as const, label: 'Merchant', placeholder: 'e.g. Cafe Coffee Day' },
  { key: 'date' as const, label: 'Date', placeholder: 'YYYY-MM-DD' },
  { key: 'amount' as const, label: 'Amount', placeholder: '0' },
  { key: 'gst' as const, label: 'GST (18%)', placeholder: '0' },
  { key: 'method' as const, label: 'Payment method', placeholder: 'e.g. UPI / Card' },
  { key: 'note' as const, label: 'Notes', placeholder: 'Optional' },
];

type ScanFields = {
  merchant: string;
  date: string;
  amount: string;
  gst: string;
  method: string;
  note: string;
};

function emptyFields(): ScanFields {
  return {
    merchant: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    gst: '',
    method: '',
    note: '',
  };
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[,₹\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Design HTML `isScanner` — receipt OCR preview and confirm. */
export default function ScannerScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [loaded, setLoaded] = useState(false);
  const [fields, setFields] = useState<ScanFields>(emptyFields);
  const [lineItems, setLineItems] = useState<ScanLineItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const categories = useCategories();
  const scanReceipt = useScanReceipt();
  const confirmScan = useConfirmScan();

  const expenseCategories = (categories.data ?? []).filter((c) => c.kind === 'expense');
  const confirmAmount = formatINR(parseAmount(fields.amount));

  const updateField = (key: keyof ScanFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const resetScan = () => {
    setLoaded(false);
    setLineItems([]);
    setSelectedCategoryId(null);
    setScanError(null);
    setFields(emptyFields());
  };

  const handleScan = async () => {
    setScanError(null);
    if (Platform.OS !== 'web') {
      Alert.alert('Not supported', 'Receipt upload is available on web only for now.');
      return;
    }

    const file = await pickFile('.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf');
    if (!file) return;

    try {
      const result = await scanReceipt.mutateAsync(fileToFormData(file));
      setFields({
        merchant: result.merchant,
        date: result.date,
        amount: String(result.amount).replace(/,/g, ''),
        gst: result.gst ?? '',
        method: result.payment_method ?? '',
        note: result.note ?? '',
      });
      setLineItems(result.line_items);
      setSelectedCategoryId(result.suggested_category_id);
      setLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not scan this receipt.';
      setScanError(message);
      Alert.alert('Scan failed', message);
    }
  };

  const handleConfirm = () => {
    const categoryId = selectedCategoryId ?? expenseCategories[0]?.id;
    if (!categoryId || parseAmount(fields.amount) <= 0) return;

    confirmScan.mutate(
      {
        merchant: fields.merchant.trim(),
        date: fields.date.trim(),
        amount: String(parseAmount(fields.amount)),
        category_id: categoryId,
        note: fields.note.trim() || null,
      },
      { onSuccess: resetScan },
    );
  };

  return (
    <ScreenScaffold month={month} onMonthChange={setMonth}>
      <DesignGrid cols={2} tabletCols={1} narrowCols={1}>
        <Card size="large" style={styles.panel}>
          <DesignSectionHeader title="Receipt" />
          {loaded ? (
            <>
              <View style={styles.receipt}>
                <View style={styles.receiptHeader}>
                  <Text style={styles.receiptStore}>{fields.merchant.toUpperCase()}</Text>
                  <Text style={styles.receiptMeta}>Scanned receipt preview</Text>
                </View>
                <View style={styles.receiptItems}>
                  {(lineItems.length > 0
                    ? lineItems
                    : [{ left: fields.note || 'Receipt total', right: fields.amount }]
                  ).map((line) => (
                    <View key={`${line.left}-${line.right}`} style={styles.receiptLine}>
                      <Text style={styles.receiptItem}>{line.left}</Text>
                      <Text style={styles.receiptItem}>{line.right}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.receiptTotals}>
                  {fields.gst ? (
                    <View style={styles.receiptLine}>
                      <Text style={styles.receiptMuted}>GST</Text>
                      <Text style={styles.receiptMuted}>{fields.gst}</Text>
                    </View>
                  ) : null}
                  <View style={[styles.receiptLine, styles.receiptTotalRow]}>
                    <Text style={styles.receiptTotalLabel}>TOTAL</Text>
                    <Text style={styles.receiptTotalLabel}>{confirmAmount}</Text>
                  </View>
                </View>
                {fields.method ? (
                  <Text style={styles.receiptFooter}>{fields.method} · Approved</Text>
                ) : null}
              </View>
              <Pressable onPress={handleScan} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Upload a different file</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={handleScan}
              disabled={scanReceipt.isPending}
              style={styles.dropZone}
            >
              {scanReceipt.isPending ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <>
                  <View style={styles.dropIcon}>
                    <Feather name="upload" size={26} color={colors.accent} />
                  </View>
                  <Text style={styles.dropTitle}>Drop a receipt here</Text>
                  <Text style={styles.dropSub}>JPG, PNG or PDF · up to 10 MB</Text>
                  <View style={styles.browseBtn}>
                    <Text style={styles.browseText}>Browse files</Text>
                  </View>
                  {scanError ? <Text style={styles.errorText}>{scanError}</Text> : null}
                </>
              )}
            </Pressable>
          )}
        </Card>

        <Card size="large" style={styles.panel}>
          <DesignSectionHeader
            title="Extracted details"
            subtitle="Check each field before saving — you can edit anything."
          />
          {FIELD_DEFS.map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              {f.key === 'date' ? (
                <DateField value={fields.date} onChange={(v) => updateField('date', v)} />
              ) : (
                <TextInput
                  value={fields[f.key]}
                  onChangeText={(v) => updateField(f.key, v)}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textCaption}
                  style={styles.fieldInput}
                  {...(f.key === 'amount' || f.key === 'gst'
                    ? { keyboardType: 'decimal-pad' as const, inputMode: 'decimal' as const }
                    : null)}
                />
              )}
            </View>
          ))}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catRow}>
              {expenseCategories.map((c) => {
                const selected = c.id === selectedCategoryId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCategoryId(c.id)}
                    style={[styles.catChip, selected && styles.catChipSelected]}
                  >
                    <Text style={[styles.catChipText, selected && styles.catChipTextSelected]}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.confirmBanner}>
            <Text style={styles.confirmCopy}>This will be added as an expense of</Text>
            <Text style={[styles.confirmAmount, moneyTextStyle]}>{confirmAmount}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={resetScan}
              disabled={confirmScan.isPending}
              style={[styles.actionBtn, styles.discardBtn]}
            >
              <Text style={styles.discardText}>Discard</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={confirmScan.isPending || !selectedCategoryId || !loaded}
              style={[styles.actionBtn, styles.saveBtn]}
            >
              {confirmScan.isPending ? (
                <ActivityIndicator color={colors.heroText} />
              ) : (
                <Text style={styles.saveText}>Confirm & add transaction</Text>
              )}
            </Pressable>
          </View>
        </Card>
      </DesignGrid>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 22, gap: 16 },
  dropZone: {
    minHeight: 380,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DDD7CE',
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  dropIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    letterSpacing: -0.38,
    color: colors.textPrimary,
  },
  dropSub: { fontFamily: fontFamily.medium, fontSize: 12.5, color: colors.textCaption },
  browseBtn: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
  },
  browseText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.heroText },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.dangerValue,
    textAlign: 'center',
    marginTop: 4,
  },
  receipt: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceSubtle,
    padding: 26,
    fontFamily: 'monospace',
  },
  receiptHeader: {
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: '#DDD7CE',
  },
  receiptStore: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    letterSpacing: 1.6,
    color: colors.textPrimary,
  },
  receiptMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textCaption,
    marginTop: 4,
  },
  receiptItems: {
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: '#DDD7CE',
  },
  receiptLine: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptItem: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textPrimary },
  receiptTotals: { gap: 7, paddingVertical: 14 },
  receiptMuted: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textCaption },
  receiptTotalRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: '#DDD7CE' },
  receiptTotalLabel: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.textPrimary },
  receiptFooter: {
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textCaption,
    paddingTop: 10,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#DDD7CE',
  },
  secondaryBtn: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: '#453F37' },
  field: { gap: 7 },
  fieldLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textLabel },
  fieldInput: {
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
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  catChip: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
  },
  catChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  catChipText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.textMuted },
  catChipTextSelected: { color: colors.accent },
  confirmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#F1EFFE',
    borderWidth: 1,
    borderColor: '#E4E1F6',
  },
  confirmCopy: { flex: 1, fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.accent },
  confirmAmount: { fontFamily: fontFamily.extrabold, fontSize: 20, letterSpacing: -0.8 },
  actions: { flexDirection: 'row', gap: 9 },
  actionBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  discardBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  discardText: { fontFamily: fontFamily.bold, fontSize: 13.5, color: '#453F37' },
  saveBtn: { flex: 2, backgroundColor: colors.textPrimary },
  saveText: { fontFamily: fontFamily.extrabold, fontSize: 13.5, color: colors.heroText },
});

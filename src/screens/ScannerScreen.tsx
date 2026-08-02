import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DesignGrid } from '@/components/design/DesignGrid';
import { DesignSectionHeader } from '@/components/design/DesignPrimitives';
import { ScreenScaffold } from '@/components/layout/ScreenScaffold';
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { fontFamily, moneyTextStyle } from '@/theme/typography';
import { currentYearMonth } from '@/utils/date';

const SCAN_FIELDS = [
  { key: 'merchant', label: 'Merchant', value: 'Reliance Smart Bazaar' },
  { key: 'date', label: 'Date', value: '2026-08-02' },
  { key: 'amount', label: 'Amount', value: '2,486' },
  { key: 'gst', label: 'GST (18%)', value: '379' },
  { key: 'method', label: 'Payment method', value: 'HDFC Millennia ••4821' },
  { key: 'note', label: 'Notes', value: 'Monthly groceries' },
];

const CATEGORIES = ['Groceries', 'Food & Dining', 'Shopping', 'Transport', 'Utilities', 'Other'];

const RECEIPT_LINES = [
  { left: 'Atta 10kg', right: '540.00' },
  { left: 'Cooking oil 5L', right: '820.00' },
  { left: 'Detergent pack', right: '399.00' },
  { left: 'Fresh produce', right: '348.00' },
  { left: 'Dairy & eggs', right: '379.00' },
];

/** Design HTML `isScanner` — receipt OCR preview and confirm. */
export default function ScannerScreen() {
  const [month, setMonth] = useState(currentYearMonth());
  const [loaded, setLoaded] = useState(false);
  const [fields, setFields] = useState(SCAN_FIELDS);

  const updateField = (key: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
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
                  <Text style={styles.receiptStore}>RELIANCE SMART BAZAAR</Text>
                  <Text style={styles.receiptMeta}>Prahlad Nagar · Ahmedabad 380015</Text>
                  <Text style={styles.receiptMeta}>GSTIN 24AABCR1234M1Z5</Text>
                </View>
                <View style={styles.receiptItems}>
                  {RECEIPT_LINES.map((line) => (
                    <View key={line.left} style={styles.receiptLine}>
                      <Text style={styles.receiptItem}>{line.left}</Text>
                      <Text style={styles.receiptItem}>{line.right}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.receiptTotals}>
                  <View style={styles.receiptLine}>
                    <Text style={styles.receiptMuted}>Subtotal</Text>
                    <Text style={styles.receiptMuted}>2,107.00</Text>
                  </View>
                  <View style={styles.receiptLine}>
                    <Text style={styles.receiptMuted}>CGST 9%</Text>
                    <Text style={styles.receiptMuted}>189.50</Text>
                  </View>
                  <View style={styles.receiptLine}>
                    <Text style={styles.receiptMuted}>SGST 9%</Text>
                    <Text style={styles.receiptMuted}>189.50</Text>
                  </View>
                  <View style={[styles.receiptLine, styles.receiptTotalRow]}>
                    <Text style={styles.receiptTotalLabel}>TOTAL</Text>
                    <Text style={styles.receiptTotalLabel}>2,486.00</Text>
                  </View>
                </View>
                <Text style={styles.receiptFooter}>HDFC Millennia ••4821 · Approved</Text>
              </View>
              <Pressable onPress={() => setLoaded(false)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Upload a different file</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setLoaded(true)} style={styles.dropZone}>
              <View style={styles.dropIcon}>
                <Feather name="upload" size={26} color={colors.accent} />
              </View>
              <Text style={styles.dropTitle}>Drop a receipt here</Text>
              <Text style={styles.dropSub}>JPG, PNG or PDF · up to 10 MB</Text>
              <View style={styles.browseBtn}>
                <Text style={styles.browseText}>Browse files</Text>
              </View>
            </Pressable>
          )}
        </Card>

        <Card size="large" style={styles.panel}>
          <DesignSectionHeader
            title="Extracted details"
            subtitle="Check each field before saving — you can edit anything."
          />
          {fields.map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput
                value={f.value}
                onChangeText={(v) => updateField(f.key, v)}
                style={styles.fieldInput}
              />
            </View>
          ))}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map((c) => (
                <View key={c} style={styles.catChip}>
                  <Text style={styles.catChipText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.confirmBanner}>
            <Text style={styles.confirmCopy}>This will be added as an expense of</Text>
            <Text style={[styles.confirmAmount, moneyTextStyle]}>₹2,486</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={() => setLoaded(false)}
              style={[styles.actionBtn, styles.discardBtn]}
            >
              <Text style={styles.discardText}>Discard</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.saveBtn]}>
              <Text style={styles.saveText}>Confirm & add transaction</Text>
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
  catChipText: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.textMuted },
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

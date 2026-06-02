import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Badge, Button, Card } from '../components/ui';
import { Icon } from '../components/Icon';
import { useReceipts } from '../storage/receiptStore';
import { CATEGORIES, CATEGORY_LIST } from '../data/categories';
import { formatMoney } from '../utils/format';
import { Receipt, ReceiptCategory, ReceiptItem } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptDetail'>;

let idCounter = 0;
const nextId = () => `tmp-${Date.now()}-${idCounter++}`;

function draftToReceipt(p: Props['route']['params']): Receipt {
  const d = p.draft;
  return {
    id: nextId(),
    merchant: d?.merchant ?? '',
    category: 'Other',
    date: d?.date ?? new Date().toISOString().slice(0, 10),
    currency: d?.currency ?? 'USD',
    subtotal: d?.subtotal ?? 0,
    tax: d?.tax ?? 0,
    total: d?.total ?? 0,
    items: d?.items ?? [],
    imageUri: p.imageUri,
    confidence: d?.confidence,
  };
}

export default function ReceiptDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { getById, addReceipt, updateReceipt, deleteReceipt } = useReceipts();

  const existing = route.params.receiptId
    ? getById(route.params.receiptId)
    : undefined;
  const isNew = !existing;

  const [receipt, setReceipt] = useState<Receipt>(
    existing ?? draftToReceipt(route.params),
  );
  const [editing, setEditing] = useState(isNew);

  const computedTotal = useMemo(
    () => receipt.subtotal + receipt.tax,
    [receipt.subtotal, receipt.tax],
  );

  function patch(p: Partial<Receipt>) {
    setReceipt(prev => ({ ...prev, ...p }));
  }

  function patchItem(id: string, p: Partial<ReceiptItem>) {
    setReceipt(prev => ({
      ...prev,
      items: prev.items.map(it => (it.id === id ? { ...it, ...p } : it)),
    }));
  }

  function addItem() {
    setReceipt(prev => ({
      ...prev,
      items: [...prev.items, { id: nextId(), name: '', quantity: 1, price: 0 }],
    }));
  }

  function removeItem(id: string) {
    setReceipt(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id),
    }));
  }

  async function onSave() {
    if (!receipt.merchant.trim()) {
      Alert.alert('Missing merchant', 'Please enter the merchant name.');
      return;
    }
    const finalReceipt = { ...receipt, total: computedTotal || receipt.total };
    if (isNew) {
      await addReceipt(finalReceipt);
    } else {
      await updateReceipt(finalReceipt);
    }
    navigation.goBack();
  }

  function onDelete() {
    Alert.alert('Delete receipt', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (existing) await deleteReceipt(existing.id);
          navigation.goBack();
        },
      },
    ]);
  }

  const meta = CATEGORIES[receipt.category];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="back" size={32} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>
          {isNew ? 'Review scan' : 'Receipt'}
        </Text>
        {existing ? (
          <Pressable onPress={() => setEditing(e => !e)} hitSlop={12}>
            <Icon
              name={editing ? 'check' : 'edit'}
              size={22}
              color={colors.primary}
            />
          </Pressable>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {isNew && receipt.confidence != null && (
          <View style={styles.confidence}>
            <Icon name="sparkle" size={16} color={colors.primary} />
            <Text style={styles.confidenceText}>
              Auto-extracted · {Math.round(receipt.confidence * 100)}% confidence.
              Check the details below.
            </Text>
          </View>
        )}

        {receipt.imageUri ? (
          <Image source={{ uri: receipt.imageUri }} style={styles.preview} />
        ) : null}

        {/* Merchant + amount */}
        <Card>
          <View style={styles.merchantRow}>
            <View style={[styles.catIcon, { backgroundColor: meta.color + '22' }]}>
              <Text style={{ fontSize: 24 }}>{meta.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              {editing ? (
                <TextInput
                  value={receipt.merchant}
                  onChangeText={t => patch({ merchant: t })}
                  placeholder="Merchant name"
                  placeholderTextColor={colors.textMuted}
                  style={styles.merchantInput}
                />
              ) : (
                <Text style={styles.merchant}>{receipt.merchant || '—'}</Text>
              )}
              <Text style={styles.date}>{receipt.date}</Text>
            </View>
          </View>

          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>
              {formatMoney(computedTotal || receipt.total, receipt.currency)}
            </Text>
          </View>
        </Card>

        {/* Category picker */}
        {editing && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.catGrid}>
              {CATEGORY_LIST.map(c => {
                const active = receipt.category === c.label;
                return (
                  <Pressable
                    key={c.label}
                    onPress={() =>
                      patch({ category: c.label as ReceiptCategory })
                    }
                    style={[
                      styles.catChip,
                      active && { backgroundColor: c.color + '22', borderColor: c.color },
                    ]}>
                    <Text style={{ fontSize: 15 }}>{c.icon}</Text>
                    <Text
                      style={[
                        styles.catChipText,
                        active && { color: c.color, fontWeight: '700' },
                      ]}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        {!editing && (
          <View style={styles.section}>
            <Badge label={meta.label} color={meta.color} bg={meta.color + '22'} />
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionLabel}>
              Items ({receipt.items.length})
            </Text>
            {editing && (
              <Pressable onPress={addItem} style={styles.addItemBtn}>
                <Icon name="plus" size={14} color={colors.primary} />
                <Text style={styles.addItemText}>Add</Text>
              </Pressable>
            )}
          </View>

          <Card style={{ paddingVertical: spacing.sm }}>
            {receipt.items.length === 0 && (
              <Text style={styles.noItems}>No line items.</Text>
            )}
            {receipt.items.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  idx < receipt.items.length - 1 && styles.itemDivider,
                ]}>
                {editing ? (
                  <>
                    <TextInput
                      value={item.name}
                      onChangeText={t => patchItem(item.id, { name: t })}
                      placeholder="Item"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.itemInput, { flex: 1 }]}
                    />
                    <TextInput
                      value={String(item.price)}
                      onChangeText={t =>
                        patchItem(item.id, { price: parseFloat(t) || 0 })
                      }
                      keyboardType="decimal-pad"
                      style={[styles.itemInput, styles.priceInput]}
                    />
                    <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                      <Icon name="close" size={16} color={colors.danger} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.quantity > 1 ? `${item.quantity}× ` : ''}
                      {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {formatMoney(item.price, receipt.currency)}
                    </Text>
                  </>
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Totals breakdown */}
        <Card style={styles.section}>
          <AmountRow
            label="Subtotal"
            value={receipt.subtotal}
            currency={receipt.currency}
            editing={editing}
            onChange={v => patch({ subtotal: v })}
          />
          <AmountRow
            label="Tax"
            value={receipt.tax}
            currency={receipt.currency}
            editing={editing}
            onChange={v => patch({ tax: v })}
          />
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>
              {formatMoney(computedTotal, receipt.currency)}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        {(editing || isNew) && (
          <Button
            title={isNew ? 'Save receipt' : 'Save changes'}
            onPress={onSave}
            style={{ marginTop: spacing.lg }}
          />
        )}
        {existing && (
          <Button
            title="Delete receipt"
            variant="danger"
            onPress={onDelete}
            icon={<Icon name="trash" size={16} color={colors.danger} />}
            style={{ marginTop: spacing.sm }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AmountRow({
  label,
  value,
  currency,
  editing,
  onChange,
}: {
  label: string;
  value: number;
  currency: string;
  editing: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.amountRow}>
      <Text style={styles.amountLabel}>{label}</Text>
      {editing ? (
        <TextInput
          value={String(value)}
          onChangeText={t => onChange(parseFloat(t) || 0)}
          keyboardType="decimal-pad"
          style={styles.amountInput}
        />
      ) : (
        <Text style={styles.amountValue}>{formatMoney(value, currency)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTitle: { ...typography.heading, color: colors.text },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  confidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  confidenceText: { ...typography.caption, color: colors.primaryDark, flex: 1 },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  merchantRow: { flexDirection: 'row', alignItems: 'center' },
  catIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchant: { ...typography.title, color: colors.text },
  merchantInput: {
    ...typography.title,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 2,
  },
  date: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  totalBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { ...typography.label, color: colors.textMuted },
  totalValue: { ...typography.display, color: colors.text, marginTop: 2 },
  section: { marginTop: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipText: { ...typography.caption, color: colors.textSecondary },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addItemText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  noItems: { ...typography.body, color: colors.textMuted, padding: spacing.md },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemName: { ...typography.body, color: colors.text, flex: 1 },
  itemPrice: { ...typography.bodyStrong, color: colors.text },
  itemInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  priceInput: { width: 84, textAlign: 'right' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  amountLabel: { ...typography.body, color: colors.textSecondary },
  amountValue: { ...typography.body, color: colors.text },
  amountInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    height: 38,
    minWidth: 96,
    textAlign: 'right',
  },
  grandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  grandLabel: { ...typography.heading, color: colors.text },
  grandValue: { ...typography.heading, color: colors.primary },
});

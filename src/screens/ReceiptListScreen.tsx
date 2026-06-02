import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Icon } from '../components/Icon';
import { ReceiptCard } from '../components/ReceiptCard';
import { useReceipts } from '../storage/receiptStore';
import { CATEGORY_LIST } from '../data/categories';
import { formatMoney } from '../utils/format';
import { ReceiptCategory } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Receipts'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ReceiptListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { receipts } = useReceipts();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ReceiptCategory | 'All'>('All');

  const filtered = useMemo(() => {
    return receipts.filter(r => {
      const matchesCat = filter === 'All' || r.category === filter;
      const matchesQuery =
        !query || r.merchant.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [receipts, filter, query]);

  const total = useMemo(
    () => filtered.reduce((sum, r) => sum + r.total, 0),
    [filtered],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Receipts</Text>
          <Text style={styles.subtitle}>
            {filtered.length} receipts · {formatMoney(total)}
          </Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('Scan')}>
          <Icon name="plus" size={22} color={colors.textInverse} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search merchant"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...CATEGORY_LIST.map(c => c.label)] as const}
        keyExtractor={item => item}
        style={styles.chipsList}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => {
          const active = filter === item;
          return (
            <Pressable
              onPress={() => setFilter(item as ReceiptCategory | 'All')}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ReceiptCard
            receipt={item}
            onPress={() =>
              navigation.navigate('ReceiptDetail', { receiptId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="list" size={48} />
            <Text style={styles.emptyTitle}>No receipts found</Text>
            <Text style={styles.emptyText}>
              Try a different search or scan a new receipt.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 46,
    ...typography.body,
    color: colors.text,
  },
  chipsList: { marginTop: spacing.md, maxHeight: 44 },
  chipsContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.textInverse, fontWeight: '600' },
  listContent: { padding: spacing.lg, paddingTop: spacing.md },
  empty: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

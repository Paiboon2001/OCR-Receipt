import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../theme/theme';
import { Card } from '../components/ui';
import { useReceipts } from '../storage/receiptStore';
import { CATEGORIES } from '../data/categories';
import { formatMoney, monthKey } from '../utils/format';
import { Receipt, ReceiptCategory } from '../types';

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const { receipts } = useReceipts();

  const stats = useMemo(() => buildStats(receipts), [receipts]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.subtitle}>Your spending at a glance</Text>

        {/* Headline stats */}
        <View style={styles.statRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL SPENT</Text>
            <Text style={styles.statValue}>{formatMoney(stats.total)}</Text>
            <Text style={styles.statHint}>{receipts.length} receipts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>AVG / RECEIPT</Text>
            <Text style={styles.statValue}>{formatMoney(stats.average)}</Text>
            <Text style={styles.statHint}>across all time</Text>
          </Card>
        </View>

        {/* Category breakdown */}
        <Text style={styles.sectionTitle}>By category</Text>
        <Card>
          {stats.byCategory.length === 0 && (
            <Text style={styles.empty}>No data yet.</Text>
          )}
          {stats.byCategory.map(c => {
            const meta = CATEGORIES[c.category];
            const pct = stats.total ? c.amount / stats.total : 0;
            return (
              <View key={c.category} style={styles.catRow}>
                <View style={styles.catTop}>
                  <Text style={styles.catName}>
                    {meta.icon}  {meta.label}
                  </Text>
                  <Text style={styles.catAmount}>{formatMoney(c.amount)}</Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${Math.max(pct * 100, 3)}%`, backgroundColor: meta.color },
                    ]}
                  />
                </View>
                <Text style={styles.catPct}>{Math.round(pct * 100)}%</Text>
              </View>
            );
          })}
        </Card>

        {/* Monthly trend */}
        <Text style={styles.sectionTitle}>Monthly</Text>
        <Card>
          <View style={styles.chart}>
            {stats.byMonth.map(m => {
              const h = stats.maxMonth ? (m.amount / stats.maxMonth) * 120 : 0;
              return (
                <View key={m.month} style={styles.bar}>
                  <Text style={styles.barValue}>
                    {m.amount >= 1000
                      ? `${(m.amount / 1000).toFixed(1)}k`
                      : Math.round(m.amount)}
                  </Text>
                  <View
                    style={[styles.barFill, { height: Math.max(h, 4) }]}
                  />
                  <Text style={styles.barLabel}>{m.label}</Text>
                </View>
              );
            })}
            {stats.byMonth.length === 0 && (
              <Text style={styles.empty}>No data yet.</Text>
            )}
          </View>
        </Card>

        {/* Top merchant */}
        {stats.topMerchant && (
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={styles.statLabel}>TOP MERCHANT</Text>
            <Text style={styles.topMerchant}>{stats.topMerchant.name}</Text>
            <Text style={styles.statHint}>
              {formatMoney(stats.topMerchant.amount)} ·{' '}
              {stats.topMerchant.count} visits
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function buildStats(receipts: Receipt[]) {
  const total = receipts.reduce((s, r) => s + r.total, 0);
  const average = receipts.length ? total / receipts.length : 0;

  const catMap = new Map<ReceiptCategory, number>();
  const monthMap = new Map<string, number>();
  const merchantMap = new Map<string, { amount: number; count: number }>();

  for (const r of receipts) {
    catMap.set(r.category, (catMap.get(r.category) ?? 0) + r.total);
    const mk = monthKey(r.date);
    monthMap.set(mk, (monthMap.get(mk) ?? 0) + r.total);
    const m = merchantMap.get(r.merchant) ?? { amount: 0, count: 0 };
    merchantMap.set(r.merchant, { amount: m.amount + r.total, count: m.count + 1 });
  }

  const byCategory = [...catMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const byMonth = [...monthMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-6)
    .map(([month, amount]) => {
      const monthIdx = parseInt(month.slice(5, 7), 10) - 1;
      return { month, amount, label: MONTH_NAMES[monthIdx] ?? month };
    });

  const maxMonth = byMonth.reduce((mx, m) => Math.max(mx, m.amount), 0);

  let topMerchant: { name: string; amount: number; count: number } | null = null;
  for (const [name, v] of merchantMap.entries()) {
    if (!topMerchant || v.amount > topMerchant.amount) {
      topMerchant = { name, ...v };
    }
  }

  return { total, average, byCategory, byMonth, maxMonth, topMerchant };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  statCard: { flex: 1 },
  statLabel: { ...typography.label, color: colors.textMuted },
  statValue: { ...typography.title, color: colors.text, marginTop: spacing.xs },
  statHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  catRow: { marginBottom: spacing.lg },
  catTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  catName: { ...typography.body, color: colors.text },
  catAmount: { ...typography.bodyStrong, color: colors.text },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  catPct: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingTop: spacing.md,
  },
  bar: { alignItems: 'center', flex: 1 },
  barValue: { ...typography.caption, color: colors.textSecondary, marginBottom: 4, fontSize: 11 },
  barFill: {
    width: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  barLabel: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  topMerchant: { ...typography.title, color: colors.text, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.lg },
});

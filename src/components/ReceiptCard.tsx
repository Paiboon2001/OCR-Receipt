import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Receipt } from '../types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { CATEGORIES } from '../data/categories';
import { formatDate, formatMoney } from '../utils/format';

interface Props {
  receipt: Receipt;
  onPress?: () => void;
}

/** Row used in the receipt list. */
export const ReceiptCard: React.FC<Props> = ({ receipt, onPress }) => {
  const meta = CATEGORIES[receipt.category];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: meta.color + '22' }]}>
        <Text style={styles.icon}>{meta.icon}</Text>
      </View>

      <View style={styles.middle}>
        <Text style={styles.merchant} numberOfLines={1}>
          {receipt.merchant}
        </Text>
        <Text style={styles.sub}>
          {meta.label} · {formatDate(receipt.date)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>
          {formatMoney(receipt.total, receipt.currency)}
        </Text>
        <Text style={styles.itemCount}>
          {receipt.items.length} item{receipt.items.length === 1 ? '' : 's'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  middle: {
    flex: 1,
    marginLeft: spacing.md,
  },
  merchant: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  amount: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  itemCount: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});

import { ReceiptCategory } from '../types';
import { colors } from '../theme/theme';

interface CategoryMeta {
  label: ReceiptCategory;
  icon: string; // emoji glyph used by the lightweight Icon component
  color: string;
}

export const CATEGORIES: Record<ReceiptCategory, CategoryMeta> = {
  Groceries: { label: 'Groceries', icon: '🛒', color: '#16A34A' },
  Dining: { label: 'Dining', icon: '🍽️', color: '#EA580C' },
  Transport: { label: 'Transport', icon: '🚗', color: '#2563EB' },
  Shopping: { label: 'Shopping', icon: '🛍️', color: '#DB2777' },
  Utilities: { label: 'Utilities', icon: '💡', color: '#CA8A04' },
  Health: { label: 'Health', icon: '💊', color: '#0891B2' },
  Other: { label: 'Other', icon: '📄', color: colors.textMuted },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

/**
 * @format
 */

import { formatMoney, monthKey } from '../src/utils/format';

test('formatMoney renders the currency symbol and 2 decimals', () => {
  expect(formatMoney(12.5, 'USD')).toBe('$12.50');
  expect(formatMoney(134, 'THB')).toBe('฿134.00');
});

test('monthKey extracts YYYY-MM', () => {
  expect(monthKey('2026-05-28')).toBe('2026-05');
});

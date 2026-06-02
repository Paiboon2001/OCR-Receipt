/**
 * Shared domain types for the OCR Receipt app.
 */

export type ReceiptCategory =
  | 'Groceries'
  | 'Dining'
  | 'Transport'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Other';

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // line total for this item
}

export interface Receipt {
  id: string;
  merchant: string;
  category: ReceiptCategory;
  /** ISO 8601 date string (e.g. 2026-05-21) */
  date: string;
  currency: string; // e.g. 'USD', 'THB'
  subtotal: number;
  tax: number;
  total: number;
  items: ReceiptItem[];
  /** Local URI of the captured image, if any */
  imageUri?: string;
  /** OCR engine confidence 0..1, if known */
  confidence?: number;
  notes?: string;
}

/** Raw result shape returned by the OCR service before user confirmation. */
export interface OcrResult {
  merchant?: string;
  date?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  items: ReceiptItem[];
  confidence?: number;
  rawText?: string;
}

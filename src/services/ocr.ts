/**
 * Cloud OCR service.
 *
 * This is wired to call a configurable HTTP endpoint that accepts a receipt
 * image (base64) and returns structured fields. Swap OCR_ENDPOINT / the request
 * body to match your provider (Google Cloud Vision, AWS Textract, Mindee,
 * Veryfi, or your own backend that proxies one of these).
 *
 * Until a real endpoint is configured, `USE_MOCK` returns a realistic fake
 * result after a short delay so the capture flow is fully testable.
 */

import { OcrResult } from '../types';

// TODO: point this at your backend/provider and keep keys server-side.
const OCR_ENDPOINT = '';
const OCR_API_KEY = '';

/** Flip to false once OCR_ENDPOINT is configured. */
const USE_MOCK = true;

export interface ScanInput {
  /** Base64-encoded image data (no data: prefix). */
  base64: string;
  /** Original file URI, forwarded for logging/debugging. */
  uri?: string;
  mimeType?: string;
}

export async function scanReceipt(input: ScanInput): Promise<OcrResult> {
  if (USE_MOCK || !OCR_ENDPOINT) {
    return mockScan();
  }

  const response = await fetch(OCR_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OCR_API_KEY}`,
    },
    body: JSON.stringify({
      image: input.base64,
      mimeType: input.mimeType ?? 'image/jpeg',
    }),
  });

  if (!response.ok) {
    throw new Error(`OCR request failed (${response.status})`);
  }

  const data = await response.json();
  return normalizeResponse(data);
}

/**
 * Map a provider-specific payload onto our OcrResult shape.
 * Adjust the field paths to match the provider you choose.
 */
function normalizeResponse(data: any): OcrResult {
  return {
    merchant: data.merchant ?? data.vendor?.name,
    date: data.date ?? data.purchaseDate,
    currency: data.currency ?? 'USD',
    subtotal: toNumber(data.subtotal),
    tax: toNumber(data.tax ?? data.totalTax),
    total: toNumber(data.total ?? data.grandTotal),
    confidence: data.confidence,
    rawText: data.rawText ?? data.text,
    items: Array.isArray(data.lineItems)
      ? data.lineItems.map((li: any, idx: number) => ({
          id: `ocr-${idx}`,
          name: li.description ?? li.name ?? 'Item',
          quantity: toNumber(li.quantity) || 1,
          price: toNumber(li.total ?? li.amount),
        }))
      : [],
  };
}

function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isFinite(n) ? n : 0;
}

/** Deterministic-ish fake result used during UI development. */
async function mockScan(): Promise<OcrResult> {
  await new Promise<void>(res => setTimeout(() => res(), 1800));
  return {
    merchant: 'Trader Joe’s',
    date: new Date().toISOString().slice(0, 10),
    currency: 'USD',
    subtotal: 34.47,
    tax: 2.76,
    total: 37.23,
    confidence: 0.94,
    rawText: 'TRADER JOES\n...',
    items: [
      { id: 'ocr-0', name: 'Cold Brew Concentrate', quantity: 1, price: 5.99 },
      { id: 'ocr-1', name: 'Frozen Dumplings', quantity: 2, price: 7.98 },
      { id: 'ocr-2', name: 'Dark Chocolate', quantity: 3, price: 8.97 },
      { id: 'ocr-3', name: 'Greek Yogurt', quantity: 1, price: 4.49 },
      { id: 'ocr-4', name: 'Olive Oil', quantity: 1, price: 7.04 },
    ],
  };
}

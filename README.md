# OCR Receipt 🧾

A mobile app (React Native, bare CLI + TypeScript) that scans paper receipts,
extracts the merchant, line items and totals via a **cloud OCR API**, and tracks
your spending.

## Features

- **Cover** — branded entry screen (from Figma) with an animated scanning frame,
  floating extracted-data cards and a capture button.
- **Scan QR to Login** — modal scanner overlay (from Figma) with animated scan
  line; tapping it enters the app.
- **Scan / Capture** — take a photo or pick from the gallery; the image is sent
  to a cloud OCR service and parsed into structured fields.
- **Receipts** — searchable, category-filterable list of all saved receipts.
- **Receipt detail** — review and edit the auto-extracted merchant, date,
  category, line items, subtotal, tax and total before saving.
- **Summary** — spending dashboard: totals, average per receipt, category
  breakdown, a 6-month bar chart and your top merchant.

Receipts are persisted locally with AsyncStorage and seeded with sample data on
first launch.

## Tech stack

| Area        | Choice                                            |
| ----------- | ------------------------------------------------- |
| Framework   | React Native 0.85 (bare CLI), TypeScript          |
| Navigation  | React Navigation (bottom tabs + native stack)     |
| OCR         | Cloud HTTP API (provider-agnostic, see below)     |
| Image input | `react-native-image-picker` (camera + gallery)    |
| Storage     | `@react-native-async-storage/async-storage`       |
| Gradients   | `react-native-linear-gradient`                    |
| Vector art  | `react-native-svg` (Figma-exported icons)         |

## Project structure

```
src/
  components/    Reusable UI (Icon, Card/Button/Badge, ReceiptCard)
  data/          Categories + mock seed receipts
  navigation/    Root stack + bottom tabs
  screens/       Scan, ReceiptList, ReceiptDetail, Summary
  services/      ocr.ts — cloud OCR client (currently mocked)
  storage/       receiptStore.tsx — AsyncStorage-backed context
  theme/         Design tokens (colors, spacing, typography)
  types/         Domain types (Receipt, ReceiptItem, OcrResult)
  utils/         Formatting helpers
```

## Connecting the real OCR API

OCR is mocked out of the box so the capture flow works immediately. To wire a
real provider (Google Cloud Vision, AWS Textract, Mindee, Veryfi, or your own
backend), edit [`src/services/ocr.ts`](src/services/ocr.ts):

1. Set `OCR_ENDPOINT` and (server-side) the API key.
2. Set `USE_MOCK = false`.
3. Adjust `normalizeResponse()` to map the provider's payload onto `OcrResult`.

> Keep API keys on a backend you control — don't ship provider secrets in the app.

## Getting started

```bash
npm install

# iOS (first time)
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios

# Android
npm run android
```

> ⚠️ The project folder name contains a space (`OCR Receipt`). Spaces in the path
> can break iOS CocoaPods/Xcode builds. If `pod install` or the iOS build fails,
> move the project to a space-free path (e.g. `~/OCRReceipt`).

## Roadmap

- [ ] Connect a live cloud OCR provider
- [ ] Export receipts (CSV / PDF)
- [ ] Cloud sync & multi-device
- [ ] Budgets and spending alerts

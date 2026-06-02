import type { NavigatorScreenParams } from '@react-navigation/native';
import type { OcrResult } from '../types';

export type TabParamList = {
  Scan: undefined;
  Receipts: undefined;
  Summary: undefined;
};

export type RootStackParamList = {
  Cover: undefined;
  QrLogin: undefined;
  ScanDocs: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  ReceiptDetail: { receiptId?: string; draft?: OcrResult; imageUri?: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

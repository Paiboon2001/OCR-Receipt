/**
 * Persistence layer for receipts backed by AsyncStorage, exposed through a
 * tiny React context so any screen can read/add/update/delete receipts.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt } from '../types';
import { MOCK_RECEIPTS } from '../data/mockReceipts';

const STORAGE_KEY = '@ocr_receipt/receipts/v1';

interface ReceiptStore {
  receipts: Receipt[];
  loading: boolean;
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceipt: (receipt: Receipt) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  getById: (id: string) => Receipt | undefined;
}

const ReceiptContext = createContext<ReceiptStore | undefined>(undefined);

function sortByDateDesc(list: Receipt[]): Receipt[] {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const ReceiptProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setReceipts(sortByDateDesc(JSON.parse(raw)));
        } else {
          // First launch: seed with mock data so the app isn't empty.
          setReceipts(sortByDateDesc(MOCK_RECEIPTS));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_RECEIPTS));
        }
      } catch (e) {
        console.warn('Failed to load receipts', e);
        setReceipts(sortByDateDesc(MOCK_RECEIPTS));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Receipt[]) => {
    const sorted = sortByDateDesc(next);
    setReceipts(sorted);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch (e) {
      console.warn('Failed to save receipts', e);
    }
  }, []);

  const addReceipt = useCallback(
    (receipt: Receipt) => persist([receipt, ...receipts]),
    [receipts, persist],
  );

  const updateReceipt = useCallback(
    (receipt: Receipt) =>
      persist(receipts.map(r => (r.id === receipt.id ? receipt : r))),
    [receipts, persist],
  );

  const deleteReceipt = useCallback(
    (id: string) => persist(receipts.filter(r => r.id !== id)),
    [receipts, persist],
  );

  const getById = useCallback(
    (id: string) => receipts.find(r => r.id === id),
    [receipts],
  );

  const value = useMemo<ReceiptStore>(
    () => ({
      receipts,
      loading,
      addReceipt,
      updateReceipt,
      deleteReceipt,
      getById,
    }),
    [receipts, loading, addReceipt, updateReceipt, deleteReceipt, getById],
  );

  return (
    <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>
  );
};

export function useReceipts(): ReceiptStore {
  const ctx = useContext(ReceiptContext);
  if (!ctx) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return ctx;
}

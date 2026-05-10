import { ledgerFormPreferencesSchema, ledgerRecordListSchema } from '@/features/ledger/ledger.schema';
import { LEDGER_CATEGORIES, PAYMENT_METHODS, STORAGE_KEYS } from '@/features/ledger/ledger.constants';
import type { LedgerRecord, LedgerCategory, PaymentMethod } from '@/types/ledger';
import { isStorageAvailable, safeWriteJson, type StorageLike } from './storage';

const emptyRecordList: LedgerRecord[] = [];

export interface LedgerFormPreferences {
  category: LedgerCategory;
  payment: PaymentMethod;
}

export type LedgerRecordsReadIssue = 'unavailable' | 'invalid-data' | 'read-failed';

export interface LedgerRecordsReadResult {
  records: LedgerRecord[];
  issue: LedgerRecordsReadIssue | null;
  message: string | null;
}

const defaultFormPreferences: LedgerFormPreferences = {
  category: LEDGER_CATEGORIES[0],
  payment: PAYMENT_METHODS[0],
};

function getDefaultStorage(): StorageLike | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}

export function canUseLedgerStorage(storage: StorageLike | undefined = getDefaultStorage()): boolean {
  return isStorageAvailable(storage);
}

export function readLedgerRecords(
  storage: StorageLike | undefined = getDefaultStorage(),
): LedgerRecordsReadResult {
  if (!isStorageAvailable(storage)) {
    return {
      records: emptyRecordList,
      issue: 'unavailable',
      message: '当前环境不支持本地存储，无法使用',
    };
  }

  let rawValue: string | null;

  try {
    rawValue = storage.getItem(STORAGE_KEYS.ledgerRecords);
  } catch {
    return {
      records: emptyRecordList,
      issue: 'read-failed',
      message: '读取本地数据失败，已显示为空列表',
    };
  }

  if (!rawValue) {
    return {
      records: emptyRecordList,
      issue: null,
      message: null,
    };
  }

  let rawRecords: unknown;

  try {
    rawRecords = JSON.parse(rawValue);
  } catch {
    return {
      records: emptyRecordList,
      issue: 'invalid-data',
      message: '检测到本地数据损坏，已忽略异常数据',
    };
  }

  const parsed = ledgerRecordListSchema.safeParse(rawRecords);

  if (!parsed.success) {
    return {
      records: emptyRecordList,
      issue: 'invalid-data',
      message: '检测到本地数据损坏，已忽略异常数据',
    };
  }

  return {
    records: parsed.data,
    issue: null,
    message: null,
  };
}

export function writeLedgerRecords(
  records: LedgerRecord[],
  storage: StorageLike | undefined = getDefaultStorage(),
): boolean {
  if (!isStorageAvailable(storage)) {
    return false;
  }

  return safeWriteJson(storage, STORAGE_KEYS.ledgerRecords, records);
}

export function clearLedgerRecords(storage: StorageLike | undefined = getDefaultStorage()): boolean {
  if (!isStorageAvailable(storage)) {
    return false;
  }

  try {
    storage.removeItem(STORAGE_KEYS.ledgerRecords);
    return true;
  } catch {
    return false;
  }
}

export function readLedgerFormPreferences(
  storage: StorageLike | undefined = getDefaultStorage(),
): LedgerFormPreferences {
  if (!isStorageAvailable(storage)) {
    return defaultFormPreferences;
  }

  const rawPreferences = {
    category: storage.getItem(STORAGE_KEYS.lastUsedCategory),
    payment: storage.getItem(STORAGE_KEYS.lastUsedPaymentMethod),
  };
  const parsed = ledgerFormPreferencesSchema.safeParse(rawPreferences);

  if (!parsed.success) {
    return defaultFormPreferences;
  }

  return parsed.data;
}

export function writeLedgerFormPreferences(
  preferences: LedgerFormPreferences,
  storage: StorageLike | undefined = getDefaultStorage(),
): boolean {
  if (!isStorageAvailable(storage)) {
    return false;
  }

  try {
    storage.setItem(STORAGE_KEYS.lastUsedCategory, preferences.category);
    storage.setItem(STORAGE_KEYS.lastUsedPaymentMethod, preferences.payment);
    return true;
  } catch {
    return false;
  }
}

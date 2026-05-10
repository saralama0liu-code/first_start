import { describe, expect, it } from 'vitest';

import type { LedgerRecord } from '@/types/ledger';
import {
  canUseLedgerStorage,
  clearLedgerRecords,
  readLedgerFormPreferences,
  readLedgerRecords,
  writeLedgerFormPreferences,
  writeLedgerRecords,
} from './storage-service';

function createMockStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
}

const sampleRecord: LedgerRecord = {
  id: 'record-1',
  type: 'expense',
  amount: 25.5,
  category: '餐饮',
  payment: '微信',
  time: '2026-04-26T10:00:00.000Z',
  note: '午饭',
};

describe('storage service', () => {
  it('returns false when storage is unavailable', () => {
    expect(canUseLedgerStorage(undefined)).toBe(false);
  });

  it('writes and reads ledger records safely', () => {
    const storage = createMockStorage();

    expect(writeLedgerRecords([sampleRecord], storage)).toBe(true);
    expect(readLedgerRecords(storage)).toEqual({
      records: [sampleRecord],
      issue: null,
      message: null,
    });
  });

  it('returns an empty list for malformed data', () => {
    const storage = createMockStorage();
    storage.setItem('quick-ledger.records', 'not-json');

    expect(readLedgerRecords(storage)).toEqual({
      records: [],
      issue: 'invalid-data',
      message: '检测到本地数据损坏，已忽略异常数据',
    });
  });

  it('clears stored ledger records', () => {
    const storage = createMockStorage();

    writeLedgerRecords([sampleRecord], storage);
    expect(clearLedgerRecords(storage)).toBe(true);
    expect(readLedgerRecords(storage)).toEqual({
      records: [],
      issue: null,
      message: null,
    });
  });

  it('writes and reads ledger form preferences safely', () => {
    const storage = createMockStorage();

    expect(
      writeLedgerFormPreferences(
        {
          category: '交通',
          payment: '支付宝',
        },
        storage,
      ),
    ).toBe(true);
    expect(readLedgerFormPreferences(storage)).toEqual({
      category: '交通',
      payment: '支付宝',
    });
  });

  it('returns default preferences for malformed preference data', () => {
    const storage = createMockStorage();
    storage.setItem('quick-ledger.lastUsedCategory', '不存在的分类');
    storage.setItem('quick-ledger.lastUsedPaymentMethod', '不存在的支付方式');

    expect(readLedgerFormPreferences(storage)).toEqual({
      category: '餐饮',
      payment: '微信',
    });
  });

  it('reports unavailable storage explicitly', () => {
    expect(readLedgerRecords(undefined)).toEqual({
      records: [],
      issue: 'unavailable',
      message: '当前环境不支持本地存储，无法使用',
    });
  });
});

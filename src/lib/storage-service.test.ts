import { describe, expect, it } from 'vitest';

import type { LedgerRecord } from '@/types/ledger';
import {
  canUseLedgerStorage,
  clearLedgerBudgetSettings,
  clearLedgerRecords,
  readLedgerBudgetSettings,
  readLedgerFormPreferences,
  readLedgerRecords,
  writeLedgerBudgetSettings,
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
      message: '本地记录已损坏，已忽略',
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
      message: '当前环境不支持本地保存',
    });
  });

  it('writes and reads ledger budget settings safely', () => {
    const storage = createMockStorage();

    expect(
      writeLedgerBudgetSettings(
        {
          monthlyBudget: 2000,
          categoryBudgets: {
            餐饮: 600,
            交通: 300,
          },
        },
        storage,
      ),
    ).toBe(true);
    expect(readLedgerBudgetSettings(storage)).toEqual({
      settings: {
        monthlyBudget: 2000,
        categoryBudgets: {
          餐饮: 600,
          交通: 300,
        },
      },
      issue: null,
      message: null,
    });
  });

  it('returns default budget settings for malformed budget data', () => {
    const storage = createMockStorage();
    storage.setItem('quick-ledger.budgetSettings', 'not-json');

    expect(readLedgerBudgetSettings(storage)).toEqual({
      settings: {
        monthlyBudget: 2000,
        categoryBudgets: {},
      },
      issue: 'invalid-data',
      message: '预算数据已损坏，已回退默认值',
    });
  });

  it('clears stored ledger budget settings', () => {
    const storage = createMockStorage();

    writeLedgerBudgetSettings(
      {
        monthlyBudget: 2000,
        categoryBudgets: {
          餐饮: 600,
        },
      },
      storage,
    );

    expect(clearLedgerBudgetSettings(storage)).toBe(true);
    expect(readLedgerBudgetSettings(storage)).toEqual({
      settings: {
        monthlyBudget: 2000,
        categoryBudgets: {},
      },
      issue: null,
      message: null,
    });
  });
});

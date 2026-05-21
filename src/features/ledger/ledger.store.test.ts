import { describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from './ledger.constants';
import type { LedgerRecord } from '@/types/ledger';
import { createLedgerStore } from './ledger.store';

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

const recordA: LedgerRecord = {
  id: 'a',
  type: 'expense',
  amount: 20,
  category: '餐饮',
  payment: '微信',
  time: '2026-04-26T08:00:00.000Z',
  note: '早餐',
};

const recordB: LedgerRecord = {
  id: 'b',
  type: 'expense',
  amount: 35,
  category: '交通',
  payment: '支付宝',
  time: '2026-04-26T12:00:00.000Z',
  note: '午餐路上',
};

const recordC: LedgerRecord = {
  id: 'c',
  type: 'income',
  amount: 100,
  category: '其他',
  payment: '现金',
  time: '2026-04-25T10:00:00.000Z',
  note: '报销',
};

describe('ledger store', () => {
  it('hydrates from storage and sorts records newest first', () => {
    const storage = createMockStorage();
    const now = new Date();
    const thisMonthRecordA = {
      ...recordA,
      time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    };
    const thisMonthRecordB = {
      ...recordB,
      time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    };
    const lastMonthRecordC = {
      ...recordC,
      time: new Date(now.getFullYear(), now.getMonth() - 1, 15, 10, 0, 0).toISOString(),
    };
    storage.setItem(
      'quick-ledger.records',
      JSON.stringify([thisMonthRecordA, thisMonthRecordB, lastMonthRecordC]),
    );
    storage.setItem(
      'quick-ledger.budgetSettings',
      JSON.stringify({
        monthlyBudget: 100,
        categoryBudgets: {
          餐饮: 50,
          交通: 40,
        },
      }),
    );

    const store = createLedgerStore(storage);
    const snapshot = store.hydrate();

    expect(snapshot.hydrated).toBe(true);
    expect(snapshot.storageAvailable).toBe(true);
    expect(snapshot.storageIssue).toBeNull();
    expect(snapshot.records.map((record) => record.id)).toEqual(['b', 'a', 'c']);
    expect(snapshot.budgetSettings).toEqual({
      monthlyBudget: 100,
      categoryBudgets: {
        餐饮: 50,
        交通: 40,
      },
    });
    expect(snapshot.budgetProgress).toMatchObject({
      monthlyBudget: 100,
      monthlyExpense: 55,
      remainingBudget: 45,
      overspentAmount: null,
      usageRatio: 0.55,
      status: 'within-budget',
    });
    expect(snapshot.budgetSummaryCopy).toEqual({
      headline: '剩余 ¥45.00',
      detail: '本月已用 55%',
    });
    expect(snapshot.categoryBudgetSummaries[0]).toMatchObject({
      category: '餐饮',
      monthlyBudget: 50,
      monthlyExpense: 20,
      remainingBudget: 30,
      displayBalance: '剩余 ¥30.00',
      displayProgress: '40%',
    });
    expect(store.getRecentRecords(2).map((record) => record.id)).toEqual(['b', 'a']);
    expect(store.getAllRecords().map((record) => record.id)).toEqual(['b', 'a', 'c']);
  });

  it('keeps the store safe when persisted data is malformed', () => {
    const storage = createMockStorage();
    storage.setItem('quick-ledger.records', 'broken-json');

    const store = createLedgerStore(storage);

    expect(store.hydrate().records).toEqual([]);
    expect(store.getSnapshot().storageIssue).toBe('invalid-data');
    expect(store.getSnapshot().records).toEqual([]);
  });

  it('adds, updates, and removes records', () => {
    const storage = createMockStorage();
    const store = createLedgerStore(storage);

    expect(store.addRecord(recordA)).toBe(true);
    expect(store.addRecord(recordA)).toBe(false);
    expect(store.addRecord(recordB)).toBe(true);
    expect(store.getAllRecords().map((record) => record.id)).toEqual(['b', 'a']);

    expect(
      store.updateRecord('a', {
        ...recordA,
        amount: 28,
        note: '早餐+咖啡',
      }),
    ).toBe(true);

    expect(store.getRecordById('a')?.amount).toBe(28);
    expect(store.removeRecord('b')).toBe(true);
    expect(store.getAllRecords().map((record) => record.id)).toEqual(['a']);
  });

  it('notifies subscribers after state changes', () => {
    const storage = createMockStorage();
    const store = createLedgerStore(storage);
    const revisions: number[] = [];

    const unsubscribe = store.subscribe((snapshot) => {
      revisions.push(snapshot.revision);
    });

    store.addRecord(recordA);
    store.removeRecord(recordA.id);
    unsubscribe();

    expect(revisions.length).toBeGreaterThanOrEqual(3);
    expect(revisions.at(-1)).toBeGreaterThanOrEqual(revisions[0]);
  });

  it('keeps the store empty when storage is unavailable', () => {
    const store = createLedgerStore(undefined);

    expect(store.hydrate().storageAvailable).toBe(false);
    expect(store.getSnapshot().storageIssue).toBe('unavailable');
    expect(store.addRecord(recordA)).toBe(false);
    expect(store.getAllRecords()).toEqual([]);
  });

  it('returns false when attempting to update a missing record', () => {
    const storage = createMockStorage();
    const store = createLedgerStore(storage);

    expect(store.updateRecord('missing', recordA)).toBe(false);
    expect(store.removeRecord('missing')).toBe(false);
  });

  it('updates and persists budget settings', () => {
    const storage = createMockStorage();
    const store = createLedgerStore(storage);

    expect(
      store.updateBudgetSettings({
        monthlyBudget: 3000,
        categoryBudgets: {
          餐饮: 800,
          交通: 200,
        },
      }),
    ).toBe(true);

    const snapshot = store.getSnapshot();

    expect(snapshot.budgetSettings).toEqual({
      monthlyBudget: 3000,
      categoryBudgets: {
        餐饮: 800,
        交通: 200,
      },
    });
    expect(snapshot.budgetProgress).toMatchObject({
      monthlyBudget: 3000,
      monthlyExpense: 0,
      remainingBudget: 3000,
      overspentAmount: null,
      usageRatio: 0,
      status: 'within-budget',
    });
    expect(JSON.parse(storage.getItem(STORAGE_KEYS.ledgerBudgetSettings) ?? '{}')).toEqual({
      monthlyBudget: 3000,
      categoryBudgets: {
        餐饮: 800,
        交通: 200,
      },
    });
  });
});

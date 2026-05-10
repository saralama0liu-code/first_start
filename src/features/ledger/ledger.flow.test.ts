import { describe, expect, it } from 'vitest';

import type { LedgerRecord } from '@/types/ledger';
import { calculateLedgerStats } from './ledger.stats';
import { createLedgerStore } from './ledger.store';
import { readLedgerRecords } from '@/lib/storage-service';

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

const expenseRecord: LedgerRecord = {
  id: 'expense-1',
  type: 'expense',
  amount: 20,
  category: '餐饮',
  payment: '微信',
  time: '2026-04-26T08:00:00.000Z',
  note: '早餐',
};

const incomeRecord: LedgerRecord = {
  id: 'income-1',
  type: 'income',
  amount: 120,
  category: '其他',
  payment: '现金',
  time: '2026-04-26T09:00:00.000Z',
  note: '报销',
};

describe('ledger flow', () => {
  it('adds, edits, deletes, and refreshes derived stats', () => {
    const storage = createMockStorage();
    const store = createLedgerStore(storage);
    const now = new Date();
    const expenseTime = new Date(now.getTime() - 60_000).toISOString();
    const incomeTime = new Date(now.getTime() - 30_000).toISOString();

    expect(
      store.addRecord({
        ...expenseRecord,
        time: expenseTime,
      }),
    ).toBe(true);
    expect(
      store.addRecord({
        ...incomeRecord,
        time: incomeTime,
      }),
    ).toBe(true);

    let snapshot = store.getSnapshot();
    let stats = calculateLedgerStats(snapshot.records);

    expect(snapshot.records.map((record) => record.id)).toEqual(['income-1', 'expense-1']);
    expect(stats.todayExpense).toBe(20);
    expect(stats.monthExpense).toBe(20);

    expect(
      store.updateRecord('expense-1', {
        ...expenseRecord,
        type: 'income',
        amount: 35,
        time: expenseTime,
        note: '退款',
      }),
    ).toBe(true);

    snapshot = store.getSnapshot();
    stats = calculateLedgerStats(snapshot.records);

    expect(snapshot.records.find((record) => record.id === 'expense-1')?.type).toBe('income');
    expect(stats.todayExpense).toBe(0);
    expect(stats.monthExpense).toBe(0);

    expect(store.removeRecord('income-1')).toBe(true);

    snapshot = store.getSnapshot();
    stats = calculateLedgerStats(snapshot.records);

    expect(snapshot.records).toHaveLength(1);
    expect(snapshot.records[0]?.id).toBe('expense-1');
    expect(stats.allRecords).toHaveLength(1);
    expect(readLedgerRecords(storage)).toEqual({
      records: snapshot.records,
      issue: null,
      message: null,
    });
  });
});

import { describe, expect, it } from 'vitest';

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
    storage.setItem('quick-ledger.records', JSON.stringify([recordA, recordB, recordC]));

    const store = createLedgerStore(storage);
    const snapshot = store.hydrate();

    expect(snapshot.hydrated).toBe(true);
    expect(snapshot.storageAvailable).toBe(true);
    expect(snapshot.storageIssue).toBeNull();
    expect(snapshot.records.map((record) => record.id)).toEqual(['b', 'a', 'c']);
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
});

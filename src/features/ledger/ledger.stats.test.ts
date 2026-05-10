import { describe, expect, it } from 'vitest';

import type { LedgerRecord } from '@/types/ledger';
import {
  calculateLedgerStats,
  getLedgerRecordsSortedByNewest,
  getRecentLedgerRecords,
  sumExpense,
} from './ledger.stats';

const referenceDate = new Date('2026-04-26T12:00:00.000Z');

const records: LedgerRecord[] = [
  {
    id: '1',
    type: 'expense',
    amount: 20,
    category: '餐饮',
    payment: '微信',
    time: '2026-04-26T08:00:00.000Z',
    note: '早餐',
  },
  {
    id: '2',
    type: 'expense',
    amount: 35,
    category: '交通',
    payment: '支付宝',
    time: '2026-04-26T10:00:00.000Z',
    note: '出门',
  },
  {
    id: '3',
    type: 'income',
    amount: 100,
    category: '其他',
    payment: '现金',
    time: '2026-04-26T11:00:00.000Z',
    note: '报销',
  },
  {
    id: '4',
    type: 'expense',
    amount: 50,
    category: '日用',
    payment: '银行卡',
    time: '2026-04-20T08:00:00.000Z',
    note: '上周购物',
  },
  {
    id: '5',
    type: 'expense',
    amount: 12,
    category: '娱乐',
    payment: '微信',
    time: '2026-03-26T08:00:00.000Z',
    note: '上月',
  },
];

describe('ledger stats', () => {
  it('sums only expense records', () => {
    expect(sumExpense(records)).toBe(117);
  });

  it('sorts records by newest first', () => {
    expect(getLedgerRecordsSortedByNewest(records).map((record) => record.id)).toEqual(['3', '2', '1', '4', '5']);
  });

  it('returns recent records with a limit', () => {
    expect(getRecentLedgerRecords(records, 2).map((record) => record.id)).toEqual(['3', '2']);
  });

  it('calculates today and month stats independently', () => {
    const snapshot = calculateLedgerStats(records, referenceDate);

    expect(snapshot.todayExpense).toBe(55);
    expect(snapshot.monthExpense).toBe(105);
    expect(snapshot.recentRecords.map((record) => record.id)).toEqual(['3', '2', '1', '4', '5']);
    expect(snapshot.allRecords.map((record) => record.id)).toEqual(['3', '2', '1', '4', '5']);
  });

  it('caps recent records at 20 items', () => {
    const manyRecords = Array.from({ length: 21 }, (_, index) => ({
      id: String(index + 1),
      type: 'expense' as const,
      amount: index + 1,
      category: '餐饮' as const,
      payment: '微信' as const,
      time: `2026-04-${String(index % 28 + 1).padStart(2, '0')}T0${index % 9}:00:00.000Z`,
      note: `记录${index + 1}`,
    }));

    expect(getRecentLedgerRecords(manyRecords, 20)).toHaveLength(20);
  });
});

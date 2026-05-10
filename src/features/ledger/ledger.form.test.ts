import { describe, expect, it } from 'vitest';

import {
  createLedgerDrawerFormState,
  createLedgerRecordFromDrawerState,
  normalizeLedgerAmountInput,
  validateLedgerDrawerFormState,
} from './ledger.form';

const referenceDate = new Date('2026-04-26T10:20:00.000Z');

describe('ledger form helpers', () => {
  it('builds create mode defaults from preferences', () => {
    expect(
      createLedgerDrawerFormState(
        'create',
        null,
        {
          category: '交通',
          payment: '支付宝',
        },
        referenceDate,
      ),
    ).toEqual({
      type: 'expense',
      amount: '',
      category: '交通',
      payment: '支付宝',
      time: referenceDate.toISOString(),
      note: '',
      showTimeEditor: false,
    });
  });

  it('builds edit mode defaults from the record itself', () => {
    expect(
      createLedgerDrawerFormState(
        'edit',
        {
          id: 'record-1',
          type: 'income',
          amount: 25.5,
          category: '学习',
          payment: '现金',
          time: '2026-04-25T08:00:00.000Z',
          note: '兼职收入',
        },
        {
          category: '交通',
          payment: '支付宝',
        },
        referenceDate,
      ),
    ).toEqual({
      type: 'income',
      amount: '25.50',
      category: '学习',
      payment: '现金',
      time: '2026-04-25T08:00:00.000Z',
      note: '兼职收入',
      showTimeEditor: false,
    });
  });

  it('normalizes amount input to decimal-safe strings', () => {
    expect(normalizeLedgerAmountInput('0012.345')).toBe('12.34');
    expect(normalizeLedgerAmountInput('.5')).toBe('0.5');
    expect(normalizeLedgerAmountInput('12abc')).toBe('12');
  });

  it('creates a ledger record from drawer state', () => {
    expect(
      createLedgerRecordFromDrawerState(
        {
          type: 'expense',
          amount: '18.50',
          category: '餐饮',
          payment: '微信',
          time: '2026-04-26T10:20:00.000Z',
          note: '午饭',
          showTimeEditor: false,
        },
        'create',
        'record-1',
      ),
    ).toEqual({
      id: 'record-1',
      type: 'expense',
      amount: 18.5,
      category: '餐饮',
      payment: '微信',
      time: '2026-04-26T10:20:00.000Z',
      note: '午饭',
    });
  });

  it('validates empty amount and overly long notes', () => {
    expect(
      validateLedgerDrawerFormState({
        type: 'expense',
        amount: '',
        category: '餐饮',
        payment: '微信',
        time: '2026-04-26T10:20:00.000Z',
        note: 'x'.repeat(51),
        showTimeEditor: false,
      }),
    ).toEqual({
      amount: '金额不能为空',
      note: '备注不能超过 50 个字符',
    });
  });

  it('validates non-positive amounts', () => {
    expect(
      validateLedgerDrawerFormState({
        type: 'expense',
        amount: '0',
        category: '餐饮',
        payment: '微信',
        time: '2026-04-26T10:20:00.000Z',
        note: '午饭',
        showTimeEditor: false,
      }),
    ).toEqual({
      amount: '金额必须大于 0',
    });
  });
});

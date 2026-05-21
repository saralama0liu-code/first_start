import { describe, expect, it } from 'vitest';

import {
  hasUsableLedgerImportDraftData,
  ledgerBudgetSettingsSchema,
  ledgerImportDraftConfirmationSchema,
  ledgerImportDraftSchema,
  ledgerRecordInputSchema,
} from './ledger.schema';

describe('ledger schema', () => {
  it('accepts valid budget settings', () => {
    expect(
      ledgerBudgetSettingsSchema.safeParse({
        monthlyBudget: 2000,
        categoryBudgets: {
          餐饮: 600,
          交通: 300,
        },
      }).success,
    ).toBe(true);
  });

  it('rejects invalid monthly and category budgets', () => {
    const invalidMonthlyBudget = ledgerBudgetSettingsSchema.safeParse({
      monthlyBudget: 0,
      categoryBudgets: {},
    });
    const invalidCategoryBudget = ledgerBudgetSettingsSchema.safeParse({
      monthlyBudget: 2000,
      categoryBudgets: {
        餐饮: 12.345,
      },
    });

    expect(invalidMonthlyBudget.success).toBe(false);
    expect(invalidCategoryBudget.success).toBe(false);
  });

  it('accepts a useful import draft and trims empty fields to null', () => {
    const parsed = ledgerImportDraftSchema.safeParse({
      source: 'shortcut',
      amount: '18.50',
      merchant: '  便利店  ',
      time: '2026-04-22T12:30:00.000Z',
      category: '日用',
      payment: '微信',
      note: '  午饭  ',
    });

    expect(parsed.success).toBe(true);

    if (!parsed.success) {
      return;
    }

    expect(parsed.data).toEqual({
      source: 'shortcut',
      amount: 18.5,
      merchant: '便利店',
      time: '2026-04-22T12:30:00.000Z',
      category: '日用',
      payment: '微信',
      note: '午饭',
    });
  });

  it('rejects an import draft without any usable fields', () => {
    const parsed = ledgerImportDraftSchema.safeParse({
      source: 'shortcut',
      amount: null,
      merchant: null,
      time: null,
      category: null,
      payment: null,
      note: null,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe('草稿至少需要一项可用信息');
    }
  });

  it('recognizes whether draft data has usable fields', () => {
    expect(
      hasUsableLedgerImportDraftData({
        source: 'shortcut',
        amount: null,
        merchant: null,
        time: null,
        category: null,
        payment: null,
        note: null,
      }),
    ).toBe(false);

    expect(
      hasUsableLedgerImportDraftData({
        source: 'shortcut',
        amount: 12.5,
        merchant: null,
        time: null,
        category: null,
        payment: null,
        note: null,
      }),
    ).toBe(true);
  });

  it('requires the confirmed draft to satisfy the base record validation', () => {
    expect(
      ledgerImportDraftConfirmationSchema.safeParse({
        mode: 'create',
        type: 'expense',
        amount: 18.5,
        category: '餐饮',
        payment: '微信',
        time: '2026-04-22T12:30:00.000Z',
        note: '午饭',
        source: 'shortcut',
      }).success,
    ).toBe(true);

    expect(
      ledgerRecordInputSchema.safeParse({
        mode: 'create',
        type: 'expense',
        amount: 18.5,
        category: '餐饮',
        payment: '微信',
        time: '2026-04-22T12:30:00.000Z',
        note: '午饭',
      }).success,
    ).toBe(true);
  });
});

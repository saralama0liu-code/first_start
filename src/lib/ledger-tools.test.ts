import { describe, expect, it } from 'vitest';

import type { LedgerRecord } from '@/types/ledger';
import {
  buildLedgerBudgetSummaryCopy,
  buildLedgerCategoryBudgetSummaries,
  calculateLedgerBudgetProgress,
  calculateLedgerMonthlyExpenseByCategory,
  formatLedgerDraftAmountDisplay,
  formatLedgerDraftTimeDisplay,
} from './ledger-tools';

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
    time: '2026-04-20T10:00:00.000Z',
    note: '出门',
  },
  {
    id: '3',
    type: 'expense',
    amount: 99,
    category: '餐饮',
    payment: '微信',
    time: '2026-03-26T08:00:00.000Z',
    note: '上月',
  },
  {
    id: '4',
    type: 'income',
    amount: 100,
    category: '其他',
    payment: '现金',
    time: '2026-04-26T11:00:00.000Z',
    note: '报销',
  },
];

describe('ledger tools', () => {
  it('calculates budget progress for unset, within-budget, and over-budget states', () => {
    expect(calculateLedgerBudgetProgress(null, 120)).toEqual({
      monthlyBudget: null,
      monthlyExpense: 120,
      remainingBudget: null,
      overspentAmount: null,
      usageRatio: null,
      status: 'unset',
    });

    expect(calculateLedgerBudgetProgress(200, 120)).toEqual({
      monthlyBudget: 200,
      monthlyExpense: 120,
      remainingBudget: 80,
      overspentAmount: null,
      usageRatio: 0.6,
      status: 'within-budget',
    });

    expect(calculateLedgerBudgetProgress(200, 260)).toEqual({
      monthlyBudget: 200,
      monthlyExpense: 260,
      remainingBudget: null,
      overspentAmount: 60,
      usageRatio: 1.3,
      status: 'over-budget',
    });
  });

  it('summarizes monthly expenses by category and skips cross-month records', () => {
    expect(calculateLedgerMonthlyExpenseByCategory(records, referenceDate)).toEqual({
      餐饮: 20,
      交通: 35,
      日用: 0,
      娱乐: 0,
      学习: 0,
      其他: 0,
    });
  });

  it('builds concise budget copy for the home screen', () => {
    expect(buildLedgerBudgetSummaryCopy(calculateLedgerBudgetProgress(null, 120))).toEqual({
      headline: '去设置预算',
      detail: '设置后再看本月进度',
    });

    expect(buildLedgerBudgetSummaryCopy(calculateLedgerBudgetProgress(200, 120))).toEqual({
      headline: '剩余 ¥80.00',
      detail: '本月已用 60%',
    });

    expect(buildLedgerBudgetSummaryCopy(calculateLedgerBudgetProgress(200, 260))).toEqual({
      headline: '超支 ¥60.00',
      detail: '本月已用 130%',
    });
  });

  it('builds category budget summaries with display-ready copies', () => {
    const summaries = buildLedgerCategoryBudgetSummaries(
      records,
      {
        monthlyBudget: 2000,
        categoryBudgets: {
          餐饮: 100,
          交通: 50,
        },
      },
      referenceDate,
    );

    expect(summaries[0]).toMatchObject({
      category: '餐饮',
      monthlyBudget: 100,
      monthlyExpense: 20,
      remainingBudget: 80,
      overspentAmount: null,
      usageRatio: 0.2,
      status: 'within-budget',
      displayBudget: '¥100.00',
      displayExpense: '¥20.00',
      displayBalance: '剩余 ¥80.00',
      displayProgress: '20%',
    });

    expect(summaries[1]).toMatchObject({
      category: '交通',
      monthlyBudget: 50,
      monthlyExpense: 35,
      displayProgress: '70%',
    });

    expect(summaries[2]).toMatchObject({
      category: '日用',
      monthlyBudget: null,
      displayBudget: '未设置',
      displayBalance: '未设置',
    });
  });

  it('formats draft amount and time display text', () => {
    expect(formatLedgerDraftAmountDisplay(18.5)).toBe('¥18.50');
    expect(formatLedgerDraftAmountDisplay(null)).toBe('待补金额');
    expect(formatLedgerDraftTimeDisplay(null)).toBe('待补时间');
    expect(formatLedgerDraftTimeDisplay('2026-04-26T12:30:00.000Z')).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
    );
  });
});

import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LedgerShell } from './LedgerShell';
import type { LedgerStoreSnapshot } from './ledger.store';
import type { LedgerImportDraft } from '@/types/ledger';

const baseSnapshot: LedgerStoreSnapshot = {
  records: [],
  budgetSettings: {
    monthlyBudget: 2000,
    categoryBudgets: {
      餐饮: 500,
    },
  },
  budgetProgress: {
    monthlyBudget: 2000,
    monthlyExpense: 1040,
    remainingBudget: 960,
    overspentAmount: null,
    usageRatio: 0.52,
    status: 'within-budget',
  },
  categoryBudgetSummaries: [
    {
      category: '餐饮',
      monthlyBudget: 500,
      monthlyExpense: 240,
      remainingBudget: 260,
      overspentAmount: null,
      usageRatio: 0.48,
      status: 'within-budget',
      displayBudget: '¥500.00',
      displayExpense: '¥240.00',
      displayBalance: '剩余 ¥260.00',
      displayProgress: '48%',
    },
  ],
  budgetSummaryCopy: {
    headline: '剩余 ¥960.00',
    detail: '本月已用 52%',
  },
  hydrated: true,
  storageAvailable: true,
  storageIssue: null,
  storageMessage: null,
  revision: 1,
  lastUpdatedAt: '2026-05-18T10:00:00.000Z',
};

let mockSnapshot: LedgerStoreSnapshot = baseSnapshot;
let mockDraft: LedgerImportDraft | null = null;

vi.mock('./ledger.store', () => ({
  ledgerStore: {
    getSnapshot: () => mockSnapshot,
    subscribe: () => () => undefined,
    addRecord: () => true,
    updateRecord: () => true,
    removeRecord: () => true,
    updateBudgetSettings: () => true,
  },
}));

vi.mock('./ledger.import-draft', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./ledger.import-draft')>();

  return {
    ...actual,
    createSampleLedgerImportDraft: () => ({
      source: 'shortcut',
      amount: 18.5,
      merchant: '便利店',
      time: '2026-05-11T03:55:00.000Z',
      category: '日用',
      payment: '微信',
      note: '补给零食',
    }),
    readLedgerImportDraftFromLocation: () => mockDraft,
  };
});

describe('LedgerShell', () => {
  beforeEach(() => {
    mockSnapshot = {
      ...baseSnapshot,
      budgetSettings: {
        ...baseSnapshot.budgetSettings,
        categoryBudgets: { ...baseSnapshot.budgetSettings.categoryBudgets },
      },
      budgetProgress: { ...baseSnapshot.budgetProgress },
      categoryBudgetSummaries: [...baseSnapshot.categoryBudgetSummaries],
      budgetSummaryCopy: { ...baseSnapshot.budgetSummaryCopy },
    };
    mockDraft = null;
  });

  it('renders the home dashboard by default', () => {
    const html = renderToString(<LedgerShell />);

    expect(html).toContain('首页统计');
    expect(html).toContain('+ 记一笔');
    expect(html).toContain('最近 3 条');
  });

  it('enters the import draft surface when a shortcut draft is present', () => {
    mockDraft = {
      source: 'shortcut',
      amount: 18.5,
      merchant: '便利店',
      time: '2026-05-11T03:55:00.000Z',
      category: '日用',
      payment: '微信',
      note: '补给零食',
    };

    const html = renderToString(<LedgerShell />);

    expect(html).toContain('截图导入草稿');
    expect(html).toContain('确认后再保存');
    expect(html).toContain('改用手动记账');
  });

  it('shows storage alerts from the state snapshot', () => {
    mockSnapshot = {
      ...mockSnapshot,
      storageIssue: 'invalid-data',
      storageMessage: '预算数据已损坏，已回退默认值',
    };

    const html = renderToString(<LedgerShell />);

    expect(html).toContain('预算数据已损坏，已回退默认值');
  });
});

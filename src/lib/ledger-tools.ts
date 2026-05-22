import {
  LEDGER_CATEGORIES,
} from '@/features/ledger/ledger.constants';
import {
  isWithinMonthBoundary,
  formatLedgerTime,
} from '@/lib/date';
import { formatRmbAmount } from '@/lib/format';
import type {
  LedgerBudgetProgressSummary,
  LedgerBudgetSettings,
  LedgerBudgetStatus,
  LedgerCategory,
  LedgerRecord,
} from '@/types/ledger';

export interface LedgerBudgetSummaryCopy {
  headline: string;
  detail: string;
}

export interface LedgerCategoryBudgetSummary extends LedgerBudgetProgressSummary {
  category: LedgerCategory;
  displayBudget: string;
  displayExpense: string;
  displayBalance: string;
  displayProgress: string;
}

export function calculateLedgerBudgetProgress(
  monthlyBudget: number | null,
  monthlyExpense: number,
): LedgerBudgetProgressSummary {
  if (typeof monthlyBudget !== 'number' || !Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
    return {
      monthlyBudget: null,
      monthlyExpense,
      remainingBudget: null,
      overspentAmount: null,
      usageRatio: null,
      status: 'unset',
    };
  }

  const usageRatio = monthlyExpense / monthlyBudget;

  if (monthlyExpense <= monthlyBudget) {
    return {
      monthlyBudget,
      monthlyExpense,
      remainingBudget: monthlyBudget - monthlyExpense,
      overspentAmount: null,
      usageRatio,
      status: 'within-budget',
    };
  }

  return {
    monthlyBudget,
    monthlyExpense,
    remainingBudget: null,
    overspentAmount: monthlyExpense - monthlyBudget,
    usageRatio,
    status: 'over-budget',
  };
}

export function calculateLedgerMonthlyExpenseByCategory(
  records: LedgerRecord[],
  referenceDate: Date = new Date(),
): Record<LedgerCategory, number> {
  const totals = createCategoryExpenseTotals();

  for (const record of records) {
    if (record.type !== 'expense') {
      continue;
    }

    if (!isWithinMonthBoundary(record.time, referenceDate)) {
      continue;
    }

    totals[record.category] += record.amount;
  }

  return totals;
}

export function buildLedgerBudgetSummaryCopy(summary: LedgerBudgetProgressSummary): LedgerBudgetSummaryCopy {
  if (summary.status === 'unset' || summary.monthlyBudget === null) {
    return {
      headline: '去设置预算',
      detail: '设置后再看本月进度',
    };
  }

  const usagePercent = formatUsagePercent(summary.usageRatio);

  if (summary.status === 'over-budget') {
    return {
      headline: `超支 ${formatRmbAmount(summary.overspentAmount ?? 0)}`,
      detail: `本月已用 ${usagePercent}`,
    };
  }

  return {
    headline: `剩余 ${formatRmbAmount(summary.remainingBudget ?? 0)}`,
    detail: `本月已用 ${usagePercent}`,
  };
}

export function buildLedgerCategoryBudgetSummaries(
  records: LedgerRecord[],
  settings: LedgerBudgetSettings,
  referenceDate: Date = new Date(),
): LedgerCategoryBudgetSummary[] {
  const monthlyExpenses = calculateLedgerMonthlyExpenseByCategory(records, referenceDate);

  return LEDGER_CATEGORIES.map((category) => {
    const monthlyBudget = settings.categoryBudgets[category] ?? null;
    const monthlyExpense = monthlyExpenses[category] ?? 0;
    const progress = calculateLedgerBudgetProgress(monthlyBudget, monthlyExpense);

    return {
      category,
      ...progress,
      displayBudget: monthlyBudget === null ? '未设置' : formatRmbAmount(monthlyBudget),
      displayExpense: formatRmbAmount(monthlyExpense),
      displayBalance: buildLedgerBalanceCopy(progress),
      displayProgress: formatUsagePercent(progress.usageRatio),
    };
  });
}

export function formatLedgerDraftAmountDisplay(
  amount: number | null,
  fallback = '待补金额',
): string {
  return typeof amount === 'number' && Number.isFinite(amount) ? formatRmbAmount(amount) : fallback;
}

export function formatLedgerDraftTimeDisplay(time: string | null, fallback = '待补时间'): string {
  return time ? formatLedgerTime(time) : fallback;
}

function buildLedgerBalanceCopy(summary: LedgerBudgetProgressSummary): string {
  if (summary.status === 'unset' || summary.monthlyBudget === null) {
    return '未设置';
  }

  if (summary.status === 'over-budget') {
    return `超支 ${formatRmbAmount(summary.overspentAmount ?? 0)}`;
  }

  return `剩余 ${formatRmbAmount(summary.remainingBudget ?? 0)}`;
}

function createCategoryExpenseTotals(): Record<LedgerCategory, number> {
  const totals = {} as Record<LedgerCategory, number>;

  for (const category of LEDGER_CATEGORIES) {
    totals[category] = 0;
  }

  return totals;
}

function formatUsagePercent(usageRatio: number | null): string {
  if (usageRatio === null) {
    return '未设置';
  }

  const percent = Math.round(usageRatio * 100);
  return `${percent}%`;
}

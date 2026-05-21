import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LedgerStatsPanel } from './LedgerStatsPanel';

describe('LedgerStatsPanel', () => {
  it('renders the budget progress ring with a filled percentage', () => {
    const html = renderToString(
      <LedgerStatsPanel
        todayExpense={2}
        monthExpense={1040}
        budgetProgress={{
          monthlyBudget: 2000,
          monthlyExpense: 1040,
          remainingBudget: 960,
          overspentAmount: null,
          usageRatio: 0.52,
          status: 'within-budget',
        }}
        budgetSummaryCopy={{
          headline: '剩余 ¥960.00',
          detail: '本月已用 52%',
        }}
      />,
    );

    expect(html).toContain('¥2,000.00');
    expect(html).toContain('52%');
    expect(html).toContain('余 ¥960.00');
    expect(html).toContain('--budget-progress:0.5200');
    expect(html).toContain('--budget-ring-start:0deg');
    expect(html).toContain('--budget-fill-color:rgba(51, 151, 82, 0.22)');
    expect(html).toContain('剩余 ¥960.00');
  });

  it('renders the over-budget copy without truncating the amount text', () => {
    const html = renderToString(
      <LedgerStatsPanel
        todayExpense={3020}
        monthExpense={3020}
        budgetProgress={{
          monthlyBudget: 2000,
          monthlyExpense: 3020,
          remainingBudget: null,
          overspentAmount: 1020,
          usageRatio: 1.51,
          status: 'over-budget',
        }}
        budgetSummaryCopy={{
          headline: '超支 ¥1,020.00',
          detail: '本月已用 151%',
        }}
      />,
    );

    expect(html).toContain('超支 ¥1,020.00');
    expect(html).toContain('超支 ¥1,020.00');
    expect(html).toContain('--budget-ring-color:rgba(215, 89, 89, 0.96)');
    expect(html).toContain('--budget-fill-color:rgba(215, 89, 89, 0.22)');
  });

  it('renders the budget management entry when a handler is provided', () => {
    const html = renderToString(
      <LedgerStatsPanel
        todayExpense={2}
        monthExpense={1040}
        budgetProgress={{
          monthlyBudget: 2000,
          monthlyExpense: 1040,
          remainingBudget: 960,
          overspentAmount: null,
          usageRatio: 0.52,
          status: 'within-budget',
        }}
        budgetSummaryCopy={{
          headline: '剩余 ¥960.00',
          detail: '本月已用 52%',
        }}
        onOpenRecords={() => undefined}
        onOpenBudget={() => undefined}
        onOpenDraftImport={() => undefined}
      />,
    );

    expect(html).toContain('更多');
    expect(html).toContain('查看全部记录');
    expect(html).toContain('预算管理');
    expect(html).toContain('截图导入说明');
  });
});

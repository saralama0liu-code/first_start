import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LedgerBudgetView } from './LedgerBudgetView';

describe('LedgerBudgetView', () => {
  it('renders budget management content and entry points', () => {
    const html = renderToString(
      <LedgerBudgetView
        budgetSettings={{
          monthlyBudget: 2000,
          categoryBudgets: {
            餐饮: 500,
          },
        }}
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
        categoryBudgetSummaries={[
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
        ]}
        onBackToHome={() => undefined}
        onOpenRecords={() => undefined}
        onSaveBudgetSettings={() => true}
      />,
    );

    expect(html).toContain('预算管理');
    expect(html).toContain('返回首页');
    expect(html).toContain('全部记录');
    expect(html).toContain('编辑月预算');
    expect(html).toContain('编辑餐饮预算');
    expect(html).toContain('月预算');
    expect(html).toContain('分类预算');
    expect(html).toContain('计划和实际支出对比');
    expect(html).not.toContain('保存预算');
    expect(html).toContain('餐饮');
    expect(html).toContain('¥500.00');
  });
});

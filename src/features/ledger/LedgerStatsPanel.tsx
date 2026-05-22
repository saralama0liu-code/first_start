import type { CSSProperties } from 'react';

import { formatRmbAmount } from '@/lib/format';
import type { LedgerBudgetProgressSummary } from '@/types/ledger';
import type { LedgerBudgetSummaryCopy } from '@/lib/ledger-tools';
import { LEDGER_MORE_MENU_ACTION_LABELS } from './ledger.constants';

import styles from './LedgerStatsPanel.module.css';

interface LedgerStatsPanelProps {
  todayExpense: number;
  monthExpense: number;
  budgetProgress: LedgerBudgetProgressSummary;
  budgetSummaryCopy: LedgerBudgetSummaryCopy;
  onOpenRecords?: () => void;
  onOpenBudget?: () => void;
  onOpenDraftImport?: () => void;
}

export function LedgerStatsPanel({
  todayExpense,
  monthExpense,
  budgetProgress,
  budgetSummaryCopy,
  onOpenRecords,
  onOpenBudget,
  onOpenDraftImport,
}: LedgerStatsPanelProps) {
  const progressRatio =
    budgetProgress.usageRatio === null
      ? 0
      : Math.max(0, Math.min(budgetProgress.usageRatio, 1));
  const budgetValue =
    budgetProgress.monthlyBudget === null ? '待设置' : formatRmbAmount(budgetProgress.monthlyBudget);
  const progressValue =
    budgetProgress.usageRatio === null ? '0%' : `${Math.round(budgetProgress.usageRatio * 100)}%`;
  const remainingValue =
    budgetProgress.status === 'over-budget'
      ? `超支 ${formatRmbAmount(budgetProgress.overspentAmount ?? 0)}`
      : budgetProgress.status === 'unset' || budgetProgress.remainingBudget === null
        ? '待设置'
        : `余 ${formatRmbAmount(budgetProgress.remainingBudget)}`;
  const ringStyle: CSSProperties & Record<string, string> = {
    '--budget-progress': progressRatio.toFixed(4),
    '--budget-ring-start': '0deg',
    '--budget-ring-color':
      budgetProgress.status === 'over-budget'
        ? 'rgba(215, 89, 89, 0.96)'
        : 'rgba(51, 151, 82, 0.96)',
    '--budget-ring-track':
      budgetProgress.status === 'over-budget'
        ? 'rgba(215, 89, 89, 0.14)'
        : 'rgba(92, 188, 114, 0.16)',
    '--budget-fill-color':
      budgetProgress.status === 'over-budget'
        ? 'rgba(215, 89, 89, 0.22)'
        : 'rgba(51, 151, 82, 0.22)',
    '--budget-fill-track':
      budgetProgress.status === 'over-budget'
        ? 'rgba(255, 248, 248, 0.86)'
        : 'rgba(250, 255, 251, 0.86)',
  };
  const moreActions: Array<{ label: string; onClick: () => void }> = [];

  if (onOpenRecords) {
    moreActions.push({
      label: LEDGER_MORE_MENU_ACTION_LABELS['view-all-records'],
      onClick: onOpenRecords,
    });
  }

  if (onOpenBudget) {
    moreActions.push({
      label: LEDGER_MORE_MENU_ACTION_LABELS['budget-management'],
      onClick: onOpenBudget,
    });
  }

  if (onOpenDraftImport) {
    moreActions.push({
      label: LEDGER_MORE_MENU_ACTION_LABELS['draft-import-guide'],
      onClick: onOpenDraftImport,
    });
  }

  return (
    <section className={styles.panel} aria-label="首页统计">
      <div className={styles.header}>
        <div className={styles.headerBody}>
          <p className={styles.label}>统计</p>
          <h2 className={styles.title}>{budgetSummaryCopy.headline}</h2>
          <p className={styles.copy}>{budgetSummaryCopy.detail}</p>
        </div>
        {moreActions.length > 0 ? (
          <details className={styles.moreMenu}>
            <summary className={styles.headerAction} aria-label="更多操作">
              更多
            </summary>
            <div className={styles.morePanel}>
              {moreActions.map((action) => (
                <button
                  key={action.label}
                  className={styles.moreButton}
                  type="button"
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </details>
        ) : null}
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.grid}>
          <article className={styles.card}>
            <span className={styles.cardLabel}>今日支出</span>
            <strong className={styles.amount}>{formatRmbAmount(todayExpense)}</strong>
          </article>
          <article className={styles.card}>
            <span className={styles.cardLabel}>本月支出</span>
            <strong className={styles.amount}>{formatRmbAmount(monthExpense)}</strong>
          </article>
        </div>

        <article className={styles.ringCard} aria-label="预算环进度卡片" style={ringStyle}>
          <div className={styles.ringFill} aria-hidden="true" />
          <div className={styles.ringOrbit} aria-hidden="true" />
          <div className={styles.ring} data-status={budgetProgress.status}>
            <span className={styles.ringLabel}>月预算</span>
            <strong className={styles.ringValue}>{budgetValue}</strong>
            <span className={styles.ringProgress}>{progressValue}</span>
            <span className={styles.ringCopy}>{remainingValue}</span>
          </div>
        </article>
      </div>

    </section>
  );
}

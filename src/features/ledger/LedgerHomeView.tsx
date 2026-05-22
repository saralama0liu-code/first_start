import type { LedgerStatsSnapshot } from './ledger.stats';
import type { LedgerRecord } from '@/types/ledger';
import type { LedgerBudgetProgressSummary } from '@/types/ledger';
import type { LedgerBudgetSummaryCopy } from '@/lib/ledger-tools';
import { LedgerStatsPanel } from './LedgerStatsPanel';
import { LedgerRecentRecordsList } from './LedgerRecentRecordsList';
import styles from './LedgerHomeView.module.css';

interface LedgerHomeViewProps {
  stats: LedgerStatsSnapshot;
  budgetProgress: LedgerBudgetProgressSummary;
  budgetSummaryCopy: LedgerBudgetSummaryCopy;
  onOpenDrawer: () => void;
  onOpenBudget: () => void;
  onOpenDraftImport: () => void;
  onEditRecord: (record: LedgerRecord) => void;
  onDeleteRecord: (record: LedgerRecord) => void;
  onOpenRecords: () => void;
}

export function LedgerHomeView({
  stats,
  budgetProgress,
  budgetSummaryCopy,
  onOpenDrawer,
  onOpenBudget,
  onOpenDraftImport,
  onEditRecord,
  onDeleteRecord,
  onOpenRecords,
}: LedgerHomeViewProps) {
  const recentRecords = stats.recentRecords.slice(0, 3);

  return (
    <section className={styles.view}>
      <LedgerStatsPanel
        todayExpense={stats.todayExpense}
        monthExpense={stats.monthExpense}
        budgetProgress={budgetProgress}
        budgetSummaryCopy={budgetSummaryCopy}
        onOpenRecords={onOpenRecords}
        onOpenBudget={onOpenBudget}
        onOpenDraftImport={onOpenDraftImport}
      />

      <div className={styles.actions}>
        <button className={styles.primaryAction} type="button" onClick={onOpenDrawer}>
          + 记一笔
        </button>
      </div>

      <LedgerRecentRecordsList
        records={recentRecords}
        heading="最近 3 条"
        emptyHeading="暂无记录"
        emptyCopy=""
        density="compact"
        surface="preview"
        onOpenRecords={onOpenRecords}
        onEditRecord={onEditRecord}
        onDeleteRecord={onDeleteRecord}
      />
    </section>
  );
}

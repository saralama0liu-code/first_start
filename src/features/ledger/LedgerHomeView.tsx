import type { LedgerStatsSnapshot } from './ledger.stats';
import type { LedgerRecord } from '@/types/ledger';
import { LedgerStatsPanel } from './LedgerStatsPanel';
import { LedgerRecentRecordsList } from './LedgerRecentRecordsList';
import styles from './LedgerHomeView.module.css';

interface LedgerHomeViewProps {
  stats: LedgerStatsSnapshot;
  onOpenDrawer: () => void;
  onEditRecord: (record: LedgerRecord) => void;
  onDeleteRecord: (record: LedgerRecord) => void;
  onOpenRecords: () => void;
}

export function LedgerHomeView({
  stats,
  onOpenDrawer,
  onEditRecord,
  onDeleteRecord,
  onOpenRecords,
}: LedgerHomeViewProps) {
  return (
    <section className={styles.view}>
      <LedgerStatsPanel
        todayExpense={stats.todayExpense}
        monthExpense={stats.monthExpense}
        hasRecords={stats.allRecords.length > 0}
      />

      <div className={styles.actions}>
        <button className={styles.primaryAction} type="button" onClick={onOpenDrawer}>
          + 记一笔
        </button>
        <button className={styles.secondaryAction} type="button" onClick={onOpenRecords}>
          查看全部记录
        </button>
      </div>

      <LedgerRecentRecordsList
        records={stats.recentRecords}
        onEditRecord={onEditRecord}
        onDeleteRecord={onDeleteRecord}
      />
    </section>
  );
}

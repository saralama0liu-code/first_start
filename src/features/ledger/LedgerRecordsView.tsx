import type { LedgerRecord } from '@/types/ledger';
import { LedgerRecentRecordsList } from './LedgerRecentRecordsList';

import styles from './LedgerRecordsView.module.css';

interface LedgerRecordsViewProps {
  records: LedgerRecord[];
  onBackToHome: () => void;
  onOpenDrawer: () => void;
  onEditRecord: (record: LedgerRecord) => void;
  onDeleteRecord: (record: LedgerRecord) => void;
}

export function LedgerRecordsView({
  records,
  onBackToHome,
  onOpenDrawer,
  onEditRecord,
  onDeleteRecord,
}: LedgerRecordsViewProps) {
  return (
    <section className={styles.view}>
      <div className={styles.topBar}>
        <button className={styles.secondaryAction} type="button" onClick={onBackToHome}>
          返回首页
        </button>
        <button className={styles.primaryAction} type="button" onClick={onOpenDrawer}>
          记一笔
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardRow}>
          <p className={styles.cardLabel}>当前记录数</p>
          <strong className={styles.cardValue}>{records.length}</strong>
        </div>
      </div>

      <LedgerRecentRecordsList
        records={records}
        title="全部记录"
        heading=""
        emptyHeading="暂无记录"
        emptyCopy="先记一笔"
        density="compact"
        surface="full"
        onEditRecord={onEditRecord}
        onDeleteRecord={onDeleteRecord}
      />
    </section>
  );
}

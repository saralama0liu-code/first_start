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
      <div className={styles.header}>
        <p className={styles.label}>全部记录</p>
        <h2 className={styles.heading}>全量记录视图已经连通。</h2>
        <p className={styles.copy}>这里直接展示全部记录列表，方便继续完成编辑和删除流程。</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.secondaryAction} type="button" onClick={onBackToHome}>
          返回首页
        </button>
        <button className={styles.primaryAction} type="button" onClick={onOpenDrawer}>
          + 记一笔
        </button>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>当前记录数</p>
        <strong className={styles.cardValue}>{records.length}</strong>
        <span className={styles.cardHint}>下方列表会直接展示全部记录，并支持编辑和删除。</span>
      </div>

      <LedgerRecentRecordsList
        records={records}
        title="全部记录"
        heading="按时间倒序展示全部记录。"
        emptyHeading="还没有任何记录。"
        emptyCopy="新增记录后，这里会显示所有账单，并保持按时间倒序排列。"
        onEditRecord={onEditRecord}
        onDeleteRecord={onDeleteRecord}
      />
    </section>
  );
}

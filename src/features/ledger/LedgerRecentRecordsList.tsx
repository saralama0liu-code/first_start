import type { LedgerRecord } from '@/types/ledger';
import { formatLedgerTime, formatPlainAmount } from '@/lib';

import styles from './LedgerRecentRecordsList.module.css';

interface LedgerRecentRecordsListProps {
  records: LedgerRecord[];
  title?: string;
  heading?: string;
  emptyHeading?: string;
  emptyCopy?: string;
  onEditRecord: (record: LedgerRecord) => void;
  onDeleteRecord: (record: LedgerRecord) => void;
}

export function LedgerRecentRecordsList({
  records,
  title = '最近记录',
  heading = '按时间倒序展示最近 20 条。',
  emptyHeading = '还没有记录，先记第一笔吧。',
  emptyCopy = '新增记录后，这里会按时间倒序展示最近 20 条。',
  onEditRecord,
  onDeleteRecord,
}: LedgerRecentRecordsListProps) {
  if (records.length === 0) {
    return (
      <section className={styles.emptyState} aria-label={title}>
        <p className={styles.label}>{title}</p>
        <h3 className={styles.heading}>{emptyHeading}</h3>
        <p className={styles.copy}>{emptyCopy}</p>
      </section>
    );
  }

  return (
    <section className={styles.listSection} aria-label={title}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.label}>{title}</p>
          <h3 className={styles.heading}>{heading}</h3>
        </div>
        <span className={styles.count}>{records.length}</span>
      </div>

      <ul className={styles.list}>
        {records.map((record) => (
          <li key={record.id} className={styles.item}>
            <div className={styles.itemRow}>
              <button
                className={styles.itemButton}
                type="button"
                onClick={() => onEditRecord(record)}
                aria-label={`编辑记录：${record.category}，${formatPlainAmount(record.amount)} 元`}
              >
                <div className={styles.itemTop}>
                  <strong className={styles.amount}>
                    {record.type === 'expense' ? '-' : '+'}
                    {formatPlainAmount(record.amount)}
                  </strong>
                  <span className={styles.meta}>
                    {record.category} · {record.payment}
                  </span>
                  <span className={styles.actionHint}>点击编辑</span>
                </div>

                <div className={styles.itemBottom}>
                  <span className={styles.time}>{formatLedgerTime(record.time)}</span>
                  {record.note ? <span className={styles.note}>{record.note}</span> : null}
                </div>
              </button>

              <details className={styles.moreMenu}>
                <summary className={styles.moreTrigger} aria-label={`更多操作：${record.category}`}>
                  更多
                </summary>
                <div className={styles.morePanel}>
                  <button
                    className={styles.deleteButton}
                    type="button"
                    onClick={() => onDeleteRecord(record)}
                  >
                    删除
                  </button>
                </div>
              </details>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

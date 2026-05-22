import type { LedgerRecord } from '@/types/ledger';
import { formatLedgerTime, formatPlainAmount } from '@/lib';

import styles from './LedgerRecentRecordsList.module.css';

interface LedgerRecentRecordsListProps {
  records: LedgerRecord[];
  title?: string;
  heading?: string;
  emptyHeading?: string;
  emptyCopy?: string;
  density?: 'default' | 'compact';
  surface?: 'preview' | 'full';
  onOpenRecords?: () => void;
  onEditRecord: (record: LedgerRecord) => void;
  onDeleteRecord: (record: LedgerRecord) => void;
}

export function LedgerRecentRecordsList({
  records,
  title = '最近记录',
  heading = '最近 20 条',
  emptyHeading = '暂无记录',
  emptyCopy = '先记一笔',
  density = 'default',
  surface = 'full',
  onOpenRecords,
  onEditRecord,
  onDeleteRecord,
}: LedgerRecentRecordsListProps) {
  const headingNode = heading ? <h3 className={styles.heading}>{heading}</h3> : null;
  const isPreviewSurface = surface === 'preview';

  if (records.length === 0) {
    return (
      <section
        className={styles.emptyState}
        data-density={density}
        data-surface={surface}
        aria-label={title}
      >
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.label}>{title}</p>
            {headingNode}
          </div>
          {onOpenRecords ? (
            <details className={styles.sectionMoreMenu}>
              <summary className={styles.sectionMoreTrigger} aria-label="最近记录更多操作">
                更多
              </summary>
              <div className={styles.sectionMorePanel}>
                <button className={styles.sectionMoreButton} type="button" onClick={onOpenRecords}>
                  查看全部记录
                </button>
              </div>
            </details>
          ) : null}
        </div>
        <div className={styles.bodyArea}>
          <div className={styles.emptyBody}>
            <h3 className={styles.emptyHeading}>{emptyHeading}</h3>
            {emptyCopy ? <p className={styles.copy}>{emptyCopy}</p> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.listSection}
      data-density={density}
      data-surface={surface}
      aria-label={title}
    >
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.label}>{title}</p>
          {headingNode}
        </div>
        <div className={styles.sectionActions}>
          <span className={styles.count}>{records.length}</span>
          {onOpenRecords ? (
            <details className={styles.sectionMoreMenu}>
              <summary className={styles.sectionMoreTrigger} aria-label="最近记录更多操作">
                更多
              </summary>
              <div className={styles.sectionMorePanel}>
                <button className={styles.sectionMoreButton} type="button" onClick={onOpenRecords}>
                  查看全部记录
                </button>
              </div>
            </details>
          ) : null}
        </div>
      </div>

      <div className={styles.bodyArea}>
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
                    {isPreviewSurface ? null : <span className={styles.actionHint}>点击编辑</span>}
                  </div>

                  <div className={styles.itemBottom}>
                    <span className={styles.time}>{formatLedgerTime(record.time)}</span>
                    {!isPreviewSurface && record.note ? <span className={styles.note}>{record.note}</span> : null}
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
      </div>
    </section>
  );
}

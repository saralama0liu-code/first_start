import { formatRmbAmount } from '@/lib/format';

import styles from './LedgerStatsPanel.module.css';

interface LedgerStatsPanelProps {
  todayExpense: number;
  monthExpense: number;
  hasRecords: boolean;
}

export function LedgerStatsPanel({
  todayExpense,
  monthExpense,
  hasRecords,
}: LedgerStatsPanelProps) {
  return (
    <section className={styles.panel} aria-label="首页统计">
      <div className={styles.header}>
        <p className={styles.label}>顶部统计区</p>
        <h2 className={styles.title}>先看今天和本月花了多少。</h2>
        <p className={styles.copy}>
          第 10 步先把首页统计区接通，后面会继续把它和真实账本数据绑定起来。
        </p>
      </div>

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

      <div className={styles.status}>
        <p className={styles.statusLabel}>数据状态</p>
        <span className={styles.statusValue}>
          {hasRecords ? '已有记录，统计会随着数据变化而刷新' : '还没有记录，开始记第一笔吧'}
        </span>
      </div>
    </section>
  );
}

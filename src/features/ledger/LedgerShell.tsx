import { useEffect, useState } from 'react';

import { calculateLedgerStats } from './ledger.stats';
import { ledgerStore } from './ledger.store';
import { LedgerDrawer } from './LedgerDrawer';
import { LedgerHomeView } from './LedgerHomeView';
import { LedgerRecordsView } from './LedgerRecordsView';
import styles from './LedgerShell.module.css';
import type { FormMode, LedgerRecord } from '@/types/ledger';

type LedgerView = 'home' | 'records';

interface LedgerDrawerState {
  isOpen: boolean;
  mode: FormMode;
  record: LedgerRecord | null;
}

export function LedgerShell() {
  const [view, setView] = useState<LedgerView>('home');
  const [drawerState, setDrawerState] = useState<LedgerDrawerState>({
    isOpen: false,
    mode: 'create',
    record: null,
  });
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const [ledgerSnapshot, setLedgerSnapshot] = useState(() => ledgerStore.getSnapshot());

  useEffect(() => ledgerStore.subscribe(setLedgerSnapshot), []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const records = ledgerSnapshot.records;
  const stats = calculateLedgerStats(records);
  const storageAlert = ledgerSnapshot.storageMessage;
  const isStorageUnavailable = ledgerSnapshot.storageIssue === 'unavailable';

  const openCreateDrawer = () => {
    if (isStorageUnavailable) {
      setNotice({
        message: '当前环境不支持本地存储，无法使用',
        tone: 'error',
      });
      return;
    }

    setDrawerState({
      isOpen: true,
      mode: 'create',
      record: null,
    });
  };

  const openEditDrawer = (record: LedgerRecord) => {
    if (isStorageUnavailable) {
      setNotice({
        message: '当前环境不支持本地存储，无法使用',
        tone: 'error',
      });
      return;
    }

    setDrawerState({
      isOpen: true,
      mode: 'edit',
      record,
    });
  };

  const handleDeleteRecord = (record: LedgerRecord) => {
    if (isStorageUnavailable) {
      setNotice({
        message: '当前环境不支持本地存储，无法使用',
        tone: 'error',
      });
      return false;
    }

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`确定删除这条记录吗？\n${record.category} · ${record.amount}`);

      if (!confirmed) {
        return false;
      }
    }

    const removed = ledgerStore.removeRecord(record.id);

    setNotice({
      message: removed ? '已删除' : '删除失败',
      tone: removed ? 'success' : 'error',
    });

    return removed;
  };

  const closeDrawer = () => {
    setDrawerState((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  const handleSubmitRecord = (nextRecord: LedgerRecord) => {
    if (drawerState.mode === 'edit' && drawerState.record) {
      return ledgerStore.updateRecord(drawerState.record.id, nextRecord);
    }

    return ledgerStore.addRecord(nextRecord);
  };

  return (
    <main className={styles.shell}>
      {notice ? (
        <div
          className={notice.tone === 'success' ? styles.noticeToastSuccess : styles.noticeToastError}
          role="status"
          aria-live="polite"
        >
          {notice.message}
        </div>
      ) : null}

      <section className={styles.frame}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Quick Ledger</p>
            <h1 className={styles.title}>超快记账工具</h1>
          </div>

          <div className={styles.headerActions} role="tablist" aria-label="页面切换">
            <button
              className={view === 'home' ? styles.tabActive : styles.tab}
              type="button"
              onClick={() => setView('home')}
            >
              首页
            </button>
            <button
              className={view === 'records' ? styles.tabActive : styles.tab}
              type="button"
              onClick={() => setView('records')}
            >
              全部记录
            </button>
          </div>
        </header>

        <section className={styles.content}>
          {storageAlert ? (
            <div className={styles.storageAlert} role="alert" aria-live="polite">
              {storageAlert}
            </div>
          ) : null}

          {view === 'home' ? (
            <LedgerHomeView
              stats={stats}
              onOpenDrawer={openCreateDrawer}
              onEditRecord={openEditDrawer}
              onDeleteRecord={handleDeleteRecord}
              onOpenRecords={() => setView('records')}
            />
          ) : (
            <LedgerRecordsView
              records={records}
              onBackToHome={() => setView('home')}
              onOpenDrawer={openCreateDrawer}
              onEditRecord={openEditDrawer}
              onDeleteRecord={handleDeleteRecord}
            />
          )}
        </section>
      </section>

      <LedgerDrawer
        isOpen={drawerState.isOpen}
        mode={drawerState.mode}
        record={drawerState.record}
        onClose={closeDrawer}
        onSubmitRecord={handleSubmitRecord}
      />
    </main>
  );
}

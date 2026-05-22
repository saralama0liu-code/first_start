import { useEffect, useState } from 'react';

import { calculateLedgerStats } from './ledger.stats';
import { ledgerStore } from './ledger.store';
import { LedgerDrawer } from './LedgerDrawer';
import { LedgerBudgetView } from './LedgerBudgetView';
import { LedgerImportDraftView } from './LedgerImportDraftView';
import { LedgerHomeView } from './LedgerHomeView';
import { LedgerRecordsView } from './LedgerRecordsView';
import {
  createSampleLedgerImportDraft,
  readLedgerImportDraftFromLocation,
} from './ledger.import-draft';
import styles from './LedgerShell.module.css';
import type {
  FormMode,
  LedgerBudgetSettings,
  LedgerImportDraft,
  LedgerRecord,
} from '@/types/ledger';

type LedgerView = 'home' | 'records' | 'budget' | 'draft';

interface LedgerDrawerState {
  isOpen: boolean;
  mode: FormMode;
  record: LedgerRecord | null;
}

export function LedgerShell() {
  const [initialDraft] = useState<LedgerImportDraft | null>(() => readLedgerImportDraftFromLocation());
  const [view, setView] = useState<LedgerView>(initialDraft ? 'draft' : 'home');
  const [draft, setDraft] = useState<LedgerImportDraft | null>(initialDraft);
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
        message: '当前环境不支持本地保存',
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
        message: '当前环境不支持本地保存',
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
        message: '当前环境不支持本地保存',
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

  const handleSaveBudgetSettings = (nextSettings: LedgerBudgetSettings) => {
    if (isStorageUnavailable) {
      setNotice({
        message: '当前环境不支持本地保存',
        tone: 'error',
      });
      return false;
    }

    const saved = ledgerStore.updateBudgetSettings(nextSettings);

    setNotice({
      message: saved ? '预算已保存' : '预算保存失败',
      tone: saved ? 'success' : 'error',
    });

    return saved;
  };

  const openImportDraft = (nextDraft: LedgerImportDraft = createSampleLedgerImportDraft()) => {
    if (isStorageUnavailable) {
      setNotice({
        message: '当前环境不支持本地保存',
        tone: 'error',
      });
      return;
    }

    setDraft(nextDraft);
    setView('draft');
  };

  const handleConfirmDraft = (nextRecord: LedgerRecord) => {
    if (isStorageUnavailable) {
      setNotice({
        message: '当前环境不支持本地保存',
        tone: 'error',
      });
      return false;
    }

    const saved = ledgerStore.addRecord(nextRecord);

    setNotice({
      message: saved ? '草稿已保存' : '草稿保存失败',
      tone: saved ? 'success' : 'error',
    });

    if (saved) {
      setDraft(null);
      setView('home');
    }

    return saved;
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
              budgetProgress={ledgerSnapshot.budgetProgress}
              budgetSummaryCopy={ledgerSnapshot.budgetSummaryCopy}
              onOpenDrawer={openCreateDrawer}
              onOpenBudget={() => setView('budget')}
              onOpenDraftImport={() => openImportDraft()}
              onEditRecord={openEditDrawer}
              onDeleteRecord={handleDeleteRecord}
              onOpenRecords={() => setView('records')}
            />
          ) : view === 'records' ? (
            <LedgerRecordsView
              records={records}
              onBackToHome={() => setView('home')}
              onOpenDrawer={openCreateDrawer}
              onEditRecord={openEditDrawer}
              onDeleteRecord={handleDeleteRecord}
            />
          ) : view === 'budget' ? (
            <LedgerBudgetView
              budgetSettings={ledgerSnapshot.budgetSettings}
              budgetProgress={ledgerSnapshot.budgetProgress}
              budgetSummaryCopy={ledgerSnapshot.budgetSummaryCopy}
              categoryBudgetSummaries={ledgerSnapshot.categoryBudgetSummaries}
              onBackToHome={() => setView('home')}
              onOpenRecords={() => setView('records')}
              onSaveBudgetSettings={handleSaveBudgetSettings}
            />
          ) : (
            <LedgerImportDraftView
              draft={draft}
              onBackToHome={() => setView('home')}
              onOpenManualDrawer={openCreateDrawer}
              onConfirmDraft={handleConfirmDraft}
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

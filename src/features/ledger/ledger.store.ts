import {
  canUseLedgerStorage,
  readLedgerBudgetSettings,
  readLedgerRecords,
  writeLedgerBudgetSettings,
  writeLedgerRecords,
} from '@/lib/storage-service';
import {
  buildLedgerBudgetSummaryCopy,
  buildLedgerCategoryBudgetSummaries,
  calculateLedgerBudgetProgress,
  calculateLedgerMonthlyExpenseByCategory,
  type LedgerCategoryBudgetSummary,
} from '@/lib/ledger-tools';
import { ledgerBudgetSettingsSchema } from './ledger.schema';
import type { StorageLike } from '@/lib/storage';
import type {
  LedgerBudgetProgressSummary,
  LedgerBudgetSettings,
  LedgerRecord,
} from '@/types/ledger';

export interface LedgerStoreSnapshot {
  records: LedgerRecord[];
  budgetSettings: LedgerBudgetSettings;
  budgetProgress: LedgerBudgetProgressSummary;
  categoryBudgetSummaries: LedgerCategoryBudgetSummary[];
  budgetSummaryCopy: {
    headline: string;
    detail: string;
  };
  hydrated: boolean;
  storageAvailable: boolean;
  storageIssue: 'unavailable' | 'invalid-data' | 'read-failed' | null;
  storageMessage: string | null;
  revision: number;
  lastUpdatedAt: string | null;
}

export interface LedgerStore {
  hydrate: () => LedgerStoreSnapshot;
  getSnapshot: () => LedgerStoreSnapshot;
  getAllRecords: () => LedgerRecord[];
  getRecentRecords: (limit?: number) => LedgerRecord[];
  getRecordById: (recordId: string) => LedgerRecord | undefined;
  addRecord: (record: LedgerRecord) => boolean;
  updateRecord: (recordId: string, nextRecord: LedgerRecord) => boolean;
  removeRecord: (recordId: string) => boolean;
  updateBudgetSettings: (nextSettings: LedgerBudgetSettings) => boolean;
  subscribe: (listener: (snapshot: LedgerStoreSnapshot) => void) => () => void;
}

export function createLedgerStore(storage: StorageLike | undefined = getDefaultStorage()): LedgerStore {
  let state = createInitialState();
  const listeners = new Set<(snapshot: LedgerStoreSnapshot) => void>();

  function hydrate(): LedgerStoreSnapshot {
    const storageResult = readLedgerRecords(storage);
    const budgetSettingsResult = readLedgerBudgetSettings(storage);
    const referenceDate = new Date();

    state.storageAvailable = canUseLedgerStorage(storage);
    state.records = state.storageAvailable ? sortByNewest(storageResult.records) : [];
    state.storageIssue = storageResult.issue;
    state.storageMessage = storageResult.message;
    state.budgetSettings = budgetSettingsResult.settings;
    refreshDerivedBudgetState(state, referenceDate);
    state.hydrated = true;
    state.revision += 1;
    state.lastUpdatedAt = new Date().toISOString();
    emit();
    return getSnapshot();
  }

  function getSnapshot(): LedgerStoreSnapshot {
    if (!state.hydrated) {
      hydrate();
    }

    return cloneSnapshot(state);
  }

  function getAllRecords(): LedgerRecord[] {
    return getSnapshot().records;
  }

  function getRecentRecords(limit = 20): LedgerRecord[] {
    return getSnapshot().records.slice(0, limit);
  }

  function getRecordById(recordId: string): LedgerRecord | undefined {
    return getSnapshot().records.find((record) => record.id === recordId);
  }

  function addRecord(record: LedgerRecord): boolean {
    ensureHydrated();

    if (state.records.some((existing) => existing.id === record.id)) {
      return false;
    }

    return persistRecords([...state.records, record]);
  }

  function updateRecord(recordId: string, nextRecord: LedgerRecord): boolean {
    ensureHydrated();

    const index = state.records.findIndex((record) => record.id === recordId);

    if (index < 0) {
      return false;
    }

    const nextRecords = [...state.records];
    nextRecords[index] = nextRecord;

    return persistRecords(nextRecords);
  }

  function removeRecord(recordId: string): boolean {
    ensureHydrated();

    const nextRecords = state.records.filter((record) => record.id !== recordId);

    if (nextRecords.length === state.records.length) {
      return false;
    }

    return persistRecords(nextRecords);
  }

  function updateBudgetSettings(nextSettings: LedgerBudgetSettings): boolean {
    ensureHydrated();

    const parsed = ledgerBudgetSettingsSchema.safeParse(nextSettings);

    if (!parsed.success) {
      return false;
    }

    return persistBudgetSettings(parsed.data);
  }

  function subscribe(listener: (snapshot: LedgerStoreSnapshot) => void): () => void {
    listeners.add(listener);

    if (state.hydrated) {
      listener(getSnapshot());
    } else {
      hydrate();
    }

    return () => {
      listeners.delete(listener);
    };
  }

  function ensureHydrated() {
    if (!state.hydrated) {
      hydrate();
    }
  }

function persistRecords(nextRecords: LedgerRecord[]): boolean {
  const sortedRecords = sortByNewest(nextRecords);

    if (!state.storageAvailable) {
      state.storageAvailable = canUseLedgerStorage(storage);
    }

    if (!state.storageAvailable) {
      return false;
    }

    const persisted = writeLedgerRecords(sortedRecords, storage);

    if (!persisted) {
      state.storageAvailable = false;
      state.storageIssue = 'unavailable';
      state.storageMessage = '当前环境不支持本地保存';
      return false;
    }

    state.records = sortedRecords;
    state.storageIssue = null;
    state.storageMessage = null;
    refreshDerivedBudgetState(state);
    state.hydrated = true;
    state.revision += 1;
    state.lastUpdatedAt = new Date().toISOString();
  emit();
  return true;
}

function persistBudgetSettings(nextSettings: LedgerBudgetSettings): boolean {
  if (!state.storageAvailable) {
    state.storageAvailable = canUseLedgerStorage(storage);
  }

  if (!state.storageAvailable) {
    return false;
  }

  const persisted = writeLedgerBudgetSettings(nextSettings, storage);

  if (!persisted) {
    state.storageAvailable = false;
    state.storageIssue = 'unavailable';
    state.storageMessage = '当前环境不支持本地保存';
    return false;
  }

  state.budgetSettings = nextSettings;
  state.storageIssue = null;
  state.storageMessage = null;
  refreshDerivedBudgetState(state);
  state.hydrated = true;
  state.revision += 1;
  state.lastUpdatedAt = new Date().toISOString();
  emit();
  return true;
}

  function emit() {
    const snapshot = cloneSnapshot(state);

    for (const listener of listeners) {
      listener(snapshot);
    }
  }

  return {
    hydrate,
    getSnapshot,
    getAllRecords,
    getRecentRecords,
    getRecordById,
    addRecord,
    updateRecord,
    removeRecord,
    updateBudgetSettings,
    subscribe,
  };
}

export const ledgerStore = createLedgerStore();

function createInitialState(): LedgerStoreSnapshot {
  return {
    records: [],
    budgetSettings: {
      monthlyBudget: null,
      categoryBudgets: {},
    },
    budgetProgress: {
      monthlyBudget: null,
      monthlyExpense: 0,
      remainingBudget: null,
      overspentAmount: null,
      usageRatio: null,
      status: 'unset',
    },
    categoryBudgetSummaries: [],
    budgetSummaryCopy: {
      headline: '去设置预算',
      detail: '设置后再看本月进度',
    },
    hydrated: false,
    storageAvailable: false,
    storageIssue: null,
    storageMessage: null,
    revision: 0,
    lastUpdatedAt: null,
  };
}

function cloneSnapshot(state: LedgerStoreSnapshot): LedgerStoreSnapshot {
  return {
    ...state,
    records: [...state.records],
    budgetSettings: {
      monthlyBudget: state.budgetSettings.monthlyBudget,
      categoryBudgets: { ...state.budgetSettings.categoryBudgets },
    },
    budgetProgress: {
      ...state.budgetProgress,
    },
    categoryBudgetSummaries: state.categoryBudgetSummaries.map((summary) => ({
      ...summary,
    })),
    budgetSummaryCopy: {
      ...state.budgetSummaryCopy,
    },
  };
}

function sortByNewest(records: LedgerRecord[]): LedgerRecord[] {
  return [...records].sort((left, right) => {
    const timeComparison = right.time.localeCompare(left.time);

    if (timeComparison !== 0) {
      return timeComparison;
    }

    return right.id.localeCompare(left.id);
  });
}

function getDefaultStorage(): StorageLike | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}

function refreshDerivedBudgetState(state: LedgerStoreSnapshot, referenceDate = new Date()): void {
  const monthlyExpense = calculateMonthlyExpense(state.records, referenceDate);
  state.budgetProgress = calculateLedgerBudgetProgress(state.budgetSettings.monthlyBudget, monthlyExpense);
  state.categoryBudgetSummaries = buildLedgerCategoryBudgetSummaries(
    state.records,
    state.budgetSettings,
    referenceDate,
  );
  state.budgetSummaryCopy = buildLedgerBudgetSummaryCopy(state.budgetProgress);
}

function calculateMonthlyExpense(records: LedgerRecord[], referenceDate: Date): number {
  return Object.values(calculateLedgerMonthlyExpenseByCategory(records, referenceDate)).reduce(
    (total, amount) => total + amount,
    0,
  );
}

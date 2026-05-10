import { isWithinMonthBoundary, isWithinTodayBoundary } from '@/lib/date';
import type { LedgerRecord } from '@/types/ledger';

export interface LedgerStatsSnapshot {
  todayExpense: number;
  monthExpense: number;
  recentRecords: LedgerRecord[];
  allRecords: LedgerRecord[];
}

export function calculateLedgerStats(
  records: LedgerRecord[],
  referenceDate: Date = new Date(),
): LedgerStatsSnapshot {
  const sortedRecords = sortByNewest(records);

  return {
    todayExpense: sumExpense(records.filter((record) => isWithinTodayBoundary(record.time, referenceDate))),
    monthExpense: sumExpense(records.filter((record) => isWithinMonthBoundary(record.time, referenceDate))),
    recentRecords: sortedRecords.slice(0, 20),
    allRecords: sortedRecords,
  };
}

export function sumExpense(records: LedgerRecord[]): number {
  return records
    .filter((record) => record.type === 'expense')
    .reduce((total, record) => total + record.amount, 0);
}

export function getRecentLedgerRecords(records: LedgerRecord[], limit = 20): LedgerRecord[] {
  return sortByNewest(records).slice(0, limit);
}

export function getLedgerRecordsSortedByNewest(records: LedgerRecord[]): LedgerRecord[] {
  return sortByNewest(records);
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


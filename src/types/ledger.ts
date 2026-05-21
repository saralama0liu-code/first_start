import {
  FORM_MODES,
  LEDGER_BUDGET_PROGRESS_STATUSES,
  LEDGER_CATEGORIES,
  LEDGER_DRAFT_SOURCES,
  LEDGER_ENTRY_TYPES,
  LEDGER_MORE_MENU_ACTIONS,
  PAYMENT_METHODS,
} from '@/features/ledger/ledger.constants';

export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];

export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type FormMode = (typeof FORM_MODES)[number];

export type LedgerBudgetStatus = (typeof LEDGER_BUDGET_PROGRESS_STATUSES)[number];

export type LedgerDraftSource = (typeof LEDGER_DRAFT_SOURCES)[number];

export type LedgerMoreMenuAction = (typeof LEDGER_MORE_MENU_ACTIONS)[number];

export interface LedgerRecord {
  id: string;
  type: LedgerEntryType;
  amount: number;
  category: LedgerCategory;
  payment: PaymentMethod;
  time: string;
  note: string;
}

export type LedgerCategoryBudgetMap = Partial<Record<LedgerCategory, number>>;

export interface LedgerBudgetSettings {
  monthlyBudget: number | null;
  categoryBudgets: LedgerCategoryBudgetMap;
}

export interface LedgerBudgetProgressSummary {
  monthlyBudget: number | null;
  monthlyExpense: number;
  remainingBudget: number | null;
  overspentAmount: number | null;
  usageRatio: number | null;
  status: LedgerBudgetStatus;
}

export interface LedgerCategoryBudget {
  category: LedgerCategory;
  amount: number;
}

export interface LedgerImportDraft {
  source: LedgerDraftSource;
  amount: number | null;
  merchant: string | null;
  time: string | null;
  category: LedgerCategory | null;
  payment: PaymentMethod | null;
  note: string | null;
}

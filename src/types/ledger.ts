import {
  FORM_MODES,
  LEDGER_CATEGORIES,
  LEDGER_ENTRY_TYPES,
  PAYMENT_METHODS,
} from '@/features/ledger/ledger.constants';

export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];

export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type FormMode = (typeof FORM_MODES)[number];

export interface LedgerRecord {
  id: string;
  type: LedgerEntryType;
  amount: number;
  category: LedgerCategory;
  payment: PaymentMethod;
  time: string;
  note: string;
}

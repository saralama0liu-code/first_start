import { z } from 'zod';

import { ledgerRecordSchema } from '@/features/ledger/ledger.schema';
import { formatPlainAmount } from '@/lib/format';
import { getCurrentIsoTime } from '@/lib/date';
import type { FormMode, LedgerCategory, LedgerEntryType, PaymentMethod, LedgerRecord } from '@/types/ledger';

import { LEDGER_AMOUNT_MAX_DECIMALS, LEDGER_CATEGORIES, PAYMENT_METHODS } from './ledger.constants';

export interface LedgerFormPreferences {
  category: LedgerCategory;
  payment: PaymentMethod;
}

export interface LedgerDrawerFormState {
  type: LedgerEntryType;
  amount: string;
  category: LedgerCategory;
  payment: PaymentMethod;
  time: string;
  note: string;
  showTimeEditor: boolean;
}

export interface LedgerFormErrors {
  type?: string;
  amount?: string;
  category?: string;
  payment?: string;
  time?: string;
  note?: string;
}

const ledgerRecordIdSchema = z.string().min(1);

export function getDefaultLedgerFormPreferences(): LedgerFormPreferences {
  return {
    category: LEDGER_CATEGORIES[0],
    payment: PAYMENT_METHODS[0],
  };
}

export function createLedgerDrawerFormState(
  mode: FormMode,
  record: LedgerRecord | null = null,
  preferences: LedgerFormPreferences = getDefaultLedgerFormPreferences(),
  referenceDate = new Date(),
): LedgerDrawerFormState {
  if (mode === 'edit' && record) {
    return {
      type: record.type,
      amount: formatPlainAmount(record.amount),
      category: record.category,
      payment: record.payment,
      time: record.time,
      note: record.note,
      showTimeEditor: false,
    };
  }

  return {
    type: 'expense',
    amount: '',
    category: preferences.category,
    payment: preferences.payment,
    time: getCurrentIsoTime(referenceDate),
    note: '',
    showTimeEditor: false,
  };
}

export function normalizeLedgerAmountInput(value: string): string {
  const sanitized = value.replace(/[^\d.]/g, '');

  if (!sanitized) {
    return '';
  }

  const hasLeadingDecimalPoint = sanitized.startsWith('.');
  const [integerPart = '', ...fractionParts] = sanitized.split('.');
  const normalizedInteger = hasLeadingDecimalPoint
    ? '0'
    : integerPart.replace(/^0+(?=\d)/, '') || integerPart || '';
  const normalizedFraction = fractionParts.join('').replace(/\./g, '').slice(0, LEDGER_AMOUNT_MAX_DECIMALS);

  if (!sanitized.includes('.')) {
    return normalizedInteger;
  }

  return `${normalizedInteger || '0'}.${normalizedFraction}`;
}

export function createLedgerRecordFromDrawerState(
  formState: LedgerDrawerFormState,
  mode: FormMode,
  recordId = createLedgerRecordId(),
): LedgerRecord | null {
  const amount = Number.parseFloat(formState.amount);

  if (!Number.isFinite(amount)) {
    return null;
  }

  const parsed = ledgerRecordSchema.safeParse({
    id: mode === 'edit' ? recordId : recordIdSchemaParse(recordId),
    type: formState.type,
    amount,
    category: formState.category,
    payment: formState.payment,
    time: formState.time,
    note: formState.note,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function validateLedgerDrawerFormState(formState: LedgerDrawerFormState): LedgerFormErrors {
  const errors: LedgerFormErrors = {};

  if (!formState.amount.trim()) {
    errors.amount = '金额不能为空';
  } else if (Number.parseFloat(formState.amount) <= 0) {
    errors.amount = '金额必须大于 0';
  }

  if (!LEDGER_CATEGORIES.includes(formState.category)) {
    errors.category = '请选择有效分类';
  }

  if (!PAYMENT_METHODS.includes(formState.payment)) {
    errors.payment = '请选择有效支付方式';
  }

  if (!formState.time.trim()) {
    errors.time = '时间不能为空';
  }

  if (formState.note.length > 50) {
    errors.note = '备注不能超过 50 个字符';
  }

  return errors;
}

function createLedgerRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function recordIdSchemaParse(recordId: string): string {
  const parsed = ledgerRecordIdSchema.safeParse(recordId);
  return parsed.success ? parsed.data : createLedgerRecordId();
}

import { formatPlainAmount } from '@/lib/format';
import { formatIsoTimeForDateTimeLocal, parseDateTimeLocalToIso } from '@/lib/date';
import {
  LEDGER_CATEGORIES,
  PAYMENT_METHODS,
} from './ledger.constants';
import { ledgerRecordSchema } from './ledger.schema';
import type {
  LedgerCategory,
  LedgerDraftSource,
  LedgerImportDraft,
  LedgerRecord,
  PaymentMethod,
} from '@/types/ledger';

export interface LedgerImportDraftFormState {
  source: LedgerDraftSource;
  amount: string;
  merchant: string;
  time: string;
  category: LedgerCategory | '';
  payment: PaymentMethod | '';
  note: string;
}

export interface LedgerImportDraftFormErrors {
  amount?: string;
  merchant?: string;
  time?: string;
  category?: string;
  payment?: string;
  note?: string;
}

export function normalizeLedgerImportDraft(
  draft: Partial<LedgerImportDraft> | null | undefined,
): LedgerImportDraft {
  return {
    source: draft?.source ?? 'shortcut',
    amount: typeof draft?.amount === 'number' && Number.isFinite(draft.amount) ? draft.amount : null,
    merchant: normalizeDraftText(draft?.merchant),
    time: normalizeDraftText(draft?.time),
    category: isLedgerCategory(draft?.category) ? draft.category : null,
    payment: isPaymentMethod(draft?.payment) ? draft.payment : null,
    note: normalizeDraftText(draft?.note),
  };
}

export function createLedgerImportDraftFormState(
  draft: Partial<LedgerImportDraft> | null | undefined,
): LedgerImportDraftFormState {
  const normalizedDraft = normalizeLedgerImportDraft(draft);

  return {
    source: normalizedDraft.source,
    amount: normalizedDraft.amount === null ? '' : formatPlainAmount(normalizedDraft.amount),
    merchant: normalizedDraft.merchant ?? '',
    time: normalizedDraft.time === null ? '' : formatIsoTimeForDateTimeLocal(normalizedDraft.time),
    category: normalizedDraft.category ?? '',
    payment: normalizedDraft.payment ?? '',
    note: normalizedDraft.note ?? '',
  };
}

export function validateLedgerImportDraftFormState(
  formState: LedgerImportDraftFormState,
): LedgerImportDraftFormErrors {
  const errors: LedgerImportDraftFormErrors = {};

  if (!formState.amount.trim()) {
    errors.amount = '金额不能为空';
  } else if (!Number.isFinite(Number.parseFloat(formState.amount))) {
    errors.amount = '金额必须是有效数字';
  } else if (Number.parseFloat(formState.amount) <= 0) {
    errors.amount = '金额必须大于 0';
  }

  if (!formState.time.trim()) {
    errors.time = '时间不能为空';
  }

  if (formState.category === '') {
    errors.category = '请选择分类候选';
  }

  if (formState.payment === '') {
    errors.payment = '请选择支付方式';
  }

  if (formState.note.length > 50) {
    errors.note = '备注不能超过 50 个字符';
  }

  return errors;
}

export function buildLedgerImportDraftPrompt(
  formState: LedgerImportDraftFormState,
): string | null {
  const missingFields: string[] = [];

  if (!formState.amount.trim()) {
    missingFields.push('金额');
  }

  if (!formState.time.trim()) {
    missingFields.push('时间');
  }

  if (formState.category === '') {
    missingFields.push('分类');
  }

  if (formState.payment === '') {
    missingFields.push('支付方式');
  }

  if (missingFields.length === 0) {
    return null;
  }

  if (missingFields.length >= 4) {
    return '先补金额、时间、分类和支付方式。';
  }

  return `补上 ${missingFields.join('、')} 后再保存。`;
}

export function createLedgerRecordFromImportDraftFormState(
  formState: LedgerImportDraftFormState,
  recordId = createLedgerRecordId(),
): LedgerRecord | null {
  const amount = Number.parseFloat(formState.amount);
  const time = parseDateTimeLocalToIso(formState.time);
  const note = buildDraftNote(formState.merchant, formState.note);

  const parsed = ledgerRecordSchema.safeParse({
    id: recordId,
    type: 'expense',
    amount,
    category: formState.category,
    payment: formState.payment,
    time: time ?? '',
    note,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function createSampleLedgerImportDraft(): LedgerImportDraft {
  return {
    source: 'shortcut',
    amount: 18.5,
    merchant: '便利店',
    time: '2026-05-11T03:55:00.000Z',
    category: '日用',
    payment: '微信',
    note: '补给零食',
  };
}

export function readLedgerImportDraftFromLocation(
  location: Pick<Location, 'search'> | null = typeof window === 'undefined' ? null : window.location,
): LedgerImportDraft | null {
  if (!location) {
    return null;
  }

  const searchParams = new URLSearchParams(location.search);
  const rawDraft = searchParams.get('draft');

  if (!rawDraft) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawDraft) as Partial<LedgerImportDraft>;
    return normalizeLedgerImportDraft(parsed);
  } catch {
    return null;
  }
}

function buildDraftNote(merchant: string, note: string): string {
  const trimmedMerchant = merchant.trim();
  const trimmedNote = note.trim();

  return trimmedNote || trimmedMerchant;
}

function normalizeDraftText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isLedgerCategory(value: unknown): value is LedgerCategory {
  return typeof value === 'string' && LEDGER_CATEGORIES.includes(value as LedgerCategory);
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && PAYMENT_METHODS.includes(value as PaymentMethod);
}

function createLedgerRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

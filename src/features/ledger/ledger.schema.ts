import { z } from 'zod';

import {
  FORM_MODES,
  LEDGER_AMOUNT_MAX_DECIMALS,
  LEDGER_CATEGORIES,
  LEDGER_DRAFT_SOURCES,
  LEDGER_ENTRY_TYPES,
  LEDGER_NOTE_MAX_LENGTH,
  PAYMENT_METHODS,
} from '@/features/ledger/ledger.constants';
import type { LedgerCategory, LedgerCategoryBudgetMap, LedgerImportDraft } from '@/types/ledger';

const decimalPrecisionMessage = `金额最多保留${LEDGER_AMOUNT_MAX_DECIMALS}位小数`;

const hasAllowedDecimalPrecision = (value: number) => {
  const [, fraction = ''] = value.toString().split('.');
  return fraction.length <= LEDGER_AMOUNT_MAX_DECIMALS;
};

const ledgerAmountSchema = z
  .number({
    required_error: '金额不能为空',
    invalid_type_error: '金额必须是数字',
  })
  .finite('金额必须是有效数字')
  .gt(0, '金额必须大于 0')
  .refine(hasAllowedDecimalPrecision, decimalPrecisionMessage);

const ledgerBudgetAmountSchema = ledgerAmountSchema;

const ledgerBudgetCategoryValueSchema = z.record(
  z.enum(LEDGER_CATEGORIES),
  ledgerBudgetAmountSchema.optional(),
).transform((value): LedgerCategoryBudgetMap => {
  const nextCategoryBudgets: LedgerCategoryBudgetMap = {};

  for (const [category, amount] of Object.entries(value)) {
    if (typeof amount === 'number') {
      nextCategoryBudgets[category as LedgerCategory] = amount;
    }
  }

  return nextCategoryBudgets;
});

const normalizeEmptyStringToNull = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value ?? null;
};

const ledgerDraftStringSchema = z.preprocess(
  normalizeEmptyStringToNull,
  z.string().min(1).nullable(),
);

const ledgerDraftOptionalStringSchema = z.preprocess(
  normalizeEmptyStringToNull,
  z.string().min(1).nullable(),
);

const ledgerDraftAmountSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value ?? null;
}, ledgerBudgetAmountSchema.nullable());

const hasUsableLedgerImportDraftFields = (draft: LedgerImportDraft) =>
  draft.amount !== null ||
  draft.merchant !== null ||
  draft.time !== null ||
  draft.category !== null ||
  draft.payment !== null ||
  draft.note !== null;

export const ledgerRecordSchema = z.object({
  id: z.string().min(1, '记录 ID 不能为空'),
  type: z.enum(LEDGER_ENTRY_TYPES),
  amount: ledgerAmountSchema,
  category: z.enum(LEDGER_CATEGORIES),
  payment: z.enum(PAYMENT_METHODS),
  time: z.string().min(1, '时间不能为空'),
  note: z.string().max(LEDGER_NOTE_MAX_LENGTH, '备注不能超过 50 个字符'),
});

export const ledgerRecordInputSchema = ledgerRecordSchema
  .omit({ id: true })
  .extend({
    mode: z.enum(FORM_MODES),
  });

export const ledgerRecordListSchema = z.array(ledgerRecordSchema);

export const ledgerFormPreferencesSchema = z.object({
  category: z.enum(LEDGER_CATEGORIES),
  payment: z.enum(PAYMENT_METHODS),
});

export const ledgerBudgetSettingsSchema = z.object({
  monthlyBudget: ledgerBudgetAmountSchema.nullable(),
  categoryBudgets: ledgerBudgetCategoryValueSchema,
});

export const ledgerImportDraftSchema = z
  .object({
    source: z.enum(LEDGER_DRAFT_SOURCES),
    amount: ledgerDraftAmountSchema,
    merchant: ledgerDraftStringSchema,
    time: ledgerDraftOptionalStringSchema,
    category: z.enum(LEDGER_CATEGORIES).nullable(),
    payment: z.enum(PAYMENT_METHODS).nullable(),
    note: z.preprocess(
      normalizeEmptyStringToNull,
      z.string().max(LEDGER_NOTE_MAX_LENGTH).nullable(),
    ),
  })
  .refine(hasUsableLedgerImportDraftFields, {
    message: '草稿至少需要一项可用信息',
    path: ['amount'],
  });

export const ledgerImportDraftConfirmationSchema = ledgerRecordInputSchema.extend({
  source: z.enum(LEDGER_DRAFT_SOURCES),
}).refine((value) => value.mode === 'create', {
  message: '草稿确认只能创建新记录',
  path: ['mode'],
});

export function hasUsableLedgerImportDraftData(
  draft: Partial<LedgerImportDraft> | null | undefined,
): draft is LedgerImportDraft {
  if (!draft) {
    return false;
  }

  return (typeof draft.amount === 'number' && Number.isFinite(draft.amount)) ||
    Boolean(draft.merchant?.trim()) ||
    Boolean(draft.time?.trim()) ||
    Boolean(draft.category) ||
    Boolean(draft.payment) ||
    Boolean(draft.note?.trim());
}

export type LedgerRecordSchema = z.infer<typeof ledgerRecordSchema>;

export type LedgerRecordInput = z.infer<typeof ledgerRecordInputSchema>;

export type LedgerRecordList = z.infer<typeof ledgerRecordListSchema>;

export type LedgerFormPreferencesSchema = z.infer<typeof ledgerFormPreferencesSchema>;

export type LedgerBudgetSettingsSchema = z.infer<typeof ledgerBudgetSettingsSchema>;

export type LedgerImportDraftSchema = z.infer<typeof ledgerImportDraftSchema>;

export type LedgerImportDraftConfirmationSchema = z.infer<
  typeof ledgerImportDraftConfirmationSchema
>;

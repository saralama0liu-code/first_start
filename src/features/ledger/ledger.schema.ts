import { z } from 'zod';

import {
  FORM_MODES,
  LEDGER_AMOUNT_MAX_DECIMALS,
  LEDGER_CATEGORIES,
  LEDGER_ENTRY_TYPES,
  LEDGER_NOTE_MAX_LENGTH,
  PAYMENT_METHODS,
} from '@/features/ledger/ledger.constants';

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

export type LedgerRecordSchema = z.infer<typeof ledgerRecordSchema>;

export type LedgerRecordInput = z.infer<typeof ledgerRecordInputSchema>;

export type LedgerRecordList = z.infer<typeof ledgerRecordListSchema>;

export type LedgerFormPreferencesSchema = z.infer<typeof ledgerFormPreferencesSchema>;

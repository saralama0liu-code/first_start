import { describe, expect, it } from 'vitest';

import {
  buildLedgerImportDraftPrompt,
  createLedgerImportDraftFormState,
  createLedgerRecordFromImportDraftFormState,
  createSampleLedgerImportDraft,
  normalizeLedgerImportDraft,
  readLedgerImportDraftFromLocation,
} from './ledger.import-draft';

describe('ledger import draft helpers', () => {
  it('normalizes a shortcut draft into a full editable form state', () => {
    const sampleDraft = createSampleLedgerImportDraft();
    const formState = createLedgerImportDraftFormState(sampleDraft);

    expect(normalizeLedgerImportDraft(sampleDraft)).toEqual(sampleDraft);
    expect(formState.source).toBe('shortcut');
    expect(formState.amount).toBe('18.50');
    expect(formState.merchant).toBe('便利店');
    expect(formState.time).toBe('2026-05-11T11:55');
    expect(formState.category).toBe('日用');
    expect(formState.payment).toBe('微信');
    expect(formState.note).toBe('补给零食');
  });

  it('creates a confirmation-ready record from the draft form', () => {
    const record = createLedgerRecordFromImportDraftFormState(
      createLedgerImportDraftFormState(createSampleLedgerImportDraft()),
      'record-1',
    );

    expect(record).toMatchObject({
      id: 'record-1',
      type: 'expense',
      amount: 18.5,
      category: '日用',
      payment: '微信',
      note: '补给零食',
    });
    expect(record?.time).toBe('2026-05-11T03:55:00.000Z');
  });

  it('builds a missing-field prompt for incomplete drafts', () => {
    expect(
      buildLedgerImportDraftPrompt({
        source: 'shortcut',
        amount: '',
        merchant: '',
        time: '',
        category: '',
        payment: '',
        note: '',
      }),
    ).toBe('先补金额、时间、分类和支付方式。');

    expect(
      buildLedgerImportDraftPrompt({
        source: 'shortcut',
        amount: '18.50',
        merchant: '',
        time: '',
        category: '日用',
        payment: '微信',
        note: '',
      }),
    ).toBe('补上 时间 后再保存。');
  });

  it('reads a draft payload from the query string when present', () => {
    const draft = readLedgerImportDraftFromLocation({
      search: `?draft=${encodeURIComponent(
        JSON.stringify({
          source: 'shortcut',
          amount: 12.5,
          merchant: '咖啡店',
          time: '2026-05-12T06:30:00.000Z',
          category: '日用',
          payment: '微信',
          note: '',
        }),
      )}`,
    });

    expect(draft).toMatchObject({
      source: 'shortcut',
      amount: 12.5,
      merchant: '咖啡店',
      time: '2026-05-12T06:30:00.000Z',
      category: '日用',
      payment: '微信',
      note: null,
    });
  });
});

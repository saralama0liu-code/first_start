import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LedgerImportDraftView } from './LedgerImportDraftView';
import { createSampleLedgerImportDraft } from './ledger.import-draft';

describe('LedgerImportDraftView', () => {
  it('renders the shortcut draft confirmation surface', () => {
    const html = renderToString(
      <LedgerImportDraftView
        draft={createSampleLedgerImportDraft()}
        onBackToHome={() => undefined}
        onOpenManualDrawer={() => undefined}
        onConfirmDraft={() => true}
      />,
    );

    expect(html).toContain('截图导入草稿');
    expect(html).toContain('快捷指令导入');
    expect(html).toContain('确认后再保存');
    expect(html).toContain('金额');
    expect(html).toContain('商户名');
    expect(html).toContain('时间');
    expect(html).toContain('分类候选');
    expect(html).toContain('支付方式');
    expect(html).toContain('确认保存');
    expect(html).toContain('改用手动记账');
    expect(html).toContain('便利店');
    expect(html).toContain('2026-05-11 11:55');
  });

  it('prompts to complete missing fields for an incomplete draft', () => {
    const html = renderToString(
      <LedgerImportDraftView
        draft={{
          source: 'shortcut',
          amount: null,
          merchant: null,
          time: null,
          category: null,
          payment: null,
          note: null,
        }}
        onBackToHome={() => undefined}
        onOpenManualDrawer={() => undefined}
        onConfirmDraft={() => true}
      />,
    );

    expect(html).toContain('没识别到内容');
    expect(html).toContain('待补金额');
    expect(html).toContain('待补商户');
    expect(html).toContain('待补分类');
    expect(html).toContain('待补支付方式');
  });
});

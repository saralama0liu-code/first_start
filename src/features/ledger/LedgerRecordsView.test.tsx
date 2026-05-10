import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { LedgerRecord } from '@/types/ledger';
import { LedgerRecordsView } from './LedgerRecordsView';

const records: LedgerRecord[] = [
  {
    id: 'record-1',
    type: 'expense',
    amount: 18.5,
    category: '餐饮',
    payment: '微信',
    time: '2026-04-26T10:20:00.000Z',
    note: '午饭',
  },
  {
    id: 'record-2',
    type: 'income',
    amount: 88,
    category: '其他',
    payment: '现金',
    time: '2026-04-26T12:20:00.000Z',
    note: '报销',
  },
];

describe('LedgerRecordsView', () => {
  it('renders the full record list surface', () => {
    const html = renderToString(
      <LedgerRecordsView
        records={records}
        onBackToHome={() => undefined}
        onOpenDrawer={() => undefined}
        onEditRecord={() => undefined}
        onDeleteRecord={() => undefined}
      />,
    );

    expect(html).toContain('全部记录');
    expect(html).toContain('删除');
    expect(html).toContain('编辑记录：餐饮，18.50 元');
    expect(html).toContain('编辑记录：其他，88.00 元');
    expect(html).toContain('返回首页');
  });
});

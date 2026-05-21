import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LedgerRecentRecordsList } from './LedgerRecentRecordsList';

describe('LedgerRecentRecordsList', () => {
  it('renders an empty state when there are no records', () => {
    const html = renderToString(
      <LedgerRecentRecordsList
        records={[]}
        onEditRecord={() => undefined}
        onDeleteRecord={() => undefined}
      />,
    );

    expect(html).toContain('暂无记录');
  });

  it('renders an edit entry for each record', () => {
    const html = renderToString(
      <LedgerRecentRecordsList
        records={[
          {
            id: 'record-1',
            type: 'expense',
            amount: 18.5,
            category: '餐饮',
            payment: '微信',
            time: '2026-04-26T10:20:00.000Z',
            note: '午饭',
          },
        ]}
        onEditRecord={() => undefined}
        onDeleteRecord={() => undefined}
      />,
    );

    expect(html).toContain('编辑记录：餐饮，18.50 元');
    expect(html).toContain('button');
    expect(html).toContain('更多');
    expect(html).toContain('删除');
  });

  it('renders a shorter preview surface without note text', () => {
    const html = renderToString(
      <LedgerRecentRecordsList
        records={[
          {
            id: 'record-1',
            type: 'expense',
            amount: 18.5,
            category: '餐饮',
            payment: '微信',
            time: '2026-04-26T10:20:00.000Z',
            note: '午饭',
          },
        ]}
        density="compact"
        surface="preview"
        onEditRecord={() => undefined}
        onDeleteRecord={() => undefined}
      />,
    );

    expect(html).toContain('编辑记录：餐饮，18.50 元');
    expect(html).not.toContain('午饭');
    expect(html).not.toContain('点击编辑');
  });
});

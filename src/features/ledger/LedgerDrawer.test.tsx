import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LedgerDrawer } from './LedgerDrawer';

describe('LedgerDrawer', () => {
  it('renders the manual entry surface in create mode', () => {
    const html = renderToString(
      <LedgerDrawer
        isOpen
        mode="create"
        record={null}
        onClose={() => undefined}
        onSubmitRecord={() => true}
      />,
    );

    expect(html).toContain('记一笔');
    expect(html).toContain('收支类型');
    expect(html).toContain('金额');
    expect(html).toContain('分类');
    expect(html).toContain('支付方式');
    expect(html).toContain('时间');
    expect(html).toContain('备注');
    expect(html).toContain('保存并关闭');
    expect(html).toContain('先把基础字段填好，提交动作会在当前抽屉里完成。');
  });

  it('prefills edit mode from the record', () => {
    const html = renderToString(
      <LedgerDrawer
        isOpen
        mode="edit"
        record={{
          id: 'record-1',
          type: 'expense',
          amount: 18.5,
          category: '餐饮',
          payment: '微信',
          time: '2026-04-26T10:20:00.000Z',
          note: '午饭',
        }}
        onClose={() => undefined}
        onSubmitRecord={() => true}
      />,
    );

    expect(html).toContain('编辑记录');
    expect(html).toContain('午饭');
    expect(html).toContain('字段已经按原记录预填，先把基础信息确认好。');
  });
});

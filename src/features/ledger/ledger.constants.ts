export const LEDGER_ENTRY_TYPES = ['expense', 'income'] as const;

export const LEDGER_ENTRY_TYPE_LABELS = {
  expense: '支出',
  income: '收入',
} as const;

export const LEDGER_CATEGORIES = [
  '餐饮',
  '交通',
  '日用',
  '娱乐',
  '学习',
  '其他',
] as const;

export const PAYMENT_METHODS = [
  '微信',
  '支付宝',
  '银行卡',
  '现金',
] as const;

export const FORM_MODES = ['create', 'edit'] as const;

export const LEDGER_BUDGET_PROGRESS_STATUSES = [
  'unset',
  'within-budget',
  'over-budget',
] as const;

export const LEDGER_DRAFT_SOURCES = ['shortcut'] as const;

export const LEDGER_MORE_MENU_ACTIONS = [
  'view-all-records',
  'budget-management',
  'category-budget-management',
  'draft-import-guide',
] as const;

export const LEDGER_BUDGET_DEFAULT_MONTHLY_AMOUNT = 2000;

export const LEDGER_AMOUNT_MAX_DECIMALS = 2;

export const LEDGER_NOTE_MAX_LENGTH = 50;

export const LEDGER_DRAFT_SOURCE_LABELS = {
  shortcut: '快捷指令导入',
} as const;

export const LEDGER_MORE_MENU_ACTION_LABELS = {
  'view-all-records': '查看全部记录',
  'budget-management': '预算管理',
  'category-budget-management': '分类预算管理',
  'draft-import-guide': '截图导入说明',
} as const;

export const STORAGE_KEYS = {
  ledgerRecords: 'quick-ledger.records',
  ledgerBudgetSettings: 'quick-ledger.budgetSettings',
  lastUsedCategory: 'quick-ledger.lastUsedCategory',
  lastUsedPaymentMethod: 'quick-ledger.lastUsedPaymentMethod',
} as const;

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';

import { ledgerBudgetSettingsSchema } from './ledger.schema';
import { formatRmbAmount } from '@/lib/format';
import type {
  LedgerBudgetProgressSummary,
  LedgerBudgetSettings,
  LedgerCategory,
} from '@/types/ledger';
import type {
  LedgerBudgetSummaryCopy,
  LedgerCategoryBudgetSummary,
} from '@/lib/ledger-tools';

import styles from './LedgerBudgetView.module.css';

interface LedgerBudgetViewProps {
  budgetSettings: LedgerBudgetSettings;
  budgetProgress: LedgerBudgetProgressSummary;
  budgetSummaryCopy: LedgerBudgetSummaryCopy;
  categoryBudgetSummaries: LedgerCategoryBudgetSummary[];
  onBackToHome: () => void;
  onOpenRecords: () => void;
  onSaveBudgetSettings: (nextSettings: LedgerBudgetSettings) => boolean;
}

type FieldState = Record<LedgerCategory, string>;
type EditingTarget =
  | { kind: 'monthly' }
  | { kind: 'category'; category: LedgerCategory }
  | null;

export function LedgerBudgetView({
  budgetSettings,
  budgetProgress,
  budgetSummaryCopy,
  categoryBudgetSummaries,
  onBackToHome,
  onOpenRecords,
  onSaveBudgetSettings,
}: LedgerBudgetViewProps) {
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(formatMonthlyBudgetInput(budgetSettings.monthlyBudget));
  const [categoryInputs, setCategoryInputs] = useState<FieldState>(
    buildCategoryInputs(categoryBudgetSummaries),
  );
  const [editingTarget, setEditingTarget] = useState<EditingTarget>(null);
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const monthlyBudgetInputRef = useRef<HTMLInputElement | null>(null);
  const categoryInputRefs = useRef<Partial<Record<LedgerCategory, HTMLInputElement | null>>>({});

  useEffect(() => {
    setMonthlyBudgetInput(formatMonthlyBudgetInput(budgetSettings.monthlyBudget));
    setCategoryInputs(buildCategoryInputs(categoryBudgetSummaries));
  }, [budgetSettings, categoryBudgetSummaries]);

  useEffect(() => {
    if (editingTarget === null) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (editingTarget.kind === 'monthly') {
        monthlyBudgetInputRef.current?.focus();
        return;
      }

      categoryInputRefs.current[editingTarget.category]?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [editingTarget]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (persistBudgetSettings()) {
      setEditingTarget(null);
    }
  };

  const handleToggleEditing = (nextTarget: Exclude<EditingTarget, null>) => {
    if (editingTarget === null) {
      setMessage(null);
      setEditingTarget(nextTarget);
      return;
    }

    if (isSameEditingTarget(editingTarget, nextTarget)) {
      if (persistBudgetSettings()) {
        setEditingTarget(null);
      }
      return;
    }

    if (persistBudgetSettings()) {
      setEditingTarget(nextTarget);
    }
  };

  const persistBudgetSettings = () => {
    const nextSettings = buildNextBudgetSettings(monthlyBudgetInput, categoryInputs);
    const parsed = ledgerBudgetSettingsSchema.safeParse(nextSettings);

    if (!parsed.success) {
      setMessage({
        tone: 'error',
        text: parsed.error.issues[0]?.message ?? '预算设置无效',
      });
      return false;
    }

    const saved = onSaveBudgetSettings(parsed.data);

    if (!saved) {
      setMessage({
        tone: 'error',
        text: '预算保存失败',
      });
      return false;
    }

    setMessage({
      tone: 'success',
      text: '预算已保存',
    });

    return true;
  };

  return (
    <section className={styles.view}>
      <div className={styles.topBar}>
        <button className={styles.secondaryAction} type="button" onClick={onBackToHome}>
          返回首页
        </button>
        <button className={styles.secondaryAction} type="button" onClick={onOpenRecords}>
          全部记录
        </button>
      </div>

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderRow}>
            <p className={styles.label}>预算管理</p>
            <h2 className={styles.title}>{budgetSummaryCopy.headline}</h2>
          </div>
          {budgetProgress.status === 'unset' ? <p className={styles.copy}>{budgetSummaryCopy.detail}</p> : null}
        </div>

        <div className={styles.budgetControls}>
          <div className={styles.budgetRow}>
            <span className={styles.fieldLabel}>月预算</span>
            {editingTarget?.kind === 'monthly' ? (
              <input
                ref={monthlyBudgetInputRef}
                className={styles.fieldInput}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="未设置"
                value={monthlyBudgetInput}
                onChange={(event) => setMonthlyBudgetInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (persistBudgetSettings()) {
                      setEditingTarget(null);
                    }
                  }
                }}
              />
            ) : (
              <span className={styles.budgetValue}>{formatBudgetValue(budgetSettings.monthlyBudget)}</span>
            )}

            <button
              className={styles.iconAction}
              type="button"
              aria-label={editingTarget?.kind === 'monthly' ? '保存月预算' : '编辑月预算'}
              onClick={() => handleToggleEditing({ kind: 'monthly' })}
            >
              <span className={styles.iconGlyph} aria-hidden="true">
                ⚙
              </span>
            </button>
          </div>
        </div>

        {message ? (
          <p className={message.tone === 'error' ? styles.error : styles.success} aria-live="polite">
            {message.text}
          </p>
        ) : null}

        <div className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.label}>分类预算</p>
              <h3 className={styles.sectionTitle}>计划和实际支出对比</h3>
            </div>
            <span className={styles.sectionHint}>实际 / 计划</span>
          </div>

          <div className={styles.categoryList}>
            {categoryBudgetSummaries.map((summary) => {
              const progress = summary.usageRatio === null ? 0 : Math.max(0, Math.min(summary.usageRatio, 1));
              const accent =
                summary.status === 'over-budget'
                  ? 'rgba(215, 89, 89, 0.96)'
                  : 'rgba(51, 151, 82, 0.96)';

              return (
                <article
                  className={styles.categoryCard}
                  key={summary.category}
                  style={
                    {
                      '--category-progress': progress.toFixed(4),
                      '--category-accent': accent,
                    } as CSSProperties
                  }
                >
                  <div className={styles.categoryHeader}>
                    <div>
                      <p className={styles.categoryName}>{summary.category}</p>
                      <p className={styles.categoryMeta}>
                        实际 {summary.displayExpense} · 预算 {summary.displayBudget}
                      </p>
                    </div>
                    <strong className={styles.categoryBalance}>{summary.displayBalance}</strong>
                  </div>

                  <div className={styles.categoryBar} aria-hidden="true">
                    <span className={styles.categoryBarFill} />
                  </div>

                  <div className={styles.categoryBudgetRow}>
                    <span className={styles.fieldLabel}>分类预算</span>
                    {editingTarget?.kind === 'category' && editingTarget.category === summary.category ? (
                      <input
                        ref={(element) => {
                          categoryInputRefs.current[summary.category] = element;
                        }}
                        className={styles.fieldInput}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="未设置"
                        value={categoryInputs[summary.category]}
                        onChange={(event) =>
                          setCategoryInputs((current) => ({
                            ...current,
                            [summary.category]: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            if (persistBudgetSettings()) {
                              setEditingTarget(null);
                            }
                          }
                        }}
                      />
                    ) : (
                      <span className={styles.budgetValue}>{summary.displayBudget}</span>
                    )}

                    <button
                      className={styles.iconAction}
                      type="button"
                      aria-label={
                        editingTarget?.kind === 'category' && editingTarget.category === summary.category
                          ? `保存${summary.category}预算`
                          : `编辑${summary.category}预算`
                      }
                      onClick={() => handleToggleEditing({ kind: 'category', category: summary.category })}
                    >
                      <span className={styles.iconGlyph} aria-hidden="true">
                        ⚙
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </form>
    </section>
  );
}

function formatMonthlyBudgetInput(monthlyBudget: number | null): string {
  return monthlyBudget === null ? '' : String(monthlyBudget);
}

function buildCategoryInputs(categoryBudgetSummaries: LedgerCategoryBudgetSummary[]): FieldState {
  const nextInputs = {} as FieldState;

  for (const summary of categoryBudgetSummaries) {
    nextInputs[summary.category] = summary.monthlyBudget === null ? '' : String(summary.monthlyBudget);
  }

  return nextInputs;
}

function formatBudgetValue(monthlyBudget: number | null): string {
  return monthlyBudget === null ? '未设置' : formatRmbAmount(monthlyBudget);
}

function isSameEditingTarget(
  current: Exclude<EditingTarget, null>,
  next: Exclude<EditingTarget, null>,
): boolean {
  if (current.kind !== next.kind) {
    return false;
  }

  if (current.kind === 'monthly') {
    return true;
  }

  return current.kind === 'category' && next.kind === 'category' && current.category === next.category;
}

function buildNextBudgetSettings(
  monthlyBudgetInput: string,
  categoryInputs: FieldState,
): LedgerBudgetSettings {
  const trimmedMonthlyBudget = monthlyBudgetInput.trim();
  const monthlyBudget =
    trimmedMonthlyBudget === '' ? null : Number(trimmedMonthlyBudget);
  const categoryBudgets: LedgerBudgetSettings['categoryBudgets'] = {};

  for (const [category, value] of Object.entries(categoryInputs) as Array<[LedgerCategory, string]>) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      continue;
    }

    categoryBudgets[category] = Number(trimmedValue);
  }

  return {
    monthlyBudget,
    categoryBudgets,
  };
}

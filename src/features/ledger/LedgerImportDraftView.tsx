import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import {
  LEDGER_CATEGORIES,
  LEDGER_DRAFT_SOURCE_LABELS,
  PAYMENT_METHODS,
} from './ledger.constants';
import { hasUsableLedgerImportDraftData } from './ledger.schema';
import {
  buildLedgerImportDraftPrompt,
  createLedgerImportDraftFormState,
  createLedgerRecordFromImportDraftFormState,
  normalizeLedgerImportDraft,
  validateLedgerImportDraftFormState,
  type LedgerImportDraftFormErrors,
  type LedgerImportDraftFormState,
} from './ledger.import-draft';
import { formatLedgerDraftAmountDisplay, formatLedgerDraftTimeDisplay } from '@/lib/ledger-tools';
import type { LedgerImportDraft, LedgerRecord } from '@/types/ledger';

import styles from './LedgerImportDraftView.module.css';

interface LedgerImportDraftViewProps {
  draft: LedgerImportDraft | null;
  onBackToHome: () => void;
  onOpenManualDrawer: () => void;
  onConfirmDraft: (nextRecord: LedgerRecord) => boolean;
}

export function LedgerImportDraftView({
  draft,
  onBackToHome,
  onOpenManualDrawer,
  onConfirmDraft,
}: LedgerImportDraftViewProps) {
  const normalizedDraft = useMemo(() => normalizeLedgerImportDraft(draft), [draft]);
  const [formState, setFormState] = useState<LedgerImportDraftFormState>(() =>
    createLedgerImportDraftFormState(draft),
  );
  const [fieldErrors, setFieldErrors] = useState<LedgerImportDraftFormErrors>({});
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormState(createLedgerImportDraftFormState(draft));
    setFieldErrors({});
    setMessage(null);

    const frame = window.requestAnimationFrame(() => {
      amountInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [draft]);

  const draftPrompt = buildLedgerImportDraftPrompt(formState);
  const hasImportedFields = hasUsableLedgerImportDraftData(draft);
  const previewAmount = formatLedgerDraftAmountDisplay(normalizedDraft.amount);
  const previewTime = formatLedgerDraftTimeDisplay(normalizedDraft.time);
  const previewMerchant = normalizedDraft.merchant ?? '待补商户';
  const previewCategory = normalizedDraft.category ?? '待补分类';
  const previewPayment = normalizedDraft.payment ?? '待补支付方式';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateLedgerImportDraftFormState(formState);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage({
        tone: 'error',
        text: '还有字段没补全',
      });
      return;
    }

    const nextRecord = createLedgerRecordFromImportDraftFormState(formState);

    if (!nextRecord) {
      setMessage({
        tone: 'error',
        text: '金额、时间或分类有误',
      });
      return;
    }

    const saved = onConfirmDraft(nextRecord);

    if (!saved) {
      setMessage({
        tone: 'error',
        text: '保存失败，请重试',
      });
      return;
    }

    setMessage(null);
    onBackToHome();
  };

  return (
    <section className={styles.view}>
      <div className={styles.topBar}>
        <button className={styles.secondaryAction} type="button" onClick={onBackToHome}>
          返回首页
        </button>
        <button className={styles.secondaryAction} type="button" onClick={onOpenManualDrawer}>
          手动记账
        </button>
      </div>

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderRow}>
            <div>
              <p className={styles.label}>截图导入草稿</p>
              <h2 className={styles.title}>确认后再保存</h2>
            </div>
            <span className={styles.sourceBadge}>{LEDGER_DRAFT_SOURCE_LABELS[formState.source]}</span>
          </div>
          <p className={styles.copy}>识别结果都能改。</p>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>金额</span>
            <strong className={styles.previewValue}>{previewAmount}</strong>
          </div>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>商户</span>
            <strong className={styles.previewValue}>{previewMerchant}</strong>
          </div>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>时间</span>
            <strong className={styles.previewValue}>{previewTime}</strong>
          </div>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>分类</span>
            <strong className={styles.previewValue}>{previewCategory}</strong>
          </div>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>支付方式</span>
            <strong className={styles.previewValue}>{previewPayment}</strong>
          </div>
        </div>

        {!hasImportedFields ? (
          <div className={styles.promptCard} role="alert" aria-live="polite">
            <strong className={styles.promptTitle}>没识别到内容</strong>
            <p className={styles.promptCopy}>建议直接改用手动记账，或先手动补几项再保存。</p>
          </div>
        ) : draftPrompt ? (
          <div className={styles.promptCard} role="status" aria-live="polite">
            <strong className={styles.promptTitle}>还差几项</strong>
            <p className={styles.promptCopy}>{draftPrompt}</p>
          </div>
        ) : (
          <div className={styles.hintCard} role="status" aria-live="polite">
            <p className={styles.hintCopy}>可直接保存，也可先改字段。</p>
          </div>
        )}

        {message ? (
          <p className={message.tone === 'error' ? styles.error : styles.success} aria-live="polite">
            {message.text}
          </p>
        ) : null}

        <div className={styles.formBody}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>金额</span>
            <input
              ref={amountInputRef}
              className={styles.fieldInput}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="待补金额"
              value={formState.amount}
              onChange={(event) => {
                setMessage(null);
                setFieldErrors((current) => ({ ...current, amount: undefined }));
                setFormState((current) => ({ ...current, amount: event.target.value }));
              }}
            />
            {fieldErrors.amount ? <span className={styles.fieldError}>{fieldErrors.amount}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>商户名</span>
            <input
              className={styles.fieldInput}
              type="text"
              placeholder="待补商户"
              value={formState.merchant}
              onChange={(event) => {
                setMessage(null);
                setFormState((current) => ({ ...current, merchant: event.target.value }));
              }}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>时间</span>
            <input
              className={styles.fieldInput}
              type="datetime-local"
              value={formState.time}
              onChange={(event) => {
                setMessage(null);
                setFieldErrors((current) => ({ ...current, time: undefined }));
                setFormState((current) => ({ ...current, time: event.target.value }));
              }}
            />
            {fieldErrors.time ? <span className={styles.fieldError}>{fieldErrors.time}</span> : null}
          </label>

          <section className={styles.choiceSection} aria-label="分类候选">
            <div className={styles.choiceHeader}>
              <div>
                <p className={styles.choiceLabel}>分类候选</p>
                <h3 className={styles.choiceTitle}>选一项</h3>
              </div>
              <span className={styles.choiceHint}>可随时修改</span>
            </div>

            <div className={styles.choiceGrid}>
              {LEDGER_CATEGORIES.map((category) => {
                const selected = formState.category === category;

                return (
                  <button
                    key={category}
                    className={selected ? styles.choiceButtonActive : styles.choiceButton}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                      setMessage(null);
                      setFieldErrors((current) => ({ ...current, category: undefined }));
                      setFormState((current) => ({ ...current, category }));
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            {fieldErrors.category ? <span className={styles.fieldError}>{fieldErrors.category}</span> : null}
          </section>

          <section className={styles.choiceSection} aria-label="支付方式">
            <div className={styles.choiceHeader}>
              <div>
                <p className={styles.choiceLabel}>支付方式</p>
                <h3 className={styles.choiceTitle}>选支付方式</h3>
              </div>
            </div>

            <div className={styles.choiceGrid}>
              {PAYMENT_METHODS.map((payment) => {
                const selected = formState.payment === payment;

                return (
                  <button
                    key={payment}
                    className={selected ? styles.choiceButtonActive : styles.choiceButton}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                      setMessage(null);
                      setFieldErrors((current) => ({ ...current, payment: undefined }));
                      setFormState((current) => ({ ...current, payment }));
                    }}
                  >
                    {payment}
                  </button>
                );
              })}
            </div>
            {fieldErrors.payment ? <span className={styles.fieldError}>{fieldErrors.payment}</span> : null}
          </section>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>备注</span>
            <textarea
              className={styles.textarea}
              placeholder="补充说明，可选"
              rows={3}
              value={formState.note}
              onChange={(event) => {
                setMessage(null);
                setFieldErrors((current) => ({ ...current, note: undefined }));
                setFormState((current) => ({ ...current, note: event.target.value }));
              }}
            />
            {fieldErrors.note ? <span className={styles.fieldError}>{fieldErrors.note}</span> : null}
          </label>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryAction} type="button" onClick={onOpenManualDrawer}>
            改用手动记账
          </button>
          <button className={styles.primaryAction} type="submit">
            确认保存
          </button>
        </div>

        {!hasImportedFields ? (
          <p className={styles.footerHint}>当前是空草稿，建议改用手动记账。</p>
        ) : null}
      </form>
    </section>
  );
}

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import {
  LEDGER_CATEGORIES,
  LEDGER_ENTRY_TYPES,
  LEDGER_ENTRY_TYPE_LABELS,
  LEDGER_NOTE_MAX_LENGTH,
  PAYMENT_METHODS,
} from './ledger.constants';
import {
  createLedgerDrawerFormState,
  createLedgerRecordFromDrawerState,
  normalizeLedgerAmountInput,
  validateLedgerDrawerFormState,
  type LedgerDrawerFormState,
} from './ledger.form';
import styles from './LedgerDrawer.module.css';
import type { FormMode, LedgerRecord, LedgerCategory, PaymentMethod, LedgerEntryType } from '@/types/ledger';
import {
  formatIsoTimeForDateTimeLocal,
  formatLedgerTime,
  parseDateTimeLocalToIso,
} from '@/lib/date';
import {
  readLedgerFormPreferences,
  writeLedgerFormPreferences,
} from '@/lib/storage-service';

interface LedgerDrawerProps {
  isOpen: boolean;
  mode: FormMode;
  record: LedgerRecord | null;
  onClose: () => void;
  onSubmitRecord: (record: LedgerRecord) => boolean;
}

export function LedgerDrawer({ isOpen, mode, record, onClose, onSubmitRecord }: LedgerDrawerProps) {
  const recordIdentity = record?.id ?? 'create';
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LedgerDrawerFormState, string>>>(
    {},
  );
  const [formState, setFormState] = useState<LedgerDrawerFormState>(() =>
    createLedgerDrawerFormState(mode, record, readLedgerFormPreferences()),
  );

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setIsMounted(true);
      setFeedbackMessage(null);
      setFeedbackTone(null);
      setFieldErrors({});
      setFormState(createLedgerDrawerFormState(mode, record, readLedgerFormPreferences()));

      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    return undefined;
  }, [isOpen, mode, recordIdentity]);

  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setIsMounted(false);
      lastFocusedElementRef.current?.focus?.();
    }, 240);

    return () => window.clearTimeout(timeout);
  }, [isVisible]);

  useEffect(() => {
    if (feedbackTone !== 'success') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setFeedbackMessage(null);
      setFeedbackTone(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [feedbackMessage, feedbackTone]);

  if (!isMounted) {
    return null;
  }

  const title = mode === 'edit' && record ? '编辑记录' : '记一笔';
  const description =
    mode === 'edit' && record
      ? '字段已经按原记录预填，先把基础信息确认好。'
      : '先把基础字段填好，提交动作会在当前抽屉里完成。';

  const handleTransitionEnd = () => {
    if (!isVisible) {
      setIsMounted(false);
      lastFocusedElementRef.current?.focus?.();
    }
  };

  const handleTypeChange = (nextType: LedgerEntryType) => {
    setFieldErrors((current) => ({ ...current, type: undefined }));
    setFormState((current) => ({ ...current, type: nextType }));
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextAmount = normalizeLedgerAmountInput(event.target.value);
    setFieldErrors((current) => ({ ...current, amount: undefined }));
    setFormState((current) => ({ ...current, amount: nextAmount }));
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCategory = event.target.value as LedgerCategory;

    setFormState((current) => {
      const nextState = { ...current, category: nextCategory };
      setFieldErrors((currentErrors) => ({ ...currentErrors, category: undefined }));

      if (mode === 'create') {
        writeLedgerFormPreferences({
          category: nextCategory,
          payment: current.payment,
        });
      }

      return nextState;
    });
  };

  const handlePaymentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPayment = event.target.value as PaymentMethod;

    setFormState((current) => {
      const nextState = { ...current, payment: nextPayment };
      setFieldErrors((currentErrors) => ({ ...currentErrors, payment: undefined }));

      if (mode === 'create') {
        writeLedgerFormPreferences({
          category: current.category,
          payment: nextPayment,
        });
      }

      return nextState;
    });
  };

  const handleToggleTimeEditor = () => {
    setFormState((current) => ({
      ...current,
      showTimeEditor: !current.showTimeEditor,
    }));
  };

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextIsoTime = parseDateTimeLocalToIso(event.target.value);
    setFieldErrors((current) => ({ ...current, time: undefined }));

    if (!nextIsoTime) {
      return;
    }

    setFormState((current) => ({
      ...current,
      time: nextIsoTime,
    }));
  };

  const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFieldErrors((current) => ({ ...current, note: undefined }));
    setFormState((current) => ({
      ...current,
      note: event.target.value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateLedgerDrawerFormState(formState);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFeedbackTone('error');
      setFeedbackMessage('请先修正表单错误');
      return;
    }

    const nextRecord = createLedgerRecordFromDrawerState(formState, mode, record?.id);

    if (!nextRecord) {
      setFeedbackTone('error');
      setFeedbackMessage('保存失败');
      return;
    }

    const saved = onSubmitRecord(nextRecord);

    if (!saved) {
      setFeedbackTone('error');
      setFeedbackMessage('保存失败');
      return;
    }

    setFeedbackTone('success');
    setFeedbackMessage('已保存');
    onClose();
  };

  const saveButtonLabel = '保存并关闭';

  return (
    <div
      className={isVisible ? styles.backdropOpen : styles.backdropClosed}
      role="presentation"
      onClick={onClose}
    >
      <aside
        className={isVisible ? styles.drawerOpen : styles.drawerClosed}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ledger-drawer-title"
        aria-describedby="ledger-drawer-copy"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onTransitionEnd={handleTransitionEnd}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.label}>记账抽屉</p>
            <h2 id="ledger-drawer-title" className={styles.heading}>
              {title}
            </h2>
          </div>
          <button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={onClose}>
            关闭
          </button>
        </header>

        <div className={styles.body}>
          <p id="ledger-drawer-copy" className={styles.copy}>
            {description}
          </p>

          {feedbackMessage ? (
            <p className={styles.feedback} data-tone={feedbackTone ?? 'success'} aria-live="polite">
              {feedbackMessage}
            </p>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <span className={styles.fieldLabel}>收支类型</span>
              <div className={styles.segmentGroup} role="radiogroup" aria-label="收支类型">
                {LEDGER_ENTRY_TYPES.map((entryType) => (
                  <button
                    key={entryType}
                    className={
                      formState.type === entryType ? styles.segmentActive : styles.segmentButton
                    }
                    type="button"
                    aria-pressed={formState.type === entryType}
                    onClick={() => handleTypeChange(entryType)}
                  >
                    {LEDGER_ENTRY_TYPE_LABELS[entryType]}
                  </button>
                ))}
              </div>
            </section>

            <label className={styles.section} htmlFor="ledger-amount">
              <span className={styles.fieldLabel}>金额</span>
              <input
                id="ledger-amount"
                className={styles.input}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                enterKeyHint="done"
                placeholder="0.00"
                value={formState.amount}
                onChange={handleAmountChange}
                aria-invalid={Boolean(fieldErrors.amount)}
              />
              {fieldErrors.amount ? <span className={styles.error}>{fieldErrors.amount}</span> : null}
            </label>

            <label className={styles.section} htmlFor="ledger-category">
              <span className={styles.fieldLabel}>分类</span>
              <select
                id="ledger-category"
                className={styles.select}
                value={formState.category}
                onChange={handleCategoryChange}
              >
                {LEDGER_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {fieldErrors.category ? <span className={styles.error}>{fieldErrors.category}</span> : null}
            </label>

            <label className={styles.section} htmlFor="ledger-payment">
              <span className={styles.fieldLabel}>支付方式</span>
              <select
                id="ledger-payment"
                className={styles.select}
                value={formState.payment}
                onChange={handlePaymentChange}
              >
                {PAYMENT_METHODS.map((payment) => (
                  <option key={payment} value={payment}>
                    {payment}
                  </option>
                ))}
              </select>
              {fieldErrors.payment ? <span className={styles.error}>{fieldErrors.payment}</span> : null}
            </label>

            <section className={styles.section}>
              <div className={styles.timeRow}>
                <div>
                  <span className={styles.fieldLabel}>时间</span>
                  <p className={styles.timeValue}>{formatLedgerTime(formState.time)}</p>
                </div>
                <button
                  className={styles.linkButton}
                  type="button"
                  onClick={handleToggleTimeEditor}
                >
                  {formState.showTimeEditor ? '收起' : '修改'}
                </button>
              </div>

              {formState.showTimeEditor ? (
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={formatIsoTimeForDateTimeLocal(formState.time)}
                  onChange={handleTimeChange}
                  aria-invalid={Boolean(fieldErrors.time)}
                />
              ) : null}
              {fieldErrors.time ? <span className={styles.error}>{fieldErrors.time}</span> : null}
            </section>

            <label className={styles.section} htmlFor="ledger-note">
              <span className={styles.fieldLabel}>备注</span>
              <textarea
                id="ledger-note"
                className={styles.textarea}
                maxLength={LEDGER_NOTE_MAX_LENGTH}
                rows={4}
                value={formState.note}
                onChange={handleNoteChange}
                placeholder="写一点备注，方便以后回看"
                aria-invalid={Boolean(fieldErrors.note)}
              />
              {fieldErrors.note ? <span className={styles.error}>{fieldErrors.note}</span> : null}
              <span className={styles.fieldMeta}>
                {formState.note.length}/{LEDGER_NOTE_MAX_LENGTH}
              </span>
            </label>

            <div className={styles.actions}>
              <button className={styles.primaryAction} type="submit">
                {saveButtonLabel}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}

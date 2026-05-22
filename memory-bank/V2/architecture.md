## Quick Ledger Architecture Notes

### 1. Repository Purpose

This repository is a single-user, local-first bookkeeping app. The codebase stays intentionally compact and should keep revolving around three concerns:

- UI composition
- business data handling
- local persistence

The architecture should continue to favor readability and mobile fit over premature abstraction.

### 2. Current File Roles

#### Root Documentation

- [memory-bank/V2/progress.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V2/progress.md): running record of completed work, validation results, and short implementation notes for the current V2 track
- [memory-bank/V2/architecture.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V2/architecture.md): evolving architecture notes and file responsibilities for the current V2 track
- [memory-bank/V1/progress.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V1/progress.md): archived execution log for the earlier V1 track
- [memory-bank/V1/architecture.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V1/architecture.md): archived architecture notes for the earlier V1 track

#### App Entry Files

- [index.html](/Users/liuxuan/Documents/VIBE%20CODING/记账/index.html): browser entry point and root mount container
- [vite.config.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/vite.config.ts): build and dev-server configuration, including path alias support
- [package.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/package.json): scripts and dependency manifest
- [tsconfig.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/tsconfig.json): TypeScript project references
- [tsconfig.app.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/tsconfig.app.json): app-side TypeScript rules and path aliases
- [tsconfig.node.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/tsconfig.node.json): Node-side TypeScript rules for tooling files

#### Source Files

- [src/main.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/main.tsx): React bootstrap and global stylesheet import
- [src/App.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/App.tsx): legacy top-level wrapper retained as the root React entry
- [src/App.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/App.module.css): legacy shell-level styles if the root wrapper needs app-wide layout treatment
- [src/styles/global.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/styles/global.css): global visual baseline, CSS variables, reset, and typography rules
- [src/vite-env.d.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/vite-env.d.ts): Vite type declarations

#### Ledger Feature Files

- [src/features/ledger/LedgerShell.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerShell.tsx): page-level composition layer that switches between home, full-record, budget, and draft views, owns drawer state, hydrates incoming draft entry state, and routes mutations
- [src/features/ledger/LedgerShell.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerShell.module.css): outer app chrome, viewport sizing, mobile-safe shell spacing, alerts, and toast surfaces
- [src/features/ledger/LedgerShell.test.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerShell.test.tsx): shell-level regression test for the topmost view-selection boundary, ensuring the app still defaults to home, can enter the draft surface from imported state, and can surface store-level alerts
- [src/features/ledger/LedgerHomeView.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerHomeView.tsx): home-page layout that arranges stats, the central quick action, and the compact recent-record surface
- [src/features/ledger/LedgerHomeView.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerHomeView.module.css): home-page spacing and the centered middle action band that helps the page read as one single-screen composition
- [src/features/ledger/LedgerRecordsView.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerRecordsView.tsx): full-record page that reuses the shared record list, top actions, and a minimal page-level count summary without extra instructional copy
- [src/features/ledger/LedgerRecordsView.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerRecordsView.module.css): full-record page spacing and mobile stacking rules for the top actions and summary card
- [src/features/ledger/LedgerBudgetView.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerBudgetView.tsx): dedicated budget-management page that uses a single editing-target state for monthly and category budgets, shows plan-vs-actual comparison, and routes save behavior through the gear icon instead of a separate submit CTA
- [src/features/ledger/LedgerBudgetView.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerBudgetView.module.css): compact layout rules for the budget-management page, including summary cards, inline budget rows, the gear-only edit affordance, category scroll area, and mobile stacking behavior
- [src/features/ledger/LedgerBudgetView.test.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerBudgetView.test.tsx): regression test for the budget-management surface, ensuring the page renders the expected navigation, edit affordances, and category budget content while not reintroducing a separate save button
- [src/features/ledger/LedgerDrawer.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerDrawer.tsx): transactional drawer for create/edit record entry, including submit, feedback, and close behavior
- [src/features/ledger/LedgerDrawer.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerDrawer.module.css): drawer layout, safe-area treatment, mobile two-column compaction, and field density control
- [src/features/ledger/LedgerStatsPanel.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerStatsPanel.tsx): home statistics presentation, including today/month summary, the layered budget progress ring, and the lightweight entry points into the budget-management and draft-import surfaces
- [src/features/ledger/LedgerStatsPanel.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerStatsPanel.module.css): statistics block styling, including the mobile budget-ring containment rules, the outer progress circle, the vertical fill band, and the inner summary circle with over-budget text sizing
- [src/features/ledger/LedgerStatsPanel.test.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerStatsPanel.test.tsx): regression test for budget-ring progress copy, percentage, CSS variable wiring, and over-budget rendering
- [src/features/ledger/LedgerImportDraftView.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerImportDraftView.tsx): dedicated import-draft confirmation surface that previews recognized fields, supports manual correction, and distinguishes between empty, partial, and save-failure draft states
- [src/features/ledger/LedgerImportDraftView.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerImportDraftView.module.css): compact styling for the import-draft surface, including preview rows, prompt cards, choice chips, and mobile-safe form density
- [src/features/ledger/LedgerImportDraftView.test.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerImportDraftView.test.tsx): regression test for the import-draft page, ensuring the confirmation surface and fallback actions render as expected
- [src/features/ledger/LedgerRecentRecordsList.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerRecentRecordsList.tsx): shared recent/all record renderer with compact mode, preview/full surface split, edit triggers, per-row action menus, and short empty-state copy defaults
- [src/features/ledger/LedgerRecentRecordsList.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/LedgerRecentRecordsList.module.css): list layout, internal scrolling, empty states, action menus, and surface-specific compact-density overrides for mobile
- [src/features/ledger/ledger.import-draft.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/ledger.import-draft.ts): helper boundary for normalizing raw import payloads, seeding form state, generating prompts, validating fields, converting to final records, and creating sample draft data
- [src/features/ledger/ledger.import-draft.test.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/ledger.import-draft.test.ts): regression test for import-draft normalization, prompt generation, and record-conversion behavior
- [src/features/ledger/ledger.constants.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/ledger.constants.ts): canonical business vocabularies such as categories, payment methods, form modes, storage keys, budget progress states, draft sources, and more-menu action identifiers
- [src/features/ledger/ledger.schema.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/ledger.schema.ts): canonical validation layer for persisted records, budget settings, import drafts, and draft-confirmation payloads
- [src/features/ledger/ledger.form.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/ledger.form.ts): form-state defaults, normalization, and create/edit shaping for the drawer
- [src/features/ledger/ledger.store.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/ledger.store.ts): stateful boundary for hydration, CRUD, budget-setting writes, subscriptions, ordering, storage-health propagation, and derived budget snapshots
- [src/features/ledger/ledger.stats.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/features/ledger/ledger.stats.ts): pure aggregation layer for today/month totals, recent records, and record ordering

#### Shared Library Files

- [src/lib/date.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/lib/date.ts): ISO time handling and calendar boundary helpers
- [src/lib/format.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/lib/format.ts): display formatting for amounts and times
- [src/lib/ledger-tools.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/lib/ledger-tools.ts): shared budget progress, category summary, short home-summary copy, and draft-display helpers for home and budget screens
- [src/lib/index.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/lib/index.ts): convenience barrel for shared utility exports
- [src/lib/storage.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/lib/storage.ts): low-level storage adapters and availability checks
- [src/lib/storage-service.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/lib/storage-service.ts): single higher-level persistence API used by the ledger feature, now covering ledger records, form preferences, and budget settings with separate storage keys plus compact user-facing storage issue messages

#### Shared Types

- [src/types/ledger.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/types/ledger.ts): shared domain shapes for ledger records, budget settings, budget progress summaries, import drafts, and view-facing types

### 3. Style Layer Interpretation

The style layer remains split into two responsibilities:

- `src/styles/global.css` owns app-wide decisions such as palette, spacing, radius, shadow, reset, and default typography.
- feature-scoped module CSS files own only the layout and density rules for their corresponding screens or widgets.

This split matters even more now because the mobile layout depends on feature-specific density tuning. The home page, full-record page, and drawer each need their own compact rules, but they should still inherit from the same shared design tokens.

### 4. Mobile Layout Insight

The current mobile strategy is no longer “shrink everything uniformly.” Instead, the homepage is structured around priority bands:

- top band: statistics
- middle band: primary action
- bottom band: the first three records only

This means the center action is treated as a visual anchor, not just a button. The record list is intentionally compact so the page can stay within a single 393 × 740 viewport without losing readability.

### 5. Budget And Draft Model Insight

The V2 model layer now has a clearer split:

- `ledger.constants.ts` owns the fixed vocabularies that should never be invented ad hoc in pages, including budget states, draft sources, and more-menu action identifiers.
- `types/ledger.ts` owns the structural shapes for budget settings, budget progress summaries, and screenshot import drafts, alongside the existing ledger record entities.

This split keeps the upcoming budget and OCR work predictable. When later steps add validation, persistence, and derived statistics, they can rely on these types instead of reverse-engineering object shapes from the UI.

### 6. File Responsibility Reminder

The current file map should be read like this:

- `LedgerHomeView.tsx` composes the home page sections and only decides which recent records subset to show.
- `LedgerRecentRecordsList.tsx` owns the shared record rendering logic, including the compact home preview variant, the full-record surface, and the empty-state center treatment.
- `LedgerStatsPanel.tsx` owns the summary cards, the layered budget ring, and the lightweight entry points into budget management and draft import, but not the budget calculations themselves.
- `LedgerStatsPanel.tsx` now renders the real budget progress ring using the snapshot data that `LedgerShell` passes down, but it still should not calculate budget totals on its own.
- `LedgerShell.tsx` remains the page switchboard and mutation router for home, records, budget, draft, and drawer flows.
- `ledger.constants.ts` is the canonical literal source for ledger vocabularies.
- `types/ledger.ts` is the canonical type source for record, budget, and draft shapes.
- `ledger.schema.ts` is the canonical validation source for record persistence, budget settings, OCR draft recognition, and draft confirmation.
- `src/lib/ledger-tools.ts` is the canonical display-calculation source for budget progress, category summaries, and draft presentation text.
- `src/lib/storage-service.ts` is the canonical persistence gateway for records, form preferences, and budget settings, and should remain the only place that knows the storage keys for those payloads.
- `ledger.store.ts` is the canonical snapshot source for hydrated records plus derived budget state, so pages can render from one stable payload instead of recomputing budget totals separately.
- `LedgerRecordsView.tsx` should continue to pass the shared list in `surface="full"` mode so the record card can grow into an internal-scroll surface rather than expanding the page height.
- `LedgerHomeView.tsx` should continue to pass the shared list in `surface="preview"` mode so the homepage can preserve its three-slot single-screen rhythm.
- `LedgerImportDraftView.tsx` should continue to remain a confirmation surface for structured import payloads, not a place to host OCR or record persistence logic.
- `ledger.import-draft.ts` should continue to own draft normalization, prompt generation, conversion, and sample data so the page layer stays thin.

### 7. Budget Management Surface Insight

Step 8 introduced a separate budget-management surface instead of expanding the homepage further. The important separation is now:

- `LedgerStatsPanel.tsx` stays small and mostly presentational on the home page, while still exposing a budget-management entry point.
- `LedgerBudgetView.tsx` owns the actual monthly and category budget editing experience, plus the plan-vs-actual comparison cards.
- `LedgerShell.tsx` owns the route-like switching between `home`, `records`, and `budget`, so the feature remains a single-page composition problem rather than a router problem.
- `ledger.store.ts` owns the write path for budget settings, which keeps persistence updates and derived snapshot refreshes in one place.
- `ledger.store.test.ts` now guards the budget-setting write path, and `LedgerBudgetView.test.tsx` guards the surface itself.

This separation matters because the homepage must stay visually compact for 393 × 740, but the budget management workflow still needs enough room to edit monthly and category budgets without crowding the home dashboard.

Keeping these responsibilities separate matters because V2 now mixes three kinds of state on the same screen: record history, budget model, and draft entry flow. The file boundaries need to stay crisp so later budget validation and OCR draft work do not drift back into the UI layer.

### 8. Validation Layer Insight

The validation layer now has a clearer split of responsibilities:

- `ledgerRecordSchema` continues to own the persisted ledger record shape and remains the final guard for actual entries.
- `ledgerBudgetSettingsSchema` owns month-budget storage validation, including category budget maps and the rule that budget values must stay positive.
- `ledgerImportDraftSchema` owns OCR or shortcut draft recognition, including the rule that a draft must contain at least one usable field before it can be confirmed.
- `ledgerImportDraftConfirmationSchema` owns the handoff from draft to final creation and ensures the confirmation flow still satisfies the base record rules.

This split keeps later storage and UI work simpler because each layer can validate the shape it owns without re-implementing shared rules.

### 9. Display Computation Insight

The display-calculation layer now lives in `src/lib/ledger-tools.ts` instead of the page components:

- `calculateLedgerBudgetProgress` turns raw budget and expense numbers into a reusable progress summary.
- `calculateLedgerMonthlyExpenseByCategory` derives per-category monthly totals from records without involving the UI.
- `buildLedgerBudgetSummaryCopy` converts the budget state into short homepage-ready copy.
- `buildLedgerCategoryBudgetSummaries` packages category budget data together with display strings so the budget surface can render without additional logic.
- `formatLedgerDraftAmountDisplay` and `formatLedgerDraftTimeDisplay` give the draft confirmation flow a consistent presentation vocabulary.

This keeps budget and draft presentation consistent across screens. When Step 5 adds storage for budget settings, the UI can load the raw values, pass them through these helpers, and render the result without duplicating formatting or arithmetic in the component tree.

### 10. Home Budget Ring Insight

The homepage budget ring is now a true layered progress visualization rather than a decorative placeholder:

- `ledger.store.ts` provides the current budget snapshot and derived monthly progress.
- `LedgerShell.tsx` passes that snapshot into the home view unchanged.
- `LedgerStatsPanel.tsx` consumes the snapshot, computes only presentation values such as clamped progress ratio and display labels, and uses CSS custom properties to hand the ratio and start angle to the stylesheet.
- `LedgerStatsPanel.module.css` turns those custom properties into an outer conic-gradient circle, a top-down fill band, and a centered inner summary circle so the card reads as a layered budget surface instead of a flat badge.
- `LedgerStatsPanel.module.css` also adjusts the over-budget copy density so the smaller circle can still show the overspent amount without clipping.
- `LedgerStatsPanel.test.tsx` guards the ring text, progress wiring, and over-budget rendering so later visual refactors do not accidentally revert the ring back to a placeholder or truncate the overspent amount.

This keeps the math in the state and tool layers, while the component and stylesheet remain responsible only for presentation.

### 11. Storage Layer Insight

The storage layer now has one more clearly separated payload family:

- `readLedgerRecords` / `writeLedgerRecords` continue to own record persistence.
- `readLedgerFormPreferences` / `writeLedgerFormPreferences` continue to own create-mode field preferences.
- `readLedgerBudgetSettings` / `writeLedgerBudgetSettings` / `clearLedgerBudgetSettings` now own monthly budget and category budget persistence.

The important architectural rule is that these payloads share a storage service, but not a storage key. That keeps budget data isolated from records and prevents later features from accidentally treating one payload as another. The service also preserves a consistent fallback style: unavailable storage and damaged payloads both return safe defaults and explicit issue metadata.

### 12. State Snapshot Insight

`ledger.store.ts` now does more than manage CRUD:

- it hydrates records and budget settings together,
- it derives the monthly budget progress summary from the current records plus stored budget settings,
- it derives category budget summaries for the budget surface,
- and it packages a short budget copy payload for the homepage.

That makes the store the single snapshot source for both the home screen and the upcoming budget screen. The page layer should treat the store snapshot as already-prepared data and avoid reimplementing any budget or category aggregation logic.

### 13. Recent Records Surface Insight

The recent-record surface now has a deliberately split presentation contract:

- `LedgerHomeView.tsx` uses `LedgerRecentRecordsList` with `surface="preview"` so the homepage stays visually short, keeps exactly three visible record slots, and suppresses note/action-hint clutter.
- `LedgerRecordsView.tsx` uses the same list with `surface="full"` so the full-record page can keep notes visible while moving the scroll behavior into the list body instead of the whole page.
- `LedgerRecentRecordsList.tsx` owns the branching logic between preview and full surfaces, which keeps the component reusable without making the page components duplicate their own truncation rules.
- `LedgerRecentRecordsList.module.css` owns the mobile-specific density rules for both surfaces, so compact preview and compact full can evolve independently without reintroducing two separate list implementations.

This split is important because it preserves one shared renderer while still honoring two very different UX goals: the homepage must read like a fixed three-item dashboard strip, and the full-record page must behave like a scrollable browser inside a card.

### 14. Budget Edit-Commit Insight

The budget-management page now treats the gear icon as the only entry and exit for editing:

- `LedgerBudgetView.tsx` keeps a single `editingTarget` state that decides whether the monthly row or one category row is editable.
- `LedgerBudgetView.tsx` uses the same gear button to enter edit mode on first click and to persist the current draft on a second click, so there is no separate bottom save action competing for space.
- `LedgerBudgetView.module.css` styles the gear as a bare icon rather than a framed button, which keeps the budget rows visually light and leaves more room to the category list.
- `LedgerBudgetView.test.tsx` guards the interaction contract by asserting the page still renders the edit entry points and no longer exposes a separate `保存预算` button.

This pattern matters because the budget page is intentionally dense. Making edit/save share one inline control keeps the screen compact, reduces visual noise, and makes it easier to scale the category list without sacrificing a stable single-screen layout.

### 15. Draft Import Surface Insight

- `LedgerShell.tsx` now owns the `draft` view mode and can hydrate an initial draft from URL query parameters via `readLedgerImportDraftFromLocation`.
- `LedgerStatsPanel.tsx` exposes `截图导入说明` from the home more menu so the draft surface can be launched without introducing another route system.
- `LedgerImportDraftView.tsx` is the interactive confirmation surface for structured import payloads. It previews the recognized fields, lets the user correct them, and keeps `改用手动记账` as the fallback path.
- `ledger.import-draft.ts` is the helper boundary for normalizing raw payloads, seeding form state, generating prompts, validating fields, converting to a final record, and creating sample data for development.
- `LedgerImportDraftView.module.css` keeps the confirmation surface compact enough for mobile while still separating preview, prompt, and editable controls.
- `LedgerImportDraftView.test.tsx` and `ledger.import-draft.test.ts` guard the view contract and helper contract so later OCR or shortcut changes do not break the confirmation path.

### 16. Draft Integration Boundary Insight

- The codebase still does not implement OCR itself. The current contract is: an external shortcut or importer supplies structured draft data, and the app validates, previews, and confirms it.
- `LedgerShell.tsx` is the only place that should decide whether a draft should open the draft view or fall back to home/manual entry.
- `ledger.schema.ts` remains the final validator before a draft becomes a ledger record, so the import flow stays consistent with manual entry rules.
- If later steps add real image recognition, they should feed this same draft helper and confirmation surface rather than bypassing it.

### 17. Copy Density Insight

- `src/lib/ledger-tools.ts` now also owns the short-form budget summary vocabulary for the home and budget surfaces, so components do not re-expand those messages into longer instructional text.
- `LedgerRecentRecordsList.tsx` keeps the default empty-state copy intentionally short, and page-level callers only override it when a surface truly needs a different tone.
- `LedgerRecordsView.tsx` now treats the count card as a compact status surface instead of a secondary explanation block, which helps the full-record page stay aligned with the V2 “tool, not guide” direction.
- `LedgerImportDraftView.tsx` now distinguishes among three different microcopy states: no recognized content, partial recognized content, and editable-valid draft. That split keeps the page understandable without adding long paragraphs.
- `src/lib/storage-service.ts` is now the source of truth not only for storage fallback behavior, but also for the short storage-error strings that the shell and store can surface consistently.

### 19. Shell Acceptance Insight

- `LedgerShell.tsx` is now the explicit integration boundary for V2 acceptance. It is the only place where store snapshot state, draft-entry state, page switching, drawer state, and toast/alert presentation are all visible at once.
- `LedgerShell.test.tsx` should stay intentionally narrow. Its job is not to duplicate child-component rendering assertions, but to catch regression in the shell’s composition contract: defaulting to home, entering draft mode from imported state, and surfacing storage-related alerts from the store snapshot.
- Manual mobile acceptance should continue to be organized around `LedgerShell.tsx`, because the critical user flows for V2 are shell transitions rather than isolated component rendering. The meaningful acceptance path is: home -> budget -> records and home -> draft, with the drawer remaining a shell-owned fallback action.
- This means future contributors should add shell tests only when a change affects cross-view orchestration, incoming-entry state, or shell-level feedback. Changes that only affect one page’s internal markup should stay in that page’s own test file.

### 18. Architectural Decisions

- Keep local storage access behind a dedicated service layer.
- Keep record validation in a shared schema layer.
- Keep statistics as pure computation where possible.
- Keep the initial app simple and avoid premature route complexity.
- Treat the memory-bank documents as the decision log for future contributors.
- Keep domain constants in the ledger feature folder and shared type shapes in the types folder.
- Keep schema definitions reusable by both UI and persistence layers.
- Keep date and amount helpers isolated in `src/lib` so they can be reused by statistics, forms, and record rendering.
- Keep time conversion logic in `src/lib` so the UI never has to reason about ISO parsing or calendar boundaries directly.
- Keep storage service calls centralized so feature code never reaches into `localStorage` directly.
- Keep the ledger store as the single stateful boundary between UI and storage so components only consume snapshots and actions.
- Keep statistics pure and derived so feature code can calculate totals without mutating store state.
- Keep `LedgerShell` as the composition point for page transitions so individual view slices remain simple and focused.
- Keep `LedgerStatsPanel` as the presentation surface for home statistics so the shell can pass a ready-made snapshot instead of duplicating formatting or aggregation logic in the view layer.
- Keep `LedgerStatsPanel` lean by using it as the home summary surface plus a launch point into the dedicated budget-management view.
- Keep `LedgerDrawer` as the interaction shell for the booking flow so focus management, overlay dismissal, scroll locking, and motion live in one place before form fields are introduced.
- Keep `ledger.form.ts` as the form-state helper layer so default values, amount normalization, and create/edit shaping stay reusable and testable.
- Keep the last-used category and payment method in the storage service boundary so the drawer can restore create-mode preferences without duplicating persistence logic in the component.
- Keep `createLedgerRecordFromDrawerState` as the form-to-domain conversion boundary so the drawer submits a validated ledger entity instead of mutating store shapes directly.
- Keep `validateLedgerDrawerFormState` as the pre-submit guard so the drawer can surface field-level errors before conversion or store writes happen.
- Keep `LedgerRecentRecordsList` as the shared record surface so the shell can pass either recent or full-record snapshots without letting the view rebuild ordering or truncation logic.
- Keep `LedgerRecentRecordsList` in compact mode for the home page so the page can preserve its single-screen layout on narrow mobile viewports.
- Keep `LedgerBudgetView` as the dedicated budget-management page so budget editing stays isolated from the home dashboard and the full-record page.
- Keep the budget page edit/save contract on one gear icon so monthly and category budget changes do not require a separate save CTA that would consume extra vertical space.

### 6. Step 1 Outcome

The current V2 track now has a documented mobile-first home layout that fits the 393 × 740 target much more deliberately than the earlier draft. The implementation emphasizes:

- a contained statistics panel
- a centered call-to-action band
- a compact recent-record strip
- an internal-scroll full-record surface

That means future work should extend the same density system rather than introducing new oversized blocks that would break the single-screen contract again.

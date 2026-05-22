## Quick Ledger Architecture Notes

### 1. Repository Purpose

This repository is a single-user, local-first bookkeeping app. The codebase is intentionally small and should stay organized around three things:

- UI composition
- business data handling
- local persistence

The architecture should favor clarity over abstraction.

### 2. Current File Roles

#### Root Documentation

- [PRD.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/PRD.md): deprecated source document kept for reference only
- [memory-bank/V1/design-document.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V1/design-document.md): product design source of truth for the archived V1 track
- [memory-bank/V1/tech-stack.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V1/tech-stack.md): technology choice and implementation guidance for archived V1 work
- [memory-bank/V1/implementation-plan.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V1/implementation-plan.md): step-by-step execution plan for archived V1 work
- [memory-bank/V1/progress.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V1/progress.md): running record of completed work and verification status for archived V1 work
- [memory-bank/V1/architecture.md](/Users/liuxuan/Documents/VIBE%20CODING/记账/memory-bank/V1/architecture.md): evolving architecture notes and file responsibilities for archived V1 work

#### App Entry Files

- [index.html](/Users/liuxuan/Documents/VIBE%20CODING/记账/index.html): browser entry point and root mount container
- [vite.config.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/vite.config.ts): build and dev-server configuration
- [package.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/package.json): scripts and dependency manifest
- [tsconfig.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/tsconfig.json): TypeScript project references
- [tsconfig.app.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/tsconfig.app.json): app-side TypeScript rules and path aliases
- [tsconfig.node.json](/Users/liuxuan/Documents/VIBE%20CODING/记账/tsconfig.node.json): Node-side TypeScript rules for tooling files

#### Source Files

- [src/main.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/main.tsx): React bootstrap and global stylesheet import
- [src/App.tsx](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/App.tsx): temporary application shell for the first step
- [src/App.module.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/App.module.css): scoped styles for the current shell UI
- [src/styles/global.css](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/styles/global.css): global visual baseline and CSS variables
- [src/vite-env.d.ts](/Users/liuxuan/Documents/VIBE%20CODING/记账/src/vite-env.d.ts): Vite type declarations

### 3. Style Layer Interpretation

The style layer is now intentionally split into two responsibilities:

- `src/styles/global.css` owns app-wide decisions such as palette, spacing, radius, shadow, reset, and default typography.
- `src/App.module.css` only styles the current top-level shell and should not become a place for global design tokens.

This split matters because later feature work should rely on shared variables instead of redefining colors or spacing in each screen.

### 3. Planned Source Layout

#### `src/components`

Reusable presentational components that do not own bookkeeping state. Examples expected later:

- buttons
- cards
- list rows
- status badges

#### `src/features/ledger`

Feature-owned bookkeeping logic and UI. This is where the app’s core domain should live later:

- ledger page shell
- drawer form
- record list
- statistics logic
- state store
- domain schema

Current expectation:

- `ledger.constants.ts` is the canonical place for fixed business vocabularies and size limits.
- `ledger.schema.ts` is the canonical place for validating ledger records and record input shapes.
- `ledger.store.ts` is the canonical place for stateful record operations, hydration, subscriptions, and record ordering.
- `ledger.stats.ts` is the canonical place for pure statistics and record aggregation derived from store snapshots.
- `LedgerShell.tsx` is the page-level composition layer that switches between home and records views and controls the drawer.
- `LedgerHomeView.tsx` and `LedgerRecordsView.tsx` are presentational page slices that will later receive data and actions from the shell.
- `LedgerDrawer.tsx` is the modal/drawer surface for record entry, currently acting as the overlay container for later form work.
- Future form, storage, and state modules should depend on the schema rather than reimplementing validation in UI code.

#### `src/lib`

Shared utilities that are not feature-specific. This is the correct place for:

- storage adapters
- date helpers
- formatting helpers
- other reusable pure functions

Current expectation:

- `src/lib/date.ts` should own ISO time handling and calendar boundary helpers.
- `src/lib/format.ts` should own display formatting for amounts and dates.
- `src/lib/index.ts` can act as a convenience barrel for future feature code.
- `src/lib/storage.ts` should own low-level safe read/write helpers and storage availability checks.
- `src/lib/storage-service.ts` should be the single higher-level ledger storage API used by the rest of the app.
- Keep `src/lib` free of React state, DOM access, and business mutation logic.

#### `src/styles`

Global style primitives and design variables. Keep app-wide visual decisions here, not inside feature logic.

Current expectation:

- global visual tokens live in `src/styles/global.css`
- screen-specific but reusable app shell styles live in module CSS files beside the relevant component
- feature-level visuals should still avoid redefining the overall design system

#### `src/types`

Shared TypeScript types that are useful across more than one feature or utility layer.

Current expectation:

- `src/types/ledger.ts` should hold shared domain shapes such as record entities and derived unions.
- `src/features/ledger/ledger.constants.ts` should hold canonical business vocabularies such as categories, payment methods, form modes, and storage keys.
- Feature logic should import from these files instead of redefining the same strings locally.

### 4. Architectural Decisions

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
- Keep `LedgerDrawer` as the interaction shell for the booking flow so focus management, overlay dismissal, scroll locking, and motion live in one place before form fields are introduced.
- Keep `ledger.form.ts` as the form-state helper layer so default values, amount normalization, and create/edit shaping stay reusable and testable.
- Keep the last-used category and payment method in the storage service boundary so the drawer can restore create-mode preferences without duplicating persistence logic in the component.
- Keep `createLedgerRecordFromDrawerState` as the form-to-domain conversion boundary so the drawer submits a validated ledger entity instead of mutating store shapes directly.
- Keep `validateLedgerDrawerFormState` as the pre-submit guard so the drawer can surface field-level errors before conversion or store writes happen.
- Keep `LedgerRecentRecordsList` as the home-page record surface so the shell passes a ready-made recent-record snapshot instead of letting the view rebuild ordering or truncation logic.

### 5. Step 1 Outcome

The repository now has a minimal but valid front-end scaffold. That means future work can focus on product behavior instead of setup.

### 6. Step 10 Insight

The home page is now split into three layers with clear responsibilities:

- `LedgerShell.tsx` computes the current ledger snapshot and chooses which top-level view is visible.
- `LedgerHomeView.tsx` arranges the home screen sections and receives already-computed stats as props.
- `LedgerStatsPanel.tsx` renders the headline numbers and empty-state copy, but does not reach into the store directly.

This pattern keeps the home screen easy to extend. Later work can add recent records, quick actions, or richer summaries without turning the view into a data-fetching component.

### 7. Step 11 Insight

The drawer is now a real interaction boundary, not just a static container.

- `LedgerHomeView.tsx` only triggers the drawer open action.
- `LedgerDrawer.tsx` owns dismissal behavior, keyboard escape handling, body scroll locking, focus restoration, and motion state.

This separation keeps later form work focused on data entry instead of re-implementing modal behavior in each field or button.

### 8. Step 12 Insight

The drawer now has a clear internal split:

- `LedgerDrawer.tsx` owns the interactive surface, field wiring, and visual behavior.
- `ledger.form.ts` owns initial form shape, create/edit defaults, and amount normalization.
- `storage-service.ts` owns persisted form preferences for create mode.

This means future submit logic can reuse the same helper layer without turning the component into a bundle of one-off defaulting rules.

### 9. Step 13 Insight

The add-record flow now has a clean end-to-end boundary:

- `LedgerDrawer.tsx` gathers user input and emits a domain record.
- `ledger.form.ts` converts drawer state into a ledger entity.
- `LedgerShell.tsx` routes the submit action to `ledgerStore`.
- `ledger.store.ts` persists the record and notifies subscribers so the home view refreshes automatically.

This keeps the UI responsive while still making the state and storage layers the only places that can actually change ledger data.

### 10. Step 14 Insight

Validation now happens in two layers:

- `ledger.schema.ts` remains the canonical domain validation source for persisted records and record-shaped payloads.
- `ledger.form.ts` now provides a pre-submit form validation pass tailored to interactive feedback in the drawer.

This split keeps the domain rules authoritative while still letting the UI explain errors near the relevant fields before any store mutation occurs.

### 11. Step 15 Insight

The home page now has a clearer structure:

- `LedgerShell.tsx` still owns the current snapshot and view switching.
- `LedgerStatsPanel.tsx` owns the headline summary numbers.
- `LedgerRecentRecordsList.tsx` owns the recent-record presentation and empty state.

This keeps list rendering local to the home view while the shell continues to provide already-derived data, which makes later editing and deletion affordances easier to slot in without changing the data flow again.

### 12. Step 16 Insight

The recent-record list has now become the first editable entry point in the app:

- `LedgerRecentRecordsList.tsx` now exposes each record as an edit trigger instead of a passive display row.
- `LedgerHomeView.tsx` forwards the edit callback down to the list without owning any drawer state itself.
- `LedgerShell.tsx` receives the selected record and switches the drawer into edit mode so the form can preload the original values.

This keeps the edit flow tightly scoped to the home page’s recent-record surface for now. The full records page can still gain its own record actions later without changing the underlying edit plumbing.

### 13. Step 17 Insight

Deletion is now handled through the same record-list surfaces instead of a separate hidden action path:

- `LedgerRecentRecordsList.tsx` now renders a small action menu per record so delete stays discoverable without overwhelming the row.
- `LedgerShell.tsx` owns the confirmation step and dispatches the actual removal through `ledgerStore`, keeping mutation logic in the state layer.
- `LedgerRecordsView.tsx` now reuses the same record list component, which means homepage and full-page record actions stay visually and behaviorally aligned.

This arrangement keeps deletion reusable without duplicating record-row logic. Later work can refine the confirmation UI or menu styling without changing where deletion is actually wired in.

### 14. Step 18 Insight

The full-record page now shares the same record row component as the home page, but with a different scope:

- `LedgerRecordsView.tsx` has become a real full-browser surface instead of a placeholder.
- `LedgerRecentRecordsList.tsx` is now the common row renderer for both recent and all-record views, with configurable titles and empty states.
- `LedgerShell.tsx` remains the decision point for which view is active, so the page switch still stays lightweight and local.

This keeps the record-browser experience consistent while still letting the home page focus on a short, high-signal recent list. Future polish can change the copy or layout on either page without splitting the underlying row logic again.

### 15. Step 19 Insight

The interaction layer now has a clearer visual contract:

- `LedgerDrawer.tsx` handles success and error feedback internally, including auto-clearing success messages after submission.
- `LedgerDrawer.module.css` owns the mobile-safe drawer surface, including safe-area spacing, dynamic viewport height handling, and feedback tone styling.
- `LedgerShell.tsx` now owns delete success/error toasts at the page level so destructive actions are visible even after list rerenders.
- `LedgerShell.module.css` owns the floating toast presentation, keeping global feedback distinct from inline content.

This keeps transient status messaging from getting buried in list content or form flow. Later work can adjust the copy or timeout behavior without moving the toast responsibilities again.

### 16. Step 20 Insight

The app now distinguishes healthy, empty, and degraded storage states instead of treating every empty list the same:

- `storage-service.ts` now reports whether record loading was successful, read-failed, invalid, or unavailable.
- `ledger.store.ts` preserves that storage health information in its snapshot so the UI can render the right warning or block the right actions.
- `LedgerShell.tsx` surfaces storage alerts at the page level and blocks mutating actions when storage is unavailable.
- `LedgerStatsPanel.tsx` and the list views still own the normal empty-state presentation, so a real empty account remains distinct from a storage problem.

This separation keeps the product honest about why the screen is empty while still preserving usability for ordinary no-record states. Later test work can target each storage issue independently without changing the UI contract again.

### 17. Step 21 Insight

The test suite now covers the product at three different levels:

- `storage-service.test.ts` verifies read/write safety, malformed data handling, and unavailable-storage reporting.
- `ledger.store.test.ts` verifies state hydration, CRUD behavior, and snapshot metadata propagation.
- `ledger.flow.test.ts` ties together the store, stats, and persisted storage so the core user journey is protected end to end.

This test layering matters because it keeps the low-level storage boundaries honest while still guarding the visible user flow. Future changes to input handling or storage shape can be checked against the same layered test strategy without rewriting the whole suite.

### 18. Step 22 Insight

Mobile acceptance confirmed the app’s shell and interaction layers hold together on a narrow viewport:

- `LedgerShell.tsx` still acts as the view switchboard, but it now clearly survives the mobile flows for creating, editing, deleting, and jumping between home and full-record views.
- `LedgerDrawer.tsx` remains the transactional entry surface, and its safe-area / scroll behavior proved workable on a 400px responsive viewport.
- `LedgerRecentRecordsList.tsx` and `LedgerRecordsView.tsx` continue to share the same row and action patterns, which keeps the mobile interaction model consistent between recent and full lists.
- The storage and state layers held up under refresh, so persistence remains a true local-browser contract rather than just an in-session UI illusion.

This step is mostly about confidence in the assembled product rather than new structure, but it confirms the current file boundaries are already suitable for real mobile usage and production builds.

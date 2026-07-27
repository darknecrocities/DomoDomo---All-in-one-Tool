---
name: domodomo-frontend-architecture
description: Maintain DomoDomo React, TypeScript, routing, shared components, styles, and browser-first frontend architecture. Use when changing src/, pages, components, utilities, tool shells, or frontend build behavior.
---

# DomoDomo Frontend Architecture

Maintain React 19, TypeScript, Vite, React Router, Tailwind utilities, and DomoDomo shared UI.

## Operating contract

- **Scope:** React 19, TypeScript, Vite, React Router, Tailwind utilities, and DomoDomo shared UI.
- **Primary files:** src/App.tsx, src/main.tsx, src/pages/, src/components/, src/utils/, src/index.css, and src/App.css.
- **Before changing code:** Read the nearest working component, route, registry entry, BrandKit, and shared helper before adding abstractions.

## 01. application entry points

1. For **application entry points**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **application entry points**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **application entry points**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **application entry points**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **application entry points**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **application entry points**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **application entry points**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **application entry points**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **application entry points**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **application entry points**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **application entry points**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **application entry points**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **application entry points**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **application entry points**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **application entry points**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **application entry points**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **application entry points**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **application entry points**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **application entry points**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **application entry points**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **application entry points**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. route composition

1. For **route composition**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **route composition**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **route composition**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **route composition**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **route composition**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **route composition**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **route composition**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **route composition**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **route composition**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **route composition**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **route composition**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **route composition**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **route composition**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **route composition**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **route composition**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **route composition**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **route composition**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **route composition**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **route composition**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **route composition**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **route composition**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. shell and layout components

1. For **shell and layout components**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **shell and layout components**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **shell and layout components**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **shell and layout components**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **shell and layout components**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **shell and layout components**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **shell and layout components**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **shell and layout components**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **shell and layout components**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **shell and layout components**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **shell and layout components**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **shell and layout components**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **shell and layout components**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **shell and layout components**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **shell and layout components**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **shell and layout components**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **shell and layout components**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **shell and layout components**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **shell and layout components**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **shell and layout components**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **shell and layout components**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. page-level state

1. For **page-level state**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **page-level state**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **page-level state**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **page-level state**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **page-level state**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **page-level state**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **page-level state**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **page-level state**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **page-level state**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **page-level state**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **page-level state**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **page-level state**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **page-level state**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **page-level state**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **page-level state**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **page-level state**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **page-level state**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **page-level state**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **page-level state**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **page-level state**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **page-level state**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. shared component boundaries

1. For **shared component boundaries**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **shared component boundaries**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **shared component boundaries**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **shared component boundaries**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **shared component boundaries**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **shared component boundaries**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **shared component boundaries**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **shared component boundaries**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **shared component boundaries**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **shared component boundaries**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **shared component boundaries**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **shared component boundaries**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **shared component boundaries**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **shared component boundaries**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **shared component boundaries**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **shared component boundaries**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **shared component boundaries**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **shared component boundaries**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **shared component boundaries**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **shared component boundaries**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **shared component boundaries**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. tool workspace integration

1. For **tool workspace integration**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **tool workspace integration**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **tool workspace integration**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **tool workspace integration**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **tool workspace integration**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **tool workspace integration**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **tool workspace integration**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **tool workspace integration**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **tool workspace integration**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **tool workspace integration**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **tool workspace integration**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **tool workspace integration**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **tool workspace integration**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **tool workspace integration**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **tool workspace integration**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **tool workspace integration**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **tool workspace integration**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **tool workspace integration**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **tool workspace integration**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **tool workspace integration**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **tool workspace integration**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. typed utility contracts

1. For **typed utility contracts**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **typed utility contracts**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **typed utility contracts**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **typed utility contracts**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **typed utility contracts**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **typed utility contracts**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **typed utility contracts**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **typed utility contracts**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **typed utility contracts**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **typed utility contracts**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **typed utility contracts**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **typed utility contracts**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **typed utility contracts**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **typed utility contracts**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **typed utility contracts**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **typed utility contracts**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **typed utility contracts**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **typed utility contracts**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **typed utility contracts**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **typed utility contracts**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **typed utility contracts**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. React effect lifecycles

1. For **React effect lifecycles**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **React effect lifecycles**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **React effect lifecycles**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **React effect lifecycles**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **React effect lifecycles**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **React effect lifecycles**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **React effect lifecycles**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **React effect lifecycles**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **React effect lifecycles**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **React effect lifecycles**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **React effect lifecycles**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **React effect lifecycles**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **React effect lifecycles**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **React effect lifecycles**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **React effect lifecycles**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **React effect lifecycles**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **React effect lifecycles**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **React effect lifecycles**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **React effect lifecycles**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **React effect lifecycles**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **React effect lifecycles**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. file input handling

1. For **file input handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **file input handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **file input handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **file input handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **file input handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **file input handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **file input handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **file input handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **file input handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **file input handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **file input handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **file input handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **file input handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **file input handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **file input handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **file input handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **file input handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **file input handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **file input handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **file input handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **file input handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. asynchronous request state

1. For **asynchronous request state**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **asynchronous request state**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **asynchronous request state**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **asynchronous request state**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **asynchronous request state**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **asynchronous request state**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **asynchronous request state**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **asynchronous request state**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **asynchronous request state**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **asynchronous request state**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **asynchronous request state**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **asynchronous request state**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **asynchronous request state**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **asynchronous request state**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **asynchronous request state**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **asynchronous request state**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **asynchronous request state**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **asynchronous request state**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **asynchronous request state**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **asynchronous request state**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **asynchronous request state**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. object URL ownership

1. For **object URL ownership**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **object URL ownership**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **object URL ownership**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **object URL ownership**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **object URL ownership**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **object URL ownership**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **object URL ownership**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **object URL ownership**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **object URL ownership**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **object URL ownership**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **object URL ownership**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **object URL ownership**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **object URL ownership**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **object URL ownership**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **object URL ownership**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **object URL ownership**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **object URL ownership**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **object URL ownership**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **object URL ownership**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **object URL ownership**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **object URL ownership**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. worker and timer cleanup

1. For **worker and timer cleanup**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **worker and timer cleanup**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **worker and timer cleanup**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **worker and timer cleanup**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **worker and timer cleanup**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **worker and timer cleanup**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **worker and timer cleanup**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **worker and timer cleanup**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **worker and timer cleanup**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **worker and timer cleanup**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **worker and timer cleanup**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **worker and timer cleanup**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **worker and timer cleanup**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **worker and timer cleanup**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **worker and timer cleanup**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **worker and timer cleanup**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **worker and timer cleanup**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **worker and timer cleanup**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **worker and timer cleanup**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **worker and timer cleanup**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **worker and timer cleanup**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. responsive layout rules

1. For **responsive layout rules**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **responsive layout rules**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **responsive layout rules**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **responsive layout rules**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **responsive layout rules**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **responsive layout rules**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **responsive layout rules**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **responsive layout rules**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **responsive layout rules**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **responsive layout rules**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **responsive layout rules**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **responsive layout rules**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **responsive layout rules**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **responsive layout rules**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **responsive layout rules**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **responsive layout rules**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **responsive layout rules**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **responsive layout rules**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **responsive layout rules**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **responsive layout rules**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **responsive layout rules**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. Tailwind and CSS conventions

1. For **Tailwind and CSS conventions**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **Tailwind and CSS conventions**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **Tailwind and CSS conventions**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **Tailwind and CSS conventions**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **Tailwind and CSS conventions**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **Tailwind and CSS conventions**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **Tailwind and CSS conventions**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **Tailwind and CSS conventions**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **Tailwind and CSS conventions**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **Tailwind and CSS conventions**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **Tailwind and CSS conventions**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **Tailwind and CSS conventions**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **Tailwind and CSS conventions**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **Tailwind and CSS conventions**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **Tailwind and CSS conventions**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **Tailwind and CSS conventions**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **Tailwind and CSS conventions**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **Tailwind and CSS conventions**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **Tailwind and CSS conventions**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **Tailwind and CSS conventions**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **Tailwind and CSS conventions**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. dark theme consistency

1. For **dark theme consistency**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **dark theme consistency**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **dark theme consistency**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **dark theme consistency**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **dark theme consistency**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **dark theme consistency**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **dark theme consistency**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **dark theme consistency**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **dark theme consistency**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **dark theme consistency**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **dark theme consistency**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **dark theme consistency**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **dark theme consistency**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **dark theme consistency**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **dark theme consistency**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **dark theme consistency**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **dark theme consistency**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **dark theme consistency**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **dark theme consistency**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **dark theme consistency**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **dark theme consistency**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. Lucide icon usage

1. For **Lucide icon usage**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **Lucide icon usage**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **Lucide icon usage**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **Lucide icon usage**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **Lucide icon usage**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **Lucide icon usage**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **Lucide icon usage**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **Lucide icon usage**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **Lucide icon usage**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **Lucide icon usage**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **Lucide icon usage**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **Lucide icon usage**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **Lucide icon usage**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **Lucide icon usage**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **Lucide icon usage**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **Lucide icon usage**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **Lucide icon usage**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **Lucide icon usage**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **Lucide icon usage**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **Lucide icon usage**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **Lucide icon usage**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. error and empty states

1. For **error and empty states**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **error and empty states**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **error and empty states**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **error and empty states**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **error and empty states**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **error and empty states**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **error and empty states**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **error and empty states**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **error and empty states**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **error and empty states**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **error and empty states**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **error and empty states**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **error and empty states**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **error and empty states**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **error and empty states**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **error and empty states**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **error and empty states**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **error and empty states**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **error and empty states**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **error and empty states**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **error and empty states**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. loading and progress states

1. For **loading and progress states**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **loading and progress states**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **loading and progress states**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **loading and progress states**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **loading and progress states**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **loading and progress states**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **loading and progress states**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **loading and progress states**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **loading and progress states**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **loading and progress states**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **loading and progress states**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **loading and progress states**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **loading and progress states**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **loading and progress states**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **loading and progress states**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **loading and progress states**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **loading and progress states**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **loading and progress states**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **loading and progress states**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **loading and progress states**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **loading and progress states**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. accessibility semantics

1. For **accessibility semantics**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **accessibility semantics**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **accessibility semantics**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **accessibility semantics**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **accessibility semantics**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **accessibility semantics**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **accessibility semantics**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **accessibility semantics**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **accessibility semantics**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **accessibility semantics**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **accessibility semantics**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **accessibility semantics**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **accessibility semantics**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **accessibility semantics**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **accessibility semantics**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **accessibility semantics**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **accessibility semantics**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **accessibility semantics**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **accessibility semantics**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **accessibility semantics**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **accessibility semantics**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. Vite build integration

1. For **Vite build integration**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **Vite build integration**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **Vite build integration**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **Vite build integration**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **Vite build integration**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **Vite build integration**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **Vite build integration**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **Vite build integration**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **Vite build integration**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **Vite build integration**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **Vite build integration**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **Vite build integration**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **Vite build integration**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **Vite build integration**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **Vite build integration**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **Vite build integration**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **Vite build integration**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **Vite build integration**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **Vite build integration**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **Vite build integration**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **Vite build integration**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

---
name: domodomo-design-accessibility
description: Maintain DomoDomo’s dark visual system, responsive layouts, accessible interactions, brand consistency, and component ergonomics. Use when changing styles, shared components, pages, forms, overlays, controls, or visual tool workspaces.
---

# DomoDomo Design and Accessibility

Maintain The visual and interaction system used by all DomoDomo tools, pages, and overlays across desktop and mobile browsers.

## Operating contract

- **Scope:** The visual and interaction system used by all DomoDomo tools, pages, and overlays across desktop and mobile browsers.
- **Primary files:** src/index.css, src/App.css, src/utils/BrandKit.ts, src/components/, src/pages/, and UI-heavy files in src/tools/.
- **Before changing code:** Read BrandKit, shared CSS, a comparable responsive component, and the current accessibility behavior before introducing visual patterns.

## 01. brand color usage

1. For **brand color usage**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **brand color usage**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **brand color usage**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **brand color usage**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **brand color usage**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **brand color usage**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **brand color usage**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **brand color usage**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **brand color usage**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **brand color usage**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **brand color usage**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **brand color usage**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **brand color usage**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **brand color usage**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **brand color usage**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **brand color usage**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **brand color usage**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **brand color usage**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **brand color usage**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **brand color usage**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **brand color usage**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. typography hierarchy

1. For **typography hierarchy**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **typography hierarchy**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **typography hierarchy**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **typography hierarchy**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **typography hierarchy**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **typography hierarchy**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **typography hierarchy**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **typography hierarchy**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **typography hierarchy**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **typography hierarchy**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **typography hierarchy**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **typography hierarchy**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **typography hierarchy**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **typography hierarchy**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **typography hierarchy**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **typography hierarchy**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **typography hierarchy**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **typography hierarchy**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **typography hierarchy**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **typography hierarchy**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **typography hierarchy**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. glass-card composition

1. For **glass-card composition**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **glass-card composition**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **glass-card composition**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **glass-card composition**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **glass-card composition**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **glass-card composition**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **glass-card composition**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **glass-card composition**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **glass-card composition**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **glass-card composition**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **glass-card composition**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **glass-card composition**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **glass-card composition**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **glass-card composition**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **glass-card composition**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **glass-card composition**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **glass-card composition**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **glass-card composition**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **glass-card composition**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **glass-card composition**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **glass-card composition**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. spacing rhythm

1. For **spacing rhythm**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **spacing rhythm**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **spacing rhythm**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **spacing rhythm**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **spacing rhythm**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **spacing rhythm**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **spacing rhythm**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **spacing rhythm**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **spacing rhythm**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **spacing rhythm**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **spacing rhythm**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **spacing rhythm**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **spacing rhythm**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **spacing rhythm**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **spacing rhythm**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **spacing rhythm**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **spacing rhythm**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **spacing rhythm**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **spacing rhythm**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **spacing rhythm**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **spacing rhythm**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. responsive breakpoints

1. For **responsive breakpoints**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **responsive breakpoints**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **responsive breakpoints**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **responsive breakpoints**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **responsive breakpoints**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **responsive breakpoints**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **responsive breakpoints**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **responsive breakpoints**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **responsive breakpoints**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **responsive breakpoints**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **responsive breakpoints**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **responsive breakpoints**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **responsive breakpoints**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **responsive breakpoints**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **responsive breakpoints**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **responsive breakpoints**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **responsive breakpoints**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **responsive breakpoints**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **responsive breakpoints**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **responsive breakpoints**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **responsive breakpoints**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. mobile layout behavior

1. For **mobile layout behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **mobile layout behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **mobile layout behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **mobile layout behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **mobile layout behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **mobile layout behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **mobile layout behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **mobile layout behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **mobile layout behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **mobile layout behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **mobile layout behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **mobile layout behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **mobile layout behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **mobile layout behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **mobile layout behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **mobile layout behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **mobile layout behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **mobile layout behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **mobile layout behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **mobile layout behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **mobile layout behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. keyboard navigation

1. For **keyboard navigation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **keyboard navigation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **keyboard navigation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **keyboard navigation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **keyboard navigation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **keyboard navigation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **keyboard navigation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **keyboard navigation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **keyboard navigation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **keyboard navigation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **keyboard navigation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **keyboard navigation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **keyboard navigation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **keyboard navigation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **keyboard navigation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **keyboard navigation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **keyboard navigation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **keyboard navigation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **keyboard navigation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **keyboard navigation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **keyboard navigation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. focus visibility

1. For **focus visibility**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **focus visibility**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **focus visibility**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **focus visibility**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **focus visibility**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **focus visibility**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **focus visibility**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **focus visibility**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **focus visibility**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **focus visibility**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **focus visibility**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **focus visibility**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **focus visibility**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **focus visibility**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **focus visibility**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **focus visibility**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **focus visibility**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **focus visibility**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **focus visibility**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **focus visibility**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **focus visibility**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. semantic element choice

1. For **semantic element choice**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **semantic element choice**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **semantic element choice**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **semantic element choice**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **semantic element choice**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **semantic element choice**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **semantic element choice**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **semantic element choice**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **semantic element choice**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **semantic element choice**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **semantic element choice**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **semantic element choice**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **semantic element choice**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **semantic element choice**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **semantic element choice**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **semantic element choice**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **semantic element choice**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **semantic element choice**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **semantic element choice**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **semantic element choice**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **semantic element choice**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. form label clarity

1. For **form label clarity**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **form label clarity**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **form label clarity**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **form label clarity**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **form label clarity**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **form label clarity**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **form label clarity**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **form label clarity**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **form label clarity**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **form label clarity**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **form label clarity**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **form label clarity**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **form label clarity**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **form label clarity**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **form label clarity**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **form label clarity**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **form label clarity**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **form label clarity**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **form label clarity**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **form label clarity**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **form label clarity**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. error message association

1. For **error message association**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **error message association**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **error message association**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **error message association**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **error message association**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **error message association**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **error message association**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **error message association**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **error message association**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **error message association**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **error message association**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **error message association**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **error message association**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **error message association**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **error message association**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **error message association**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **error message association**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **error message association**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **error message association**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **error message association**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **error message association**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. dialog and overlay behavior

1. For **dialog and overlay behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **dialog and overlay behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **dialog and overlay behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **dialog and overlay behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **dialog and overlay behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **dialog and overlay behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **dialog and overlay behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **dialog and overlay behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **dialog and overlay behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **dialog and overlay behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **dialog and overlay behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **dialog and overlay behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **dialog and overlay behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **dialog and overlay behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **dialog and overlay behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **dialog and overlay behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **dialog and overlay behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **dialog and overlay behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **dialog and overlay behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **dialog and overlay behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **dialog and overlay behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. tooltip behavior

1. For **tooltip behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **tooltip behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **tooltip behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **tooltip behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **tooltip behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **tooltip behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **tooltip behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **tooltip behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **tooltip behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **tooltip behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **tooltip behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **tooltip behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **tooltip behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **tooltip behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **tooltip behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **tooltip behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **tooltip behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **tooltip behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **tooltip behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **tooltip behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **tooltip behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. icon-only controls

1. For **icon-only controls**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **icon-only controls**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **icon-only controls**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **icon-only controls**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **icon-only controls**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **icon-only controls**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **icon-only controls**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **icon-only controls**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **icon-only controls**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **icon-only controls**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **icon-only controls**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **icon-only controls**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **icon-only controls**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **icon-only controls**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **icon-only controls**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **icon-only controls**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **icon-only controls**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **icon-only controls**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **icon-only controls**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **icon-only controls**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **icon-only controls**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. color contrast

1. For **color contrast**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **color contrast**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **color contrast**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **color contrast**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **color contrast**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **color contrast**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **color contrast**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **color contrast**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **color contrast**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **color contrast**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **color contrast**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **color contrast**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **color contrast**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **color contrast**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **color contrast**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **color contrast**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **color contrast**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **color contrast**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **color contrast**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **color contrast**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **color contrast**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. motion preferences

1. For **motion preferences**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **motion preferences**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **motion preferences**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **motion preferences**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **motion preferences**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **motion preferences**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **motion preferences**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **motion preferences**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **motion preferences**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **motion preferences**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **motion preferences**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **motion preferences**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **motion preferences**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **motion preferences**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **motion preferences**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **motion preferences**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **motion preferences**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **motion preferences**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **motion preferences**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **motion preferences**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **motion preferences**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. canvas control accessibility

1. For **canvas control accessibility**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **canvas control accessibility**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **canvas control accessibility**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **canvas control accessibility**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **canvas control accessibility**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **canvas control accessibility**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **canvas control accessibility**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **canvas control accessibility**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **canvas control accessibility**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **canvas control accessibility**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **canvas control accessibility**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **canvas control accessibility**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **canvas control accessibility**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **canvas control accessibility**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **canvas control accessibility**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **canvas control accessibility**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **canvas control accessibility**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **canvas control accessibility**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **canvas control accessibility**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **canvas control accessibility**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **canvas control accessibility**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. screen-reader announcements

1. For **screen-reader announcements**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **screen-reader announcements**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **screen-reader announcements**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **screen-reader announcements**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **screen-reader announcements**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **screen-reader announcements**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **screen-reader announcements**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **screen-reader announcements**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **screen-reader announcements**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **screen-reader announcements**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **screen-reader announcements**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **screen-reader announcements**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **screen-reader announcements**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **screen-reader announcements**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **screen-reader announcements**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **screen-reader announcements**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **screen-reader announcements**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **screen-reader announcements**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **screen-reader announcements**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **screen-reader announcements**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **screen-reader announcements**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. visual regression checks

1. For **visual regression checks**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **visual regression checks**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **visual regression checks**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **visual regression checks**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **visual regression checks**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **visual regression checks**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **visual regression checks**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **visual regression checks**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **visual regression checks**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **visual regression checks**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **visual regression checks**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **visual regression checks**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **visual regression checks**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **visual regression checks**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **visual regression checks**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **visual regression checks**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **visual regression checks**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **visual regression checks**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **visual regression checks**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **visual regression checks**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **visual regression checks**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. design change completion

1. For **design change completion**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **design change completion**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **design change completion**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **design change completion**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **design change completion**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **design change completion**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **design change completion**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **design change completion**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **design change completion**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **design change completion**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **design change completion**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **design change completion**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **design change completion**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **design change completion**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **design change completion**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **design change completion**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **design change completion**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **design change completion**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **design change completion**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **design change completion**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **design change completion**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

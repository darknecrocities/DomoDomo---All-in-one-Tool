---
name: domodomo-tool-authoring
description: Create and maintain browser-first DomoDomo utility tools and their product registrations. Use when adding or changing a component in src/tools, a tool registry entry, dashboard card, technical documentation record, category, or export workflow.
---

# DomoDomo Tool Authoring

Maintain Standalone local browser utilities, their registry metadata, dashboard visibility, documentation, metrics, and release content.

## Operating contract

- **Scope:** Standalone local browser utilities, their registry metadata, dashboard visibility, documentation, metrics, and release content.
- **Primary files:** src/tools/, src/engine/registry.ts, src/engine/types.ts, src/pages/Dashboard.tsx, src/utils/ToolDocsData.ts, and product content files.
- **Before changing code:** Read a comparable tool in the same category, its engine registration, dashboard metadata, documentation record, and export implementation.

## 01. tool problem definition

1. For **tool problem definition**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **tool problem definition**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **tool problem definition**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **tool problem definition**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **tool problem definition**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **tool problem definition**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **tool problem definition**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **tool problem definition**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **tool problem definition**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **tool problem definition**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **tool problem definition**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **tool problem definition**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **tool problem definition**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **tool problem definition**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **tool problem definition**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **tool problem definition**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **tool problem definition**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **tool problem definition**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **tool problem definition**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **tool problem definition**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **tool problem definition**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. category selection

1. For **category selection**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **category selection**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **category selection**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **category selection**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **category selection**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **category selection**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **category selection**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **category selection**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **category selection**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **category selection**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **category selection**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **category selection**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **category selection**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **category selection**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **category selection**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **category selection**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **category selection**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **category selection**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **category selection**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **category selection**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **category selection**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. component file placement

1. For **component file placement**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **component file placement**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **component file placement**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **component file placement**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **component file placement**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **component file placement**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **component file placement**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **component file placement**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **component file placement**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **component file placement**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **component file placement**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **component file placement**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **component file placement**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **component file placement**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **component file placement**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **component file placement**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **component file placement**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **component file placement**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **component file placement**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **component file placement**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **component file placement**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. stable tool identifiers

1. For **stable tool identifiers**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **stable tool identifiers**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **stable tool identifiers**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **stable tool identifiers**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **stable tool identifiers**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **stable tool identifiers**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **stable tool identifiers**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **stable tool identifiers**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **stable tool identifiers**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **stable tool identifiers**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **stable tool identifiers**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **stable tool identifiers**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **stable tool identifiers**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **stable tool identifiers**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **stable tool identifiers**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **stable tool identifiers**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **stable tool identifiers**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **stable tool identifiers**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **stable tool identifiers**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **stable tool identifiers**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **stable tool identifiers**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. registry object design

1. For **registry object design**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **registry object design**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **registry object design**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **registry object design**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **registry object design**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **registry object design**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **registry object design**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **registry object design**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **registry object design**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **registry object design**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **registry object design**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **registry object design**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **registry object design**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **registry object design**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **registry object design**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **registry object design**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **registry object design**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **registry object design**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **registry object design**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **registry object design**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **registry object design**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. dashboard card metadata

1. For **dashboard card metadata**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **dashboard card metadata**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **dashboard card metadata**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **dashboard card metadata**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **dashboard card metadata**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **dashboard card metadata**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **dashboard card metadata**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **dashboard card metadata**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **dashboard card metadata**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **dashboard card metadata**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **dashboard card metadata**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **dashboard card metadata**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **dashboard card metadata**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **dashboard card metadata**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **dashboard card metadata**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **dashboard card metadata**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **dashboard card metadata**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **dashboard card metadata**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **dashboard card metadata**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **dashboard card metadata**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **dashboard card metadata**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. local-only processing

1. For **local-only processing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **local-only processing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **local-only processing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **local-only processing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **local-only processing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **local-only processing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **local-only processing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **local-only processing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **local-only processing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **local-only processing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **local-only processing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **local-only processing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **local-only processing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **local-only processing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **local-only processing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **local-only processing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **local-only processing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **local-only processing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **local-only processing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **local-only processing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **local-only processing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. single file workflows

1. For **single file workflows**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **single file workflows**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **single file workflows**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **single file workflows**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **single file workflows**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **single file workflows**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **single file workflows**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **single file workflows**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **single file workflows**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **single file workflows**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **single file workflows**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **single file workflows**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **single file workflows**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **single file workflows**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **single file workflows**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **single file workflows**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **single file workflows**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **single file workflows**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **single file workflows**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **single file workflows**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **single file workflows**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. batch file workflows

1. For **batch file workflows**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **batch file workflows**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **batch file workflows**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **batch file workflows**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **batch file workflows**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **batch file workflows**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **batch file workflows**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **batch file workflows**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **batch file workflows**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **batch file workflows**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **batch file workflows**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **batch file workflows**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **batch file workflows**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **batch file workflows**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **batch file workflows**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **batch file workflows**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **batch file workflows**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **batch file workflows**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **batch file workflows**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **batch file workflows**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **batch file workflows**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. format validation

1. For **format validation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **format validation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **format validation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **format validation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **format validation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **format validation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **format validation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **format validation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **format validation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **format validation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **format validation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **format validation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **format validation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **format validation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **format validation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **format validation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **format validation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **format validation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **format validation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **format validation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **format validation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. preview rendering

1. For **preview rendering**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **preview rendering**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **preview rendering**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **preview rendering**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **preview rendering**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **preview rendering**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **preview rendering**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **preview rendering**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **preview rendering**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **preview rendering**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **preview rendering**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **preview rendering**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **preview rendering**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **preview rendering**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **preview rendering**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **preview rendering**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **preview rendering**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **preview rendering**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **preview rendering**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **preview rendering**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **preview rendering**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. download and export actions

1. For **download and export actions**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **download and export actions**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **download and export actions**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **download and export actions**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **download and export actions**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **download and export actions**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **download and export actions**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **download and export actions**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **download and export actions**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **download and export actions**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **download and export actions**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **download and export actions**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **download and export actions**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **download and export actions**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **download and export actions**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **download and export actions**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **download and export actions**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **download and export actions**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **download and export actions**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **download and export actions**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **download and export actions**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. canvas viewport controls

1. For **canvas viewport controls**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **canvas viewport controls**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **canvas viewport controls**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **canvas viewport controls**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **canvas viewport controls**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **canvas viewport controls**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **canvas viewport controls**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **canvas viewport controls**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **canvas viewport controls**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **canvas viewport controls**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **canvas viewport controls**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **canvas viewport controls**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **canvas viewport controls**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **canvas viewport controls**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **canvas viewport controls**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **canvas viewport controls**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **canvas viewport controls**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **canvas viewport controls**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **canvas viewport controls**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **canvas viewport controls**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **canvas viewport controls**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. worker lifecycle handling

1. For **worker lifecycle handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **worker lifecycle handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **worker lifecycle handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **worker lifecycle handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **worker lifecycle handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **worker lifecycle handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **worker lifecycle handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **worker lifecycle handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **worker lifecycle handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **worker lifecycle handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **worker lifecycle handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **worker lifecycle handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **worker lifecycle handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **worker lifecycle handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **worker lifecycle handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **worker lifecycle handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **worker lifecycle handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **worker lifecycle handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **worker lifecycle handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **worker lifecycle handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **worker lifecycle handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. large file limitations

1. For **large file limitations**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **large file limitations**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **large file limitations**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **large file limitations**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **large file limitations**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **large file limitations**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **large file limitations**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **large file limitations**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **large file limitations**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **large file limitations**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **large file limitations**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **large file limitations**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **large file limitations**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **large file limitations**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **large file limitations**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **large file limitations**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **large file limitations**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **large file limitations**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **large file limitations**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **large file limitations**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **large file limitations**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. technical documentation records

1. For **technical documentation records**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **technical documentation records**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **technical documentation records**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **technical documentation records**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **technical documentation records**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **technical documentation records**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **technical documentation records**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **technical documentation records**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **technical documentation records**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **technical documentation records**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **technical documentation records**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **technical documentation records**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **technical documentation records**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **technical documentation records**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **technical documentation records**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **technical documentation records**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **technical documentation records**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **technical documentation records**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **technical documentation records**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **technical documentation records**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **technical documentation records**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. documentation page discoverability

1. For **documentation page discoverability**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **documentation page discoverability**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **documentation page discoverability**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **documentation page discoverability**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **documentation page discoverability**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **documentation page discoverability**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **documentation page discoverability**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **documentation page discoverability**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **documentation page discoverability**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **documentation page discoverability**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **documentation page discoverability**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **documentation page discoverability**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **documentation page discoverability**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **documentation page discoverability**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **documentation page discoverability**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **documentation page discoverability**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **documentation page discoverability**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **documentation page discoverability**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **documentation page discoverability**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **documentation page discoverability**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **documentation page discoverability**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. About page metrics

1. For **About page metrics**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **About page metrics**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **About page metrics**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **About page metrics**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **About page metrics**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **About page metrics**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **About page metrics**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **About page metrics**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **About page metrics**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **About page metrics**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **About page metrics**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **About page metrics**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **About page metrics**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **About page metrics**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **About page metrics**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **About page metrics**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **About page metrics**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **About page metrics**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **About page metrics**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **About page metrics**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **About page metrics**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. blog announcement content

1. For **blog announcement content**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **blog announcement content**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **blog announcement content**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **blog announcement content**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **blog announcement content**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **blog announcement content**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **blog announcement content**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **blog announcement content**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **blog announcement content**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **blog announcement content**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **blog announcement content**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **blog announcement content**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **blog announcement content**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **blog announcement content**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **blog announcement content**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **blog announcement content**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **blog announcement content**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **blog announcement content**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **blog announcement content**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **blog announcement content**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **blog announcement content**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. tool completion verification

1. For **tool completion verification**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **tool completion verification**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **tool completion verification**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **tool completion verification**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **tool completion verification**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **tool completion verification**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **tool completion verification**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **tool completion verification**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **tool completion verification**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **tool completion verification**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **tool completion verification**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **tool completion verification**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **tool completion verification**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **tool completion verification**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **tool completion verification**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **tool completion verification**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **tool completion verification**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **tool completion verification**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **tool completion verification**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **tool completion verification**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **tool completion verification**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

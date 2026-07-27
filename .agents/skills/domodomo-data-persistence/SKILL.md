---
name: domodomo-data-persistence
description: Maintain DomoDomo’s local data flows, IndexedDB, SQLite, unified memory, synchronization, imports, exports, and schema evolution. Use when changing localMemory, unifiedMemory, backend database models, sync routes, or data tools.
---

# DomoDomo Data and Persistence

Maintain Local persistence and data transformations that must preserve privacy, integrity, recoverability, and backward compatibility.

## Operating contract

- **Scope:** Local persistence and data transformations that must preserve privacy, integrity, recoverability, and backward compatibility.
- **Primary files:** src/utils/localMemory.ts, src/utils/unifiedMemory.ts, backend/database.py, backend/models.py, backend/routers/memory.py, backend/routers/sync.py, and data tools.
- **Before changing code:** Read the full read/write flow, existing schema, serialization shape, migration implications, and export format before modifying stored data.

## 01. data ownership boundaries

1. For **data ownership boundaries**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **data ownership boundaries**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **data ownership boundaries**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **data ownership boundaries**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **data ownership boundaries**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **data ownership boundaries**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **data ownership boundaries**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **data ownership boundaries**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **data ownership boundaries**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **data ownership boundaries**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **data ownership boundaries**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **data ownership boundaries**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **data ownership boundaries**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **data ownership boundaries**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **data ownership boundaries**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **data ownership boundaries**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **data ownership boundaries**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **data ownership boundaries**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **data ownership boundaries**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **data ownership boundaries**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **data ownership boundaries**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. browser storage selection

1. For **browser storage selection**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **browser storage selection**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **browser storage selection**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **browser storage selection**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **browser storage selection**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **browser storage selection**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **browser storage selection**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **browser storage selection**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **browser storage selection**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **browser storage selection**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **browser storage selection**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **browser storage selection**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **browser storage selection**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **browser storage selection**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **browser storage selection**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **browser storage selection**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **browser storage selection**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **browser storage selection**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **browser storage selection**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **browser storage selection**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **browser storage selection**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. IndexedDB key design

1. For **IndexedDB key design**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **IndexedDB key design**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **IndexedDB key design**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **IndexedDB key design**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **IndexedDB key design**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **IndexedDB key design**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **IndexedDB key design**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **IndexedDB key design**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **IndexedDB key design**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **IndexedDB key design**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **IndexedDB key design**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **IndexedDB key design**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **IndexedDB key design**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **IndexedDB key design**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **IndexedDB key design**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **IndexedDB key design**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **IndexedDB key design**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **IndexedDB key design**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **IndexedDB key design**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **IndexedDB key design**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **IndexedDB key design**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. SQLite schema design

1. For **SQLite schema design**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **SQLite schema design**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **SQLite schema design**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **SQLite schema design**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **SQLite schema design**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **SQLite schema design**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **SQLite schema design**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **SQLite schema design**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **SQLite schema design**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **SQLite schema design**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **SQLite schema design**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **SQLite schema design**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **SQLite schema design**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **SQLite schema design**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **SQLite schema design**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **SQLite schema design**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **SQLite schema design**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **SQLite schema design**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **SQLite schema design**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **SQLite schema design**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **SQLite schema design**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. record validation

1. For **record validation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **record validation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **record validation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **record validation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **record validation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **record validation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **record validation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **record validation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **record validation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **record validation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **record validation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **record validation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **record validation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **record validation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **record validation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **record validation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **record validation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **record validation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **record validation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **record validation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **record validation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. serialization formats

1. For **serialization formats**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **serialization formats**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **serialization formats**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **serialization formats**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **serialization formats**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **serialization formats**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **serialization formats**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **serialization formats**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **serialization formats**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **serialization formats**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **serialization formats**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **serialization formats**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **serialization formats**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **serialization formats**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **serialization formats**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **serialization formats**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **serialization formats**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **serialization formats**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **serialization formats**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **serialization formats**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **serialization formats**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. versioned migrations

1. For **versioned migrations**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **versioned migrations**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **versioned migrations**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **versioned migrations**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **versioned migrations**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **versioned migrations**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **versioned migrations**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **versioned migrations**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **versioned migrations**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **versioned migrations**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **versioned migrations**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **versioned migrations**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **versioned migrations**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **versioned migrations**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **versioned migrations**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **versioned migrations**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **versioned migrations**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **versioned migrations**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **versioned migrations**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **versioned migrations**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **versioned migrations**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. backward compatibility

1. For **backward compatibility**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **backward compatibility**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **backward compatibility**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **backward compatibility**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **backward compatibility**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **backward compatibility**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **backward compatibility**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **backward compatibility**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **backward compatibility**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **backward compatibility**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **backward compatibility**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **backward compatibility**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **backward compatibility**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **backward compatibility**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **backward compatibility**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **backward compatibility**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **backward compatibility**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **backward compatibility**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **backward compatibility**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **backward compatibility**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **backward compatibility**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. transaction consistency

1. For **transaction consistency**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **transaction consistency**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **transaction consistency**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **transaction consistency**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **transaction consistency**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **transaction consistency**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **transaction consistency**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **transaction consistency**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **transaction consistency**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **transaction consistency**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **transaction consistency**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **transaction consistency**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **transaction consistency**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **transaction consistency**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **transaction consistency**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **transaction consistency**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **transaction consistency**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **transaction consistency**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **transaction consistency**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **transaction consistency**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **transaction consistency**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. write-ahead logging behavior

1. For **write-ahead logging behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **write-ahead logging behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **write-ahead logging behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **write-ahead logging behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **write-ahead logging behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **write-ahead logging behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **write-ahead logging behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **write-ahead logging behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **write-ahead logging behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **write-ahead logging behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **write-ahead logging behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **write-ahead logging behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **write-ahead logging behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **write-ahead logging behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **write-ahead logging behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **write-ahead logging behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **write-ahead logging behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **write-ahead logging behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **write-ahead logging behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **write-ahead logging behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **write-ahead logging behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. memory timeline data

1. For **memory timeline data**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **memory timeline data**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **memory timeline data**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **memory timeline data**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **memory timeline data**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **memory timeline data**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **memory timeline data**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **memory timeline data**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **memory timeline data**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **memory timeline data**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **memory timeline data**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **memory timeline data**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **memory timeline data**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **memory timeline data**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **memory timeline data**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **memory timeline data**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **memory timeline data**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **memory timeline data**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **memory timeline data**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **memory timeline data**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **memory timeline data**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. semantic vector data

1. For **semantic vector data**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **semantic vector data**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **semantic vector data**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **semantic vector data**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **semantic vector data**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **semantic vector data**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **semantic vector data**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **semantic vector data**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **semantic vector data**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **semantic vector data**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **semantic vector data**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **semantic vector data**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **semantic vector data**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **semantic vector data**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **semantic vector data**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **semantic vector data**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **semantic vector data**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **semantic vector data**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **semantic vector data**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **semantic vector data**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **semantic vector data**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. sync route contracts

1. For **sync route contracts**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **sync route contracts**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **sync route contracts**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **sync route contracts**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **sync route contracts**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **sync route contracts**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **sync route contracts**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **sync route contracts**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **sync route contracts**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **sync route contracts**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **sync route contracts**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **sync route contracts**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **sync route contracts**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **sync route contracts**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **sync route contracts**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **sync route contracts**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **sync route contracts**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **sync route contracts**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **sync route contracts**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **sync route contracts**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **sync route contracts**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. import validation

1. For **import validation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **import validation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **import validation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **import validation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **import validation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **import validation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **import validation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **import validation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **import validation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **import validation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **import validation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **import validation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **import validation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **import validation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **import validation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **import validation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **import validation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **import validation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **import validation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **import validation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **import validation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. export portability

1. For **export portability**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **export portability**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **export portability**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **export portability**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **export portability**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **export portability**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **export portability**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **export portability**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **export portability**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **export portability**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **export portability**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **export portability**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **export portability**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **export portability**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **export portability**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **export portability**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **export portability**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **export portability**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **export portability**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **export portability**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **export portability**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. data retention controls

1. For **data retention controls**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **data retention controls**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **data retention controls**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **data retention controls**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **data retention controls**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **data retention controls**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **data retention controls**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **data retention controls**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **data retention controls**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **data retention controls**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **data retention controls**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **data retention controls**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **data retention controls**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **data retention controls**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **data retention controls**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **data retention controls**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **data retention controls**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **data retention controls**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **data retention controls**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **data retention controls**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **data retention controls**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. corruption recovery

1. For **corruption recovery**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **corruption recovery**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **corruption recovery**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **corruption recovery**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **corruption recovery**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **corruption recovery**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **corruption recovery**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **corruption recovery**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **corruption recovery**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **corruption recovery**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **corruption recovery**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **corruption recovery**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **corruption recovery**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **corruption recovery**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **corruption recovery**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **corruption recovery**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **corruption recovery**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **corruption recovery**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **corruption recovery**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **corruption recovery**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **corruption recovery**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. sensitive field handling

1. For **sensitive field handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **sensitive field handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **sensitive field handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **sensitive field handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **sensitive field handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **sensitive field handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **sensitive field handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **sensitive field handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **sensitive field handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **sensitive field handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **sensitive field handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **sensitive field handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **sensitive field handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **sensitive field handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **sensitive field handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **sensitive field handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **sensitive field handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **sensitive field handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **sensitive field handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **sensitive field handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **sensitive field handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. persistence test coverage

1. For **persistence test coverage**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **persistence test coverage**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **persistence test coverage**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **persistence test coverage**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **persistence test coverage**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **persistence test coverage**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **persistence test coverage**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **persistence test coverage**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **persistence test coverage**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **persistence test coverage**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **persistence test coverage**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **persistence test coverage**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **persistence test coverage**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **persistence test coverage**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **persistence test coverage**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **persistence test coverage**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **persistence test coverage**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **persistence test coverage**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **persistence test coverage**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **persistence test coverage**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **persistence test coverage**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. data change completion

1. For **data change completion**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **data change completion**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **data change completion**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **data change completion**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **data change completion**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **data change completion**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **data change completion**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **data change completion**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **data change completion**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **data change completion**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **data change completion**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **data change completion**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **data change completion**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **data change completion**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **data change completion**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **data change completion**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **data change completion**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **data change completion**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **data change completion**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **data change completion**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **data change completion**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

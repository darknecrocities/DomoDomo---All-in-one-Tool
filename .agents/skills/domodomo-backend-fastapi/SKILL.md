---
name: domodomo-backend-fastapi
description: Maintain DomoDomo’s local FastAPI application, routers, SQLite models, local services, and Python utilities. Use when changing backend/, API contracts, CORS behavior, persistence logic, RAG helpers, or development service startup.
---

# DomoDomo Backend FastAPI

Maintain The local FastAPI backend that supports DomoDomo without becoming a hosted or externally reachable service.

## Operating contract

- **Scope:** The local FastAPI backend that supports DomoDomo without becoming a hosted or externally reachable service.
- **Primary files:** backend/main.py, backend/database.py, backend/models.py, backend/routers/, backend/utils/, backend/requirements.txt, and scripts/start-backend.cjs.
- **Before changing code:** Read the relevant router, database helper, request models, startup behavior, and frontend caller before adding an endpoint or changing a payload.

## 01. application startup

1. For **application startup**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **application startup**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **application startup**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **application startup**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **application startup**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **application startup**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **application startup**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **application startup**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **application startup**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **application startup**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **application startup**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **application startup**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **application startup**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **application startup**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **application startup**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **application startup**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **application startup**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **application startup**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **application startup**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **application startup**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **application startup**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. router ownership

1. For **router ownership**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **router ownership**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **router ownership**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **router ownership**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **router ownership**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **router ownership**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **router ownership**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **router ownership**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **router ownership**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **router ownership**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **router ownership**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **router ownership**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **router ownership**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **router ownership**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **router ownership**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **router ownership**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **router ownership**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **router ownership**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **router ownership**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **router ownership**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **router ownership**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. request validation

1. For **request validation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **request validation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **request validation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **request validation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **request validation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **request validation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **request validation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **request validation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **request validation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **request validation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **request validation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **request validation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **request validation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **request validation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **request validation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **request validation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **request validation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **request validation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **request validation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **request validation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **request validation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. response contracts

1. For **response contracts**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **response contracts**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **response contracts**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **response contracts**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **response contracts**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **response contracts**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **response contracts**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **response contracts**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **response contracts**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **response contracts**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **response contracts**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **response contracts**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **response contracts**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **response contracts**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **response contracts**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **response contracts**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **response contracts**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **response contracts**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **response contracts**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **response contracts**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **response contracts**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. HTTP error semantics

1. For **HTTP error semantics**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **HTTP error semantics**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **HTTP error semantics**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **HTTP error semantics**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **HTTP error semantics**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **HTTP error semantics**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **HTTP error semantics**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **HTTP error semantics**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **HTTP error semantics**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **HTTP error semantics**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **HTTP error semantics**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **HTTP error semantics**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **HTTP error semantics**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **HTTP error semantics**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **HTTP error semantics**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **HTTP error semantics**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **HTTP error semantics**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **HTTP error semantics**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **HTTP error semantics**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **HTTP error semantics**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **HTTP error semantics**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. local CORS configuration

1. For **local CORS configuration**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **local CORS configuration**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **local CORS configuration**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **local CORS configuration**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **local CORS configuration**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **local CORS configuration**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **local CORS configuration**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **local CORS configuration**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **local CORS configuration**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **local CORS configuration**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **local CORS configuration**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **local CORS configuration**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **local CORS configuration**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **local CORS configuration**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **local CORS configuration**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **local CORS configuration**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **local CORS configuration**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **local CORS configuration**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **local CORS configuration**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **local CORS configuration**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **local CORS configuration**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. SQLite connection handling

1. For **SQLite connection handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **SQLite connection handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **SQLite connection handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **SQLite connection handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **SQLite connection handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **SQLite connection handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **SQLite connection handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **SQLite connection handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **SQLite connection handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **SQLite connection handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **SQLite connection handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **SQLite connection handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **SQLite connection handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **SQLite connection handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **SQLite connection handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **SQLite connection handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **SQLite connection handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **SQLite connection handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **SQLite connection handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **SQLite connection handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **SQLite connection handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. schema compatibility

1. For **schema compatibility**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **schema compatibility**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **schema compatibility**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **schema compatibility**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **schema compatibility**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **schema compatibility**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **schema compatibility**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **schema compatibility**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **schema compatibility**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **schema compatibility**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **schema compatibility**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **schema compatibility**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **schema compatibility**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **schema compatibility**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **schema compatibility**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **schema compatibility**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **schema compatibility**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **schema compatibility**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **schema compatibility**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **schema compatibility**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **schema compatibility**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. migration safety

1. For **migration safety**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **migration safety**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **migration safety**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **migration safety**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **migration safety**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **migration safety**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **migration safety**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **migration safety**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **migration safety**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **migration safety**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **migration safety**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **migration safety**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **migration safety**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **migration safety**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **migration safety**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **migration safety**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **migration safety**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **migration safety**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **migration safety**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **migration safety**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **migration safety**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. transaction boundaries

1. For **transaction boundaries**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **transaction boundaries**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **transaction boundaries**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **transaction boundaries**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **transaction boundaries**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **transaction boundaries**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **transaction boundaries**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **transaction boundaries**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **transaction boundaries**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **transaction boundaries**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **transaction boundaries**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **transaction boundaries**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **transaction boundaries**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **transaction boundaries**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **transaction boundaries**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **transaction boundaries**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **transaction boundaries**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **transaction boundaries**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **transaction boundaries**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **transaction boundaries**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **transaction boundaries**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. background processing

1. For **background processing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **background processing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **background processing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **background processing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **background processing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **background processing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **background processing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **background processing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **background processing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **background processing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **background processing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **background processing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **background processing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **background processing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **background processing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **background processing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **background processing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **background processing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **background processing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **background processing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **background processing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. streaming endpoints

1. For **streaming endpoints**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **streaming endpoints**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **streaming endpoints**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **streaming endpoints**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **streaming endpoints**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **streaming endpoints**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **streaming endpoints**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **streaming endpoints**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **streaming endpoints**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **streaming endpoints**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **streaming endpoints**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **streaming endpoints**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **streaming endpoints**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **streaming endpoints**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **streaming endpoints**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **streaming endpoints**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **streaming endpoints**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **streaming endpoints**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **streaming endpoints**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **streaming endpoints**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **streaming endpoints**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. chat service behavior

1. For **chat service behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **chat service behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **chat service behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **chat service behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **chat service behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **chat service behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **chat service behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **chat service behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **chat service behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **chat service behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **chat service behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **chat service behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **chat service behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **chat service behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **chat service behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **chat service behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **chat service behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **chat service behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **chat service behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **chat service behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **chat service behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. memory service behavior

1. For **memory service behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **memory service behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **memory service behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **memory service behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **memory service behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **memory service behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **memory service behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **memory service behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **memory service behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **memory service behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **memory service behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **memory service behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **memory service behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **memory service behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **memory service behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **memory service behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **memory service behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **memory service behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **memory service behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **memory service behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **memory service behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. OCR and ML routes

1. For **OCR and ML routes**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **OCR and ML routes**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **OCR and ML routes**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **OCR and ML routes**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **OCR and ML routes**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **OCR and ML routes**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **OCR and ML routes**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **OCR and ML routes**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **OCR and ML routes**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **OCR and ML routes**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **OCR and ML routes**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **OCR and ML routes**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **OCR and ML routes**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **OCR and ML routes**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **OCR and ML routes**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **OCR and ML routes**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **OCR and ML routes**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **OCR and ML routes**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **OCR and ML routes**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **OCR and ML routes**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **OCR and ML routes**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. RAG utility boundaries

1. For **RAG utility boundaries**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **RAG utility boundaries**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **RAG utility boundaries**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **RAG utility boundaries**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **RAG utility boundaries**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **RAG utility boundaries**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **RAG utility boundaries**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **RAG utility boundaries**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **RAG utility boundaries**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **RAG utility boundaries**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **RAG utility boundaries**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **RAG utility boundaries**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **RAG utility boundaries**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **RAG utility boundaries**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **RAG utility boundaries**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **RAG utility boundaries**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **RAG utility boundaries**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **RAG utility boundaries**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **RAG utility boundaries**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **RAG utility boundaries**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **RAG utility boundaries**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. sensitive data logging

1. For **sensitive data logging**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **sensitive data logging**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **sensitive data logging**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **sensitive data logging**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **sensitive data logging**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **sensitive data logging**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **sensitive data logging**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **sensitive data logging**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **sensitive data logging**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **sensitive data logging**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **sensitive data logging**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **sensitive data logging**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **sensitive data logging**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **sensitive data logging**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **sensitive data logging**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **sensitive data logging**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **sensitive data logging**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **sensitive data logging**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **sensitive data logging**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **sensitive data logging**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **sensitive data logging**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. local service failures

1. For **local service failures**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **local service failures**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **local service failures**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **local service failures**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **local service failures**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **local service failures**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **local service failures**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **local service failures**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **local service failures**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **local service failures**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **local service failures**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **local service failures**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **local service failures**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **local service failures**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **local service failures**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **local service failures**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **local service failures**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **local service failures**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **local service failures**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **local service failures**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **local service failures**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. backend integration testing

1. For **backend integration testing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **backend integration testing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **backend integration testing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **backend integration testing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **backend integration testing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **backend integration testing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **backend integration testing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **backend integration testing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **backend integration testing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **backend integration testing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **backend integration testing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **backend integration testing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **backend integration testing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **backend integration testing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **backend integration testing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **backend integration testing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **backend integration testing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **backend integration testing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **backend integration testing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **backend integration testing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **backend integration testing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. backend change completion

1. For **backend change completion**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **backend change completion**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **backend change completion**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **backend change completion**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **backend change completion**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **backend change completion**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **backend change completion**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **backend change completion**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **backend change completion**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **backend change completion**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **backend change completion**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **backend change completion**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **backend change completion**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **backend change completion**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **backend change completion**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **backend change completion**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **backend change completion**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **backend change completion**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **backend change completion**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **backend change completion**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **backend change completion**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

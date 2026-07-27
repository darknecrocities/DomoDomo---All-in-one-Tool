---
name: domodomo-media-processing
description: Maintain DomoDomo browser-side image, video, audio, PDF, document, QR, spatial, and CV processing tools. Use when changing src/tools media categories, browser APIs, canvas pipelines, WebAssembly integrations, previews, or local exports.
---

# DomoDomo Media Processing

Maintain Large-file and media workflows that run locally in the browser using native APIs, Canvas, WebAudio, PDF libraries, or WebAssembly.

## Operating contract

- **Scope:** Large-file and media workflows that run locally in the browser using native APIs, Canvas, WebAudio, PDF libraries, or WebAssembly.
- **Primary files:** src/tools/photo/, video/, audio/, pdf/, document/, converter/, qr/, cv/, spatial/, plus shared media helpers and relevant dependencies.
- **Before changing code:** Read a comparable media pipeline, its input constraints, cleanup code, export format, and error path before changing processing behavior.

## 01. input format detection

1. For **input format detection**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **input format detection**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **input format detection**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **input format detection**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **input format detection**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **input format detection**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **input format detection**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **input format detection**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **input format detection**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **input format detection**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **input format detection**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **input format detection**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **input format detection**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **input format detection**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **input format detection**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **input format detection**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **input format detection**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **input format detection**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **input format detection**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **input format detection**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **input format detection**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. file size policy

1. For **file size policy**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **file size policy**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **file size policy**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **file size policy**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **file size policy**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **file size policy**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **file size policy**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **file size policy**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **file size policy**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **file size policy**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **file size policy**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **file size policy**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **file size policy**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **file size policy**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **file size policy**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **file size policy**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **file size policy**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **file size policy**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **file size policy**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **file size policy**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **file size policy**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. object URL lifecycle

1. For **object URL lifecycle**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **object URL lifecycle**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **object URL lifecycle**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **object URL lifecycle**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **object URL lifecycle**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **object URL lifecycle**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **object URL lifecycle**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **object URL lifecycle**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **object URL lifecycle**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **object URL lifecycle**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **object URL lifecycle**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **object URL lifecycle**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **object URL lifecycle**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **object URL lifecycle**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **object URL lifecycle**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **object URL lifecycle**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **object URL lifecycle**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **object URL lifecycle**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **object URL lifecycle**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **object URL lifecycle**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **object URL lifecycle**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. canvas rendering

1. For **canvas rendering**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **canvas rendering**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **canvas rendering**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **canvas rendering**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **canvas rendering**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **canvas rendering**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **canvas rendering**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **canvas rendering**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **canvas rendering**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **canvas rendering**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **canvas rendering**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **canvas rendering**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **canvas rendering**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **canvas rendering**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **canvas rendering**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **canvas rendering**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **canvas rendering**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **canvas rendering**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **canvas rendering**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **canvas rendering**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **canvas rendering**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. image pixel processing

1. For **image pixel processing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **image pixel processing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **image pixel processing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **image pixel processing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **image pixel processing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **image pixel processing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **image pixel processing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **image pixel processing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **image pixel processing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **image pixel processing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **image pixel processing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **image pixel processing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **image pixel processing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **image pixel processing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **image pixel processing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **image pixel processing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **image pixel processing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **image pixel processing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **image pixel processing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **image pixel processing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **image pixel processing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. video timeline processing

1. For **video timeline processing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **video timeline processing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **video timeline processing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **video timeline processing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **video timeline processing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **video timeline processing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **video timeline processing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **video timeline processing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **video timeline processing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **video timeline processing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **video timeline processing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **video timeline processing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **video timeline processing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **video timeline processing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **video timeline processing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **video timeline processing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **video timeline processing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **video timeline processing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **video timeline processing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **video timeline processing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **video timeline processing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. audio buffer processing

1. For **audio buffer processing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **audio buffer processing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **audio buffer processing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **audio buffer processing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **audio buffer processing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **audio buffer processing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **audio buffer processing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **audio buffer processing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **audio buffer processing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **audio buffer processing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **audio buffer processing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **audio buffer processing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **audio buffer processing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **audio buffer processing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **audio buffer processing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **audio buffer processing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **audio buffer processing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **audio buffer processing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **audio buffer processing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **audio buffer processing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **audio buffer processing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. PDF byte handling

1. For **PDF byte handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **PDF byte handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **PDF byte handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **PDF byte handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **PDF byte handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **PDF byte handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **PDF byte handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **PDF byte handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **PDF byte handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **PDF byte handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **PDF byte handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **PDF byte handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **PDF byte handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **PDF byte handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **PDF byte handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **PDF byte handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **PDF byte handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **PDF byte handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **PDF byte handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **PDF byte handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **PDF byte handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. document parsing

1. For **document parsing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **document parsing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **document parsing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **document parsing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **document parsing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **document parsing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **document parsing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **document parsing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **document parsing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **document parsing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **document parsing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **document parsing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **document parsing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **document parsing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **document parsing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **document parsing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **document parsing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **document parsing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **document parsing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **document parsing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **document parsing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. QR encoding and decoding

1. For **QR encoding and decoding**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **QR encoding and decoding**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **QR encoding and decoding**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **QR encoding and decoding**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **QR encoding and decoding**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **QR encoding and decoding**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **QR encoding and decoding**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **QR encoding and decoding**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **QR encoding and decoding**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **QR encoding and decoding**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **QR encoding and decoding**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **QR encoding and decoding**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **QR encoding and decoding**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **QR encoding and decoding**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **QR encoding and decoding**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **QR encoding and decoding**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **QR encoding and decoding**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **QR encoding and decoding**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **QR encoding and decoding**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **QR encoding and decoding**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **QR encoding and decoding**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. WebAssembly loading

1. For **WebAssembly loading**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **WebAssembly loading**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **WebAssembly loading**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **WebAssembly loading**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **WebAssembly loading**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **WebAssembly loading**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **WebAssembly loading**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **WebAssembly loading**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **WebAssembly loading**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **WebAssembly loading**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **WebAssembly loading**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **WebAssembly loading**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **WebAssembly loading**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **WebAssembly loading**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **WebAssembly loading**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **WebAssembly loading**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **WebAssembly loading**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **WebAssembly loading**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **WebAssembly loading**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **WebAssembly loading**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **WebAssembly loading**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. worker offloading

1. For **worker offloading**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **worker offloading**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **worker offloading**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **worker offloading**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **worker offloading**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **worker offloading**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **worker offloading**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **worker offloading**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **worker offloading**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **worker offloading**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **worker offloading**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **worker offloading**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **worker offloading**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **worker offloading**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **worker offloading**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **worker offloading**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **worker offloading**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **worker offloading**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **worker offloading**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **worker offloading**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **worker offloading**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. progress reporting

1. For **progress reporting**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **progress reporting**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **progress reporting**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **progress reporting**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **progress reporting**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **progress reporting**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **progress reporting**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **progress reporting**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **progress reporting**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **progress reporting**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **progress reporting**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **progress reporting**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **progress reporting**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **progress reporting**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **progress reporting**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **progress reporting**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **progress reporting**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **progress reporting**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **progress reporting**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **progress reporting**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **progress reporting**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. preview scaling

1. For **preview scaling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **preview scaling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **preview scaling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **preview scaling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **preview scaling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **preview scaling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **preview scaling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **preview scaling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **preview scaling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **preview scaling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **preview scaling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **preview scaling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **preview scaling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **preview scaling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **preview scaling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **preview scaling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **preview scaling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **preview scaling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **preview scaling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **preview scaling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **preview scaling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. zoom controls

1. For **zoom controls**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **zoom controls**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **zoom controls**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **zoom controls**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **zoom controls**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **zoom controls**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **zoom controls**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **zoom controls**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **zoom controls**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **zoom controls**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **zoom controls**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **zoom controls**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **zoom controls**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **zoom controls**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **zoom controls**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **zoom controls**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **zoom controls**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **zoom controls**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **zoom controls**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **zoom controls**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **zoom controls**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. export format selection

1. For **export format selection**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **export format selection**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **export format selection**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **export format selection**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **export format selection**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **export format selection**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **export format selection**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **export format selection**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **export format selection**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **export format selection**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **export format selection**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **export format selection**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **export format selection**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **export format selection**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **export format selection**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **export format selection**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **export format selection**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **export format selection**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **export format selection**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **export format selection**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **export format selection**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. metadata preservation

1. For **metadata preservation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **metadata preservation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **metadata preservation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **metadata preservation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **metadata preservation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **metadata preservation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **metadata preservation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **metadata preservation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **metadata preservation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **metadata preservation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **metadata preservation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **metadata preservation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **metadata preservation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **metadata preservation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **metadata preservation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **metadata preservation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **metadata preservation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **metadata preservation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **metadata preservation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **metadata preservation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **metadata preservation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. metadata removal

1. For **metadata removal**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **metadata removal**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **metadata removal**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **metadata removal**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **metadata removal**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **metadata removal**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **metadata removal**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **metadata removal**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **metadata removal**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **metadata removal**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **metadata removal**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **metadata removal**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **metadata removal**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **metadata removal**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **metadata removal**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **metadata removal**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **metadata removal**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **metadata removal**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **metadata removal**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **metadata removal**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **metadata removal**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. memory pressure handling

1. For **memory pressure handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **memory pressure handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **memory pressure handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **memory pressure handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **memory pressure handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **memory pressure handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **memory pressure handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **memory pressure handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **memory pressure handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **memory pressure handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **memory pressure handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **memory pressure handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **memory pressure handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **memory pressure handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **memory pressure handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **memory pressure handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **memory pressure handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **memory pressure handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **memory pressure handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **memory pressure handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **memory pressure handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. media tool completion

1. For **media tool completion**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **media tool completion**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **media tool completion**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **media tool completion**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **media tool completion**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **media tool completion**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **media tool completion**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **media tool completion**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **media tool completion**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **media tool completion**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **media tool completion**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **media tool completion**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **media tool completion**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **media tool completion**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **media tool completion**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **media tool completion**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **media tool completion**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **media tool completion**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **media tool completion**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **media tool completion**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **media tool completion**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

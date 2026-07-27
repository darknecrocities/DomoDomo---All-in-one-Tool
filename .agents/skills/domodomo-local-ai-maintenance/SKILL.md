---
name: domodomo-local-ai-maintenance
description: Maintain DomoDomo private local AI features, Ollama connections, browser inference, streaming UX, embeddings, RAG, memory, and agent interfaces. Use when changing src/tools/ai, AI services, workers, local model behavior, or AI-related backend routes.
---

# DomoDomo Local AI Maintenance

Maintain Local Ollama and browser inference features that must keep prompts, files, memory, and model execution on the user device.

## Operating contract

- **Scope:** Local Ollama and browser inference features that must keep prompts, files, memory, and model execution on the user device.
- **Primary files:** src/tools/ai/, src/utils/aiService.ts, src/utils/mcpClient.ts, src/utils/transformers.worker.ts, src/utils/localMemory.ts, backend/routers/chat.py, and backend/utils/rag.py.
- **Before changing code:** Read the UI request path, service boundary, streaming parser, local fallback path, and model-unavailable behavior before changing prompts or transport.

## 01. local AI feature intent

1. For **local AI feature intent**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **local AI feature intent**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **local AI feature intent**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **local AI feature intent**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **local AI feature intent**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **local AI feature intent**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **local AI feature intent**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **local AI feature intent**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **local AI feature intent**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **local AI feature intent**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **local AI feature intent**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **local AI feature intent**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **local AI feature intent**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **local AI feature intent**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **local AI feature intent**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **local AI feature intent**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **local AI feature intent**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **local AI feature intent**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **local AI feature intent**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **local AI feature intent**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **local AI feature intent**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. Ollama connection discovery

1. For **Ollama connection discovery**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **Ollama connection discovery**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **Ollama connection discovery**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **Ollama connection discovery**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **Ollama connection discovery**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **Ollama connection discovery**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **Ollama connection discovery**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **Ollama connection discovery**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **Ollama connection discovery**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **Ollama connection discovery**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **Ollama connection discovery**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **Ollama connection discovery**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **Ollama connection discovery**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **Ollama connection discovery**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **Ollama connection discovery**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **Ollama connection discovery**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **Ollama connection discovery**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **Ollama connection discovery**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **Ollama connection discovery**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **Ollama connection discovery**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **Ollama connection discovery**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. model availability states

1. For **model availability states**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **model availability states**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **model availability states**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **model availability states**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **model availability states**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **model availability states**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **model availability states**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **model availability states**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **model availability states**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **model availability states**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **model availability states**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **model availability states**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **model availability states**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **model availability states**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **model availability states**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **model availability states**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **model availability states**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **model availability states**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **model availability states**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **model availability states**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **model availability states**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. streaming response parsing

1. For **streaming response parsing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **streaming response parsing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **streaming response parsing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **streaming response parsing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **streaming response parsing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **streaming response parsing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **streaming response parsing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **streaming response parsing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **streaming response parsing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **streaming response parsing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **streaming response parsing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **streaming response parsing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **streaming response parsing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **streaming response parsing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **streaming response parsing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **streaming response parsing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **streaming response parsing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **streaming response parsing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **streaming response parsing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **streaming response parsing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **streaming response parsing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. request cancellation

1. For **request cancellation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **request cancellation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **request cancellation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **request cancellation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **request cancellation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **request cancellation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **request cancellation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **request cancellation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **request cancellation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **request cancellation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **request cancellation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **request cancellation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **request cancellation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **request cancellation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **request cancellation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **request cancellation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **request cancellation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **request cancellation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **request cancellation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **request cancellation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **request cancellation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. prompt construction

1. For **prompt construction**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **prompt construction**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **prompt construction**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **prompt construction**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **prompt construction**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **prompt construction**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **prompt construction**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **prompt construction**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **prompt construction**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **prompt construction**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **prompt construction**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **prompt construction**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **prompt construction**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **prompt construction**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **prompt construction**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **prompt construction**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **prompt construction**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **prompt construction**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **prompt construction**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **prompt construction**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **prompt construction**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. sensitive input handling

1. For **sensitive input handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **sensitive input handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **sensitive input handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **sensitive input handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **sensitive input handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **sensitive input handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **sensitive input handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **sensitive input handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **sensitive input handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **sensitive input handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **sensitive input handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **sensitive input handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **sensitive input handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **sensitive input handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **sensitive input handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **sensitive input handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **sensitive input handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **sensitive input handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **sensitive input handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **sensitive input handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **sensitive input handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. local model selection

1. For **local model selection**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **local model selection**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **local model selection**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **local model selection**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **local model selection**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **local model selection**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **local model selection**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **local model selection**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **local model selection**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **local model selection**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **local model selection**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **local model selection**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **local model selection**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **local model selection**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **local model selection**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **local model selection**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **local model selection**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **local model selection**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **local model selection**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **local model selection**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **local model selection**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. browser inference workers

1. For **browser inference workers**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **browser inference workers**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **browser inference workers**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **browser inference workers**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **browser inference workers**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **browser inference workers**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **browser inference workers**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **browser inference workers**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **browser inference workers**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **browser inference workers**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **browser inference workers**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **browser inference workers**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **browser inference workers**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **browser inference workers**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **browser inference workers**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **browser inference workers**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **browser inference workers**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **browser inference workers**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **browser inference workers**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **browser inference workers**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **browser inference workers**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. embedding generation

1. For **embedding generation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **embedding generation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **embedding generation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **embedding generation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **embedding generation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **embedding generation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **embedding generation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **embedding generation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **embedding generation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **embedding generation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **embedding generation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **embedding generation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **embedding generation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **embedding generation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **embedding generation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **embedding generation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **embedding generation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **embedding generation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **embedding generation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **embedding generation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **embedding generation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. RAG retrieval context

1. For **RAG retrieval context**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **RAG retrieval context**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **RAG retrieval context**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **RAG retrieval context**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **RAG retrieval context**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **RAG retrieval context**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **RAG retrieval context**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **RAG retrieval context**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **RAG retrieval context**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **RAG retrieval context**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **RAG retrieval context**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **RAG retrieval context**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **RAG retrieval context**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **RAG retrieval context**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **RAG retrieval context**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **RAG retrieval context**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **RAG retrieval context**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **RAG retrieval context**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **RAG retrieval context**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **RAG retrieval context**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **RAG retrieval context**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. memory persistence

1. For **memory persistence**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **memory persistence**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **memory persistence**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **memory persistence**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **memory persistence**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **memory persistence**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **memory persistence**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **memory persistence**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **memory persistence**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **memory persistence**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **memory persistence**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **memory persistence**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **memory persistence**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **memory persistence**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **memory persistence**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **memory persistence**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **memory persistence**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **memory persistence**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **memory persistence**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **memory persistence**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **memory persistence**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. journal privacy boundaries

1. For **journal privacy boundaries**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **journal privacy boundaries**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **journal privacy boundaries**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **journal privacy boundaries**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **journal privacy boundaries**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **journal privacy boundaries**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **journal privacy boundaries**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **journal privacy boundaries**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **journal privacy boundaries**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **journal privacy boundaries**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **journal privacy boundaries**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **journal privacy boundaries**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **journal privacy boundaries**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **journal privacy boundaries**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **journal privacy boundaries**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **journal privacy boundaries**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **journal privacy boundaries**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **journal privacy boundaries**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **journal privacy boundaries**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **journal privacy boundaries**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **journal privacy boundaries**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. token-by-token rendering

1. For **token-by-token rendering**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **token-by-token rendering**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **token-by-token rendering**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **token-by-token rendering**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **token-by-token rendering**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **token-by-token rendering**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **token-by-token rendering**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **token-by-token rendering**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **token-by-token rendering**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **token-by-token rendering**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **token-by-token rendering**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **token-by-token rendering**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **token-by-token rendering**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **token-by-token rendering**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **token-by-token rendering**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **token-by-token rendering**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **token-by-token rendering**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **token-by-token rendering**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **token-by-token rendering**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **token-by-token rendering**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **token-by-token rendering**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. error recovery states

1. For **error recovery states**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **error recovery states**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **error recovery states**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **error recovery states**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **error recovery states**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **error recovery states**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **error recovery states**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **error recovery states**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **error recovery states**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **error recovery states**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **error recovery states**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **error recovery states**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **error recovery states**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **error recovery states**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **error recovery states**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **error recovery states**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **error recovery states**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **error recovery states**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **error recovery states**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **error recovery states**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **error recovery states**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. offline fallback behavior

1. For **offline fallback behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **offline fallback behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **offline fallback behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **offline fallback behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **offline fallback behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **offline fallback behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **offline fallback behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **offline fallback behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **offline fallback behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **offline fallback behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **offline fallback behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **offline fallback behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **offline fallback behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **offline fallback behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **offline fallback behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **offline fallback behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **offline fallback behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **offline fallback behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **offline fallback behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **offline fallback behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **offline fallback behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. hardware capability messaging

1. For **hardware capability messaging**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **hardware capability messaging**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **hardware capability messaging**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **hardware capability messaging**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **hardware capability messaging**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **hardware capability messaging**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **hardware capability messaging**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **hardware capability messaging**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **hardware capability messaging**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **hardware capability messaging**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **hardware capability messaging**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **hardware capability messaging**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **hardware capability messaging**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **hardware capability messaging**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **hardware capability messaging**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **hardware capability messaging**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **hardware capability messaging**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **hardware capability messaging**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **hardware capability messaging**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **hardware capability messaging**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **hardware capability messaging**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. AI tool documentation

1. For **AI tool documentation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **AI tool documentation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **AI tool documentation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **AI tool documentation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **AI tool documentation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **AI tool documentation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **AI tool documentation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **AI tool documentation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **AI tool documentation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **AI tool documentation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **AI tool documentation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **AI tool documentation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **AI tool documentation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **AI tool documentation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **AI tool documentation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **AI tool documentation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **AI tool documentation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **AI tool documentation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **AI tool documentation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **AI tool documentation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **AI tool documentation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. local AI testing scenarios

1. For **local AI testing scenarios**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **local AI testing scenarios**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **local AI testing scenarios**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **local AI testing scenarios**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **local AI testing scenarios**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **local AI testing scenarios**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **local AI testing scenarios**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **local AI testing scenarios**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **local AI testing scenarios**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **local AI testing scenarios**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **local AI testing scenarios**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **local AI testing scenarios**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **local AI testing scenarios**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **local AI testing scenarios**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **local AI testing scenarios**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **local AI testing scenarios**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **local AI testing scenarios**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **local AI testing scenarios**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **local AI testing scenarios**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **local AI testing scenarios**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **local AI testing scenarios**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. AI feature completion criteria

1. For **AI feature completion criteria**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **AI feature completion criteria**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **AI feature completion criteria**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **AI feature completion criteria**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **AI feature completion criteria**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **AI feature completion criteria**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **AI feature completion criteria**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **AI feature completion criteria**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **AI feature completion criteria**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **AI feature completion criteria**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **AI feature completion criteria**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **AI feature completion criteria**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **AI feature completion criteria**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **AI feature completion criteria**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **AI feature completion criteria**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **AI feature completion criteria**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **AI feature completion criteria**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **AI feature completion criteria**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **AI feature completion criteria**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **AI feature completion criteria**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **AI feature completion criteria**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

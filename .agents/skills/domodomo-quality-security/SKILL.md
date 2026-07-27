---
name: domodomo-quality-security
description: Maintain DomoDomo quality, privacy, security, correctness, linting, builds, validation, and safe local tool behavior. Use when reviewing changes, hardening code, adding tests, auditing a feature, or preparing a contribution for merge.
---

# DomoDomo Quality and Security

Maintain Cross-cutting reliability and security practices for a local-first application that processes user files and sensitive content.

## Operating contract

- **Scope:** Cross-cutting reliability and security practices for a local-first application that processes user files and sensitive content.
- **Primary files:** package.json, scripts/, src/, backend/, mcp-server/, .gitignore, and every changed feature surface.
- **Before changing code:** Read the full diff, relevant threat boundary, existing validation pattern, affected user data path, and available build or test command before approving a change.

## 01. diff inspection

1. For **diff inspection**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **diff inspection**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **diff inspection**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **diff inspection**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **diff inspection**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **diff inspection**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **diff inspection**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **diff inspection**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **diff inspection**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **diff inspection**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **diff inspection**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **diff inspection**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **diff inspection**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **diff inspection**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **diff inspection**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **diff inspection**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **diff inspection**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **diff inspection**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **diff inspection**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **diff inspection**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **diff inspection**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. TypeScript correctness

1. For **TypeScript correctness**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **TypeScript correctness**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **TypeScript correctness**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **TypeScript correctness**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **TypeScript correctness**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **TypeScript correctness**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **TypeScript correctness**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **TypeScript correctness**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **TypeScript correctness**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **TypeScript correctness**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **TypeScript correctness**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **TypeScript correctness**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **TypeScript correctness**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **TypeScript correctness**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **TypeScript correctness**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **TypeScript correctness**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **TypeScript correctness**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **TypeScript correctness**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **TypeScript correctness**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **TypeScript correctness**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **TypeScript correctness**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. ESLint compliance

1. For **ESLint compliance**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **ESLint compliance**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **ESLint compliance**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **ESLint compliance**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **ESLint compliance**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **ESLint compliance**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **ESLint compliance**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **ESLint compliance**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **ESLint compliance**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **ESLint compliance**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **ESLint compliance**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **ESLint compliance**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **ESLint compliance**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **ESLint compliance**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **ESLint compliance**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **ESLint compliance**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **ESLint compliance**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **ESLint compliance**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **ESLint compliance**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **ESLint compliance**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **ESLint compliance**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. Vite production builds

1. For **Vite production builds**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **Vite production builds**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **Vite production builds**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **Vite production builds**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **Vite production builds**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **Vite production builds**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **Vite production builds**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **Vite production builds**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **Vite production builds**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **Vite production builds**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **Vite production builds**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **Vite production builds**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **Vite production builds**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **Vite production builds**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **Vite production builds**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **Vite production builds**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **Vite production builds**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **Vite production builds**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **Vite production builds**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **Vite production builds**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **Vite production builds**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. MCP TypeScript builds

1. For **MCP TypeScript builds**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **MCP TypeScript builds**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **MCP TypeScript builds**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **MCP TypeScript builds**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **MCP TypeScript builds**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **MCP TypeScript builds**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **MCP TypeScript builds**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **MCP TypeScript builds**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **MCP TypeScript builds**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **MCP TypeScript builds**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **MCP TypeScript builds**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **MCP TypeScript builds**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **MCP TypeScript builds**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **MCP TypeScript builds**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **MCP TypeScript builds**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **MCP TypeScript builds**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **MCP TypeScript builds**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **MCP TypeScript builds**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **MCP TypeScript builds**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **MCP TypeScript builds**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **MCP TypeScript builds**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. input validation

1. For **input validation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **input validation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **input validation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **input validation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **input validation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **input validation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **input validation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **input validation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **input validation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **input validation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **input validation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **input validation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **input validation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **input validation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **input validation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **input validation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **input validation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **input validation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **input validation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **input validation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **input validation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. file type validation

1. For **file type validation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **file type validation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **file type validation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **file type validation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **file type validation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **file type validation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **file type validation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **file type validation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **file type validation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **file type validation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **file type validation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **file type validation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **file type validation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **file type validation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **file type validation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **file type validation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **file type validation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **file type validation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **file type validation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **file type validation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **file type validation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. file size validation

1. For **file size validation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **file size validation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **file size validation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **file size validation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **file size validation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **file size validation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **file size validation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **file size validation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **file size validation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **file size validation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **file size validation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **file size validation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **file size validation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **file size validation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **file size validation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **file size validation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **file size validation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **file size validation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **file size validation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **file size validation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **file size validation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. path traversal prevention

1. For **path traversal prevention**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **path traversal prevention**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **path traversal prevention**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **path traversal prevention**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **path traversal prevention**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **path traversal prevention**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **path traversal prevention**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **path traversal prevention**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **path traversal prevention**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **path traversal prevention**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **path traversal prevention**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **path traversal prevention**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **path traversal prevention**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **path traversal prevention**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **path traversal prevention**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **path traversal prevention**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **path traversal prevention**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **path traversal prevention**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **path traversal prevention**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **path traversal prevention**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **path traversal prevention**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. command injection prevention

1. For **command injection prevention**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **command injection prevention**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **command injection prevention**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **command injection prevention**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **command injection prevention**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **command injection prevention**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **command injection prevention**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **command injection prevention**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **command injection prevention**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **command injection prevention**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **command injection prevention**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **command injection prevention**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **command injection prevention**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **command injection prevention**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **command injection prevention**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **command injection prevention**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **command injection prevention**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **command injection prevention**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **command injection prevention**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **command injection prevention**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **command injection prevention**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. XSS prevention

1. For **XSS prevention**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **XSS prevention**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **XSS prevention**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **XSS prevention**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **XSS prevention**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **XSS prevention**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **XSS prevention**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **XSS prevention**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **XSS prevention**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **XSS prevention**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **XSS prevention**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **XSS prevention**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **XSS prevention**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **XSS prevention**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **XSS prevention**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **XSS prevention**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **XSS prevention**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **XSS prevention**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **XSS prevention**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **XSS prevention**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **XSS prevention**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. secret handling

1. For **secret handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **secret handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **secret handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **secret handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **secret handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **secret handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **secret handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **secret handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **secret handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **secret handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **secret handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **secret handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **secret handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **secret handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **secret handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **secret handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **secret handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **secret handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **secret handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **secret handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **secret handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. privacy-preserving logs

1. For **privacy-preserving logs**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **privacy-preserving logs**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **privacy-preserving logs**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **privacy-preserving logs**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **privacy-preserving logs**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **privacy-preserving logs**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **privacy-preserving logs**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **privacy-preserving logs**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **privacy-preserving logs**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **privacy-preserving logs**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **privacy-preserving logs**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **privacy-preserving logs**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **privacy-preserving logs**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **privacy-preserving logs**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **privacy-preserving logs**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **privacy-preserving logs**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **privacy-preserving logs**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **privacy-preserving logs**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **privacy-preserving logs**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **privacy-preserving logs**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **privacy-preserving logs**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. dependency review

1. For **dependency review**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **dependency review**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **dependency review**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **dependency review**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **dependency review**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **dependency review**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **dependency review**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **dependency review**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **dependency review**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **dependency review**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **dependency review**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **dependency review**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **dependency review**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **dependency review**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **dependency review**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **dependency review**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **dependency review**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **dependency review**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **dependency review**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **dependency review**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **dependency review**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. resource cleanup

1. For **resource cleanup**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **resource cleanup**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **resource cleanup**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **resource cleanup**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **resource cleanup**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **resource cleanup**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **resource cleanup**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **resource cleanup**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **resource cleanup**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **resource cleanup**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **resource cleanup**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **resource cleanup**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **resource cleanup**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **resource cleanup**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **resource cleanup**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **resource cleanup**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **resource cleanup**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **resource cleanup**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **resource cleanup**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **resource cleanup**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **resource cleanup**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. error boundary behavior

1. For **error boundary behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **error boundary behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **error boundary behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **error boundary behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **error boundary behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **error boundary behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **error boundary behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **error boundary behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **error boundary behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **error boundary behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **error boundary behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **error boundary behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **error boundary behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **error boundary behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **error boundary behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **error boundary behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **error boundary behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **error boundary behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **error boundary behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **error boundary behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **error boundary behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. accessibility verification

1. For **accessibility verification**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **accessibility verification**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **accessibility verification**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **accessibility verification**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **accessibility verification**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **accessibility verification**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **accessibility verification**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **accessibility verification**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **accessibility verification**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **accessibility verification**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **accessibility verification**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **accessibility verification**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **accessibility verification**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **accessibility verification**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **accessibility verification**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **accessibility verification**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **accessibility verification**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **accessibility verification**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **accessibility verification**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **accessibility verification**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **accessibility verification**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. manual regression testing

1. For **manual regression testing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **manual regression testing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **manual regression testing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **manual regression testing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **manual regression testing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **manual regression testing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **manual regression testing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **manual regression testing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **manual regression testing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **manual regression testing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **manual regression testing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **manual regression testing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **manual regression testing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **manual regression testing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **manual regression testing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **manual regression testing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **manual regression testing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **manual regression testing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **manual regression testing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **manual regression testing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **manual regression testing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. security review evidence

1. For **security review evidence**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **security review evidence**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **security review evidence**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **security review evidence**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **security review evidence**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **security review evidence**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **security review evidence**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **security review evidence**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **security review evidence**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **security review evidence**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **security review evidence**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **security review evidence**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **security review evidence**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **security review evidence**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **security review evidence**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **security review evidence**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **security review evidence**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **security review evidence**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **security review evidence**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **security review evidence**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **security review evidence**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. merge readiness

1. For **merge readiness**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **merge readiness**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **merge readiness**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **merge readiness**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **merge readiness**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **merge readiness**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **merge readiness**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **merge readiness**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **merge readiness**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **merge readiness**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **merge readiness**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **merge readiness**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **merge readiness**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **merge readiness**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **merge readiness**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **merge readiness**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **merge readiness**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **merge readiness**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **merge readiness**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **merge readiness**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **merge readiness**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

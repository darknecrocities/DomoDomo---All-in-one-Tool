---
name: domodomo-mcp-integration
description: Maintain DomoDomo’s local Model Context Protocol server, tool schemas, filesystem controls, process integration, and client connection behavior. Use when changing mcp-server/, src/utils/mcpClient.ts, MCP tool definitions, or local agent permissions.
---

# DomoDomo MCP Integration

Maintain The Node MCP server and browser client that expose intentional local capabilities to DomoDomo agents.

## Operating contract

- **Scope:** The Node MCP server and browser client that expose intentional local capabilities to DomoDomo agents.
- **Primary files:** mcp-server/src/index.ts, mcp-server/package.json, mcp-server/tsconfig.json, src/utils/mcpClient.ts, and AI MCP management components.
- **Before changing code:** Read the current MCP transport, tool list, schema shape, workspace-root assumptions, and calling UI before adding or widening a capability.

## 01. MCP server startup

1. For **MCP server startup**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **MCP server startup**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **MCP server startup**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **MCP server startup**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **MCP server startup**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **MCP server startup**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **MCP server startup**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **MCP server startup**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **MCP server startup**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **MCP server startup**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **MCP server startup**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **MCP server startup**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **MCP server startup**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **MCP server startup**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **MCP server startup**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **MCP server startup**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **MCP server startup**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **MCP server startup**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **MCP server startup**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **MCP server startup**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **MCP server startup**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. transport lifecycle

1. For **transport lifecycle**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **transport lifecycle**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **transport lifecycle**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **transport lifecycle**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **transport lifecycle**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **transport lifecycle**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **transport lifecycle**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **transport lifecycle**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **transport lifecycle**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **transport lifecycle**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **transport lifecycle**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **transport lifecycle**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **transport lifecycle**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **transport lifecycle**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **transport lifecycle**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **transport lifecycle**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **transport lifecycle**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **transport lifecycle**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **transport lifecycle**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **transport lifecycle**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **transport lifecycle**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. tool naming

1. For **tool naming**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **tool naming**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **tool naming**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **tool naming**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **tool naming**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **tool naming**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **tool naming**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **tool naming**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **tool naming**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **tool naming**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **tool naming**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **tool naming**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **tool naming**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **tool naming**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **tool naming**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **tool naming**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **tool naming**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **tool naming**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **tool naming**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **tool naming**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **tool naming**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. tool descriptions

1. For **tool descriptions**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **tool descriptions**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **tool descriptions**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **tool descriptions**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **tool descriptions**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **tool descriptions**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **tool descriptions**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **tool descriptions**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **tool descriptions**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **tool descriptions**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **tool descriptions**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **tool descriptions**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **tool descriptions**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **tool descriptions**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **tool descriptions**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **tool descriptions**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **tool descriptions**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **tool descriptions**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **tool descriptions**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **tool descriptions**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **tool descriptions**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. JSON schema design

1. For **JSON schema design**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **JSON schema design**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **JSON schema design**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **JSON schema design**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **JSON schema design**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **JSON schema design**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **JSON schema design**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **JSON schema design**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **JSON schema design**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **JSON schema design**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **JSON schema design**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **JSON schema design**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **JSON schema design**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **JSON schema design**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **JSON schema design**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **JSON schema design**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **JSON schema design**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **JSON schema design**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **JSON schema design**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **JSON schema design**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **JSON schema design**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

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

## 07. workspace path resolution

1. For **workspace path resolution**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **workspace path resolution**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **workspace path resolution**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **workspace path resolution**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **workspace path resolution**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **workspace path resolution**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **workspace path resolution**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **workspace path resolution**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **workspace path resolution**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **workspace path resolution**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **workspace path resolution**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **workspace path resolution**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **workspace path resolution**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **workspace path resolution**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **workspace path resolution**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **workspace path resolution**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **workspace path resolution**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **workspace path resolution**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **workspace path resolution**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **workspace path resolution**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **workspace path resolution**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. filesystem read controls

1. For **filesystem read controls**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **filesystem read controls**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **filesystem read controls**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **filesystem read controls**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **filesystem read controls**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **filesystem read controls**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **filesystem read controls**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **filesystem read controls**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **filesystem read controls**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **filesystem read controls**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **filesystem read controls**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **filesystem read controls**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **filesystem read controls**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **filesystem read controls**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **filesystem read controls**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **filesystem read controls**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **filesystem read controls**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **filesystem read controls**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **filesystem read controls**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **filesystem read controls**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **filesystem read controls**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. filesystem write controls

1. For **filesystem write controls**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **filesystem write controls**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **filesystem write controls**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **filesystem write controls**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **filesystem write controls**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **filesystem write controls**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **filesystem write controls**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **filesystem write controls**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **filesystem write controls**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **filesystem write controls**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **filesystem write controls**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **filesystem write controls**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **filesystem write controls**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **filesystem write controls**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **filesystem write controls**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **filesystem write controls**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **filesystem write controls**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **filesystem write controls**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **filesystem write controls**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **filesystem write controls**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **filesystem write controls**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. command execution boundaries

1. For **command execution boundaries**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **command execution boundaries**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **command execution boundaries**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **command execution boundaries**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **command execution boundaries**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **command execution boundaries**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **command execution boundaries**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **command execution boundaries**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **command execution boundaries**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **command execution boundaries**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **command execution boundaries**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **command execution boundaries**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **command execution boundaries**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **command execution boundaries**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **command execution boundaries**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **command execution boundaries**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **command execution boundaries**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **command execution boundaries**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **command execution boundaries**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **command execution boundaries**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **command execution boundaries**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. process output handling

1. For **process output handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **process output handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **process output handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **process output handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **process output handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **process output handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **process output handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **process output handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **process output handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **process output handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **process output handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **process output handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **process output handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **process output handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **process output handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **process output handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **process output handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **process output handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **process output handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **process output handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **process output handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. Ollama model discovery

1. For **Ollama model discovery**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **Ollama model discovery**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **Ollama model discovery**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **Ollama model discovery**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **Ollama model discovery**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **Ollama model discovery**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **Ollama model discovery**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **Ollama model discovery**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **Ollama model discovery**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **Ollama model discovery**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **Ollama model discovery**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **Ollama model discovery**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **Ollama model discovery**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **Ollama model discovery**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **Ollama model discovery**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **Ollama model discovery**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **Ollama model discovery**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **Ollama model discovery**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **Ollama model discovery**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **Ollama model discovery**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **Ollama model discovery**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. SSE connection behavior

1. For **SSE connection behavior**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **SSE connection behavior**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **SSE connection behavior**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **SSE connection behavior**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **SSE connection behavior**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **SSE connection behavior**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **SSE connection behavior**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **SSE connection behavior**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **SSE connection behavior**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **SSE connection behavior**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **SSE connection behavior**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **SSE connection behavior**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **SSE connection behavior**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **SSE connection behavior**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **SSE connection behavior**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **SSE connection behavior**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **SSE connection behavior**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **SSE connection behavior**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **SSE connection behavior**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **SSE connection behavior**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **SSE connection behavior**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. client connection states

1. For **client connection states**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **client connection states**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **client connection states**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **client connection states**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **client connection states**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **client connection states**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **client connection states**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **client connection states**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **client connection states**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **client connection states**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **client connection states**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **client connection states**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **client connection states**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **client connection states**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **client connection states**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **client connection states**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **client connection states**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **client connection states**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **client connection states**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **client connection states**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **client connection states**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. agent permission UX

1. For **agent permission UX**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **agent permission UX**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **agent permission UX**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **agent permission UX**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **agent permission UX**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **agent permission UX**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **agent permission UX**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **agent permission UX**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **agent permission UX**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **agent permission UX**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **agent permission UX**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **agent permission UX**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **agent permission UX**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **agent permission UX**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **agent permission UX**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **agent permission UX**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **agent permission UX**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **agent permission UX**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **agent permission UX**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **agent permission UX**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **agent permission UX**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. failure and timeout handling

1. For **failure and timeout handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **failure and timeout handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **failure and timeout handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **failure and timeout handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **failure and timeout handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **failure and timeout handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **failure and timeout handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **failure and timeout handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **failure and timeout handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **failure and timeout handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **failure and timeout handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **failure and timeout handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **failure and timeout handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **failure and timeout handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **failure and timeout handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **failure and timeout handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **failure and timeout handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **failure and timeout handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **failure and timeout handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **failure and timeout handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **failure and timeout handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. sensitive output redaction

1. For **sensitive output redaction**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **sensitive output redaction**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **sensitive output redaction**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **sensitive output redaction**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **sensitive output redaction**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **sensitive output redaction**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **sensitive output redaction**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **sensitive output redaction**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **sensitive output redaction**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **sensitive output redaction**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **sensitive output redaction**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **sensitive output redaction**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **sensitive output redaction**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **sensitive output redaction**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **sensitive output redaction**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **sensitive output redaction**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **sensitive output redaction**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **sensitive output redaction**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **sensitive output redaction**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **sensitive output redaction**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **sensitive output redaction**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. MCP build verification

1. For **MCP build verification**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **MCP build verification**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **MCP build verification**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **MCP build verification**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **MCP build verification**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **MCP build verification**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **MCP build verification**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **MCP build verification**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **MCP build verification**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **MCP build verification**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **MCP build verification**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **MCP build verification**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **MCP build verification**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **MCP build verification**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **MCP build verification**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **MCP build verification**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **MCP build verification**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **MCP build verification**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **MCP build verification**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **MCP build verification**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **MCP build verification**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. MCP integration testing

1. For **MCP integration testing**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **MCP integration testing**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **MCP integration testing**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **MCP integration testing**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **MCP integration testing**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **MCP integration testing**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **MCP integration testing**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **MCP integration testing**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **MCP integration testing**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **MCP integration testing**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **MCP integration testing**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **MCP integration testing**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **MCP integration testing**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **MCP integration testing**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **MCP integration testing**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **MCP integration testing**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **MCP integration testing**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **MCP integration testing**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **MCP integration testing**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **MCP integration testing**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **MCP integration testing**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. MCP capability completion

1. For **MCP capability completion**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **MCP capability completion**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **MCP capability completion**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **MCP capability completion**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **MCP capability completion**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **MCP capability completion**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **MCP capability completion**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **MCP capability completion**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **MCP capability completion**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **MCP capability completion**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **MCP capability completion**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **MCP capability completion**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **MCP capability completion**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **MCP capability completion**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **MCP capability completion**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **MCP capability completion**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **MCP capability completion**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **MCP capability completion**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **MCP capability completion**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **MCP capability completion**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **MCP capability completion**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

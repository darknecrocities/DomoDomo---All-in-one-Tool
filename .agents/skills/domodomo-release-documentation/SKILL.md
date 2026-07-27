---
name: domodomo-release-documentation
description: Maintain DomoDomo product documentation, technical tool records, About metrics, blog posts, SEO metadata, sitemap generation, release communication, and contributor guidance. Use when a feature changes user-visible capabilities or project maintenance instructions.
---

# DomoDomo Release and Documentation

Maintain The documentation and release surfaces that explain accurately how DomoDomo works, what runs locally, and how contributors maintain it.

## Operating contract

- **Scope:** The documentation and release surfaces that explain accurately how DomoDomo works, what runs locally, and how contributors maintain it.
- **Primary files:** README.md, CONTRIBUTING.md, src/utils/ToolDocsData.ts, src/pages/Documentation.tsx, src/pages/AboutApplication.tsx, src/data/blogData.ts, src/data/seoVariations.ts, public/sitemap.xml, and scripts/.
- **Before changing code:** Read the implemented behavior, registry metadata, existing documentation schema, nearby blog post, current metrics, and generated SEO inputs before changing copy.

## 01. documentation source ownership

1. For **documentation source ownership**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **documentation source ownership**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **documentation source ownership**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **documentation source ownership**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **documentation source ownership**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **documentation source ownership**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **documentation source ownership**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **documentation source ownership**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **documentation source ownership**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **documentation source ownership**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **documentation source ownership**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **documentation source ownership**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **documentation source ownership**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **documentation source ownership**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **documentation source ownership**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **documentation source ownership**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **documentation source ownership**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **documentation source ownership**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **documentation source ownership**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **documentation source ownership**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **documentation source ownership**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 02. tool technical records

1. For **tool technical records**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **tool technical records**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **tool technical records**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **tool technical records**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **tool technical records**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **tool technical records**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **tool technical records**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **tool technical records**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **tool technical records**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **tool technical records**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **tool technical records**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **tool technical records**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **tool technical records**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **tool technical records**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **tool technical records**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **tool technical records**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **tool technical records**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **tool technical records**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **tool technical records**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **tool technical records**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **tool technical records**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 03. category documentation

1. For **category documentation**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **category documentation**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **category documentation**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **category documentation**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **category documentation**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **category documentation**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **category documentation**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **category documentation**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **category documentation**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **category documentation**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **category documentation**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **category documentation**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **category documentation**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **category documentation**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **category documentation**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **category documentation**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **category documentation**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **category documentation**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **category documentation**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **category documentation**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **category documentation**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 04. local-processing claims

1. For **local-processing claims**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **local-processing claims**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **local-processing claims**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **local-processing claims**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **local-processing claims**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **local-processing claims**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **local-processing claims**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **local-processing claims**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **local-processing claims**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **local-processing claims**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **local-processing claims**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **local-processing claims**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **local-processing claims**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **local-processing claims**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **local-processing claims**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **local-processing claims**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **local-processing claims**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **local-processing claims**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **local-processing claims**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **local-processing claims**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **local-processing claims**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 05. supported format claims

1. For **supported format claims**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **supported format claims**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **supported format claims**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **supported format claims**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **supported format claims**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **supported format claims**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **supported format claims**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **supported format claims**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **supported format claims**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **supported format claims**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **supported format claims**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **supported format claims**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **supported format claims**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **supported format claims**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **supported format claims**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **supported format claims**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **supported format claims**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **supported format claims**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **supported format claims**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **supported format claims**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **supported format claims**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 06. hardware requirement claims

1. For **hardware requirement claims**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **hardware requirement claims**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **hardware requirement claims**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **hardware requirement claims**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **hardware requirement claims**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **hardware requirement claims**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **hardware requirement claims**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **hardware requirement claims**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **hardware requirement claims**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **hardware requirement claims**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **hardware requirement claims**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **hardware requirement claims**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **hardware requirement claims**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **hardware requirement claims**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **hardware requirement claims**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **hardware requirement claims**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **hardware requirement claims**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **hardware requirement claims**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **hardware requirement claims**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **hardware requirement claims**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **hardware requirement claims**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 07. privacy wording

1. For **privacy wording**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **privacy wording**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **privacy wording**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **privacy wording**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **privacy wording**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **privacy wording**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **privacy wording**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **privacy wording**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **privacy wording**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **privacy wording**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **privacy wording**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **privacy wording**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **privacy wording**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **privacy wording**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **privacy wording**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **privacy wording**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **privacy wording**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **privacy wording**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **privacy wording**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **privacy wording**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **privacy wording**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 08. About utility metrics

1. For **About utility metrics**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **About utility metrics**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **About utility metrics**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **About utility metrics**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **About utility metrics**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **About utility metrics**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **About utility metrics**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **About utility metrics**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **About utility metrics**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **About utility metrics**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **About utility metrics**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **About utility metrics**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **About utility metrics**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **About utility metrics**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **About utility metrics**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **About utility metrics**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **About utility metrics**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **About utility metrics**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **About utility metrics**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **About utility metrics**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **About utility metrics**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 09. About category metrics

1. For **About category metrics**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **About category metrics**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **About category metrics**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **About category metrics**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **About category metrics**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **About category metrics**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **About category metrics**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **About category metrics**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **About category metrics**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **About category metrics**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **About category metrics**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **About category metrics**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **About category metrics**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **About category metrics**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **About category metrics**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **About category metrics**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **About category metrics**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **About category metrics**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **About category metrics**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **About category metrics**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **About category metrics**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 10. blog post schema

1. For **blog post schema**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **blog post schema**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **blog post schema**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **blog post schema**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **blog post schema**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **blog post schema**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **blog post schema**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **blog post schema**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **blog post schema**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **blog post schema**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **blog post schema**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **blog post schema**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **blog post schema**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **blog post schema**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **blog post schema**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **blog post schema**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **blog post schema**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **blog post schema**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **blog post schema**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **blog post schema**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **blog post schema**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 11. blog release accuracy

1. For **blog release accuracy**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **blog release accuracy**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **blog release accuracy**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **blog release accuracy**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **blog release accuracy**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **blog release accuracy**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **blog release accuracy**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **blog release accuracy**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **blog release accuracy**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **blog release accuracy**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **blog release accuracy**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **blog release accuracy**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **blog release accuracy**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **blog release accuracy**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **blog release accuracy**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **blog release accuracy**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **blog release accuracy**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **blog release accuracy**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **blog release accuracy**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **blog release accuracy**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **blog release accuracy**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 12. SEO title patterns

1. For **SEO title patterns**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **SEO title patterns**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **SEO title patterns**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **SEO title patterns**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **SEO title patterns**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **SEO title patterns**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **SEO title patterns**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **SEO title patterns**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **SEO title patterns**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **SEO title patterns**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **SEO title patterns**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **SEO title patterns**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **SEO title patterns**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **SEO title patterns**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **SEO title patterns**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **SEO title patterns**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **SEO title patterns**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **SEO title patterns**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **SEO title patterns**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **SEO title patterns**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **SEO title patterns**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 13. SEO description patterns

1. For **SEO description patterns**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **SEO description patterns**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **SEO description patterns**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **SEO description patterns**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **SEO description patterns**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **SEO description patterns**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **SEO description patterns**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **SEO description patterns**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **SEO description patterns**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **SEO description patterns**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **SEO description patterns**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **SEO description patterns**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **SEO description patterns**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **SEO description patterns**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **SEO description patterns**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **SEO description patterns**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **SEO description patterns**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **SEO description patterns**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **SEO description patterns**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **SEO description patterns**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **SEO description patterns**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 14. sitemap generation inputs

1. For **sitemap generation inputs**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **sitemap generation inputs**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **sitemap generation inputs**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **sitemap generation inputs**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **sitemap generation inputs**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **sitemap generation inputs**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **sitemap generation inputs**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **sitemap generation inputs**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **sitemap generation inputs**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **sitemap generation inputs**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **sitemap generation inputs**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **sitemap generation inputs**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **sitemap generation inputs**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **sitemap generation inputs**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **sitemap generation inputs**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **sitemap generation inputs**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **sitemap generation inputs**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **sitemap generation inputs**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **sitemap generation inputs**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **sitemap generation inputs**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **sitemap generation inputs**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 15. contributor workflow docs

1. For **contributor workflow docs**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **contributor workflow docs**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **contributor workflow docs**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **contributor workflow docs**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **contributor workflow docs**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **contributor workflow docs**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **contributor workflow docs**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **contributor workflow docs**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **contributor workflow docs**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **contributor workflow docs**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **contributor workflow docs**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **contributor workflow docs**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **contributor workflow docs**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **contributor workflow docs**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **contributor workflow docs**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **contributor workflow docs**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **contributor workflow docs**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **contributor workflow docs**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **contributor workflow docs**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **contributor workflow docs**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **contributor workflow docs**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 16. installation instructions

1. For **installation instructions**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **installation instructions**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **installation instructions**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **installation instructions**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **installation instructions**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **installation instructions**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **installation instructions**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **installation instructions**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **installation instructions**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **installation instructions**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **installation instructions**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **installation instructions**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **installation instructions**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **installation instructions**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **installation instructions**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **installation instructions**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **installation instructions**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **installation instructions**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **installation instructions**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **installation instructions**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **installation instructions**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 17. release note scope

1. For **release note scope**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **release note scope**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **release note scope**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **release note scope**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **release note scope**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **release note scope**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **release note scope**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **release note scope**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **release note scope**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **release note scope**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **release note scope**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **release note scope**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **release note scope**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **release note scope**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **release note scope**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **release note scope**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **release note scope**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **release note scope**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **release note scope**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **release note scope**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **release note scope**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 18. generated file handling

1. For **generated file handling**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **generated file handling**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **generated file handling**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **generated file handling**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **generated file handling**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **generated file handling**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **generated file handling**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **generated file handling**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **generated file handling**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **generated file handling**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **generated file handling**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **generated file handling**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **generated file handling**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **generated file handling**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **generated file handling**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **generated file handling**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **generated file handling**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **generated file handling**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **generated file handling**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **generated file handling**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **generated file handling**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 19. documentation review

1. For **documentation review**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **documentation review**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **documentation review**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **documentation review**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **documentation review**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **documentation review**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **documentation review**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **documentation review**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **documentation review**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **documentation review**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **documentation review**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **documentation review**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **documentation review**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **documentation review**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **documentation review**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **documentation review**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **documentation review**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **documentation review**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **documentation review**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **documentation review**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **documentation review**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## 20. release completion

1. For **release completion**, establish the exact user-facing outcome and explicitly state which behavior is intentionally out of scope.
2. For **release completion**, read the nearest existing implementation before creating files, types, helpers, or a second pattern for the same job.
3. For **release completion**, map every caller, consumer, and persisted or exported output affected by this area before changing a contract.
4. For **release completion**, prefer the smallest local implementation that fits the established DomoDomo architecture and preserves offline behavior.
5. For **release completion**, use explicit TypeScript or Python types at boundaries; reject malformed values early and explain recovery to the user.
6. For **release completion**, keep user files, prompts, tokens, metadata, and derived artifacts on the device unless a documented local service is required.
7. For **release completion**, avoid adding a remote dependency, analytics call, credential requirement, or hidden network transfer to solve a local workflow.
8. For **release completion**, design empty, invalid, loading, cancellation, permission-denied, and failure states before treating the happy path as complete.
9. For **release completion**, release resources deterministically: revoke object URLs and terminate workers, listeners, streams, timers, and subscriptions.
10. For **release completion**, bound memory, CPU, and rendering work for large inputs; provide progress and a clear limit instead of freezing the interface.
11. For **release completion**, reuse DomoDomo visual patterns, semantic controls, labels, focus behavior, responsive rules, and accessible feedback.
12. For **release completion**, keep identifiers stable and align names, categories, descriptions, paths, exports, and documentation across all affected surfaces.
13. For **release completion**, record non-obvious browser, model, file-format, hardware, or platform limitations where agents and users will encounter them.
14. For **release completion**, treat logs, exception messages, generated artifacts, and command output as potentially sensitive; minimize what is retained or shown.
15. For **release completion**, verify that retries and repeated actions are safe and do not duplicate records, leak handles, or leave stale UI state.
16. For **release completion**, test the narrowest realistic scenario first, then test a large or slow input and a user interruption before declaring success.
17. For **release completion**, inspect the final diff for accidental generated files, credentials, databases, model data, unrelated refactors, and false claims.
18. For **release completion**, run the applicable project command and report its result; do not infer correctness from a visual inspection alone.
19. For **release completion**, update product-facing documentation, technical records, metrics, and blog content whenever this area changes a public capability.
20. For **release completion**, preserve unrelated working-tree changes and do not rewrite another contributor’s implementation without explicit scope.
21. For **release completion**, finish with a concise handoff that identifies changed files, verification evidence, limitations, and remaining follow-up work.

## Completion standard

- Confirm every changed surface follows this playbook and its local-first constraints.
- Confirm applicable documentation, About metrics, technical records, and blog content accurately describe the final behavior.
- Confirm the handoff records the commands run, validation outcome, known limits, and intentionally deferred work.

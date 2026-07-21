# DomoDomo Security & Privacy Architecture Policy

[![Local-First](https://img.shields.io/badge/Architecture-100%25%20Local--First-3C6B4D?style=for-the-badge&logo=shield)](https://domodomo.site)
[![Privacy Guarantee](https://img.shields.io/badge/Privacy-Zero%20Data%20Telemetry-4E8E5E?style=for-the-badge&logo=lock)](https://domodomo.site)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

Welcome to the official **DomoDomo Security & Privacy Policy**. DomoDomo is engineered from the ground up as a **100% local-first, client-side web application suite**. Our core architectural mission is to ensure that user files, images, documents, passwords, cryptographic keys, and AI prompts **never leave the user's browser sandbox**.

---

## Table of Contents

1. [Supported Versions](#1-supported-versions)
2. [Reporting a Vulnerability](#2-reporting-a-vulnerability)
3. [Zero-Knowledge Architecture & Privacy Guarantees](#3-zero-knowledge-architecture--privacy-guarantees)
4. [Client-Side Security Model & Cryptographic Standards](#4-client-side-security-model--cryptographic-standards)
5. [Local AI & LLM Threat Boundaries](#5-local-ai--llm-threat-boundaries)
6. [Dependency Lifecycle & Supply Chain Audits](#6-dependency-lifecycle--supply-chain-audits)
7. [Security Guidelines for Contributors](#7-security-guidelines-for-contributors)

---

## 1. Supported Versions

We actively maintain security patches for the following versions of DomoDomo:

| Version | Supported | Security Patch SLA |
| :--- | :---: | :--- |
| **`main` / Latest Release** | :white_check_mark: | Immediate (Within 24 Hours) |
| **`feature/*` Active Branches** | :white_check_mark: | Active Development Updates |
| **`< 1.0.0` Legacy Tags** | :x: | Recommended to upgrade to `main` |

---

## 2. Reporting a Vulnerability

We take the security of DomoDomo and our users very seriously. If you discover a security vulnerability or potential privacy leak, please disclose it responsibly.

> [!IMPORTANT]
> **Do NOT create a public GitHub Issue for unpatched vulnerabilities.** Please report them directly through our private security channel.

### Contact Information

- **Security Lead Email**: [security@domodomo.site](mailto:security@domodomo.site)
- **Repository Lead**: Arron Kian Parejas ([@darknecrocities](https://github.com/darknecrocities))
- **Response SLA**: We acknowledge receipt of security reports within **24 hours** and aim to release a patch or advisory within **72 hours**.

### Report Details to Include

To help us investigate and patch the issue efficiently, please include:
1. Description of the vulnerability (e.g., XSS, prototype pollution, WebCrypto key leak, memory buffer misuse).
2. Steps to reproduce or Proof-of-Concept (PoC) payload.
3. Affected browsers or operating systems.
4. Impact assessment on user data privacy or browser sandbox boundaries.

---

## 3. Zero-Knowledge Architecture & Privacy Guarantees

DomoDomo enforces strict local execution guarantees across all tools:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER SANDBOX                            │
│                                                                        │
│  ┌────────────────┐     ┌──────────────────┐     ┌──────────────────┐  │
│  │ Local Files    │ ──► │ WebAssembly      │ ──► │ Client Memory    │  │
│  │ Images / PDFs  │     │ WebCrypto / Canvas│     │ Raw ArrayBuffer  │  │
│  └────────────────┘     └──────────────────┘     └──────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│                    ┌────────────────────────────┐                      │
│                    │ Local Canvas / File Export │                      │
│                    └────────────────────────────┘                      │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                         [NO NETWORK TRAFFIC]
                                   ▼
                       ⛔ External Cloud Servers
```

- **Zero Cloud Transmission**: All file conversions, background removals, PDF encryption, OCR scans, image annotations, and 3D mesh processing execute 100% inside client browser memory (`WebAssembly`, `Canvas API`, `Web Audio`, `WebCrypto`).
- **No Telemetry or Tracking Cookies**: DomoDomo contains no analytics trackers, tracking beacons, or third-party ad scripts.
- **Offline Capable**: The application operates fully offline without an active internet connection.

---

## 4. Client-Side Security Model & Cryptographic Standards

### Cryptographic Engine Standards

DomoDomo's security tools (File Encryption, Password Analyzers, Hashes) utilize native W3C **Web Crypto API**:
- **AES-GCM (256-bit)** for authenticated symmetric file encryption.
- **PBKDF2** with 100,000+ iterations (SHA-256) for password key derivation.
- **SHA-256 / SHA-512** for tamper-evident file hashing.
- Cryptographically secure random number generation via `crypto.getRandomValues()`.

### DOM & Input Sanitization

- All dynamic HTML rendering uses React's JSX auto-escaping to prevent **Cross-Site Scripting (XSS)**.
- User input strings (URLs, regex patterns, OCR outputs) are sanitized prior to execution.
- External links employ `rel="noopener noreferrer"` attributes to prevent tab-nabbing attacks.

---

## 5. Local AI & LLM Threat Boundaries

DomoDomo's Local AI and DomoGuard security modules interface strictly with a **locally hosted Ollama daemon** (`http://localhost:11434`):

- **Localhost Loopback Isolation**: AI requests connect strictly over `localhost` socket interfaces. Prompts, code snippets, and logs are never routed to cloud AI endpoints (e.g., OpenAI, Anthropic).
- **System Prompt Sandboxing**: Prompts are constrained by rigid system instructions to prevent prompt injection and unauthorized command execution.
- **RAG & Thought Log Isolation**: Local AI thought records (`domo_journal.md`) are git-ignored locally to prevent inadvertent commits of sensitive logs to public repositories.

---

## 6. Dependency Lifecycle & Supply Chain Audits

We actively defend against supply chain attacks and vulnerable dependencies:

- **Automated CI/CD Security Audits**: All Pull Requests and commits trigger automated `npm audit --audit-level=high` scanners.
- **Overriding Vulnerable Packages**: Dependency vulnerabilities in transit packages are resolved via `package.json` overrides.
- **Zero Heavy Backend Servers**: Minimizes server attack surfaces by keeping all computational workloads inside client-side JS/WASM modules.

---

## 7. Security Guidelines for Contributors

When submitting pull requests to DomoDomo, developers MUST adhere to the following rules:

1. **Never Introduce Cloud APIs**: Do not import packages that transmit user data, files, or telemetry to external third-party servers.
2. **Use Shared Helper Downloads**: Use `triggerDownload()` from `src/utils/sharedHelpers.tsx` for client-side blob downloads.
3. **Validate File Types & Arrays**: Always sanitize user-uploaded files, check array lengths, and handle memory buffers safely to avoid browser memory leaks.
4. **Maintain Dark Mode Security UX**: Ensure all visual warning badges (e.g. `ShieldAlert`, `Lock`, `Check`) adhere to DomoDomo's dark mode visual contrast standards (`#111213` main background, `#3C6B4D` primary accent).

---

Thank you for helping keep DomoDomo private, secure, and resilient! 🛡️

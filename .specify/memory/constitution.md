# 入梦 (DreamIn) Constitution

<!--
SYNC IMPACT REPORT
==================
Version Change: Initial -> 1.0.0
Ratification Date: 2026-01-16

Modified Principles:
- Defined Project Identity
- Defined Security & Privacy
- Defined Technical Architecture
- Defined Collaboration Standards

Templates Checked:
- .specify/templates/plan-template.md: ✅ Compatible
- .specify/templates/spec-template.md: ✅ Compatible
- .specify/templates/tasks-template.md: ✅ Compatible
-->

## Core Principles

### I. Project Identity & Philosophy
“入梦 (DreamIn)” is a lightweight desktop local client. Its primary purpose is to serve as a secure connector to external AI services via user-provided API tokens. It DOES NOT perform local AI computation (inference) and MUST NOT bundle large model weights.

### II. Security & Privacy (NON-NEGOTIABLE)
Because the software handles sensitive user API tokens, strict adherence to these security rules is mandatory:
*   **Zero Cloud Storage**: User API Tokens MUST NEVER be transmitted to developer servers, telemetry services, or any third-party storage.
*   **Encrypted Storage**: API Tokens MUST be stored locally using secure system storage mechanisms (e.g., Tauri `stronghold` or System Keyring). Plaintext storage is prohibited.
*   **Transport Security**: All communication with AI service providers MUST use encrypted HTTPS.

### III. Technical Architecture
*   **Stack**: The application MUST be built using Tauri + React/Vite.
*   **Network Layer**: Network requests to AI services MUST be handled by the Rust backend (using libraries like `reqwest`) to prevent API keys from being exposed or manipulated in the browser console.
*   **Lightweight**: The application distribution MUST remain small and efficient.

### IV. Collaboration & Code Standards
*   **Accessibility**: Code structure MUST be modular and beginner-friendly.
*   **Documentation**: AI-generated code MUST include **Chinese comments** specifically explaining how sensitive user information is handled safely.
*   **Robustness**: The application MUST include comprehensive error handling for network issues (e.g., API timeouts, invalid tokens) and provide clear, user-friendly error messages in the UI.

## Governance

All code contributions must be reviewed against the Core Principles, especially the Security & Privacy mandates.
*   **Security Review**: Any change touching token storage or network transmission requires explicit verification of zero-leakage.
*   **Architecture Review**: Introduction of new heavy dependencies or local inference engines is prohibited without a Constitution Amendment.

**Version**: 1.0.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-16
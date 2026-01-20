# Research: Oneiria MVP

**Feature**: Oneiria MVP (Creative Studio, Resource Library, Assets Gallery)
**Date**: 2026-01-16
**Status**: Completed

## 1. State Management: Zustand vs Redux vs Context API

**Decision**: **Zustand**

**Rationale**:

- **Simplicity**: Oneiria has moderate state complexity (current prompt, list of resources, gallery cache). Zustand offers a minimal boilerplate API compared to Redux.
- **Performance**: Transient updates (like typing in the prompt box) can be managed easily without excessive re-renders.
- **Tauri Compat**: Works seamlessly with async actions needed for invoking Tauri commands.

**Alternatives Considered**:

- **Redux Toolkit**: Overkill for a local-first desktop app with no complex server-side state synchronization needs.
- **Context API**: Can lead to "provider hell" and unnecessary re-renders if not optimized carefully.

## 2. UI Component Library: shadcn/ui

**Decision**: **shadcn/ui (with Tailwind CSS)**

**Rationale**:

- **Aesthetics**: Provides a clean, modern, "airy" look (fitting "Oneiria" theme) out of the box.
- **Control**: Since it copies code into the project rather than being a black-box dependency, we have full control to customize it for desktop-specific needs (e.g., density, focus states).
- **Speed**: Tailwind allows rapid prototyping of layouts without context switching to CSS files.

**Alternatives Considered**:

- **Mantine**: Good but heavier runtime.
- **Material UI**: Too generic/Google-like, hard to customize to a unique brand identity.

## 3. Local Data Persistence: JSON Files vs SQLite

**Decision**: **JSON Files (`resources.json`) + Tauri Plugin Store**

**Rationale**:

- **Simplicity**: For an MVP with <1000 items, a simple JSON file is human-readable, easy to debug, and fast enough.
- **Portability**: Users can easily back up or share their `resources.json` file.
- **Overhead**: SQLite adds compilation time, binary size, and SQL complexity that isn't justified for simple key-value or small list data yet.

**Alternatives Considered**:

- **SQLite (tauri-plugin-sql)**: Better for massive datasets, but adds significant complexity for the MVP. Can migrate later if Resource Library grows to thousands of items.

## 4. Security & Network Layer

**Decision**: **Rust Backend (`reqwest`)**

**Rationale**:

- **Constitution Compliance**: Strictly enforces the rule that API tokens must not be exposed to the browser/WebView context where malicious JS could potentially access them.
- **CORS**: Bypasses browser CORS restrictions since requests originate from the Rust process.

**Alternatives Considered**:

- **Frontend `fetch`**: Rejected due to security risks (token exposure in DevTools) and potential CORS issues with some AI providers.

## 5. Image Storage Strategy

**Decision**: **Flat File System Structure**

**Rationale**:

- **Direct Access**: Users want to see their files in the OS explorer. A database blob storage would lock data inside the app.
- **Structure**: `Documents/Oneiria/Resources` (inputs) and `Documents/Oneiria/Outputs` (generations).

**Alternatives Considered**:

- **Internal App Data**: Hard for users to access.

# Agent Instructions for This Repository

You are an AI coding assistant working inside this repository.  
This project is a React + TypeScript application using Vite, React Router, shadcn/ui, Tailwind CSS, Firebase (Auth & Firestore), Zustand, react-hook-form, and zod.

Always generate code that:

- Fits naturally into the existing structure shown below.
- Respects the established patterns and naming conventions.
- Minimizes unnecessary changes and keeps diffs small and focused.

---

## Language Requirement for Chat Responses

**Always respond in Japanese when answering in chat.**
However, keep code (function names, variables, file names, TS types) in English as usual.

---

## 0. Project Structure and Where to Put Things

### 0-1. High-level structure

The project uses a **feature-based** structure with some shared/global layers:

- `src/features/*`

  - Feature-level pages, components, hooks, constants, etc.
  - Example: `features/home`, `features/createDiary`, `features/login`

- `src/components/shared/*`

  - Shared, app-specific UI pieces (header, sidebar, etc).

- `src/components/ui/*`

  - shadcn/ui components (design system layer).
  - Do NOT put feature-specific logic here.

- `src/layout/*`

  - Layout components such as `MainLayout`, `Header`, `AppSidebar`.

- `src/hooks/*`

  - Reusable, app-wide custom hooks.
  - Example: `useAuthCheck`, `useDocumentTitle`, `use-mobile`.

- `src/lib/*`

  - Utilities and service clients.
  - Example: `lib/service/diaryClient.ts`, `lib/env.ts`, `lib/utils.ts`.

- `src/firebase/firebase.ts`
  - Firebase initialization and configuration.

When you create new code:

- **Feature-specific UI** → under `src/features/<feature>/components`
- **Feature-specific hooks** → under `src/features/<feature>/hooks`
- **Shared reusable components** → under `src/components/shared`
- **Design-system-level primitives** → under `src/components/ui`
- **Service / API logic** → under `src/lib/service`
- **Firebase-related setup or thin wrappers** → under `src/firebase` or `src/lib/service`

---

## 1. React & TypeScript Coding Style

### 1-1. Components and hooks

- Use **function components** and **hooks** (no class components).
- Keep **UI and logic separated** as much as reasonable:

  - Complex logic should be moved into custom hooks (e.g. `useSomething`).
  - Components should mainly compose hooks + UI components.

- When adding logic to a screen:
  - Prefer: `features/<feature>/hooks/useXxx.ts` for state & side effects.
  - The component under `features/<feature>/components` or `features/<feature>/index.tsx` should stay as lean as possible.

### 1-2. TypeScript

- Avoid `any` as much as possible.
- `any` is only acceptable at:
  - Strict boundaries with external libraries or dynamic data where types are not available.
- Prefer:

  - `type` / `interface` definitions in `src/types/*` or feature-specific type files (e.g. `features/<feature>/types.ts`).
  - `zod` schemas together with inferred types where appropriate.

- Use `async/await` instead of `.then` / `.catch` chaining for readability.

---

## 2. State Management (Zustand & local state)

Zustand is (or will be) used both for:

- **Global / shared state** (e.g. auth info, theme, user preferences).
- **Feature-level local state** (e.g. diary filters, calendar UI state).

Guidelines:

- For **cross-feature state**, create stores under `src/stores` (or `src/hooks` if the project already uses that approach).
- For **feature-specific state**, create stores or hooks under `src/features/<feature>/hooks`.

When editing or creating Zustand stores:

- Separate **state** and **actions** clearly.
- Keep actions small and focused; avoid mixing network requests and pure state updates in the same function unless the project already does so.
- Favor readability over cleverness.

---

## 3. Firebase (Auth & Firestore) Usage

The project uses Firebase Auth and Firestore.

- Do **NOT** call `firebase/auth` or `firebase/firestore` directly from UI components if a wrapper already exists.
- Instead:
  - Use existing wrappers like `lib/service/diaryClient.ts`.
  - If new features are needed, extend or add new service modules under `src/lib/service`.
- `src/firebase/firebase.ts` is the place for initialization; do not duplicate initialization elsewhere.

When writing service functions:

- Keep them **small, composable, and testable**.
- Return typed results (no untyped `any`).
- Surface errors in a way that the UI can handle (e.g. throw domain-level errors or return `Result`-like shapes).

---

## 4. UI Guidelines (shadcn/ui, Tailwind, design)

### 4-1. Component usage

- Prefer **shadcn/ui components** under `src/components/ui` for:
  - Buttons, inputs, dialogs, dropdowns, tabs, tooltips, etc.
- Avoid creating raw HTML elements with heavy Tailwind when a shadcn component exists.

When new reusable UI parts are needed:

- Prefer building them using shadcn primitives under:
  - `src/components/shared` (app-specific, but reusable)
  - Never put feature logic inside `components/ui`.

### 4-2. Tailwind & styling rules

- **Do NOT use raw color hex codes** like `text-[#333333]`, `bg-[#f5f5f5]`.
- Always use predefined Tailwind tokens (e.g. `text-primary`, `bg-muted`, `text-muted-foreground`).
- Keep classNames readable:
  - Group layout, spacing, typography, and color utilities in a logical order.
- Avoid inline `style={{ ... }}` unless there is a strong reason.

---

## 5. Forms, Validation, and Error Handling

The project uses **react-hook-form** + **zod**:

- Define zod schemas for form validation.
- Use `@hookform/resolvers/zod` to integrate with `react-hook-form`.
- Prefer reusing shared form components from `components/ui/form.tsx` and related inputs.

### 5-1. Error handling and UX

- On failures (API errors, Firebase errors, unexpected states):
  - Show an error toast using **sonner** (e.g. `toast.error('エラーメッセージ')`).
- Avoid using `alert` or `console.log` as the primary UX; `console.error` is allowed for debugging/logging along with a toast.

- For success operations:
  - Consider using `toast.success` with concise messages.

---

## 6. Routing and Layout

- Routing is handled via **React Router**.
- Layout components like `MainLayout`, `Header`, `AppSidebar` live under `src/layout`.
- When adding new pages:
  - Place feature entry points under `src/features/<feature>/index.tsx`.
  - Wire them into the router (e.g. in `App.tsx` or router configuration), and wrap them with the appropriate layout if needed.

---

## 7. General Behavior as an Agent

When modifying existing code:

- Preserve the current style and conventions of the file.
- Keep diffs minimal: do not refactor unrelated parts unless explicitly asked.
- If a big refactor is beneficial, explain the reasoning in comments or explanation text.
  When creating new code:
- Choose file paths that match the existing feature-based structure.
- Use existing utilities (e.g. diaryClient, useAuthCheck, useDocumentTitle) when appropriate.
  If there is ambiguity, prefer:
- Clear separation of concerns.
- Hook-based logic extraction.
- Readability and maintainability over clever one-liners.

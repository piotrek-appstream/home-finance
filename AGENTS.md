# Repository Guidelines

## Project Structure & Module Organization
- Source in `src/`: entry `main.tsx`, root `App.tsx`.
- UI in `src/components/`: feature components (e.g., `earnings/`, `debts/`) and shadcn-ui primitives under `components/ui/`.
- Utilities in `src/utils/` (e.g., `money.ts`, `fx.ts`), shared helpers in `src/lib/`.
- Hooks in `src/hooks/` (e.g., `useStore.ts`).
- Static assets in `public/` and `src/assets/`.
- Path alias: use `@/` for `src/` (see `vite.config.ts`, `tsconfig.*`).

## Build, Run, and Lint
- `npm run dev` — start Vite dev server with HMR.
- `npm run build` — type-check (`tsc -b`) and build for production.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint over the repo.

Node 18+ is recommended to match Vite/TypeScript tooling.

## Coding Style & Naming Conventions
- TypeScript with strict mode; prefer explicit types for public APIs.
- Components export PascalCase; feature component files use `PascalCase.tsx`.
- Hooks start with `use` and use `camelCase` filenames (e.g., `useStore.ts`).
- shadcn-ui primitives under `components/ui/` keep lowercase filenames (e.g., `button.tsx`).
- Use 2-space indentation; keep functions small and pure in `utils/`.
- Import from `@/...` instead of relative `../../` paths where possible.

## Testing Guidelines
- No tests are present yet. If adding tests:
  - Use Vitest + React Testing Library.
  - Place files next to sources as `*.test.ts(x)`.
  - Prefer behavior-focused tests; mock browser APIs (e.g., `localStorage`) as needed.

## Commit & Pull Request Guidelines
- Commits: imperative, present tense, concise (e.g., `Add fx`, `Refactor into multiple files`).
- Group related changes; avoid noisy formatting-only commits mixed with logic.
- PRs: include a short description, screenshots for UI changes, and link related issues. Note any breaking changes and manual steps.

## Security & Configuration Tips
- Data persists in `localStorage` (`useStore.ts`); avoid storing secrets.
- FX rates are hardcoded in `src/utils/fx.ts`; update responsibly and document changes in PRs.
- Keep imports stable by using the `@` alias; update `tsconfig` and `vite.config.ts` together if paths change.


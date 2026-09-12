# Repository Guidelines

## Project Structure & Module Organization

This repository is a React 19 application built with TypeScript and Vite. Application startup lives in `src/index.tsx`, while composition, providers, routing, and theme setup belong under `src/app/`. Route-level screens live in `src/pages/`; reusable page sections such as the header, sidebar, and app shell live in `src/widgets/`; cross-cutting configuration and utilities belong in `src/shared/`. Each feature folder exposes its public API through an `index.ts` barrel. Place static files that must be served unchanged in `public/`. Generated output is written to `dist/` and must not be committed.

## Build, Test, and Development Commands

Use Node.js 22 or newer and install locked dependencies with `npm ci`.

- `npm run dev`: start the Vite development server with hot reload.
- `npm run build`: type-check the project and create a production build in `dist/`.
- `npm run preview`: serve the production build locally for final verification.
- `npm run lint`: check all source files with ESLint.
- `npm run lint:fix`: apply safe ESLint fixes.
- `npm run check`: run TypeScript validation and ESLint together.

## Coding Style & Naming Conventions

Follow the XO ESLint configuration in `eslint.config.js`: four-space indentation, semicolons, and Prettier-compatible formatting. Keep TypeScript strict enough to avoid unused locals, unused parameters, and switch fallthrough. Use PascalCase for React components and types, camelCase for functions and variables, and kebab-case for filenames and feature directories (for example, `home-page/ui/home-page.tsx`). Prefer the `@/` alias for imports across architectural layers and relative imports within a feature. Preserve explicit `.js` extensions in local import paths, as used throughout the codebase.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. For every change, run `npm run check` and `npm run build`; verify affected flows manually with `npm run dev`. If tests are introduced, keep them beside the implementation as `*.test.ts` or `*.test.tsx`, add the runner to `package.json`, and document the command here.

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit-style subjects such as `feat: added navbar and header to app shell` and `chore: added eslint tool`. Continue with an imperative summary in the form `type: description` (`feat`, `fix`, `chore`, or `refactor`) and keep each commit focused. Pull requests should explain the user-visible behavior, identify key files or routes, link related issues, and include screenshots for visual changes. Report the validation commands run and call out any known follow-up work.

## Formatting and structuring

Follow the FSD structure and separate the frontend (UI) from the business logic (model); do not mix the two. Prioritize code reusability while aiming for clean, scalable code. Avoid unnecessary spacing—such as spreading a simple return statement across multiple lines.

## Import rules

To import a file from `@/shared`, for example, simply use `import ... from '@/shared'`—do not use the full path. Make proper use of the `index.ts` files within those folders, Never import files as 'file.js'.
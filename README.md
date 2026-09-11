# React + TypeScript + Vite

## Employee screen

Open `/employees` or select **Employees** in the sidebar. The screen supports
listing employees, name and ID searches, creation, and editing. The directory
resolves branch and department IDs to their names through the API lookup endpoints.

Run the API in `../asset-control` on port 8080, then run `npm run dev` here.
Vite proxies `/api` to `http://localhost:8080`. For deployment, route `/api` to the
backend with a reverse proxy or set `VITE_API_BASE_URL` at build time to a backend
URL with CORS configured for the frontend origin (see `.env.example`).

The implementation follows Feature-Sliced Design: `shared/api` owns the HTTP
client, `entities/employee` owns employee types, requests, and list state,
`features/employee-form` owns creation/editing, and `pages/employees-page` composes
the directory screen. Slices expose their public API through `index.ts`.

Validate with `npm run check` and `npm run build`.

## Machine screen

Open `/machines` or select **Machines** in the sidebar. The inventory supports
listing, machine and employee ID searches, pagination, creation, and editing.
Machine code follows the same FSD boundaries as employees: entity data access and
state, a form feature with isolated validation, and a route-level page composition.

Run focused tests with `npm test`.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

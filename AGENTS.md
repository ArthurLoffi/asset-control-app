# Repository Guidelines

## Framework and Tools

This is a React 19 application using TypeScript 6, Vite 8, and React Router 7.
Use Node.js 22 or newer and install locked dependencies with `npm ci`.
Mantine 9 provides components, layout, and theme support; Tabler supplies React
icons. Existing sidebar styles use styled-components. Use the installed UI stack
and shared theme instead of introducing another styling or component framework.
Page-specific hover/motion styles may live in a colocated CSS Module
(`ui/*.module.css`) using Mantine CSS variables; respect
`prefers-reduced-motion` and keep visible `:focus-visible` outlines. The theme
defines the cool neutral `dark` scale (dimmed text keeps 4.5:1 contrast on cards, panels, and canvas), `md`
card radius, dimmed table headers, and a deeper `AppShell.Main` canvas.
ESLint with XO handles source linting and Prettier-compatible formatting; Vitest
runs colocated model and API tests.

## Project Structure and FSD Boundaries

Application startup lives in `src/index.tsx`. Follow Feature-Sliced Design, with
dependencies flowing downward: `app → pages → widgets → features → entities → shared`.

- `app/`: application composition, providers, global styles, theme, and routing.
- `pages/<page>/`: route-level composition. Keep search, pagination, orchestration,
  and derived state in `model/`, with components in `ui/`.
- `widgets/<widget>/`: reusable page sections, including the header, sidebar,
  app shell, and employee phone overview.
- `features/<feature>/`: user actions such as creation/editing forms. Keep
  validation, payload conversion, submission state, and requests in `model/`;
  keep markup and event wiring in `ui/`.
- `entities/<entity>/`: domain types and data hooks in `model/`, HTTP operations
  in `api/`, and reusable domain presentation in `ui/` when needed.
- `shared/`: domain-independent HTTP infrastructure, configuration, and utilities.

Each slice exposes its public API through `index.ts`; layer barrels expose
reusable exports. Avoid importing another slice's implementation or introducing
same-layer dependencies. Compose related entities in a higher layer. Do not import
a layer's own barrel from inside a slice, since that can create circular imports.
Place unchanged static assets in `public/`. Generated `dist/` output must not be
committed. Prefer reusable code, but only extract abstractions with a clear use.

## Imports and Formatting

Use extensionless local imports; never append `.js` to TypeScript source imports.
Use public layer exports for cross-layer imports, for example
`import {apiRequest} from '@/shared'`. Use relative imports inside a slice. Lazy
routes may import a page's public slice entry, such as `@/pages/printers-page`,
to preserve route splitting. Do not import deep implementation paths across slices.

Follow `eslint.config.js`: four-space indentation, semicolons, and
Prettier-compatible formatting. Use PascalCase for components/types, camelCase
for functions/variables, and kebab-case for filenames and slice directories.
Keep simple expressions concise where the formatter permits. Preserve backend
JSON field names even when they differ from frontend naming conventions.
TypeScript checks unused locals/parameters and switch fallthrough.

## API Integration and Printer Contract

The sibling `../asset-control` Go/Gin API uses MongoDB. Verify DTOs, validation,
controllers, and routes there before implementing frontend contracts.
`shared/api` owns `apiRequest` and `ApiError`. The API returns records directly,
lists as `{content, paging}`, and errors as `{message, code, logs}`; `ApiError`
carries `message`, `status`, and the stable `code` (branch on the code, e.g.
`AUTH_004` for an expired session). `listAll` reads every page (`page_size=100`)
because screens sort and paginate locally; `findResource` turns an ID 404 into
an empty result; `listEquipment` maps machine/monitor/phone searches to filters;
`createResourceWriter` sends `POST`, `PUT /{id}`, and `DELETE /{id}`. Hooks cancel stale reads with
`AbortController`. Vite proxies `/api` to `http://localhost:8080`; production needs
a reverse proxy or `VITE_API_BASE_URL` pointing at an API with suitable CORS.
Never access MongoDB directly from browser code.

The `/printers` route is lazy-loaded and linked from the sidebar. It supports
listing, ID search, client-side pagination, refreshing, and creation/editing:

- `GET /api/printers`: paginated list; `GET /api/printers/<id>`: single printer.
- `POST /api/printers`: create; `PUT /api/printers/<id>`: update.
- Inputs: required positive integer `asset_number`, `branch_id`, `departments_id`;
  required `model` (at most 100 characters); required IPv4/IPv6 `ip`; nullable
  `machine_condition` (`Novo`, `Bom`, or `Ruim`). Keep the plural `departments_id`.
- Responses additionally contain `id` and `created_at`. Printers are assigned to
  branches/departments, not employees; they have no situation or serial field.
- Location names/options come from `/api/branches` and `/api/departments`. Preserve existing IDs when a lookup is unavailable.
- Browser numeric inputs must be safe integers to avoid precision loss.

Printer code lives in `entities/printer`, `features/printer-form`, and
`pages/printers-page`. UI components delegate business logic to model hooks.

## Email Contract and Shared Resources

Organization reference data reads `/api/branches` and `/api/departments` once
each (all pages), cached in memory until a full page reload. Reuse
the sorted lists and ID maps through `useOrganizations`; concurrent consumers
share requests and failed lists remain retryable. Never request names per ID.
Employee APIs return raw records; compose organization names in the
`employee-directory` widget, preserving unresolved IDs in display labels.

The lazy-loaded `/emails` page lists all emails by default, with client-side
pagination (10 per page), user/ID searches, creation, and editing. Use
`GET /api/emails`, `GET /api/emails?user=...`, `GET /api/emails/<id>`,
`POST /api/emails`, and `PUT /api/emails/<id>`. Clearing or submitting an empty
search reloads all emails and resets pagination.
IDs range from 1 through 2147483647. User search is a literal case-insensitive
substring filter that returns every match. Inputs require `user`,
`email`, and `password_hash`; preserve passwords exactly, including whitespace.
The server generates `id` and `created_at`, and returns the saved record. After
save, select that ID, including when editing changes the original user search.

Use `shared` exports for record/input/search types, write operations,
single-record lookups, cancellable query state, submission state, ID/date helpers,
and page headers/result states. Keep resource loaders stable at module scope;
an undefined query means idle and must not fetch. Domain validation and payload
conversion belong in feature models. Email and printer flows demonstrate reuse.

List tables sort the complete filtered result set before pagination. Sortable
headers toggle ascending/descending order, expose the active direction visually
and through `aria-sort`, and keep missing values at the end in either direction.
Machine and monitor search include a no-input unassigned filter backed by
`GET /api/<resource>?unassigned=true`; do not load the full list for this filter.
Employee-name searches resolve matching employee IDs (accent-insensitive, in the
browser) and then make one `?employee_id=<id>&employee_id=<id>` request.

## Phone form

Model, IMEI, and serial number are optional for `Só chip` and `Sem chip`, but
required for `Celular` or unspecified equipment. Use the same condition for
native form validation and payload validation, and preserve entered values when
equipment changes. Both backend POST and PUT must accept empty identification
strings for these two equipment options; do not insert placeholder values.

## Dashboard

The lazy-loaded home page uses only API records and the shared Mantine theme.
Keep loading and aggregation in its model, reuse entity APIs and shared query/
result components, and never substitute fixtures or partial totals after errors.
Use bulk organization lookups and employee records without per-employee lookups.
Monitor and phone totals count physical devices only: a monitor needs a model
or serial number and a phone needs a model or IMEI; SIM-only and no-monitor
entries are excluded from every total, chart, and coverage figure. Printers
have no status, and `created_at` is not an assignment or update timestamp.
Preserve raw statuses, missing values, and unresolved location IDs in summaries.
Use separate branch and department labels when dashboard location data is missing.
Summary cards use medium labels and 32px totals for readability, retaining the
shared theme and responsive grid. Each card is a single link to its list, shows
the sidebar icon, keeps totals aligned at the bottom, and adds a secondary
count (employees with equipment, unassigned equipment, branches with printers).
Metrics carry stable keys, not English labels. The header shows when the data
was loaded. Status colors are fixed per raw status and the legend always shows
text and counts, so color is never the only cue.
The final dashboard table uses `GET /api/changes?direction=DESC&page_size=10`
for the ten latest audit updates. Show changed field values and the editor name; use the user ID only when
the editor can no longer be resolved. Keep audit details separate from inventory
totals, and never show secret fields.

## Development and Validation Commands

- `npm run dev`: start Vite with hot reload; run the sibling API on port 8080.
- `npm run build`: type-check both TypeScript projects and build `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint` / `npm run lint:fix`: check source / apply safe fixes.
- `npm run check`: run project-reference TypeScript validation and ESLint.
- `npm test`: run Vitest once; tests live beside implementation as `*.test.ts`
  or `*.test.tsx`. No coverage threshold is configured.

For changes, run `npm run check`, relevant tests, and `npm run build`. Manually
verify affected flows with `npm run dev`, including loading/error/empty states,
search reset, pagination, multi-match name searches, form validation, save
failures, and successful editing.
Use mocked API fixtures for UI checks when no backend is available, and report
that limitation. Never mutate real inventory just to validate the UI.

## Commits and Pull Requests

Include an update to `AGENTS.md` in every commit.

Use short Conventional Commit subjects with scope: `type(scope): imperative description`
(`feat`, `fix`, `chore`, or `refactor`). Never add an AI co-author trailer. Keep commits focused. PRs should describe
user-visible behavior and routes, link related issues, include screenshots for
visual changes, report validation, and identify remaining limitations.

## Type the functions
Type all necessary functions such as forms that return `ReactElement`, among others and never overlook them.

## Authentication

The sibling API mounts /api/auth/login (POST), /api/auth/logout (POST), and
/api/auth/session (GET). Session responses contain id, name, and expires_at
(Unix seconds). JWTs remain in HttpOnly cookies and never enter browser storage.
shared/api sends credentials and X-CSRF-Protection: 1, and broadcasts inventory
401 responses. Session state and restoration live in entities/session; login
and logout actions live in features; login composition lives in pages/login-page;
app/providers/routes owns the protected layout. Do not fetch inventory before
session restoration succeeds. On expiry, unmount inventory and redirect to login;
on unavailable session checks, show retry. Logout errors retain the active UI.
Keep frontend/API on one origin or same site; configure exact allowed origins
and secure cookies in production. Vite continues proxying all /api calls to 8080.

## Deactivation

Employee forms enter multiple email addresses and phone numbers, and machine,
monitor, and phone forms enter multiple employee IDs, one per line. Send the
plural arrays while retaining the first value in the legacy singular fields.
Render every saved value, including legacy records that contain only a singular
field. Shared phone records count for each assigned employee in coverage views.

Employees, machines, phones, monitors, printers, and emails support deactivation.
DELETE /api/<resource>/<id> sets the database timestamp once and
preserves the record. Missing/null deactivated_at means active (including legacy
imports). All ordinary lists, searches, assignment lookups, and updates use the
active scope. Deactivating an employee atomically unassigns active machines,
monitors, and phones; it does not deactivate the equipment.
GET /api/<resource>/inactive returns only deactivation IDs and timestamps,
using the same `{content, paging}` listing contract. Keep history requests
separate from active inventory and dashboard reads. Never reset a timestamp on
retry or let ordinary writes change lifecycle metadata.
Edit forms use shared DeactivationFields and useRecordDeactivation. Selecting
deactivation disables/fades the other fields while preserving unsaved values;
submission bypasses normal field validation and sends only the deactivation
request. Success closes the form and reloads active results, including resetting
email searches instead of selecting the now-inactive ID. Errors retain the form.
Creation forms do not offer deactivation.

## Internationalization

Use the shared i18next instance and pt-BR/en catalogs for all interface text,
including login, validation, notices, empty states, and accessibility labels.
Translate application messages at display time so an active language change also
updates existing errors. Preserve user-entered data, unknown API details, and raw
backend enum values; translate known enum labels only for presentation. The globe
switcher is a feature composed by the header and login page. Keep long translated
labels wrapping and header controls accessible on small screens. Translation tests
check catalog parity, literal key coverage, and language switching across routes.

## Company logo

The header reads the optional `VITE_COMPANY_LOGO` build-time variable. It may
point to an external URL, a public asset path, or a file in
`src/widgets/header/assets`; missing or unloadable logos remain hidden. The
logo is visible from the Mantine `sm` breakpoint upward and is hidden on phones.

## Design review agent

`.claude/agents/design-reviewer.md` defines a read-only `design-reviewer`
subagent that validates the latest state of components and pages against this
document (theme, FSD boundaries, shared result/table/form components, i18n
parity, accessibility, responsiveness) and runs `npm run check`, `npm test`,
and `npm run build`. The Stop hook in `.claude/settings.json` runs
`.claude/hooks/design-review.sh` at the end of each Claude turn; when `src/`,
`public/`, or `index.html` changed since the last review, it asks Claude to
invoke the agent once per distinct working-tree state. The agent reports
findings and never edits files; the main agent applies fixes. Review state is
kept in the gitignored `.claude/.design-review-state`.

## Login background

The login page background image (`VITE_LOGIN_BACKGROUND`, default
`/login-hero.jpg`) is an absolutely positioned layer covering the whole
`.login-page`, on desktop and phones. The form column is transparent over it,
and the card keeps a near-opaque background so text contrast never depends on
the image. From the `sm` breakpoint up, a translated intro (headline and three
features) sits over a darkened area of the image, after the form in DOM order;
phones show only the card. The card row holds the brand mark and language
switcher; inputs show icons and the password field warns when Caps Lock is on.
Keep these styles scoped to `.login-page*` and `.login-form*` selectors.

## Not found page

Unknown paths inside the protected layout render the lazy-loaded
`pages/not-found-page` (`path="*"`), so unauthenticated visitors still go to
login first. It uses the shared Mantine theme, translated `notFound.*` keys, and
a link back to `ROUTES.HOME`.

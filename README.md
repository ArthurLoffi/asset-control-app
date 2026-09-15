# React + TypeScript + Vite

## Email screen

Open `/emails` or select **Emails** in the sidebar. The page loads all email
accounts by default through `GET /api/emails`, showing 10 records per page.
Search by user or positive int32 ID, view/reveal the stored password, refresh,
and create or edit accounts. User search matches a literal substring without
case sensitivity and returns the lowest-ID match. Clearing a search or submitting
an empty search reloads the full list and resets pagination.

The form sends `user`, `email`, and `password_hash` to `POST /api/emails` or
`PUT /api/emails?id=<id>`. Passwords are preserved exactly, including whitespace.
After saving, the page searches the returned ID so renamed and newly created
accounts stay accessible. Run the updated sibling backend so its email routes
and startup ID counter are available.

Reusable infrastructure lives in `shared`: typed record/input/search models,
create/update requests, single-record lookup normalization, cancellable query
state, form submission, date/ID helpers, page headers, and loading/error/empty
states. Emails and printers share page, query, and submission infrastructure;
all six entity APIs share write operations and record models. Domain-specific
validation, payloads, search rules, and presentation stay in their FSD slices.

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
listing, machine ID and employee name searches, pagination, creation, and editing.
Machine code follows the same FSD boundaries as employees: entity data access and
state, a form feature with isolated validation, and a route-level page composition.

Run focused tests with `npm test`.

## Monitor and phone screens

Open `/monitors` or `/phones`, or select **Monitors** or **Phones** in the sidebar.
Both inventories support listing, pagination, ID search, creation, and editing.
Employee name is the default search on machines, monitors, and phones; matching
supports partial names and ignores case, accents, and surrounding spaces. Clear
restores the full inventory. All equipment for matching employees is included.

The phone form supports model, IMEI, serial number, equipment category, SIM
card status, situation, and optional employee assignment. Its API payload preserves
the backend's `equipament` field name. Phone slices follow the same entity, form,
and page boundaries as monitors and machines.

The Phones screen opens on **Employee overview**. Summary cards and a searchable
employee table show **Phone + SIM**, **SIM only**, **No SIM**, and **Not recorded**.
Each employee is counted once across all their assigned records; unassigned
inventory is excluded. Missing or incomplete assignments remain **Not recorded**.
Select a category or search by name, then use **View equipment** to open that
employee's inventory. The **Phone inventory** tab retains ID/name search and editing.

Equipment choices use the API's `Celular`, `Só chip`, and `Sem chip` values.
A phone plus a confirmed SIM (including separate records) counts as **Phone + SIM**;
explicit SIM-only records count as **SIM only**. **No SIM** requires recorded
absence of a company SIM across all assignments. Unknown or conflicting details
are kept out of the no-SIM count.

## Printer screen

Open `/printers` or select **Printers** in the sidebar. The inventory supports
listing, ID search, pagination, refresh, creation, and editing. Rows show asset
number, model, IPv4/IPv6 address, branch, department, condition, and creation date.
The form uses branch and department lookups and preserves the API's plural
`departments_id` field. Condition is optional (`Novo`, `Bom`, or `Ruim`).

The implementation separates entity API/state, form validation/submission, and
page orchestration from UI in dedicated FSD slices. See `AGENTS.md` for architecture,
API contracts, and validation commands.

## Authentication

Run the sibling `asset-control` API with its auth configuration and existing
bcrypt users. It mounts the sibling `asset-control-auth` module on port 8080;
you do not need to start a separate auth process. Vite proxies login, session,
logout, and inventory requests through `/api`.

The app restores the server session before mounting inventory. `/login` supports
credential errors and redirects back to the requested inventory page. The header
shows the signed-in username and a working Sign out action; failed logout requests
show an error, while successful logout returns to login. Expired sessions and
inventory 401 responses return users to login with an explanation.

Tokens stay in HttpOnly cookies. The shared API client always includes credentials
and the CSRF protection header. Do not put secrets in `VITE_*` variables.
For production, use HTTPS and a same-origin reverse proxy, or a same-site API URL
with exact credentialed CORS origins configured in the backend. Arbitrary cross-site
API URLs are incompatible with the server's SameSite=Lax cookie.

Auth model/API and routed UI tests use mocked responses; run `npm test`,
`npm run check`, and `npm run build` before delivery.

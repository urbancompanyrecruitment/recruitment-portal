# recruitment-portal

Front end for the partner recruitment & onboarding product (PRD: "Recruitment and Onboarding Portal", Onboarding SG Job Portal). A standalone web service, deployed on its own URL, with three role-based portals sharing a domain model:

| Portal | Route | Who | Login |
|---|---|---|---|
| Partner registration | `/partner` | Cleaners signing up | None (public form) |
| Recruiter | `/recruiter` | Approved external recruiters | Mocked (demo accounts) until the backend defines recruiter credentials |
| Business | `/business` | UC business team | UC Google sign-in through `internal-dashboards`, like the ops/configs dashboards |

The trainer flow (L1–L3 assessment, verification) is built separately and is not part of this app.

## Status

UI complete on mock data. Everything except business-team login is served from `src/mocks` and persisted in the browser's `localStorage`, so an action in one portal shows up in the others (partner signs up → business sees the signup → recruiter reserves a verified candidate → business assigns a hub). No WhatsApp/Hireflix call is made. The backend is a new service, still being designed; `src/api/*` is the seam where its endpoints plug in.

## Run

```bash
nvm use            # Node 20+
npm ci
npm run dev        # http://localhost:9009
npm test           # vitest
npm run build      # typecheck + production build into dist/
npm start          # serve dist/ the way the Docker image does (port 3005)
```

- Business portal: click **Sign in with Google** with your `urbancompany.com` / `urbanclap.com` account. Development mode talks to `dev-ops.urbanclap.com`.
- Recruiter portal: `recruiter.a` or `recruiter.b`, password `Demo123!` (mock).
- `/` lists the portals and has a "Reset sample data" button.

Port 9009 is the port the ops dashboard uses locally, so it is already an authorized origin on the UC Google client; other ports need adding in the Google Cloud console.

## Stack

Vite · React 19 · TypeScript · antd 6 (themed to the PRD mockups) · React Router 7 · TanStack Query 5 · dayjs · Vitest + Testing Library · express (production static server only).

## Structure

```
environment/      per-mode config (development / staging / production): sherlock + gateway URLs, Google client id
server.js         express static server used by the Docker image (serves dist/, SPA fallback, /healthcheck)
src/
  config/         picks environment/<mode>.json from import.meta.env.MODE
  domain/         pure business rules + shared types, no React or I/O
  api/            the only layer the UI calls: one file per resource
                  auth.ts (real Google login + mocked recruiter login), http.ts (bearer token, envelope, 401)
                  everything else is backed by mocks/ today
  mocks/          seed data + localStorage "database" (delete when the backend lands)
  shared/         auth context + RequireRole guard, PortalShell, LoginShell, GoogleSignIn, tags/tiles, CSV export
  portals/        partner/  recruiter/  business/
  theme/          antd theme tokens + global CSS
  test/           setup, render helper, fetch stub, session fixtures
```

Each folder keeps its types in `interface.ts` and its constants in `constant.ts`.

## Authentication

Business-team login follows the pattern every UC dashboard uses (`dashboard-operations`, `dashboard-configs`):

1. Google Identity Services renders the button (`GoogleSignIn`) with the UC client id from `environment/*.json` and returns an **ID token**.
2. `signInWithGoogle` calls `PUT {sherlockServerUrl}/auth/google/login` with `{ email, access_token: <id token> }`. `internal-dashboards` verifies it with Google, only accepts `urbanclap.com` / `urbancompany.com` accounts, upserts the dashboard user and returns a JWT.
3. The JWT is stored in the `token` cookie (one year, same cookie name as the other dashboards). `api/http.ts` sends it as `Authorization: Bearer …` on every call and turns a 401 into a sign-out.
4. `GET {sherlockApiUrl}user/me` returns the user's name, email and `team` (access names from `access-control-service`). `RequireRole` restores the session from the cookie on reload.
5. `REQUIRED_BUSINESS_ACCESSES` in `src/shared/auth/constant.ts` is empty, so any UC account can enter for now. Once the access name for this dashboard exists in access-control, add it there and users without it get the "no access" screen.

The new backend should accept the same bearer token for business-portal calls (verify it the way `internal-dashboards` does, or route through the dashboard gateway, which forwards it).

**Recruiters** are external users: the Google flow rejects non-UC domains and the email/password strategy in `internal-dashboards` is disabled outside development. Their credential system belongs to the new backend; until then `signInRecruiter` is a mock against the seed data.

**Partners** are the public; the registration form needs no login.

## Hosting

The live React dashboards are built into static files, served by a small express server inside a Docker image, registered as a platform service (for example `dashboard-ops-web-service`, discovery port 3003) and deployed by `platform-orchestration-service` to ECS behind a load balancer and DNS name. This repo follows that shape:

- `Dockerfile`: multi-stage, `npm run build -- --mode $BUILD_MODE` then `node server.js` on port 3005 (`PORT` overrides). The runtime stage installs only `dependencies` (express); UI libraries are `devDependencies` because Vite bundles them.
- `.gitlab-ci.yml`: platform template plus install/typecheck/test/build on merge requests and master.
- `environment/<mode>.json`: which `internal-dashboards` and gateway the build talks to.

To get the URL live, the platform team needs to: register a service id (for example `recruitment-portal-web-service`) with the `initiate-service` templates in `platform-orchestration-service` and a Jenkins job; create the load balancer, DNS record and TLS certificate and add that origin to the UC Google OAuth client; and mirror `node:20` into the internal ECR registry (CI images there are pinned at Node 14; Vite 8 needs Node 20+).

If the public partner form should not live on the internal dashboard domain, split it into a second Vite entry later; it is already its own lazy chunk under `src/portals/partner`.

## Plugging in the backend

Components never touch `mocks/`. They call `src/api/*` (directly or through TanStack Query), and those functions currently wrap `mockQuery` / `mockMutation`. To go live:

1. Replace each `src/api/*.ts` function body with a `request(...)` call from `api/http.ts` (keep the signature).
2. Move the rules in `src/domain/` that must be authoritative (reservation exclusivity and expiry, slot capacity) to the backend. Keep the client copies only for UI hints.
3. Delete `src/mocks/` and the recruiter demo accounts.

Things the backend must own: recruiter access to contact details and reservation exclusivity (including direct links, rate limits and access logging), reservation expiry (a scheduled job, not the client's clock), and the Hireflix / WhatsApp invite on registration.

## Open questions from the PRD

- Recruiter credentials for external users (see Authentication).
- Reservation window length and extension rules (mock uses 48h).
- Hub allocation logic (mock: business sets it manually).
- Aggregator quota rules (mock: each assignment uses one place).
- Final consent wording (legal).
- Whether the public partner form and the staff portals ship on one domain.

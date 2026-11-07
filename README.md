# recruitment-portal

Front end for the partner recruitment & onboarding product (PRD: "Recruitment and Onboarding Portal", Onboarding SG Job Portal; tech design on Confluence: "Partner Recruitment Portal — Backend Tech Design"). A standalone web app with three role-based areas, all served by `partner-recruitment-service` (sibling repo) through `/api`:

| Area | Route | Who | Login |
|---|---|---|---|
| Partner | `/partner` | Cleaners signing up | Primary mobile number + password chosen at sign-up (first come, first served; the number is not verified). Logged-in partners see their status |
| Recruiter | `/recruiter` | Approved external recruiters | Email + password; accounts are created by the business team, who share a temporary password |
| Business (admin) | `/business` | UC business team | Google sign-in; the service verifies the ID token and allows `urbancompany.com` / `urbanclap.com` accounts |

The trainer flow is built separately and is not part of this app.

## The flow this UI implements

1. **Sign-up.** Partner enters a **primary mobile number** (unique key) and a **password**, and optionally a **Singapore mobile number** (if the primary number is already Singapore, a checkbox copies it). The first sign-up with a number owns it. They pick an **interview city** and an **hourly slot** (both come from the service) and see a thank-you screen.
2. **Slots are generated, not published.** The service builds one-hour slots from 08:00 to 18:00 (Asia/Singapore) for today and the next two days in every interview city, keeps only future start times, and subtracts bookings from a fixed capacity.
3. **Singapore number → lead.** Whenever a partner first gets a Singapore number (at sign-up or added later by an admin), the service creates a lead in `provider-onboarding-service` (stubbed locally); the UI shows it as `candidate.onboarding`.
4. **Export.** Admins download signed-up partners as CSV from the service (`name, location, primary_mobile`), audited server-side.
5. **Verified upload.** Admins upload a CSV of verified partners (`primary_mobile` column); the UI parses it and posts the numbers. Only partners with a valid Singapore number on file are verified and approved; every other row is listed with a reason and available as a fail CSV.
6. **Lock.** A recruiter locks a verified partner; the service returns the lock (`lockedAt`, `lockReleaseAt`, `state`) and the phone numbers. A lock stops counting the moment its release time passes.
7. **Placement.** The lock owner records the employer name and start date; the partner becomes *placed*. The business team can later mark them *joined* and issue temporary passwords.

## Run

```bash
nvm use            # Node 20+
npm ci
npm run dev        # http://localhost:9009, proxies /api to http://localhost:3006
npm test           # vitest (fetch is stubbed; no backend needed)
npm run build      # typecheck + production build into dist/
npm start          # serve dist/ the way the Docker image does (port 3005)
```

Start `partner-recruitment-service` first (`npm run dev` there, after `npm run migrate` and `npm run seed`). Seeded sign-ins: partner `+65 9000 0001` / `Demo123!`; recruiter `alex.morgan@brightpath.sg` / `Demo123!`; business: your UC Google account.

Port 9009 is already an authorized origin on the UC Google client; other ports need adding in the Google Cloud console. In production the app and the service must share one origin (route `/api/*` to the service at the load balancer) so the httpOnly session cookies work.

## Stack

Vite · React 19 · TypeScript · antd 6 (themed to the PRD mockups) · React Router 7 · TanStack Query 5 · dayjs · Vitest + Testing Library · express (production static server only).

## Structure

```
environment/      per-mode config (development / staging / production): apiBaseUrl, Google client id
server.js         express static server used by the Docker image (serves dist/, SPA fallback, /healthcheck)
src/
  config/         picks environment/<mode>.json from import.meta.env.MODE
  domain/         pure business rules + shared types, no React or I/O
                  phone.ts (Singapore number rules), reservation.ts (lock state), funnel.ts, slot.ts (slot id parsing)
  api/            the only layer the UI calls: one file per resource, all over fetch with same-origin cookies
                  http.ts (error envelope → user-facing messages), auth.ts (login / me / logout per role)
                  candidates.ts (sign-up, status, admin partner actions, verified import), reservations.ts (locks, placements)
                  slots.ts (cities, bookable slots, occupancy), people.ts (recruiters)
  shared/         auth context + RequireRole guard (restores sessions from the cookie), PortalShell, LoginShell, GoogleSignIn, CSV helpers
  portals/        partner/  recruiter/  business/
  theme/          antd theme tokens + global CSS
  test/           setup, render helper, route-based fetch stub, fixtures, session fixtures
```

Each folder keeps its types in `interface.ts` and its constants in `constant.ts`.

## Authentication

- **Partner / recruiter.** `POST /api/<role>/auth/login` sets an httpOnly session cookie; the UI keeps the display name in `sessionStorage` and `RequireRole` calls `GET /api/<role>/auth/me` to restore a session after a reload. Sign-out calls the logout endpoint and clears the stored session.
- **Business.** Google Identity Services renders the button (`GoogleSignIn`) and returns an ID token; `POST /api/admin/auth/google` verifies it in the service (audience = the client id in `environment/*.json`, allowed email domains) and sets `admin_session`.
- `REQUIRED_BUSINESS_ACCESSES` in `src/shared/auth/constant.ts` is empty, so any allowed UC account can enter for now.

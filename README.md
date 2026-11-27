# recruitment-portal

Front end for the partner recruitment & onboarding product (PRD: "Recruitment and Onboarding Portal", Onboarding SG Job Portal; tech design on Confluence: "Partner Recruitment Portal — Backend Tech Design"). A standalone web app with three role-based areas, all served by `partner-recruitment-service` (sibling repo) through `/api`. The site opens on a home page with two choices, the partner dashboard and the recruiter dashboard. The admin area is not linked from it; its URL is shared with the admin team directly.

| Area | Route | Who | Login |
|---|---|---|---|
| Home | `/` | Everyone | Two cards: partner dashboard, recruiter dashboard |
| Candidate | `/candidate` (new registration or sign in), `/candidate/register`, `/candidate/login`, `/candidate/status`; old `/partner/...` links redirect | Cleaners signing up | Primary mobile number + last name, like an airline booking lookup; no email and no password. The primary mobile is unique (first come, first served, not verified) |
| Recruiter | `/recruiter` (create an account or sign in), `/recruiter/signup`, `/recruiter/login`, then `/recruiter/dashboard` and the other feature pages | External recruiters | Email + password. A recruiter who signed up sees only a "waiting for approval" message until an admin approves the account |
| Admin | `/admin` | UC admin team | Email + password of an admin account held by the service. Super admins also manage admin accounts |

The old partner links `/login`, `/register` and `/status` redirect to `/partner/...`. The trainer flow is built separately and is not part of this app.

## The flow this UI implements

1. **Sign-up.** Partner enters a **first name**, a **last name** (used to sign in), a **primary mobile number** (unique; used to sign in and as the key for verification) and optionally a **Singapore mobile number** (if the primary number is already Singapore, a checkbox copies it). An approved recruiter can fill the same form for a partner under "Register a partner" (`src/shared/registration`, one form for both). They choose their **current country** (Singapore, Myanmar or Others) and a **nationality** from the full country list.
2. **Interview city and slot.** The interview cities offered are those of the chosen country; Others lists every city. The hourly slots of the chosen city come from the service's `interview_slots` table for today and the next two days, future start times only, with the seats left.
3. **Sign-up sheet.** The service appends every sign-up to a Google Sheet; nothing to do in the UI.
4. **Singapore number.** A candidate gives it at sign-up or an admin adds it later. Only candidates with one go into the ops upload file.
5. **Export.** Admins download signed-up partners as CSV from the service (`name, location, primary_mobile`), audited server-side.
   A second download, the **ops dashboard lead upload** file, is the one admins upload at `ops.urbanclap.com/lead/bulkAdd` to create the Urban Company leads: `name, phone, city_key, category_key, source_type, experiment_name`, only partners with a valid Singapore number (as 8 digits, without `+65`), partners who failed verification left out. No Urban Company ids come back to the portal; the two systems match on the Singapore mobile number.
6. **Verified upload.** Admins upload a CSV with the columns `primary_mobile` and `verified`. `verified = true` marks the partner UC Verified (a Singapore number is not required); `verified = false` marks them **verification failed**, which is final: their status page says the application is closed and they never reach recruiters. Rows that could not be applied are listed with a reason and available as a fail CSV.
7. **Hub upload.** Admins upload a CSV with the columns `primary_mobile` and `hub_name`; it sets the hub of each partner, shown in the admin table and on the partner's status page.
   The admin **Candidates** tab (`/admin/candidates`) holds only the filters, the search and the paginated candidate list (add a Singapore number, tag to a recruiter, mark joined). Each CSV download and upload, and the create-recruiter and create-admin forms, has its own page linked from the bottom of the sidebar (`ADMIN_TOOLS` / `ADMIN_TOOL_GROUPS` in `src/portals/admin/constant.ts`); every CSV page states its format and conditions (`CSV_FILES`). The admin **Overview** tab only shows how the flow is doing: totals, funnel, signups by city, channel funnel and upcoming slots.
8. **Recruiter accounts.** A recruiter creates an account (name, organisation, email, password) and waits; admins see the request under "Approval requests" and approve or reject it. Admins can also create an approved recruiter directly, suspend a recruiter and bring them back. The recruiters table shows each recruiter's **locks acquired** and **placements submitted**.
9. **Lock.** An approved recruiter locks a verified partner for three days; the service returns the lock (`lockedAt`, `lockReleaseAt`, `state`, `origin`) and the phone numbers. A lock stops counting the moment its release time passes. An admin can tag a verified, unlocked partner to a recruiter (same three days). A partner the recruiter registered is locked to them with no expiry (`lockReleaseAt` absent) as soon as the partner is UC Verified.
10. **Placement.** The recruiter holding the active lock chooses one of their aggregators (added by admins on "Recruiter access"; none by default, and no placement can be saved without one) and the start date; the partner becomes *placed* and the placement is then read-only for the recruiter. An admin can later mark them *joined*.
11. **Passwords.** Recruiters and admins change their own password after signing in, or use "Forgot password?" on their sign-in page to get a one-time reset link by email (`/<recruiter|admin>/forgot-password`, `/<recruiter|admin>/reset-password?token=...`). Admins reset a recruiter's password, and super admins an admin's, and get a temporary password to share. Candidates have no password.
12. **Reschedule.** A partner who is still *registered* (not yet verified) can pick a new interview city and slot from the status page, also after the booked slot has passed.
13. **Notifications.** A signed-in partner has a bell at the top left of the header. It lists when they became UC Verified and when a recruiter confirmed their placement (aggregator and joining date), with an unread count; closing the list marks them read.
14. **Account status.** A pending or suspended recruiter can sign in and sees a page that states the status; no recruiter feature opens. A rejected recruiter cannot sign in.
15. **Lists.** Every list has a search box, filters where they help (status, city, channel, Singapore number, recruiter, lock state and origin, role, nationality and experience on available profiles) and pagination.

## Run

```bash
nvm use            # Node 20+
npm ci
npm run dev        # http://localhost:9009, proxies /api to http://localhost:3006
npm test           # vitest (fetch is stubbed; no backend needed)
npm run build      # typecheck + production build into dist/
npm start          # serve dist/ the way the Docker image does (port 3005)
```

Start `partner-recruitment-service` first (`npm run dev` there, after `npm run migrate` and `npm run seed`). Seeded sign-ins are listed in that repo's README (partner by primary mobile and last name, recruiter and admin by email with one shared demo password). The login pages show no seeded accounts or other development hints in any mode, so use that README for local sign-ins.

In production the app and the service must share one origin (route `/api/*` to the service at the load balancer) so the httpOnly session cookies work.

### Deploying on Vercel

`vercel.json` builds the app as a Vite project (so `server.js` and express are not used there), serves `dist/`, sends unknown paths to `index.html`, and forwards `/api/*` to the `partner-recruitment-service` Vercel project so both share the portal's address. If that project gets a different address than `https://partner-recruitment-service.vercel.app`, change the `destination` of the first rewrite. No environment variables are needed.

## Stack

Vite · React 19 · TypeScript · antd 6 (themed to the PRD mockups) · React Router 7 · TanStack Query 5 · dayjs · Vitest + Testing Library · express (production static server only).

## Structure

```
environment/      per-mode config (development / staging / production): apiBaseUrl
public/terms/     Terms and Conditions PDFs linked from partner and recruiter sign-up (placeholders until the final documents arrive; keep the file names)
server.js         express static server used by the Docker image (serves dist/, SPA fallback, /healthcheck)
vercel.json       Vercel build, /api forwarding to the service, SPA fallback and cache headers
src/
  app/            routes: home, the three portals, redirects for the old partner links
  config/         picks environment/<mode>.json from import.meta.env.MODE
  domain/         pure business rules + shared types, no React or I/O
                  constant.ts (countries, nationalities, state labels), phone.ts, reservation.ts (lock state), funnel.ts, slot.ts, format.ts
  api/            the only layer the UI calls: one file per resource, all over fetch with same-origin cookies
                  http.ts (error envelope → user-facing messages), auth.ts (login / sign-up / me / logout / change password per role)
                  candidates.ts (sign-up, status, admin partner actions, verified and hub imports), reservations.ts (locks, placements)
                  slots.ts (cities by country, bookable slots, occupancy), people.ts (recruiters, admin accounts)
  shared/         auth/session.tsx (useSession, RequireRole, SignedOutOnly), PublicShell, PortalShell, LoginShell, ChangePassword, CSV helpers
  portals/        home/  partner/  recruiter/  admin/
  theme/          antd theme tokens + global CSS
  test/           setup, render helper, route-based fetch stub, fixtures, session fixtures
```

Each folder keeps its types in `interface.ts` and its constants in `constant.ts`.

## Authentication

- **The cookie is the only source of truth.** `useSession(role)` reads `GET /api/<role>/auth/me` (cached by TanStack Query, re-checked whenever the tab regains focus); nothing is kept in `sessionStorage`. So a new tab is signed in straight away, and a tab left open shows the account the cookie belongs to now, even if another tab signed in as someone else. `RequireRole` guards the signed-in pages; `SignedOutOnly` sends an already signed-in user from a landing, login or sign-up page to their home. Sign-out calls the logout endpoint and reloads the app, which also drops every cached response.
- **Sign-in.** `POST /api/<role>/auth/login` sets the httpOnly session cookie: partners with primary mobile + last name (no password), recruiters and admins with email + password. `ChangePassword` (header for recruiters and admins) posts to `/api/<role>/change-password`.
- **Recruiter approval.** `SessionUser.approved` is false while the recruiter's status is `pending`. `RecruiterLayout` then renders `PendingApprovalPage` instead of the workspace, so no feature page loads and no feature endpoint is called; the service refuses those endpoints as well. The session is re-read when the tab regains focus, so the workspace opens once an admin approves.
- **Admin roles.** `SessionUser.adminRole` comes from the service. Only a `super_admin` sees "Admin accounts" (`/admin/admins`); the service enforces the same rule.

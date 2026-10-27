# recruitment-portal

Front end for the partner recruitment & onboarding product (PRD: "Recruitment and Onboarding Portal" / Onboarding SG Job Portal).
One app, four role-based portals that share a domain model:

| Portal | Route | Who | Auth |
|---|---|---|---|
| Partner registration | `/partner` | Cleaners signing up | Public |
| Trainer | `/trainer` | Trainers tagged to Singapore / Myanmar / Overseas | Login |
| Recruiter | `/recruiter` | Approved external recruiters | Login |
| Business | `/business` | UC business team (admin) | Login |

**Status:** UI only. All data is mocked and persisted in the browser's `localStorage`, so actions in one portal show up in the others (partner signs up → trainer assesses → recruiter reserves → business assigns hub). No backend, no WhatsApp/Hireflix calls.

## Run

Needs Node 20+ (arm64). On this machine the default `node` is x86, so prefix the PATH:

```bash
export PATH=~/.nvm/versions/node/v24.22.1/bin:$PATH
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # typecheck + production build
```

Sample logins (password `Demo123!` for all): `trainer.sg`, `trainer.sg2`, `trainer.mm`, `trainer.overseas`, `recruiter.a`, `recruiter.b`, `business.admin`.
The home page (`/`) links every portal and has a "Reset sample data" button.

## Stack

Vite · React 19 · TypeScript · antd 6 (themed to the PRD mockups) · React Router 7 · TanStack Query 5 · dayjs · Vitest + Testing Library.

## Structure

```
src/
  app/            App shell: providers, router (each portal lazy-loaded), portal directory page
  domain/         Pure business rules + shared types — no React, no I/O
    interface.ts    Candidate, InterviewSlot, Reservation, enums (Geography, StageResult, …)
    constant.ts     Stage labels, option lists, reservation window, hub notice window, …
    assessment.ts   L1 → L2 → L3 gating, reset-on-change, verification gate
    reservation.ts  Expiry, time-left, "joining within 2 weeks"
    slot.ts         Bookable slots, booking counts, slot labels
    funnel.ts       Weekly channel funnel + pass rates
  api/            The only layer the UI calls. One file per resource; today backed by mocks/
    candidates.ts  slots.ts  people.ts  reservations.ts  auth.ts  hooks.ts (shared useQuery hooks)
  mocks/          Seed data + localStorage "database" (delete when the backend lands)
  shared/         Cross-portal UI: PortalShell (sidebar layout), StaffLogin, PageHeader, StatTile,
                  Notice, status tags, auth context + RequireRole guard, useAppMutation, CSV export
  portals/
    partner/      Registration form + slot picker, post-registration confirmation
    trainer/      Candidate list/filters/CSV, schedule, candidate assessment + notes + verification
    recruiter/    Dashboard, available profiles, reserve/contact/placement, my candidates, hub notifications
    business/     Overview + funnel, trainers & calendars, recruiter access + access log, placements/quotas/hubs
  theme/          antd theme tokens + global CSS
  test/           Test setup, render helper, session fixtures
```

Each folder keeps its types in `interface.ts` and its constants in `constant.ts`.

## Plugging in the backend

Components never touch `mocks/`. They call functions in `src/api/*` (directly or through TanStack Query), and those functions currently wrap `mockQuery` / `mockMutation`. To go live:

1. Replace the body of each `src/api/*.ts` function with an HTTP call (keep the signature), e.g. `listAvailableCandidates = () => http.get<AvailableCandidate[]>('/recruiter/candidates')`.
2. Move the rules in `src/domain/` that must be authoritative (stage gating, verification gate, reservation exclusivity/expiry, slot capacity) to the service. Keep the client copies only for UI hints such as disabling buttons.
3. Replace `api/auth.ts` + `shared/auth` session storage with the real login (recruiter/trainer accounts issued by the business team) and send the token on every request.
4. Delete `src/mocks/`.

Things the backend must own (not just the UI):
- Recruiter access to contact details and reservation exclusivity, including direct links. The mock strips `phone` from the available list, but real enforcement has to be server-side, with rate limits and access logging (PRD §3, "Access protection").
- Reservation expiry (a scheduled job, not the client's clock).
- Hireflix / WhatsApp invite on registration.

## Open questions from the PRD

- Reservation window length and extension rules (mock uses 48h).
- Hub allocation logic (mock: business sets it manually).
- Aggregator quota rules (mock: each assignment uses one place).
- Final consent wording (legal).
- Whether the public partner form and the staff portals ship as one deployment or two. Each portal is its own lazy chunk under `src/portals/`, so splitting later means adding a second Vite entry, not moving code.

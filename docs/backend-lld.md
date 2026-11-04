# Recruitment backend — LLD (draft 1, superseded)

> **Source of truth is now the Confluence tech design:**
> https://urbanclap.atlassian.net/wiki/spaces/~71202083f4c7679d4d4cf783356dc48c6c63f8/pages/5726765060
>
> Decisions taken on 2026-11-03 that change this draft:
> 1. **MongoDB**, not Postgres (team familiarity). Uniqueness via a unique index on the phone checksum; the lock is a single-document compare-and-set on the partner.
> 2. **Lock expiry computed at runtime**: a lock is active iff `lockedAt + LOCK_TTL > now`. No expiry job is needed for correctness.
> 3. **Exports include the phone number** (revisit if PII review objects).
> 4. **A recruiter can hold unlimited partners**; a partner has at most one active lock.
> 5. **One single dashboard** for partner, recruiter and admin (UI changes to be discussed).
>
> The sections below are kept as the detailed reference for the *standalone* variant (Fastify + zod, one-origin deployment, cookie sessions); read them with the decisions above applied.


**Scope:** the partner flow end to end, as agreed on 2026-11-03 — sign-up → admin export → offline tests → admin CSV import of verified partners → recruiter lock → placement → waiting to join. Admin and recruiter dashboards are covered only as far as this flow needs them.

**Standalone:** separate repository, separate database, separate deployment. No `openapi-rpc-node`, no UC gateway, no `internal-dashboards`, no `security-service`. Everything below is self-contained.

---

## 1. Requirements

### Functional
1. A partner signs up once; the WhatsApp phone number is the unique key. A second sign-up with the same number is rejected.
2. During sign-up the partner picks an interview slot at a centre for the chosen geography; a slot has a capacity.
3. Admins see and export (CSV) partners by state — "only signed-up" is the first use.
4. Admins run English / MCQ / practical tests offline, then upload a CSV of **UC-verified** partners. Those partners become available to recruiters.
5. A recruiter can lock one available partner at a time per partner (exclusive: no other recruiter sees or opens it); locking reveals the phone number.
6. After contacting the partner, the recruiter records the employer/aggregator name and start date; the partner moves to **placed** and waits to join.
7. Everything an admin or recruiter does to a partner is auditable (who, when, what).

### Non-functional
- Volume is small: hundreds of sign-ups per week, tens of admins/recruiters. One region (SG). Correctness and auditability matter more than throughput.
- Partner data is PII (phone, nationality, age). Only the locking recruiter and admins may see a phone number.
- The sign-up endpoint is public on the internet: it must survive bots and duplicates without manual cleanup.
- One small team; the stack must be boring and well documented.

### Out of scope for draft 1 (designed for, not built)
Partner login, WhatsApp/Hireflix invite, hub allocation and the 2-week notice, aggregator quotas, trainer tooling.

---

## 2. Stack and the reasons

| Concern | Choice | Why | Alternative considered |
|---|---|---|---|
| Runtime | Node 20 + TypeScript | Same language as the frontend; the team's language | — |
| HTTP | Fastify | Fast, schema-first (JSON Schema/zod), plugins for CORS/cookies/rate-limit/multipart; keeps the code functional (no decorators/classes) | NestJS: more batteries, but class/decorator style fights the functional conventions in CLAUDE.md |
| Validation | zod (+ `fastify-type-provider-zod`) | One schema gives runtime validation, TS types and OpenAPI | class-validator (NestJS) |
| Database | **PostgreSQL** | The data is relational (partner → booking → slot → centre; partner → reservation → recruiter) and the hard requirements are *constraints*: unique phone, "one active lock per partner", slot capacity, state transitions. Postgres enforces these in the database, not just in code | MongoDB: the team knows it, and it would work, but uniqueness-with-conditions, transactions and reporting are all easier in SQL |
| ORM / migrations | Prisma | Typed client, migrations in git, raw SQL when needed (locking) | Drizzle (lighter, closer to SQL — fine too) |
| Background jobs | `pg-boss` (Postgres-backed queue + cron) | Reservation expiry and later the invite outbox, with no extra infrastructure | node-cron in-process (ok for a single instance) |
| Auth | Google Identity Services for admins (verify ID token in our backend, domain allowlist); email + password (argon2) for recruiters; none for partners | Standard, no dependency on UC | — |
| Sessions | Signed JWT in an **httpOnly, SameSite=Lax cookie** | Frontend and API served from one domain (see §3), so no CORS or token storage in JS | Bearer in localStorage (XSS-exposed) |
| Logs | pino, JSON | Structured, cheap; matches the `{ method, key_1, key_1_value }` convention | — |
| Tests | vitest + supertest + a throwaway Postgres (docker) | Same test runner as the frontend | — |

---

## 3. Topology and frontend ↔ backend communication

```
browser ──HTTPS──▶ reverse proxy (Caddy or nginx)
                   ├── /api/*   ──▶ recruitment-api  (Fastify, port 3000)
                   └── /*       ──▶ recruitment-portal (static build, SPA fallback)
                                         │
                   recruitment-api ──▶ PostgreSQL (managed: RDS / Neon / Supabase — TBD)
                                   ──▶ pg-boss (same database)
```

- **One origin** for UI and API (`https://recruit.<domain>/`, API under `/api/`). Cookies work with `SameSite=Lax`, no CORS, no token handling in JS. Locally, Vite proxies `/api` to `localhost:3000`.
- **Contract:** REST + JSON. The backend serves `GET /api/openapi.json` (generated from the zod schemas). The frontend runs `openapi-typescript` to generate request/response types into `src/api/generated.ts`; `src/api/http.ts` stays as the single fetch wrapper, with `credentials: 'include'`, and the mock functions in `src/api/*.ts` are replaced one by one with real calls (that seam was designed for this).
- **Errors:** every non-2xx response is `{ "error": { "code": "PHONE_ALREADY_REGISTERED", "message": "…", "details": {} } }`. Codes are stable strings the UI switches on; messages are for humans.
- **Dates:** ISO-8601 UTC in JSON; slot times carry the centre's time zone (`Asia/Singapore`, `Asia/Yangon`) so the UI can render local time.
- **Ids:** UUIDv7 (time-ordered) for every table.

Deployment: Docker image per app, one `docker-compose.yml` for local (api + db + proxy). Where it runs in the cloud (account, region, managed Postgres provider, DNS, TLS) is an open decision — the design does not depend on it.

---

## 4. Data model (PostgreSQL)

```
partners ─1─┬─0..1─ slot_bookings ─n─1─ interview_slots ─n─1─ interview_centres
            ├─0..n─ reservations ─n─1─ recruiters
            ├─0..n─ verification_import_rows ─n─1─ verification_imports ─n─1─ admins
            └─0..n─ audit_log
```

### partners
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| phone_e164 | text **unique** | normalised with libphonenumber (`+6591234567`); the uniqueness guarantee |
| phone_hash | text, indexed | HMAC-SHA256 of `phone_e164` — lookup key once `phone_e164` is encrypted (see §8) |
| full_name | text | |
| current_country, current_city, nationality | text | |
| age | smallint | 18–80 |
| source | enum `recruitment_source` | TikTok, Facebook, Referral, Recruiter, Aggregator, Influencer, Direct, Other |
| referrer_name | text null | required when source ∈ {Recruiter, Referral, Aggregator} (checked in code) |
| comfortable_with_dogs, deep_cleaning_experience | boolean | |
| cooking_frequency | enum | Never … Daily |
| interview_geography | enum `geography` | Singapore, Myanmar, Overseas |
| consent_accepted_at | timestamptz | consent text version stored in `consent_version` |
| state | enum `partner_state` | see §5 |
| verified_at, verified_by_admin_id | timestamptz, uuid null | set by CSV import |
| rejected_reason | text null | |
| created_at, updated_at | timestamptz | |

Indexes: `(state, created_at)` for admin lists; `(interview_geography, state)`.

### interview_centres
`id, geography, name, address, instructions, time_zone, is_active`

### interview_slots
`id, centre_id fk, starts_at timestamptz, duration_minutes, capacity int, booked_count int default 0, is_open bool, created_by_admin_id`
Index `(centre_id, starts_at)`. Check `booked_count <= capacity`.

### slot_bookings
`id, slot_id fk, partner_id fk unique, created_at`
One booking per partner (unique). `booked_count` on the slot is maintained in the same transaction (§6.1) so "seats left" is one column read.

### verification_imports / verification_import_rows
`verification_imports: id, uploaded_by_admin_id, file_name, row_count, accepted_count, rejected_count, created_at`
`verification_import_rows: id, import_id fk, row_number, phone_raw, phone_e164 null, outcome enum (accepted | not_found | already_verified | invalid_phone | not_signed_up), partner_id null, assessment jsonb null`
`assessment` keeps whatever extra columns the CSV had (English score, MCQ score, practical result) without forcing a schema now.

### recruiters
`id, email citext unique, full_name, company, password_hash (argon2id), status enum (active | suspended), invited_by_admin_id, last_login_at, created_at`

### admins
`id, email citext unique (must be @urbancompany.com / @urbanclap.com), full_name, role enum (admin | viewer), status, created_at`
An allowlist: Google sign-in succeeds only for emails in this table.

### reservations
| column | notes |
|---|---|
| id | |
| partner_id fk, recruiter_id fk | |
| state | enum `reservation_state`: `locked`, `placed`, `expired`, `released` |
| locked_at, expires_at | `expires_at = locked_at + lock window` (config, default 48h; **null = never expires** if we decide locks don't expire) |
| employer_name, start_date date, placed_at | filled by the recruiter |
| released_at, released_reason | |

**Invariant:** at most one *active* reservation per partner, enforced in the database:
```sql
create unique index reservations_one_active_per_partner
  on reservations (partner_id) where state in ('locked', 'placed');
```
This is the backstop; the application also checks, but a race between two recruiters can only ever produce one row.

### audit_log
`id, actor_type enum (partner | admin | recruiter | system), actor_id uuid null, action text (e.g. partner.signed_up, partner.verified, reservation.locked, reservation.placed, reservation.expired, phone.revealed), entity_type, entity_id, data jsonb, request_id, created_at`
Append-only. "Which recruiter opened which profile and when" is a query on `action = 'phone.revealed'`.

### partner_phone (optional split, see §8)
If we encrypt the phone, it moves to its own table `partner_phones(partner_id pk, phone_ciphertext bytea, key_version)` and `partners.phone_e164` is dropped in favour of `phone_hash` (unique). Draft 1 keeps `phone_e164` in `partners` to stay simple; the switch is a migration, not a redesign.

---

## 5. Partner lifecycle

```
                 CSV import                 recruiter locks           placement saved
 signed_up ───────────────▶ verified ───────────────────▶ locked ───────────────────▶ placed ──▶ joined (later)
     │                          ▲                            │
     │ CSV import (fail)        │ lock expires / released    │
     ▼                          └────────────────────────────┘
  rejected
```

| state | meaning | who moves it |
|---|---|---|
| `signed_up` | registered, slot booked, tests pending | partner (sign-up) |
| `verified` | passed offline tests, visible to recruiters | admin (CSV import) |
| `rejected` | failed tests; invisible to recruiters, kept for records | admin (CSV import with result = fail, or manual) |
| `locked` | one recruiter holds it; phone revealed to that recruiter | recruiter |
| `placed` | employer + start date recorded ("approved, waiting to join") | recruiter |
| `joined` | started work (future; set by admin) | admin |

Transitions are a single table in code (`PARTNER_TRANSITIONS: Record<PartnerState, PartnerState[]>`) and every transition writes an `audit_log` row in the same transaction. `locked → verified` happens on expiry (job) or explicit release.

---

## 6. Key flows

### 6.1 Partner sign-up (`POST /api/partner/signups`)
1. Validate body with zod (all PRD fields, consent must be `true`, referrer required for referral-type sources).
2. Normalise phone → E.164; reject if not a valid mobile number.
3. Transaction:
   1. `insert into partners …` — a unique violation on `phone_e164` becomes `409 PHONE_ALREADY_REGISTERED` (no pre-check needed; the index is the check).
   2. `update interview_slots set booked_count = booked_count + 1 where id = $slot and is_open and starts_at > now() and booked_count < capacity` — if 0 rows updated → rollback → `409 SLOT_FULL`.
   3. `insert into slot_bookings`.
   4. `insert into audit_log (partner.signed_up)`.
4. Enqueue `partner.invite` job (no-op worker until Hireflix is integrated).
5. Respond `201 { partnerId, state, slot: { centre, startsAt, timeZone, address, instructions } }`.

The confirmation page reads `GET /api/partner/signups/:id`. The id is a UUIDv7 and acts as an unguessable capability; it returns the partner's own data minus nothing sensitive beyond what they typed. If partner login is added later, this endpoint moves behind it.

### 6.2 Admin export (`GET /api/admin/partners/export.csv?state=signed_up&geography=&from=&to=`)
Streams CSV straight from a cursor (`pg-query-stream` → `csv-stringify`), so size never matters. Columns are a fixed list in `constant.ts`; phone is included (admins may see it), and the export itself is audited (`partners.exported` with the filter and row count).

### 6.3 Verified-partner import (`POST /api/admin/verifications/import`, multipart CSV)
1. Parse with `csv-parse` (header row required; at least a `phone` column; optional `result` = pass/fail, any other columns go to `assessment` jsonb).
2. For each row: normalise phone → look up partner → decide outcome:
   - not found → `not_signed_up`
   - already `verified`/`locked`/`placed` → `already_verified` (no change)
   - `signed_up` + pass → `accepted`: `state = verified`, `verified_at`, `verified_by`, audit row
   - `signed_up` + fail → `accepted`: `state = rejected`, `rejected_reason = 'assessment_failed'`, audit row
3. One transaction per file (a few hundred rows); write `verification_imports` + all rows; respond with counts and the rejected rows so the admin can fix the file and re-upload. Re-uploading the same file is harmless (idempotent by outcome).

### 6.4 Recruiter lock (`POST /api/recruiter/partners/:id/lock`)
Transaction, in this order:
1. `update partners set state = 'locked' where id = $id and state = 'verified'` → 0 rows → `409 NOT_AVAILABLE` (someone else got it, or it isn't verified).
2. `insert into reservations (partner_id, recruiter_id, state='locked', locked_at=now(), expires_at=now()+window)` — the partial unique index would also reject a second active row.
3. audit `reservation.locked` + `phone.revealed`.
4. Return the full profile **including phone**.

Reads for recruiters: `GET /api/recruiter/partners/available` returns `verified` partners without phone; `GET /api/recruiter/reservations/:id` returns the profile with phone only if `reservation.recruiter_id = current recruiter` — every reveal is audited.

### 6.5 Placement (`POST /api/recruiter/reservations/:id/placement`)
Body `{ employerName, startDate }` (start date ≥ today). Only the owning recruiter, only while `locked` (or to edit while `placed`). Sets `reservation.state = placed`, `partner.state = placed`, audit `reservation.placed`.

### 6.6 Lock expiry (job)
`pg-boss` cron every 5 minutes: `update reservations set state='expired' where state='locked' and expires_at < now() returning partner_id`, then `update partners set state='verified' where id = any($ids) and state='locked'`, plus audit rows. Idempotent; safe to run on several instances. If the business decides locks never expire, `expires_at` is null and the job is a no-op.

---

## 7. API surface (draft 1)

All JSON, all under `/api`. `A` = admin session, `R` = recruiter session, `P` = public.

| Method & path | Auth | Purpose |
|---|---|---|
| `GET  /partner/interview-slots?geography=` | P | centres + open future slots with `seatsLeft` |
| `POST /partner/signups` | P + captcha + rate limit | §6.1 |
| `GET  /partner/signups/:id` | P (capability id) | confirmation page |
| `POST /admin/auth/google` | — | body `{ credential }` → verify Google ID token (aud = our client id, hd/email domain, email in `admins`) → set session cookie |
| `POST /admin/auth/logout`, `GET /admin/auth/me` | A | |
| `GET  /admin/partners` | A | list + filters + pagination (`state, geography, from, to, q`) |
| `GET  /admin/partners/:id` | A | full record incl. bookings, reservations, audit trail |
| `GET  /admin/partners/export.csv` | A | §6.2 |
| `POST /admin/verifications/import` | A | §6.3 |
| `GET  /admin/verifications/imports/:id` | A | import report |
| `GET/POST/PATCH /admin/centres`, `/admin/slots` | A | manage centres and slots (`PATCH` to close a slot) |
| `GET/POST/PATCH /admin/recruiters` | A | invite (sets a one-time password / reset link), suspend |
| `GET  /admin/reservations` | A | who locked whom, deadlines, placements |
| `GET  /admin/stats` | A | funnel counts by state × geography × source |
| `POST /recruiter/auth/login`, `/logout`, `GET /recruiter/auth/me` | — / R | |
| `POST /recruiter/auth/reset-password` | — | token from invite/reset email |
| `GET  /recruiter/partners/available` | R | §6.4 reads |
| `POST /recruiter/partners/:id/lock` | R | §6.4 |
| `GET  /recruiter/reservations` | R | my locked + placed partners |
| `GET  /recruiter/reservations/:id` | R (owner) | profile with phone |
| `POST /recruiter/reservations/:id/placement` | R (owner) | §6.5 |
| `POST /recruiter/reservations/:id/release` | R (owner) | give the partner back early (optional) |
| `GET  /healthz`, `GET /openapi.json` | — | |

Pagination: `?page=&pageSize=` (max 100) returning `{ items, page, pageSize, total }`.

---

## 8. Security and privacy

- **Admins:** Google Identity Services button in the UI (already built) → `POST /admin/auth/google` → backend verifies the ID token with `google-auth-library` (`verifyIdToken`, audience = our OAuth client id), checks the email domain and that the email exists in `admins`. No UC dependency: the OAuth client is our own, created in a Google Cloud project we control.
- **Recruiters:** email + password, argon2id hashes, invite flow (admin creates account → one-time set-password link), lockout after N failures, forced reset supported.
- **Sessions:** JWT (HS256, 12h) in an httpOnly `Secure` `SameSite=Lax` cookie, separate cookie names per role (`admin_session`, `recruiter_session`). Logout = clear cookie + a `sessions_revoked_before` timestamp on the user for immediate invalidation.
- **Public sign-up protection:** reCAPTCHA v3 (or Turnstile) token verified server-side, `@fastify/rate-limit` per IP (e.g. 5 sign-ups / 10 min) and per phone hash, body size limit, no enumeration (duplicate phone returns the same 409 regardless of who holds it).
- **PII:** phone is the sensitive field. Draft 1 stores it plaintext in a locked-down database; the recommended step before go-live is app-level encryption (AES-256-GCM with a key in the cloud KMS/secret manager) with `phone_hash` for uniqueness and lookup — the same hash-plus-ciphertext pattern UC uses, just self-contained. Phone never appears in logs; audit rows store the partner id, not the phone.
- **Authorisation:** route-level role guards (`requireAdmin`, `requireRecruiter`) plus ownership checks in the use case (recruiter ↔ reservation). Admin "viewer" role is read-only.
- **Transport:** TLS at the proxy; HSTS; CSRF is covered by `SameSite=Lax` + JSON-only bodies + custom header check on mutating routes.

---

## 9. Repository structure (`recruitment-api`)

```
recruitment-api/
  prisma/
    schema.prisma              tables, enums, indexes (incl. the partial unique index via raw SQL migration)
    migrations/
  src/
    server.ts                  builds the Fastify app, registers plugins and module routes, starts pg-boss
    app/
      config.ts                env parsing (zod) — DATABASE_URL, SESSION_SECRET, GOOGLE_CLIENT_ID, LOCK_WINDOW_HOURS, …
      db.ts                    Prisma client
      logger.ts                pino instance
      errors.ts                AppError + error → HTTP mapping
      auth/                    cookie/JWT helpers, requireAdmin / requireRecruiter guards
      interface.ts  constant.ts
    modules/
      partner/                 sign-up, confirmation read, state machine (PARTNER_TRANSITIONS)
      interview/               centres, slots, bookings
      verification/            CSV import, import reports
      recruiter/               accounts, login, invites
      reservation/             lock, placement, release, expiry job
      admin/                   admin accounts, Google auth, lists/exports/stats (read models over the other modules)
      audit/                   append + query
    jobs/
      index.ts                 pg-boss registration (expire_locks, partner_invite)
  test/
    unit/                      use cases with repositories stubbed
    integration/               supertest against a docker Postgres, one file per route group
  docker-compose.yml           api + postgres + caddy for local
  Dockerfile
```

Every module has the same shape: `routes.ts` (one handler per endpoint, validation + call a use case), `use_cases/<verb_noun>.ts` (one per operation, rules live here), `repository.ts` (only file that touches Prisma), `interface.ts`, `constant.ts`, `index.ts` (what other modules may import). Cross-module calls go through `index.ts` only. This matches the structure proposed earlier and the conventions in CLAUDE.md (functional style, `interface.ts`/`constant.ts` per folder, structured logs with `method` and `key_n`).

---

## 10. Observability and operations

- `GET /healthz` checks the database; the proxy/orchestrator uses it.
- pino JSON logs with `request_id` (from `x-request-id` or generated), `method`, actor type/id, and never the phone.
- Metrics (later): request latency/count per route, job run counts, sign-ups per hour, locks per day.
- Backups: managed Postgres daily snapshots; PII retention policy to be defined (e.g. purge `rejected` after 12 months).
- Migrations run on deploy (`prisma migrate deploy`), never on boot in production.

---

## 11. Testing strategy

- **Use cases:** vitest unit tests with the repository replaced by in-memory fakes — sign-up validation, transition table, lock/placement rules, import outcome mapping.
- **Routes:** supertest integration tests against a real Postgres in docker — the uniqueness and locking guarantees are database behaviour, so they are tested there: two parallel locks on one partner → exactly one 200; sign-up with a duplicate phone → 409; slot at capacity → 409.
- **Contract:** the generated `openapi.json` is committed and diffed in CI so frontend type regeneration is deliberate.

---

## 12. Rollout

1. Repo skeleton, config, Prisma schema + first migration, health check, CI (lint, typecheck, tests, build).
2. Partner module + interview module → sign-up live against the frontend's partner portal (replace `src/api/candidates.ts` and `slots.ts` mocks).
3. Admin auth (Google) + partner list/export + centre/slot management → admin portal on real data.
4. Verification import.
5. Recruiter accounts + lock + placement + expiry job → recruiter portal on real data.
6. Invite worker (Hireflix/WhatsApp) once the integration is known.

---

## 13. Decisions I need from you

1. **Postgres + Prisma** vs Mongo — I recommend Postgres for the constraints; tell me if team familiarity should win.
2. **Lock expiry:** does a lock expire if the recruiter never records a placement (PRD says yes, window TBD), or is it manual release only?
3. **Phone exposure:** admins can always see phones; recruiters only after locking — correct? Should the export CSV include phones?
4. **Verified CSV format:** which columns will the admin upload (phone + pass/fail, or scores)? Is "fail" also in the file, or only passes?
5. **Multiple locks per recruiter:** allowed (one partner can have one lock; a recruiter can hold several) — correct?
6. **Hosting target** (cloud account / managed Postgres / domain) and whether partner, recruiter and admin UIs share one domain.
7. **Partner login:** none for now; the confirmation page is reachable by the sign-up id only.

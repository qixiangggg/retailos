# RetailOS

An expiry-tracking web app for a 7-Eleven franchise store, replacing a manual
paper-based workflow for logging expiring stock and processing write-offs.

**Status:** Backend complete and deployed. Frontend in early development.
**Live API:** https://retailos-pyk9.onrender.com

---

## Why this exists

The store's manual process for handling expiring stock:

1. Staff scan a product on the POS just to find its SKU
2. Hand-write the SKU + quantity into a physical book
3. The manager manually writes off items from the book weekly

This is slow, error-prone, and leaves no queryable history. RetailOS replaces it
with a phone-based flow: scan a barcode, log the expiry date and quantity, see
what's expiring grouped by urgency, and write off stock in one tap — with every
action attributed and timestamped.

> **Note:** This is a real tool built for an actual store, not a demo. It is
> being developed incrementally toward real staff use.

---

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────────┐    JDBC/SSL    ┌─────────────┐
│  React +    │ ─────────────► │  Spring Boot 3   │ ─────────────► │  PostgreSQL │
│  Vite (SPA) │                │  (REST API)      │                │  (Neon)     │
│  [on phone] │ ◄───────────── │  on Render       │ ◄───────────── │  ap-southeast│
└─────────────┘     JSON       └──────────────────┘                └─────────────┘
     [WIP]                     Flyway-managed schema
```

**Backend** — Java 21, Spring Boot 3 (Web, Data JPA, Security, Validation),
Flyway migrations, PostgreSQL. Deployed on Render via a multi-stage Docker build.

**Database** — PostgreSQL on Neon (managed, ap-southeast-1). Schema is owned
entirely by Flyway migrations; Hibernate runs in `validate` mode and never
alters the schema.

**Frontend** — React + Vite + Tailwind, mobile-first (staff use phones).
Barcode scanning via `html5-qrcode`, restricted to 1D retail formats.
*Currently early — see Project status below.*

---

## Data model

Four core tables:

- **product** — one row per barcode (unique). Name captured once on first scan
  ("SKU memory"); SKU is nullable and filled in later.
- **expiry_record** — one row per logged batch. The same product with the same
  expiry date can have multiple records (separate physical batches), each written
  off independently.
- **writeoff** — references an expiry_record. Supports **partial write-offs**:
  remaining stock is `quantity − SUM(writeoffs)`, with a `reason`
  (expired / damaged / staff_meal).
- **app_user** — managers (username + password) and staff (PIN); every logging
  and write-off action is attributed to a user.

Write-off state is **derived**, not stored as a status flag — a record is "active"
while it still has remaining quantity, and disappears from the dashboard once
fully written off.

---

## Key design decisions

These were made deliberately; the reasoning matters more than the code.

- **Partial write-offs (not full-only).** Stock can leave as expired, damaged, or
  staff meal, in portions. Remaining is computed as `quantity − SUM(writeoffs)`
  rather than stored, keeping write-off history as the source of truth.

- **Flyway owns the schema; JPA validates only.** `ddl-auto: validate` means the
  application never mutates the database structure. Every schema change is a new,
  checksummed migration (V1–V6) — including fixes, which are new migrations rather
  than edits to applied ones.

- **Urgency dashboard: filter in SQL, bucket in Java.** A JPQL query returns each
  active batch with its remaining quantity (excluding fully-written-off records
  via a correlated subquery on the write-off sum). Java then buckets records into
  expired / ≤3 / ≤7 / ≤14 / later. Bucketing lives in Java because it's pure,
  deterministic logic that's trivial to unit-test without a database.

- **`today` is injected, not read inside the query.** A `Clock` bean (store
  timezone) supplies the current date, so date-relative bucketing is fully
  deterministic and testable.

- **Write-off quantity invariant.** `SUM(existing writeoffs) + new ≤ record
  quantity`, enforced in a `@Transactional` service method. Over-writing-off is
  rejected with the remaining amount reported back.

- **DTOs at the boundary, entities never leave the service layer.** Controllers
  return records (e.g. `DashboardRow`, `CreateWriteoffResponse`), never JPA
  entities — avoiding serialization of internal fields and lazy-loading issues.

- **Centralized error handling.** A single `@RestControllerAdvice` maps typed
  exceptions and validation failures to a consistent `ErrorResponse` shape;
  unexpected errors return a generic 500 (details logged server-side, not leaked).

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/expiry-records` | Log expiring stock (find-or-create product by barcode, then insert batch) |
| `GET`  | `/api/v1/products/barcode/{barcode}` | Look up a product by barcode (drives the "new vs known" scan UI) |
| `GET`  | `/api/v1/expiry-records/dashboard` | Active stock grouped by expiry urgency |
| `POST` | `/api/v1/writeoffs` | Write off part or all of a batch |

---

## Running locally

**Prerequisites:** Java 21, Docker (for local Postgres), Maven wrapper included.

```bash
# 1. Start local Postgres
docker compose up -d

# 2. Provide DB config (via a gitignored .env or environment variables)
#    POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
#    (DATABASE_URL overrides the full JDBC URL in deployed environments)

# 3. Run the backend (Flyway applies migrations on startup)
cd backend
./mvnw spring-boot:run
```

The frontend (early, scanner prototype only):

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

- **Backend:** Docker image (multi-stage: Maven/JDK 21 build → JRE 21 runtime),
  deployed on Render. Configuration is fully externalized via environment
  variables — no secrets in source.
- **Database:** Neon (managed PostgreSQL). Flyway migrations run against it on
  first boot.
- Free-tier instances cold-start after inactivity (~30–50s on first request).

---

## Project status

Honest snapshot — this project is in active, incremental development.

**Done**
- [x] Full database schema via Flyway migrations (V1–V6)
- [x] Log-stock write path (barcode → find-or-create product → insert batch)
- [x] Urgency-grouped dashboard query (correlated subquery + Java bucketing)
- [x] Write-off path with partial-write-off quantity invariant
- [x] Centralized validation and exception handling
- [x] Backend deployed to Render + Neon, all endpoints verified live via Postman

**In progress**
- [ ] Frontend — currently a working barcode-scanner prototype only.
      Log / dashboard / write-off screens not yet built.

**Planned (hardening phase)**
- [ ] Concurrency control on the write-off invariant (optimistic `@Version` vs
      pessimistic locking — evaluating against the actual low-contention workload)
- [ ] Test suite: unit (bucketing ladder, write-off boundaries) + Testcontainers
      integration (dashboard query, concurrent write-off race)
- [ ] Real authentication (JWT for managers, PIN for staff) — currently a seeded
      user stands in
- [ ] Concurrent-scan race handling (duplicate-barcode retry)
- [ ] Query-plan verification (confirm write-off FK index usage under `EXPLAIN`)

**Explicitly out of scope for v1** (deferred by design): Redis dashboard caching,
scheduled "pull today" job, order-suggestion analytics, multi-store.

---

## Metrics

_TODO: before/after comparison of the manual vs. app workflow_
_(time to log an expiring item, weekly write-off processing time, error rate)._

---

## Tech stack

**Backend:** Java 21 · Spring Boot 3 · Spring Data JPA · Flyway · PostgreSQL
**Frontend:** React · Vite · Tailwind · html5-qrcode
**Infra:** Docker · Render · Neon
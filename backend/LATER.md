# LATER.md — RetailOS deferred work

Things intentionally postponed to protect the Aug 23 launch. Nothing here blocks
launch; several items are the backend-depth showcase work for the Aug 30 hardening
phase. "Don't build before launch" — my own rule.

## Aug 30 — Hardening (backend depth showcase, the interview centerpiece)

### Write-off concurrency lock  ← #1 interview story
- Current write-off is check-then-insert: read SUM(writeoff.quantity), compare,
  insert. Two concurrent write-offs on the same batch can both pass the check and
  over-write-off. @Transactional alone does NOT prevent this (both read the
  committed sum before either inserts).
- Chosen approach: optimistic (@Version) — justified by near-zero contention
  (one staff per shift). BUT: plain @Version on ExpiryRecord does NOT guard a
  check-then-insert invariant unless the ExpiryRecord row is also updated.
- Decide in hardening: either (a) bump version by touching ExpiryRecord in the
  same tx (e.g. maintain a qtyRemaining column), or (b) pessimistic lock
  (@Lock(PESSIMISTIC_WRITE)) on the ExpiryRecord findById at write-off time,
  just for this operation.
- Add @Version field + migration IF going the version-bump route (not added yet —
  deliberately not adding mechanism before deciding I need it).
- Prove it with a two-thread Testcontainers test that asserts the invariant holds.

### Tests (~10 meaningful — the depth I'm most missing)
- Unit: Urgency.findRemainingDays ladder — one test per boundary
  (expired/today, +2, +5, +10, +15). today passed in / fixed Clock.
- Unit: write-off invariant boundaries — full qty succeeds, qty+1 fails,
  partial-then-partial-that-fits succeeds, partial-then-partial-that-exceeds fails.
- Integration (Testcontainers): the dashboard query returns correct remaining
  quantities and excludes fully-written-off records.
- Integration: concurrent write-off race (see above).
- Reuse the by-hand test cases already run for write-off and dashboard — they
  port straight over.

### Clear the two TODOs
- Concurrent-scan race (ExpiryRecordService, new-barcode branch): two staff scan
  the same new barcode → one insert wins on barcode UNIQUE, loser throws.
  Fix: catch DataIntegrityViolationException, re-fetch by barcode, proceed with
  the now-existing product (turn the race into a retry).
- Error-message honesty (WriteoffService): message says "cannot [be] more than
  expiry record quantity" — grammatically broken AND wrong. Real constraint is
  REMAINING, not total. Compute remaining, say "only N remaining." Also add
  remainingQuantity to CreateWriteoffResponse (useful phone confirmation).

### Real auth (replaces hardcoded TEST user)
- JWT for manager login, PIN for staff. Every action attributed to real user
  (created_by / writeoff_by currently hardcoded to seed user "TEST").
- Spring Security config decisions (write these myself, don't generate blind).
- app_user already supports both paths: username+password_hashed (manager),
  pin_hashed (staff), nullable as appropriate.

### Query plan / index verification
- Run EXPLAIN on the dashboard query; confirm idx_writeoff_expiry_record
  (V5) is actually used by the correlated subquery.
- Note: dashboard query's correlated write-off sum appears twice (SELECT + WHERE).
  Planner may collapse it. Only optimize to a native LEFT JOIN on a derived table
  if profiling shows it matters — premature otherwise.

## The one AI highlight (garnish — build LAST, only if time allows)
- Natural-language query: English → safe, validated query. Chosen over
  "write-off suggestions" because it forces real backend problems
  (prompt-injection safety, sandboxing/validating generated queries, never
  letting the LLM run arbitrary SQL) — backend engineering wearing an AI hat.
- Its job: differentiate among backend candidates + let me apply to AI roles on
  the side. A bonus, not the core.

## Direct write-off (post-launch convenience)
- Staff write off stock that was never logged (e.g. moldy loaf nobody logged).
- NOT a schema change / NOT a no-record write-off — writeoff.expiry_record_id is
  NOT NULL by design (audit trail). Instead: find-or-create the expiry_record AND
  the writeoff in one transaction.
- Thin wrapper: find-or-create record, then call the SHARED writeOff() core
  method (same invariant + insert as the tap-existing-record path). Two endpoints,
  ONE core method — don't duplicate the invariant logic.
- Considered folding into POST /expiry-records with an immediateWriteoff flag;
  rejected to keep "log stock" and "discard stock" resource semantics clean.

## Original "much later" (from project brief — post-everything)
- Redis caching of the dashboard (Upstash).
- 6am scheduled "pull today" job (@Scheduled / Quartz).
- Order-suggestion analytics.
- Multi-store.

## Data cleanup / cosmetic (whenever, non-blocking)
- Dirty test data: expiry_record 1c48f814... has product_name "" (created before
  name validation existed). Delete before any README screenshot/demo.
- @NotNull on request barcode only catches null, not "". Switch to @NotBlank if
  empty-string barcodes should be rejected.
- Dashboard EXPIRED bucket: same-date rows have undefined order (ORDER BY
  expiryDate only). Add a tiebreaker (remaining qty or created_at) if the
  frontend wants stable ordering.
- ProductNotFoundException / ExpiryRecordNotFoundException: double-check message
  wording is clean (earlier had "Product Not Found" doubled, and ExpiryRecord
  one once said "Product" — verify both).
- AppUser: two @OneToMany lists were labeled backwards (created/updated swapped) —
  verify the fix landed. Also: consider dropping unused inverse @OneToMany
  collections (AppUser.writeoffList, ExpiryRecord.writeoffList, etc.) if never
  navigated — bidirectional isn't free (accidental lazy loads / big fetches).
- Writeoff quantity mapped as int; SUM returns Long. Fine at this scale, know the
  overflow ceiling for interviews.

## Locked decisions (do NOT relitigate)
- Stack: Java 21 (LTS, not 24), Spring Boot 3, Flyway, Postgres, React+Vite+
  Tailwind. Deploy: Railway/Render + Neon/Supabase + Vercel.
- Option B write-offs (partial allowed): remaining = quantity - SUM(writeoffs).
- Each expiry_record = one batch; never dedup records, only products (by barcode).
- Bucket in Java, filter in query. today passed in (testability).
- If I propose microservices / Kafka / k8s / stack swaps → it goes HERE, back to work.
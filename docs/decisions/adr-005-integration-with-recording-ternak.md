# ADR-005: Integrate with recording-ternak — drop the local users table, sync Peternak

## Status
Accepted

## Context
See recording-ternak's [ADR-006](../../../recording-ternak/docs/decisions/adr-006-integration-with-dashboard-kematian-ternak.md) for the full context — this ADR records the decision from this app's side.

recording-ternak (a separate app, WhatsApp-driven goat health records) wanted: one shared users table instead of separate accounts per app, a way for its goats to get berita acara/akta kelahiran documents generated using this app's existing logic, and the `Peternak` tables in both apps to stay in sync.

## Decision
- **Dropped the local `User` model entirely.** `/api/auth/login`, `/api/auth/google`, `/api/users/me`, `/api/users` all now proxy to recording-ternak's `/api/auth/*` / `/api/admins` (`lib/recording-client.js`, header `x-internal-key`). JWTs are still verified **locally** here (same `JWT_SECRET` as recording-ternak) — only login and user-management calls cross the network, not every authenticated request.
- **`Peternak.nik` made nullable.** recording-ternak's `Farmer` has no NIK field; a Peternak synced from there gets `nik: null`, fillable later by hand here if needed.
- **`LaporanKematian.petugasId` / `LaporanKelahiran.petugasId` are plain UUID columns, not Prisma relations** — the user they reference lives in a different database now, so a Prisma FK is impossible. `LaporanKelahiran` gained a `petugasNama` snapshot column (denormalized at creation time) since the akta kelahiran document needs the officer's name and there's no local `User` row to join against anymore.
- **`Ternak.jenisKelamin` / `tanggalLahir` made nullable**, and `POST /api/ternak/provision` added (find-by-`kodeTernak`-or-create) — recording-ternak has no concept of a goat's sex or birth date at the `Goat` level, so a Ternak provisioned from there can start incomplete. `POST /api/laporan-kematian` gates on both being filled in before allowing a legal document to be generated, so an incomplete import can never produce a berita acara with wrong/missing data.
- **`Peternak` create/update/delete pushes to recording-ternak's `/internal/farmers/:id`** (and the reverse — recording-ternak pushes to this app's own new `/internal/peternak/:id`), correlated by sharing the same row id. Best-effort, no retry queue — see consequences.

## Consequences
- No local password/Google verification code remains in this app — a security-sensitive surface (`bcrypt`, `google-auth-library` token verification) now lives in exactly one place across both apps.
- `JWT_SECRET` and `INTERNAL_API_KEY` must be identical between this app's and recording-ternak's deployments — a mismatch fails silently as 401s, not a build-time error.
- Cross-app writes (Peternak sync, provisioning) aren't atomic with the local write they're triggered from. A failed sync is logged and never retried automatically; this was accepted deliberately given the single-village scale rather than building outbox/retry infrastructure.
- Existing `Peternak` and `User` rows that predated this integration needed a one-time manual backfill/migration (into recording-ternak's `Admin` table, and a bidirectional Peternak↔Farmer sync pass) — the sync code only fires on new writes going forward, it doesn't backfill history.

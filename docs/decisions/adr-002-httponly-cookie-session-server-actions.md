# ADR-002: Sesi Login Disimpan sebagai Cookie httpOnly via Next.js Server Actions

## Status

Accepted

## Context

Backend mengeluarkan token JWT sebagai kredensial sesi. Token ini perlu disimpan di sisi browser dengan aman — menyimpannya di `localStorage` atau state client (Zustand/Context) membuatnya bisa diakses JavaScript apa pun yang berjalan di halaman, termasuk lewat serangan XSS. Sementara itu, arsitektur frontend memakai Next.js App Router yang mengandalkan Server Components/Server Actions untuk data fetching dan mutasi, bukan client-side fetching penuh.

## Decision

Token JWT hasil login (`POST /api/auth/login` atau `POST /api/auth/google`) disimpan lewat `cookies().set(SESSION_COOKIE, token, { httpOnly: true, secure: ..., sameSite: 'lax', maxAge: ... })` di dalam Server Action (`frontend/src/features/auth/actions.ts`) — bukan di `localStorage` atau store client. Semua request terautentikasi dari sisi server (Server Component/Server Action/Route Handler) memakai instance Axios (`frontend/src/lib/api-server.ts`, ditandai `"server-only"`) yang membaca cookie ini dan menyisipkannya sebagai header `Authorization: Bearer <token>` ke backend. `frontend/src/proxy.ts` (Next.js Middleware) memakai *keberadaan* cookie ini (bukan isinya) untuk mengarahkan navigasi antara `/login` dan halaman dashboard.

## Consequences

- Token tidak bisa dibaca/dicuri lewat JavaScript sisi klien (mitigasi XSS) — mengurangi permukaan serangan dibanding menyimpan JWT di `localStorage`.
- Tidak butuh state management client (React Query/Zustand) untuk status login — status "sedang login atau tidak" sepenuhnya derived dari keberadaan cookie, dicek ulang tiap request server. Ini salah satu alasan proyek ini menyimpang dari konvensi umum React Query/Zustand yang disebut `CLAUDE.md` — lihat [frontend/state-management.md](../frontend/state-management.md).
- Client Component yang perlu memanggil backend **tanpa** lewat Server Action/Route Handler tidak bisa membaca cookie httpOnly ini secara langsung — harus lewat Server Action, seperti pola login Google (`google-login-button.tsx` men-trigger `googleLoginAction`, bukan memanggil backend langsung dari browser).
- Testing manual endpoint backend (`curl`/Postman) tidak otomatis "ikut login" walau browser sudah punya sesi aktif — perlu ambil token dari response `/api/auth/login` secara manual. Lihat [setup/troubleshooting.md](../setup/troubleshooting.md).

# Environment Variables

Jangan pernah commit `.env`/`.env.local` yang berisi kredensial asli — lihat `.gitignore` di masing-masing folder.

## Backend (`backend/.env`, contoh: `backend/.env.example`)

| Variabel | Wajib | Deskripsi |
|---|---|---|
| `PORT` | Tidak (default `5000`) | Port Express server |
| `DATABASE_URL` | Ya | Connection string PostgreSQL Supabase (**pooled**), dipakai `PrismaPg` adapter saat runtime (`src/database/connections/prisma_client.js`) |
| `DIRECT_URL` | Ya | Connection string PostgreSQL **langsung** (bukan pooled), dipakai Prisma CLI (`db push`/`generate`) lewat `prisma.config.js` |
| `DB_PASSWORD` | Tidak dipakai kode | Ada di `.env.example` untuk referensi ops (mis. login ke dashboard Supabase) — tidak dibaca `process.env` di manapun pada kode saat ini |
| `JWT_SECRET` | Ya (production) | Secret untuk **verifikasi** JWT lokal (token ditandatangani recording-ternak) — **harus sama persis** dengan `JWT_SECRET` recording-ternak. Ada fallback dev-only di kode (`fallback_secret_for_development`) — jangan andalkan di production |
| `RECORDING_TERNAK_API_URL` | Ya | Base URL backend recording-ternak — dipakai untuk proxy auth/user (`lib/recording-client.js`) sejak [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md) |
| `INTERNAL_API_KEY` | Ya | Secret bersama untuk komunikasi antar backend (header `x-internal-key`) — **harus sama persis** dengan `INTERNAL_API_KEY` recording-ternak |
| `GOOGLE_CLIENT_ID` *(backend, sudah tidak dipakai)* | Tidak | Verifikasi Google ID Token sekarang terjadi di recording-ternak, bukan di sini — variabel ini boleh dihapus dari `.env` backend. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` di frontend tetap dipakai (lihat di bawah), dan nilainya harus terdaftar sebagai `DASHBOARD_GOOGLE_CLIENT_ID` di recording-ternak |
| `GOOGLE_SECRET` | Tidak dipakai kode | Ada di `.env.example`, tapi flow login Google yang dipakai proyek ini murni verifikasi ID Token — Client Secret tidak diperlukan backend |
| `SUPABASE_EMAIL` | Tidak dipakai kode | Ada di `.env.example` untuk referensi ops — tidak dibaca `process.env` di manapun pada kode saat ini |
| `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` *(sudah tidak dipakai)* | Tidak | `prisma/seed.js` tidak lagi bootstrap akun `SUPERADMIN` di sini — akun SUPERADMIN dikelola di database recording-ternak (model `Admin`). Variabel ini boleh dihapus |
| `BERITA_ACARA_TEMPLATE_NAME` | Tidak (default `berita-acara-kematian.docx`) | Override nama file template DOCX berita acara kematian di `src/templates/` |
| `AKTA_KELAHIRAN_TEMPLATE_NAME` | Tidak (default `akta-kelahiran.docx`) | Override nama file template DOCX akta kelahiran di `src/templates/` |
| `NODE_ENV` | Tidak | `production` mengubah strategi instansiasi Prisma Client (tanpa `global` caching) — lihat `src/database/connections/prisma_client.js` |

## Frontend (`frontend/.env.local`, contoh: `frontend/.env.example`)

| Variabel | Wajib | Deskripsi |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Ya | Base URL backend API, mis. `http://localhost:5000/api`. Dipakai `src/lib/axios.ts` dan `src/lib/api-server.ts` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Tidak | Client ID Google OAuth untuk tombol `GoogleLogin`. Kalau kosong, tombol login Google otomatis disembunyikan dan diganti pesan "Login Google belum dikonfigurasi." (`features/auth/components/google-login-button.tsx`) — login email/password tetap berfungsi |

`NEXT_PUBLIC_*` ter-inline ke bundle JS saat build — jangan pernah taruh secret di variabel berawalan ini.

## Mendapatkan nilai kredensial

- **Supabase (`DATABASE_URL`/`DIRECT_URL`)** — Project Settings → Database → Connection string di dashboard Supabase. Gunakan connection string mode *Transaction* (pooled, port `6543`) untuk `DATABASE_URL`, dan mode *Session*/direct (port `5432`) untuk `DIRECT_URL`.
- **Google OAuth (`GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)** — sama-sama nilai *Client ID* dari OAuth Client di Google Cloud Console (bukan Client Secret). Lihat skill `login-with-google` untuk langkah setup lengkap.
- **`JWT_SECRET`** — string acak panjang, bebas dibuat sendiri (mis. `openssl rand -hex 32`).

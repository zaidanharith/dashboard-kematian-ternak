# Environment Variables

Jangan pernah commit `.env`/`.env.local` yang berisi kredensial asli — lihat `.gitignore` di masing-masing folder.

## Backend (`backend/.env`, contoh: `backend/.env.example`)

| Variabel | Wajib | Deskripsi |
|---|---|---|
| `PORT` | Tidak (default `5000`) | Port Express server |
| `DATABASE_URL` | Ya | Connection string PostgreSQL Supabase (**pooled**), dipakai `PrismaPg` adapter saat runtime (`src/database/connections/prisma_client.js`) |
| `DIRECT_URL` | Ya | Connection string PostgreSQL **langsung** (bukan pooled), dipakai Prisma CLI (`db push`/`generate`) lewat `prisma.config.js` |
| `DB_PASSWORD` | Tidak dipakai kode | Ada di `.env.example` untuk referensi ops (mis. login ke dashboard Supabase) — tidak dibaca `process.env` di manapun pada kode saat ini |
| `JWT_SECRET` | Ya (production) | Secret untuk menandatangani JWT. Ada fallback dev-only di kode (`fallback_secret_for_development`) — **jangan andalkan di production** |
| `GOOGLE_CLIENT_ID` | Ya (untuk login Google) | Dipakai backend sebagai `audience` saat memverifikasi ID Token (`google-auth-library`) |
| `GOOGLE_SECRET` | Tidak dipakai kode | Ada di `.env.example`, tapi flow login Google yang dipakai proyek ini murni verifikasi ID Token — Client Secret tidak diperlukan backend |
| `SUPABASE_EMAIL` | Tidak dipakai kode | Ada di `.env.example` untuk referensi ops — tidak dibaca `process.env` di manapun pada kode saat ini |
| `SUPERADMIN_EMAIL` | Ya (untuk seed) | Dipakai `prisma/seed.js` untuk bootstrap akun `SUPERADMIN` pertama |
| `SUPERADMIN_PASSWORD` | Ya (untuk seed) | Password akun `SUPERADMIN` pertama (di-hash sebelum disimpan) |
| `BERITA_ACARA_TEMPLATE_NAME` | Tidak (default `berita-acara-kematian.docx`) | Override nama file template DOCX berita acara kematian di `src/templates/` |
| `AKTA_KELAHIRAN_TEMPLATE_NAME` | Tidak (default `akta-kelahiran.docx`) | Override nama file template DOCX akta kelahiran di `src/templates/` — **file default belum tersedia di repo**, lihat [troubleshooting.md](./troubleshooting.md) |
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

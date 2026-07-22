# Dashboard Kematian Ternak — Desa Besuki

Website untuk pencatatan kematian dan kelahiran hewan ternak di tingkat desa, dikembangkan untuk BUMDes Sumber Abadi Unit Ketahanan Pangan, Desa Besuki. Aplikasi ini menggantikan pencatatan manual dengan sistem terpusat: setiap laporan kematian/kelahiran ternak tercatat rapi, dokumen resmi (berita acara & akta) di-generate otomatis, dan pengelola desa punya gambaran statistik yang jelas tanpa perlu merekap manual.

## Fitur

- **Pencatatan laporan kematian ternak** — catat ternak yang mati, peternak pemilik, tanggal, dan penyebab kematian. Status ternak otomatis berubah menjadi `MATI`.
- **Pencatatan laporan kelahiran ternak** — daftarkan ternak baru sekaligus laporan kelahirannya dalam satu alur.
- **Generate dokumen otomatis** — Berita Acara Kematian dan Akta Kelahiran Ternak dibuat otomatis dari data laporan, tersedia dalam format `.docx` (dari template) maupun `.pdf`, siap diunduh.
- **Data peternak & ternak** — daftar peternak beserta ternak yang dimiliki masing-masing, lengkap dengan alamat terstruktur (desa/dusun/RT/RW).
- **Analisis penyebab kematian** — rekap & ranking penyebab kematian paling sering terjadi, dengan breakdown per jenis ternak, bisa difilter rentang tanggal.
- **Analisis populasi wilayah** — statistik populasi ternak, kelahiran, kematian, dan pertumbuhan bersih per dusun/RT/RW.
- **Dashboard ringkasan** — landing page setelah login: total laporan, populasi ternak hidup/mati, tren 12 bulan terakhir, penyebab kematian dominan, laporan terbaru.
- **Autentikasi & role** — login email/password atau Google OAuth, tiga role (`SUPERADMIN`, `ADMIN`, `PETUGAS`) dengan hak akses berbeda; tidak ada registrasi publik.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Express.js 5 |
| Database | PostgreSQL (Supabase) via Prisma ORM (`@prisma/client` 7) |
| Autentikasi | JWT + Google OAuth (`google-auth-library`) |
| Generate dokumen | `docxtemplater` (DOCX dari template) + `pdfkit` (PDF) |
| Testing | Jest + Supertest (backend) |

## Struktur Proyek

```text
frontend/   Next.js App Router — UI, Server Actions, layer service ke API backend
backend/    Express.js REST API — controller, Prisma, generate dokumen
docs/       Dokumentasi lengkap (arsitektur, API, setup, konvensi) — lihat di bawah
```

Struktur detail tiap folder: [docs/architecture/folder-structure.md](./docs/architecture/folder-structure.md).

## Menjalankan Proyek

Prasyarat: Node.js, npm, project Supabase (PostgreSQL) aktif. Google OAuth Client ID opsional (login email/password tetap berfungsi tanpanya).

```bash
# 1. install dependency di root, frontend, dan backend
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# 2. isi environment variable
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# lalu edit backend/.env dan frontend/.env.local — lihat docs/setup/environment.md

# 3. sinkronkan schema & seed data referensi + akun SUPERADMIN pertama
cd backend
npx prisma db push
npm run db:seed
cd ..

# 4. jalankan frontend + backend sekaligus
npm run dev
```

Frontend berjalan di `http://localhost:3000`, backend di `http://localhost:5000` (bisa diubah lewat `PORT`). Panduan instalasi lengkap: [docs/setup/installation.md](./docs/setup/installation.md).

## Dokumentasi

Dokumentasi lengkap ada di [`docs/`](./docs):

- **Arsitektur** — [system design](./docs/architecture/system-design.md), [struktur folder](./docs/architecture/folder-structure.md), [skema database](./docs/architecture/database-schema.md), [alur API](./docs/architecture/api-flow.md)
- **API** — referensi endpoint per resource: [autentikasi](./docs/api/authentication.md), [users](./docs/api/users.md), [peternak](./docs/api/peternak.md), [ternak](./docs/api/ternak.md), [jenis ternak](./docs/api/jenis-ternak.md), [penyebab kematian](./docs/api/penyebab-kematian.md), [laporan kematian](./docs/api/laporan-kematian.md), [laporan kelahiran](./docs/api/laporan-kelahiran.md), [dashboard](./docs/api/dashboard.md), [analisis](./docs/api/analisis.md), [format error](./docs/api/error-response.md)
- **Setup** — [instalasi](./docs/setup/installation.md), [environment variables](./docs/setup/environment.md), [deployment](./docs/setup/deployment.md), [troubleshooting](./docs/setup/troubleshooting.md)
- **Frontend** — [design system](./docs/frontend/design-system.md), [komponen](./docs/frontend/components.md), [routing](./docs/frontend/routing.md), [state management](./docs/frontend/state-management.md)
- **Backend** — [coding standards](./docs/backend/coding-standards.md), [validasi](./docs/backend/validation.md), [autentikasi](./docs/backend/authentication.md), [logging](./docs/backend/logging.md)
- **Database** — [konvensi Prisma](./docs/database/prisma.md), [migrasi](./docs/database/migration.md), [seed](./docs/database/seed.md)
- **Keputusan teknis (ADR)** — lihat [`docs/decisions/`](./docs/decisions)
- **Changelog** — [`docs/changelog.md`](./docs/changelog.md)

Konvensi kontribusi kode (penamaan, pola akses database, dsb.) ada di [`CLAUDE.md`](./CLAUDE.md).

## Testing

```bash
cd backend
npm test
```

Belum ada test framework dikonfigurasi untuk frontend.

## Lisensi

MIT — lihat [LICENSE](./LICENSE).

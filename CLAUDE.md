# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

- **Name**: Dashboard Kematian Hewan Ternak Desa Besuki
- **Purpose**: Website untuk melakukan pencatatan kematian hewan ternak di tingkat desa.

### Fitur aplikasi

- **Pencatatan laporan kematian ternak** — input data laporan kematian: ternak yang mati, peternak pemilik, tanggal, dan penyebab kematian.
- **Generate berita acara otomatis** — setiap ada laporan kematian, sistem mengisi template Microsoft Word berita acara kematian secara otomatis dari data laporan (template Word sudah tersedia), lalu dokumen bisa diunduh.
- **Data peternak & ternak** — halaman untuk melihat daftar peternak beserta ternak yang dimiliki masing-masing peternak.
- **Analisis penyebab kematian** — rekap/statistik penyebab kematian yang paling sering terjadi, berdasarkan data penyebab yang dicatat di setiap laporan.
- **Dashboard ringkasan** — halaman utama berisi ringkasan informasi penting (mis. jumlah laporan, tren kematian, penyebab dominan) sebagai landing page setelah login.
- **Autentikasi** — JWT session, dengan dua cara login: Google OAuth (`POST /api/auth/google`) dan email/password manual (`POST /api/auth/login`). Tidak ada registrasi publik — akun baru (role `ADMIN`/`PETUGAS`) hanya bisa didaftarkan oleh `SUPERADMIN` lewat `POST /api/users`. Tiga role: `SUPERADMIN` (kelola akun + semua akses `ADMIN`), `ADMIN` (kelola master data & hapus laporan), `PETUGAS` (pencatatan harian). Lihat `frontend/src/lib/axios.ts` untuk instance Axios sisi frontend — integrasi frontend ke endpoint ini belum dikerjakan.

## Tech stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Express.js 5
- **Database**: PostgreSQL via Prisma (`@prisma/client` v7), di-host di Supabase
- **Auth**: JWT, Google OAuth
- **Infra / hosting**: Vercel

## Repository structure

```text
backend/
  prisma/
    schema.prisma            -- User, Peternak, Ternak, JenisTernak, PenyebabKematian, LaporanKematian
    seed.js                   -- seed data referensi (jenis ternak, penyebab kematian) + bootstrap akun SUPERADMIN
  prisma.config.js            -- config koneksi Prisma 7 (datasource dipindah keluar dari schema.prisma)
  src/
    controllers/             -- 1 file per resource, akses Prisma langsung untuk CRUD sederhana
    database/connections/     -- prisma_client.js (singleton Prisma client, pakai driver adapter @prisma/adapter-pg)
    middlewares/              -- auth.middleware.js (JWT), role.middleware.js (role gate)
    routes/                   -- 1 file per resource + api.js sebagai aggregator/self-doc endpoint
    services/                 -- berita-acara.service.js (generate docx & pdf)
    templates/                -- berita-acara-kematian.docx (template docxtemplater)
    __tests__/                -- Jest, mirroring src/ (controllers, middlewares, services, integration)
    app.js                    -- Express app (tanpa .listen(), dipakai Supertest)
    server.js                 -- entrypoint, load .env lalu app.listen()
frontend/
  src/
    app/                     -- Next.js App Router (layout.tsx, page.tsx)
    components/              -- kosong, siapkan components/ui & components/common
    features/                -- kosong, organisasi per fitur (lihat konvensi di bawah)
    hooks/                   -- kosong
    lib/axios.ts             -- instance Axios (baseURL dari NEXT_PUBLIC_API_URL)
    services/                -- kosong, siapkan *.service.ts per domain
    stores/                  -- kosong, untuk Zustand store
    styles/                  -- kosong
    types/                   -- kosong
    utils/                   -- kosong
docs/                        -- kosong, belum ada dokumentasi
```

Backend sudah mengikuti pola dari skill `backend-expressjs-conventions`: controller boleh query Prisma langsung untuk CRUD biasa; layer `services/` hanya dipakai untuk logic non-trivial (generate dokumen), bukan untuk setiap resource.

## Commands

Dijalankan dari root, install dependencies di root, `frontend/`, dan `backend/` masing-masing sebelum menjalankan apa pun.

### Root

- `npm run dev` — menjalankan frontend dan backend bersamaan (via `concurrently`).

### Frontend (`frontend/`)

- `npm run dev` — menjalankan Next.js dev server.
- `npm run build` — build produksi Next.js.
- `npm run start` — menjalankan build produksi.
- `npm run lint` — menjalankan ESLint (`eslint.config.mjs`).

### Backend (`backend/`)

- `npm run dev` — menjalankan Express server dengan `nodemon` (auto-restart).
- `npm run start` — menjalankan Express server dengan Node biasa.
- `npm test` — menjalankan test suite (Jest).
- `npm run db:seed` — menjalankan `prisma/seed.js` (data referensi + bootstrap akun SUPERADMIN dari `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD`).
- Schema masih pakai `npx prisma db push` (belum `migrate dev`) karena schema di tahap awal dan masih 1 environment dev — lihat skill `prisma` untuk kapan harus pindah ke `migrate dev`.
- Prisma 7: koneksi database **tidak** lagi diisi lewat `datasource.url` di `schema.prisma` — diatur di `prisma.config.js` (dipakai CLI untuk `db push`/`generate`) dan lewat driver adapter `@prisma/adapter-pg` di `prisma_client.js` (dipakai runtime app).

## Architecture & conventions

- **Routing**:
  - Frontend menggunakan **Next.js App Router** (`app/`), bukan Pages Router.
  - Backend menggunakan **REST API** dengan Express.js.
  - Semua import menggunakan path alias (`@/*`) daripada relative import (`../../../`).
  - Gunakan nested route App Router sesuai struktur fitur.
  - Pisahkan route frontend dan endpoint API dengan jelas.

- **State management**:
  - Gunakan **React Query (TanStack Query)** untuk server state (fetching, caching, mutation).
  - Gunakan **Zustand** untuk global client state.
  - Hindari Context API untuk state kompleks.
  - Gunakan local state (`useState`) untuk state yang hanya dipakai oleh satu komponen.

- **API layer pattern**:
  - Semua request HTTP menggunakan **Axios**.
  - Jangan memanggil Axios langsung dari komponen.
  - Struktur frontend:

    ```text
    services/
      api.ts          // axios instance
      auth.service.ts
      user.service.ts
    ```

  - Struktur backend:

    ```text
    routes/
    controllers/
    services/       // hanya untuk logic non-trivial, bukan wajib per resource
    middlewares/
    ```

  - Controller boleh mengakses Prisma langsung untuk CRUD sederhana (lihat "Database access pattern" di bawah) — ini bukan pelanggaran konvensi di proyek ini, beda dari pola repository-wajib yang umum di boilerplate lain.
  - Repository hanya ditambahkan kalau ada kebutuhan caching/fallback nyata.

- **Component conventions**:
  - Gunakan **shadcn/ui** sebagai komponen dasar.
  - Gunakan **react-icons** untuk seluruh icon.
  - Organisasikan komponen berdasarkan fitur, bukan berdasarkan tipe.

    ```text
    features/
      auth/
        components/
        hooks/
        services/
        types/
    ```

  - Komponen reusable berada di:

    ```text
    components/ui
    components/common
    ```

  - Satu komponen satu file.
  - Hindari file dengan lebih dari satu komponen besar.

- **Database access pattern** (backend, mengikuti skill `backend-expressjs-conventions`):
  - Gunakan **Prisma ORM**, satu instance Prisma Client (`src/database/connections/prisma_client.js`) — jangan `new PrismaClient()` langsung di file lain.
  - Controller boleh query Prisma langsung untuk CRUD sederhana — **tidak wajib** lewat Repository. Repository hanya dipakai kalau ada kebutuhan caching/fallback nyata (belum ada kasus ini di backend saat ini).
  - Perubahan schema saat ini pakai `prisma db push` (tahap awal/prototyping); pindah ke `prisma migrate dev` setelah schema stabil atau ada lebih dari 1 environment — lihat skill `prisma`.

- **Naming conventions**:
  - File komponen: `user-card.tsx`, `login-form.tsx`
  - Hooks: `use-auth.ts`, `use-user.ts`
  - Service: `auth.service.ts`
  - Repository: `user.repository.ts`
  - Controller: `auth.controller.ts`
  - Variables & functions menggunakan `camelCase`.
  - Component, Interface, Type menggunakan `PascalCase`.
  - Constants menggunakan `UPPER_SNAKE_CASE`.

## Environment & config

- **Backend** (`backend/.env`, lihat `backend/.env.example`):
  - `PORT` — port Express server (default `5000`).
  - `DATABASE_URL` — connection string PostgreSQL (Supabase, pooled), dipakai `PrismaPg` adapter saat runtime.
  - `DIRECT_URL` — connection string PostgreSQL langsung, dipakai Prisma CLI (`db push`/`generate`) lewat `prisma.config.js`.
  - `JWT_SECRET` — secret untuk signing JWT (fallback dev-only ada di kode, jangan andalkan di production).
  - `GOOGLE_CLIENT_ID` / `GOOGLE_SECRET` — kredensial Google OAuth (Client Secret tidak dipakai backend untuk flow ID-token ini, hanya Client ID untuk verifikasi audience).
  - `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` — dipakai `prisma/seed.js` untuk bootstrap akun SUPERADMIN pertama.
- **Frontend** (`frontend/.env.local`, lihat `frontend/.env.example`):
  - `NEXT_PUBLIC_API_URL` — base URL API backend, dipakai oleh `src/lib/axios.ts`.
- **Local setup**:
  1. `npm install` di root, `frontend/`, dan `backend/`.
  2. Isi `backend/.env` dan `frontend/.env.local` dari masing-masing `.env.example`.
  3. `npm run dev` dari root untuk menjalankan frontend + backend sekaligus.

## Testing

- Backend: Jest, dikonfigurasi lewat `backend/jest.config.js`, jalankan dengan `npm test` dari `backend/`. Test tersebar di `backend/src/__tests__/` mirroring `src/` (controllers, middlewares, services, plus 1 integration test Supertest untuk endpoint publik). Belum ada integration test yang menyentuh database asli — belum ada test database terpisah, jangan arahkan test ke Supabase project yang sama.
- Frontend: belum ada test framework dikonfigurasi.
- Saat menambahkan test baru, ikuti skill `testing` untuk konvensi Jest/React Testing Library (frontend) dan konvensi backend Express + Prisma.

## Notes for future work

- Backend (auth, CRUD Peternak/Ternak/JenisTernak/PenyebabKematian/LaporanKematian, generate berita acara docx & PDF, role SUPERADMIN/ADMIN/PETUGAS) sudah diimplementasikan — lihat `backend/src/controllers/`, `backend/src/routes/`, `backend/src/services/berita-acara.service.js`.
- Analisis penyebab kematian & dashboard ringkasan (fitur di atas) belum ada endpoint agregasinya di backend.
- `frontend/src/features`, `components`, `services`, `stores`, `types` masih kosong — belum ada fitur yang diimplementasikan di UI, termasuk integrasi ke endpoint auth/CRUD backend yang sudah ada.
- `docs/` masih kosong.
- Backend belum ada endpoint ganti password sendiri untuk user (hanya SUPERADMIN yang set password awal saat registrasi).

## Things NOT to do

- Jangan gunakan Pages Router (`pages/`) di frontend — proyek ini App Router (`app/`) saja.
- Jangan panggil Axios langsung dari komponen React — selalu lewat `services/*.service.ts`.
- Jangan paksa buat Repository untuk setiap query Prisma di backend — controller boleh akses Prisma langsung untuk CRUD sederhana (lihat "Database access pattern" di atas).
- Jangan buka endpoint registrasi akun publik — pembuatan akun (`ADMIN`/`PETUGAS`) hanya lewat `POST /api/users` yang dibatasi role `SUPERADMIN`.
- Jangan commit file `.env` / `.env.local` yang berisi kredensial asli (`DATABASE_URL`, `JWT_SECRET`, `SUPERADMIN_PASSWORD`, dll.).

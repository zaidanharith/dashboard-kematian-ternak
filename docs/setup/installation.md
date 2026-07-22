# Installation

## Prasyarat

- Node.js (versi LTS terbaru direkomendasikan) dan npm.
- Akses ke sebuah project [Supabase](https://supabase.com) (PostgreSQL) — untuk `DATABASE_URL`/`DIRECT_URL`.
- (Opsional) Google Cloud OAuth Client ID — hanya dibutuhkan jika ingin mengaktifkan tombol "Login dengan Google". Tanpa ini, login email/password tetap berfungsi penuh.

## Langkah instalasi

Install dependency di root, `frontend/`, dan `backend/` — masing-masing punya `package.json` sendiri:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

`backend/package.json` punya script `postinstall: prisma generate`, jadi Prisma Client otomatis ter-generate setelah `npm install` di `backend/`.

## Konfigurasi environment

Salin file contoh env dan isi nilainya — lihat [environment.md](./environment.md) untuk penjelasan tiap variabel:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## Sinkronkan schema & seed data referensi

Dari `backend/`:

```bash
npx prisma db push
npm run db:seed
```

`db push` membuat tabel di database sesuai `prisma/schema.prisma` (proyek masih di tahap awal, belum pakai `prisma migrate dev` — lihat [database/migration.md](../database/migration.md)). `db:seed` mengisi data referensi (`JenisTernak`, `PenyebabKematian`) dan membuat akun `SUPERADMIN` pertama dari `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` di `backend/.env`.

## Jalankan aplikasi

Dari root, menjalankan frontend (port `3000`) dan backend (port dari `PORT`, default `5000`) sekaligus lewat `concurrently`:

```bash
npm run dev
```

Atau jalankan terpisah bila perlu:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Buka `http://localhost:3000` — akan redirect ke `/login` (lihat `frontend/src/proxy.ts`). Login dengan akun `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` yang di-seed tadi.

## Verifikasi backend berjalan

```bash
curl http://localhost:5000/api/
```

Membalas daftar seluruh endpoint yang tersedia (`backend/src/routes/api.js` berfungsi sebagai dokumentasi endpoint self-serve).

## Menjalankan test backend

```bash
cd backend
npm test
```

Lihat [../../backend/src/__tests__/](../../backend/src/__tests__/) untuk cakupan test (controllers, middlewares, services, satu integration test Supertest). Belum ada test framework dikonfigurasi untuk frontend.

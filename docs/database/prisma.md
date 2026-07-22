# Prisma Conventions

## Versi & setup khusus Prisma 7

Proyek ini memakai **Prisma 7**, yang mengubah cara koneksi database dikonfigurasi dibanding versi sebelumnya:

- `schema.prisma` **tidak lagi** berisi `datasource.url` — hanya `provider = "postgresql"`.
- Koneksi untuk **Prisma CLI** (`db push`, `generate`, migrasi) diatur di `backend/prisma.config.js` lewat `DIRECT_URL`.
- Koneksi untuk **runtime aplikasi** diatur lewat driver adapter `@prisma/adapter-pg` (`PrismaPg`) di `backend/src/database/connections/prisma_client.js`, memakai `DATABASE_URL` (pooled, cocok untuk Supabase connection pooler).

Lihat [decisions/adr-003](../decisions/adr-003-prisma7-driver-adapter-config-split.md) untuk alasan pemisahan ini.

## Satu instance Prisma Client

Selalu import singleton dari `backend/src/database/connections/prisma_client.js` — **jangan** `new PrismaClient()` di file lain:

```javascript
const prisma = require('../database/connections/prisma_client');
```

Di development, instance di-cache ke `global.prisma` supaya hot-reload (`nodemon`) tidak membuka koneksi baru berkali-kali. Di `NODE_ENV=production`, instance dibuat langsung tanpa caching global.

## Akses Prisma langsung dari controller

Controller boleh memanggil `prisma.<model>.findMany/create/update/delete` langsung untuk CRUD sederhana — **tidak wajib** lewat layer Repository. Ini konvensi sadar proyek ini (lihat `CLAUDE.md` dan skill `backend-expressjs-conventions`), bukan pelanggaran best practice umum. Layer `services/` hanya dipakai untuk logic non-trivial yang bukan query-per-resource (mis. generate dokumen DOCX/PDF).

Repository baru ditambahkan kalau ada kebutuhan caching/fallback nyata — belum ada kasus ini di backend saat ini.

## Pola query yang dipakai

- **Filter opsional**: pola `field: value || undefined` supaya Prisma mengabaikan filter kalau query param tidak dikirim (lihat `getAllTernak`, `getAllLaporanKematian`).
- **Search case-insensitive**: `{ contains: search, mode: 'insensitive' }` (lihat `getAllPeternak`).
- **Include berlapis** untuk data relasi yang selalu dibutuhkan di response (mis. `laporanInclude` di controller laporan kematian/kelahiran — didefinisikan sekali di atas file, dipakai ulang di semua handler).
- **Transaksi** (`prisma.$transaction([...])` bentuk array, atau `prisma.$transaction(async (tx) => {...})` bentuk interaktif) dipakai setiap kali sebuah operasi harus mengubah lebih dari satu tabel secara atomik — mis. buat laporan kematian sekaligus ubah status ternak. Lihat [architecture/api-flow.md](../architecture/api-flow.md).
- **Error handling kode Prisma**: setiap controller menangkap `error.code` secara eksplisit untuk kasus yang relevan (`P2002` unique constraint, `P2025` not found, `P2003` foreign key) dan menerjemahkannya ke pesan Bahasa Indonesia yang siap ditampilkan — lihat [api/error-response.md](../api/error-response.md).

## Kapan pindah dari `db push` ke `migrate dev`

Schema saat ini masih pakai `npx prisma db push` (bukan `prisma migrate dev`) karena masih tahap awal/prototyping dengan satu environment dev. Pindah ke `migrate dev` (dengan riwayat migrasi tersimpan di `prisma/migrations/`) direkomendasikan setelah schema stabil atau begitu ada lebih dari satu environment (staging/production) — lihat skill `prisma` dan [migration.md](./migration.md).

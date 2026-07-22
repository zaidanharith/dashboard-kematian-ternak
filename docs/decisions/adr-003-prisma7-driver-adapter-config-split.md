# ADR-003: Konfigurasi Koneksi Database Dipisah dari `schema.prisma` (Prisma 7)

## Status

Accepted

## Context

Proyek memakai Prisma Client 7 dan database PostgreSQL yang di-hosting di Supabase. Supabase menyediakan dua jenis connection string: pooled (lewat PgBouncer, cocok untuk banyak koneksi pendek dari aplikasi serverless/runtime) dan direct (cocok untuk operasi DDL seperti migrasi/`db push` yang butuh koneksi session penuh). Prisma 7 juga mengubah cara datasource dikonfigurasi — `datasource.url` di `schema.prisma` tidak lagi menjadi satu-satunya cara mengatur koneksi saat memakai driver adapter.

## Decision

Dua jalur konfigurasi terpisah dipakai:

- **Runtime aplikasi**: `backend/src/database/connections/prisma_client.js` membuat `PrismaClient` dengan driver adapter `PrismaPg` (`@prisma/adapter-pg`), memakai `DATABASE_URL` (connection string **pooled**).
- **Prisma CLI** (`db push`, `generate`, migrasi ke depannya): `backend/prisma.config.js` (`defineConfig` dari `prisma/config`) menunjuk ke `DIRECT_URL` (connection string **direct**, non-pooled).

`schema.prisma` sendiri hanya berisi `provider = "postgresql"`, tanpa `url`.

## Consequences

- Butuh dua environment variable koneksi database (`DATABASE_URL` dan `DIRECT_URL`) yang harus diisi dengan benar dan tidak tertukar — lihat [setup/environment.md](../setup/environment.md) dan [setup/troubleshooting.md](../setup/troubleshooting.md).
- Operasi CLI (migrasi/schema push) tidak terpengaruh oleh connection pooling limits Supabase, sementara runtime aplikasi tetap efisien memakai pooler untuk banyak request bersamaan.
- Menambah satu titik konfigurasi baru (`prisma.config.js`) yang perlu diketahui kontributor baru — tidak lagi cukup baca `schema.prisma` saja untuk memahami ke mana Prisma terhubung.

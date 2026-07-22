# Deployment

`CLAUDE.md` mencatat Vercel sebagai target infra proyek ini, tapi **belum ada file konfigurasi deployment** (`vercel.json`, workflow CI/CD, dsb.) di repo saat ini. Bagian ini menjelaskan cara masing-masing bagian proyek *bisa* di-deploy sesuai stack-nya, bukan langkah yang sudah otomatis berjalan.

## Frontend (Next.js)

Next.js App Router native didukung Vercel (build command `next build`, output `.next/`) — deploy lewat *Import Project* di dashboard Vercel atau `vercel deploy` dari `frontend/`. Environment variables yang wajib diisi di Vercel Project Settings: lihat tabel Frontend di [environment.md](./environment.md).

## Backend (Express.js)

Backend adalah long-running Express server (`app.listen()` di `src/server.js`), bukan serverless function — deploy ke Vercel butuh adaptasi (Vercel serverless function per-request) atau host di layanan yang mendukung Node process persisten (Railway, Render, Fly.io, VPS, dsb.). Environment variables yang wajib diisi: lihat tabel Backend di [environment.md](./environment.md).

Hal yang perlu diperhatikan saat deploy backend ke lingkungan manapun:

- `NODE_ENV=production` harus di-set agar Prisma Client tidak memakai strategi caching `global.prisma` yang dipakai untuk dev (`src/database/connections/prisma_client.js`).
- `JWT_SECRET` **wajib** diisi eksplisit di production — fallback di kode hanya untuk development.
- `postinstall: prisma generate` di `package.json` otomatis jalan saat `npm install` di platform manapun yang menjalankan install step standar.
- File template `.docx` (`src/templates/`) harus ikut ter-deploy sebagai bagian dari source, bukan asset yang di-generate saat build.

## Database (Supabase)

Sudah ter-hosting di Supabase — tidak perlu langkah deploy tambahan, cukup pastikan `DATABASE_URL`/`DIRECT_URL` di environment production menunjuk ke project Supabase yang benar (bukan project dev), dan schema sudah disinkronkan lewat `npx prisma db push` (lihat [database/migration.md](../database/migration.md) soal kapan harus pindah ke `prisma migrate deploy`).

## CI/CD

Belum ada workflow CI/CD (`.github/workflows/`) di repo ini. Jika ditambahkan, minimal jalankan `npm test` di `backend/` dan `npm run lint`/`npm run build` di `frontend/` sebelum merge — lihat skill `github-actions`.

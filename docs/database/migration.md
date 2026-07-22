# Migration

## Status saat ini: `db push`, bukan `migrate dev`

Proyek ini **belum** memakai `prisma migrate dev` — tidak ada folder `backend/prisma/migrations/` di repo. Perubahan schema saat ini diterapkan langsung ke database lewat:

```bash
cd backend
npx prisma db push
```

Command ini menyinkronkan struktur tabel di database (`DIRECT_URL`, lihat `prisma.config.js`) agar sesuai `prisma/schema.prisma`, **tanpa** menyimpan riwayat migrasi. Cocok untuk tahap awal/prototyping dengan satu environment dev — sesuai catatan di `CLAUDE.md`.

## Kapan pindah ke `migrate dev`

Pindah begitu salah satu kondisi ini terpenuhi:

- Schema sudah dianggap stabil (perubahan besar sudah jarang terjadi).
- Sudah ada lebih dari satu environment (mis. staging dan production terpisah dari dev), sehingga perubahan schema perlu bisa direplay secara konsisten dan terlacak lewat `prisma migrate deploy`.

Setelah pindah, alur kerja berubah menjadi:

```bash
npx prisma migrate dev --name <deskripsi_perubahan>
```

untuk development (membuat file migrasi + apply ke DB dev), dan:

```bash
npx prisma migrate deploy
```

untuk apply migrasi yang sudah ada ke staging/production (tanpa membuat migrasi baru).

Lihat skill `prisma` untuk panduan lengkap transisi `db push` → `migrate dev`, termasuk cara membuat migrasi baseline dari schema yang sudah ada di database (`prisma migrate resolve --applied`).

## Catatan penting

- Karena belum ada riwayat migrasi, **tidak ada cara otomatis** untuk mereplikasi schema database production dari nol selain menjalankan `prisma db push` terhadap schema versi tersebut, atau membuat migrasi baseline begitu proyek pindah ke `migrate dev`.
- Perubahan schema yang breaking (mis. mengubah tipe kolom, menghapus kolom yang sudah berisi data) harus dikoordinasikan manual — `db push` tidak punya mekanisme prompt konfirmasi data-loss seketat `migrate dev`.

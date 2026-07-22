# Seed

Script: `backend/prisma/seed.js`. Dijalankan lewat:

```bash
cd backend
npm run db:seed
```

## Apa yang di-seed

1. **Data referensi jenis ternak** (`JenisTernak`) — menghapus semua data lama (`deleteMany`) lalu membuat ulang: Sapi, Kambing, Domba, Kerbau, Ayam, Bebek.
2. **Data referensi penyebab kematian** (`PenyebabKematian`) — sama polanya: hapus semua, buat ulang: Penyakit, Kecelakaan, Usia Tua, Keracunan, Cuaca Ekstrem, Tidak Diketahui.
3. **Akun `SUPERADMIN` pertama** — hanya jika `SUPERADMIN_EMAIL` dan `SUPERADMIN_PASSWORD` terisi di `backend/.env`. Dipakai `prisma.user.upsert()` (bukan `deleteMany`+`create`), jadi aman dijalankan berkali-kali tanpa membuat duplikat atau menghapus akun lain yang sudah ada.

## Perilaku destruktif — perhatikan sebelum menjalankan di database yang sudah berisi data

`jenisTernak.deleteMany({})` dan `penyebabKematian.deleteMany({})` menghapus **seluruh** data di dua tabel itu sebelum mengisi ulang. Karena `Ternak.jenisTernak` dan `LaporanKematian.penyebabKematian` bersifat `Restrict` (lihat [architecture/database-schema.md](../architecture/database-schema.md)), `deleteMany` ini akan **gagal** kalau ada `Ternak`/`LaporanKematian` yang sudah memakai data referensi tersebut — jadi seed script pada praktiknya hanya aman dijalankan di database yang benar-benar kosong (setup awal), bukan untuk "reset data referensi" di database yang sudah dipakai.

## Kapan menjalankan

- **Setup awal** development/environment baru, setelah `prisma db push` — lihat [setup/installation.md](../setup/installation.md).
- **Bootstrap ulang akun SUPERADMIN** — aman dijalankan ulang kapan saja karena bagian ini pakai `upsert`, meskipun bagian data referensi di atasnya bisa gagal jika tabel referensi sudah dipakai (lihat catatan di atas). Untuk hanya bootstrap SUPERADMIN tanpa risiko itu, jalankan query `upsert` yang sama secara manual, bukan seluruh script.

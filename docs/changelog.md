# Changelog

Ringkasan perubahan penting per commit signifikan, terbaru di atas. Ditulis dari riwayat `git log` yang sudah ada di repo — bukan setiap commit, hanya yang mengubah kontrak/fitur.

## 2026-09-14 — Integrasi dengan recording-ternak

- **Breaking**: tabel `users` dihapus dari database ini. `/api/auth/*` dan `/api/users/*` sekarang proxy ke recording-ternak (`RECORDING_TERNAK_API_URL`, `INTERNAL_API_KEY`). Role `PETUGAS` dipetakan ke `ADMIN` saat migrasi.
- `Peternak.nik` jadi nullable; sinkron dua arah dengan `Farmer` milik recording-ternak lewat endpoint baru `/internal/peternak/:id` (dan sebaliknya `/internal/farmers/:id` di recording-ternak).
- `Ternak.jenisKelamin`/`tanggalLahir` jadi nullable; endpoint baru `POST /api/ternak/provision` (upsert by `kodeTernak`) untuk mendukung ternak yang di-provision dari recording-ternak. `POST /api/laporan-kematian` sekarang menolak request kalau kedua field itu masih kosong.
- `LaporanKematian.petugas`/`LaporanKelahiran.petugas` bukan lagi relasi Prisma (user ada di database lain) — `LaporanKelahiran` dapat kolom `petugasNama` baru sebagai snapshot.
- Menambahkan `backend/src/templates/akta-kelahiran.docx` yang sebelumnya belum ada — `format=docx` untuk akta kelahiran sekarang berfungsi.
- Lihat [ADR-005](decisions/adr-005-integration-with-recording-ternak.md), [`api/internal.md`](api/internal.md).

## 2026-07-22 — Pencatatan kelahiran, alamat terstruktur, statistik populasi

- Tambah model `LaporanKelahiran` dan flow pencatatan kelahiran ternak baru (`POST /api/laporan-kelahiran` membuat `Ternak` + `LaporanKelahiran` sekaligus).
- Tambah generate dokumen Akta Kelahiran (`GET /api/laporan-kelahiran/:id/akta`, format `docx`/`pdf`) — lihat [api/laporan-kelahiran.md](./api/laporan-kelahiran.md).
- `Peternak.desa/dusun/rt/rw` — alamat peternak jadi field terstruktur (sebelumnya kemungkinan satu field alamat bebas), dipakai untuk pengelompokan wilayah.
- Tambah `GET /api/analisis/populasi` (breakdown populasi per dusun/RT/RW, termasuk pertumbuhan bersih lahir−mati) — lihat [api/analisis.md](./api/analisis.md).
- Halaman frontend baru: `/kelahiran`, `/populasi`.

## Sebelumnya — Font & error handling

- Perbaikan `font-size` dan penanganan error di sisi frontend.

## Sebelumnya — Dashboard app UI

- Bangun UI dashboard lengkap: autentikasi (login email/password + Google), CRUD peternak/ternak/master data/laporan kematian, tema hijau-kuning ("Jamaica") dengan shadcn/ui.

## Sebelumnya — Endpoint dashboard & analisis kematian

- Tambah `GET /api/dashboard/summary` dan `GET /api/analisis/penyebab-kematian`.

## Sebelumnya — Dokumentasi awal proyek

- `CLAUDE.md` awal: overview proyek, tech stack, konvensi.

---

Untuk riwayat lengkap per commit, jalankan `git log --oneline` dari root repo — file ini merangkum perubahan yang berdampak ke kontrak API/fitur, bukan pengganti riwayat Git.

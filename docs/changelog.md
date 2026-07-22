# Changelog

Ringkasan perubahan penting per commit signifikan, terbaru di atas. Ditulis dari riwayat `git log` yang sudah ada di repo — bukan setiap commit, hanya yang mengubah kontrak/fitur.

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

# ADR-004: Generate Dokumen Dual-Format — DOCX dari Template, PDF Digambar Manual

## Status

Accepted

## Context

Desa butuh dua dokumen resmi yang di-generate otomatis dari data laporan: **Berita Acara Kematian Ternak** dan **Akta Kelahiran Ternak**. Dokumen ini perlu tersedia dalam format yang bisa diedit lebih lanjut (Word/`.docx`, untuk keperluan administrasi desa yang terbiasa dengan format ini) sekaligus format siap-cetak yang konsisten (`.pdf`). Mengonversi `.docx` ke `.pdf` di server biasanya butuh dependency berat (LibreOffice headless, atau layanan konversi eksternal) yang menambah kompleksitas deployment.

## Decision

Dua jalur generate independen untuk dokumen yang sama, di `backend/src/services/berita-acara.service.js` dan `akta-kelahiran.service.js`:

- **DOCX**: `docxtemplater` + `pizzip` mengisi template `.docx` yang sudah disiapkan manual (placeholder `{nama_placeholder}`, mis. `{nama_peternak}`, `{tanggal_kematian_angka}`) dari data laporan.
- **PDF**: `pdfkit` menggambar ulang layout yang setara secara manual — teks per baris, posisi tanda tangan, dst. — langsung dari kode, tanpa melalui file `.docx` sama sekali.

Endpoint `GET .../berita-acara` dan `GET .../akta` menerima query `?format=docx|pdf` untuk memilih jalur mana yang dipakai. Kalau template `.docx` tidak ditemukan di server, request `format=docx` membalas `500` dengan kode error eksplisit `TEMPLATE_NOT_FOUND` (bukan crash generik).

## Consequences

- Tidak butuh dependency konversi dokumen yang berat di server — kedua format di-generate murni di proses Node.
- **Dua tempat perlu diupdate manual kalau isi/format dokumen berubah**: template `.docx` (diedit manual di Word) dan kode `pdfkit` (diedit sebagai kode) bisa saling drift kalau salah satu diubah tanpa yang lain — tidak ada mekanisme yang menjamin keduanya tetap identik.
- Menambah dokumen baru (di luar dua yang sudah ada) berarti menulis ulang pola yang sama: satu file template `.docx` + satu fungsi `pdfkit` per jenis dokumen, bukan solusi generik satu-kode-untuk-semua-dokumen.
- Kegagalan "template belum ada" (lihat [setup/troubleshooting.md](../setup/troubleshooting.md) — kasus nyata `akta-kelahiran.docx` yang belum ada di repo) hanya memengaruhi jalur `format=docx`; `format=pdf` tetap berfungsi karena tidak bergantung pada file template sama sekali.

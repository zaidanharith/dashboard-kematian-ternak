# Laporan Kematian API

Base path: `/api/laporan-kematian`. Semua endpoint butuh `Authorization: Bearer <token>`.

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/laporan-kematian?penyebabKematianId=&peternakId=` | Siapa saja yang login | Daftar laporan kematian |
| `GET` | `/api/laporan-kematian/:id` | Siapa saja yang login | Detail laporan kematian |
| `GET` | `/api/laporan-kematian/:id/berita-acara?format=docx\|pdf` | Siapa saja yang login | Unduh dokumen Berita Acara Kematian |
| `POST` | `/api/laporan-kematian` | Siapa saja yang login | Catat laporan kematian baru |
| `PATCH` | `/api/laporan-kematian/:id` | Siapa saja yang login | Ubah laporan kematian |
| `DELETE` | `/api/laporan-kematian/:id` | `ADMIN`, `SUPERADMIN` | Hapus laporan kematian |

Setiap laporan menyertakan relasi `ternak` (dengan `peternak` dan `jenisTernak`), `penyebabKematian`, dan `petugas` (`User` pencatat) — lihat `laporanInclude` di `backend/src/controllers/laporan-kematian.controller.js`.

## `GET /api/laporan-kematian`

Query opsional: `penyebabKematianId` (exact), `peternakId` (filter lewat relasi `ternak.peternakId`). Diurutkan `tanggalKematian desc`.

## `POST /api/laporan-kematian`

**Request body**

```json
{
  "ternakId": "c2d1e0f9-...",
  "penyebabKematianId": "f1e2d3c4-...",
  "tanggalKematian": "2026-06-10",
  "catatan": "Ditemukan mati di kandang pagi hari."
}
```

`petugasId` **tidak** dikirim dari client — diambil otomatis dari `req.user.id` (isi token JWT).

Validasi & efek samping (dalam satu `$transaction`):

1. `ternakId`, `penyebabKematianId`, `tanggalKematian` wajib diisi.
2. `Ternak` harus ada, dan **belum berstatus `MATI`** — mencegah ternak yang sama dilaporkan mati dua kali (`400`, `"Ternak ini sudah dilaporkan mati sebelumnya."`).
3. `PenyebabKematian` harus ada.
4. Membuat `LaporanKematian` **dan** meng-update `Ternak.status` menjadi `MATI` dalam satu transaksi atomik.

**Response `201`**

```json
{
  "success": true,
  "message": "Laporan kematian berhasil dibuat.",
  "data": {
    "laporan": {
      "id": "7e8f9a0b-...",
      "ternakId": "c2d1e0f9-...",
      "penyebabKematianId": "f1e2d3c4-...",
      "petugasId": "3f1b7c2e-...",
      "tanggalKematian": "2026-06-10",
      "catatan": "Ditemukan mati di kandang pagi hari.",
      "nomorBeritaAcara": null,
      "ternak": { "kodeTernak": "SP-001", "peternak": {}, "jenisTernak": {} },
      "penyebabKematian": { "nama": "Penyakit" },
      "petugas": { "name": "Budi Santoso" }
    }
  }
}
```

## `PATCH /api/laporan-kematian/:id`

**Request body** (semua field opsional)

```json
{
  "penyebabKematianId": "f1e2d3c4-...",
  "tanggalKematian": "2026-06-11",
  "catatan": "Catatan diperbarui.",
  "nomorBeritaAcara": "12"
}
```

`nomorBeritaAcara` biasanya diisi belakangan (nomor urut surat resmi) — dipakai sebagai `nomor_urut` saat generate dokumen.

## `GET /api/laporan-kematian/:id/berita-acara`

Query `format` = `docx` (default) atau `pdf`.

- `format=pdf` → backend menggambar dokumen langsung dengan `pdfkit`, respons `Content-Type: application/pdf`.
- `format=docx` (default) → backend mengisi template `backend/src/templates/berita-acara-kematian.docx` dengan `docxtemplater`, respons `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

Kedua format memakai header `Content-Disposition: attachment; filename="berita-acara-<kodeTernak>.<ext>"`.

**Response `404`** jika laporan tidak ditemukan. **Response `500`** dengan `error` kode `TEMPLATE_NOT_FOUND` jika file template `.docx` belum ada di server.

## `DELETE /api/laporan-kematian/:id`

Role: `ADMIN`, `SUPERADMIN`. Dalam satu transaksi: menghapus `LaporanKematian` **dan** mengembalikan `Ternak.status` menjadi `HIDUP`.

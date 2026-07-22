# Laporan Kelahiran API

Base path: `/api/laporan-kelahiran`. Semua endpoint butuh `Authorization: Bearer <token>`.

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/laporan-kelahiran?peternakId=` | Siapa saja yang login | Daftar laporan kelahiran |
| `GET` | `/api/laporan-kelahiran/:id` | Siapa saja yang login | Detail laporan kelahiran |
| `GET` | `/api/laporan-kelahiran/:id/akta?format=docx\|pdf` | Siapa saja yang login | Unduh dokumen Akta Kelahiran |
| `POST` | `/api/laporan-kelahiran` | Siapa saja yang login | Catat kelahiran ternak baru |
| `PATCH` | `/api/laporan-kelahiran/:id` | Siapa saja yang login | Ubah laporan kelahiran |
| `DELETE` | `/api/laporan-kelahiran/:id` | `ADMIN`, `SUPERADMIN` | Hapus laporan kelahiran |

## `POST /api/laporan-kelahiran`

> Endpoint ini **sekaligus membuat baris `Ternak` baru** — bukan hanya laporan. Ini adalah cara resmi mendaftarkan ternak baru ke sistem (bukan lewat `POST /api/ternak`).

**Request body**

```json
{
  "peternakId": "b1a0c9d8-...",
  "jenisTernakId": "a0b1c2d3-...",
  "kodeTernak": "SP-002",
  "jenisKelamin": "BETINA",
  "rasRumpun": "Limousin",
  "tanggalLahir": "2026-06-01",
  "catatan": "Kelahiran normal, dibantu petugas."
}
```

Validasi & efek samping (dalam satu `$transaction`):

1. `peternakId`, `jenisTernakId`, `kodeTernak`, `jenisKelamin`, `tanggalLahir` wajib diisi.
2. `jenisKelamin` harus `"JANTAN"` atau `"BETINA"`.
3. `Peternak` dan `JenisTernak` harus ada.
4. Membuat `Ternak` baru (status default `HIDUP`) **lalu** `LaporanKelahiran` yang menunjuk ke ternak itu, dengan `petugasId` dari `req.user.id`.

**Response `201`**

```json
{
  "success": true,
  "message": "Laporan kelahiran berhasil dibuat.",
  "data": {
    "laporan": {
      "id": "1a2b3c4d-...",
      "ternakId": "e5f6a7b8-...",
      "petugasId": "3f1b7c2e-...",
      "tanggalLahir": "2026-06-01",
      "catatan": "Kelahiran normal, dibantu petugas.",
      "nomorAkta": null,
      "ternak": { "kodeTernak": "SP-002", "peternak": {}, "jenisTernak": {} },
      "petugas": { "name": "Budi Santoso" }
    }
  }
}
```

**Response `400`** jika `kodeTernak` sudah dipakai (Prisma `P2002`).

## `PATCH /api/laporan-kelahiran/:id`

**Request body** (semua field opsional)

```json
{
  "catatan": "Catatan diperbarui.",
  "tanggalLahir": "2026-06-02",
  "nomorAkta": "7"
}
```

Jika `tanggalLahir` diubah, `Ternak.tanggalLahir` yang terkait ikut di-update dalam transaksi yang sama — kedua tabel tetap konsisten.

## `GET /api/laporan-kelahiran/:id/akta`

Sama seperti `berita-acara` di [laporan-kematian.md](./laporan-kematian.md#get-apilaporan-kematianidberita-acara), tapi:

- Template docx: `backend/src/templates/akta-kelahiran.docx` (env override: `AKTA_KELAHIRAN_TEMPLATE_NAME`).
- Filename unduhan: `akta-kelahiran-<kodeTernak>.<ext>`.

> **Catatan**: file template `akta-kelahiran.docx` **belum ada** di `backend/src/templates/` pada kode saat ini (hanya `berita-acara-kematian.docx` yang tersedia). `format=docx` untuk endpoint ini akan membalas `500` (`TEMPLATE_NOT_FOUND`) sampai template ditambahkan; `format=pdf` tetap berfungsi karena digambar langsung oleh `pdfkit`. Lihat [setup/troubleshooting.md](../setup/troubleshooting.md).

## `DELETE /api/laporan-kelahiran/:id`

Role: `ADMIN`, `SUPERADMIN`. Dalam satu transaksi: menghapus `LaporanKelahiran` **dan** `Ternak` yang terkait sekaligus (karena laporan kelahiran = catatan pendaftaran ternak itu sendiri).

**Response `400`** jika ternak tersebut sudah punya `LaporanKematian` (Prisma `P2003`, direlasikan `Restrict`):

```json
{
  "success": false,
  "message": "Ternak tidak dapat dihapus karena sudah memiliki laporan kematian terkait. Hapus laporan kematiannya terlebih dahulu."
}
```

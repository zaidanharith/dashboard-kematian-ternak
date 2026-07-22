# Penyebab Kematian API

Base path: `/api/penyebab-kematian`. Data referensi (master data) — di-seed awal dengan: Penyakit, Kecelakaan, Usia Tua, Keracunan, Cuaca Ekstrem, Tidak Diketahui (`backend/prisma/seed.js`).

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/penyebab-kematian` | Siapa saja yang login | Daftar penyebab kematian, urut nama |
| `POST` | `/api/penyebab-kematian` | `ADMIN`, `SUPERADMIN` | Tambah penyebab kematian |
| `PATCH` | `/api/penyebab-kematian/:id` | `ADMIN`, `SUPERADMIN` | Ubah nama penyebab kematian |
| `DELETE` | `/api/penyebab-kematian/:id` | `ADMIN`, `SUPERADMIN` | Hapus penyebab kematian |

## `GET /api/penyebab-kematian`

**Response `200`**

```json
{
  "success": true,
  "message": "Data penyebab kematian berhasil diambil.",
  "data": {
    "penyebabKematian": [
      { "id": "f1e2d3c4-...", "nama": "Penyakit" },
      { "id": "b5a6c7d8-...", "nama": "Kecelakaan" }
    ]
  }
}
```

## `POST /api/penyebab-kematian` / `PATCH /api/penyebab-kematian/:id`

**Request body**

```json
{
  "nama": "Penyakit"
}
```

`nama` wajib diisi dan unik → `400` (`"Penyebab kematian dengan nama tersebut sudah ada."`) jika duplikat.

## `DELETE /api/penyebab-kematian/:id`

**Response `400`** jika masih dipakai oleh `LaporanKematian` (Prisma `P2003`):

```json
{
  "success": false,
  "message": "Penyebab kematian tidak dapat dihapus karena masih digunakan oleh laporan kematian."
}
```

Dipakai juga oleh [analisis/penyebab-kematian](./analisis.md#get-apianalisispenyebab-kematian) untuk rekap dominasi penyebab.

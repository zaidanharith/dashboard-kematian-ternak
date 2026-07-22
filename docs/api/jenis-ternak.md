# Jenis Ternak API

Base path: `/api/jenis-ternak`. Data referensi (master data) — di-seed awal dengan: Sapi, Kambing, Domba, Kerbau, Ayam, Bebek (`backend/prisma/seed.js`).

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/jenis-ternak` | Siapa saja yang login | Daftar jenis ternak, urut nama |
| `POST` | `/api/jenis-ternak` | `ADMIN`, `SUPERADMIN` | Tambah jenis ternak |
| `PATCH` | `/api/jenis-ternak/:id` | `ADMIN`, `SUPERADMIN` | Ubah nama jenis ternak |
| `DELETE` | `/api/jenis-ternak/:id` | `ADMIN`, `SUPERADMIN` | Hapus jenis ternak |

## `GET /api/jenis-ternak`

**Response `200`**

```json
{
  "success": true,
  "message": "Data jenis ternak berhasil diambil.",
  "data": {
    "jenisTernak": [
      { "id": "a0b1c2d3-...", "nama": "Sapi" },
      { "id": "d4e5f6a7-...", "nama": "Kambing" }
    ]
  }
}
```

## `POST /api/jenis-ternak` / `PATCH /api/jenis-ternak/:id`

**Request body**

```json
{
  "nama": "Sapi"
}
```

`nama` wajib diisi dan unik → `400` (`"Jenis ternak dengan nama tersebut sudah ada."`) jika duplikat.

## `DELETE /api/jenis-ternak/:id`

**Response `400`** jika masih dipakai oleh data `Ternak` (Prisma `P2003`):

```json
{
  "success": false,
  "message": "Jenis ternak tidak dapat dihapus karena masih digunakan oleh data ternak."
}
```

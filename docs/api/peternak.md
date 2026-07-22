# Peternak API

Base path: `/api/peternak`. Semua endpoint butuh `Authorization: Bearer <token>`; tidak ada gate role tambahan — `PETUGAS` boleh membuat/mengubah/menghapus data peternak.

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/peternak?search=` | Siapa saja yang login | Daftar peternak (+ daftar ternak miliknya) |
| `GET` | `/api/peternak/:id` | Siapa saja yang login | Detail peternak (+ ternak miliknya, tiap ternak include jenis ternak) |
| `POST` | `/api/peternak` | Siapa saja yang login | Tambah peternak |
| `PATCH` | `/api/peternak/:id` | Siapa saja yang login | Ubah data peternak |
| `DELETE` | `/api/peternak/:id` | Siapa saja yang login | Hapus peternak |

## `GET /api/peternak`

Query opsional `search` mencari di kolom `nama` dan `nik` (case-insensitive, `contains`).

**Response `200`**

```json
{
  "success": true,
  "message": "Data peternak berhasil diambil.",
  "data": {
    "peternak": [
      {
        "id": "b1a0c9d8-...",
        "nama": "Pak Slamet",
        "nik": "3520xxxxxxxxxxxx",
        "telepon": "081234567890",
        "desa": "Besuki",
        "dusun": "Krajan",
        "rt": "001",
        "rw": "002",
        "createdAt": "2026-04-01T00:00:00.000Z",
        "updatedAt": "2026-04-01T00:00:00.000Z",
        "ternak": []
      }
    ]
  }
}
```

## `POST /api/peternak` / `PATCH /api/peternak/:id`

**Request body**

```json
{
  "nama": "Pak Slamet",
  "nik": "3520xxxxxxxxxxxx",
  "telepon": "081234567890",
  "desa": "Besuki",
  "dusun": "Krajan",
  "rt": "001",
  "rw": "002"
}
```

Semua field wajib diisi saat `POST`. `nik` unik — melanggar constraint ini membalas `400` (`"NIK sudah terdaftar untuk peternak lain."`).

## `DELETE /api/peternak/:id`

> **Perhatian**: relasi `Ternak.peternak` bersifat `Cascade` — menghapus peternak akan ikut menghapus **semua ternak miliknya**. Jika salah satu ternak tersebut sudah punya `LaporanKematian` (relasi `Restrict`), delete akan gagal di level database. Controller ini hanya menangani kode error Prisma `P2025` (peternak tidak ditemukan) — kasus foreign key violation di atas jatuh ke respons `500` generik, bukan `400` yang eksplisit. Lihat [architecture/database-schema.md](../architecture/database-schema.md#perilaku-ondelete-penting-untuk-memahami-respons-error-api) dan [setup/troubleshooting.md](../setup/troubleshooting.md).

**Response `200`**

```json
{
  "success": true,
  "message": "Peternak berhasil dihapus."
}
```

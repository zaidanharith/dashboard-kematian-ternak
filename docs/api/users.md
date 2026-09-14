# Users API

Base path: `/api/users`. Semua endpoint butuh `Authorization: Bearer <token>`.

> Sejak [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md), tidak ada tabel `User` lokal — semua endpoint di sini proxy ke recording-ternak lewat `lib/recording-client.js` (`GET/PATCH /api/auth/me`, `GET/POST /api/admins`).

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users/me` | Siapa saja yang login | Ambil profil user yang sedang login |
| `PATCH` | `/api/users/me` | Siapa saja yang login | Ubah nama sendiri |
| `GET` | `/api/users` | `SUPERADMIN` | Daftar semua akun |
| `POST` | `/api/users` | `SUPERADMIN` | Daftarkan akun `ADMIN`/`VIEWER` baru |

## `GET /api/users/me`

**Response `200`**

```json
{
  "success": true,
  "message": "Data pengguna berhasil diambil.",
  "data": {
    "user": {
      "id": "3f1b7c2e-...",
      "name": "Budi Santoso",
      "email": "admin@besuki.desa.id",
      "avatarUrl": null,
      "role": "ADMIN"
    }
  }
}
```

## `PATCH /api/users/me`

**Request body**

```json
{
  "name": "Budi Santoso Wijaya"
}
```

`name` wajib diisi. Endpoint ini hanya mengubah nama — belum ada endpoint ganti password/email sendiri.

## `GET /api/users`

Role: `SUPERADMIN`. Mengembalikan seluruh akun (dari recording-ternak's `/api/admins`).

**Response `200`**

```json
{
  "success": true,
  "message": "Data pengguna berhasil diambil.",
  "data": {
    "users": [
      {
        "id": "3f1b7c2e-...",
        "name": "Budi Santoso",
        "email": "admin@besuki.desa.id",
        "avatarUrl": null,
        "role": "ADMIN",
        "createdAt": "2026-05-01T02:00:00.000Z"
      }
    ]
  }
}
```

## `POST /api/users`

Role: `SUPERADMIN`. **Tidak ada endpoint registrasi publik.**

**Request body**

```json
{
  "name": "Siti Aminah",
  "email": "siti@besuki.desa.id",
  "password": "minimal8karakter",
  "role": "ADMIN"
}
```

Validasi:

- `name`, `email`, `password`, `role` wajib diisi.
- `role` hanya boleh `"ADMIN"` atau `"VIEWER"` — tidak bisa membuat akun `SUPERADMIN` lewat endpoint ini (role `PETUGAS` lama tidak ada lagi, lihat [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md)).
- `password` minimal 8 karakter.
- `username` untuk recording-ternak's `Admin` diturunkan otomatis dari bagian lokal email (mis. `siti@besuki.desa.id` → `siti`).

**Response `201`**

```json
{
  "success": true,
  "message": "Akun berhasil didaftarkan.",
  "data": {
    "user": {
      "id": "9a2e4f10-...",
      "name": "Siti Aminah",
      "email": "siti@besuki.desa.id",
      "avatarUrl": null,
      "role": "ADMIN"
    }
  }
}
```

**Response `400`/`409`** — status dan pesan diteruskan apa adanya dari recording-ternak (field wajib kosong, `role` di luar `ADMIN`/`VIEWER`, password kurang dari 8 karakter, email/username sudah terdaftar).

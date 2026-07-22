# Users API

Base path: `/api/users`. Semua endpoint butuh `Authorization: Bearer <token>`.

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users/me` | Siapa saja yang login | Ambil profil user yang sedang login |
| `PATCH` | `/api/users/me` | Siapa saja yang login | Ubah nama sendiri |
| `GET` | `/api/users` | `SUPERADMIN` | Daftar semua akun |
| `POST` | `/api/users` | `SUPERADMIN` | Daftarkan akun `ADMIN`/`PETUGAS` baru |

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
      "email": "petugas@besuki.desa.id",
      "avatarUrl": null,
      "role": "PETUGAS"
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

`name` wajib diisi. Endpoint ini hanya mengubah nama — belum ada endpoint ganti password/email sendiri (lihat `CLAUDE.md` bagian *Notes for future work*).

## `GET /api/users`

Role: `SUPERADMIN`. Mengembalikan seluruh akun, diurutkan `createdAt desc`.

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
        "email": "petugas@besuki.desa.id",
        "avatarUrl": null,
        "role": "PETUGAS",
        "createdAt": "2026-05-01T02:00:00.000Z"
      }
    ]
  }
}
```

## `POST /api/users`

Role: `SUPERADMIN`. Satu-satunya cara membuat akun baru — **tidak ada endpoint registrasi publik**.

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
- `role` hanya boleh `"ADMIN"` atau `"PETUGAS"` — tidak bisa membuat akun `SUPERADMIN` lewat endpoint ini.
- `password` minimal 8 karakter, di-hash dengan `bcryptjs` sebelum disimpan.

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

**Response `400`** — field wajib kosong, `role` di luar `ADMIN`/`PETUGAS`, password kurang dari 8 karakter, atau email sudah terdaftar (Prisma `P2002`).

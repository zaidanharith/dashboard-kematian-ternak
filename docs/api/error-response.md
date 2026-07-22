# Error Response Convention

Semua endpoint di `backend/src/routes/` mengembalikan amplop JSON yang konsisten.

## Amplop sukses

```json
{
  "success": true,
  "message": "Data peternak berhasil diambil.",
  "data": {
    "peternak": []
  }
}
```

## Amplop error

```json
{
  "success": false,
  "message": "Peternak tidak ditemukan.",
  "error": "Pesan detail — hanya muncul pada error 401 (verifikasi Google) dan 500"
}
```

Field `error` **tidak selalu ada**. Untuk error validasi input (400 karena field kosong/enum salah) dan role gate (403), hanya `success` dan `message` yang dikirim. Field `error` (berisi `error.message` dari exception) hanya disertakan pada:

- `401` saat verifikasi Google ID Token gagal.
- `500` — semua exception tak terduga yang tertangkap `catch` block controller.

## Konvensi kode status

| Kode | Arti | Dipicu oleh |
|---|---|---|
| `200` | OK | `GET` berhasil, `PATCH` berhasil, `DELETE` berhasil |
| `201` | Created | `POST` berhasil membuat resource baru |
| `400` | Bad Request | Field wajib kosong, enum tidak valid (`jenisKelamin` harus `JANTAN`/`BETINA`), constraint unik dilanggar (Prisma `P2002`), constraint foreign key dilanggar saat delete (Prisma `P2003`), aturan bisnis (mis. ternak yang sudah `MATI` tidak bisa dilaporkan mati lagi) |
| `401` | Unauthorized | Header `Authorization` tidak ada/format salah, JWT tidak valid/kedaluwarsa, email atau password salah, Google ID Token tidak valid |
| `403` | Forbidden | Role user tidak termasuk yang diizinkan (`role.middleware`) |
| `404` | Not Found | Resource tidak ditemukan — baik lewat pengecekan manual maupun Prisma `P2025` |
| `500` | Internal Server Error | Exception tak terduga (query gagal, template dokumen hilang, dll.) |

## Pemetaan kode error Prisma → HTTP

| Kode Prisma | Arti | Kode HTTP di respons |
|---|---|---|
| `P2002` | Unique constraint violation | `400` |
| `P2025` | Record to update/delete tidak ditemukan | `404` |
| `P2003` | Foreign key constraint violation | `400` (hanya di endpoint yang menangkapnya secara eksplisit — lihat [architecture/database-schema.md](../architecture/database-schema.md#perilaku-ondelete-penting-untuk-memahami-respons-error-api)) |

Setiap controller menulis pesan `message` dalam Bahasa Indonesia yang siap ditampilkan ke pengguna akhir — frontend menampilkannya langsung lewat `getApiErrorMessage()` (`frontend/src/lib/api-server.ts`) tanpa perlu mapping ulang.

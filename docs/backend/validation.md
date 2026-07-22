# Validation (Backend)

## Tidak ada library validasi — manual per handler

Backend ini **tidak** memakai Zod/Joi/express-validator. Validasi input dilakukan manual di awal setiap controller handler, sebelum query Prisma dijalankan:

```javascript
if (!nama || !nik || !telepon || !desa || !dusun || !rt || !rw) {
  return res.status(400).json({
    success: false,
    message: 'Nama, NIK, telepon, desa, dusun, RT, dan RW wajib diisi.',
  });
}
```

## Dua lapis validasi

1. **Validasi keberadaan field & format sederhana** — manual, di controller. Contoh: field wajib tidak boleh kosong, enum (`jenisKelamin` harus `JANTAN`/`BETINA`, `role` saat registrasi harus `ADMIN`/`PETUGAS`), panjang minimum (`password` ≥ 8 karakter).
2. **Validasi integritas relasi & constraint database** — dua cara:
   - **Dicek eksplisit sebelum query** ketika pesan error yang jelas penting untuk UX (mis. `createTernak` mengecek `peternakId`/`jenisTernakId` ada sebelum insert, `createLaporanKematian` mengecek `Ternak` belum berstatus `MATI`).
   - **Ditangkap dari kode error Prisma** setelah query gagal, untuk constraint yang lebih murah dibiarkan database yang menegakkan: unique (`P2002`), record tidak ditemukan saat update/delete (`P2025`), foreign key (`P2003`). Lihat [api/error-response.md](../api/error-response.md#pemetaan-kode-error-prisma--http).

## Contoh aturan bisnis yang divalidasi di luar sekadar "field wajib"

| Aturan | Lokasi | Efek jika dilanggar |
|---|---|---|
| Ternak yang sudah `MATI` tidak bisa dilaporkan mati lagi | `laporan-kematian.controller.js` → `createLaporanKematian` | `400` |
| `role` saat registrasi user hanya boleh `ADMIN`/`PETUGAS` (tidak bisa buat `SUPERADMIN` baru) | `user.controller.js` → `registerUser` | `400` |
| `password` minimal 8 karakter | `user.controller.js` → `registerUser` | `400` |
| Email Google harus terverifikasi (`email_verified`) | `auth.controller.js` → `googleSignIn` | `400` |

## Menambah validasi baru

Ikuti pola yang sudah ada: cek kondisi di awal handler, `return` lebih awal dengan `res.status(400).json({ success: false, message: '<pesan Bahasa Indonesia yang jelas>' })`. Jangan perkenalkan library validasi baru untuk satu-dua field tambahan — konsistensi dengan pola manual yang sudah ada di seluruh controller lebih penting daripada mengurangi baris kode di satu file.

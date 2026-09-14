# Troubleshooting

Daftar masalah yang diketahui dan cara mengatasinya. Tambahkan entri baru di sini setiap kali sebuah bug/kegagalan tersolusi, supaya tidak perlu didebug ulang.

## (Riwayat) `TEMPLATE_NOT_FOUND` saat unduh Akta Kelahiran — sudah diperbaiki

**Gejala**: `GET /api/laporan-kelahiran/:id/akta` (tanpa `?format=pdf`) membalas `500` dengan `error` berisi pesan "Template akta kelahiran tidak ditemukan di ...".

**Penyebab**: file `backend/src/templates/akta-kelahiran.docx` sempat tidak ada di repo — hanya `berita-acara-kematian.docx` yang tersedia sejak fitur akta kelahiran ditulis (lihat `backend/src/services/akta-kelahiran.service.js`, fungsi `getTemplatePath()`).

**Status**: **sudah diperbaiki** — `backend/src/templates/akta-kelahiran.docx` sudah ditambahkan, diadaptasi dari `berita-acara-kematian.docx` (layout, font, dan blok tanda tangan yang sama, wording dan placeholder disesuaikan untuk laporan kelahiran; lihat `buildAktaKelahiranData()` untuk field-nya). `format=docx` maupun `format=pdf` sekarang sama-sama berfungsi.

Kalau error ini muncul lagi, kemungkinan penyebabnya adalah `AKTA_KELAHIRAN_TEMPLATE_NAME` di-override ke nama file yang tidak ada — periksa `backend/.env`.

## Menghapus `Peternak` yang salah satu ternaknya sudah punya laporan kematian

**Gejala**: `DELETE /api/peternak/:id` membalas `500` generik, bukan pesan error yang jelas.

**Penyebab**: relasi `Ternak.peternak` bersifat `Cascade` (menghapus peternak ikut menghapus ternaknya), tapi relasi `LaporanKematian.ternak` bersifat `Restrict`. Kalau salah satu ternak milik peternak itu sudah punya laporan kematian, database menolak cascade delete-nya dengan foreign key violation (Prisma `P2003`) — tapi `peternak.controller.js` saat ini hanya menangani kode `P2025`, sehingga error jatuh ke `catch` generik (`500`).

**Solusi sementara**: hapus dulu laporan kematian terkait (`DELETE /api/laporan-kematian/:id`, role `ADMIN`/`SUPERADMIN`) sebelum menghapus peternak. Lihat [architecture/database-schema.md](../architecture/database-schema.md#perilaku-ondelete-penting-untuk-memahami-respons-error-api) untuk peta relasi lengkap.

## `prisma generate`/`prisma db push` gagal setelah pindah environment

**Gejala**: Prisma CLI gagal connect atau timeout.

**Penyebab umum**: `DIRECT_URL` di `backend/.env` salah diisi dengan connection string *pooled* (port `6543`) alih-alih *direct* (port `5432`). Prisma CLI (`db push`, `migrate`, `generate`) memakai `DIRECT_URL` lewat `prisma.config.js`, sedangkan runtime app memakai `DATABASE_URL` (pooled) lewat driver adapter.

**Solusi**: cek kembali dua connection string di Supabase dashboard, pastikan tidak tertukar — lihat [environment.md](./environment.md#mendapatkan-nilai-kredensial).

## Login Google tidak muncul di halaman login

**Gejala**: tombol Google login diganti teks "Login Google belum dikonfigurasi."

**Penyebab**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` kosong di `frontend/.env.local` (`features/auth/components/google-login-button.tsx` sengaja menyembunyikan tombol, bukan bug).

**Solusi**: isi `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (dan `GOOGLE_CLIENT_ID` di backend, harus sama) — opsional, login email/password tetap jalan tanpa ini.

## `401 Token autentikasi tidak ditemukan` padahal sudah login di browser

**Gejala**: request langsung ke backend (mis. lewat `curl`/Postman) dengan sesi browser yang aktif tetap `401`.

**Penyebab**: token JWT disimpan sebagai cookie **httpOnly** (`session_token`) di domain frontend, bukan di header yang bisa dibaca manual dari browser. Backend butuh header `Authorization: Bearer <token>` eksplisit — cookie session tidak otomatis diteruskan ke backend kecuali lewat Server Component/Action frontend (`src/lib/api-server.ts`).

**Solusi**: untuk testing manual endpoint backend langsung, login lewat `POST /api/auth/login` untuk mendapatkan `token` dari response JSON, lalu pakai token itu sebagai header `Authorization: Bearer <token>` di request berikutnya.

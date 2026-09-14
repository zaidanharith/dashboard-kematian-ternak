# Authentication (Backend Implementation)

Untuk kontrak endpoint, lihat [api/authentication.md](../api/authentication.md). Dokumen ini menjelaskan implementasinya.

> Sejak [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md), **verifikasi kredensial dan penandatanganan JWT tidak lagi terjadi di backend ini** — keduanya proxy ke recording-ternak.

## Dua cara login, keduanya proxy

| Cara | Endpoint | Implementasi | File |
|---|---|---|---|
| Email/password | `POST /api/auth/login` | Forward `{ email, password }` ke `RECORDING_TERNAK_API_URL/api/auth/login` (header `x-internal-key`), relay respons | `controllers/auth.controller.js` → `login` |
| Google OAuth | `POST /api/auth/google` | Forward `{ idToken }` ke `RECORDING_TERNAK_API_URL/api/auth/google`, relay respons | `controllers/auth.controller.js` → `googleSignIn` |

Tidak ada `bcrypt.compare()` atau `OAuth2Client.verifyIdToken()` di kode ini lagi — keduanya kini hanya ada di `auth.controller.js` milik recording-ternak. Token JWT (`{ id, username, email, name, role }`, ditandatangani recording-ternak dengan `JWT_SECRET` yang sama) diteruskan apa adanya ke frontend.

## Middleware

### `middlewares/auth.middleware.js`

```text
1. Ambil header Authorization
2. Harus berformat "Bearer <token>" — kalau tidak, 401
3. jwt.verify(token, JWT_SECRET)
4. Valid → req.user = payload token ({ id, email, name, role }), next()
5. Tidak valid/kedaluwarsa → 401
```

`JWT_SECRET` punya fallback (`'fallback_secret_for_development'`) — **hanya untuk development**, jangan pernah deploy production tanpa `JWT_SECRET` eksplisit di environment.

### `middlewares/role.middleware.js`

Factory function — dipanggil dengan daftar role yang diizinkan, mengembalikan middleware:

```javascript
roleMiddleware('ADMIN', 'SUPERADMIN')
```

Butuh `req.user` sudah di-set (selalu dipasang **setelah** `authMiddleware` di chain route). Kalau `req.user.role` tidak ada di daftar → `403`.

## Tidak ada registrasi publik

Tidak ada endpoint `POST /api/auth/register`. Cara satu-satunya membuat akun baru adalah `POST /api/users` di sini (role `SUPERADMIN` saja), yang proxy ke `POST /api/admins` milik recording-ternak — lihat [api/users.md](../api/users.md). Akun `SUPERADMIN` pertama dibuat lewat seed di **database recording-ternak**, bukan di sini lagi.

## Password

Hashing (`bcryptjs`, cost factor `10`) dan pengecekan `password` nullable (akun Google-only) sekarang jadi tanggung jawab recording-ternak sepenuhnya — lihat `docs/backend/authentication.md` di repo itu.

## Menyimpan token di sisi frontend

Backend hanya mengembalikan token JWT di response body — **tidak** men-set cookie apa pun sendiri. Penyimpanan token sebagai cookie httpOnly sepenuhnya tanggung jawab frontend (Server Action `frontend/src/features/auth/actions.ts`) — lihat [architecture/system-design.md](../architecture/system-design.md#alur-autentikasi-ringkas) dan [decisions/adr-002](../decisions/adr-002-httponly-cookie-session-server-actions.md).

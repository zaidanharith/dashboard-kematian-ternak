# Authentication (Backend Implementation)

Untuk kontrak endpoint, lihat [api/authentication.md](../api/authentication.md). Dokumen ini menjelaskan implementasinya.

## Dua cara login, satu bentuk token

| Cara | Endpoint | Verifikasi | File |
|---|---|---|---|
| Email/password | `POST /api/auth/login` | `bcrypt.compare()` terhadap `User.password` | `controllers/auth.controller.js` → `login` |
| Google OAuth | `POST /api/auth/google` | `OAuth2Client.verifyIdToken()` dari `google-auth-library`, audience = `GOOGLE_CLIENT_ID` | `controllers/auth.controller.js` → `googleSignIn` |

Keduanya berakhir dengan `jwt.sign({ id, email, name, role }, JWT_SECRET, { expiresIn: '7d' })` — payload dan masa berlaku token identik terlepas dari cara login.

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

Tidak ada endpoint `POST /api/auth/register`. Cara satu-satunya membuat akun baru adalah `POST /api/users` (role `SUPERADMIN` saja) — lihat [api/users.md](../api/users.md). Akun `SUPERADMIN` pertama dibuat lewat `prisma/seed.js`, bukan lewat API mana pun.

## Password

- Di-hash dengan `bcryptjs`, cost factor `10` (`bcrypt.hash(password, 10)`).
- `User.password` bersifat **nullable** — akun yang dibuat murni lewat Google Sign-In tidak punya password sampai (jika ada fitur itu ke depannya) di-set manual. Login email/password untuk akun seperti ini akan selalu `401` (`!user.password` dicek eksplisit di `login`).
- Belum ada endpoint ganti password sendiri untuk user yang sudah login (lihat `CLAUDE.md` → *Notes for future work*).

## Menyimpan token di sisi frontend

Backend hanya mengembalikan token JWT di response body — **tidak** men-set cookie apa pun sendiri. Penyimpanan token sebagai cookie httpOnly sepenuhnya tanggung jawab frontend (Server Action `frontend/src/features/auth/actions.ts`) — lihat [architecture/system-design.md](../architecture/system-design.md#alur-autentikasi-ringkas) dan [decisions/adr-002](../decisions/adr-002-httponly-cookie-session-server-actions.md).

# Authentication API

Base path: `/api/auth`. Tidak ada endpoint di sini yang butuh header `Authorization` — keduanya adalah entry point untuk *mendapatkan* JWT.

Tidak ada endpoint registrasi publik. Akun baru (`ADMIN`/`PETUGAS`) hanya bisa dibuat oleh `SUPERADMIN` lewat `POST /api/users` — lihat [users.md](./users.md).

## `POST /api/auth/login`

Login dengan email dan password (akun yang dibuat manual oleh `SUPERADMIN`, termasuk akun `SUPERADMIN` awal dari seed).

**Request body**

```json
{
  "email": "petugas@besuki.desa.id",
  "password": "password-min-8-karakter"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
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

**Response `401`** — email tidak terdaftar, akun tidak punya password (akun Google-only), atau password salah. Pesan yang sama (`"Email atau password salah."`) dipakai untuk kedua kasus agar tidak membocorkan email mana yang terdaftar.

## `POST /api/auth/google`

Login/registrasi otomatis via Google Identity Services. Frontend mengirim `idToken` (credential) dari komponen `GoogleLogin` (`@react-oauth/google`); backend memverifikasinya ke Google (`google-auth-library`) memakai `GOOGLE_CLIENT_ID` sebagai audience.

**Request body**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response `200`** — struktur sama dengan `/login` di atas.

**Perilaku akun**

- Jika `googleId` dari token sudah cocok dengan user yang ada → login langsung.
- Jika belum ada user dengan `googleId` itu tapi ada user dengan `email` yang sama (mis. akun dibuat manual oleh SUPERADMIN) → `googleId` ditautkan ke akun tersebut (account linking), role tetap seperti semula.
- Jika email belum terdaftar sama sekali → user baru dibuat otomatis dengan role default (`PETUGAS`).

**Response `400`** — token valid tapi email dari Google belum terverifikasi (`email_verified: false`).

**Response `401`** — `idToken` tidak ada di body, atau gagal diverifikasi (kedaluwarsa/audience salah).

## Token JWT

Payload JWT: `{ id, email, name, role }`, ditandatangani dengan `JWT_SECRET`, masa berlaku **7 hari**. Token ini dikirim di setiap request terautentikasi lewat header:

```text
Authorization: Bearer <token>
```

Lihat [backend/authentication.md](../backend/authentication.md) untuk detail implementasi middleware, dan [architecture/system-design.md](../architecture/system-design.md#alur-autentikasi-ringkas) untuk bagaimana frontend menyimpan token ini sebagai cookie httpOnly.

# Authentication API

Base path: `/api/auth`. Tidak ada endpoint di sini yang butuh header `Authorization` — keduanya adalah entry point untuk *mendapatkan* JWT.

> **Sejak integrasi dengan recording-ternak** ([ADR-005](../decisions/adr-005-integration-with-recording-ternak.md)), backend ini **tidak lagi menyimpan user secara lokal**. Kedua endpoint di bawah cuma proxy tipis ke `POST /api/auth/login`/`POST /api/auth/google` milik recording-ternak (lewat `lib/recording-client.js`, header `x-internal-key: INTERNAL_API_KEY`) — validasi kredensial, hashing password, dan verifikasi Google ID token semuanya terjadi di sana, bukan di sini.

Tidak ada endpoint registrasi publik. Akun baru (`ADMIN`/`VIEWER`) hanya bisa dibuat lewat `POST /api/users`, yang juga proxy ke recording-ternak (`POST /api/admins`) — lihat [users.md](./users.md).

## `POST /api/auth/login`

Login dengan email dan password.

**Request body**

```json
{
  "email": "admin@besuki.desa.id",
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
      "email": "admin@besuki.desa.id",
      "avatarUrl": null,
      "role": "ADMIN"
    }
  }
}
```

`role` sekarang salah satu dari `SUPERADMIN` | `ADMIN` | `VIEWER` (role `PETUGAS` lama sudah dipetakan ke `ADMIN` saat migrasi — lihat [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md)).

**Error** — status dan pesan diteruskan apa adanya dari recording-ternak (mis. `401` email/password salah).

## `POST /api/auth/google`

Login via Google Identity Services. Frontend mengirim `idToken` (credential) dari komponen `GoogleLogin` (`@react-oauth/google`) — token ini diverifikasi di recording-ternak, bukan di sini, sehingga `idToken` yang di-generate dari Google Client ID **aplikasi ini** tetap diterima (recording-ternak menerima kedua audience, lihat `DASHBOARD_GOOGLE_CLIENT_ID` di [`setup/environment.md`](../setup/environment.md) milik recording-ternak).

**Request body**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response `200`** — struktur sama dengan `/login` di atas.

**Perilaku akun** — akun harus sudah terdaftar (dibuat oleh `SUPERADMIN` lewat `POST /api/admins` di recording-ternak, atau `POST /api/users` di sini). **Tidak ada auto-registrasi** lagi lewat Google login — beda dari perilaku lama sebelum integrasi.

## Token JWT

Payload JWT: `{ id, username, email, name, role }`, ditandatangani recording-ternak dengan `JWT_SECRET` — **harus sama persis** dengan `JWT_SECRET` di sini agar `auth.middleware.js` bisa verifikasi token secara lokal tanpa panggil API lagi di setiap request. Masa berlaku **7 hari**.

```text
Authorization: Bearer <token>
```

Lihat [backend/authentication.md](../backend/authentication.md) untuk detail implementasi middleware, dan [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md) untuk kenapa auth dipusatkan di recording-ternak.

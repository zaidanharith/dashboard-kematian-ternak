# API Flow

Diagram alur request untuk skenario-skenario utama. Semua endpoint memakai amplop response yang sama — lihat [api/error-response.md](../api/error-response.md).

## 1. Login (email/password atau Google)

```mermaid
sequenceDiagram
    participant Browser
    participant ServerAction as Server Action (actions.ts)
    participant Backend as Express (/api/auth/*)
    participant DB as PostgreSQL

    Browser->>ServerAction: submit form login / credential Google
    ServerAction->>Backend: POST /api/auth/login { email, password }<br/>atau POST /api/auth/google { idToken }
    Backend->>DB: cari User (by email / googleId)
    Backend->>Backend: verifikasi password (bcrypt)<br/>atau verifikasi idToken (google-auth-library)
    Backend-->>ServerAction: 200 { token, user }
    ServerAction->>Browser: Set-Cookie session_token (httpOnly, 7 hari)
    ServerAction-->>Browser: redirect ke /dashboard
```

## 2. Request terautentikasi (pola umum semua resource)

```mermaid
sequenceDiagram
    participant Browser
    participant Server as Server Component / Server Action
    participant MW as auth.middleware
    participant Role as role.middleware (opsional)
    participant Ctrl as Controller
    participant DB as PostgreSQL

    Browser->>Server: render halaman / submit form
    Server->>Server: baca cookie session_token
    Server->>MW: GET/POST/PATCH/DELETE + Authorization: Bearer <JWT>
    MW->>MW: jwt.verify(token)
    alt token tidak valid/kedaluwarsa
        MW-->>Server: 401
    else token valid
        MW->>Role: next() — req.user = { id, email, name, role }
        alt role tidak diizinkan
            Role-->>Server: 403
        else role diizinkan
            Role->>Ctrl: next()
            Ctrl->>DB: query/mutate via Prisma
            DB-->>Ctrl: hasil
            Ctrl-->>Server: 200/201 { success, message, data }
        end
    end
```

## 3. Buat laporan kematian (transaksi + perubahan status ternak)

```mermaid
sequenceDiagram
    participant Petugas
    participant Ctrl as laporan-kematian.controller.js
    participant DB as PostgreSQL

    Petugas->>Ctrl: POST /api/laporan-kematian { ternakId, penyebabKematianId, tanggalKematian, catatan }
    Ctrl->>DB: cek Ternak ada & status != MATI
    Ctrl->>DB: cek PenyebabKematian ada
    Ctrl->>DB: $transaction([<br/>  create LaporanKematian(petugasId = req.user.id),<br/>  update Ternak.status = MATI<br/>])
    DB-->>Ctrl: laporan (include ternak, penyebabKematian, petugas)
    Ctrl-->>Petugas: 201 { laporan }
```

Pola yang sama (dengan arah sebaliknya untuk status `HIDUP`) berlaku untuk `DELETE /api/laporan-kematian/:id`. Untuk laporan kelahiran, `POST /api/laporan-kelahiran` membuat baris `Ternak` **baru** sekaligus `LaporanKelahiran` dalam satu transaksi (lihat [api/laporan-kelahiran.md](../api/laporan-kelahiran.md)).

## 4. Unduh dokumen (Berita Acara / Akta Kelahiran)

```mermaid
sequenceDiagram
    participant Browser
    participant RH as Route Handler<br/>/berita-acara/[id]
    participant Svc as laporan.service.ts (frontend)
    participant Ctrl as laporan-kematian.controller.js
    participant Doc as berita-acara.service.js

    Browser->>RH: GET /berita-acara/{id}?format=pdf
    RH->>Svc: getBeritaAcara(id, format)
    Svc->>Ctrl: GET /api/laporan-kematian/{id}/berita-acara?format=pdf<br/>Authorization: Bearer <JWT dari cookie>
    Ctrl->>Doc: generateBeritaAcaraPdf(laporan)
    Doc-->>Ctrl: Buffer PDF
    Ctrl-->>Svc: 200, Content-Type: application/pdf, Content-Disposition: attachment
    Svc-->>RH: { buffer, contentType, filename }
    RH-->>Browser: Response(buffer) sebagai attachment
```

Jika `format=docx` (default), backend memakai `docxtemplater` untuk mengisi template `.docx` alih-alih menggambar PDF secara manual. Jika template tidak ditemukan di server, backend membalas `500` dengan `error` bertanda `TEMPLATE_NOT_FOUND`.

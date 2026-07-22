# Coding Standards (Backend)

## Struktur per resource

```text
routes/<resource>.routes.js        # daftar route + middleware chain, tanpa logic
controllers/<resource>.controller.js  # exports.<handler> — logic + akses Prisma langsung
services/<nama>.service.js         # HANYA untuk logic non-trivial (bukan wajib per resource)
```

Contoh chain di route (`peternak.routes.js`):

```javascript
router.get('/', authMiddleware, peternakController.getAllPeternak);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), peternakController.deletePeternak);
```

## Controller: pola yang konsisten di semua resource

Setiap handler controller mengikuti bentuk yang sama:

```javascript
exports.getAllPeternak = async (req, res) => {
  try {
    // 1. baca input (req.query / req.params / req.body)
    // 2. validasi manual field wajib → return res.status(400) lebih awal
    // 3. query/mutate Prisma
    // 4. return res.status(200 | 201).json({ success: true, message, data })
  } catch (error) {
    // 5. cek error.code Prisma spesifik (P2002/P2025/P2003) → status + message relevan
    // 6. fallback: console.error + res.status(500).json({ success: false, message, error: error.message })
  }
};
```

Tidak ada helper `try/catch` generik atau error-handling middleware terpusat — setiap handler menangani error-nya sendiri secara eksplisit. Ini konsisten di seluruh 9 controller (`peternak`, `ternak`, `jenis-ternak`, `penyebab-kematian`, `laporan-kematian`, `laporan-kelahiran`, `user`, `dashboard`, `analisis`).

## Prisma langsung di controller — bukan pelanggaran konvensi

Lihat [database/prisma.md](../database/prisma.md#akses-prisma-langsung-dari-controller). Controller boleh `require('../database/connections/prisma_client')` dan query langsung; Repository hanya ditambahkan kalau ada kebutuhan caching/fallback nyata.

## Kapan pakai `services/`

Hanya untuk logic yang **bukan** query-per-resource — proyek ini punya dua contoh: `berita-acara.service.js` dan `akta-kelahiran.service.js`, keduanya generate dokumen (docx/pdf) dari data laporan. Jangan buat file service untuk setiap resource "supaya konsisten" — itu menambah indirection tanpa manfaat untuk CRUD sederhana.

## Response envelope

Selalu `{ success, message, data }` untuk sukses dan `{ success: false, message, error? }` untuk gagal — lihat [api/error-response.md](../api/error-response.md). Pesan (`message`) selalu Bahasa Indonesia dan siap ditampilkan ke pengguna akhir tanpa perlu translasi/mapping di frontend.

## Penamaan

| Elemen | Konvensi | Contoh |
|---|---|---|
| File controller | `<resource>.controller.js` | `laporan-kematian.controller.js` |
| File route | `<resource>.routes.js` | `laporan-kematian.routes.js` |
| File service | `<nama-fungsi>.service.js` | `berita-acara.service.js` |
| Fungsi/variabel | `camelCase` | `getAllLaporanKematian` |
| Konstanta | `UPPER_SNAKE_CASE` | `REGISTERABLE_ROLES`, `NAMA_BULAN` |

## Self-documenting root endpoint

`backend/src/routes/api.js` (`GET /api/`) mengembalikan daftar seluruh route yang tersedia sebagai JSON. Setiap kali menambah/mengubah endpoint, **update juga daftar ini** — ini dipakai sebagai dokumentasi endpoint cepat tanpa perlu buka file terpisah, dan dites lewat `__tests__/integration/api-root.integration.test.js`.

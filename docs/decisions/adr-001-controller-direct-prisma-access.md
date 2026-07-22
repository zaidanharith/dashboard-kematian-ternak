# ADR-001: Controller Boleh Akses Prisma Langsung (Tanpa Repository Wajib)

## Status

Accepted

## Context

Proyek ini masih di tahap awal dengan tim kecil, dan sebagian besar operasi data adalah CRUD sederhana satu-tabel (atau join dangkal lewat `include`) per resource: `Peternak`, `Ternak`, `JenisTernak`, `PenyebabKematian`, `LaporanKematian`, `LaporanKelahiran`, `User`. Pola boilerplate umum (Controller → Service → Repository wajib di setiap layer) menambah file dan indirection tanpa manfaat nyata selama tidak ada kebutuhan caching, fallback data, atau logic query kompleks yang perlu diuji terpisah dari HTTP layer.

## Decision

Controller boleh memanggil Prisma Client langsung (`require('../database/connections/prisma_client')`) untuk query/mutasi data — Repository **tidak wajib**. Layer `services/` hanya dipakai untuk logic yang benar-benar non-trivial dan bukan sekadar query-per-resource — di proyek ini baru ada dua: generate dokumen DOCX/PDF (`berita-acara.service.js`, `akta-kelahiran.service.js`).

## Consequences

- Lebih sedikit boilerplate dan file per resource — menambah resource baru cukup butuh satu file route + satu file controller.
- Test controller memakai `jest.mock()` langsung terhadap modul Prisma Client, bukan mocking Repository — lihat pola di `backend/src/__tests__/controllers/`.
- Kalau nanti muncul kebutuhan caching, fallback antar sumber data, atau query yang dipakai berulang di banyak controller, refactor ke Repository harus dilakukan secara sadar per-kasus (bukan otomatis tersedia dari awal) — lihat [database/prisma.md](../database/prisma.md).

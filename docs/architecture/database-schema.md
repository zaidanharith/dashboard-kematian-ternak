# Database Schema

Sumber kebenaran: `backend/prisma/schema.prisma`. Semua tabel memakai `id UUID` sebagai primary key (`@default(uuid())`), serta `createdAt`/`updatedAt` kecuali `JenisTernak` dan `PenyebabKematian` (tabel referensi murni).

## ERD

```mermaid
erDiagram
    USER ||--o{ LAPORAN_KEMATIAN : mencatat
    USER ||--o{ LAPORAN_KELAHIRAN : mencatat
    PETERNAK ||--o{ TERNAK : memiliki
    JENIS_TERNAK ||--o{ TERNAK : mengklasifikasi
    TERNAK ||--o{ LAPORAN_KEMATIAN : "dilaporkan mati"
    TERNAK ||--o| LAPORAN_KELAHIRAN : "dilaporkan lahir"
    PENYEBAB_KEMATIAN ||--o{ LAPORAN_KEMATIAN : menyebabkan

    USER {
        uuid id PK
        string email UK
        string name
        string password "nullable — null jika akun Google-only"
        string googleId UK "nullable"
        string avatarUrl "nullable"
        enum role "SUPERADMIN | ADMIN | PETUGAS, default PETUGAS"
    }

    PETERNAK {
        uuid id PK
        string nama
        string nik UK
        string telepon
        string desa "default Besuki"
        string dusun
        string rt
        string rw
    }

    JENIS_TERNAK {
        uuid id PK
        string nama UK
    }

    TERNAK {
        uuid id PK
        string kodeTernak UK
        uuid jenisTernakId FK
        uuid peternakId FK
        enum jenisKelamin "JANTAN | BETINA"
        string rasRumpun "nullable"
        date tanggalLahir
        enum status "HIDUP | MATI, default HIDUP"
    }

    PENYEBAB_KEMATIAN {
        uuid id PK
        string nama UK
    }

    LAPORAN_KEMATIAN {
        uuid id PK
        uuid ternakId FK
        uuid penyebabKematianId FK
        uuid petugasId FK
        date tanggalKematian
        string catatan "nullable"
        string nomorBeritaAcara "nullable"
    }

    LAPORAN_KELAHIRAN {
        uuid id PK
        uuid ternakId FK "unique — satu ternak maksimal satu laporan kelahiran"
        uuid petugasId FK
        date tanggalLahir
        string catatan "nullable"
        string nomorAkta "nullable"
    }
```

## Enum

| Enum | Nilai | Dipakai di |
|---|---|---|
| `Role` | `SUPERADMIN`, `ADMIN`, `PETUGAS` | `User.role` |
| `JenisKelamin` | `JANTAN`, `BETINA` | `Ternak.jenisKelamin` |
| `StatusTernak` | `HIDUP`, `MATI` | `Ternak.status`, di-set otomatis oleh controller laporan kematian/kelahiran |

## Perilaku `onDelete` (penting untuk memahami respons error API)

| Relasi | onDelete | Efek |
|---|---|---|
| `Ternak.jenisTernak → JenisTernak` | `Restrict` | JenisTernak tidak bisa dihapus selama masih dipakai `Ternak` mana pun (→ `DELETE /api/jenis-ternak/:id` balas 400) |
| `Ternak.peternak → Peternak` | `Cascade` | Menghapus `Peternak` ikut menghapus semua `Ternak` miliknya |
| `LaporanKematian.ternak → Ternak` | `Restrict` | `Ternak` tidak bisa dihapus selama masih punya `LaporanKematian` (→ `DELETE /api/ternak/:id` balas 400) |
| `LaporanKematian.penyebabKematian → PenyebabKematian` | `Restrict` | `PenyebabKematian` tidak bisa dihapus selama masih dipakai laporan (→ 400) |
| `LaporanKematian.petugas → User` | `Restrict` | User pencatat tidak bisa dihapus selama masih punya laporan kematian tercatat |
| `LaporanKelahiran.ternak → Ternak` | `Cascade` | Menghapus `LaporanKelahiran` lewat endpoint delete juga menghapus `Ternak` terkait (lihat `laporan-kelahiran.controller.js`, transaksi eksplisit) |
| `LaporanKelahiran.petugas → User` | `Restrict` | User pencatat tidak bisa dihapus selama masih punya laporan kelahiran tercatat |

Karena `Ternak.peternak` bersifat `Cascade` sedangkan `LaporanKematian.ternak` bersifat `Restrict`, menghapus seorang `Peternak` yang salah satu ternaknya sudah punya laporan kematian akan gagal di level database (foreign key violation) meski controller `peternak.controller.js` saat ini hanya menangani kode error `P2025`, bukan `P2003`, untuk kasus ini — lihat [setup/troubleshooting.md](../setup/troubleshooting.md).

## Konvensi penamaan kolom/tabel

- Nama model Prisma (PascalCase) di-`@@map` ke nama tabel snake_case (`LaporanKematian` → `laporan_kematian`).
- Field camelCase di-`@map` ke kolom snake_case (`tanggalKematian` → `tanggal_kematian`).
- Semua ID adalah `uuid` (`@db.Uuid`), bukan auto-increment integer.

Lihat juga [database/prisma.md](../database/prisma.md) untuk konvensi query dan migrasi.

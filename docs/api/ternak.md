# Ternak API

Base path: `/api/ternak`. Semua endpoint butuh `Authorization: Bearer <token>`; tidak ada gate role tambahan.

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/ternak?peternakId=&status=` | Siapa saja yang login | Daftar ternak, bisa difilter per peternak dan/atau status |
| `POST` | `/api/ternak/provision` | Siapa saja yang login | Upsert ternak by `kodeTernak` — dipakai recording-ternak |
| `GET` | `/api/ternak/:id` | Siapa saja yang login | Detail ternak (+ peternak, jenis ternak, riwayat laporan kematian) |
| `POST` | `/api/ternak` | Siapa saja yang login | Tambah ternak |
| `PATCH` | `/api/ternak/:id` | Siapa saja yang login | Ubah data ternak |
| `DELETE` | `/api/ternak/:id` | Siapa saja yang login | Hapus ternak |

> Untuk mencatat kelahiran ternak baru, gunakan `POST /api/laporan-kelahiran` (bukan endpoint ini langsung) — endpoint itu membuat baris `Ternak` sekaligus `LaporanKelahiran` dalam satu transaksi. Lihat [laporan-kelahiran.md](./laporan-kelahiran.md).

## `POST /api/ternak/provision`

> Ditambahkan untuk integrasi dengan recording-ternak ([ADR-005](../decisions/adr-005-integration-with-recording-ternak.md)) — recording-ternak tidak punya model `Ternak` sendiri, cuma `Goat`, jadi endpoint ini yang dipakai untuk mendaftarkan/menemukan ternak dari sana.

**Request body**

```json
{
  "kodeTernak": "12",
  "jenisTernakNama": "Kambing",
  "peternakId": "b1a0c9d8-...",
  "jenisKelamin": "JANTAN",
  "tanggalLahir": "2024-01-01",
  "rasRumpun": "Kambing Jawa"
}
```

Perilaku:

1. `kodeTernak`, `jenisTernakNama`, `peternakId` wajib diisi.
2. Kalau `Ternak` dengan `kodeTernak` itu **sudah ada**, dikembalikan apa adanya (`200`) — `jenisKelamin`/`tanggalLahir`/`rasRumpun` di body **diabaikan**, tidak menimpa data yang sudah ada.
3. Kalau **belum ada**, dibuat baru — di sini `jenisKelamin` dan `tanggalLahir` **boleh kosong** (beda dari `POST /api/ternak` biasa yang mewajibkan keduanya), karena recording-ternak tidak mengumpulkan data ini secara otomatis. Ternak yang dibuat dengan field kosong tidak bisa dipakai untuk `POST /api/laporan-kematian` sampai dilengkapi (lihat [laporan-kematian.md](./laporan-kematian.md)).
4. `jenisTernakNama` di-resolve ke `jenisTernakId` lewat lookup `JenisTernak.nama` — `400` kalau tidak ketemu.

**Response `200`** (sudah ada) atau **`201`** (baru dibuat) — bentuk sama seperti `POST /api/ternak`.

## `GET /api/ternak`

Query opsional: `peternakId` (filter exact), `status` (`HIDUP` | `MATI`).

**Response `200`**

```json
{
  "success": true,
  "message": "Data ternak berhasil diambil.",
  "data": {
    "ternak": [
      {
        "id": "c2d1e0f9-...",
        "kodeTernak": "SP-001",
        "jenisTernakId": "a0b1c2d3-...",
        "peternakId": "b1a0c9d8-...",
        "jenisKelamin": "JANTAN",
        "rasRumpun": "Limousin",
        "tanggalLahir": "2023-01-15",
        "status": "HIDUP",
        "peternak": { "id": "b1a0c9d8-...", "nama": "Pak Slamet" },
        "jenisTernak": { "id": "a0b1c2d3-...", "nama": "Sapi" }
      }
    ]
  }
}
```

## `POST /api/ternak`

**Request body**

```json
{
  "kodeTernak": "SP-001",
  "jenisTernakId": "a0b1c2d3-...",
  "peternakId": "b1a0c9d8-...",
  "jenisKelamin": "JANTAN",
  "rasRumpun": "Limousin",
  "tanggalLahir": "2023-01-15"
}
```

> `jenisKelamin` dan `tanggalLahir` nullable di skema (sejak ADR-005, untuk mendukung `POST /api/ternak/provision`), tapi endpoint `POST`/`PATCH /api/ternak` biasa ini tetap mewajibkan keduanya diisi — hanya `/provision` yang mengizinkannya kosong.

Validasi:

- `kodeTernak`, `jenisTernakId`, `peternakId`, `jenisKelamin`, `tanggalLahir` wajib diisi (`rasRumpun` opsional).
- `jenisKelamin` harus `"JANTAN"` atau `"BETINA"`.
- `peternakId` dan `jenisTernakId` harus merujuk ke record yang ada (dicek eksplisit, balas `400` jika tidak).
- `kodeTernak` unik → `400` (`"Kode ternak sudah digunakan."`) jika duplikat.

`status` selalu dimulai dari `HIDUP` (default schema) dan hanya berubah lewat alur laporan kematian/hapus laporan kematian — tidak bisa di-set manual lewat endpoint ini.

## `PATCH /api/ternak/:id`

Body sama seperti `POST`, semua field opsional (partial update).

## `DELETE /api/ternak/:id`

**Response `400`** jika ternak masih punya `LaporanKematian` terkait (Prisma `P2003`, ditangani eksplisit):

```json
{
  "success": false,
  "message": "Ternak tidak dapat dihapus karena masih memiliki laporan kematian terkait."
}
```

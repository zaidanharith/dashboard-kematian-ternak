# Internal API (service-to-service sync)

Base path: `/internal` (bukan di bawah `/api`, di-mount terpisah di `app.js`). Endpoint ini bukan untuk frontend — hanya supaya recording-ternak bisa push perubahan `Farmer` ke sini untuk menjaga `Peternak` tetap sinkron. Lihat [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md) dan [`architecture/database-schema.md`](../architecture/database-schema.md#catatan-lintas-aplikasi).

Auth: header `x-internal-key` harus sama persis dengan `INTERNAL_API_KEY` (`internal-key.middleware.js`) — **bukan** JWT user. `401` kalau tidak ada atau salah.

| Method | Path | Deskripsi |
|---|---|---|
| `PUT` | `/internal/peternak/:id` | Upsert Peternak by id (dipanggil recording-ternak saat Farmer dibuat/diubah) |
| `DELETE` | `/internal/peternak/:id` | Hapus Peternak by id (dipanggil recording-ternak saat Farmer dihapus) |

## `PUT /internal/peternak/:id`

`:id` sama persis dengan id baris `Farmer` yang berkorespondensi di database recording-ternak — Farmer dan Peternak untuk orang yang sama selalu berbagi primary key yang sama, itulah cara kedua tabel tetap berkorespondensi tanpa tabel mapping terpisah.

**Request body**

```json
{ "nama": "Pak Slamet", "desa": "Besuki", "dusun": "Krajan", "rt": "001", "rw": "002", "telepon": "081234567890" }
```

`nama` dan `telepon` wajib diisi. `nik` **tidak** dikirim (recording-ternak tidak mengumpulkan NIK) — dibiarkan `null`/tetap seperti sebelumnya.

## `DELETE /internal/peternak/:id`

Idempotent — tetap membalas `200` walau peternaknya sudah tidak ada (supaya delete yang di-retry atau datang tidak berurutan tidak pernah gagal).

## Arah sebaliknya

dashboard-kematian-ternak juga push perubahan `Peternak`-nya sendiri ke `PUT`/`DELETE /internal/farmers/:id` milik recording-ternak dengan cara yang sama (`recording-sync.service.js`, dipanggil dari `peternak.controller.js` setiap kali create/update/delete). Kedua arah bersifat **best-effort**: kegagalan push di-log, tidak di-retry, dan tidak pernah membatalkan perubahan lokal — lihat [ADR-005](../decisions/adr-005-integration-with-recording-ternak.md#consequences) untuk alasan tradeoff ini.

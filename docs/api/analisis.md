# Analisis API

Base path: `/api/analisis`. Kedua endpoint mendukung filter rentang tanggal.

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/analisis/penyebab-kematian?startDate&endDate` | Siapa saja yang login | Ranking penyebab kematian + breakdown per jenis ternak |
| `GET` | `/api/analisis/populasi?level=dusun\|rt\|rw&startDate&endDate` | Siapa saja yang login | Statistik populasi ternak per wilayah |

## `GET /api/analisis/penyebab-kematian`

Query opsional: `startDate`, `endDate` (ISO date, filter `tanggalKematian`).

**Response `200`**

```json
{
  "success": true,
  "message": "Analisis penyebab kematian berhasil diambil.",
  "data": {
    "analisis": {
      "totalLaporan": 42,
      "jumlahPenyebab": 4,
      "ranking": [
        {
          "id": "f1e2d3c4-...",
          "nama": "Penyakit",
          "jumlah": 18,
          "persentase": 42.9,
          "breakdownJenisTernak": [
            { "nama": "Sapi", "jumlah": 10 },
            { "nama": "Kambing", "jumlah": 8 }
          ]
        }
      ]
    }
  }
}
```

`persentase` dibulatkan 1 desimal (`jumlah / totalLaporan * 100`), dihitung dari total laporan **dalam rentang tanggal yang sama** (bukan dari total sepanjang masa).

## `GET /api/analisis/populasi`

Query opsional: `level` (`dusun` default, `rt`, atau `rw` — nilai lain diabaikan dan jatuh ke `dusun`), `startDate`, `endDate` (memfilter kelahiran/kematian yang dihitung sebagai `lahir`/`mati` per wilayah, **bukan** memfilter populasi saat ini).

**Response `200`**

```json
{
  "success": true,
  "message": "Analisis populasi berhasil diambil.",
  "data": {
    "analisis": {
      "level": "dusun",
      "totalPopulasi": 120,
      "totalLahir": 9,
      "totalMati": 10,
      "wilayah": [
        {
          "wilayah": { "desa": "Besuki", "dusun": "Krajan", "rt": null, "rw": null },
          "label": "Dusun Krajan",
          "jumlahPeternak": 7,
          "populasi": 55,
          "lahir": 4,
          "mati": 3,
          "pertumbuhanBersih": 1
        }
      ]
    }
  }
}
```

Catatan perhitungan:

- `populasi` = jumlah `Ternak` dengan `status: HIDUP` yang dimiliki peternak di wilayah tersebut **saat ini** (tidak dipengaruhi `startDate`/`endDate`).
- `lahir`/`mati` = jumlah laporan pada rentang tanggal yang diberikan (atau sepanjang masa jika tidak ada filter).
- `pertumbuhanBersih` = `lahir - mati` untuk rentang tersebut.
- Level `dusun` mengelompokkan semua RT/RW dalam satu dusun menjadi satu baris; level `rt`/`rw` memecah lebih detail (lihat `wilayahKey`/`wilayahLabel` di `backend/src/controllers/analisis.controller.js`).
- Hasil diurutkan `populasi desc`.

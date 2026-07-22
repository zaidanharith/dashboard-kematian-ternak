# Dashboard API

Base path: `/api/dashboard`. Landing page setelah login mengonsumsi endpoint ini.

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Siapa saja yang login | Ringkasan statistik untuk halaman dashboard |

## `GET /api/dashboard/summary`

Semua angka dihitung dalam satu `Promise.all` (lihat `backend/src/controllers/dashboard.controller.js`) — tidak ada parameter query.

**Response `200`**

```json
{
  "success": true,
  "message": "Ringkasan dashboard berhasil diambil.",
  "data": {
    "summary": {
      "totalLaporan": 42,
      "totalPeternak": 18,
      "totalTernak": 130,
      "ternakHidup": 120,
      "ternakMati": 10,
      "laporanTahunIni": 12,
      "laporanBulanIni": 2,
      "totalLaporanKelahiran": 30,
      "laporanKelahiranTahunIni": 9,
      "laporanKelahiranBulanIni": 1,
      "penyebabDominan": [
        { "id": "f1e2d3c4-...", "nama": "Penyakit", "jumlah": 15 }
      ],
      "trenPopulasi": [
        { "label": "Jul 2025", "lahir": 2, "mati": 1 },
        { "label": "Agu 2025", "lahir": 3, "mati": 0 }
      ],
      "laporanTerbaru": [
        {
          "id": "7e8f9a0b-...",
          "tanggalKematian": "2026-06-10",
          "ternak": { "kodeTernak": "SP-001", "peternak": {}, "jenisTernak": {} },
          "penyebabKematian": { "nama": "Penyakit" }
        }
      ]
    }
  }
}
```

| Field | Deskripsi |
|---|---|
| `ternakHidup` / `ternakMati` | Dihitung dari `Ternak.status`, bukan dari jumlah laporan |
| `penyebabDominan` | Top 5 penyebab kematian berdasarkan jumlah laporan (`groupBy`), sepanjang masa (tidak difilter tanggal) |
| `trenPopulasi` | 12 bulan terakhir (termasuk bulan berjalan), jumlah `lahir` vs `mati` per bulan — dipakai untuk chart tren di frontend (`features/dashboard/components/tren-chart.tsx`) |
| `laporanTerbaru` | 5 laporan kematian terbaru, urut `tanggalKematian desc` |

Untuk breakdown penyebab kematian dan populasi per wilayah dengan filter rentang tanggal, lihat [analisis.md](./analisis.md).

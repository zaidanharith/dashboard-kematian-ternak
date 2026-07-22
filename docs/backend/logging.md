# Logging (Backend)

## Kondisi saat ini: `console.error`, tanpa structured logging

Backend ini belum memakai library logging (Winston, Pino, dsb.) atau error tracker (Sentry). Setiap `catch` block di controller memanggil `console.error('<Nama Aksi> Error:', error)` sebelum membalas response `500`:

```javascript
} catch (error) {
  console.error('Get All Peternak Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan saat mengambil data peternak.',
    error: error.message,
  });
}
```

Pola nama log: `'<Aksi dalam Title Case> Error:'`, konsisten di seluruh controller (`Login Error:`, `Get All Ternak Error:`, `Create Laporan Kematian Error:`, dst.) — memudahkan grep log berdasarkan nama aksi.

## Yang tidak ada saat ini

- Tidak ada log level (info/warn/debug) — hanya error yang di-log secara eksplisit.
- Tidak ada request logging middleware (mis. `morgan`) di `app.js`.
- Tidak ada korelasi request ID / trace ID.
- Tidak ada log terstruktur (JSON) — semua lewat `console.error` string biasa, cocok untuk baca langsung di terminal dev tapi tidak ideal untuk agregasi log di production.

## Menambah logging terstruktur / error tracking

Kalau proyek berkembang butuh observability lebih (terutama untuk endpoint generate dokumen yang bergantung pada file template eksternal, atau untuk memantau kegagalan verifikasi Google OAuth di production), lihat skill `error-monitoring-conventions` untuk pola integrasi Sentry/structured logging yang konsisten dengan proyek Node/Express lain — belum diterapkan di sini, jadi tidak didokumentasikan sebagai konvensi yang sudah berjalan.

const { recordingFetch } = require('../lib/recording-client');

/**
 * Sinkronisasi Peternak -> Farmer di recording-ternak.
 * Best-effort: kegagalan di-log, tidak membatalkan perubahan lokal
 * (lihat catatan skala kecil di desain integrasi — belum ada retry queue).
 */
async function pushPeternakUpsert(peternak) {
  try {
    await recordingFetch(`/internal/farmers/${peternak.id}`, {
      method: 'PUT',
      body: {
        nama: peternak.nama,
        desa: peternak.desa,
        dusun: peternak.dusun,
        rt: peternak.rt,
        rw: peternak.rw,
        telepon: peternak.telepon,
      },
    });
  } catch (error) {
    console.error(`[recording-sync] Gagal sinkron peternak ${peternak.id} ke recording-ternak:`, error.message);
  }
}

async function pushPeternakDelete(id) {
  try {
    await recordingFetch(`/internal/farmers/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error(`[recording-sync] Gagal hapus peternak ${id} di recording-ternak:`, error.message);
  }
}

/**
 * recording-ternak cuma tahu soal kambing — laporan untuk ternak jenis lain tidak dikirim.
 */
function isKambing(ternak) {
  return ternak?.jenisTernak?.nama === 'Kambing';
}

async function pushLaporanKematianUpsert(laporan) {
  if (!isKambing(laporan.ternak)) return;
  try {
    await recordingFetch(`/internal/laporan-kematian/${laporan.id}`, {
      method: 'PUT',
      body: {
        kodeTernak: laporan.ternak.kodeTernak,
        jenisKelamin: laporan.ternak.jenisKelamin,
        rasRumpun: laporan.ternak.rasRumpun,
        tanggalLahir: laporan.ternak.tanggalLahir,
        peternakId: laporan.ternak.peternakId,
        penyebabKematianNama: laporan.penyebabKematian.nama,
        petugasId: laporan.petugasId,
        tanggalKematian: laporan.tanggalKematian,
        catatan: laporan.catatan,
        nomorBeritaAcara: laporan.nomorBeritaAcara,
      },
    });
  } catch (error) {
    console.error(`[recording-sync] Gagal sinkron laporan kematian ${laporan.id} ke recording-ternak:`, error.message);
  }
}

async function pushLaporanKematianDelete(id, ternak) {
  if (!isKambing(ternak)) return;
  try {
    await recordingFetch(`/internal/laporan-kematian/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error(`[recording-sync] Gagal hapus laporan kematian ${id} di recording-ternak:`, error.message);
  }
}

async function pushLaporanKelahiranUpsert(laporan) {
  if (!isKambing(laporan.ternak)) return;
  try {
    await recordingFetch(`/internal/laporan-kelahiran/${laporan.id}`, {
      method: 'PUT',
      body: {
        kodeTernak: laporan.ternak.kodeTernak,
        jenisKelamin: laporan.ternak.jenisKelamin,
        rasRumpun: laporan.ternak.rasRumpun,
        peternakId: laporan.ternak.peternakId,
        petugasId: laporan.petugasId,
        petugasNama: laporan.petugasNama,
        tanggalLahir: laporan.tanggalLahir,
        catatan: laporan.catatan,
        nomorAkta: laporan.nomorAkta,
      },
    });
  } catch (error) {
    console.error(`[recording-sync] Gagal sinkron laporan kelahiran ${laporan.id} ke recording-ternak:`, error.message);
  }
}

async function pushLaporanKelahiranDelete(id, ternak) {
  if (!isKambing(ternak)) return;
  try {
    await recordingFetch(`/internal/laporan-kelahiran/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error(`[recording-sync] Gagal hapus laporan kelahiran ${id} di recording-ternak:`, error.message);
  }
}

module.exports = {
  pushPeternakUpsert,
  pushPeternakDelete,
  pushLaporanKematianUpsert,
  pushLaporanKematianDelete,
  pushLaporanKelahiranUpsert,
  pushLaporanKelahiranDelete,
};

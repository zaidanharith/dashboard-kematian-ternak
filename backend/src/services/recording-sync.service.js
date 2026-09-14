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

module.exports = { pushPeternakUpsert, pushPeternakDelete };

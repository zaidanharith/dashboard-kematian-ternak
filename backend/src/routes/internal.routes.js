const express = require('express');
const router = express.Router();
const internalKeyMiddleware = require('../middlewares/internal-key.middleware');
const prisma = require('../database/connections/prisma_client');

router.use(internalKeyMiddleware);

/**
 * Menerima sinkronisasi Farmer dari recording-ternak.
 * id dipakai sebagai id Peternak juga, supaya row di kedua database berkorespondensi 1:1.
 * NIK tidak dikirim recording-ternak (tidak mengumpulkan NIK) — dibiarkan kosong/tetap.
 */
router.put('/peternak/:id', async (req, res) => {
  try {
    const { nama, desa, dusun, rt, rw, telepon } = req.body;

    if (!nama || !telepon) {
      return res.status(400).json({ success: false, message: 'nama dan telepon wajib diisi.' });
    }

    const peternak = await prisma.peternak.upsert({
      where: { id: req.params.id },
      create: {
        id: req.params.id,
        nama,
        desa: desa || 'Besuki',
        dusun: dusun || '-',
        rt: rt || '-',
        rw: rw || '-',
        telepon,
      },
      update: {
        ...(nama && { nama }),
        ...(desa && { desa }),
        ...(dusun && { dusun }),
        ...(rt && { rt }),
        ...(rw && { rw }),
        ...(telepon && { telepon }),
      },
    });

    return res.status(200).json({ success: true, data: { peternak } });
  } catch (error) {
    console.error('Internal Upsert Peternak Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal sinkronisasi peternak.', error: error.message });
  }
});

router.delete('/peternak/:id', async (req, res) => {
  try {
    await prisma.peternak.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(200).json({ success: true, message: 'Peternak sudah tidak ada.' });
    }
    console.error('Internal Delete Peternak Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus peternak.', error: error.message });
  }
});

module.exports = router;

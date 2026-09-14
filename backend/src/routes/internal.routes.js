const express = require('express');
const router = express.Router();
const internalKeyMiddleware = require('../middlewares/internal-key.middleware');
const prisma = require('../database/connections/prisma_client');

router.use(internalKeyMiddleware);

/**
 * Cari Ternak lewat kodeTernak (bukan id — recording-ternak tidak tahu id Ternak di sini,
 * cuma kodeTernak/ear tag). Kalau belum ada, buat baru dengan jenisTernak "Kambing", karena
 * push ini cuma pernah datang dari recording-ternak yang isinya kambing saja.
 */
async function findOrCreateTernakByKodeTernak(kodeTernak, { peternakId, jenisKelamin, rasRumpun, tanggalLahir }) {
  const existing = await prisma.ternak.findUnique({ where: { kodeTernak } });
  if (existing) {
    const patch = {};
    if (!existing.jenisKelamin && jenisKelamin) patch.jenisKelamin = jenisKelamin;
    if (!existing.rasRumpun && rasRumpun) patch.rasRumpun = rasRumpun;
    if (!existing.tanggalLahir && tanggalLahir) patch.tanggalLahir = new Date(tanggalLahir);
    if (Object.keys(patch).length === 0) return existing;
    return prisma.ternak.update({ where: { id: existing.id }, data: patch });
  }

  const jenisTernakKambing = await prisma.jenisTernak.findUnique({ where: { nama: 'Kambing' } });
  if (!jenisTernakKambing) {
    throw new Error('Jenis ternak "Kambing" belum ada di data referensi — jalankan seed terlebih dahulu.');
  }

  return prisma.ternak.create({
    data: {
      kodeTernak,
      jenisTernakId: jenisTernakKambing.id,
      peternakId,
      jenisKelamin,
      rasRumpun,
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
    },
  });
}

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

router.put('/laporan-kematian/:id', async (req, res) => {
  try {
    const { kodeTernak, jenisKelamin, rasRumpun, tanggalLahir, peternakId, penyebabKematianNama, petugasId, tanggalKematian, catatan, nomorBeritaAcara } =
      req.body;

    if (!kodeTernak || !peternakId || !penyebabKematianNama || !petugasId || !tanggalKematian) {
      return res.status(400).json({ success: false, message: 'Data laporan kematian tidak lengkap.' });
    }

    const ternak = await findOrCreateTernakByKodeTernak(kodeTernak, { peternakId, jenisKelamin, rasRumpun, tanggalLahir });

    const penyebabKematian = await prisma.penyebabKematian.upsert({
      where: { nama: penyebabKematianNama },
      update: {},
      create: { nama: penyebabKematianNama },
    });

    const [laporan] = await prisma.$transaction([
      prisma.laporanKematian.upsert({
        where: { id: req.params.id },
        create: {
          id: req.params.id,
          ternakId: ternak.id,
          penyebabKematianId: penyebabKematian.id,
          petugasId,
          tanggalKematian: new Date(tanggalKematian),
          catatan,
          nomorBeritaAcara,
        },
        update: {
          penyebabKematianId: penyebabKematian.id,
          tanggalKematian: new Date(tanggalKematian),
          catatan,
          nomorBeritaAcara,
        },
      }),
      prisma.ternak.update({ where: { id: ternak.id }, data: { status: 'MATI' } }),
    ]);

    return res.status(200).json({ success: true, data: { laporan } });
  } catch (error) {
    console.error('Internal Upsert Laporan Kematian Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal sinkronisasi laporan kematian.', error: error.message });
  }
});

router.delete('/laporan-kematian/:id', async (req, res) => {
  try {
    const laporan = await prisma.laporanKematian.findUnique({ where: { id: req.params.id } });
    if (!laporan) return res.status(200).json({ success: true, message: 'Laporan kematian sudah tidak ada.' });

    await prisma.$transaction([
      prisma.laporanKematian.delete({ where: { id: req.params.id } }),
      prisma.ternak.update({ where: { id: laporan.ternakId }, data: { status: 'HIDUP' } }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(200).json({ success: true, message: 'Laporan kematian sudah tidak ada.' });
    }
    console.error('Internal Delete Laporan Kematian Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus laporan kematian.', error: error.message });
  }
});

router.put('/laporan-kelahiran/:id', async (req, res) => {
  try {
    const { kodeTernak, jenisKelamin, rasRumpun, peternakId, petugasId, petugasNama, tanggalLahir, catatan, nomorAkta } = req.body;

    if (!kodeTernak || !peternakId || !petugasId || !petugasNama || !tanggalLahir) {
      return res.status(400).json({ success: false, message: 'Data laporan kelahiran tidak lengkap.' });
    }

    const ternak = await findOrCreateTernakByKodeTernak(kodeTernak, { peternakId, jenisKelamin, rasRumpun, tanggalLahir });

    const laporan = await prisma.laporanKelahiran.upsert({
      where: { id: req.params.id },
      create: {
        id: req.params.id,
        ternakId: ternak.id,
        petugasId,
        petugasNama,
        tanggalLahir: new Date(tanggalLahir),
        catatan,
        nomorAkta,
      },
      update: {
        petugasNama,
        tanggalLahir: new Date(tanggalLahir),
        catatan,
        nomorAkta,
      },
    });

    return res.status(200).json({ success: true, data: { laporan } });
  } catch (error) {
    console.error('Internal Upsert Laporan Kelahiran Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal sinkronisasi laporan kelahiran.', error: error.message });
  }
});

router.delete('/laporan-kelahiran/:id', async (req, res) => {
  try {
    await prisma.laporanKelahiran.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(200).json({ success: true, message: 'Laporan kelahiran sudah tidak ada.' });
    }
    console.error('Internal Delete Laporan Kelahiran Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus laporan kelahiran.', error: error.message });
  }
});

module.exports = router;

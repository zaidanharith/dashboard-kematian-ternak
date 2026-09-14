const prisma = require('../database/connections/prisma_client');
const recordingSyncService = require('../services/recording-sync.service');

exports.getAllPeternak = async (req, res) => {
  try {
    const search = req.query.search || '';

    const peternak = await prisma.peternak.findMany({
      where: search
        ? {
            OR: [
              { nama: { contains: search, mode: 'insensitive' } },
              { nik: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { ternak: true },
      orderBy: { nama: 'asc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Data peternak berhasil diambil.',
      data: { peternak },
    });
  } catch (error) {
    console.error('Get All Peternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data peternak.',
      error: error.message,
    });
  }
};

exports.getPeternakById = async (req, res) => {
  try {
    const { id } = req.params;

    const peternak = await prisma.peternak.findUnique({
      where: { id },
      include: { ternak: { include: { jenisTernak: true } } },
    });

    if (!peternak) {
      return res.status(404).json({
        success: false,
        message: 'Peternak tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data peternak berhasil diambil.',
      data: { peternak },
    });
  } catch (error) {
    console.error('Get Peternak By Id Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data peternak.',
      error: error.message,
    });
  }
};

exports.createPeternak = async (req, res) => {
  try {
    const { nama, nik, telepon, desa, dusun, rt, rw } = req.body;

    if (!nama || !telepon || !desa || !dusun || !rt || !rw) {
      return res.status(400).json({
        success: false,
        message: 'Nama, telepon, desa, dusun, RT, dan RW wajib diisi.',
      });
    }

    const peternak = await prisma.peternak.create({
      data: { nama, nik: nik || null, telepon, desa, dusun, rt, rw },
    });
    await recordingSyncService.pushPeternakUpsert(peternak);

    return res.status(201).json({
      success: true,
      message: 'Peternak berhasil ditambahkan.',
      data: { peternak },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'NIK sudah terdaftar untuk peternak lain.',
      });
    }

    console.error('Create Peternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan peternak.',
      error: error.message,
    });
  }
};

exports.updatePeternak = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, telepon, desa, dusun, rt, rw } = req.body;

    const peternak = await prisma.peternak.update({
      where: { id },
      data: { nama, nik, telepon, desa, dusun, rt, rw },
    });
    await recordingSyncService.pushPeternakUpsert(peternak);

    return res.status(200).json({
      success: true,
      message: 'Peternak berhasil diperbarui.',
      data: { peternak },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Peternak tidak ditemukan.',
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'NIK sudah terdaftar untuk peternak lain.',
      });
    }

    console.error('Update Peternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui peternak.',
      error: error.message,
    });
  }
};

exports.deletePeternak = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.peternak.delete({ where: { id } });
    await recordingSyncService.pushPeternakDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Peternak berhasil dihapus.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Peternak tidak ditemukan.',
      });
    }

    console.error('Delete Peternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus peternak.',
      error: error.message,
    });
  }
};

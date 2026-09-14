const prisma = require('../database/connections/prisma_client');

exports.getAllTernak = async (req, res) => {
  try {
    const { peternakId, status } = req.query;

    const ternak = await prisma.ternak.findMany({
      where: {
        peternakId: peternakId || undefined,
        status: status || undefined,
      },
      include: { peternak: true, jenisTernak: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Data ternak berhasil diambil.',
      data: { ternak },
    });
  } catch (error) {
    console.error('Get All Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data ternak.',
      error: error.message,
    });
  }
};

exports.getTernakById = async (req, res) => {
  try {
    const { id } = req.params;

    const ternak = await prisma.ternak.findUnique({
      where: { id },
      include: { peternak: true, jenisTernak: true, laporanKematian: true },
    });

    if (!ternak) {
      return res.status(404).json({
        success: false,
        message: 'Ternak tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data ternak berhasil diambil.',
      data: { ternak },
    });
  } catch (error) {
    console.error('Get Ternak By Id Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data ternak.',
      error: error.message,
    });
  }
};

exports.createTernak = async (req, res) => {
  try {
    const { kodeTernak, jenisTernakId, peternakId, jenisKelamin, rasRumpun, tanggalLahir } = req.body;

    if (!kodeTernak || !jenisTernakId || !peternakId || !jenisKelamin || !tanggalLahir) {
      return res.status(400).json({
        success: false,
        message: 'Kode ternak, jenis ternak, peternak, jenis kelamin, dan tanggal lahir wajib diisi.',
      });
    }

    if (!['JANTAN', 'BETINA'].includes(jenisKelamin)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin harus JANTAN atau BETINA.',
      });
    }

    const peternak = await prisma.peternak.findUnique({ where: { id: peternakId } });
    if (!peternak) {
      return res.status(400).json({
        success: false,
        message: 'Peternak tidak ditemukan.',
      });
    }

    const jenisTernak = await prisma.jenisTernak.findUnique({ where: { id: jenisTernakId } });
    if (!jenisTernak) {
      return res.status(400).json({
        success: false,
        message: 'Jenis ternak tidak ditemukan.',
      });
    }

    const ternak = await prisma.ternak.create({
      data: {
        kodeTernak,
        jenisTernakId,
        peternakId,
        jenisKelamin,
        rasRumpun,
        tanggalLahir: new Date(tanggalLahir),
      },
      include: { peternak: true, jenisTernak: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Ternak berhasil ditambahkan.',
      data: { ternak },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Kode ternak sudah digunakan.',
      });
    }

    console.error('Create Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan ternak.',
      error: error.message,
    });
  }
};

/**
 * Cari ternak berdasarkan kodeTernak; kalau belum ada, buat baru.
 * Dipakai recording-ternak saat generate berita acara kematian dari kambing yang
 * belum pernah tercatat sebagai Ternak di sini (recording-ternak tidak punya model Ternak sendiri).
 */
exports.provisionTernak = async (req, res) => {
  try {
    const { kodeTernak, jenisTernakNama, peternakId, jenisKelamin, rasRumpun, tanggalLahir } = req.body;

    if (!kodeTernak || !jenisTernakNama || !peternakId) {
      return res.status(400).json({
        success: false,
        message: 'kodeTernak, jenisTernakNama, dan peternakId wajib diisi.',
      });
    }

    const existing = await prisma.ternak.findUnique({
      where: { kodeTernak },
      include: { peternak: true, jenisTernak: true },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Ternak sudah terdaftar.',
        data: { ternak: existing },
      });
    }

    if (!jenisKelamin || !tanggalLahir) {
      return res.status(400).json({
        success: false,
        message: 'Ternak belum terdaftar — jenisKelamin dan tanggalLahir wajib diisi untuk mendaftarkan baru.',
      });
    }

    if (!['JANTAN', 'BETINA'].includes(jenisKelamin)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin harus JANTAN atau BETINA.',
      });
    }

    const peternak = await prisma.peternak.findUnique({ where: { id: peternakId } });
    if (!peternak) {
      return res.status(400).json({ success: false, message: 'Peternak tidak ditemukan.' });
    }

    const jenisTernak = await prisma.jenisTernak.findUnique({ where: { nama: jenisTernakNama } });
    if (!jenisTernak) {
      return res.status(400).json({ success: false, message: `Jenis ternak "${jenisTernakNama}" tidak ditemukan.` });
    }

    const ternak = await prisma.ternak.create({
      data: {
        kodeTernak,
        jenisTernakId: jenisTernak.id,
        peternakId,
        jenisKelamin,
        rasRumpun,
        tanggalLahir: new Date(tanggalLahir),
      },
      include: { peternak: true, jenisTernak: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Ternak berhasil didaftarkan.',
      data: { ternak },
    });
  } catch (error) {
    console.error('Provision Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftarkan ternak.',
      error: error.message,
    });
  }
};

exports.updateTernak = async (req, res) => {
  try {
    const { id } = req.params;
    const { kodeTernak, jenisTernakId, peternakId, jenisKelamin, rasRumpun, tanggalLahir } = req.body;

    if (jenisKelamin && !['JANTAN', 'BETINA'].includes(jenisKelamin)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin harus JANTAN atau BETINA.',
      });
    }

    const ternak = await prisma.ternak.update({
      where: { id },
      data: {
        kodeTernak,
        jenisTernakId,
        peternakId,
        jenisKelamin,
        rasRumpun,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
      },
      include: { peternak: true, jenisTernak: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Ternak berhasil diperbarui.',
      data: { ternak },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Ternak tidak ditemukan.',
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Kode ternak sudah digunakan.',
      });
    }

    console.error('Update Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui ternak.',
      error: error.message,
    });
  }
};

exports.deleteTernak = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ternak.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Ternak berhasil dihapus.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Ternak tidak ditemukan.',
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Ternak tidak dapat dihapus karena masih memiliki laporan kematian terkait.',
      });
    }

    console.error('Delete Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus ternak.',
      error: error.message,
    });
  }
};

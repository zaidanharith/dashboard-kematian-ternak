const prisma = require('../database/connections/prisma_client');
const { generateBeritaAcaraDocx, generateBeritaAcaraPdf } = require('../services/berita-acara.service');

const laporanInclude = {
  ternak: { include: { peternak: true, jenisTernak: true } },
  penyebabKematian: true,
};

exports.getAllLaporanKematian = async (req, res) => {
  try {
    const { penyebabKematianId, peternakId } = req.query;

    const laporanKematian = await prisma.laporanKematian.findMany({
      where: {
        penyebabKematianId: penyebabKematianId || undefined,
        ternak: peternakId ? { peternakId } : undefined,
      },
      include: laporanInclude,
      orderBy: { tanggalKematian: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Data laporan kematian berhasil diambil.',
      data: { laporanKematian },
    });
  } catch (error) {
    console.error('Get All Laporan Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data laporan kematian.',
      error: error.message,
    });
  }
};

exports.getLaporanKematianById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporanKematian.findUnique({
      where: { id },
      include: laporanInclude,
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan kematian tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data laporan kematian berhasil diambil.',
      data: { laporan },
    });
  } catch (error) {
    console.error('Get Laporan Kematian By Id Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data laporan kematian.',
      error: error.message,
    });
  }
};

exports.createLaporanKematian = async (req, res) => {
  try {
    const { ternakId, penyebabKematianId, tanggalKematian, catatan } = req.body;

    if (!ternakId || !penyebabKematianId || !tanggalKematian) {
      return res.status(400).json({
        success: false,
        message: 'Ternak, penyebab kematian, dan tanggal kematian wajib diisi.',
      });
    }

    const ternak = await prisma.ternak.findUnique({ where: { id: ternakId } });

    if (!ternak) {
      return res.status(400).json({
        success: false,
        message: 'Ternak tidak ditemukan.',
      });
    }

    if (ternak.status === 'MATI') {
      return res.status(400).json({
        success: false,
        message: 'Ternak ini sudah dilaporkan mati sebelumnya.',
      });
    }

    const penyebabKematian = await prisma.penyebabKematian.findUnique({
      where: { id: penyebabKematianId },
    });

    if (!penyebabKematian) {
      return res.status(400).json({
        success: false,
        message: 'Penyebab kematian tidak ditemukan.',
      });
    }

    const [laporan] = await prisma.$transaction([
      prisma.laporanKematian.create({
        data: {
          ternakId,
          penyebabKematianId,
          petugasId: req.user.id,
          tanggalKematian: new Date(tanggalKematian),
          catatan,
        },
        include: laporanInclude,
      }),
      prisma.ternak.update({
        where: { id: ternakId },
        data: { status: 'MATI' },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Laporan kematian berhasil dibuat.',
      data: { laporan },
    });
  } catch (error) {
    console.error('Create Laporan Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat laporan kematian.',
      error: error.message,
    });
  }
};

exports.updateLaporanKematian = async (req, res) => {
  try {
    const { id } = req.params;
    const { penyebabKematianId, tanggalKematian, catatan, nomorBeritaAcara } = req.body;

    const laporan = await prisma.laporanKematian.update({
      where: { id },
      data: {
        penyebabKematianId,
        tanggalKematian: tanggalKematian ? new Date(tanggalKematian) : undefined,
        catatan,
        nomorBeritaAcara,
      },
      include: laporanInclude,
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan kematian berhasil diperbarui.',
      data: { laporan },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Laporan kematian tidak ditemukan.',
      });
    }

    console.error('Update Laporan Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui laporan kematian.',
      error: error.message,
    });
  }
};

exports.getBeritaAcara = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporanKematian.findUnique({
      where: { id },
      include: laporanInclude,
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan kematian tidak ditemukan.',
      });
    }

    const format = req.query.format === 'pdf' ? 'pdf' : 'docx';

    if (format === 'pdf') {
      const buffer = await generateBeritaAcaraPdf(laporan);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="berita-acara-${laporan.ternak.kodeTernak}.pdf"`,
      );

      return res.send(buffer);
    }

    let buffer;
    try {
      buffer = generateBeritaAcaraDocx(laporan);
    } catch (templateError) {
      if (templateError.code === 'TEMPLATE_NOT_FOUND') {
        return res.status(500).json({
          success: false,
          message: 'Template berita acara belum tersedia di server.',
          error: templateError.message,
        });
      }

      throw templateError;
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="berita-acara-${laporan.ternak.kodeTernak}.docx"`,
    );

    return res.send(buffer);
  } catch (error) {
    console.error('Get Berita Acara Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat men-generate berita acara.',
      error: error.message,
    });
  }
};

exports.deleteLaporanKematian = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporanKematian.findUnique({ where: { id } });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan kematian tidak ditemukan.',
      });
    }

    await prisma.$transaction([
      prisma.laporanKematian.delete({ where: { id } }),
      prisma.ternak.update({
        where: { id: laporan.ternakId },
        data: { status: 'HIDUP' },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Laporan kematian berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete Laporan Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus laporan kematian.',
      error: error.message,
    });
  }
};

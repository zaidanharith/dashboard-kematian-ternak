const prisma = require('../database/connections/prisma_client');
const { generateAktaKelahiranDocx, generateAktaKelahiranPdf } = require('../services/akta-kelahiran.service');

const laporanInclude = {
  ternak: { include: { peternak: true, jenisTernak: true } },
  petugas: true,
};

exports.getAllLaporanKelahiran = async (req, res) => {
  try {
    const { peternakId } = req.query;

    const laporanKelahiran = await prisma.laporanKelahiran.findMany({
      where: {
        ternak: peternakId ? { peternakId } : undefined,
      },
      include: laporanInclude,
      orderBy: { tanggalLahir: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Data laporan kelahiran berhasil diambil.',
      data: { laporanKelahiran },
    });
  } catch (error) {
    console.error('Get All Laporan Kelahiran Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data laporan kelahiran.',
      error: error.message,
    });
  }
};

exports.getLaporanKelahiranById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporanKelahiran.findUnique({
      where: { id },
      include: laporanInclude,
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan kelahiran tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data laporan kelahiran berhasil diambil.',
      data: { laporan },
    });
  } catch (error) {
    console.error('Get Laporan Kelahiran By Id Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data laporan kelahiran.',
      error: error.message,
    });
  }
};

exports.createLaporanKelahiran = async (req, res) => {
  try {
    const { peternakId, jenisTernakId, kodeTernak, jenisKelamin, rasRumpun, tanggalLahir, catatan } = req.body;

    if (!peternakId || !jenisTernakId || !kodeTernak || !jenisKelamin || !tanggalLahir) {
      return res.status(400).json({
        success: false,
        message: 'Peternak, jenis ternak, kode ternak, jenis kelamin, dan tanggal lahir wajib diisi.',
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

    const laporan = await prisma.$transaction(async (tx) => {
      const ternak = await tx.ternak.create({
        data: {
          kodeTernak,
          jenisTernakId,
          peternakId,
          jenisKelamin,
          rasRumpun,
          tanggalLahir: new Date(tanggalLahir),
        },
      });

      return tx.laporanKelahiran.create({
        data: {
          ternakId: ternak.id,
          petugasId: req.user.id,
          tanggalLahir: new Date(tanggalLahir),
          catatan,
        },
        include: laporanInclude,
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Laporan kelahiran berhasil dibuat.',
      data: { laporan },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Kode ternak sudah digunakan.',
      });
    }

    console.error('Create Laporan Kelahiran Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat laporan kelahiran.',
      error: error.message,
    });
  }
};

exports.updateLaporanKelahiran = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan, tanggalLahir, nomorAkta } = req.body;

    const laporan = await prisma.$transaction(async (tx) => {
      const updated = await tx.laporanKelahiran.update({
        where: { id },
        data: {
          catatan,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
          nomorAkta,
        },
        include: laporanInclude,
      });

      if (tanggalLahir) {
        await tx.ternak.update({
          where: { id: updated.ternakId },
          data: { tanggalLahir: new Date(tanggalLahir) },
        });
      }

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan kelahiran berhasil diperbarui.',
      data: { laporan },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Laporan kelahiran tidak ditemukan.',
      });
    }

    console.error('Update Laporan Kelahiran Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui laporan kelahiran.',
      error: error.message,
    });
  }
};

exports.getAkta = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporanKelahiran.findUnique({
      where: { id },
      include: laporanInclude,
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan kelahiran tidak ditemukan.',
      });
    }

    const format = req.query.format === 'pdf' ? 'pdf' : 'docx';

    if (format === 'pdf') {
      const buffer = await generateAktaKelahiranPdf(laporan);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="akta-kelahiran-${laporan.ternak.kodeTernak}.pdf"`,
      );

      return res.send(buffer);
    }

    let buffer;
    try {
      buffer = generateAktaKelahiranDocx(laporan);
    } catch (templateError) {
      if (templateError.code === 'TEMPLATE_NOT_FOUND') {
        return res.status(500).json({
          success: false,
          message: 'Template akta kelahiran belum tersedia di server.',
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
      `attachment; filename="akta-kelahiran-${laporan.ternak.kodeTernak}.docx"`,
    );

    return res.send(buffer);
  } catch (error) {
    console.error('Get Akta Kelahiran Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat men-generate akta kelahiran.',
      error: error.message,
    });
  }
};

exports.deleteLaporanKelahiran = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporanKelahiran.findUnique({ where: { id } });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan kelahiran tidak ditemukan.',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.laporanKelahiran.delete({ where: { id } });
      await tx.ternak.delete({ where: { id: laporan.ternakId } });
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan kelahiran berhasil dihapus.',
    });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message:
          'Ternak tidak dapat dihapus karena sudah memiliki laporan kematian terkait. Hapus laporan kematiannya terlebih dahulu.',
      });
    }

    console.error('Delete Laporan Kelahiran Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus laporan kelahiran.',
      error: error.message,
    });
  }
};

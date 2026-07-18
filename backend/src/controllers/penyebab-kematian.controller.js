const prisma = require('../database/connections/prisma_client');

exports.getAllPenyebabKematian = async (req, res) => {
  try {
    const penyebabKematian = await prisma.penyebabKematian.findMany({ orderBy: { nama: 'asc' } });

    return res.status(200).json({
      success: true,
      message: 'Data penyebab kematian berhasil diambil.',
      data: { penyebabKematian },
    });
  } catch (error) {
    console.error('Get All Penyebab Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data penyebab kematian.',
      error: error.message,
    });
  }
};

exports.createPenyebabKematian = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama penyebab kematian wajib diisi.',
      });
    }

    const penyebabKematian = await prisma.penyebabKematian.create({ data: { nama } });

    return res.status(201).json({
      success: true,
      message: 'Penyebab kematian berhasil ditambahkan.',
      data: { penyebabKematian },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Penyebab kematian dengan nama tersebut sudah ada.',
      });
    }

    console.error('Create Penyebab Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan penyebab kematian.',
      error: error.message,
    });
  }
};

exports.updatePenyebabKematian = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama penyebab kematian wajib diisi.',
      });
    }

    const penyebabKematian = await prisma.penyebabKematian.update({
      where: { id },
      data: { nama },
    });

    return res.status(200).json({
      success: true,
      message: 'Penyebab kematian berhasil diperbarui.',
      data: { penyebabKematian },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Penyebab kematian tidak ditemukan.',
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Penyebab kematian dengan nama tersebut sudah ada.',
      });
    }

    console.error('Update Penyebab Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui penyebab kematian.',
      error: error.message,
    });
  }
};

exports.deletePenyebabKematian = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.penyebabKematian.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Penyebab kematian berhasil dihapus.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Penyebab kematian tidak ditemukan.',
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Penyebab kematian tidak dapat dihapus karena masih digunakan oleh laporan kematian.',
      });
    }

    console.error('Delete Penyebab Kematian Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus penyebab kematian.',
      error: error.message,
    });
  }
};

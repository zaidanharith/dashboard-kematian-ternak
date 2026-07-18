const prisma = require('../database/connections/prisma_client');

exports.getAllJenisTernak = async (req, res) => {
  try {
    const jenisTernak = await prisma.jenisTernak.findMany({ orderBy: { nama: 'asc' } });

    return res.status(200).json({
      success: true,
      message: 'Data jenis ternak berhasil diambil.',
      data: { jenisTernak },
    });
  } catch (error) {
    console.error('Get All Jenis Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data jenis ternak.',
      error: error.message,
    });
  }
};

exports.createJenisTernak = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama jenis ternak wajib diisi.',
      });
    }

    const jenisTernak = await prisma.jenisTernak.create({ data: { nama } });

    return res.status(201).json({
      success: true,
      message: 'Jenis ternak berhasil ditambahkan.',
      data: { jenisTernak },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Jenis ternak dengan nama tersebut sudah ada.',
      });
    }

    console.error('Create Jenis Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan jenis ternak.',
      error: error.message,
    });
  }
};

exports.updateJenisTernak = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama jenis ternak wajib diisi.',
      });
    }

    const jenisTernak = await prisma.jenisTernak.update({
      where: { id },
      data: { nama },
    });

    return res.status(200).json({
      success: true,
      message: 'Jenis ternak berhasil diperbarui.',
      data: { jenisTernak },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Jenis ternak tidak ditemukan.',
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Jenis ternak dengan nama tersebut sudah ada.',
      });
    }

    console.error('Update Jenis Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui jenis ternak.',
      error: error.message,
    });
  }
};

exports.deleteJenisTernak = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.jenisTernak.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Jenis ternak berhasil dihapus.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Jenis ternak tidak ditemukan.',
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Jenis ternak tidak dapat dihapus karena masih digunakan oleh data ternak.',
      });
    }

    console.error('Delete Jenis Ternak Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus jenis ternak.',
      error: error.message,
    });
  }
};

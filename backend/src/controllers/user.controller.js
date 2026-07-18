const bcrypt = require('bcryptjs');
const prisma = require('../database/connections/prisma_client');

const REGISTERABLE_ROLES = ['ADMIN', 'PETUGAS'];

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diambil.',
      data: {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pengguna.',
      error: error.message,
    });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, password, dan role wajib diisi.',
      });
    }

    if (!REGISTERABLE_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role hanya boleh ADMIN atau PETUGAS.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    return res.status(201).json({
      success: true,
      message: 'Akun berhasil didaftarkan.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    console.error('Register User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftarkan akun.',
      error: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diambil.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pengguna.',
      error: error.message,
    });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama wajib diisi.',
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Update Me Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui data pengguna.',
      error: error.message,
    });
  }
};

const { recordingFetch } = require('../lib/recording-client');

/**
 * Manajemen user di-proxy ke recording-ternak — tabel users sudah digabung ke sana
 * (endpoint /api/admins, role ADMIN/SUPERADMIN/VIEWER menggantikan ADMIN/SUPERADMIN/PETUGAS).
 */
const REGISTERABLE_ROLES = ['ADMIN', 'VIEWER'];

const toUser = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  avatarUrl: admin.avatarUrl,
  role: admin.role,
  createdAt: admin.createdAt,
});

const usernameFromEmail = (email) => email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await recordingFetch('/api/admins', { token: req.token });

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diambil.',
      data: { users: result.data.admins.map(toUser) },
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.payload?.message || 'Terjadi kesalahan saat mengambil data pengguna.',
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
        message: `Role hanya boleh ${REGISTERABLE_ROLES.join(' atau ')}.`,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter.',
      });
    }

    const result = await recordingFetch('/api/admins', {
      method: 'POST',
      token: req.token,
      body: { username: usernameFromEmail(email), email, password, name, role },
    });

    return res.status(201).json({
      success: true,
      message: 'Akun berhasil didaftarkan.',
      data: { user: toUser(result.data.admin) },
    });
  } catch (error) {
    console.error('Register User Error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.payload?.message || 'Terjadi kesalahan saat mendaftarkan akun.',
      error: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await recordingFetch('/api/auth/me', { token: req.token });

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diambil.',
      data: { user: toUser(result.data.admin) },
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.payload?.message || 'Terjadi kesalahan saat mengambil data pengguna.',
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

    const result = await recordingFetch('/api/auth/me', { method: 'PATCH', token: req.token, body: { name } });

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: { user: toUser(result.data.admin) },
    });
  } catch (error) {
    console.error('Update Me Error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.payload?.message || 'Terjadi kesalahan saat memperbarui data pengguna.',
      error: error.message,
    });
  }
};

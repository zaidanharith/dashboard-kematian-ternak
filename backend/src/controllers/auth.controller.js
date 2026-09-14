const { recordingFetch } = require('../lib/recording-client');

/**
 * Auth di-proxy ke recording-ternak — tabel users sudah digabung ke sana (model Admin).
 * JWT yang dikembalikan ditandatangani recording-ternak dengan JWT_SECRET yang sama
 * dengan punya dashboard ini, jadi middleware auth lokal tetap bisa verifikasi tanpa call API lagi.
 */
const toUser = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  avatarUrl: admin.avatarUrl,
  role: admin.role,
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    const result = await recordingFetch('/api/auth/login', { method: 'POST', body: { email, password } });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: { token: result.data.token, user: toUser(result.data.admin) },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.payload?.message || 'Terjadi kesalahan sistem saat memproses login.',
      error: error.message,
    });
  }
};

exports.googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID Token wajib dikirimkan.',
      });
    }

    const result = await recordingFetch('/api/auth/google', { method: 'POST', body: { idToken } });

    return res.status(200).json({
      success: true,
      message: 'Autentikasi Google berhasil.',
      data: { token: result.data.token, user: toUser(result.data.admin) },
    });
  } catch (error) {
    console.error('Google Sign In Error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.payload?.message || 'Terjadi kesalahan sistem saat memproses login Google.',
      error: error.message,
    });
  }
};

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../database/connections/prisma_client');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token: sessionToken,
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
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses login.',
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

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        message: 'Google ID Token tidak valid atau kedaluwarsa.',
        error: verifyError.message,
      });
    }

    const {
      sub: googleId,
      name,
      email,
      picture: avatarUrl,
      email_verified: emailVerified,
    } = payload;

    if (!email || emailVerified === false) {
      return res.status(400).json({
        success: false,
        message: 'Akun Google Anda tidak menyediakan alamat email yang terverifikasi.',
      });
    }

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      const existingUserByEmail = await prisma.user.findUnique({ where: { email } });

      if (existingUserByEmail) {
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            googleId,
            name: existingUserByEmail.name || name,
            avatarUrl: existingUserByEmail.avatarUrl || avatarUrl,
          },
        });
      } else {
        user = await prisma.user.create({
          data: { googleId, name, email, avatarUrl },
        });
      }
    }

    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.status(200).json({
      success: true,
      message: 'Autentikasi Google berhasil.',
      data: {
        token: sessionToken,
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
    console.error('Google Sign In Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses login Google.',
      error: error.message,
    });
  }
};

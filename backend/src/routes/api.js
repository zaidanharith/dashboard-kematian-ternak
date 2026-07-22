const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const peternakRoutes = require('./peternak.routes');
const ternakRoutes = require('./ternak.routes');
const jenisTernakRoutes = require('./jenis-ternak.routes');
const penyebabKematianRoutes = require('./penyebab-kematian.routes');
const laporanKematianRoutes = require('./laporan-kematian.routes');
const laporanKelahiranRoutes = require('./laporan-kelahiran.routes');
const dashboardRoutes = require('./dashboard.routes');
const analisisRoutes = require('./analisis.routes');

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard Kematian Ternak API',
    data: {
      routes: [
        'POST /api/auth/google',
        'POST /api/auth/login',
        'GET /api/users/me',
        'PATCH /api/users/me',
        'GET /api/users (SUPERADMIN only)',
        'POST /api/users (SUPERADMIN only, mendaftarkan ADMIN/PETUGAS)',
        'GET /api/peternak',
        'GET /api/peternak/:id',
        'POST /api/peternak',
        'PATCH /api/peternak/:id',
        'DELETE /api/peternak/:id',
        'GET /api/ternak',
        'GET /api/ternak/:id',
        'POST /api/ternak',
        'PATCH /api/ternak/:id',
        'DELETE /api/ternak/:id',
        'GET /api/jenis-ternak',
        'POST /api/jenis-ternak',
        'PATCH /api/jenis-ternak/:id',
        'DELETE /api/jenis-ternak/:id',
        'GET /api/penyebab-kematian',
        'POST /api/penyebab-kematian',
        'PATCH /api/penyebab-kematian/:id',
        'DELETE /api/penyebab-kematian/:id',
        'GET /api/laporan-kematian',
        'GET /api/laporan-kematian/:id',
        'GET /api/laporan-kematian/:id/berita-acara (?format=docx|pdf)',
        'POST /api/laporan-kematian',
        'PATCH /api/laporan-kematian/:id',
        'DELETE /api/laporan-kematian/:id',
        'GET /api/laporan-kelahiran',
        'GET /api/laporan-kelahiran/:id',
        'GET /api/laporan-kelahiran/:id/akta (?format=docx|pdf)',
        'POST /api/laporan-kelahiran',
        'PATCH /api/laporan-kelahiran/:id',
        'DELETE /api/laporan-kelahiran/:id',
        'GET /api/dashboard/summary',
        'GET /api/analisis/penyebab-kematian (?startDate&endDate)',
        'GET /api/analisis/populasi (?level=dusun|rt|rw&startDate&endDate)',
      ],
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/peternak', peternakRoutes);
router.use('/ternak', ternakRoutes);
router.use('/jenis-ternak', jenisTernakRoutes);
router.use('/penyebab-kematian', penyebabKematianRoutes);
router.use('/laporan-kematian', laporanKematianRoutes);
router.use('/laporan-kelahiran', laporanKelahiranRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analisis', analisisRoutes);

module.exports = router;

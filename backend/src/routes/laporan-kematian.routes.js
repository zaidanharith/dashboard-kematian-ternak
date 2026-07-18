const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const laporanKematianController = require('../controllers/laporan-kematian.controller');

router.get('/', authMiddleware, laporanKematianController.getAllLaporanKematian);
router.get('/:id', authMiddleware, laporanKematianController.getLaporanKematianById);
router.get('/:id/berita-acara', authMiddleware, laporanKematianController.getBeritaAcara);
router.post('/', authMiddleware, laporanKematianController.createLaporanKematian);
router.patch('/:id', authMiddleware, laporanKematianController.updateLaporanKematian);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), laporanKematianController.deleteLaporanKematian);

module.exports = router;

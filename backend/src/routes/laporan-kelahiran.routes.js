const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const laporanKelahiranController = require('../controllers/laporan-kelahiran.controller');

router.get('/', authMiddleware, laporanKelahiranController.getAllLaporanKelahiran);
router.get('/:id', authMiddleware, laporanKelahiranController.getLaporanKelahiranById);
router.get('/:id/akta', authMiddleware, laporanKelahiranController.getAkta);
router.post('/', authMiddleware, laporanKelahiranController.createLaporanKelahiran);
router.patch('/:id', authMiddleware, laporanKelahiranController.updateLaporanKelahiran);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), laporanKelahiranController.deleteLaporanKelahiran);

module.exports = router;

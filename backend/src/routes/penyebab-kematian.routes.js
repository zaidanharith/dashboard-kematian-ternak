const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const penyebabKematianController = require('../controllers/penyebab-kematian.controller');

router.get('/', authMiddleware, penyebabKematianController.getAllPenyebabKematian);
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), penyebabKematianController.createPenyebabKematian);
router.patch('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), penyebabKematianController.updatePenyebabKematian);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), penyebabKematianController.deletePenyebabKematian);

module.exports = router;

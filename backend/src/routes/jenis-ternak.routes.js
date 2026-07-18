const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const jenisTernakController = require('../controllers/jenis-ternak.controller');

router.get('/', authMiddleware, jenisTernakController.getAllJenisTernak);
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), jenisTernakController.createJenisTernak);
router.patch('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), jenisTernakController.updateJenisTernak);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPERADMIN'), jenisTernakController.deleteJenisTernak);

module.exports = router;

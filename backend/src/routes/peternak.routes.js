const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const peternakController = require('../controllers/peternak.controller');

router.get('/', authMiddleware, peternakController.getAllPeternak);
router.get('/:id', authMiddleware, peternakController.getPeternakById);
router.post('/', authMiddleware, peternakController.createPeternak);
router.patch('/:id', authMiddleware, peternakController.updatePeternak);
router.delete('/:id', authMiddleware, peternakController.deletePeternak);

module.exports = router;

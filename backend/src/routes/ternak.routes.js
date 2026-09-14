const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const ternakController = require('../controllers/ternak.controller');

router.get('/', authMiddleware, ternakController.getAllTernak);
router.post('/provision', authMiddleware, ternakController.provisionTernak);
router.get('/:id', authMiddleware, ternakController.getTernakById);
router.post('/', authMiddleware, ternakController.createTernak);
router.patch('/:id', authMiddleware, ternakController.updateTernak);
router.delete('/:id', authMiddleware, ternakController.deleteTernak);

module.exports = router;

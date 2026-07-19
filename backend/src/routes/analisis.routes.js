const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const analisisController = require('../controllers/analisis.controller');

router.get('/penyebab-kematian', authMiddleware, analisisController.getAnalisisPenyebabKematian);

module.exports = router;

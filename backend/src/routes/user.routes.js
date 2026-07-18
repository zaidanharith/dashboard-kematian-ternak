const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const userController = require('../controllers/user.controller');

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, userController.updateMe);
router.get('/', authMiddleware, roleMiddleware('SUPERADMIN'), userController.getAllUsers);
router.post('/', authMiddleware, roleMiddleware('SUPERADMIN'), userController.registerUser);

module.exports = router;

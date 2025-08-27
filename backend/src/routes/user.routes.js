const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.post('/list', authorize(['admin']), userController.list);

module.exports = router;


